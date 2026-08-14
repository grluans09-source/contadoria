/* Testes de src/dominio/dividas.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { separarDividas, contaParaDivida, CLASSIFICACOES_DIVIDA } from "../src/dominio/dividas.mjs";

test("dívida do negócio com fornecedor vai para Fornecedores", () => {
  assert.equal(contaParaDivida({ classificacao: "negocio", ehFornecedor: true }), "fornecedores");
});

test("dívida do negócio que não é fornecedor vai para Empréstimos", () => {
  assert.equal(contaParaDivida({ classificacao: "negocio", ehFornecedor: false }), "emprestimos");
});

test("dívida só pessoal NÃO tem conta — fica fora do livro", () => {
  assert.equal(contaParaDivida({ classificacao: "pessoal", ehFornecedor: false }), null);
});

test("O CASO QUE TODO MUNDO ERRA: pessoal com dinheiro no negócio ENTRA como empréstimo", () => {
  /* Pegou empréstimo no próprio nome para comprar a moto de entrega.
     Juridicamente é dele; economicamente, quem paga é o caixa do
     negócio. Deixar de fora faria o "quanto pode tirar" mentir pra cima. */
  assert.equal(contaParaDivida({ classificacao: "pessoal_no_negocio", ehFornecedor: false }), "emprestimos");
});

test("separarDividas manda cada uma para o lugar certo", () => {
  const { itens, notas, totalPessoal } = separarDividas([
    { descricao: "Distribuidora Silva", valor: 800, classificacao: "negocio", ehFornecedor: true, vencimento: "2026-09-10" },
    { descricao: "Financiamento da moto", valor: 4500, classificacao: "pessoal_no_negocio" },
    { descricao: "Financiamento da casa", valor: 90000, classificacao: "pessoal" },
  ]);

  assert.equal(itens.length, 2, "duas entram no livro");
  assert.equal(notas.length, 1, "a pessoal fica só como nota");
  assert.equal(totalPessoal, 90000);

  const fornecedor = itens.find((i) => i.contaId === "fornecedores");
  assert.equal(fornecedor.valor, 800);
  assert.equal(fornecedor.vencimento, "2026-09-10");
  assert.equal(fornecedor.tipo, "C", "dívida é crédito — obrigação");
});

test("a dívida pessoal aplicada no negócio explica a origem na descrição", () => {
  const { itens } = separarDividas([{ descricao: "Empréstimo Caixa", valor: 4500, classificacao: "pessoal_no_negocio" }]);
  assert.match(itens[0].descricao, /pessoal, aplicado no negócio/,
    "seis meses depois, olhando o Razão, ele precisa entender por que isso está aqui");
});

test("dívida sem valor ou com valor zero é ignorada", () => {
  const { itens, notas } = separarDividas([
    { descricao: "vazia", valor: 0, classificacao: "negocio" },
    { descricao: "sem valor", valor: "", classificacao: "negocio" },
    { descricao: "texto", valor: "abc", classificacao: "negocio" },
  ]);
  assert.equal(itens.length, 0);
  assert.equal(notas.length, 0);
});

test("lista vazia ou nula não quebra", () => {
  assert.deepEqual(separarDividas([]), { itens: [], notas: [], totalPessoal: 0 });
  assert.deepEqual(separarDividas(null), { itens: [], notas: [], totalPessoal: 0 });
});

test("as três classificações têm rótulo e ajuda — é o que o Luan lê na hora", () => {
  assert.equal(CLASSIFICACOES_DIVIDA.length, 3);
  for (const c of CLASSIFICACOES_DIVIDA) {
    assert.ok(c.id && c.rotulo && c.ajuda);
    assert.equal(typeof c.entraNoLivro, "boolean");
  }
});
