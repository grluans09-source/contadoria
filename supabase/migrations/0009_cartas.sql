-- ============================================================
-- CONTADORIA — Carta de recomendações (docs/04_MAPA_DO_APP.md §9,
-- docs/08_DIFERENCIAL.md §4: "o que você viu e o que ele deveria
-- fazer" + o campo "seguida?", que precisa nascer JUNTO — histórico
-- não se cria retroativamente).
--
-- Uma carta por negócio por mês. Chave natural é `mes` mesmo (texto
-- "AAAA-MM"), sem precisar de id sintético — mesmo raciocínio de
-- `periodos_fechados` (0001), que também usa a chave de domínio direto.
-- ============================================================

create table if not exists cartas (
  negocio_id     uuid not null references negocios(id) on delete cascade,
  mes            text not null,
  texto          text not null default '',
  seguida        boolean,          -- null = ainda não avaliada; só faz sentido perguntar no mês seguinte
  atualizado_em  timestamptz not null default now(),
  primary key (negocio_id, mes)
);

alter table cartas enable row level security;
create policy "membro le" on cartas for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on cartas for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on cartas for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on cartas for delete using (meu_papel(negocio_id) = 'contador');

grant select, insert, update, delete on cartas to authenticated;

-- `aplicar_lote` (0003, já reescrita em 0008) precisa da tabela nova na
-- lista branca — mesmo padrão: a função inteira é substituída, não há
-- "ALTER FUNCTION acrescenta item".
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

  if meu_papel(p_negocio) <> 'contador' then
    raise exception 'negócio % não pertence a quem está chamando, ou não é contador dele', p_negocio;
  end if;

  for v_op in select value from jsonb_array_elements(p_ops) loop
    v_tabela := v_op->>'tabela';
    v_acao   := v_op->>'acao';

    if v_tabela not in ('contas', 'lancamentos', 'lancamento_linhas', 'periodos_fechados',
                        'entrada_itens', 'regras_classificacao', 'roteiro_respostas',
                        'trilha', 'lixeira', 'conciliacoes', 'recorrentes', 'recorrente_linhas',
                        'cartas') then
      raise exception 'tabela fora da lista branca: %', coalesce(v_tabela, '(nula)');
    end if;

    if v_acao = 'gravar' then
      v_dados := (v_op->'valores') || jsonb_build_object('negocio_id', p_negocio);

      select string_agg(format('%I', k), ', ' order by k)
        into v_cols
        from jsonb_object_keys(v_dados) as k;

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

    elsif v_acao = 'apagar' then
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
