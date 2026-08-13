/* ============================================================
   BAIXA DE RECEBÍVEL/PAGÁVEL — docs/08_DIFERENCIAL.md §2, "o próximo
   ganho de precisão" registrado em disponivel.mjs.

   Liga um PAGAMENTO à linha original de "a receber"/"a pagar" que ele
   quita, via `baixaDe` (o id da linha original). Antes disso, o sistema
   só sabia o SALDO agregado da conta — agora sabe se UMA fatura
   específica ainda está em aberto.

   ESCOPO DELIBERADO: baixa é sempre do valor CHEIO da linha original —
   não existe baixa parcial nesta versão. Uma fatura de R$1.000 paga em
   duas vezes de R$500 exige um jeito de "sobrar R$500 em aberto", que
   este desenho não cobre; registrado aqui, não escondido, para não
   inventar um comportamento que o código não garante.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

import { CONTA_A_RECEBER, CONTAS_COMPROMISSO } from "./disponivel.mjs";

/** Linhas de uma lista de contas-alvo, de um tipo D/C, que NENHUMA
 *  outra linha já baixou (nenhuma linha tem `baixaDe` apontando pra
 *  elas). Não filtra por vencimento — uma linha sem vencimento também
 *  pode ser baixada, só não entra no cálculo de "próximos 30 dias". */
function itensEmAberto(lancamentoLinhas, contasAlvo, tipo) {
  const baixadas = new Set((lancamentoLinhas || []).filter((l) => l.baixaDe).map((l) => l.baixaDe));
  return (lancamentoLinhas || [])
    .filter((l) => contasAlvo.includes(l.contaId) && l.tipo === tipo && !baixadas.has(l.id))
    .sort((a, b) => (a.vencimento || "9999-99").localeCompare(b.vencimento || "9999-99"));
}

export function recebiveisEmAberto(lancamentoLinhas) {
  return itensEmAberto(lancamentoLinhas, [CONTA_A_RECEBER], "D");
}

export function pagaveisEmAberto(lancamentoLinhas) {
  return itensEmAberto(lancamentoLinhas, CONTAS_COMPROMISSO, "C");
}

const uidPadrao = () => Math.random().toString(36).slice(2, 10);

/**
 * Monta o lançamento de baixa: uma perna na conta de trânsito
 * (caixa/banco), outra quitando a conta original — direção oposta à da
 * linha original, com `baixaDe` apontando pra ela.
 *
 * @param {{id, contaId, tipo, valor}} linhaOriginal a receber (D) ou a pagar (C) em aberto
 * @param {string} contaTransitoId "caixa" ou "banco"
 * @param {string} data data ISO do recebimento/pagamento
 */
export function construirBaixa(linhaOriginal, contaTransitoId, data, gerarId = uidPadrao) {
  if (!linhaOriginal) throw new Error("selecione um item em aberto para dar baixa");
  if (!contaTransitoId) throw new Error("escolha caixa ou banco");

  const ehReceber = linhaOriginal.tipo === "D"; /* a receber: original D, entra dinheiro (D transito / C original) */
  const idLancamento = gerarId();
  const descricaoBase = linhaOriginal.descricao ? `Baixa: ${linhaOriginal.descricao}` : "Baixa";

  return {
    lancamento: { id: idLancamento, data, dataCompetencia: data, descricao: descricaoBase, origem: "manual", documento: null },
    linhas: [
      { id: gerarId(), lancamentoId: idLancamento, contaId: contaTransitoId, tipo: ehReceber ? "D" : "C", valor: linhaOriginal.valor, descricao: null, vencimento: null, baixaDe: null },
      { id: gerarId(), lancamentoId: idLancamento, contaId: linhaOriginal.contaId, tipo: ehReceber ? "C" : "D", valor: linhaOriginal.valor, descricao: null, vencimento: null, baixaDe: linhaOriginal.id },
    ],
  };
}
