-- ============================================================
-- CONTADORIA — Recorrentes (docs/05_ROTEIRO_DO_SERVICO.md §7: "já
-- entram cadastradas na abertura — é o que faz o segundo mês ser
-- rápido"). Mesmo formato cabeçalho+linhas de `lancamentos` (docs/06
-- §1) — um template guarda N pernas (aluguel D, banco C, por exemplo),
-- e "gerar lançamentos do mês" materializa cada template ativo num
-- lançamento de verdade com origem='recorrente'.
-- ============================================================

create table if not exists recorrentes (
  negocio_id uuid not null references negocios(id) on delete cascade,
  id         text not null,
  descricao  text not null,
  ativa      boolean not null default true,
  criado_em  timestamptz not null default now(),
  primary key (negocio_id, id)
);

create table if not exists recorrente_linhas (
  negocio_id     uuid not null references negocios(id) on delete cascade,
  id             text not null,
  recorrente_id  text not null,
  conta_id       text not null,
  tipo           text not null check (tipo in ('D', 'C')),
  valor          numeric(14,2) not null check (valor > 0),
  primary key (negocio_id, id),
  constraint fk_recorrente foreign key (negocio_id, recorrente_id) references recorrentes(negocio_id, id) on delete cascade deferrable initially deferred,
  constraint fk_conta foreign key (negocio_id, conta_id) references contas(negocio_id, id) deferrable initially deferred
);

create index if not exists recorrente_linhas_recorrente_idx on recorrente_linhas(negocio_id, recorrente_id);

alter table recorrentes enable row level security;
create policy "membro le" on recorrentes for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on recorrentes for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on recorrentes for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on recorrentes for delete using (meu_papel(negocio_id) = 'contador');

alter table recorrente_linhas enable row level security;
create policy "membro le" on recorrente_linhas for select using (meu_papel(negocio_id) is not null);
create policy "contador insere" on recorrente_linhas for insert with check (meu_papel(negocio_id) = 'contador');
create policy "contador atualiza" on recorrente_linhas for update using (meu_papel(negocio_id) = 'contador') with check (meu_papel(negocio_id) = 'contador');
create policy "contador apaga" on recorrente_linhas for delete using (meu_papel(negocio_id) = 'contador');

-- Concessão explícita — "Automatically expose new tables" está desligado
-- no projeto (0004_grants.sql).
grant select, insert, update, delete on recorrentes, recorrente_linhas to authenticated;

-- `aplicar_lote` (0003) tem lista branca de tabelas fixa no corpo da
-- função — precisa ser reescrita para aceitar as duas tabelas novas.
-- `create or replace` é a forma correta de evoluir uma FUNÇÃO por
-- migração nova (diferente de tabela: não há "ALTER FUNCTION acrescenta
-- linha da lista branca", a função inteira é substituída).
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
                        'trilha', 'lixeira', 'conciliacoes', 'recorrentes', 'recorrente_linhas') then
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
