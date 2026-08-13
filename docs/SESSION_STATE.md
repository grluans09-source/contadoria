# Estado da sessão

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

## ➡️ Próxima tarefa — o que falta do `04_MAPA_DO_APP.md` §12

O núcleo contábil está de pé e provado: schema, trava, sincronização, onboarding, livro,
Caixa de Entrada, Revisão, Fechamento e Entregas. O que falta:

1. **Painel do Mês** (`04` §3) — só faz sentido com mais de 1 cliente real usando
2. **Recorrentes** — peça futura sinalizada no passo 5 (Bloco 4 do Roteiro captura como
   texto livre por enquanto); sem tabela própria ainda
3. **Achados/anomalias** (`04` §7) — deliberadamente adiado: exige histórico de meses para
   ter uma média com que comparar, e ainda não existe cliente real com histórico
4. **Baixa de recebível/pagável** — ligar um pagamento à origem específica (docs/08
   §2, registrado como próximo ganho de precisão do "quanto você pode tirar")
5. **Carta de recomendações** (`04` §9) — texto livre por enquanto; a UI de captura ainda
   não existe

⚠️ **Antes do primeiro cliente real** (não bloqueia o código agora): o script de exportação
semanal (lacuna 1, acima).

### Duas conferências obrigatórias

⚠️ **O token de gerenciamento (`sbp_...`) segue ativo** — pedido ao Luan revogar. Não é mais
necessário para nada do que vem a seguir.

⚠️ **Antes do primeiro cliente real:** conferir na legislação vigente o limite anual do MEI
(e a regra de proporcionalidade no 1º ano), o valor e a composição do DAS, e os prazos. Os
valores vivem em `parametros_fiscais`, com fonte e data — **nunca no código** (`06` §6).

**Modelo:** alvo claro, segue em **Sonnet**.
