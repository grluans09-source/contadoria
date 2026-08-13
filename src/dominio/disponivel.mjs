/* ============================================================
   "QUANTO VOCÊ PODE TIRAR" — docs/08_DIFERENCIAL.md §2

   A proposta mais forte do produto: todo contador entrega faturamento e
   lucro; ninguém entrega uma DECISÃO. Função pura, testável sem banco.

   AS TRÊS HONESTIDADES (docs/08 §2) — como este módulo as cumpre
   ------------------------------------------------------------
   1. "É recomendação, não garantia" — cabe à tela dizer isso; aqui só o
      número e a conta que o sustenta.
   2. "Mostrar a conta, sempre" — por isso a função devolve cada parcela
      (disponivelHoje, aReceber, compromissos, reserva), não só o total.
   3. "Errar para baixo" — cada parcela que poderia superestimar é
      DELIBERADAMENTE capada no que o livro garante matematicamente
      (ver `capadoNoSaldo` abaixo). Um número otimista que quebra o
      cliente é pior que um conservador que só faz sobrar.

   POR QUE "A RECEBER (30 DIAS)" É CAPADO NO SALDO TOTAL DA CONTA
   ------------------------------------------------------------
   Somar as linhas de "Clientes" com vencimento nos próximos 30 dias
   pode SUPERESTIMAR se uma delas já foi paga (o pagamento vira outro
   lançamento, não apaga o registro de vencimento da linha original).
   O SALDO da conta, por outro lado, é sempre matematicamente correto —
   todo recebimento de verdade gera um crédito que já desconta do saldo.
   Por isso: usa o menor entre os dois. Mesma lógica para compromissos.

   O QUE FALTA PARA ISTO FICAR MAIS PRECISO (registrado, não escondido)
   ------------------------------------------------------------
   Sem uma baixa explícita por item (docs/06 §13, ainda não construída),
   não dá para saber COM CERTEZA se uma linha "a receber" específica,
   dentro da janela de 30 dias, já foi paga ou não — só o agregado. O
   capeamento é a mitigação; o próximo ganho de precisão é uma tela de
   "baixa de recebível" ligando pagamento a origem.
   ============================================================ */

import { saldoDeConta } from "./razao.mjs";

const DIAS_JANELA = 30;
const CONTAS_COMPROMISSO = ["fornecedores", "das_a_pagar", "emprestimos", "salarios_a_pagar"];

function addDias(iso, n) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function somaComVencimentoEmJanela(linhas, contaId, tipo, hoje, dias) {
  const limite = addDias(hoje, dias);
  return linhas
    .filter((l) => l.contaId === contaId && l.tipo === tipo && l.vencimento && l.vencimento >= hoje && l.vencimento <= limite)
    .reduce((s, l) => s + l.valor, 0);
}

/* Nunca deixa a parcela "otimista" (por vencimento) passar do que o
   livro garante que ainda está de pé (o saldo agregado). */
function capadoNoSaldo(valorBruto, contas, contaId, linhas) {
  const conta = contas.find((c) => c.id === contaId);
  if (!conta) return 0;
  const saldoAberto = Math.max(0, saldoDeConta(conta, linhas));
  return Math.min(valorBruto, saldoAberto);
}

/** A maior despesa total de um mês, entre os últimos até-3 meses JÁ
 *  FECHADOS (docs/06 §5) — usada como reserva mínima. Sem nenhum mês
 *  fechado ainda, a reserva é 0: sem histórico, não se inventa número. */
export function reservaMinima({ contas, lancamentos, lancamentoLinhas, periodosFechados }) {
  const mesesFechados = (periodosFechados || [])
    .filter((p) => p.startsWith("mes:"))
    .map((p) => p.slice(4))
    .sort()
    .slice(-3);
  if (!mesesFechados.length) return 0;

  const idsDespesa = new Set(contas.filter((c) => c.tipo === "despesa").map((c) => c.id));
  const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
  const despesaPorMes = new Map();
  for (const linha of lancamentoLinhas) {
    if (!idsDespesa.has(linha.contaId) || linha.tipo !== "D") continue;
    const mes = (porLancamento.get(linha.lancamentoId)?.data || "").slice(0, 7);
    if (!mesesFechados.includes(mes)) continue;
    despesaPorMes.set(mes, (despesaPorMes.get(mes) || 0) + linha.valor);
  }
  return despesaPorMes.size ? Math.max(...despesaPorMes.values()) : 0;
}

/**
 * @param {object} args
 * @param {Array} args.contas
 * @param {Array} args.lancamentos
 * @param {Array} args.lancamentoLinhas
 * @param {Array<string>} args.periodosFechados  ex.: ["mes:2026-07"]
 * @param {string} args.hoje  data ISO de referência
 * @returns {{podeTirar:number, disponivelHoje:number, aReceber:number, compromissos:number, reserva:number}}
 */
export function quantoPodeTirar({ contas, lancamentos, lancamentoLinhas, periodosFechados, hoje }) {
  const caixaConta = contas.find((c) => c.id === "caixa");
  const bancoConta = contas.find((c) => c.id === "banco");
  const disponivelHoje =
    (caixaConta ? saldoDeConta(caixaConta, lancamentoLinhas) : 0) +
    (bancoConta ? saldoDeConta(bancoConta, lancamentoLinhas) : 0);

  const aReceberBruto = somaComVencimentoEmJanela(lancamentoLinhas, "clientes", "D", hoje, DIAS_JANELA);
  const aReceber = capadoNoSaldo(aReceberBruto, contas, "clientes", lancamentoLinhas);

  let compromissos = 0;
  for (const contaId of CONTAS_COMPROMISSO) {
    const bruto = somaComVencimentoEmJanela(lancamentoLinhas, contaId, "C", hoje, DIAS_JANELA);
    compromissos += capadoNoSaldo(bruto, contas, contaId, lancamentoLinhas);
  }

  const reserva = reservaMinima({ contas, lancamentos, lancamentoLinhas, periodosFechados });
  const podeTirar = Math.max(0, disponivelHoje + aReceber - compromissos - reserva);

  return { podeTirar, disponivelHoje, aReceber, compromissos, reserva };
}
