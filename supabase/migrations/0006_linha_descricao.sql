-- ============================================================
-- DESCRIÇÃO E VENCIMENTO POR LINHA — buraco achado construindo o passo 5
--
-- `lancamento_linhas` só tinha conta_id/tipo/valor. Bastava para o
-- teste da trava de equilíbrio, mas não basta para o balanço de
-- abertura de verdade: "quem te deve, quanto e PARA QUANDO" precisa de
-- várias linhas na MESMA conta (Clientes), cada uma com sua própria
-- identidade e data — sem `descricao`, "Padaria do Chico R$ 420" e
-- "Mercado da Ana R$ 180" virariam um Clientes R$ 600 anônimo.
--
-- Nunca se edita uma migração já aplicada (0001 já rodou no banco real,
-- 12/ago) — mesma disciplina do ContLife
-- (0002_corrige_trigger_dossie.sql, 0004_corrige_protecao_plano.sql).
-- ============================================================

alter table lancamento_linhas
  add column if not exists descricao  text,
  add column if not exists vencimento date;

comment on column lancamento_linhas.descricao is
  'Identidade da linha dentro da conta — "Forno industrial", "Padaria do Chico". Sem isso, várias linhas na mesma conta perdem rastro de item.';
comment on column lancamento_linhas.vencimento is
  'Vencimento da linha, quando fizer sentido (contas a receber/pagar). Alimenta o aging (docs/02_ESCOPO.md §4.2) — não confundir com lancamentos.data, que é quando o FATO foi lançado.';
