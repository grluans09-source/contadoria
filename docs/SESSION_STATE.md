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

**O passo 4 também está concluído e verificado no navegador de verdade** (não só compilado):
login, cadastro de negócio via `criar_negocio()`, e a prateleira.

**O passo 5 está concluído e verificado com o teste mais completo até aqui:** o Roteiro do
Cliente Novo inteiro (6 blocos) rodado ponta a ponta no navegador, terminando num balanço de
abertura real de 6 linhas gravado pela trava de equilíbrio — débitos e créditos batendo em
R$ 4.810,00, capital do titular calculado certo (R$ 4.010,00). Ver a seção própria abaixo.

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

## ➡️ Próxima tarefa — passo 6 do `06` §13: o Livro (Lançar, Diário, Razão, Balancete)

Substituir o placeholder `DentroDoNegocio` (em `src/app/App.jsx`) pela tela real — a partir
daqui o negócio tem plano de contas e saldo inicial de verdade para exercitar:

1. Carregar o estado do negócio (contas + lançamentos + linhas) via `montarEstado` do motor
   de sincronização — primeira vez que ele roda de ponta a ponta, não só em teste
2. Telas: Diário (tudo em ordem de data), Razão/razonete (por conta), Balancete (saldos +
   prova de que débito = crédito)
3. Lançar — o formulário de lançamento com N linhas, reaproveitando a lógica de
   `aberturaBalanco.mjs` como referência de como montar `ops` para `aplicar_lote`
4. A partir daqui, considerar migrar do "chamar `aplicar_lote` direto no clique" (como o
   Roteiro faz) para o padrão do ContLife — `fotoRef` + `calcularDiferenca` + debounce — já
   que o Livro terá edição contínua, não um formulário de uma vez só

⚠️ **Antes do primeiro cliente real** (não bloqueia o código agora): o script de exportação
semanal (lacuna 1, acima).

### Duas conferências obrigatórias

⚠️ **O token de gerenciamento (`sbp_...`) segue ativo** — pedido ao Luan revogar. Não é mais
necessário para nada do passo 6 em diante.

⚠️ **Antes do primeiro cliente real:** conferir na legislação vigente o limite anual do MEI
(e a regra de proporcionalidade no 1º ano), o valor e a composição do DAS, e os prazos. Os
valores vivem em `parametros_fiscais`, com fonte e data — **nunca no código** (`06` §6).

**Modelo:** alvo claro, segue em **Sonnet**.
