/* ============================================================
   MEMÓRIA DO CLIENTE — a linha do tempo prometida em `08_DIFERENCIAL.md`
   §4 e nunca construída até agora (Fase 11, 14/ago).

   "Custo quase zero: a trilha, as respostas do roteiro e o histórico
   das cartas já estão no modelo. Falta só juntar numa tela." É
   exatamente o que este módulo faz — junta o que já existe em outro
   lugar, não recalcula nada de novo:
     · o retrato de entrada (F3, linhaDeBase.mjs) — o dia 1
     · o resultado de cada mês FECHADO (razao.mjs)
     · a carta daquele mês e se foi seguida (cartas.mjs, já tinha o
       campo — só nunca tinha virado linha do tempo)

   POR QUE SÓ MÊS FECHADO
   ------------------------------------------------------------
   O mês aberto ainda está em movimento — incluir na história seria
   contar um capítulo que ainda está sendo escrito, e o número mudaria
   sozinho de uma sessão para outra (docs/09, P3: silêncio é resposta
   válida quando não há fato assentado ainda).

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

import { resultadoDoMes, saldoDeConta } from "./razao.mjs";
import { CONTAS_DINHEIRO } from "./planoContas.mjs";

function mesesFechadosDe(periodosFechados) {
  return [...(periodosFechados || [])]
    .filter((p) => p.startsWith("mes:"))
    .map((p) => p.slice(4))
    .sort();
}

/**
 * O "agora" no mesmo formato do retrato de entrada — para comparar
 * com o que foi declarado no dia 1 (`compararComAEntrada`,
 * linhaDeBase.mjs). Faturamento e retirada usam o **último mês
 * fechado** como referência; patrimônio/caixa/dívida são o saldo
 * vivo de hoje, mesmo raciocínio do retrato original (é um retrato,
 * não um fluxo do mês).
 */
export function medidoAgora(contas, lancamentos, lancamentoLinhas, periodosFechados) {
  const contasPorId = new Map(contas.map((c) => [c.id, c]));
  const saldoDe = (id) => {
    const c = contasPorId.get(id);
    return c ? saldoDeConta(c, lancamentoLinhas) : 0;
  };

  const caixaEBanco = CONTAS_DINHEIRO.reduce((s, id) => s + saldoDe(id), 0);
  const aReceber = saldoDe("clientes");
  const dividas = Math.abs(saldoDe("fornecedores")) + Math.abs(saldoDe("emprestimos"));
  const patrimonioLiquido = Math.round(saldoDe("capital_titular") * 100) / 100;

  const mesesFechados = mesesFechadosDe(periodosFechados);
  const mesReferencia = mesesFechados[mesesFechados.length - 1] || null;

  let faturamentoMensal = null;
  let retiradaMensal = null;
  if (mesReferencia) {
    faturamentoMensal = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mesReferencia).receita;

    const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mesReferencia).map((l) => l.id));
    let retirada = 0;
    for (const linha of lancamentoLinhas) {
      if (linha.contaId !== "retiradas_titular" || !idsDoMes.has(linha.lancamentoId)) continue;
      retirada += linha.tipo === "D" ? linha.valor : -linha.valor;
    }
    retiradaMensal = Math.round(retirada * 100) / 100;
  }

  return {
    caixaEBanco: Math.round(caixaEBanco * 100) / 100,
    aReceber: Math.round(aReceber * 100) / 100,
    dividasDoNegocio: Math.round(dividas * 100) / 100,
    patrimonioLiquido,
    faturamentoMensal,
    retiradaMensal,
    mesReferencia,
  };
}

/**
 * A linha do tempo: um evento de abertura (se o retrato existir) e um
 * evento por mês FECHADO, cada um já com o resultado e a carta (se
 * houver) daquele mês.
 */
export function linhaDoTempo({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas }) {
  const eventos = [];

  if (negocio?.retrato_de_entrada) {
    eventos.push({ tipo: "abertura", data: negocio.retrato_de_entrada.capturadoEm, retrato: negocio.retrato_de_entrada });
  }

  for (const mes of mesesFechadosDe(periodosFechados)) {
    const resultado = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes);
    const carta = (cartas || []).find((c) => c.mes === mes) || null;
    eventos.push({ tipo: "mes", data: `${mes}-01`, mes, resultado, carta });
  }

  return eventos.sort((a, b) => (a.data || "").localeCompare(b.data || ""));
}
