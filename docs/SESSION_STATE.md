# Estado da sessão

> **Leia este arquivo primeiro, sempre.** Ele existe para a próxima sessão retomar sem ler
> a conversa anterior. Sobrescreva ao encerrar qualquer sessão: o que foi feito, o que ficou
> pendente, a próxima tarefa recomendada, e **o que aguarda decisão do Luan**.

---

## Estado atual — 11/ago/2026

**Nada foi construído** (ainda sem código, sem banco, sem nome). O projeto tem a
documentação de partida **mais a análise do ContLife**, feita lendo o código de verdade:

| Arquivo | O que é |
|---|---|
| `CLAUDE.md` | disciplina de trabalho herdada do ContLife (lido automaticamente) |
| `docs/00_NORTE.md` | o que é o projeto, mapa de reaproveitamento do ContLife, perguntas em aberto |
| `docs/01_ANALISE_REAPROVEITAMENTO.md` | **novo (11/ago)** — confere o mapa do NORTE contra o código real do ContLife |
| `docs/SESSION_STATE.md` | este arquivo |
| `README.md` | porta de entrada |
| `.gitignore` | já preparado para segredos |

Git iniciado, **sem remoto**.

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

## ⚠️ O que aguarda decisão do Luan

**As 8 perguntas da seção 6 do `00_NORTE.md`** — foram feitas a ele em 11/ago/2026, **ainda
sem resposta**. Elas definem o escopo e travam o código. As três mais caras de errar, agora
com o motivo técnico medido (§4 da análise):

- **Q4 — quem digita?** decide `owner_id` vs. tabela de membros; retrofit toca **todas** as
  políticas de RLS de uma vez
- **Q2 — estoque na primeira versão?** decide partida binária vs. lançamento com N linhas
- **Q8 — web com login ou só no computador dele?** decide se existe backend

---

## Próxima tarefa recomendada

1. **Receber as 8 respostas** (perguntas feitas, aguardando)
2. Propor o modelo de dados: partida com N linhas, plano de contas de negócio, membros
3. Só então: projeto Supabase novo, schema, RLS, `aplicar_lote` adaptado + testes contra o
   SQL real

A ordem de trabalho proposta está na §5 de `docs/01_ANALISE_REAPROVEITAMENTO.md`.

**Sugestão de modelo:** desenho do modelo de dados ainda é julgamento — **Opus**. A partir
da etapa 3 (copiar e adaptar arquivos com alvo claro), **Sonnet** resolve.
