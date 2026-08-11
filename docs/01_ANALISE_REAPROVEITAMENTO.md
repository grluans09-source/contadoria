# 01 · Análise de reaproveitamento — o que o ContLife realmente entrega

> **11/ago/2026, em Opus.** Leitura direta do código do ContLife
> (`C:\Users\LUAN S\OneDrive\Documentos\sistema financeio`), não só da documentação dele.
> O `00_NORTE.md` foi escrito de memória, no fim de outra sessão; este documento **confere
> aquele mapa contra o código** e corrige onde ele superestima ou subestima.
>
> **Nenhuma linha de código foi escrita ainda.** As 8 perguntas da seção 6 do NORTE seguem
> abertas.

---

## 1. O que foi lido

| Fonte | Tamanho | Para quê |
|---|---|---|
| `PROJECT_DOCS/30_ONDE_TUDO_ESTA.md` | — | infraestrutura, contas, limites do plano gratuito |
| `PROJECT_DOCS/29_ARQUITETURA_BACKEND.md` | — | schema, RLS, transação, as 5 etapas e os bugs reais |
| `PROJECT_DOCS/08_PADROES.md` | — | convenções e armadilhas técnicas |
| `contlife-sinc.mjs` | 402 linhas | o motor de sincronização, inteiro |
| `supabase/migrations/0003_aplicar_lote.sql` | 143 linhas | a transação, inteira |
| `supabase/migrations/0001_schema_inicial.sql` | 485 linhas | schema e RLS (parte lida) |
| `contlife.jsx` | 10.361 linhas | cabeçalho de arquitetura, motor contábil, primitivas de UI, camada de persistência |

---

## 2. Reaproveitamento — nota por peça

Escala: **A** = copia quase intacto · **B** = copia o padrão, reescreve o conteúdo ·
**C** = serve de referência, não de código · **D** = não serve.

| Peça | Nota | Verificado |
|---|---|---|
| `contlife-sinc.mjs` (motor de diferença) | **A** | ~250 linhas de algoritmo genérico; só a declaração `COLECOES` (~110 linhas) é do ContLife. Zero import de React/DOM/Supabase. |
| `0003_aplicar_lote.sql` (a transação) | **A** | 143 linhas; a única parte de domínio é a lista branca de tabelas (linhas 74-76). `security invoker` + `search_path` fixo + `%I` + `dossier_id` carimbado pelo servidor. |
| `TelaAutenticacao` + `traduzErroAuth` | **A** | ~110 linhas, 4 modos (entrar/criar/link mágico/recuperar), erros do GoTrue em português, testado contra a API real. |
| Disciplina de teste (`tests/sinc.test.mjs`) | **A** | 33 testes; dois conferem o JS **contra o SQL real** (toda coluna tem quem a preencha; nenhuma `not null` recebe null). Pegou 3 bugs reais. |
| Pipeline de build (esbuild + bump + serve) | **A** | funciona, é curto, não tem nada de domínio. |
| RLS por dossiê | **B** | o *padrão* é exatamente o que multiempresa precisa — mas ver §4.2: se mais de uma pessoa acessa o mesmo negócio, a política muda. |
| `balanceOf` · `trialBalance` · `integrityCheck` · `explainEntry` · fechamento · lixeira · trilha | **B** | partida dobrada é partida dobrada. Ver §4.3 sobre o custo de `balanceOf` em volume maior. |
| `LimiteDeErro` | **A** | 43 linhas, sem domínio. |
| Primitivas de UI (`Card`, `Button`, `Input`, `Select`, `Tabs`, `StatCard`…) | **B** | ver §3.1 — valem menos do que o NORTE sugere. |
| Telas estruturais (Balancete, Razonete, DRE, Balanço, DFC, Conciliação, Importar) | **C** | a estrutura serve de referência; o vocabulário e as contas são de vida pessoal. |
| `computeStats`, `analisarFinancas`, `computeParecer`, `computeScore`, `financialAge` | **D** | ver §3.2 — são métricas de vida pessoal, não de negócio. |
| Plano de contas (`seedAccounts`) | **D** | reconhecido no NORTE. |
| Marca, mascotes, paleta, vozes, léxico por plano | **D** | sistema fechado do ContLife. |
| Porta, trial, planos, Sala do Fundador, `tier`/`plan`/`readOnly` | **D** | existe porque o ContLife vai ser vendido. Aqui, peso morto. |
| Arquitetura de arquivo único | **D** | ver §3.3. |

---

## 3. Onde o NORTE precisa de correção

### 3.1 As primitivas de UI valem menos do que parece

O NORTE chama de *"sistema visual inteiro"*. No código, `Card` são 3 linhas, `Input` 8,
`Button` 15, `Tabs` 15, `Select` 12. O valor real **não é o código** — é:

- a **convenção de tema** (Tailwind para layout, `style={{}}` com CSS vars para cor), que
  permite trocar a paleta inteira num lugar só;
- a **calibragem de acessibilidade** já paga: contrastes medidos em WCAG AA, alvo de toque
  mínimo de 40px, `prefers-reduced-motion` global, teclado decimal em campo de dinheiro.

Traduzindo: economiza **~1 dia**, não uma semana. E a paleta em si (obsidiana + ouro) é
marca do ContLife — não vem junto.

### 3.2 O motor contábil transfere pela metade, não inteiro

Conferido em `contlife.jsx`:

- **Transferem:** `balanceOf` (533), `sumType` (546), `trialBalance` (442),
  `integrityCheck` (1790), `explainEntry` (1989). São aritmética de razão — valem em
  qualquer escrituração.
- **Não transferem:** `computeStats` (566) calcula reserva em meses, renda passiva, grau de
  independência financeira, ponto de equilíbrio pessoal. Junto com `computeScore`,
  `financialAge`, `analisarFinancas` e `computeParecer`, é **retrato de vida pessoal**. Um
  lojista quer margem por produto, giro de estoque, prazo médio de recebimento e ponto de
  equilíbrio do negócio — outras contas, outra fórmula.

Vale roubar de `integrityCheck` uma lição, não o código: a versão antiga do teste da equação
patrimonial era **tautológica** (comparava `st.pl` com a fórmula que define `st.pl` — dava
"fecha ✓" com o livro furado em R$ 1.500). A correção recomputa os 5 tipos direto do razão.
**Todo invariante deve ser recalculado da fonte, nunca do resumo.**

### 3.3 O arquivo único é dívida do ContLife — não herde

10.361 linhas num arquivo só. O ContLife chegou lá organicamente e paga o preço a cada
sessão. O esbuild empacota igual com 30 arquivos. **Custo de começar modular: zero. Custo de
desmembrar depois: alto.** Copiar o pipeline: sim. Copiar a convenção de arquivo único: não.

---

## 4. As três decisões caras de desfazer depois

Não são preferências. São escolhas que, erradas, custam uma reescrita.

### 4.1 🔴 Partida binária vs. lançamento com N linhas

O `entries` do ContLife é **binário**: um `debit_id`, um `credit_id`, um `amount`
(`check debit_id <> credit_id`, `check amount > 0`). Toda partida tem exatamente 2 pernas.
Partidas compostas são simuladas agrupando vários lançamentos
(`installment_group`, `card_invoice_payment`).

Isso basta para finança pessoal. **Uma venda de loja com baixa de estoque, não:**

```
D  Clientes / Caixa          150,00     ┐
C  Receita de Vendas         150,00     ├─ um único fato
D  CMV                        90,00     │
C  Estoque                    90,00     ┘
```

São 4 pernas de **um fato só**. Com o modelo binário viram 2 lançamentos que só um marcador
de grupo mantém juntos — e nada no banco impede que um seja apagado sem o outro.

**Recomendação:** cabeçalho (`lancamentos`) + linhas (`lancamento_linhas`), com trava no
banco exigindo soma de débitos = soma de créditos. Custa ~1 dia agora. Retrofit depois
significa reescrever cada leitura, cada relatório e migrar todo dado existente.

### 4.2 🔴 `owner_id` no dossiê vs. tabela de membros

Hoje: `dossiers.owner_id → auth.users(id)`, e toda política de RLS é
`dossier_id in (select id from dossiers where owner_id = auth.uid())`. Um dono, N dossiês.

Isso cobre **"o Luan cuida de vários clientes"** perfeitamente — copia intacto.

**Não cobre "o dono da loja também entra"**: precisaria de `memberships (negocio_id,
user_id, papel)` e de políticas que consultem essa tabela. Retrofit é caro porque toca
**todas** as políticas de **todas** as tabelas de uma vez.

Isto é exatamente a **pergunta 4** (quem digita). É a que eu mais preciso da resposta.

### 4.3 🟡 O teto do "carrega tudo na memória"

O desenho do ContLife carrega **todas** as tabelas no login (paginadas de 1.000) para arrays
em memória, e o motor de diferença compara estado inteiro a cada salvamento. É elegante e
resolveu o problema real dele (esquecer um ponto de mutação faz a ação parar de salvar **em
silêncio**).

Dois limites medidos no código:

1. **Volume.** Finança pessoal: alguns milhares de lançamentos. Uma loja com 3 anos de
   vendas e movimento de estoque passa disso com folga — e o tempo de login cresce linear.
2. **`balanceOf` varre a lista inteira por conta**, e `sumType` chama `balanceOf` por conta:
   custo O(contas × lançamentos) a cada recálculo. Com 22 contas e 2.000 lançamentos é
   instantâneo. Com 80 contas e 40.000, não é.

**Recomendação:** ficar com o motor de diferença (o modo de falha dele é muito melhor), mas
**não jogar tudo dentro dele**. Cadastros e configuração — contas, produtos, clientes,
fornecedores — vão para o estado sincronizado. Coleções que só crescem — lançamentos,
movimento de estoque — carregam **por período** e gravam por RPC transacional própria. O
motor de diferença continua sendo a rede de segurança de tudo que é editável na tela.

---

## 5. Ordem de trabalho proposta (depois das 8 respostas)

| # | Etapa | Depende de |
|---|---|---|
| 0 | Fechar escopo com as 8 respostas | — |
| 1 | Modelo de dados no papel: partida N-linhas, plano de contas de negócio, membros | Q1, Q3, Q4 |
| 2 | Projeto Supabase novo + schema + RLS + `aplicar_lote` adaptado + os testes contra o SQL real | etapa 1, Q8 |
| 3 | Copiar `contlife-sinc.mjs` com `COLECOES` novo + `TelaAutenticacao` | etapa 2 |
| 4 | Escrituração mínima: lançar, razão, balancete, DRE, balanço | etapa 3 |
| 5 | Estoque (se entrar) — comprar → estocar → vender → CMV | Q2 |
| 6 | Impostos e regime | Q3 |

Cada arquivo trazido do ContLife leva no topo o comentário de origem e data (regra 3 do
`CLAUDE.md`).

---

## 6. O que continua aberto

**As 8 perguntas da seção 6 do `00_NORTE.md`.** Nenhuma respondida. As três mais caras de
errar são a **4** (quem digita → §4.2), a **2** (estoque → §4.1) e a **8** (web ou local →
define se há backend).
