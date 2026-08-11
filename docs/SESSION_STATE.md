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
| `docs/02_ESCOPO.md` | **novo (11/ago)** — o que o sistema é, decidido com o dono. **Manda mais que o NORTE** onde divergir |
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

1. **Nome do sistema.** Sugestões dadas em 11/ago, nenhuma escolhida. **Marca é território
   do Fable** — vale ele trocar de modelo para essa conversa.
2. **De onde vêm os dados na prática** — WhatsApp é o canal, mas falta saber se haverá
   extrato bancário e em que formato.
3. **Quantos clientes ele espera no primeiro ano** — muda o quanto vale investir na Caixa
   de Entrada.

---

## Próxima tarefa recomendada

1. **Desenhar o modelo de dados** (documento `03`): lançamento com N linhas, plano de contas
   de MEI/serviço, tabela de membros, tabela de parâmetros fiscais com vigência
2. Projeto Supabase novo + schema + RLS + `aplicar_lote` adaptado + testes contra o SQL real
3. Copiar `contlife-sinc.mjs` com `COLECOES` novo + `TelaAutenticacao`
4. **Caixa de Entrada** — é o gargalo real do serviço, vem antes dos relatórios bonitos

⚠️ Antes do primeiro uso real: **conferir o limite anual do MEI e o valor do DAS na
legislação vigente.** Ver `02_ESCOPO.md` §2 — os valores vivem em tabela com vigência, nunca
no código.

**Sugestão de modelo:** o modelo de dados (passo 1) ainda é julgamento — **Opus**. Do passo 2
em diante, alvo claro — **Sonnet**. Nome e marca — **Fable**.
