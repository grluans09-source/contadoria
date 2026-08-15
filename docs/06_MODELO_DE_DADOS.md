# 06 · Modelo de dados — como o Contadoria guarda as coisas

> **11/ago/2026, em Opus.** O último documento antes do código. Resolve os três buracos
> abertos no `SESSION_STATE`, os campos que o `05` exige, e as três decisões caras
> levantadas em `01` §4.
>
> **Isto é desenho, não SQL final.** O SQL nasce na implementação, a partir daqui.

---

## 1. O formato de um lançamento — cabeçalho + linhas

**A decisão mais cara de desfazer** (`01` §4.1). O ContLife tem partida binária: um débito,
um crédito, um valor. Aqui não serve.

```
lancamentos          (o fato)
  id · negocio_id · data · data_competencia · descricao
  origem · documento · criado_em · criado_por

lancamento_linhas    (as pernas do fato)
  id · lancamento_id · conta_id · tipo (D|C) · valor
```

**A trava:** um gatilho no banco, adiado para o fim da transação, exige
`soma dos débitos = soma dos créditos` em todo lançamento. Adiado é essencial — durante a
gravação o lançamento passa por estados desequilibrados; só o **resultado** precisa fechar.

> ⚠️ **Três armadilhas desta trava, para não descobrir com dor** (achadas na revisão de
> 11/ago, antes de escrever a primeira linha):
>
> 1. **Lançamento apagado.** Ao excluir, o cabeçalho e as linhas somem no mesmo lote. O
>    gatilho precisa **ignorar lançamento que não existe mais** — senão a exclusão falha
>    acusando desequilíbrio de algo que já não está lá.
> 2. **Ele dispara dos dois lados.** Mexer só no cabeçalho não desequilibra nada, mas mexer
>    numa linha sim. O gatilho vive em `lancamento_linhas`, e precisa cobrir inserção,
>    alteração **e** exclusão — inclusive o caso de sobrar zero linha.
> 3. **`on delete cascade` de `lancamentos` para `lancamento_linhas`** é obrigatório: sem
>    ele, apagar um cabeçalho deixaria linhas órfãs, que é exatamente o tipo de furo que
>    esta trava existe para impedir.

Isso transforma em regra do banco o que hoje é só um teste do app. **Não existe lançamento
torto no Contadoria** — não porque a tela impede, mas porque o banco recusa.

**Por que importa na prática:** a venda com baixa de estoque tem 4 pernas num fato só. E o
**balanço de abertura** (§4) tem uma perna por conta que o cliente possui — dez, quinze
linhas num lançamento só. No formato binário, isso viraria oito lançamentos soltos que
nada mantém juntos.

**`origem`** classifica de onde veio, e serve para a trilha e para o fechamento:
`manual` · `extrato` · `recorrente` · `abertura` · `encerramento_mes` · `encerramento_ano`.

---

## 2. Quem pode ver o quê — negócios e membros

**A segunda decisão cara** (`01` §4.2). O ContLife usa `dossiers.owner_id`: um dono, N
dossiês. Cobre o Luan com vários clientes, mas não cobre o cliente entrando na v2.

```
negocios
  id · nome · apelido · tipo (mei|informal) · cnpj
  data_abertura · atividade · tem_funcionario
  whatsapp · situacao (ativo|encerrado)
  inicio_do_servico          ← a data do balanço de abertura
  arquetipo                  ← o que o negócio FAZ (§7)
  dinheiro_misturado         ← boolean, default false
  retrato_de_entrada (jsonb) ← linha de base, write-once (§9-ter)
  configuracao (jsonb)

membros
  negocio_id · user_id · papel (contador|cliente) · criado_em
```

**`arquetipo`** (13/ago) decide plano de contas, campos de abertura e roteiro — ver §7.
Escolhido no cadastro do negócio, antes de o Roteiro do Cliente Novo começar.

**`dinheiro_misturado`** (13/ago) é coluna própria, não uma chave dentro de `configuracao`,
porque **muda comportamento**: quando `true`, gasto pessoal vira lançamento de retirada em
vez de sumir (`DECISOES.md` C5). Precisa ser consultável e tipada, não só guardada.

**`retrato_de_entrada`** (14/ago) é a linha de base do cliente — ver §9-ter.

Toda tabela de dado carrega `negocio_id`, e a política de acesso é uma só, replicada:

```
negocio_id in (select negocio_id from membros where user_id = auth.uid())
```

Hoje há **uma linha** em `membros` por negócio: ele, como `contador`. O custo de já nascer
assim é uma tabela e uma linha por política. O custo de fazer depois é trocar a fechadura de
todas as portas ao mesmo tempo, com a casa cheia.

**Escrita restrita ao papel:** só `contador` grava. Quando o portal do cliente existir
(v2), `cliente` entra somente com leitura — e isso já fica preparado na política, não
inventado depois.

---

## 3. Regime — a pergunta se dissolve quando a escrituração é feita direito

O buraco nº 1 do `SESSION_STATE` perguntava: caixa ou competência? **A resposta é que não é
uma escolha — é consequência.**

Uma venda a prazo são **dois fatos**, não um:

```
1) A venda            D  Clientes            C  Receita de serviços
2) O recebimento      D  Banco               C  Clientes
```

Com isso no lugar:

- **Visão de competência** = olhar as contas de **resultado** (Receita, Despesa)
- **Visão de caixa** = olhar as contas de **Caixa e Banco**

Os dois números saem do mesmo livro, sem campo de configuração, sem regime global, **e nunca
se contradizem** — porque são perguntas diferentes sobre o mesmo dado.

> ⚠️ Isto corrige uma armadilha real do ContLife: lá, `settings.regime` era um seletor global
> que só a DRE lia. Com ele ligado, a DRE mostrava um resultado e os indicadores mostravam
> outro, para o mesmo mês, sem explicação. Demonstrações preparadas em bases diferentes
> dentro do mesmo conjunto não são detalhe de tela — é inconsistência contábil. **Aqui não
> existe esse seletor.**

**O `data_competencia` continua existindo**, para o caso legítimo: a conta de energia de
julho paga em agosto, lançada de uma vez. Nasce igual a `data` e só difere quando alguém
mudar de propósito.

**Para o relatório obrigatório do MEI**, que é do que **entrou** no mês: sai do movimento de
Caixa/Banco contra as contas de receita. Sem ambiguidade.

---

## 4. Saldos iniciais — o balanço de abertura

O buraco nº 2. **Todo cliente chega no meio da vida.**

É **um lançamento** com `origem = 'abertura'`, datado do dia anterior ao início do serviço,
com uma linha por coisa que o cliente tem ou deve:

```
D  Caixa ...................... 350,00
D  Banco .................... 1.240,00
D  Equipamentos ............. 9.300,00
D  Clientes a receber ......... 420,00
C  Fornecedores ............... 800,00
C  Empréstimos .............. 3.000,00
C  Capital do titular ....... 7.510,00   ← o que sobra é dele (a diferença)
```

**A última linha é calculada, não perguntada.** O cliente não sabe qual é o patrimônio
líquido dele — é justamente isso que você vai contar pra ele. E é a linha que faz o
lançamento fechar.

Sem essa peça, o livro nasce desequilibrado e a Mesa de Revisão acusa erro para sempre — e
ninguém entenderia por quê. **É a prova mais clara de que o lançamento de N linhas era
necessário:** no formato binário, isso não existe.

---

## 5. Virada de ano

O buraco nº 3. O ContLife fecha **mês**; aqui também é preciso fechar **ano**.

```
periodos_fechados
  negocio_id · tipo (mes|ano) · periodo ("2026-07" | "2026") · fechado_em
```

**Fechamento de mês:** carimba o período. Depois disso nada muda em silêncio.

**Fechamento de ano:** um lançamento `origem = 'encerramento_ano'` que zera as contas de
resultado contra o patrimônio líquido. A partir de 1º de janeiro o cliente recomeça do zero
em receita e despesa, com o patrimônio acumulado — que é exatamente o que a virada de ano
significa em contabilidade.

**O limite de faturamento não precisa "zerar":** ele é somado a partir dos lançamentos do
ano corrente. Filtrar por ano basta — e evita um contador guardado que pode divergir do
livro.

⚠️ **A proporcionalidade do primeiro ano** (`05` §4) sai de `negocios.data_abertura`: quem
abriu em julho tem teto proporcional aos meses de existência.

---

## 6. Parâmetros fiscais — com vigência, nunca no código

```
parametros_fiscais
  ano · chave · valor · fonte · conferido_em
```

Exemplo do que mora aqui: limite anual do MEI, regra de proporcionalidade, valor e
composição do DAS por tipo de atividade, prazos.

**`fonte` e `conferido_em` não são enfeite.** Daqui a dois anos, ninguém vai lembrar de onde
saiu um número — e número fiscal sem procedência é passivo, não dado.

⚠️ Nenhum valor fiscal em código. Lei muda sem avisar.

---

## 7. O plano de contas — o BASE + o que cada arquétipo acrescenta

**Substitui a decisão original de um plano único de comércio (13/ago).** Um plano só de
comércio dava "Estoque" ao eletricista e não dava "Material aplicado"; quem vende online não
tinha "Taxa de plataforma"; quem manda mercadoria para terceiro beneficiar não tinha onde
registrar o que está fora da mão dele (`DECISOES.md` C7).

**A solução não é um plano por cliente escrito na mão — é BASE + ARQUÉTIPO.** Todo negócio
usa o mesmo módulo de contas comuns (`src/dominio/planoContas.mjs`, função `planoBase()`);
o **arquétipo** que o cliente declarou no cadastro (`negocios.arquetipo`) acrescenta as suas
por cima (`src/dominio/arquetipos.mjs`, função `planoDeFabrica(arquetipo)`). O cliente pode
depois adicionar ou desativar contas na tela Plano de Contas — a fábrica só dá o ponto de
partida certo.

### 7.1 O que todo negócio tem — `planoBase()`

| Grupo | Contas |
|---|---|
| **1 Ativo** | Caixa · Banco · A receber de maquininha · Clientes · Equipamentos · Veículos · Depreciação acumulada |
| **2 Passivo** | Fornecedores · DAS a pagar · Empréstimos · Salários a pagar |
| **3 Patrimônio** | Capital do titular · **Retiradas do titular** · Lucros acumulados |
| **4 Receitas** | Outras receitas *(a receita PRINCIPAL não está aqui — ver 7.3, escolha 4)* |
| **5 Despesas** | Aluguel · Energia · Água · Internet e telefone · **Taxa de maquininha** · Combustível · Material de consumo · Marketing · DAS · Depreciação · Tarifas bancárias · Outras |

Repare que **Estoque e CMV não estão no base** — só entram para quem de fato compra ou
produz mercadoria (revenda, produção, beneficiamento). Colocar no base obrigaria todo mundo
a carregar contas que não usa.

### 7.2 O que cada arquétipo acrescenta

Os **8 arquétipos** (`ARQUETIPOS` em `arquetipos.mjs`) declaram `contasExtras` — o que só
aquele tipo de negócio precisa:

| Arquétipo | Contas que só ele ganha |
|---|---|
| **Revenda** | Estoque de mercadorias · Venda de mercadorias · CMV · Frete sobre compras |
| **Produção própria** | Estoque de insumos · Produto pronto · Venda de produção própria · Insumos e matéria-prima · Embalagem · Perda e quebra |
| **Serviço com mão de obra** | Prestação de serviços · Material cobrado do cliente · Material aplicado em serviço · Ferramentas e manutenção · Deslocamento · Ajudante/diária de terceiro |
| **Serviço recorrente** | Mensalidades · Serviços avulsos |
| **Digital / online** | Saldo em plataforma · Vendas online · Assinaturas · Taxa de plataforma · Anúncios e tráfego pago · Ferramentas e assinaturas de software |
| **Beneficiamento** | Estoque de mercadorias · **Mercadoria com terceiros** · Venda de mercadorias · CMV · Serviço de terceiros · Perda no beneficiamento |
| **Intermediação / comissão** | Valores recebidos a repassar · Repasses a pagar · Comissões recebidas |
| **Locação** | Equipamentos para locação · Aluguéis recebidos · Manutenção de equipamentos · Seguro |

Duas contas merecem nota: **"Mercadoria com terceiros"** (beneficiamento) existe porque, sem
ela, o valor do que saiu da mão do cliente mas ainda é dele some do balanço justamente no
período de maior risco. E **"Valores a repassar" / "Repasses a pagar"** (intermediação) existe
para impedir o erro mais caro do arquétipo: o dinheiro que ele recebe e vai repassar **não é
receita dele** — é obrigação com terceiro. Lançar o bruto como receita infla o faturamento e
pode disparar alarme falso do teto do MEI.

### 7.3 Quatro escolhas que não são arbitrárias

1. **A receita principal não está no base — cada arquétipo nomeia a sua** (venda de
   mercadorias, prestação de serviços, comissões, aluguéis…). É o que impede o eletricista de
   lançar o próprio trabalho como "venda de mercadorias" só porque era a única opção da lista
   — e, para quem vende mercadoria E serviço no mesmo relatório mensal do MEI, é o que separa
   as duas colunas que a obrigação exige.
2. **Retiradas do titular é conta de PATRIMÔNIO, não de despesa.** É o erro conceitual nº 1
   de dono de negócio pequeno — "eu me pago, então é custo". Não é: é distribuição do
   resultado. Se entrasse como despesa, o lucro do negócio apareceria menor do que é e toda
   a conversa de "empresa × pessoa" ficaria errada. **É também a conta que responde "quanto
   você já tirou este ano"** — e a que sustenta o tratamento honesto do dinheiro misturado
   (`10_MANUAL_DE_OPERACAO.md`, capítulo do dinheiro misturado).
3. **A receber de maquininha é conta separada de Banco** — a venda acontece hoje, o dinheiro
   cai em dias. Sem essa conta, o caixa parece ter dinheiro que ainda não chegou.
4. **Taxa de maquininha tem conta própria** — é a despesa invisível que come margem em
   silêncio (`05` §4). Separada, ela aparece; misturada em "outras", nunca.

**Numeração com folga, de propósito:** o base deixa faixas livres (1120+ para estoques,
5120+ para custos, 5130+ para serviço, 5140+ para digital) — assim o arquétipo acrescenta
conta sem renumerar nada e sem colidir com o próximo arquétipo que vier a existir.

---

## 8. Caixa de Entrada e o aprendizado da classificação

```
entrada_itens
  id · negocio_id · origem (extrato|planilha|foto|texto)
  data · descricao_bruta · valor
  situacao (pendente|classificado|pessoal|duvida)
  lancamento_id          ← preenchido quando vira lançamento
  criado_em

regras_classificacao
  id · negocio_id · padrao · conta_id · acertos · atualizado_em
```

`regras_classificacao` **é o aprendizado** (`04` §5): "POSTO IPIRANGA" → Combustível. Sobe um
acerto a cada confirmação, e a sugestão de maior confiança vem preenchida.

**Por cliente, não global** — "MERCADO" pode ser compra de insumo num cliente e despesa
pessoal em outro. Regra global erraria nos dois.

**`situacao = 'pessoal'`** é registro, não descarte: o item continua existindo, marcado. Se
depois se descobrir que era da empresa, está lá. Item que some não pode ser reconferido.

---

## 9. O Roteiro no banco

```
roteiro_perguntas
  id · bloco · ordem · pergunta · porque_importa
  tipo_resposta · destino · ativo
  tipos (text[])       ← para quais tipos de negócio vale. NULL = todos
  arquetipos (text[])  ← para quais arquétipos vale. NULL = todos
  essencial (boolean)  ← true = 1ª conversa; false = aprofundamento, meses seguintes

roteiro_respostas
  negocio_id · pergunta_id · resposta · respondido_em
```

`destino` é o que faz a resposta virar registro em vez de anotação: para onde ela vai
(campo do negócio, conta do balanço de abertura, recorrente, ou linha do retrato de entrada
— `retrato.*`, ver §9-ter).

**`tipos` e `arquetipos` são o roteiro adaptativo** (13/14-ago, `DECISOES.md` C7/C8/E3):
a mesma tabela serve roteiros diferentes por cliente. `NULL` num dos dois significa "vale
para todos" — é o caso comum, então o default precisa ser "aparece", não "some". Filtragem
em `src/dominio/roteiro.mjs`, usada tanto pela entrevista presencial quanto pelo Formulário
Público (§9-bis), para as duas nunca divergirem.

**`essencial` separa a primeira conversa do aprofundamento** (`DECISOES.md` E3): entrevista
longa faz cliente desistir antes de fechar. `false` fica para os meses seguintes, respondida
na aba Roteiro do Livro (`src/telas/Roteiro.jsx`, `DECISOES.md` F9), que também alimenta o
aviso de pendências nas Entregas antes da conversa do mês.

⚠️ **`destino` é contrato, texto é editável** (achado ao construir o retrato de entrada,
migração `0015`): a primeira versão localizava perguntas por fragmento do texto da pergunta.
Como o texto é editável de propósito (é o ponto do roteiro aprender, `05` §1), reescrever uma
pergunta faria a captura falhar em silêncio. `destino = 'retrato.*'` resolve: **o texto é
dele, o destino é do sistema.**

**Perguntas editáveis é o ponto** (`05` §1): o roteiro aprende com o ofício dele. Depois de
10 clientes, é dele, não meu.

`roteiro_respostas` guarda **o que foi dito**, mesmo quando já virou registro. Daqui a um ano
vai importar saber o que o cliente respondeu na abertura — inclusive quando ele responder
diferente.

---

## 9-bis. Formulário Público — a única porta sem login

**Por que existe (14/ago, `DECISOES.md` E4):** a entrevista de cliente novo exigia estar
junto, e horário de dono de negócio pequeno raramente bate com horário de estudante. Com um
link, o cliente responde no tempo dele, do celular — e o mesmo mecanismo abre caminho para
coleta mensal e para o Diagnóstico Gratuito escalável (`11_GO_TO_MARKET.md` §5).

```
formularios
  id · negocio_id · token (uuid) · tipo (onboarding|mes)
  criado_em · expira_em (padrão +30 dias) · revogado
  aberto_em · concluido_em
```

**Esta é a primeira superfície do sistema que roda sem `authenticated`.** Todo o resto exige
login — nenhum grant vai para `anon` (§2). Aqui a porta é estreita e vigiada:

1. O `anon` **não ganha acesso a tabela nenhuma**. Só a três funções `security definer`:
   `formulario_abrir`, `formulario_responder`, `formulario_concluir` — a única forma de
   entrar sem login em todo o sistema.
2. O **token** é um UUID aleatório na URL; vale para um negócio e um propósito. Token
   inexistente, revogado ou vencido devolvem a mesma resposta — não entrega ao curioso que
   o token um dia existiu.
3. O cliente só **escreve** resposta de roteiro em `roteiro_respostas`, e só para pergunta
   que existe, está ativa e está entre os Blocos 1 e 5 — não lê o livro, não vê saldo, não
   alcança outro negócio. `formulario_abrir` devolve só o apelido do negócio e as perguntas.
4. Resposta acima de 4000 caracteres é recusada.

**Testado com a chave `anon` (14/ago):** 401 em todas as tabelas; as três falhas (token
inválido, revogado, vencido) respondem igual; pergunta fora dos Blocos 1-5 e `pergunta_id`
inventado, recusados.

---

## 9-ter. Retrato de entrada — a linha de base do cliente

**Por que é urgente (14/ago, `docs/09_PRINCIPIOS_DE_VALOR.md` P6):** transformação exige um
antes. Se a foto de como o cliente chegou não for tirada no onboarding, ela não é recuperável
depois — os lançamentos vão sendo corrigidos, o balanço evolui, e em seis meses ninguém
reconstrói o que ele **acreditava** no dia 1.

`negocios.retrato_de_entrada` (jsonb) guarda dois lados, montados por
`src/dominio/linhaDeBase.mjs`:

- **`declarado`** — o que ele respondeu no roteiro: faturamento, retirada, horas por semana,
  se acha que ganha dinheiro, o que incomoda, a meta
- **`medido`** — o que o balanço de abertura mostrou: caixa e banco, a receber, dívidas do
  negócio, patrimônio líquido

**Write-once, travado por gatilho no banco** (migração `0014`), não só na tela: se a trava
vivesse só no app, qualquer caminho novo — importação, correção, script — poderia
sobrescrever, e deixaria de ser linha de base. Testado ao vivo: a 1ª gravação passa, a 2ª é
recusada, os demais campos de `negocios` seguem editáveis normalmente.

---

## 10. Revisão e rastro

Copiados do ContLife, adaptados:

```
trilha           negocio_id · tipo · descricao · criado_em     (só nasce, nunca morre)
lixeira          negocio_id · lancamento_id · conteudo (jsonb) · excluido_em
conciliacoes     negocio_id · lancamento_id · conferido_em     (marca "bate com o extrato")
```

A trilha é **append-only** no cliente e no banco — as duas trancas, como no ContLife.

---

## 11. O motor de sincronização — o que muda

`contlife-sinc.mjs` vem quase intacto (`01` §2). Muda **só a declaração `COLECOES`** no topo,
e a lista branca de tabelas do `aplicar_lote`.

**Um achado que vale registrar:** as **linhas de lançamento** entram no motor **sem
alteração nenhuma nele**. Basta serem uma coleção própria, com `id` e `lancamento_id` como
campo comum. O algoritmo de `forma: "lista"` já resolve — não precisa de conceito de
pai/filho.

**E o teto de volume** (`01` §4.3) **deixa de ser preocupação agora:** o Contadoria carrega
**um cliente por vez**, como o ContLife carrega um dossiê. Um MEI gera algo como 50
lançamentos por mês — 600 por ano. Carregar isso é instantâneo.

**Quando revisitar:** se algum cliente passar de ~20.000 lançamentos. Registrado aqui para
não ser redescoberto com dor. Otimizar antes disso é construir para um problema que
provavelmente nunca vem (`03` §6).

---

## 12. Herdado do ContLife, sem discussão

Custou caro lá e não se paga de novo:

| Peça | O quê |
|---|---|
| `aplicar_lote` | tudo num lote vira **uma transação** |
| Chaves estrangeiras adiadas | a ordem das operações dentro do lote não importa |
| O freio | lote que apaga muito de uma vez é **recusado**, não executado |
| `search_path` fixo em toda função | sem isso, o gatilho quebra em contexto de sistema — derrubou o cadastro inteiro lá |
| `security invoker` | a RLS continua valendo dentro da função |
| `negocio_id` carimbado pelo servidor | o cliente não manda; se mandasse, seria sobrescrito |
| Teste do JS contra o SQL real | toda coluna tem quem a preencha; nenhuma `not null` recebe null |
| Erro de gravação visível | falha silenciosa é pior que bug: a pessoa acha que salvou |

---

## 13. Ordem de implementação

| # | Passo | Como se prova |
|---|---|---|
| 1 | Projeto Supabase novo + schema + RLS + `aplicar_lote` | `conferir.mjs` lê o banco de verdade: RLS ligada em toda tabela, gatilhos no lugar |
| 2 | **A trava do equilíbrio** | tentar gravar lançamento torto e **o banco recusar** — o teste negativo antes do positivo |
| 3 | Motor de sincronização com `COLECOES` novo + testes contra o SQL | `npm test`, incluindo a sabotagem deliberada para provar que o teste sabe falhar |
| 4 | Login + cadastro de negócio | entrar de verdade |
| 5 | Roteiro do Cliente Novo + **balanço de abertura** | cliente novo nasce com o livro **equilibrado** |
| 6 | Lançar, diário, razão, balancete | a equação fecha |
| 7 | Caixa de Entrada | onde vai o tempo dele |
| 8 | Revisão + fechamento de mês | direito de dizer "conferi" |
| 9 | Entregas | o que o cliente vê |
| 10 | Painel do Mês · limite · DAS · virada de ano | |

**Usar com um cliente real a partir do passo 8.** Sistema contábil só mostra os defeitos com
dado de verdade dentro.

**Modelo:** do passo 1 em diante o alvo está claro — **Sonnet**. Voltar ao Opus só se o
desenho precisar mudar.
