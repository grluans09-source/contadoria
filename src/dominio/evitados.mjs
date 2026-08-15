/* ============================================================
   EVITADOS — o que a transformação impediu, não só o que ela
   recomendou (docs/DECISOES.md F7, 14/ago).

   "A transformação mais valiosa (impedir a compra errada, evitar o
   desenquadramento) não deixa rastro. Sem registro, o valor não é
   percebido nem cobrado." Este módulo não descobre nada sozinho — o
   Luan registra o que evitou, com a mão. O valor aqui é só somar
   honestamente o que foi registrado.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

/** A soma do que foi evitado — só os itens com valor estimado contam
 *  (nem toda transformação evitada tem número claro, e inventar um
 *  seria pior que não somar, docs/09 P3). */
export function totalEvitado(evitados) {
  return Math.round((evitados || []).reduce((s, e) => s + (e.valorEstimado || 0), 0) * 100) / 100;
}

/** Os itens de UM mês específico, mais recentes primeiro. */
export function evitadosDoMes(evitados, mes) {
  return (evitados || []).filter((e) => e.mes === mes);
}
