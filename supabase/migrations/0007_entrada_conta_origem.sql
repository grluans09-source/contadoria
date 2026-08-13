-- ============================================================
-- CONTA DE ORIGEM DA ENTRADA — buraco achado construindo a Caixa de
-- Entrada (docs/06 §13 passo 7).
--
-- `entrada_itens` guarda o que chegou do extrato/planilha/texto, mas não
-- tinha como saber se aquele movimento é do CAIXA ou do BANCO — e sem
-- isso não dá para montar o lançamento de classificação (qual conta de
-- trânsito debitar/creditar). Perguntado UMA VEZ por lote na hora de
-- importar (um extrato inteiro é sempre da mesma conta), guardado por
-- item — porque a classificação de cada item acontece em momentos
-- diferentes, não todos juntos.
--
-- Nunca se edita migração já aplicada — 0001 rodou no banco real em
-- 12/ago. Mesma disciplina de 0006_linha_descricao.sql.
-- ============================================================

alter table entrada_itens
  add column if not exists conta_origem_id text;

comment on column entrada_itens.conta_origem_id is
  'Qual conta de trânsito (caixa ou banco) este movimento afeta — definido na importação, usado ao classificar para montar o lançamento com as duas pernas certas.';
