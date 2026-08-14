# Estado da sessão

> ⚠️ **A partir de 14/ago/2026 este arquivo é o DIÁRIO** — o que aconteceu, em ordem.
> **A fonte de verdade do que VALE HOJE é [`DECISOES.md`](DECISOES.md)**, com estados
> (DECIDIDO · PRINCÍPIO · REGRA · PROPOSTA · HIPÓTESE · SUBSTITUÍDA · DESCARTADA).
> Se os dois discordarem, **`DECISOES.md` ganha**.
> Os princípios de produto vivem em [`09_PRINCIPIOS_DE_VALOR.md`](09_PRINCIPIOS_DE_VALOR.md).

> **Leia este arquivo primeiro, sempre.** Ele existe para a próxima sessão retomar sem ler
> a conversa anterior. Sobrescreva ao encerrar qualquer sessão: o que foi feito, o que ficou
> pendente, a próxima tarefa recomendada, e **o que aguarda decisão do Luan**.

---

## Estado atual — 13/ago/2026

**O projeto Supabase do Contadoria existe e está provado.** Referência `gmiiuklkhwjpcowvjbwz`,
mesma organização do ContLife, região São Paulo. As 4 migrações foram aplicadas no banco
real, conferidas (`conferir.mjs`: 14/14 tabelas, RLS + política + grant em todas), e **a
trava de equilíbrio foi provada com o teste NEGATIVO primeiro** (`testar-equilibrio.mjs`,
rodando contra o banco de verdade, como usuário autenticado — não como admin): lançamento
desequilibrado voltou HTTP 400 e nada ficou gravado; lançamento certo foi aceito; apagar um
lançamento inteiro não acusa falso desequilíbrio. Os passos 1 e 2 do `06` §13 estão
**concluídos e provados**, não só escritos.

**O passo 4 também está concluído e verificado no navegador de verdade** (não só compilado):
login, cadastro de negócio via `criar_negocio()`, e a prateleira.

**O passo 5 está concluído e verificado com o teste mais completo até aqui:** o Roteiro do
Cliente Novo inteiro (6 blocos) rodado ponta a ponta no navegador, terminando num balanço de
abertura real de 6 linhas gravado pela trava de equilíbrio — débitos e créditos batendo em
R$ 4.810,00, capital do titular calculado certo (R$ 4.010,00).

**O passo 6 está concluído: o Livro está de pé, com o loop reativo do ContLife funcionando
de ponta a ponta** — lançou uma venda de teste pela tela (D Caixa / C Prestação de serviços,
R$ 500), **sem clicar em nenhum botão de "salvar"**, e o lançamento apareceu no banco de
verdade sozinho, debounced. Diário, Razão e Balancete todos conferidos mostrando o mesmo
lançamento certo, com "fecha ✓".

**A Caixa de Entrada está concluída e o aprendizado provado de verdade:** importei um
extrato CSV de teste, classifiquei "POSTO IPIRANGA 1234" ensinando o padrão generalizado
"POSTO IPIRANGA" → Combustível, marquei outro item como pessoal (sem gerar lançamento), e
ao importar um SEGUNDO extrato com "POSTO IPIRANGA 9999" (loja diferente), **a sugestão
"Combustível" apareceu sozinha** — o mecanismo de aprendizado funciona de verdade, não só
no papel.

**Fechamento + Revisão concluídos:** fechar um mês bloqueia escrita nele de verdade (testado
tentando lançar num mês fechado — recusado, nada vazou pro banco), reabrir libera de novo, e
a trilha registra a sequência inteira.

**Entregas concluídas — o Retrato do Mês e "quanto você pode tirar" conferidos casa decimal
por casa decimal contra conta manual**, com dado semeado deliberadamente para testar a
pergunta "pra onde foi o que sobrou" (uma venda a prazo fez o resultado subir sem o caixa se
mexer — a tela apontou a diferença sozinha). Ver a seção própria abaixo.

| Arquivo | O que é |
|---|---|
| `CLAUDE.md` | disciplina de trabalho herdada do ContLife (lido automaticamente) |
| `docs/00_NORTE.md` | documento de partida. **Histórico** — onde divergir do `02`, o `02` vence |
| `docs/01_ANALISE_REAPROVEITAMENTO.md` | **novo (11/ago)** — confere o mapa do NORTE contra o código real do ContLife |
| `docs/02_ESCOPO.md` | **novo (11/ago)** — o que o sistema é, decidido com o dono |
| `docs/03_CENARIOS_E_CAPACIDADE.md` | **novo (11/ago)** — cenários de dado, quantos clientes cabem, ordem dos gargalos |
| `docs/04_MAPA_DO_APP.md` | **novo (11/ago)** — o sistema por dentro, em linguagem natural. **É o contrato do desenho** |
| `docs/06_MODELO_DE_DADOS.md` | **novo (11/ago)** — como o sistema guarda as coisas. **Último documento antes do código** |
| `docs/05_ROTEIRO_DO_SERVICO.md` | **novo (11/ago)** — quais dados pedir e por quê, a conversa inicial, o ritmo do mês, o roteiro da entrega. **Também é requisito**: define os campos do cadastro e da abertura |
| `docs/07_MEI_O_QUE_SABER.md` | **novo (11/ago)** — base de conhecimento sobre MEI para conversar com cliente. **Envelhece por lei** — números marcados 🔢 conferir antes de usar |
| `docs/08_DIFERENCIAL.md` | **novo (11/ago)** — o que faz o sistema ser único. Crítica antes de proposta |
| `docs/SESSION_STATE.md` | este arquivo |
| `README.md` | porta de entrada |
| `.gitignore` | já preparado para segredos |

Git com remoto **privado**: https://github.com/grluans09-source/contadoria (criado e
enviado em 11/ago, com autorização do dono).

### O que a análise de 11/ago acrescentou

- **Confirmado como ouro:** `contlife-sinc.mjs`, `aplicar_lote.sql`, `TelaAutenticacao`,
  a disciplina de teste contra o SQL real, o pipeline de build.
- **Corrigido para menos:** as primitivas de UI valem ~1 dia (são pequenas; o valor está na
  convenção de tema e na acessibilidade já calibrada), e o motor contábil transfere só
  metade — as métricas de vida pessoal (`computeStats`, score, idade financeira) não servem.
- **Três decisões caras de desfazer depois**, detalhadas na §4 da análise:
  1. **partida binária vs. lançamento com N linhas** — venda com baixa de estoque tem 4
     pernas num fato só; o `entries` do ContLife só aceita 2;
  2. **`owner_id` no dossiê vs. tabela de membros** — o modelo atual cobre "o Luan cuida de
     vários clientes", mas não "o dono da loja também entra";
  3. **o teto do "carrega tudo na memória"** — manter o motor de diferença, mas deixar
     lançamentos e movimento de estoque fora dele, carregados por período.
- **Não herdar** o arquivo único de 10.361 linhas: começar modular custa zero agora.

---

## Como isto nasceu

Em 10/ago/2026, no fim da sessão que colocou o **ContLife** no ar (finanças pessoais, agora
em beta com pessoas próximas), o dono decidiu começar um segundo sistema — para pequenos
negócios — **em paralelo** aos 3 meses de teste do ContLife.

A primeira tentativa colocou o documento de partida dentro da pasta do ContLife. **O dono
corrigiu:** é coisa nova, e tudo dela deve viver num lugar só — pasta, git e banco próprios.
O ContLife é **fonte de reaproveitamento**, não base.

---

## Escopo fechado em 11/ago — o essencial em 6 linhas

Detalhe completo em [`02_ESCOPO.md`](02_ESCOPO.md); resumo para não precisar abrir:

- **Ele vende o serviço, não o sistema.** O sistema é ferramenta interna dele. Sem planos,
  trial, Stripe, Porta ou mascotes.
- **Clientes: MEIs e trabalhadores informais.** MEI **não é obrigado a ter contador** — é
  por isso que o mercado está aberto para ele, e é por isso que ele vende **clareza**, não
  conformidade.
- **Só o Luan digita** na v1. Cliente manda pelo WhatsApp. Portal do cliente (só leitura)
  fica para a v2 — mas a **tabela de membros nasce na v1** para não trocar fechadura depois.
- **Três gavetas de entrega:** obrigação (Relatório de Receitas, DAS, limite de faturamento),
  gerencial (DRE, caixa, empresa × pessoa, margem, ponto de equilíbrio) e revisão
  (conciliação, invariantes, achados, trilha, fechamento com selo, carta de recomendações).
- **Visual do ContLife entra** (preto/ouro/marfim); mascotes e Caduceu **não**.
- **Web, com login, Supabase novo.** Sem estoque na v1, mas com lançamento de N linhas.

---

## ⚠️ O que ainda aguarda o Luan

**Nada bloqueia o próximo passo.** As perguntas abertas viraram cenários que o desenho já
cobre (`03` §2): o sistema atende cliente com extrato, com conta misturada e cliente que só
manda áudio — e o **pior cenário é o alvo padrão**.

Fica em aberto, para ser respondido pela realidade e não por suposição:

- **Captação, precificação, quantos clientes de verdade.** O dono quer discutir isso à
  parte. Estimativa da IA em `03` §4: teto de 15-20 atendidos com o sistema (6-8 na
  planilha), mas 4-10 conquistados no ano 1 — **a venda é o gargalo, não a capacidade.**
  Conferir depois dos 3 primeiros clientes e corrigir o `03`.

---

## ✅ Os três buracos — resolvidos no `06`

1. **Regime caixa vs competência** → **a pergunta se dissolve.** Venda a prazo são dois
   fatos (a venda e o recebimento); competência = contas de resultado, caixa = contas de
   Caixa/Banco. Sem seletor global — que no ContLife causou DRE e indicadores discordando
   para o mesmo mês. `06` §3
2. **Saldos iniciais** → um lançamento `origem = 'abertura'`, com uma linha por coisa que o
   cliente tem ou deve, e o Capital do titular **calculado** para fechar. `06` §4
3. **Virada de ano** → `periodos_fechados` com tipo `mes|ano`; o encerramento anual zera
   resultado contra o patrimônio. O limite de faturamento não guarda contador: soma dos
   lançamentos do ano. `06` §5

---

## 🔍 Revisão antes do código (11/ago) — três lacunas achadas

A revisão pedida pelo dono antes de liberar a implementação achou o seguinte. **Nenhuma
bloqueia o passo 1**, mas as três precisam ser resolvidas antes do **primeiro cliente real**.

### 1. 🔴 Não existe backup — e agora o dado é de terceiros

No ContLife, perder o banco era problema **dele**. Aqui é dado financeiro **de clientes**, e
a responsabilidade muda de natureza. O plano gratuito do Supabase **não tem backup
automático para fora dele mesmo**.

**Resolver com:** exportação semanal do banco para arquivo local (JSON), rodada por script.
Barato, e a mesma peça serve para o **"cliente saiu, leva os dados dele"** — que é
profissionalismo básico e ninguém pequeno faz.

**Entra como passo do `06` §13, antes do primeiro cliente.**

### ✅ 2. Git remoto — RESOLVIDO em 11/ago

Repositório privado criado com autorização do dono:
https://github.com/grluans09-source/contadoria. `git push` passa a fazer parte do
salvamento automático de cada checkpoint, junto do `git commit` (regra do `CLAUDE.md`).

### 3. 🟡 Contadoria e ContLife vão ficar visualmente idênticos

Herdar a linguagem visual foi decidido (`02` §5), mas herdar **igual** tem dois custos: ele
não distingue num relance qual sistema está aberto, e se um dia mostrar o Contadoria a
alguém, parece o mesmo produto. **Resolver com uma variação deliberada** — mesma família
(preto/marfim), outro acento. Decidir na hora de montar o tema, não antes.

### ✅ Supabase: uma conta basta

O plano gratuito permite **2 projetos ativos por organização**. O ContLife ocupa 1, o
Contadoria ocupa o outro. **Não é preciso criar segunda conta** — e não seria bom criar
(duas contas para gerenciar, dois lugares para esquecer senha). Confirmar o número no painel
antes do passo 1; é o tipo de limite que muda sem aviso.

### ✅ 4. Configuração da Data API do projeto — decidida em 12/ago

Na criação do projeto o painel pergunta três coisas. Decidido:

- **Enable Data API** — ligado (obrigatório; é o que expõe REST/RPC).
- **Automatically expose new tables** — **desligado**. Consistente com o resto do desenho:
  nada acontece por padrão mágico (a lista branca do `aplicar_lote`, a RLS explícita por
  tabela). Custo: sem GRANT explícito, mesmo com RLS certa o papel `authenticated` não
  consegue nem tentar a operação — **resolvido em
  `supabase/migrations/0004_grants.sql`**, que só concede a `authenticated` (nunca `anon` —
  nada deste sistema roda antes do login).
- **Enable automatic RLS** — ligado. Rede de segurança para tabela futura; já ligo RLS
  manualmente em toda tabela, isso é reforço, não substituição.

`supabase/conferir.mjs` foi atualizado para provar o grant no banco real (`has_table_privilege`,
`has_function_privilege`), não só a RLS — mesma disciplina de "provar rodando".

---

## ✅ Passos 1 e 2 do `06` §13 — CONCLUÍDOS E PROVADOS (12/ago)

| Arquivo | O que é | Estado |
|---|---|---|
| `supabase/migrations/0001_schema_inicial.sql` | schema completo: `negocios`, `membros` (com `meu_papel()` e `criar_negocio()` resolvendo o ovo-e-a-galinha), `contas`, `lancamentos`, `lancamento_linhas`, `periodos_fechados`, `entrada_itens`, `regras_classificacao`, `roteiro_perguntas/respostas`, `trilha`, `lixeira`, `conciliacoes`, `parametros_fiscais` — RLS completa | ✅ aplicado no banco real, conferido |
| `supabase/migrations/0002_trava_equilibrio.sql` | gatilho **adiado** em `lancamento_linhas` exigindo débitos = créditos. As três armadilhas do `06` §1 | ✅ aplicado — **e provado com o teste negativo, ver abaixo** |
| `supabase/migrations/0003_aplicar_lote.sql` | adaptado do ContLife — `dossier_id` → `negocio_id`, lista branca trocada | ✅ aplicado no banco real |
| `supabase/migrations/0004_grants.sql` | concede a `authenticated` o que "Automatically expose new tables" desligado deixaria faltando | ✅ aplicado — `conferir.mjs` confirma grant em todas as 14 tabelas e nas 3 funções RPC |
| `supabase/aplicar-migracoes.mjs`, `conferir.mjs`, `testar-equilibrio.mjs` | scripts de gerenciamento, `REF` preenchido (`gmiiuklkhwjpcowvjbwz`) | ✅ rodados contra o banco real |
| `src/dados/sinc.mjs` + `tests/sinc.test.mjs` | motor de sincronização, `COLECOES` do Contadoria, generalização do `chaveCampo` (ver comentário no topo do arquivo) | ✅ 13/13 testes, sabotados de propósito e confirmados capazes de falhar |
| `package.json` | scripts de build/teste/migração | `build`/`bump`/`serve` ainda apontam para arquivos que **não existem** — nascem no passo 4 |

### O projeto Supabase do Contadoria

```
Projeto  : contadoria
Ref      : gmiiuklkhwjpcowvjbwz
Região   : sa-east-1 (São Paulo)
URL      : https://gmiiuklkhwjpcowvjbwz.supabase.co
```

Data API configurada em 12/ago: Enable Data API ligado, **Automatically expose new tables
desligado** (compensado por `0004_grants.sql`), Enable automatic RLS ligado. Ver detalhe na
lacuna 4, acima.

A chave `anon` está hardcoded em `supabase/testar-equilibrio.mjs` — pública por design
(protegida por RLS, não por sigilo), mesmo raciocínio do `contlife.jsx`. Vai para o app de
verdade no passo 4.

⚠️ **O token de gerenciamento (`sbp_...`) usado para aplicar as migrações continua ativo no
Supabase — pedido ao Luan para revogar em Account Settings → Access Tokens.** Ele não é mais
necessário: os próximos passos usam só a chave `anon` + login de usuário, nunca a API de
gerenciamento. Confirmar quando revogado e marcar aqui.

### Prova da trava de equilíbrio (`testar-equilibrio.mjs`, contra o banco real, como usuário
autenticado — não como admin, porque `aplicar_lote` é `security invoker`)

1. **Negativo primeiro:** lançamento com débito 100 / crédito 90 → **HTTP 400, recusado**
2. Confirmado que nada do lote ficou gravado (tudo ou nada, mesmo com a recusa no meio)
3. Só depois, o positivo: lançamento equilibrado → aceito
4. Armadilha 1 (`06` §1): apagar cabeçalho + linhas juntos → sem erro, sem falso positivo de
   desequilíbrio do que já sumiu

**Usuário de teste criado no banco** (confirmado, via Admin API — chave `service_role` usada
uma vez, em memória, nunca gravada em disco): `contadoria-teste@mailinator.com`. Fica no
banco para reaproveitar em futuras rodadas de `testar-equilibrio.mjs`.

---

## ✅ Passo 4 do `06` §13 — CONCLUÍDO E VERIFICADO NO NAVEGADOR (12/ago)

O dono pediu, no meio da construção deste passo: visual "interativo, intuitivo e nada
cansativo", um sistema "vivo" como o ContLife — **sem mascote** (docs/02 §5 continua valendo:
aqui o usuário é ele mesmo). A resposta foi microinteração, não personagem — registrado no
topo de `src/ui/primitivas.jsx`.

| Arquivo | O que é |
|---|---|
| `src/ui/tema.mjs` | `THEMES` com a variação deliberada da lacuna 3: **cobre**, não ouro — mesma família preto+marfim do ContLife, acento diferente para dar pra distinguir os dois sistemas num relance |
| `src/ui/EstiloGlobal.jsx` | injeta as variáveis CSS do tema + as regras de acessibilidade herdadas (alvo de toque 40px, `prefers-reduced-motion`) |
| `src/ui/primitivas.jsx` | `Card` (com variante `elevavel`), `Button` (hover levanta, clique aperta), `Input`, `Select`, `Label`, `useContagem` (número que conta em vez de aparecer pronto — pronto para as telas de indicador do passo 5+), `Confirmacao` (pulsa e some) |
| `src/dados/supabase.mjs` | cliente + `traduzErroAuth` — copiado quase ao pé da letra do ContLife (`01` grade A) |
| `src/telas/Autenticacao.jsx` | `TelaCarregandoAuth` + `TelaAutenticacao` (4 modos), copiada e adaptada — sem `LogoMarca` (Contadoria não tem marca própria ainda), wordmark com traço animado no primeiro instante |
| `src/telas/Negocios.jsx` | a prateleira (`04` §2), versão inicial: lista + cadastro chamando `criar_negocio()`. Colunas ricas (movimento, limite, DAS) ficam para quando existir lançamento de verdade — mostrar "—" seria mentir que há dado |
| `src/app/App.jsx` | portão de autenticação (mesmo contrato do ContLife: `undefined`/`null`/objeto) + roteamento entre Autenticação → Negócios → (placeholder) Dentro do Negócio |
| `src/app/main.jsx` | só reexporta `App` — quem monta o React é o `dist/index.html`, que trata erro de boot (mesmo padrão do ContLife) |
| `dist/index.html`, `scripts/bump.mjs`, `serve.mjs` | pipeline copiado do ContLife, porta **8788** (diferente da 8787 do ContLife, os dois rodam ao mesmo tempo sem colidir) |
| `.claude/launch.json` (na raiz do Desktop) | entrada `contadoria` adicionada, ao lado das dos outros projetos |

### Verificado rodando de verdade, não só compilado

`npm run build` (25,9kb) → servido na porta 8788 → no navegador:
1. Tela de login renderizou com a cor cobre, traço animado, tudo certo
2. Alternância Entrar/Criar conta funciona
3. **Login real** com o usuário de teste → sessão detectada → caiu na prateleira vazia
4. **Cadastro real de negócio** ("Salgados da Léia") via `criar_negocio()` → apareceu na
   prateleira com animação de entrada, confirmação pulsando
5. Clique no card → placeholder "dentro do negócio" → Voltar → prateleira de novo
6. Recarregar a página → sessão persistiu (Supabase cuida disso sozinho)
7. Console e rede sem erro (o único 404 foi de uma navegação errada minha, corrigida)

O negócio de teste foi apagado do banco depois — não é dado real, era só prova de fluxo.

---

## ✅ Passo 5 do `06` §13 — CONCLUÍDO E VERIFICADO PONTA A PONTA (12/ago)

O Roteiro do Cliente Novo (`05` §4) + o balanço de abertura (`06` §4) — a primeira tela que
usa `aplicar_lote()` de verdade, com lançamento de N linhas.

### Um buraco achado construindo, corrigido antes de virar dívida

`lancamento_linhas` só tinha `conta_id/tipo/valor` — bastava para o teste da trava, mas não
para "quem te deve, quanto e **pra quando**": isso exige várias linhas na MESMA conta
(Clientes), cada uma com identidade própria. **Corrigido em
`0006_linha_descricao.sql`** — `descricao` e `vencimento` por linha, adicionadas por `ALTER
TABLE` (nunca editando a 0001 já aplicada). O teste do motor de sincronização foi
**generalizado** para escanear `ALTER TABLE ADD COLUMN` em todas as migrações, não só
`CREATE TABLE` na 0001 — sabotado de novo e confirmado que pega as colunas certas.

### Outro achado: `aplicar-migracoes.mjs` não era seguro para rodar duas vezes

`create policy` não é idempotente — reaplicar a 0001 depois de já aplicada quebraria com
"política já existe" e abortaria o lote inteiro, inclusive migrações novas que viessem
depois. **Corrigido:** o script agora registra o que já rodou numa tabela
`_migracoes_aplicadas` (RLS ligada, zero política de propósito — infraestrutura, não dado de
domínio; `conferir.mjs` sabe distinguir isso e não acusa mais falso alarme). Rodar o script
de novo agora é seguro e só aplica o que é novo.

### Decisão de arquitetura registrada

`roteiro_perguntas` mora no banco (texto e "por que importa" editáveis sem mexer em código —
docs/05 §1), mas **não existe interpretador genérico do campo `destino`**: cada bloco do
Roteiro tem código explícito que grava a resposta no lugar certo. Um interpretador genérico
seria abstração para um problema com exatamente UM formulário (CLAUDE.md: "três linhas
parecidas é melhor que abstração prematura"). Bloco 4 ("quais contas você paga todo mês")
captura como texto livre por enquanto — a automação de recorrentes é peça futura, sem tabela
própria ainda.

### Segurança contra retry: id determinístico + apagar-e-regravar no mesmo lote

O lançamento de abertura usa `id = "abertura_" + negocio.id` (não aleatório) — se a gravação
falhar no meio e o dono tentar de novo, o retry cai no MESMO lançamento. As linhas antigas
(se houver) são apagadas e as novas gravadas no mesmo `aplicar_lote`, atômico: ou o balanço
fica limpo, ou nada muda. Sem isso, um retry duplicaria o balanço de abertura em silêncio.

### Verificado ponta a ponta no navegador, contra o banco real

Roteiro completo (6 blocos) rodado de verdade num negócio de teste ("Salgados da Léia"):
tooltips "por que importa" mostrando o texto certo vindo do banco, Bloco 3 com listas
repetíveis (equipamento, a receber, a pagar) funcionando, e ao concluir — **conferido
direto no banco**, não só na tela:
- 31 contas de fábrica gravadas
- 1 lançamento (`abertura_<id>`, datado do dia anterior ao início do serviço)
- 6 linhas, cada uma com sua descrição e vencimento próprios
- **débitos = créditos = R$ 4.810,00** — a trava aceitou porque estava certo
- capital do titular calculado em R$ 4.010,00 (4.810 − 800), exatamente a conta manual
- `negocios` atualizado (data_abertura, atividade, tem_funcionario, whatsapp, onboarded)
- 4 respostas do roteiro arquivadas em `roteiro_respostas`

Negócio de teste apagado depois — `cascade` confirmado limpando tudo (contas, lançamento,
linhas, respostas), zero órfão.

### Bug de ambiente achado e corrigido: boot travava em aba fora de foco

A tela de boot dependia só de `requestAnimationFrame` dobrado para sumir — mas rAF fica
pausado em aba sem foco/minimizada. Achado tentando testar no navegador (a tela ficava presa
mesmo com o app já pintado por baixo). **Corrigido em `dist/index.html`:** `setTimeout` de
1500ms como rede de segurança, independente da aba estar visível.

---

## ✅ Passo 6 do `06` §13 — O LIVRO, CONCLUÍDO E VERIFICADO COM O LOOP REATIVO (12/ago)

`DentroDoNegocio` (o placeholder em `src/app/App.jsx`) foi substituído por `Livro.jsx` de
verdade — Lançar, Diário, Razão, Balancete.

| Arquivo | O que é |
|---|---|
| `src/dominio/razao.mjs` | `saldoDeConta`, `balancete` (débito/crédito bruto por conta, recomputado das linhas — nunca de um saldo em cache, a mesma lição do H2 do ContLife), `linhasComContexto` |
| `src/dados/estadoNegocio.mjs` | carrega TODAS as coleções de um negócio, **paginado** (armadilha do PostgREST: 1.000 linhas por página, em silêncio) → `montarEstado` |
| `src/telas/Balancete.jsx`, `Diario.jsx`, `Razao.jsx`, `Lancar.jsx` | as 4 telas, uma por arquivo |
| `src/telas/Livro.jsx` | o container: carrega o estado, o loop reativo (ver abaixo), abas |
| `src/ui/primitivas.jsx` | ganhou `Tabs` (copiado do ContLife) |
| `tests/razao.test.mjs` | 9 testes — inclui conta sem nenhuma linha (não deve sumir) e linha órfã (não deve derrubar a tela) |

### A peça que faltava: o loop reativo (`fotoRef` + `calcularDiferenca` + debounce)

O Roteiro chama `aplicar_lote` direto no clique — certo para UM formulário. O Livro tem
edição contínua, e reescrever cada mutação para salvar sozinha é o modo de falha que o
ContLife decidiu evitar: esquecer UM ponto de mutação para de salvar em silêncio. `Livro.jsx`
usa o padrão do ContLife pela primeira vez de ponta a ponta: guarda a foto confirmada pelo
servidor, compara contra ela a cada mudança em memória, debounce de 900ms, só a DIFERENÇA
vai num lote.

**Sem a guarda `loadedForKeyRef` do bug H3 do ContLife (doc 26)** — e não por esquecimento:
`App.jsx` monta `<Livro key={negocio.id} .../>`. Trocar de negócio DESMONTA o componente
inteiro; React resolve por construção o que o ContLife precisou de uma guarda manual para
resolver (o estado de um dossiê vazando pro próximo por um instante, entre trocar a chave e
a carga nova terminar).

**Achado construindo, corrigido antes de virar bug real:** se o dono clicasse "Voltar"
dentro da janela de debounce (900ms), o cleanup normal do efeito CANCELARIA o salvamento —
perderia o lançamento em silêncio. `Livro.jsx` tem um segundo efeito, só de desmontagem, que
DESCARREGA qualquer gravação pendente antes de sair (melhor esforço, sem `await` — o
componente já foi).

### Verificado no navegador, contra o banco real — sem clicar em "salvar" nenhuma vez

Lançamento de teste (D Caixa R$ 500 / C Prestação de serviços R$ 500) inserido só pela tela
do Lançar. **Sem nenhum botão de "salvar"**, o loop reativo gravou sozinho — conferido direto
no banco (não só na tela): o lançamento e as duas linhas exatamente como digitado. Diário,
Razão (conta Caixa, saldo corrente certo) e Balancete (só as 2 contas com movimento,
débito = crédito = R$ 500,00, "fecha ✓") todos conferidos consistentes com o mesmo dado.
Negócio de teste apagado depois, cascade confirmado.

---

## ✅ Caixa de Entrada — CONCLUÍDA E O APRENDIZADO PROVADO (12/ago)

O gargalo real do serviço (`04` §5, `03` §5). Substituiu a primeira aba do Livro.

| Arquivo | O que é |
|---|---|
| `supabase/migrations/0007_entrada_conta_origem.sql` | buraco achado construindo: faltava saber se o item é do Caixa ou do Banco. `conta_origem_id`, por `ALTER TABLE` |
| `src/dominio/importarExtrato.mjs` | `parseOFX`/`parseCSVText`/`toISO`, copiados do ContLife quase ao pé da letra — parsing de arquivo não tem domínio |
| `src/dominio/classificacao.mjs` | `sugerirConta` (casa por substring, o padrão mais ESPECÍFICO vence) e `construirLancamentoDeClassificacao` (2 linhas, direção pelo sinal do valor) |
| `src/telas/CaixaEntrada.jsx` | importar (CSV/OFX, com prévia antes de confirmar) + fila de classificação (Classificar / É pessoal / Não sei) |
| `tests/classificacao.test.mjs` | 10 testes |

### Uma decisão de arquitetura: quem generaliza o padrão é o DONO, não uma heurística

`sugerirConta` só procura o que já foi ENSINADO — não tenta extrair um padrão sozinho a
partir da descrição crua. Inventar um tokenizador para isso seria abstração frágil demais
para confiar sem supervisão. Em vez disso, ao classificar, o campo "padrão" vem
pré-preenchido com a descrição inteira, **editável** — o dono decide o quanto generalizar
("POSTO IPIRANGA 1234" → "POSTO IPIRANGA"). É o "roteiro aprende" (docs/05 §1) aplicado
aqui: o sistema lembra o que foi dito, não adivinha.

### Verificado no navegador, contra o banco real — inclusive o aprendizado generalizando

Importei um CSV de teste, classifiquei um PIX (vira D Banco/C Prestação de serviços,
conferido), marquei uma Netflix como pessoal (sem lançamento nenhum, item preservado),
classifiquei um posto ensinando o padrão **generalizado** "POSTO IPIRANGA". Importei um
**segundo** extrato com "POSTO IPIRANGA 9999" — loja diferente da ensinada — e **a sugestão
"Combustível" apareceu sozinha**, provando que o padrão generaliza de verdade, não é
coincidência de string igual. Negócio de teste apagado depois, cascade confirmado.

---

## ✅ Fechamento de mês + Revisão — CONCLUÍDO, O CICLO INTEIRO VERIFICADO (13/ago)

Implementa `04_MAPA_DO_APP.md` §7-8. Nenhuma tabela nova — `periodos_fechados`, `trilha` e
`conciliacoes` já existiam no schema (docs/06 §10) e estavam sem uso; esta etapa é a
primeira a preenchê-las de verdade.

| Arquivo | O que é |
|---|---|
| `src/dominio/revisao.mjs` | `mesaDeRevisao` — 5 checagens, cada uma recomputada DIRETO das linhas, nunca de um resumo (a lição do bug H2 do ContLife) |
| `src/telas/Conciliacao.jsx` | por LANÇAMENTO, não por linha — é como `conciliacoes` foi desenhada (docs/06 §10) |
| `src/telas/Revisao.jsx` | Mesa + Fechamento (escolher mês, fechar, reabrir) + as últimas entradas da trilha |
| `tests/revisao.test.mjs` | 10 testes — inclui a prova de que a checagem da equação NÃO é tautológica: duas linhas D sem nenhum C do outro lado quebra a checagem mesmo com cada lançamento parecendo fechado |

### A trava fica sem dentes se não bloquear escrita — corrigido, centralizado

Fechar um mês só significa algo se ninguém conseguir escrever nele depois. A guarda
(`mesEstaFechado`) vive DENTRO de `adicionarLancamento` e `classificarItem`, em
`Livro.jsx` — não em cada tela que lança. Assim qualquer entrada futura herda a proteção
automaticamente, sem precisar lembrar de repetir a checagem.

### Achado testando, corrigido antes de virar hábito de UI enganoso

`Lancar.jsx` e `CaixaEntrada.jsx` limpavam o formulário como se tivesse dado certo mesmo
quando o Livro RECUSAVA a mutação (mês fechado) — o erro aparecia, mas escondido embaixo de
um formulário vazio que sugeria sucesso. Corrigido: os mutadores agora devolvem `false`
quando recusam, e as telas só resetam no sucesso de verdade.

### Verificado no navegador, o ciclo completo, contra o banco real

Lancei um Corte e escova, conferi contra o extrato na Conciliação (virou "Desmarcar
conferido"), a Mesa passou tudo, fechei agosto/2026. **Tentei lançar de novo no mesmo mês —
recusado, formulário preservou os R$ 25,00 digitados** (não fingiu sucesso), e conferido
direto no banco que nada vazou. Reabri o mês pela Revisão — voltou a aceitar lançamento, e
a trilha mostrou a sequência inteira em ordem: `lancar` → `fechar_mes` → `reabrir_mes`.
Negócio de teste apagado depois, cascade confirmado limpando `trilha` e `conciliacoes`
junto.

---

## ✅ Entregas — O RETRATO DO MÊS, CONCLUÍDO E CONFERIDO CONTRA CONTA MANUAL (13/ago)

Implementa `04_MAPA_DO_APP.md` §9 e o diferencial mais forte do produto (`08` §2-3). Nova
aba "Entregas" no Livro.

| Arquivo | O que é |
|---|---|
| `src/dominio/disponivel.mjs` | `quantoPodeTirar` — a proposta mais forte do produto (`08` §2). Cada parcela CAPADA no que o livro garante matematicamente, nunca superestima |
| `src/dominio/razao.mjs` (`resultadoDoMes`) | resultado do mês + variação real de caixa/banco — a resposta pra "pra onde foi o que sobrou" (`04` §9.1) |
| `src/telas/RetratoDoMes.jsx` | a página única (`08` §3): número grande, poucas frases, o rodapé que protege o limite profissional |
| `tests/disponivel.test.mjs` | 9 testes — inclui o caso do recebível já pago que NÃO pode contar de novo |
| `tests/razao.test.mjs` (+3) | `resultadoDoMes` |

### Por que "a receber" e "compromissos" são CAPADOS no saldo, não somados cru por vencimento

Somar linhas de Clientes com vencimento nos próximos 30 dias pode superestimar se uma já foi
paga — o pagamento é OUTRO lançamento; a linha original com o vencimento antigo continua lá.
O SALDO da conta, por outro lado, é sempre matematicamente correto (todo pagamento gera um
crédito que desconta). Solução: usa o MENOR entre os dois. Registrado no código o que falta
para ficar mais preciso — uma tela de baixa de recebível ligando pagamento a origem, ainda
não construída.

### Reserva mínima: a MAIOR despesa entre os últimos meses fechados, não a média

Deliberado — é o lado conservador (`08` §2, "errar para baixo"). Sem nenhum mês fechado
ainda, a reserva é zero: sem histórico, não se inventa número.

### Verificado com dado semeado e conferido À MÃO, não só rodando

Julho fechado (aluguel R$400, venda R$900) + agosto com venda à vista (R$500) e a prazo
(R$300, vence em 10 dias). Na tela:
- **Julho:** "sobrou R$500,00" — bate (900−400)
- **Agosto:** "sobrou R$800,00", e o aviso de "pra onde foi" apontou a diferença de R$300
  entre o resultado e a variação real de caixa — **exatamente** o valor que foi para
  Clientes (a venda a prazo), sem eu precisar apontar
- **Quanto pode tirar:** R$900,00 = R$1.000 disponível + R$300 a receber − R$400 de reserva
  — bate com a conta manual, casa decimal por casa decimal

Negócio de teste apagado depois.

---

## ✅ Editar/excluir lançamento, sair, editar cadastro, editar plano de contas, prateleira rica (13/ago)

Resposta ao "quero o sistema já pronto com tudo" — lacunas descobertas construindo que não
estavam em nenhum doc, mais o item 1 do `04_MAPA_DO_APP.md` §3 (prateleira).

| Arquivo | O que é |
|---|---|
| `src/telas/Lancar.jsx` | agora serve criar E editar (`editando`/`onEditar`/`onCancelarEdicao`) |
| `src/telas/Diario.jsx` | ícones de editar/excluir por card (só em lançamentos de origem `manual`/`extrato` — nunca em `abertura`/`encerramento_mes`); excluir tem confirmação em duas etapas |
| `src/telas/Livro.jsx` | `editarLancamento`, `excluirLancamento` (respeita `mesEstaFechado`, vai pra `lixeira`, zera `entrada_itens` que apontavam pro lançamento apagado), `adicionarConta`/`alternarAtivaConta`; abas novas "Plano de contas" e "Negócio" |
| `src/telas/ConfigNegocio.jsx` (novo) | editar nome/apelido/CNPJ/atividade/WhatsApp/funcionário/situação — direto no Supabase, fora do loop reativo (mesmo motivo do `ClienteNovo.jsx`: não é coleção-filha) |
| `src/telas/PlanoContas.jsx` (novo) | adicionar conta nova, ativar/desativar — sem excluir de propósito (conta com movimento não pode sumir sem quebrar histórico) |
| `src/telas/Negocios.jsx` | botão "Sair" (`supabase.auth.signOut()`); prateleira agora mostra "sobrou/faltou R$X este mês" por card (só para negócio ativo e já onboarded) |
| `src/dados/resumoNegocio.mjs` (novo) | reaproveita `resultadoDoMes` já testado — não reinventa soma em SQL |

### Bug pego ao vivo, antes de qualquer relato do usuário

`Lancar.jsx`: depois de salvar uma edição, o formulário voltava pro modo "criar" mas ficava
com os valores da edição ainda preenchidos — parecia que ia duplicar o lançamento. Faltava
`limpar()` + confirmação depois de `onCancelarEdicao()`. Corrigido e reconferido: reload de
página, o valor editado (R$150) persistiu certo, formulário limpo.

### Bug pego ao vivo verificando a prateleira rica

`resumoNegocio.mjs` buscava contas com `select("id, tipo")` — sem `codigo`. `resultadoDoMes`
usa `balancete()` por baixo, que ordena por `c.codigo.localeCompare(...)`: tela travava em
"…" pra sempre, erro só no console (`Cannot read properties of undefined (reading
'localeCompare')`). Corrigido incluindo `codigo` na consulta. Reconferido lançando uma venda
de R$300 de verdade: a prateleira mostrou "sobrou R$ 300,00 este mês", batendo.

### Verificado no navegador contra o banco real

Negócio de teste "Pizzaria Rossi": editei um lançamento (persistiu o novo valor após reload),
excluí outro (foi pra `lixeira` com conteúdo completo, `entrada_itens` voltou pra
`pendente`/sem vínculo, `trilha` registrou `lancar → editar → excluir` em ordem), editei o
cadastro (atividade/WhatsApp persistiram), adicionei conta "5114 — Embalagens de entrega" e
desativei (persistiu `ativa:false`). Negócio de teste apagado depois, zero linhas órfãs em
nenhuma tabela. `npm test`: 62/62 passando.

---

## ✅ Recorrentes (13/ago)

Implementa docs/05_ROTEIRO_DO_SERVICO.md §7: "já entram cadastradas na abertura — é o que
faz o segundo mês ser rápido". Item 2 do que faltava.

| Arquivo | O que é |
|---|---|
| `supabase/migrations/0008_recorrentes.sql` | tabelas `recorrentes`/`recorrente_linhas` (mesmo desenho cabeçalho+linhas de `lancamentos`, docs/06 §1); RLS e grants no mesmo padrão; `aplicar_lote` reescrito com as duas tabelas na lista branca |
| `src/dados/sinc.mjs` | duas coleções novas no motor de sincronização — carregam/salvam sozinhas, sem código extra em `estadoNegocio.mjs` |
| `src/dominio/recorrentes.mjs` (novo) | `gerarLancamentosDoMes` — função pura: materializa cada template ativo num lançamento de verdade, `origem: "recorrente"`, `documento` = id do template. Não duplica se já gerou este mês (mesmo `documento` + mesmo mês) |
| `tests/recorrentes.test.mjs` (novo) | 5 testes — inclui não duplicar, mês diferente conta separado, e cada lançamento gerado fecha D=C |
| `src/telas/Recorrentes.jsx` (novo) | cadastro de template (mesma validação de equilíbrio do Lancar), lista com ativar/desativar, botão "Gerar lançamentos do mês" |
| `src/telas/Livro.jsx` | aba nova; `adicionarRecorrente`/`alternarAtivaRecorrente`/`gerarRecorrentesDoMes` |
| `src/telas/Diario.jsx` | `recorrente` saiu da lista de origens travadas — é um lançamento comum que nasceu sozinho, não uma marca estrutural como abertura/fechamento; precisa poder ser corrigido se o valor variar um mês (conta de energia, por exemplo) |

### Achado ajustando o Diário, não bug — decisão de design revista

`ORIGENS_EDITAVEIS` só tinha `manual`/`extrato`; `recorrente` ficaria travado do mesmo jeito
que `abertura`/`encerramento_mes`, mas não deveria: não é uma marca estrutural, é só um
lançamento que nasceu sozinho. Corrigido antes de qualquer relato, testado editando o
lançamento gerado (abriu no formulário com os valores certos, R$400/R$400).

### Verificado no navegador contra o banco real

Negócio de teste "Padaria Teste Recorrentes": cadastrei o template "Aluguel" (D Aluguel
R$400, C Caixa R$400), cliquei "Gerar lançamentos do mês" — 1 lançamento criado, a prateleira
passou a mostrar "faltou R$400,00 este mês". Cliquei "Gerar" de novo — "Nada para gerar: já
foi feito este mês", confirmado por SQL que só existe 1 lançamento com `origem='recorrente'`
e `documento` apontando pro id do template certo. Editei o lançamento gerado — abriu certo no
formulário. Desativei o template — persistiu `ativa:false`. Negócio de teste apagado depois,
zero linhas órfãs. `npm test`: 67/67 passando.

---

## ✅ Painel do Mês (13/ago)

Implementa docs/04_MAPA_DO_APP.md §3 — o gargalo nº 2 (docs/03 §5.1): "quem mandou e quem não
mandou", de todos os clientes ao mesmo tempo. Acessível da prateleira.

| Arquivo | O que é |
|---|---|
| `src/dominio/painelDoMes.mjs` (novo) | `statusDoMes`/`montarPainelDoMes`/`mensagemCobranca` — funções puras |
| `src/dados/painelDoMes.mjs` (novo) | 3 consultas (negócios, entrada_itens do mês, períodos fechados), sem `negocio_id` explícito — a RLS já limita aos negócios do Luan, então agrupar em memória é mais barato que N idas ao banco por cliente |
| `tests/painelDoMes.test.mjs` (novo) | 10 testes — inclui a ordenação (quem falta primeiro) e singular/plural da mensagem |
| `src/telas/PainelDoMes.jsx` (novo) | lista ordenada por urgência, botão "Copiar mensagem" (clipboard) só para quem falta algo |
| `src/app/App.jsx`, `src/telas/Negocios.jsx` | rota nova + botão na prateleira |

### O sinal de "mandou" que existe de verdade, sem inventar granularidade

O mockup do doc mostra pendência específica ("extrato de julho, notas da semana 3") — isso
exigiria uma lista de "o que se espera receber" que não existe no modelo (docs/06). Em vez de
inventar esse dado, o painel usa o sinal real: quantos itens chegaram na Caixa de Entrada
este mês, e quantos ainda esperam decisão (`pendente`/`duvida`). Menos detalhado que o
mockup, mas verdadeiro — e já resolve o gargalo (saber QUEM cobrar).

### Verificado no navegador contra o banco real

Três negócios de teste: "Nanda" sem nenhum item este mês (`falta: TUDO`), "Léia" com 2 itens
pendentes de 3 (`falta: 2 itens por classificar`), "Zé" com tudo resolvido (`falta: NADA —
pronto pra fechar`). O painel ordenou certo (nada → faltando → pronto), e "Copiar mensagem"
escreveu no clipboard sem erro (confirmado pela UI mudando para "Copiado" — leitura do
clipboard fica bloqueada por permissão do navegador nesta configuração de teste, mas a
escrita não lançou exceção, que é o que o usuário real vê). Negócios de teste apagados
depois, zero linhas órfãs. `npm test`: 77/77 passando.

---

## ✅ Achados — anomalias na Revisão (13/ago)

Implementa docs/04_MAPA_DO_APP.md §7: "o sistema aponta o que destoa: despesa muito fora do
padrão do cliente, mês sem nenhum movimento, receita registrada sem dinheiro entrando em
lugar nenhum". Três checagens, todas recalculadas da fonte (mesma disciplina da Mesa de
Revisão, docs/dominio/revisao.mjs — nunca de um resumo pronto).

| Arquivo | O que é |
|---|---|
| `src/dominio/achados.mjs` (novo) | `mesesSemMovimento`, `despesasForaDoPadrao`, `receitasSemDinheiro`, `encontrarAchados` — tudo função pura |
| `tests/achados.test.mjs` (novo) | 11 testes |
| `src/telas/Revisao.jsx` | seção "Achados" nova, entre a Mesa e o Fechamento — avisa, mas não bloqueia fechar o mês (é achado, não checklist de integridade) |

### Por que não tem a granularidade do mockup do doc — e por que isso é honesto, não incompleto

O mockup mostra "extrato de julho, notas da semana 3" — exigiria uma lista de "o que se
espera receber" que não existe no modelo (docs/06). Em vez de inventar essa granularidade,
cada checagem usa só o que o banco garante de verdade:
- **mês sem movimento**: gap real entre o primeiro e o último mês com lançamento (não o mês
  corrente em aberto — isso já é o Painel do Mês)
- **despesa fora do padrão**: só roda se existir ao menos 1 mês FECHADO pra comparar (sem
  histórico, lista vazia — silêncio aqui é a resposta certa); compara o mês aberto contra a
  média dos fechados, mesma conta, só quando essa conta já teve gasto histórico
- **receita sem dinheiro**: lançamento com linha de receita cuja contrapartida não é
  caixa/banco/a-receber (maquininha/clientes) — a lista de contas "dinheiro" é fechada
  (baseada no plano de fábrica, docs/06 §7), não adivinha conta customizada que o dono possa
  criar depois no Plano de Contas

### Verificado no navegador contra o banco real

Negócio de teste "Comercio Teste Achados": junho fechado (aluguel R$400, venda R$900), julho
sem NADA lançado de propósito, agosto aberto com aluguel de R$2.000 (5x a média) e um
lançamento estranho creditando venda com contrapartida em Capital do titular (não em
dinheiro). A Revisão acusou os três: "julho de 2026 não tem nenhum lançamento", "Aluguel em
agosto de 2026: R$2.000,00 — bem acima da média de meses fechados (R$400,00)", e a receita
sem dinheiro com a descrição e data certas. A Mesa de Revisão continuou passando em tudo
(equação fecha) — achado é aviso, não bloqueio. Negócio de teste apagado depois, zero linhas
órfãs. `npm test`: 88/88 passando.

---

## ✅ Carta de recomendações (13/ago)

Implementa docs/04_MAPA_DO_APP.md §9 e docs/08_DIFERENCIAL.md §4 — inclusive o campo
"recomendação seguida?" desde já, porque §4 é explícito: "histórico não se cria
retroativamente — ou se guarda desde o primeiro mês, ou aquela conversa do ano 2 nunca vai
existir". Vive dentro da aba Entregas (RetratoDoMes), por mês.

| Arquivo | O que é |
|---|---|
| `supabase/migrations/0009_cartas.sql` | tabela `cartas` (negocio_id, mes, texto, seguida) — chave é o próprio `mes`, sem id sintético, mesmo raciocínio de `periodos_fechados`; `aplicar_lote` reescrito de novo com a tabela na lista branca |
| `src/dados/sinc.mjs` | coleção `cartas` com `chaveCampo: "mes"` |
| `src/dominio/cartas.mjs` (novo) | `cartaPendenteDeAvaliacao` — acha a carta mais recente antes do mês atual que tem texto e ainda não foi avaliada |
| `tests/cartas.test.mjs` (novo) | 6 testes |
| `src/telas/RetratoDoMes.jsx` | seção nova: textarea da carta do mês em vista + prompt "foi seguida?" (Sim/Não) sobre a carta pendente, quando existe |
| `src/telas/Livro.jsx` | `salvarCarta`/`avaliarCartaSeguida` — **fora** da trava de mês fechado de propósito: carta é escrita DEPOIS de fechar, na etapa de Entregas, não é fato contábil |

### Verificado no navegador contra o banco real

Negócio de teste "Loja Teste Cartas": julho fechado com uma carta já escrita ("Trocar de
fornecedor para baixar o CMV", `seguida: null`), agosto aberto com movimento. Abrindo agosto,
o prompt apareceu certo ("A recomendação de julho de 2026 foi seguida?" com o texto entre
aspas) — cliquei "Sim", prompt sumiu, confirmado por SQL que `seguida` virou `true` sem tocar
no texto. Escrevi e salvei uma carta nova pra agosto — persistiu com `seguida: null` (ainda
não é hora de avaliar essa). Negócio de teste apagado depois, zero linhas órfãs (incluindo a
tabela `cartas`). `npm test`: 94/94 passando.

---

## ✅ Baixa de recebível/pagável específica (13/ago)

Implementa docs/08_DIFERENCIAL.md §2 — o ganho de precisão registrado desde a primeira versão
de `disponivel.mjs`: em vez de só confiar no saldo agregado de Clientes/Fornecedores pra saber
se "a receber em 30 dias" já foi pago, agora liga o pagamento à fatura específica.

| Arquivo | O que é |
|---|---|
| `supabase/migrations/0010_baixa_de.sql` | `lancamento_linhas.baixa_de` — FK auto-referente (aponta pra outra linha do mesmo negócio), guarda qual pagamento quitou qual fatura |
| `src/dados/sinc.mjs` | `baixaDe` no `campos` de `lancamentoLinhas` |
| `src/dominio/baixas.mjs` (novo) | `recebiveisEmAberto`/`pagaveisEmAberto` (linhas sem baixa ligada) e `construirBaixa` (monta o lançamento de quitação, sempre pelo valor CHEIO — sem baixa parcial nesta versão, registrado no código) |
| `src/dominio/disponivel.mjs` | `quantoPodeTirar` agora exclui linhas já baixadas da soma por vencimento, ANTES do capeamento agregado — pega um caso que o capeamento sozinho não pega (uma dívida antiga fora da janela sustenta o saldo e disfarça uma liquidação dentro da janela) |
| `src/telas/Baixas.jsx` (novo) | duas listas (a receber / a pagar em aberto) com "Dar baixa" inline — escolhe caixa/banco e data |
| `src/telas/Lancar.jsx` | campo de vencimento (opcional) aparece quando a conta da linha é Clientes ou uma das 4 contas de compromisso — antes só o balanço de abertura conseguia setar vencimento; sem isso, "baixa" nunca teria nada pra baixar fora do dia 1 |
| `tests/baixas.test.mjs` (novo) | 8 testes | `tests/disponivel.test.mjs` (+1) | o caso que só a baixa por item resolve |

### Achado ajustando o Lançar, não bug — gap descoberto construindo

`vencimento` só podia ser setado no balanço de abertura (`ClienteNovo.jsx`) — o formulário de
Lançar do dia a dia sempre gravava `vencimento: null`. Uma venda a prazo feita em agosto nunca
teria data de vencimento, e "baixa" ficaria uma tela vazia pra sempre fora da abertura.
Corrigido: campo de vencimento opcional, só aparece quando a conta escolhida é "a receber" ou
"a pagar" (evita poluir toda linha comum de caixa/despesa).

### Verificado no navegador contra o banco real

Negócio de teste "Comercio Teste Baixas": lancei uma venda a prazo (D Clientes R$300, venc.
20/08) — apareceu em "A receber em aberto" com a data certa. Cliquei "Dar baixa" (Caixa,
hoje) — sumiu da lista, e o SQL confirmou o novo lançamento (D Caixa 300 / C Clientes 300)
com `baixa_de` apontando exatamente pro id da linha original. Negócio de teste apagado
depois — o `on delete cascade` de `negocios` limpou a FK auto-referente de `baixa_de` sem
erro, mesmo sendo duas linhas do MESMO negócio se referenciando. `npm test`: 103/103
passando.

⚠️ **Nota de ferramenta, não de app:** durante este teste, `mcp__Claude_Browser__form_input` e
`computer{action:"type"}` não conseguiram commitar valor em `<input type="date">` — só
funcionou setando `.value` via `Object.getOwnPropertyDescriptor` + `dispatchEvent` direto no
DOM. Confirmado que o app reage certo a eventos DOM padrão; a limitação é do driver de
automação do navegador desta sessão, não do código.

---

## ✅ Parâmetros fiscais do MEI 2026, populados com fonte (13/ago)

Fecha o checklist de `07_MEI_O_QUE_SABER.md` §10. Pesquisado via busca na web (Receita
Federal e fontes secundárias cruzadas), gravado em `parametros_fiscais` (`ano = 2026`), 7
chaves: `limite_anual_receita_bruta`, `salario_minimo`, `das_mei`, `prazos`,
`desenquadramento`, `limite_empregados`, `carencia_beneficios` — cada uma com `fonte` e
`conferido_em` preenchidos, nunca hardcoded no código (`06` §6).

⚠️ **Duas ressalvas que ficaram registradas nos próprios dados, não escondidas:**
- `limite_anual_receita_bruta` (R$ 81.000): dois projetos de lei tramitam para aumentá-lo
  (PLP 108/2021, aprovado no Senado, R$ 130 mil; PLP 186/2026, na Câmara desde jun/2026) —
  **nenhum virou lei ainda**. Reconferir antes de repetir esse número a um cliente.
- `desenquadramento`: fonte primária é o Manual do Desenquadramento do SIMEI (Receita
  Federal) — vale abrir o PDF original antes do primeiro caso real.

Ainda em aberto (não é valor único pra guardar em `parametros_fiscais`): a lista de CNAEs
permitidos ao MEI — conferir caso a caso, na hora de cadastrar cada cliente.

---

## ✅ Script de backup semanal (13/ago)

`supabase/backup.mjs` (`npm run backup`) — exporta TODAS as tabelas de dado (via token de
gerenciamento, o mesmo caminho de `conferir.mjs`/`aplicar-migracoes.mjs`, de propósito: um
backup que dependesse do login de um usuário só enxergaria os negócios daquele usuário via
RLS, docs/06 §2) para `backups/contadoria-backup-<timestamp>.json`. Mantém as últimas 12
cópias e apaga o resto sozinho (~3 meses no ritmo semanal — mesmo raciocínio de "teto de
volume" do resto do projeto, docs/03 §6, aplicado a disco). `backups/` está no `.gitignore`:
dado de cliente de verdade nunca vai pro git, mesma regra dos segredos.

Testado ao vivo: rodou, gravou 17 tabelas (a maioria vazia agora, sem cliente real ainda;
`parametros_fiscais` com as 7 chaves recém-populadas, `roteiro_perguntas` com as 29
perguntas seedadas), JSON válido conferido.

**Sugestão de rotina pro Luan:** toda sexta-feira, ou antes de qualquer migração arriscada.

---

## ✅ Token de gerenciamento: decisão tomada (13/ago)

Perguntado ao Luan se revogava agora ou depois — resposta: **manter por enquanto**. Motivo
registrado: o token ainda sustenta `conferir.mjs`, `aplicar-migracoes.mjs` e `backup.mjs`;
revogar agora trocaria a via rápida de mexer no banco por fricção (gerar token novo a cada
sessão) sem ganho real neste momento do projeto. Reconsiderar quando o sistema estiver mais
parado ou perto do primeiro cliente real.

---

## ✅ Confirmação de e-mail testada de ponta a ponta com inbox real (13/ago)

Dois problemas de **infraestrutura** (não de código) apareceram no caminho, achados e
corrigidos antes do teste valer:

1. **O servidor de desenvolvimento (`serve.mjs`) tinha caído** entre uma sessão e outra —
   o Luan não conseguia nem abrir a tela de login. Sem processo nenhum escutando a porta
   8788 (`netstat` confirmou). Corrigido subindo de novo via `preview_start` (criado
   `.claude/launch.json`, que não existia ainda, apontando pra `npm run serve`).
2. **Redirect de confirmação de e-mail mal configurado no Supabase**: `site_url` do projeto
   apontava pra `http://localhost:3000` (porta que nada serve) e `uri_allow_list` estava
   vazia — o app pede `emailRedirectTo: window.location.origin` (`:8788`), mas sem esse
   endereço na lista de permitidos, o link do e-mail provavelmente cairia na porta errada.
   Corrigido via API de gerenciamento (autorizado pelo Luan antes de mexer, por ser
   configuração de conta): `uri_allow_list = "http://localhost:8788/**"`.

Achado também, sem custo de correção: **o projeto usa o e-mail padrão do Supabase, sem SMTP
próprio configurado** (`smtp_host` vazio) — funciona, mas com limite de 2 e-mails/hora. Não é
problema para uso pessoal/teste; **vale revisitar antes de ter clientes reais** mandando
e-mail de verdade para eles (confirmação, recuperação de senha) — considerar SMTP próprio se
o volume crescer.

**Teste real, com a caixa de entrada do próprio Luan** (`grluans.09@gmail.com`, não mais o
usuário `contadoria-teste@mailinator.com`): cadastro às 20:56, e-mail de confirmação
recebido e confirmado às 20:57 (menos de 1 minuto), login funcionando às 21:00 — confirmado
direto em `auth.users`. Ciclo completo provado.

---

## ✅ Publicado no Netlify — acesso de qualquer lugar (13/ago)

O Luan perguntou se dava pra acessar do celular além do computador — resposta honesta: só
via Wi-Fi local com o PC ligado rodando `serve.mjs`, porque nada estava publicado na
internet ainda. Resolvido publicando `dist/` (site 100% estático, dependências via CDN —
sem passo de build no servidor) no Netlify.

**Site:** https://contadoria-luan.netlify.app — acessível de qualquer dispositivo, qualquer
rede, sem depender do computador do Luan ligado.

| O que | Como |
|---|---|
| Conta Netlify | criada pelo Luan (login GitHub) — nunca por mim, mesma regra de sempre |
| Token de acesso pessoal | gerado pelo Luan, guardado em `netlify/.access-token` (gitignored, mesmo padrão do token do Supabase) |
| Site | `contadoria-luan` (projeto `9843ac09-e6a6-44a8-bab5-3bafcd515dd8`), criado via `netlify sites:create` |
| Deploy | **manual, via CLI** (`npm run publicar` → `scripts/publicar.mjs`) — **não é deploy contínuo ligado ao GitHub.** Push no git NÃO republica sozinho; precisa rodar `npm run build && npm run bump && npm run publicar` toda vez que algo for pra produção |
| Redirect de e-mail | `uri_allow_list` do Supabase Auth ganhou `https://contadoria-luan.netlify.app/**` (mesma correção do localhost, agora pra produção) |

Também foi preciso enviar pro GitHub 8 commits que estavam só locais (todo o trabalho desta
sessão) — `git push origin main`, conferido sem segredo no diff antes de enviar.

Verificado no navegador: a URL de produção carrega a tela de login normalmente, sem erro no
console.

⚠️ **Registrar para a próxima sessão:** publicar não é automático. Se mexer no código e
esquecer de rodar `npm run publicar`, o site publicado fica desatualizado enquanto o `git`
já tem a mudança nova — os dois podem divergir silenciosamente.

---

## ✅ Manual de Operação e Go-to-Market, em PDF (13/ago)

O Luan decidiu focar na Contadoria e deixar o ContLife de lado por ora ("esse tem mais chance
de me dar renda mais rápido"), e pediu material completo: o que o sistema entrega, como usar,
qual o público, como vender, quanto cobrar. Escrito como **Markdown em `docs/` + gerador de
PDF** — a fonte da verdade é o texto, o PDF é só uma saída, e regenerar é um comando.

| Arquivo | O que é |
|---|---|
| `docs/10_MANUAL_DE_OPERACAO.md` | operação: os 4 públicos, as 3 gavetas de entrega, o limite profissional, o sistema tela por tela, o ciclo do mês, cliente novo passo a passo, contabilidade na prática (os 10 lançamentos que cobrem 90% de um MEI), manutenção, trilha de estudo |
| `docs/11_GO_TO_MARKET.md` | vendas: o achado de mercado, os 4 segmentos com pitch e preço, o Diagnóstico Gratuito, preço em 3 degraus, canais em ordem de eficácia, scripts, objeções, o combinado, métricas, plano de 90 dias, riscos |
| `scripts/gerar-pdf.mjs` | `npm run pdf` — Markdown para PDF em JS puro (pdfkit), capa preta e ouro, miolo marfim |
| `pdf/*.pdf` | a saída: 19 e 18 páginas |

### O achado de mercado que sustenta o go-to-market

Pesquisado, não suposto: **a Agilize declara não atender MEI** e a Contabilizei parte de
R$ 195/mês focada em ME. O contador tradicional cobra R$ 50–200 entregando basicamente a guia
do DAS. **O MEI está desatendido pelos dois lados** — porque a LC 128/2008 o dispensou de
contador, e o mercado inteiro é construído para vender conformidade. Sem conformidade a
vender, ninguém atende. Essa é a brecha: não vender contabilidade, vender clareza.

Isso mudou a estrutura de preço proposta: R$ 120 / **R$ 180** / R$ 320 em três degraus (o do
meio é o alvo), ancorada em valor — não competindo com o contador de R$ 60, que entrega outra
coisa.

### Dois bugs de renderização pegos conferindo o PDF gerado

Não bastava gerar — extraí o texto de volta do PDF (descompactando os streams e decodificando
os operadores `TJ`) para conferir o que saiu de verdade:

1. **Setas sumindo:** `→` não existe no WinAnsiEncoding e estava sendo removida pelo filtro de
   emoji — "Caixa de Entrada → Revisão" virava "Caixa de Entrada  Revisão", perdendo a
   instrução. Corrigido mapeando para `->`.
2. **Equação contábil quebrada:** o menos de `Ativo = Passivo + PL + Receita − Despesa` era
   U+2212 (sinal de menos matemático), fora do WinAnsi — saía como caractere de controle no
   meio da fórmula. Corrigido mapeando para hífen comum.

Lição registrada no código: símbolo que **carrega sentido** precisa de equivalente, não de
remoção. Só emoji decorativo pode sumir.

Também corrigido de passagem: `serve.mjs` não conhecia `.pdf` e servia como download.

---

## ➡️ Próxima tarefa

> Esta seção ficou parada em 13/ago. Desde então (14/ago) o projeto passou pelos
> arquétipos de negócio, dinheiro misturado, roteiro adaptativo, formulário público,
> fluxo de caixa projetado, hora do dono e retrato de entrada — tudo isso está
> registrado em [`DECISOES.md`](DECISOES.md), não repetido aqui (é a fonte de verdade
> do que vale hoje; este arquivo é só o diário cronológico, e reescrevê-lo por inteiro
> é trabalho da Fase 8, ainda não feita).

**Concluído em 14/ago:** Fase 5 do plano — o Bloco 4 do Roteiro do Cliente Novo (`ClienteNovo.jsx`)
deixou de jogar fora "quais contas você paga todo mês": agora é uma lista estruturada
(`BlocoContasFixas`) que cria `recorrentes` + `recorrente_linhas` de verdade, reaproveitando
o mesmo desenho cabeçalho+linhas já usado pela aba Recorrentes — é o que faz o segundo mês do
cliente ser rápido. Build limpo, 189 testes passando, bundle carregado e conferido no navegador
sem erro (login/rendering); o clique-a-clique do Bloco 4 em si não foi exercido ao vivo — mesma
limitação de sessão/login já registrada para o Retrato de Entrada.

**Pendente, na ordem do plano** (`docs/DECISOES.md` e a lista de tarefas têm o detalhe de cada uma):
- Fase 6 — aba Roteiro no Livro (aprofundamento pendente, editável a qualquer momento) + aviso nas Entregas
- Fase 7 — achados que revelam a dor invisível (retirada acima do resultado, mercadoria parada com terceiro, taxa engolindo margem, sem receita no período)
- Fase 8 — reescrever (substituindo, não acumulando) docs/10, docs/11, docs/05 §4, docs/06, regenerar PDF, `build && bump && publicar`
- Fase 11 — memória do cliente (linha do tempo)

O que resta é rotina, não tarefa:
- Reconferir `parametros_fiscais` todo janeiro (salário mínimo muda, DAS sobe) e antes do
  primeiro cliente real (os dois PLPs de aumento do teto do MEI ainda não são lei)
- Rodar `npm run backup` semanalmente (ou antes de qualquer migração arriscada)
- Lembrar de subir `serve.mjs` (ou `preview_start`) no início de cada sessão de trabalho de
  DESENVOLVIMENTO — ele não fica rodando sozinho entre uma sessão e outra (isso é diferente
  do site publicado no Netlify, que fica no ar sozinho, sem precisar de PC ligado)
- Depois de qualquer mudança de código que deva valer em produção: `npm run build && npm
  run bump && npm run publicar` — nenhum desses passos acontece sozinho

**Modelo:** alvo claro, segue em **Sonnet**.
