-- ============================================================
-- APLICAR LOTE — a transação que protege a escrituração
--
-- Copiado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
-- supabase/migrations/0003_aplicar_lote.sql (11/ago/2026), adaptado:
-- `dossier_id` → `negocio_id`, e a lista branca de tabelas é a do
-- Contadoria. A lógica é idêntica — motivo, na íntegra, no arquivo de
-- origem e em docs/01_ANALISE_REAPROVEITAMENTO.md §2 (nota A: "copia
-- quase intacto").
--
-- Recebe a lista de operações que o motor de sincronização
-- (`src/dados/sinc.mjs`) calculou comparando o estado antes/depois, e
-- aplica TODAS numa transação só: ou grava tudo, ou não grava nada.
-- É isto que garante que fechar um mês (N lançamentos de encerramento +
-- a marca do período) nunca saia pela metade se a rede cair no meio.
--
-- SEGURANÇA
-- `security invoker`: roda como quem chamou, então a RLS deste banco
-- (0001_schema_inicial.sql) continua valendo — ninguém alcança negócio
-- alheio por aqui. O SQL é montado dinamicamente, mas só a partir de
-- (a) uma lista branca de tabelas e (b) `%I`, que cita identificadores
-- com escape. Nenhum valor entra por concatenação: todos viajam como
-- parâmetro (`using`).
--
-- `set search_path = public` NÃO é decorativo — ver a lição registrada
-- em 0001 na função `meu_papel` e no comentário de `criar_negocio`.
-- ============================================================
create or replace function aplicar_lote(p_negocio uuid, p_ops jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_op      jsonb;
  v_tabela  text;
  v_acao    text;
  v_dados   jsonb;
  v_cols    text;
  v_set     text;
  v_pk      text;
  v_cond    text;
  v_sql     text;
  v_total   int;
begin
  if p_ops is null or jsonb_typeof(p_ops) <> 'array' then
    raise exception 'lote inválido: esperava um array de operações';
  end if;

  v_total := jsonb_array_length(p_ops);
  if v_total = 0 then return; end if;
  if v_total > 20000 then
    raise exception 'lote grande demais (% operações)', v_total;
  end if;

  -- A RLS já impediria escrever em negócio alheio, mas em silêncio
  -- ("0 linhas afetadas"). Falhar aqui, cedo e explícito, é o que
  -- permite o app avisar a pessoa em vez de fingir que salvou.
  if meu_papel(p_negocio) <> 'contador' then
    raise exception 'negócio % não pertence a quem está chamando, ou não é contador dele', p_negocio;
  end if;

  for v_op in select value from jsonb_array_elements(p_ops) loop
    v_tabela := v_op->>'tabela';
    v_acao   := v_op->>'acao';

    if v_tabela not in ('contas', 'lancamentos', 'lancamento_linhas', 'periodos_fechados',
                        'entrada_itens', 'regras_classificacao', 'roteiro_respostas',
                        'trilha', 'lixeira', 'conciliacoes') then
      raise exception 'tabela fora da lista branca: %', coalesce(v_tabela, '(nula)');
    end if;

    -- ── GRAVAR (insere ou atualiza) ───────────────────────────
    if v_acao = 'gravar' then
      -- O `negocio_id` é carimbado AQUI, pelo servidor. O cliente não
      -- manda (e se mandasse, seria sobrescrito): é o que impede
      -- gravar no negócio de outra pessoa mesmo com a API na mão.
      v_dados := (v_op->'valores') || jsonb_build_object('negocio_id', p_negocio);

      select string_agg(format('%I', k), ', ' order by k)
        into v_cols
        from jsonb_object_keys(v_dados) as k;

      -- A trilha só nasce: `id` é bigserial e não vem do cliente,
      -- então não há conflito a resolver — insert puro.
      if v_tabela = 'trilha' then
        v_sql := format('insert into %I (%s) select %s from jsonb_populate_record(null::%I, $1)',
                        v_tabela, v_cols, v_cols, v_tabela);
        execute v_sql using v_dados;
      else
        select string_agg(format('%I = excluded.%I', k, k), ', ' order by k)
          into v_set
          from jsonb_object_keys(v_dados) as k;

        select string_agg(format('%I', a.attname), ', ' order by a.attnum)
          into v_pk
          from pg_index i
          join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
         where i.indrelid = format('public.%I', v_tabela)::regclass
           and i.indisprimary;

        v_sql := format(
          'insert into %I (%s) select %s from jsonb_populate_record(null::%I, $1) '
          'on conflict (%s) do update set %s',
          v_tabela, v_cols, v_cols, v_tabela, v_pk, v_set);
        execute v_sql using v_dados;
      end if;

    -- ── APAGAR ────────────────────────────────────────────────
    elsif v_acao = 'apagar' then
      -- Trilha não se apaga. O cliente já não emite esta operação para
      -- ela; aqui é a segunda tranca, no banco (a mesma RLS de 0001 já
      -- nega DELETE, isto é redundância deliberada — defesa em camadas).
      if v_tabela = 'trilha' then
        raise exception 'trilha de auditoria não aceita exclusão';
      end if;

      v_dados := (v_op->'chave') || jsonb_build_object('negocio_id', p_negocio);

      select string_agg(format('alvo.%I = chave.%I', k, k), ' and ' order by k)
        into v_cond
        from jsonb_object_keys(v_dados) as k;

      v_sql := format('delete from %I alvo using jsonb_populate_record(null::%I, $1) chave where %s',
                      v_tabela, v_tabela, v_cond);
      execute v_sql using v_dados;

    else
      raise exception 'ação desconhecida: %', coalesce(v_acao, '(nula)');
    end if;
  end loop;
end $$;

comment on function aplicar_lote(uuid, jsonb) is
  'Aplica um lote de operações do motor de sincronização numa transação única. Adaptado do ContLife, docs/01 §2.';
