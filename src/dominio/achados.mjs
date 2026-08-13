/* ============================================================
   ACHADOS — docs/04_MAPA_DO_APP.md §7: "o sistema aponta o que
   destoa: despesa muito fora do padrão do cliente, mês sem nenhum
   movimento, receita registrada sem dinheiro entrando em lugar
   nenhum".

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   Mesma disciplina da Mesa de Revisão (docs/dominio/revisao.mjs):
   recalcula da fonte (lancamentoLinhas), nunca de um resumo pronto.

   POR QUE NÃO TEM A GRANULARIDADE DO MOCKUP
   ------------------------------------------------------------
   "despesa muito fora do padrão" só existe se houver PADRÃO — meses
   FECHADOS pra comparar (docs/SESSION_STATE já registrava isto como
   adiado por falta de histórico). Sem nenhum mês fechado, esta função
   devolve lista vazia — silêncio aqui é a resposta certa, não bug.
   ============================================================ */

/* Contas que representam dinheiro entrando ou a receber — o modelo de
   fábrica (docs/06 §7). Lista fechada de propósito: um plano de contas
   editado pelo dono (PlanoContas.jsx) pode criar conta de dinheiro com
   outro id, e esta função não tem como adivinhar isso — prefere
   simplicidade honesta a uma heurística frágil tentando generalizar. */
const CONTAS_DINHEIRO_OU_A_RECEBER = new Set(["caixa", "banco", "maquininha_receber", "clientes"]);

function mesSeguinte(mes) {
  const [ano, m] = mes.split("-").map(Number);
  return m === 12 ? `${ano + 1}-01` : `${ano}-${String(m + 1).padStart(2, "0")}`;
}

/** Meses SEM nenhum lançamento, dentro do intervalo entre o primeiro e
 *  o último mês que já teve movimento (gaps no meio da história — não
 *  o mês corrente ainda em aberto, que a prateleira já cobre). */
export function mesesSemMovimento(lancamentos) {
  const meses = [...new Set((lancamentos || []).map((l) => (l.data || "").slice(0, 7)).filter(Boolean))].sort();
  if (meses.length < 2) return [];
  const presentes = new Set(meses);
  const faltando = [];
  let atual = meses[0];
  const ultimo = meses[meses.length - 1];
  while (atual < ultimo) {
    atual = mesSeguinte(atual);
    if (atual < ultimo && !presentes.has(atual)) faltando.push(atual);
  }
  return faltando;
}

/** Saldo de UMA conta em UM mês, somando direto das linhas — mesma
 *  disciplina "nunca de um resumo pronto" da Mesa de Revisão. */
function saldoDaContaNoMes(contaId, mes, lancamentos, lancamentoLinhas) {
  const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => l.id));
  let saldo = 0;
  for (const linha of lancamentoLinhas) {
    if (linha.contaId !== contaId || !idsDoMes.has(linha.lancamentoId)) continue;
    saldo += linha.tipo === "D" ? linha.valor : -linha.valor; /* despesa: normal no débito */
  }
  return saldo;
}

/**
 * Despesas do(s) mês(es) ABERTO(S) muito acima da média dos mesmos
 * meses FECHADOS — só roda se existir pelo menos 1 mês fechado (docs/04
 * §7: "muito fora do padrão do CLIENTE", não um número arbitrário
 * inventado sem histórico).
 */
export function despesasForaDoPadrao(contas, lancamentos, lancamentoLinhas, periodosFechados, multiplicador = 2) {
  const mesesFechados = (periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4));
  if (!mesesFechados.length) return [];

  const todosMeses = [...new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean))];
  const mesesAbertos = todosMeses.filter((m) => !mesesFechados.includes(m));
  if (!mesesAbertos.length) return [];

  const despesas = contas.filter((c) => c.tipo === "despesa");
  const achados = [];
  for (const conta of despesas) {
    const historico = mesesFechados.map((m) => saldoDaContaNoMes(conta.id, m, lancamentos, lancamentoLinhas));
    const comMovimento = historico.filter((v) => v > 0);
    if (!comMovimento.length) continue; /* sem histórico de gasto nessa conta, sem padrão pra comparar */
    const media = comMovimento.reduce((s, v) => s + v, 0) / comMovimento.length;

    for (const mes of mesesAbertos) {
      const atual = saldoDaContaNoMes(conta.id, mes, lancamentos, lancamentoLinhas);
      if (atual > media * multiplicador) {
        achados.push({ tipo: "despesa_fora_padrao", contaId: conta.id, contaNome: conta.nome, mes, valor: atual, media });
      }
    }
  }
  return achados;
}

/** Lançamento com linha de receita cuja contrapartida não toca
 *  dinheiro/a-receber nenhum — receita "solta", sem explicação de pra
 *  onde foi o valor (docs/04 §7). */
export function receitasSemDinheiro(contas, lancamentos, lancamentoLinhas) {
  const contasPorId = new Map(contas.map((c) => [c.id, c]));
  const linhasPorLancamento = new Map();
  for (const l of lancamentoLinhas) {
    if (!linhasPorLancamento.has(l.lancamentoId)) linhasPorLancamento.set(l.lancamentoId, []);
    linhasPorLancamento.get(l.lancamentoId).push(l);
  }

  const achados = [];
  for (const lanc of lancamentos) {
    const linhas = linhasPorLancamento.get(lanc.id) || [];
    const temReceita = linhas.some((l) => contasPorId.get(l.contaId)?.tipo === "receita");
    if (!temReceita) continue;
    const temDinheiro = linhas.some((l) => CONTAS_DINHEIRO_OU_A_RECEBER.has(l.contaId));
    if (!temDinheiro) {
      achados.push({ tipo: "receita_sem_dinheiro", lancamentoId: lanc.id, descricao: lanc.descricao, data: lanc.data });
    }
  }
  return achados;
}

/** Junta as três checagens numa lista só, pronta pra tela. */
export function encontrarAchados(contas, lancamentos, lancamentoLinhas, periodosFechados) {
  const achados = [];
  for (const mes of mesesSemMovimento(lancamentos)) {
    achados.push({ tipo: "mes_sem_movimento", mes });
  }
  achados.push(...despesasForaDoPadrao(contas, lancamentos, lancamentoLinhas, periodosFechados));
  achados.push(...receitasSemDinheiro(contas, lancamentos, lancamentoLinhas));
  return achados;
}
