/* ============================================================
   DÍVIDAS DO CLIENTE — de quem é, afinal?

   Pergunta levantada pelo dono (14/ago): "quanto você deve pra quem e
   quando — seria relacionado ao trabalho?". A resposta honesta é: às
   vezes sim, às vezes não, e existe um TERCEIRO caso que é o mais comum
   de todos em negócio pequeno e o mais fácil de errar.

   OS TRÊS CASOS
   ------------------------------------------------------------
   1. DO NEGÓCIO — fornecedor, banco no CNPJ, cartão da empresa.
      Passivo do negócio, sem discussão.

   2. PESSOAL, e o dinheiro nunca passou pelo negócio — financiamento
      da casa, cartão pessoal usado em compra pessoal.
      NÃO entra no livro. Colocar aqui faria o patrimônio do negócio
      nascer errado e o "quanto você pode tirar" ficar pessimista sem
      motivo. Mas fica REGISTRADO como nota, porque muda quanto ele
      precisa tirar por mês para viver — e isso é conversa de
      consultoria, não de escrituração.

   3. PESSOAL, mas o dinheiro entrou no negócio — pegou empréstimo no
      próprio nome para comprar a moto de entrega, o forno, o estoque.
      ESTE é o caso que quase todo mundo erra. Juridicamente a dívida é
      da pessoa; economicamente, quem vai pagar as parcelas é o caixa do
      negócio. Se ficar de fora, o "quanto você pode tirar" mente para
      cima — e é justamente o número que não pode mentir para cima
      (docs/08 §2: "errar para baixo").

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

export const CLASSIFICACOES_DIVIDA = [
  {
    id: "negocio",
    rotulo: "É do negócio",
    ajuda: "Fornecedor, empréstimo no CNPJ, cartão da empresa.",
    entraNoLivro: true,
  },
  {
    id: "pessoal_no_negocio",
    rotulo: "É pessoal, mas o dinheiro entrou no negócio",
    ajuda: "Empréstimo no seu nome para comprar equipamento, estoque, veículo do trabalho. Quem paga é o caixa do negócio, então conta.",
    entraNoLivro: true,
  },
  {
    id: "pessoal",
    rotulo: "É só pessoal",
    ajuda: "Financiamento da casa, cartão usado em compra pessoal. Não entra no livro do negócio — mas eu anoto, porque muda quanto você precisa tirar por mês.",
    entraNoLivro: false,
  },
];

/** Qual conta recebe a dívida, quando ela entra no livro.
 *  Fornecedor tem conta própria; o resto é empréstimo. */
export function contaParaDivida({ classificacao, ehFornecedor }) {
  if (classificacao === "pessoal") return null;
  if (classificacao === "negocio" && ehFornecedor) return "fornecedores";
  return "emprestimos";
}

/**
 * Separa a lista de dívidas em: o que vira linha do balanço de abertura,
 * e o que fica só como nota.
 *
 * @param {Array<{descricao, valor, vencimento, classificacao, ehFornecedor}>} dividas
 * @returns {{itens: Array, notas: Array, totalPessoal: number}}
 */
export function separarDividas(dividas) {
  const itens = [];
  const notas = [];
  let totalPessoal = 0;

  for (const d of dividas || []) {
    const valor = Number(d.valor);
    if (!(valor > 0)) continue;

    const conta = contaParaDivida({ classificacao: d.classificacao, ehFornecedor: d.ehFornecedor });

    if (!conta) {
      totalPessoal += valor;
      notas.push({ descricao: d.descricao || "Dívida pessoal", valor, vencimento: d.vencimento || null });
      continue;
    }

    itens.push({
      contaId: conta,
      tipo: "C",
      valor,
      /* A origem fica na descrição da linha: seis meses depois, olhando
         o Razão, ele precisa entender por que uma dívida pessoal está no
         livro do negócio. */
      descricao: d.classificacao === "pessoal_no_negocio"
        ? `${d.descricao || "Empréstimo"} (pessoal, aplicado no negócio)`
        : (d.descricao || null),
      vencimento: d.vencimento || null,
    });
  }

  return { itens, notas, totalPessoal };
}
