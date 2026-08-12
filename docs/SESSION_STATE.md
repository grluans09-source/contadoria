# Estado da sessão

> **Leia este arquivo primeiro, sempre.** Ele existe para a próxima sessão retomar sem ler
> a conversa anterior. Sobrescreva ao encerrar qualquer sessão: o que foi feito, o que ficou
> pendente, a próxima tarefa recomendada, e **o que aguarda decisão do Luan**.

---

## Estado atual — 11/ago/2026

**Nada foi construído** (sem código, sem banco). Mas o **escopo está fechado** e o sistema
tem nome: **Contadoria**.

| Arquivo | O que é |
|---|---|
| `CLAUDE.md` | disciplina de trabalho herdada do ContLife (lido automaticamente) |
| `docs/00_NORTE.md` | documento de partida. **Histórico** — onde divergir do `02`, o `02` vence |
| `docs/01_ANALISE_REAPROVEITAMENTO.md` | **novo (11/ago)** — confere o mapa do NORTE contra o código real do ContLife |
| `docs/02_ESCOPO.md` | **novo (11/ago)** — o que o sistema é, decidido com o dono |
| `docs/03_CENARIOS_E_CAPACIDADE.md` | **novo (11/ago)** — cenários de dado, quantos clientes cabem, ordem dos gargalos |
| `docs/04_MAPA_DO_APP.md` | **novo (11/ago)** — o sistema por dentro, em linguagem natural. **É o contrato do desenho** |
| `docs/05_ROTEIRO_DO_SERVICO.md` | **novo (11/ago)** — quais dados pedir e por quê, a conversa inicial, o ritmo do mês, o roteiro da entrega. **Também é requisito**: define os campos do cadastro e da abertura |
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

**Nada bloqueia o próximo passo.** As perguntas abertas viraram cenários que o desenho já
cobre (`03` §2): o sistema atende cliente com extrato, com conta misturada e cliente que só
manda áudio — e o **pior cenário é o alvo padrão**.

Fica em aberto, para ser respondido pela realidade e não por suposição:

- **Captação, precificação, quantos clientes de verdade.** O dono quer discutir isso à
  parte. Estimativa da IA em `03` §4: teto de 15-20 atendidos com o sistema (6-8 na
  planilha), mas 4-10 conquistados no ano 1 — **a venda é o gargalo, não a capacidade.**
  Conferir depois dos 3 primeiros clientes e corrigir o `03`.

---

## 🔎 Três buracos achados em 11/ago (a pergunta do balanço patrimonial os revelou)

Nenhum estava no desenho. **Os três precisam ser resolvidos DENTRO do documento `05`
(modelo de dados)** — não são detalhe de tela, mudam a estrutura.

1. **Regime: caixa ou competência?** O relatório do MEI é preenchido pelo que **entrou** no
   mês (caixa), mas "quanto o negócio ganhou" costuma ser competência. Se os dois números
   forem apresentados sem distinção, o cliente vê contradição. E **contas a receber só
   existem sob competência** — ou seja, isto decide se aquela parte do balanço existe.
   *Encaminhamento provável: escriturar por competência e derivar a visão de caixa, que é o
   que o ContLife já faz com `compDate`.*
2. **Saldos iniciais.** Todo cliente chega **no meio da vida** — já opera há 2 anos. Precisa
   de um **balanço de abertura**: o que ele tem, o que deve, e o resto é dele. Sem isso o
   livro começa desequilibrado e a Mesa de Revisão acusa erro para sempre. É a primeira
   coisa que acontece com todo cliente e não estava desenhada.
3. **Virada de ano.** O limite de faturamento do MEI zera em 1º de janeiro e a DASN cobre o
   ano fechado. Precisa de um encerramento de exercício que jogue o resultado para o
   patrimônio líquido e reinicie a contagem. O ContLife tem fechamento de **mês**; **ano**
   é peça nova.

---

## Próxima tarefa recomendada

1. **Desenhar o modelo de dados** (documento `06`): lançamento com N linhas, plano de contas
   de MEI/serviço, tabela de membros, tabela de parâmetros fiscais com vigência, **os três
   buracos acima**, e os campos que o `05` §4 exige do cadastro e da abertura
2. Projeto Supabase novo + schema + RLS + `aplicar_lote` adaptado + testes contra o SQL real
3. Copiar `contlife-sinc.mjs` com `COLECOES` novo + `TelaAutenticacao`
4. Seguir a ordem de construção do `04_MAPA_DO_APP.md` §12, **com uma correção do `05` §7**:
   a tela guiada de cadastro + balanço de abertura sobe de prioridade — é a primeira coisa
   que acontece com todo cliente, e sem ela o livro nasce torto

⚠️ Antes do primeiro uso real: **conferir o limite anual do MEI e o valor do DAS na
legislação vigente.** Ver `02_ESCOPO.md` §2 — os valores vivem em tabela com vigência, nunca
no código.

**Sugestão de modelo:** o modelo de dados (passo 1) ainda é julgamento — **Opus**. Do passo 2
em diante, alvo claro — **Sonnet**.
