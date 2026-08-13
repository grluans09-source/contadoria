/* ============================================================
   RECORRENTES — docs/05_ROTEIRO_DO_SERVICO.md §7: "já entram
   cadastradas na abertura — é o que faz o segundo mês ser rápido".

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

const uidPadrao = () => Math.random().toString(36).slice(2, 10);

/**
 * Materializa cada recorrente ATIVA num lançamento de verdade, um por
 * template, com `origem: "recorrente"` e `documento` apontando para o
 * id do template — é essa marca que impede gerar duas vezes o mesmo mês
 * se o dono clicar de novo (ou se dois negócios tiverem templates com o
 * mesmo id, o filtro é por lançamento DESTE negócio, então não colide).
 *
 * @param {Array<{id, descricao, ativa}>} recorrentes
 * @param {Array<{id, recorrenteId, contaId, tipo, valor}>} recorrenteLinhas
 * @param {Array<{origem, documento, data}>} lancamentos já existentes, para não duplicar
 * @param {string} mes "AAAA-MM"
 * @param {string} dataDoMes data ISO completa a usar no lançamento gerado (ex.: primeiro dia do mês)
 * @returns {{lancamentos: Array, linhas: Array}}
 */
export function gerarLancamentosDoMes(recorrentes, recorrenteLinhas, lancamentos, mes, dataDoMes, gerarId = uidPadrao) {
  const jaGeradas = new Set(
    (lancamentos || [])
      .filter((l) => l.origem === "recorrente" && (l.data || "").slice(0, 7) === mes)
      .map((l) => l.documento)
  );

  const novosLancamentos = [];
  const novasLinhas = [];

  for (const rec of recorrentes || []) {
    if (!rec.ativa || jaGeradas.has(rec.id)) continue;
    const linhasDoTemplate = (recorrenteLinhas || []).filter((l) => l.recorrenteId === rec.id);
    if (!linhasDoTemplate.length) continue;

    const lancamentoId = gerarId();
    novosLancamentos.push({
      id: lancamentoId,
      data: dataDoMes,
      dataCompetencia: dataDoMes,
      descricao: rec.descricao,
      origem: "recorrente",
      documento: rec.id,
    });
    for (const l of linhasDoTemplate) {
      novasLinhas.push({ id: gerarId(), lancamentoId, contaId: l.contaId, tipo: l.tipo, valor: l.valor, descricao: null, vencimento: null });
    }
  }

  return { lancamentos: novosLancamentos, linhas: novasLinhas };
}
