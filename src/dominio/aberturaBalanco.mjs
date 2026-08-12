/* ============================================================
   BALANÇO DE ABERTURA — docs/06_MODELO_DE_DADOS.md §4

   Todo cliente chega no meio da vida: já tem caixa, equipamento, gente
   que deve pra ele e gente pra quem ele deve. Sem essa foto, o livro
   nasce desequilibrado e a trava de equilíbrio (0002_trava_equilibrio.sql)
   — que está provada rodando no banco real — recusaria QUALQUER
   lançamento seguinte, porque o balanço nunca fecharia.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6) — só
   entra dado, sai o lançamento pronto para ir ao `aplicar_lote`.

   A LINHA QUE NÃO SE PERGUNTA
   ------------------------------------------------------------
   O Capital do titular é CALCULADO, não perguntado. O cliente não sabe
   qual é o patrimônio líquido dele — é justamente isso que o Contadoria
   vai contar pra ele. Essa é a linha que faz o lançamento equilibrar:
   se o que ele TEM (débitos: caixa, banco, equipamentos, estoque,
   a receber) for maior que o que ele DEVE (créditos: fornecedores,
   empréstimos), a diferença é capital dele. Se for o contrário — mais
   dívida do que bem — o patrimônio nasce negativo, e o Contadoria
   precisa mostrar isso com a mesma honestidade que mostraria um lucro.
   ============================================================ */

const uidPadrao = () => Math.random().toString(36).slice(2, 10);

/* Um dia antes de uma data ISO "AAAA-MM-DD". O balanço de abertura é
   datado do dia ANTERIOR ao início do serviço (docs/06 §4) — assim ele
   fecha o dia anterior, e o primeiro lançamento de verdade já começa no
   primeiro dia em que o Contadoria está cuidando do negócio. */
export function diaAnterior(isoDate) {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Monta o lançamento de abertura a partir dos itens que o cliente
 * contou na entrevista (docs/05 §4, Bloco 3).
 *
 * @param {object} args
 * @param {string} args.inicioDoServico  data ISO em que o Contadoria passa a cuidar do negócio
 * @param {Array<{contaId:string, tipo:'D'|'C', valor:number, descricao?:string, vencimento?:string}>} args.itens
 *   o que o cliente TEM (D) e o que ele DEVE (C) — sem a linha de capital, que é calculada aqui
 * @param {() => string} [args.gerarId]  injetável para teste determinístico; produção usa Math.random
 * @returns {{lancamento: object, linhas: object[], capitalCalculado: number}}
 */
export function montarLancamentoAbertura({ inicioDoServico, itens, gerarId = uidPadrao }) {
  if (!inicioDoServico) throw new Error("inicioDoServico é obrigatório — sem ele não dá para datar a abertura");
  if (!itens || itens.length === 0) throw new Error("balanço de abertura sem nenhum item — o cliente tem PELO MENOS caixa ou banco");

  for (const item of itens) {
    if (!["D", "C"].includes(item.tipo)) throw new Error(`item com tipo inválido: ${JSON.stringify(item)}`);
    if (!(item.valor > 0)) throw new Error(`item com valor inválido (precisa ser > 0): ${JSON.stringify(item)}`);
  }

  const somaDebitos = itens.filter((i) => i.tipo === "D").reduce((s, i) => s + i.valor, 0);
  const somaCreditos = itens.filter((i) => i.tipo === "C").reduce((s, i) => s + i.valor, 0);
  const capitalCalculado = somaDebitos - somaCreditos;

  const idLancamento = gerarId();
  const data = diaAnterior(inicioDoServico);

  const linhas = itens.map((item) => ({
    id: gerarId(),
    lancamentoId: idLancamento,
    contaId: item.contaId,
    tipo: item.tipo,
    valor: item.valor,
    descricao: item.descricao ?? null,
    vencimento: item.vencimento ?? null,
  }));

  /* Capital do titular fecha a diferença. Arredondar para 2 casas evita
     sobra de centavo por erro de ponto flutuante virando uma linha
     "quase zero" — que quebraria a trava por 1 centavo sem motivo real. */
  const valorCapital = Math.round(Math.abs(capitalCalculado) * 100) / 100;
  if (valorCapital > 0) {
    linhas.push({
      id: gerarId(),
      lancamentoId: idLancamento,
      contaId: "capital_titular",
      /* patrimônio positivo (tem mais do que deve) = crédito, fechando os débitos;
         patrimônio negativo (deve mais do que tem) = débito, fechando os créditos */
      tipo: capitalCalculado >= 0 ? "C" : "D",
      valor: valorCapital,
      descricao: "Capital de abertura — calculado, não informado pelo cliente",
      vencimento: null,
    });
  }

  const lancamento = {
    id: idLancamento,
    data,
    dataCompetencia: data,
    descricao: "Balanço de abertura",
    origem: "abertura",
    documento: null,
  };

  return { lancamento, linhas, capitalCalculado };
}
