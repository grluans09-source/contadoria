/* ============================================================
   O QUE VEM POR AÍ — a curva de caixa dos próximos dias.

   POR QUE ESTA É A PEÇA QUE MAIS IMPORTA (docs/09 §1.2)
   ------------------------------------------------------------
   Todo o resto do sistema é RETROSPECTIVO: conta o que já aconteceu.
   Isso é commodity — todo contador entrega. E, pior, chega tarde: saber
   em fevereiro que janeiro apertou não muda janeiro.

   Micronegócio não morre de prejuízo. Morre de **ficar sem dinheiro num
   dia específico** — o fornecedor que vence dia 20 quando o cliente só
   paga dia 25. Avisar ANTES é a única coisa aqui que muda o desfecho em
   vez de explicá-lo.

   E funciona desde o PRIMEIRO mês: só precisa de saldo, vencimentos e
   recorrentes — nada de histórico. É por isso que ela vale mais, hoje,
   que qualquer análise que exija três meses fechados (docs/09 §5).

   O QUE ESTA FUNÇÃO NÃO FAZ, DE PROPÓSITO
   ------------------------------------------------------------
   Não projeta receita futura que não esteja registrada como a receber.
   O cliente vai vender mais nos próximos 30 dias? Provavelmente. Mas
   chutar isso transformaria o aviso de aperto em ficção otimista — e o
   número que não pode mentir para cima é justamente este (docs/08 §2,
   "errar para baixo"). O que entra é só o que já está prometido.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

import { CONTAS_DINHEIRO } from "./planoContas.mjs";
import { CONTA_A_RECEBER, CONTAS_COMPROMISSO } from "./disponivel.mjs";

const DIAS_PADRAO = 60;

function addDias(iso, n) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function saldoDaConta(linhas, contaId) {
  let s = 0;
  for (const l of linhas) {
    if (l.contaId !== contaId) continue;
    s += l.tipo === "D" ? l.valor : -l.valor;
  }
  return s;
}

/** Datas em que um recorrente cai dentro da janela. */
function ocorrenciasDe(recorrente, hoje, limite) {
  const dia = Math.min(Math.max(Number(recorrente.diaVencimento) || 1, 1), 28);
  const datas = [];
  const inicio = new Date(hoje + "T12:00:00");
  /* Começa no mês corrente e anda mês a mês; 28 é o teto do dia para
     não sumir em fevereiro. */
  for (let m = 0; m <= 3; m++) {
    const d = new Date(inicio.getFullYear(), inicio.getMonth() + m, dia, 12);
    const iso = d.toISOString().slice(0, 10);
    if (iso > hoje && iso <= limite) datas.push(iso);
  }
  return datas;
}

/**
 * A curva de caixa dos próximos `dias`.
 *
 * @returns {{
 *   saldoHoje: number,
 *   eventos: Array<{data, descricao, valor, tipo}>,
 *   curva: Array<{data, saldo}>,
 *   aperto: null | {data, saldo, faltam},
 *   menorSaldo: {data, saldo},
 *   entram: number, saem: number
 * }}
 */
export function fluxoProjetado({ lancamentos, lancamentoLinhas, recorrentes = [], recorrenteLinhas = [], hoje, dias = DIAS_PADRAO }) {
  const limite = addDias(hoje, dias);
  const linhas = lancamentoLinhas || [];

  const saldoHoje = CONTAS_DINHEIRO.reduce((s, id) => s + saldoDaConta(linhas, id), 0);

  /* Só conta o que ainda NÃO foi baixado — a baixa por item
     (docs/08 §2) é o que permite saber que aquela fatura específica já
     foi paga, em vez de confiar só no saldo agregado. */
  const baixadas = new Set(linhas.filter((l) => l.baixaDe).map((l) => l.baixaDe));
  const descricaoDe = new Map((lancamentos || []).map((l) => [l.id, l.descricao]));

  const eventos = [];

  for (const l of linhas) {
    if (!l.vencimento || l.vencimento <= hoje || l.vencimento > limite) continue;
    if (baixadas.has(l.id)) continue;

    const rotulo = l.descricao || descricaoDe.get(l.lancamentoId) || "";

    if (l.contaId === CONTA_A_RECEBER && l.tipo === "D") {
      eventos.push({ data: l.vencimento, descricao: rotulo || "A receber", valor: l.valor, tipo: "entra" });
    } else if (CONTAS_COMPROMISSO.includes(l.contaId) && l.tipo === "C") {
      eventos.push({ data: l.vencimento, descricao: rotulo || "A pagar", valor: -l.valor, tipo: "sai" });
    }
  }

  /* Recorrentes ativos: o que vence todo mês e ainda vai vencer dentro
     da janela. Só a perna que MEXE NO DINHEIRO conta. */
  for (const rec of recorrentes) {
    if (!rec.ativa) continue;
    const pernas = recorrenteLinhas.filter((l) => l.recorrenteId === rec.id);
    const saida = pernas
      .filter((l) => CONTAS_DINHEIRO.includes(l.contaId) && l.tipo === "C")
      .reduce((s, l) => s + l.valor, 0);
    if (!(saida > 0)) continue;
    for (const data of ocorrenciasDe(rec, hoje, limite)) {
      eventos.push({ data, descricao: rec.descricao, valor: -saida, tipo: "recorrente" });
    }
  }

  eventos.sort((a, b) => a.data.localeCompare(b.data) || a.valor - b.valor);

  const curva = [];
  let saldo = saldoHoje;
  let aperto = null;
  let menorSaldo = { data: hoje, saldo: saldoHoje };

  for (const ev of eventos) {
    saldo = Math.round((saldo + ev.valor) * 100) / 100;
    curva.push({ data: ev.data, saldo });
    if (saldo < menorSaldo.saldo) menorSaldo = { data: ev.data, saldo };
    if (saldo < 0 && !aperto) {
      aperto = { data: ev.data, saldo, faltam: Math.round(Math.abs(saldo) * 100) / 100 };
    }
  }

  const entram = eventos.filter((e) => e.valor > 0).reduce((s, e) => s + e.valor, 0);
  const saem = eventos.filter((e) => e.valor < 0).reduce((s, e) => s - e.valor, 0);

  return { saldoHoje, eventos, curva, aperto, menorSaldo, entram, saem };
}

/**
 * O aviso em uma frase — o que o Luan fala para o cliente.
 * Devolve null quando não há nada a dizer: silêncio é resposta válida
 * (docs/09, P3).
 */
export function aviseSobreOCaixa(fluxo) {
  if (fluxo.aperto) {
    return {
      gravidade: "aperto",
      frase: `No dia ${fmtDia(fluxo.aperto.data)} o caixa fica negativo em ${fmtBRL(fluxo.aperto.faltam)} — é o dia em que o dinheiro acaba se nada mudar.`,
      oQueFazer: "Antecipar recebimento, adiar um pagamento, ou segurar a retirada até lá.",
    };
  }
  /* Sobrar pouco não é o mesmo que faltar, mas merece aviso: qualquer
     imprevisto vira aperto. O piso é relativo ao que sai no período,
     não um número fixo — R$ 300 sobrando é folga para quem gasta 1.000
     e é risco para quem gasta 20.000. */
  if (fluxo.saem > 0 && fluxo.menorSaldo.saldo < fluxo.saem * 0.1) {
    return {
      gravidade: "apertado",
      frase: `O caixa chega a ${fmtBRL(fluxo.menorSaldo.saldo)} no dia ${fmtDia(fluxo.menorSaldo.data)} — não fica negativo, mas qualquer imprevisto vira aperto.`,
      oQueFazer: "Vale evitar compra grande até depois dessa data.",
    };
  }
  return null;
}

function fmtBRL(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
function fmtDia(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}
