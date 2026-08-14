-- ============================================================
-- CONTADORIA — Formulário público: o cliente responde sozinho, por link
--
-- POR QUE EXISTE (pedido do dono, 14/ago/2026)
-- A entrevista de cliente novo exigia estar junto — e horário de dono de
-- negócio pequeno raramente bate com horário de estudante. Com um link,
-- o cliente responde no tempo dele, do celular.
--
-- E abre três portas além dessa: coleta MENSAL pelo mesmo mecanismo
-- (ataca o gargalo nº 2, docs/03 §5), Diagnóstico Gratuito escalável
-- (docs/11 §5 — mandar o link para 10 possíveis clientes de uma vez), e
-- é o portal do cliente da v2 (docs/02 §3) entrando pela porta segura.
--
-- ⚠️ ESTA É A PRIMEIRA SUPERFÍCIE SEM LOGIN DO SISTEMA
-- Todo o resto exige `authenticated` (0004_grants.sql não dá nada ao
-- `anon`, de propósito). As decisões de segurança aqui:
--
--   1. O `anon` NÃO ganha acesso a tabela nenhuma. Só a duas funções
--      `security definer`, e elas são a única porta.
--   2. O token é um UUID aleatório na URL. Quem não tem o link não
--      alcança nada — e o link vale para UM negócio e UM propósito.
--   3. O cliente só ESCREVE resposta de roteiro. Não lê o livro, não vê
--      saldo, não enxerga outro negócio. `formulario_abrir` devolve
--      apenas o primeiro nome do negócio e as perguntas.
--   4. Formulário tem validade e pode ser revogado. Expirado ou
--      revogado, as duas funções recusam.
--   5. `formulario_responder` grava SOMENTE em `roteiro_respostas`, e
--      só para perguntas que existem e estão ativas — o cliente não
--      consegue injetar chave arbitrária.
-- ============================================================

create table if not exists formularios (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid not null references negocios(id) on delete cascade,
  token       uuid not null default gen_random_uuid(),
  tipo        text not null default 'onboarding' check (tipo in ('onboarding', 'mes')),
  criado_em   timestamptz not null default now(),
  expira_em   timestamptz not null default (now() + interval '30 days'),
  revogado    boolean not null default false,
  aberto_em   timestamptz,          -- primeira vez que o cliente abriu
  concluido_em timestamptz,         -- quando ele clicou "terminei"
  unique (token)
);

create index if not exists formularios_negocio_idx on formularios(negocio_id);

comment on table formularios is
  'Link público para o cliente responder o roteiro sozinho. O token é a credencial — quem tem o link responde, quem não tem não alcança nada.';

-- RLS: o CONTADOR gerencia os formulários do negócio dele. O `anon` não
-- toca nesta tabela — chega nela só por dentro das funções abaixo.
alter table formularios enable row level security;
create policy "membro le" on formularios for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on formularios for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on formularios for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on formularios for delete using (meu_papel(negocio_id) = 'contador');

grant select, insert, update, delete on formularios to authenticated;

-- ─────────────────────────────────────────────────────────────
-- ABRIR — o cliente entra com o token e recebe o que precisa ver.
--
-- `security definer` porque roda sem login nenhum. Devolve o MÍNIMO:
-- como chamar o negócio, as perguntas que valem para ele, e o que já
-- foi respondido (para o formulário ser retomável — cliente no celular
-- não termina 20 perguntas de uma sentada).
-- ─────────────────────────────────────────────────────────────
create or replace function formulario_abrir(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form     formularios%rowtype;
  v_negocio  negocios%rowtype;
  v_perguntas jsonb;
  v_respostas jsonb;
begin
  select * into v_form from formularios where token = p_token;

  if not found or v_form.revogado or v_form.expira_em < now() then
    /* Mesma resposta para token inexistente, revogado e vencido — não
       entrega ao curioso a informação de que o token existiu. */
    return jsonb_build_object('ok', false, 'motivo', 'indisponivel');
  end if;

  select * into v_negocio from negocios where id = v_form.negocio_id;

  if v_form.aberto_em is null then
    update formularios set aberto_em = now() where id = v_form.id;
  end if;

  /* Só os blocos que o cliente responde sozinho (1 a 5). O Bloco 6 — o
     combinado, preço, "o que eu não faço" — é conversa, não coleta. */
  select coalesce(jsonb_agg(to_jsonb(p) order by p.bloco, p.ordem), '[]'::jsonb)
    into v_perguntas
    from roteiro_perguntas p
   where p.ativo
     and p.bloco between 1 and 5
     and (p.tipos is null or v_negocio.tipo = any(p.tipos))
     and (p.arquetipos is null or (v_negocio.arquetipo is not null and v_negocio.arquetipo = any(p.arquetipos)));

  select coalesce(jsonb_object_agg(r.pergunta_id, r.resposta), '{}'::jsonb)
    into v_respostas
    from roteiro_respostas r
   where r.negocio_id = v_form.negocio_id and r.resposta is not null;

  return jsonb_build_object(
    'ok', true,
    'tipo', v_form.tipo,
    'concluido', v_form.concluido_em is not null,
    -- primeiro nome só: o cliente reconhece o próprio negócio sem que o
    -- link exponha razão social, CNPJ ou qualquer outro dado
    'negocio', coalesce(v_negocio.apelido, split_part(v_negocio.nome, ' ', 1)),
    'perguntas', v_perguntas,
    'respostas', v_respostas
  );
end $$;

-- ─────────────────────────────────────────────────────────────
-- RESPONDER — grava uma resposta por vez (o formulário salva a cada
-- passo, então o cliente pode fechar e voltar depois).
--
-- Só grava se a pergunta EXISTE e está ativa: o cliente não consegue
-- inventar pergunta_id nem escrever em outro lugar.
-- ─────────────────────────────────────────────────────────────
create or replace function formulario_responder(p_token uuid, p_pergunta uuid, p_resposta text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form formularios%rowtype;
begin
  select * into v_form from formularios where token = p_token;
  if not found or v_form.revogado or v_form.expira_em < now() then
    return jsonb_build_object('ok', false, 'motivo', 'indisponivel');
  end if;

  if not exists (select 1 from roteiro_perguntas where id = p_pergunta and ativo and bloco between 1 and 5) then
    return jsonb_build_object('ok', false, 'motivo', 'pergunta_invalida');
  end if;

  if length(coalesce(p_resposta, '')) > 4000 then
    return jsonb_build_object('ok', false, 'motivo', 'resposta_longa');
  end if;

  insert into roteiro_respostas (negocio_id, pergunta_id, resposta)
  values (v_form.negocio_id, p_pergunta, p_resposta)
  on conflict (negocio_id, pergunta_id) do update
    set resposta = excluded.resposta, respondido_em = now();

  return jsonb_build_object('ok', true);
end $$;

-- ─────────────────────────────────────────────────────────────
-- CONCLUIR — o cliente diz que terminou.
-- ─────────────────────────────────────────────────────────────
create or replace function formulario_concluir(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form formularios%rowtype;
begin
  select * into v_form from formularios where token = p_token;
  if not found or v_form.revogado or v_form.expira_em < now() then
    return jsonb_build_object('ok', false, 'motivo', 'indisponivel');
  end if;

  update formularios set concluido_em = now() where id = v_form.id;
  return jsonb_build_object('ok', true);
end $$;

-- As TRÊS funções são a única porta do `anon` para dentro do sistema.
grant execute on function formulario_abrir(uuid) to anon, authenticated;
grant execute on function formulario_responder(uuid, uuid, text) to anon, authenticated;
grant execute on function formulario_concluir(uuid) to anon, authenticated;

comment on function formulario_abrir(uuid) is
  'Porta pública do formulário do cliente. security definer: roda sem login. Devolve só apelido do negócio, perguntas filtradas e respostas já dadas.';
