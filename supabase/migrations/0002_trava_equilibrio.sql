-- ============================================================
-- TRAVA DE EQUILÍBRIO — não existe lançamento torto porque o BANCO recusa
--
-- Desenho: docs/06_MODELO_DE_DADOS.md §1. Todo lançamento precisa ter
-- soma dos débitos = soma dos créditos nas suas linhas. Isto não é
-- validado só na tela — é um gatilho ADIADO (`deferrable initially
-- deferred`), disparado ao fim da transação, em `lancamento_linhas`.
--
-- POR QUE ADIADO
-- Durante a gravação um lançamento passa por estados desequilibrados
-- (a primeira linha entra sozinha). Só o RESULTADO da transação precisa
-- fechar — como conferir a mala depois de arrumada, não peça por peça.
--
-- AS TRÊS ARMADILHAS DESTA TRAVA (docs/06 §1, achadas ANTES de escrever
-- a primeira linha — registrar aqui de novo, perto do código, para quem
-- for mexer depois não precisar redescobrir):
--
--   1. Lançamento apagado — cabeçalho e linhas somem no mesmo lote. O
--      gatilho precisa IGNORAR lançamento que não existe mais, senão a
--      própria exclusão falharia acusando desequilíbrio de algo que já
--      não está lá.
--   2. O gatilho vive nas LINHAS, não no cabeçalho — mexer só na
--      descrição do lançamento não desequilibra nada, mas mexer numa
--      linha sim. Por isso cobre INSERT, UPDATE e DELETE em
--      `lancamento_linhas`, nunca em `lancamentos`.
--   3. `on delete cascade` de `lancamentos` para `lancamento_linhas` é
--      obrigatório (já está na FK do 0001) — sem ele, apagar um
--      cabeçalho deixaria linhas órfãs, o furo que esta trava existe
--      para impedir.
-- ============================================================

create or replace function verificar_equilibrio_lancamento(p_negocio uuid, p_lancamento_id text)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_debitos  numeric;
  v_creditos numeric;
begin
  -- Armadilha 1: lançamento apagado no mesmo lote — nada a verificar.
  if not exists (select 1 from lancamentos where negocio_id = p_negocio and id = p_lancamento_id) then
    return;
  end if;

  select coalesce(sum(valor) filter (where tipo = 'D'), 0),
         coalesce(sum(valor) filter (where tipo = 'C'), 0)
    into v_debitos, v_creditos
    from lancamento_linhas
   where negocio_id = p_negocio and lancamento_id = p_lancamento_id;

  if v_debitos <> v_creditos then
    raise exception 'lançamento % desequilibrado: débitos % ≠ créditos %',
      p_lancamento_id, v_debitos, v_creditos;
  end if;
end;
$$;

comment on function verificar_equilibrio_lancamento(uuid, text) is
  'Soma débitos e créditos das linhas de um lançamento e recusa se não baterem. Chamada pelo gatilho adiado abaixo.';

create or replace function trigger_verificar_equilibrio()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Armadilha 2: o gatilho vive nas LINHAS — insert, update e delete.
  if tg_op = 'DELETE' then
    perform verificar_equilibrio_lancamento(old.negocio_id, old.lancamento_id);
    return old;
  else
    perform verificar_equilibrio_lancamento(new.negocio_id, new.lancamento_id);
    return new;
  end if;
end;
$$;

create constraint trigger trava_equilibrio
  after insert or update or delete on lancamento_linhas
  deferrable initially deferred
  for each row execute function trigger_verificar_equilibrio();

comment on trigger trava_equilibrio on lancamento_linhas is
  'A trava dura do Contadoria: nenhum lançamento sai desequilibrado do banco, mesmo que a tela erre.';
