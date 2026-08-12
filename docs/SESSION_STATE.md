# Estado da sessão

> **Leia este arquivo primeiro, sempre.** Ele existe para a próxima sessão retomar sem ler
> a conversa anterior. Sobrescreva ao encerrar qualquer sessão: o que foi feito, o que ficou
> pendente, a próxima tarefa recomendada, e **o que aguarda decisão do Luan**.

---

## Estado atual — 12/ago/2026

**O projeto Supabase do Contadoria existe e está provado.** Referência `gmiiuklkhwjpcowvjbwz`,
mesma organização do ContLife, região São Paulo. As 4 migrações foram aplicadas no banco
real, conferidas (`conferir.mjs`: 14/14 tabelas, RLS + política + grant em todas), e **a
trava de equilíbrio foi provada com o teste NEGATIVO primeiro** (`testar-equilibrio.mjs`,
rodando contra o banco de verdade, como usuário autenticado — não como admin): lançamento
desequilibrado voltou HTTP 400 e nada ficou gravado; lançamento certo foi aceito; apagar um
lançamento inteiro não acusa falso desequilíbrio. Os passos 1 e 2 do `06` §13 estão
**concluídos e provados**, não só escritos.

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

## ➡️ Próxima tarefa — passo 4 do `06` §13: login + cadastro de negócio

Com o banco provado, o resto vira código de tela, sem depender de mais nenhuma ação fora do
editor:

1. `src/app/main.jsx` + `scripts/bump.mjs` + `serve.mjs` (copiados/adaptados do ContLife —
   `08` §6 já define a estrutura de pastas) — só então `npm run dev` funciona
2. Cliente Supabase + `TelaAutenticacao` (copiada do ContLife, `01` grade A)
3. Tela de cadastro de negócio, chamando `criar_negocio()`
4. **Passo 5:** Roteiro do Cliente Novo (`05` §4) + balanço de abertura (`06` §4) — a
   primeira tela que usa `aplicar_lote` de verdade, com o lançamento de N linhas

⚠️ **Antes do primeiro cliente real** (não bloqueia o código agora): o script de exportação
semanal (lacuna 1, acima).

### Duas conferências obrigatórias

⚠️ **Antes do passo 1:** conferir o limite do plano gratuito do Supabase — o ContLife já
ocupa 1 dos 2 projetos.

⚠️ **Antes do primeiro cliente real:** conferir na legislação vigente o limite anual do MEI
(e a regra de proporcionalidade no 1º ano), o valor e a composição do DAS, e os prazos. Os
valores vivem em `parametros_fiscais`, com fonte e data — **nunca no código** (`06` §6).

**Modelo:** o desenho acabou. Do passo 1 em diante o alvo está claro — **Sonnet**. Voltar ao
Opus só se o desenho precisar mudar.
