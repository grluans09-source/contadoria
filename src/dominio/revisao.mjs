/* ============================================================
   MESA DE REVISÃO — o papel de auditor (docs/04 §7)

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   Adaptado do `integrityCheck` do ContLife (docs/01 §3.2, nota B):
   partida dobrada é partida dobrada, só o plano de contas muda.

   TUDO AQUI É RECALCULADO DA FONTE, NUNCA DE UM RESUMO
   ------------------------------------------------------------
   A lição paga do ContLife (bug H2, doc 26): a primeira versão do
   integrityCheck comparava um saldo com a FÓRMULA que o definia — dava
   "fecha ✓" com o livro furado, porque a tautologia nunca poderia
   acusar nada. Cada checagem aqui soma direto de `lancamentoLinhas`,
   nunca de um valor já calculado por outra função.

   POR QUE ALGUMAS CHECAGENS "NUNCA DEVERIAM FALHAR"
   ------------------------------------------------------------
   Órfã e desequilíbrio já são impedidos pelo BANCO (FK e a trava do
   docs/06 §1). Rodar essas checagens aqui mesmo assim não é redundância
   burra — é a mesma defesa em camadas da trilha de auditoria (docs/06
   §10): se um dia uma delas realmente acusar algo, é sinal de bug sério
   (ou de alguém escrevendo direto no banco por fora do app), não papel
   decorativo.
   ============================================================ */

import { balancete } from "./razao.mjs";

export function mesaDeRevisao(contas, lancamentos, lancamentoLinhas) {
  const checks = [];
  const push = (nome, ok, detalhe) => checks.push({ nome, ok, detalhe: detalhe || "" });

  const idsContas = new Set(contas.map((c) => c.id));
  const idsLancamentos = new Set(lancamentos.map((l) => l.id));
  const orfas = lancamentoLinhas.filter((l) => !idsContas.has(l.contaId) || !idsLancamentos.has(l.lancamentoId));
  push("Toda linha referencia lançamento e conta existentes", orfas.length === 0,
    orfas.length ? `${orfas.length} linha(s) órfã(s)` : "nenhuma linha órfã");

  const datasInvalidas = lancamentos.filter((l) => !/^\d{4}-\d{2}-\d{2}$/.test(l.data || ""));
  const valoresInvalidos = lancamentoLinhas.filter((l) => !(l.valor > 0));
  push("Datas e valores válidos", datasInvalidas.length === 0 && valoresInvalidos.length === 0,
    (datasInvalidas.length || valoresInvalidos.length)
      ? `${datasInvalidas.length} data(s) e ${valoresInvalidos.length} valor(es) inválido(s)`
      : "tudo válido");

  const idsLancVistos = new Set(); let dupLanc = 0;
  for (const l of lancamentos) { if (idsLancVistos.has(l.id)) dupLanc++; idsLancVistos.add(l.id); }
  const idsLinhaVistos = new Set(); let dupLinha = 0;
  for (const l of lancamentoLinhas) { if (idsLinhaVistos.has(l.id)) dupLinha++; idsLinhaVistos.add(l.id); }
  push("Identificadores únicos", dupLanc === 0 && dupLinha === 0,
    (dupLanc || dupLinha) ? `${dupLanc} lançamento(s) e ${dupLinha} linha(s) duplicados` : "sem duplicidade");

  const porLancamento = new Map();
  for (const l of lancamentoLinhas) {
    if (!porLancamento.has(l.lancamentoId)) porLancamento.set(l.lancamentoId, { d: 0, c: 0 });
    const acc = porLancamento.get(l.lancamentoId);
    if (l.tipo === "D") acc.d += l.valor; else acc.c += l.valor;
  }
  const desequilibrados = [...porLancamento.entries()].filter(([, v]) => Math.abs(v.d - v.c) >= 0.01);
  push("Todo lançamento tem débito = crédito", desequilibrados.length === 0,
    desequilibrados.length
      ? `${desequilibrados.length} lançamento(s) desequilibrado(s) — não deveria ser possível, é o que a trava do banco existe para impedir`
      : "todos fecham");

  const b = balancete(contas, lancamentoLinhas);
  const soma = (tipo) => b.linhas.filter((c) => c.tipo === tipo).reduce((s, c) => s + c.saldo, 0);
  const ativo = soma("ativo"), passivo = soma("passivo"), pl = soma("pl"), receita = soma("receita"), despesa = soma("despesa");
  const diferenca = ativo - passivo - pl - receita + despesa;
  push("Equação patrimonial fecha (A = P + PL + R − D)", Math.abs(diferenca) < 0.01,
    Math.abs(diferenca) < 0.01
      ? `${fmtSimples(ativo)} = ${fmtSimples(passivo)} + ${fmtSimples(pl)} + ${fmtSimples(receita)} − ${fmtSimples(despesa)}`
      : `diferença de ${fmtSimples(diferenca)}`);

  return checks;
}

function fmtSimples(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

/** Só fecha um período se a Mesa inteira passar — um mês fechado sobre
 *  um livro furado seria selar o problema, não resolvê-lo. */
export function podeFecharPeriodo(checks) {
  return checks.every((c) => c.ok);
}
