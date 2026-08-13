/* ============================================================
   CARTA DE RECOMENDAÇÕES — docs/04_MAPA_DO_APP.md §9, docs/08 §4.

   "A recomendação foi seguida?" só faz sentido perguntar DEPOIS —
   no mês seguinte, quando já dá para saber. Este módulo decide QUAL
   carta pendente perguntar, sem duplicar a lógica em cada tela que
   um dia queira mostrar isso (docs/08 §4: "histórico não se cria
   retroativamente — ou se guarda desde o primeiro mês, ou aquela
   conversa nunca vai existir").

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

/** A carta mais recente ANTES de `mesAtual` que tem texto e ainda não
 *  foi avaliada — null se não houver nenhuma (não escreveu carta antes,
 *  ou já avaliou todas). */
export function cartaPendenteDeAvaliacao(cartas, mesAtual) {
  const candidatas = (cartas || [])
    .filter((c) => c.mes < mesAtual && (c.texto || "").trim() && (c.seguida === null || c.seguida === undefined))
    .sort((a, b) => b.mes.localeCompare(a.mes));
  return candidatas[0] || null;
}
