/* ============================================================
   RAZÃO — saldo de conta, balancete, a equação patrimonial

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   Partida dobrada é partida dobrada — a mecânica é a mesma do ContLife
   (docs/01 §3.2, nota B), só o plano de contas muda de domínio.

   A LIÇÃO DO CONTLIFE QUE NÃO SE REPETE AQUI (docs/01 §3.2)
   ------------------------------------------------------------
   A primeira versão do integrityCheck do ContLife comparava um saldo
   com a FÓRMULA que o definia — dava "fecha ✓" com o livro furado,
   porque a tautologia nunca poderia acusar nada. Aqui, `balancete`
   soma DIRETO das linhas (débito e crédito brutos, por conta), e só
   DEPOIS calcula o saldo líquido — nunca o contrário. O total geral de
   débitos e o total geral de créditos vêm da mesma soma bruta, então
   provam algo de verdade: se não baterem, tem linha órfã ou bug real,
   não um erro de arredondamento escondido atrás de uma média.
   ============================================================ */

/* Em qual lado o saldo de cada tipo de conta CRESCE. Ativo e despesa
   crescem no débito; passivo, patrimônio e receita crescem no crédito. */
export const DEBITO_NORMAL = { ativo: true, despesa: true, passivo: false, pl: false, receita: false };

/**
 * Saldo líquido de UMA conta, na direção normal dela.
 * @param {{id:string, tipo:string}} conta
 * @param {Array<{contaId:string, tipo:'D'|'C', valor:number}>} linhas  só as linhas dessa conta (ou de todas — filtra sozinho)
 */
export function saldoDeConta(conta, linhas) {
  let d = 0, c = 0;
  for (const l of linhas) {
    if (l.contaId !== conta.id) continue;
    if (l.tipo === "D") d += l.valor;
    else c += l.valor;
  }
  return DEBITO_NORMAL[conta.tipo] ? d - c : c - d;
}

/**
 * O balancete: toda conta, com débito bruto, crédito bruto e saldo —
 * mais a prova de que o total geral fecha (docs/04 §6).
 * @param {Array<{id, codigo, nome, tipo}>} contas
 * @param {Array<{contaId, tipo, valor}>} linhas
 */
export function balancete(contas, linhas) {
  const porConta = new Map(contas.map((c) => [c.id, { ...c, debito: 0, credito: 0 }]));
  const orfas = [];
  for (const l of linhas) {
    const c = porConta.get(l.contaId);
    if (!c) { orfas.push(l); continue; } /* não deveria acontecer — a FK garante — mas não derruba a tela */
    if (l.tipo === "D") c.debito += l.valor;
    else c.credito += l.valor;
  }

  const linhasBalancete = [...porConta.values()]
    .map((c) => ({ ...c, saldo: DEBITO_NORMAL[c.tipo] ? c.debito - c.credito : c.credito - c.debito }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  const totalDebito = linhasBalancete.reduce((s, c) => s + c.debito, 0);
  const totalCredito = linhasBalancete.reduce((s, c) => s + c.credito, 0);

  return {
    linhas: linhasBalancete,
    totalDebito,
    totalCredito,
    fecha: Math.abs(totalDebito - totalCredito) < 0.01,
    orfas,
  };
}

/**
 * Junta a data/descrição do lançamento em cada linha — view-model para
 * Diário e Razão, que precisam mostrar "quando" ao lado de "quanto".
 * Não é o motor contábil em si (não calcula nada), por isso não precisa
 * de teste próprio — é reshape de exibição.
 */
/**
 * O resultado de UM mês — e a resposta pra "pra onde foi o que sobrou"
 * (docs/04 §9.1, docs/08 §3): compara o resultado contábil (receita −
 * despesa) com a variação REAL de caixa/banco no mesmo mês. Se os dois
 * não baterem, a diferença virou outra coisa — estoque, conta a
 * receber, pagamento de dívida, ou retirada.
 */
export function resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes) {
  const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => l.id));
  const linhasDoMes = lancamentoLinhas.filter((l) => idsDoMes.has(l.lancamentoId));
  const b = balancete(contas, linhasDoMes);
  const receita = b.linhas.filter((c) => c.tipo === "receita").reduce((s, c) => s + c.saldo, 0);
  const despesa = b.linhas.filter((c) => c.tipo === "despesa").reduce((s, c) => s + c.saldo, 0);
  const variacaoCaixaBanco = b.linhas.filter((c) => c.id === "caixa" || c.id === "banco").reduce((s, c) => s + c.saldo, 0);
  return { receita, despesa, resultado: receita - despesa, variacaoCaixaBanco };
}

export function linhasComContexto(lancamentos, linhas) {
  const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
  return linhas
    .map((l) => {
      const lanc = porLancamento.get(l.lancamentoId);
      return { ...l, data: lanc?.data ?? null, lancamentoDescricao: lanc?.descricao ?? "", origem: lanc?.origem ?? null };
    })
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""));
}
