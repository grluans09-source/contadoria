-- ============================================================
-- CONTADORIA — Esquema inicial
-- Desenho: docs/06_MODELO_DE_DADOS.md
--
-- Rodar UMA VEZ, no projeto Supabase do Contadoria (separado do ContLife).
--
-- CONVENÇÕES (herdadas do ContLife, docs/01 §grade A)
--  · `id` das linhas de dado geradas no cliente é TEXT (uid()), não UUID
--    do banco — evita reescrever referência entre lançamento e conta.
--  · Tudo escopado por `negocio_id` (não por user_id): é a tabela
--    `membros` que decide quem enxerga o quê (§2 do doc 06).
--  · Nomes de coluna em snake_case; o app converte na camada de sincronização.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. NEGÓCIOS — a raiz de tudo. Um por cliente do Luan.
-- ─────────────────────────────────────────────────────────────
create table if not exists negocios (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  apelido            text,
  tipo               text not null default 'mei' check (tipo in ('mei', 'informal')),
  cnpj               text,
  data_abertura      date,          -- decide a proporcionalidade do limite no 1º ano (doc 07 §4)
  atividade          text,          -- decide ICMS/ISS no DAS e a coluna do relatório mensal
  tem_funcionario    boolean not null default false,
  whatsapp           text,
  situacao           text not null default 'ativo' check (situacao in ('ativo', 'encerrado')),
  inicio_do_servico  date,          -- data do balanço de abertura (doc 06 §4)
  configuracao       jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. MEMBROS — quem pode ver e mexer em cada negócio.
--
-- Decisão registrada em docs/06 §2: nasce desde o dia 1, mesmo com uma
-- linha só (o Luan, papel `contador`). Adiar isso trocaria a fechadura de
-- todas as portas ao mesmo tempo, depois — ver docs/01 §4.2.
-- ─────────────────────────────────────────────────────────────
create table if not exists membros (
  negocio_id uuid not null references negocios(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  papel      text not null check (papel in ('contador', 'cliente')),
  criado_em  timestamptz not null default now(),
  primary key (negocio_id, user_id)
);

create index if not exists membros_user_idx on membros(user_id);

-- ─────────────────────────────────────────────────────────────
-- Função auxiliar de RLS — evita subconsulta recursiva direto em
-- `membros` dentro da própria política de `membros` (armadilha comum de
-- RLS auto-referente). `security definer` + `search_path` fixo pela
-- mesma razão do gatilho do ContLife (PROJECT_DOCS/29 §8.4): sem isso,
-- referência não-qualificada a `membros` pode não resolver em todo
-- contexto de chamada.
-- ─────────────────────────────────────────────────────────────
create or replace function meu_papel(p_negocio uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select papel from membros where negocio_id = p_negocio and user_id = auth.uid();
$$;

comment on function meu_papel(uuid) is
  'Papel do usuário atual num negócio, ou null se não for membro. Base de toda política de RLS deste banco.';

-- ─────────────────────────────────────────────────────────────
-- RPC de criação — resolve o problema do "ovo e da galinha": a primeira
-- linha de `membros` de um negócio não pode ser inserida por uma política
-- de RLS que exige já ser `contador` daquele negócio. `security definer`
-- roda com o dono da função (bypassa RLS só aqui dentro), exatamente como
-- o `criar_dossie_do_novo_usuario` do ContLife — mas aqui é chamada pelo
-- app ao cadastrar cliente novo, não por gatilho de signup: negócio não
-- nasce automaticamente quando alguém cria conta.
-- ─────────────────────────────────────────────────────────────
create or replace function criar_negocio(p_nome text, p_apelido text default null, p_tipo text default 'mei')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into negocios (nome, apelido, tipo) values (p_nome, p_apelido, p_tipo) returning id into v_id;
  insert into membros (negocio_id, user_id, papel) values (v_id, auth.uid(), 'contador');
  return v_id;
end;
$$;

comment on function criar_negocio(text, text, text) is
  'Cria um negócio e já grava quem chamou como contador dele, numa transação só.';

-- ─────────────────────────────────────────────────────────────
-- 3. PLANO DE CONTAS — por negócio. O modelo de fábrica (docs/06 §7) é
--    inserido pelo APP na primeira carga, não por esta migração — mesmo
--    padrão do `seedAccounts()` do ContLife, para poder editar sem SQL.
-- ─────────────────────────────────────────────────────────────
create table if not exists contas (
  negocio_id uuid not null references negocios(id) on delete cascade,
  id         text not null,
  codigo     text not null,
  nome       text not null,
  tipo       text not null check (tipo in ('ativo', 'passivo', 'pl', 'receita', 'despesa')),
  subtipo    text,
  ordem      int not null default 0,
  ativa      boolean not null default true,
  primary key (negocio_id, id)
);

-- ─────────────────────────────────────────────────────────────
-- 4. LANÇAMENTOS — o cabeçalho do fato. docs/06 §1: a decisão mais cara
--    de desfazer depois. Uma venda com baixa de estoque tem 4 pernas num
--    fato só; o binário do ContLife (um débito, um crédito) não serve.
-- ─────────────────────────────────────────────────────────────
create table if not exists lancamentos (
  negocio_id       uuid not null references negocios(id) on delete cascade,
  id               text not null,
  data             date not null,
  data_competencia date,           -- nasce igual a `data`; só diverge quando o fato é de outro mês
  descricao        text not null default '',
  origem           text not null default 'manual'
                     check (origem in ('manual', 'extrato', 'recorrente', 'abertura',
                                        'encerramento_mes', 'encerramento_ano')),
  documento        text,           -- referência livre: nº de nota, código do extrato etc.
  criado_em        timestamptz not null default now(),
  -- `default auth.uid()`, não coluna que o cliente preenche: o motor de
  -- sincronização (src/dados/sinc.mjs) de propósito NÃO lista `criadoPor`
  -- em COLECOES.lancamentos.campos, então a coluna nunca entra no payload
  -- do lote — e por estar OMITIDA (não null explícito), o padrão da
  -- coluna vale. Mesma lição do ContLife: padrão do banco só se aplica a
  -- coluna omitida, nunca a null mandado de propósito.
  criado_por       uuid not null default auth.uid() references auth.users(id),
  primary key (negocio_id, id)
);

-- ─────────────────────────────────────────────────────────────
-- 5. LANÇAMENTO_LINHAS — as pernas do fato. N por lançamento.
--
-- A FK composta (negocio_id, lancamento_id) garante que uma linha nunca
-- aponte para o cabeçalho de OUTRO negócio — sem isso seria preciso um
-- gatilho à parte só para essa checagem.
--
-- `deferrable initially deferred` nas duas FKs (como no ContLife): a
-- ordem das operações dentro de um lote não importa — uma linha pode
-- chegar antes do cabeçalho ou da conta que referencia, desde que os
-- dois estejam no mesmo lote/transação.
-- ─────────────────────────────────────────────────────────────
create table if not exists lancamento_linhas (
  negocio_id     uuid not null references negocios(id) on delete cascade,
  id             text not null,
  lancamento_id  text not null,
  conta_id       text not null,
  tipo           text not null check (tipo in ('D', 'C')),
  valor          numeric(14,2) not null check (valor > 0),
  primary key (negocio_id, id),
  constraint fk_lancamento foreign key (negocio_id, lancamento_id) references lancamentos(negocio_id, id) on delete cascade deferrable initially deferred,
  constraint fk_conta foreign key (negocio_id, conta_id) references contas(negocio_id, id) deferrable initially deferred
);

create index if not exists lancamento_linhas_lancamento_idx on lancamento_linhas(negocio_id, lancamento_id);

-- ─────────────────────────────────────────────────────────────
-- 6. PERÍODOS FECHADOS — mês e ano (docs/06 §5, resolve o buraco nº 3).
-- ─────────────────────────────────────────────────────────────
create table if not exists periodos_fechados (
  negocio_id uuid not null references negocios(id) on delete cascade,
  tipo       text not null check (tipo in ('mes', 'ano')),
  periodo    text not null,        -- "2026-07" ou "2026"
  fechado_em timestamptz not null default now(),
  primary key (negocio_id, tipo, periodo)
);

-- ─────────────────────────────────────────────────────────────
-- 7. CAIXA DE ENTRADA — o gargalo real do serviço (docs/04 §5).
-- ─────────────────────────────────────────────────────────────
create table if not exists entrada_itens (
  negocio_id      uuid not null references negocios(id) on delete cascade,
  id              text not null,
  origem          text not null check (origem in ('extrato', 'planilha', 'foto', 'texto')),
  data            date,
  descricao_bruta text not null default '',
  valor           numeric(14,2),
  situacao        text not null default 'pendente'
                    check (situacao in ('pendente', 'classificado', 'pessoal', 'duvida')),
  lancamento_id   text,            -- preenchido quando vira lançamento
  criado_em       timestamptz not null default now(),
  primary key (negocio_id, id),
  constraint fk_lancamento_origem foreign key (negocio_id, lancamento_id) references lancamentos(negocio_id, id) deferrable initially deferred
);

-- ─────────────────────────────────────────────────────────────
-- 8. REGRAS DE CLASSIFICAÇÃO — o aprendizado da Caixa de Entrada
--    (docs/06 §8). Por negócio: "MERCADO" pode ser insumo num cliente e
--    despesa pessoal em outro.
-- ─────────────────────────────────────────────────────────────
create table if not exists regras_classificacao (
  negocio_id     uuid not null references negocios(id) on delete cascade,
  id             text not null,
  padrao         text not null,
  conta_id       text,
  acertos        int not null default 1,
  atualizado_em  timestamptz not null default now(),
  primary key (negocio_id, id)
);

-- ─────────────────────────────────────────────────────────────
-- 9. O ROTEIRO — perguntas editáveis, não texto no código (docs/05 §1 e
--    §7, docs/06 §9). GLOBAL (não por negócio): é o ofício acumulado do
--    Luan, o mesmo roteiro serve para todo cliente novo.
-- ─────────────────────────────────────────────────────────────
create table if not exists roteiro_perguntas (
  id              uuid primary key default gen_random_uuid(),
  bloco           int not null,
  ordem           int not null,
  pergunta        text not null,
  porque_importa  text not null default '',
  tipo_resposta   text not null default 'texto',
  destino         text,            -- para onde a resposta vai: campo, conta de abertura, recorrente
  ativo           boolean not null default true
);

create table if not exists roteiro_respostas (
  negocio_id    uuid not null references negocios(id) on delete cascade,
  pergunta_id   uuid not null references roteiro_perguntas(id),
  resposta      text,
  respondido_em timestamptz not null default now(),
  primary key (negocio_id, pergunta_id)
);

-- ─────────────────────────────────────────────────────────────
-- 10. REVISÃO E RASTRO (docs/06 §10) — copiados do ContLife, adaptados.
-- ─────────────────────────────────────────────────────────────
create table if not exists trilha (
  id         bigserial primary key,
  negocio_id uuid not null references negocios(id) on delete cascade,
  tipo       text not null default '',
  descricao  text not null default '',
  criado_em  timestamptz not null default now()
);

create index if not exists trilha_negocio_idx on trilha(negocio_id);

create table if not exists lixeira (
  negocio_id    uuid not null references negocios(id) on delete cascade,
  lancamento_id text not null,
  conteudo      jsonb not null,     -- o lançamento + linhas inteiros, para restaurar
  excluido_em   timestamptz not null default now(),
  primary key (negocio_id, lancamento_id)
);

create table if not exists conciliacoes (
  negocio_id    uuid not null references negocios(id) on delete cascade,
  lancamento_id text not null,
  conferido_em  timestamptz not null default now(),
  primary key (negocio_id, lancamento_id)
);

-- ─────────────────────────────────────────────────────────────
-- 11. PARÂMETROS FISCAIS — nunca no código (docs/06 §6, docs/07).
--     GLOBAL: limite do MEI, DAS etc. não mudam por cliente.
-- ─────────────────────────────────────────────────────────────
create table if not exists parametros_fiscais (
  ano           int not null,
  chave         text not null,
  valor         jsonb not null,
  fonte         text not null,
  conferido_em  date not null,
  primary key (ano, chave)
);

-- ============================================================
-- ROW LEVEL SECURITY
--
-- Uma política de LEITURA (qualquer membro) e três de ESCRITA (só
-- `contador`) por tabela de dado — docs/06 §2: "escrita restrita ao
-- papel". Isso já deixa pronta a v2 (portal do cliente, leitura), sem
-- precisar tocar em política nenhuma quando ela existir.
-- ============================================================

alter table negocios enable row level security;
create policy "membro le o negocio" on negocios for select
  using (meu_papel(id) is not null);
create policy "contador atualiza o negocio" on negocios for update
  using (meu_papel(id) = 'contador') with check (meu_papel(id) = 'contador');
-- Sem policy de INSERT direto: negócio só nasce via `criar_negocio()` (security definer).
-- Sem policy de DELETE: encerrar é `situacao = 'encerrado'`, nunca apagar linha de negócio.

alter table membros enable row level security;
create policy "ve seus vinculos" on membros for select
  using (meu_papel(negocio_id) is not null);
create policy "contador adiciona membro" on membros for insert
  with check (meu_papel(negocio_id) = 'contador');
create policy "contador remove membro" on membros for delete
  using (meu_papel(negocio_id) = 'contador');

-- Macro repetida para as tabelas de dado por negócio: leitura para
-- qualquer membro, escrita só para `contador`.
create policy "membro le" on contas for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on contas for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on contas for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on contas for delete using (meu_papel(negocio_id) = 'contador');
alter table contas enable row level security;

create policy "membro le" on lancamentos for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on lancamentos for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on lancamentos for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on lancamentos for delete using (meu_papel(negocio_id) = 'contador');
alter table lancamentos enable row level security;

create policy "membro le" on lancamento_linhas for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on lancamento_linhas for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on lancamento_linhas for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on lancamento_linhas for delete using (meu_papel(negocio_id) = 'contador');
alter table lancamento_linhas enable row level security;

create policy "membro le" on periodos_fechados for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on periodos_fechados for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on periodos_fechados for delete using (meu_papel(negocio_id) = 'contador');
alter table periodos_fechados enable row level security;

create policy "membro le" on entrada_itens for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on entrada_itens for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on entrada_itens for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on entrada_itens for delete using (meu_papel(negocio_id) = 'contador');
alter table entrada_itens enable row level security;

create policy "membro le" on regras_classificacao for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on regras_classificacao for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on regras_classificacao for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on regras_classificacao for delete using (meu_papel(negocio_id) = 'contador');
alter table regras_classificacao enable row level security;

create policy "membro le" on roteiro_respostas for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on roteiro_respostas for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on roteiro_respostas for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
alter table roteiro_respostas enable row level security;

create policy "membro le" on trilha for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on trilha for insert with check (meu_papel(negocio_id) = 'contador');
-- Sem policy de UPDATE nem DELETE: trilha é append-only (docs/06 §10) — a
-- segunda tranca, além do cliente já não emitir essa operação.
alter table trilha enable row level security;

create policy "membro le" on lixeira for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on lixeira for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on lixeira for delete using (meu_papel(negocio_id) = 'contador');
alter table lixeira enable row level security;

create policy "membro le" on conciliacoes for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on conciliacoes for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on conciliacoes for delete using (meu_papel(negocio_id) = 'contador');
alter table conciliacoes enable row level security;

-- Roteiro de perguntas e parâmetros fiscais são globais (não por negócio).
-- v1 tem um usuário só (o Luan) — qualquer autenticado lê e escreve.
-- ⚠️ Revisar quando o portal do cliente (v2) existir: cliente não deve
-- poder editar o roteiro nem os parâmetros fiscais de ninguém.
alter table roteiro_perguntas enable row level security;
create policy "autenticado gerencia o roteiro" on roteiro_perguntas for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table parametros_fiscais enable row level security;
create policy "autenticado le e mantem parametros" on parametros_fiscais for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
