-- ============================================================
-- CONTADORIA — O que foi EVITADO, não só o recomendado (F7, 14/ago)
--
-- POR QUE ISTO EXISTE
-- "A transformação mais valiosa (impedir a compra errada, evitar o
-- desenquadramento) não deixa rastro. Sem registro, o valor não é
-- percebido nem cobrado" (docs/DECISOES.md F7). A Carta (0009) já
-- registra o que foi RECOMENDADO para o futuro; esta tabela registra
-- o que já aconteceu — uma decisão ruim que não foi tomada porque
-- você estava olhando.
--
-- POR QUE NÃO É SÓ MAIS UM CAMPO NA CARTA
-- A carta é uma por mês. "O que evitamos" pode ser várias coisas no
-- mesmo mês (evitou a compra errada E evitou o desenquadramento), e
-- cada uma é um fato datado, não um parágrafo de texto livre — mesmo
-- raciocínio de `recorrentes` (0008): lista, não célula de texto.
-- ============================================================

create table if not exists evitados (
  negocio_id      uuid not null references negocios(id) on delete cascade,
  id              text not null,
  mes             text not null,   -- "AAAA-MM" a que se refere, não necessariamente o mês de hoje
  descricao       text not null,
  valor_estimado  numeric(14,2),   -- opcional: nem toda transformação evitada tem número claro
  criado_em       timestamptz not null default now(),
  primary key (negocio_id, id)
);

comment on table evitados is
  'O que foi evitado, não recomendado para o futuro (docs/DECISOES.md F7). Complementa `cartas`: cartas olha pra frente, evitados registra o que já não aconteceu por causa do serviço.';

alter table evitados enable row level security;
create policy "membro le" on evitados for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on evitados for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on evitados for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on evitados for delete using (meu_papel(negocio_id) = 'contador');

grant select, insert, update, delete on evitados to authenticated;

-- `aplicar_lote` (0003, reescrita em 0008 e 0009) precisa da tabela
-- nova na lista branca — mesmo padrão: a função inteira é substituída.
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
                        'cartas', 'evitados') then
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
