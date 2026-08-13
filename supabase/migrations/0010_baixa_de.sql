-- ============================================================
-- CONTADORIA — Baixa de recebível/pagável específica (docs/08_DIFERENCIAL.md §2,
-- "o próximo ganho de precisão" registrado em src/dominio/disponivel.mjs).
--
-- `baixa_de` liga uma linha de PAGAMENTO à linha original de "a
-- receber"/"a pagar" que ela quita — em vez de só confiar no saldo
-- agregado da conta (que pode superestimar se o vencimento de uma linha
-- específica já foi pago), agora dá pra saber COM CERTEZA se AQUELA
-- fatura específica ainda está em aberto.
--
-- FK composta auto-referente, mesmo padrão de `fk_lancamento`/`fk_conta`
-- em 0001: garante que a baixa aponte para uma linha do MESMO negócio,
-- deferrable porque as duas linhas (a baixa e o que ela quita) já
-- existem em momentos diferentes — a original é de outro lançamento,
-- gravado antes.
-- ============================================================

alter table lancamento_linhas add column if not exists baixa_de text;

alter table lancamento_linhas
  add constraint fk_baixa_de foreign key (negocio_id, baixa_de)
    references lancamento_linhas(negocio_id, id) deferrable initially deferred;
