/* Testes de src/dominio/classificacao.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { sugerirConta, construirLancamentoDeClassificacao } from "../src/dominio/classificacao.mjs";

let contador = 0;
const idDeterministico = () => `id${++contador}`;
function reiniciar() { contador = 0; }

test("sugerirConta acha regra cujo padrão é substring da descrição", () => {
  const regras = [{ padrao: "POSTO IPIRANGA", contaId: "combustivel", acertos: 3 }];
  const sugestao = sugerirConta("POSTO IPIRANGA LOJA 42", regras);
  assert.equal(sugestao.contaId, "combustivel");
});

test("sugerirConta devolve null quando nada combina", () => {
  assert.equal(sugerirConta("PIX RECEBIDO JOAO", [{ padrao: "POSTO IPIRANGA", contaId: "combustivel", acertos: 1 }]), null);
});

test("sugerirConta prefere o padrão MAIS ESPECÍFICO entre vários que combinam", () => {
  const regras = [
    { padrao: "MERCADO", contaId: "material_consumo", acertos: 5 },
    { padrao: "MERCADO EXTRA", contaId: "outras_despesas", acertos: 1 },
  ];
  const sugestao = sugerirConta("COMPRA MERCADO EXTRA UNID 12", regras);
  assert.equal(sugestao.contaId, "outras_despesas", "o padrão mais longo/específico deveria vencer, mesmo com menos acertos");
});

test("sugerirConta é insensível a maiúscula/minúscula", () => {
  const regras = [{ padrao: "netflix", contaId: "marketing", acertos: 1 }];
  assert.ok(sugerirConta("PAGAMENTO NETFLIX.COM", regras));
});

test("construirLancamentoDeClassificacao: dinheiro que ENTROU vira débito na conta de trânsito", () => {
  reiniciar();
  const item = { data: "2026-08-12", descricaoBruta: "PIX RECEBIDO JOAO", valor: 150, contaOrigemId: "banco", origem: "extrato" };
  const { lancamento, linhas } = construirLancamentoDeClassificacao(item, "prestacao_servicos", idDeterministico);

  assert.equal(lancamento.origem, "extrato");
  assert.equal(lancamento.descricao, "PIX RECEBIDO JOAO");

  const linhaBanco = linhas.find((l) => l.contaId === "banco");
  const linhaCategoria = linhas.find((l) => l.contaId === "prestacao_servicos");
  assert.equal(linhaBanco.tipo, "D");
  assert.equal(linhaCategoria.tipo, "C");
  assert.equal(linhaBanco.valor, 150);
  assert.equal(linhaCategoria.valor, 150);
});

test("construirLancamentoDeClassificacao: dinheiro que SAIU vira crédito na conta de trânsito", () => {
  const item = { data: "2026-08-12", descricaoBruta: "POSTO IPIRANGA", valor: -80, contaOrigemId: "banco", origem: "extrato" };
  const { linhas } = construirLancamentoDeClassificacao(item, "combustivel", idDeterministico);
  const linhaBanco = linhas.find((l) => l.contaId === "banco");
  const linhaCategoria = linhas.find((l) => l.contaId === "combustivel");
  assert.equal(linhaBanco.tipo, "C");
  assert.equal(linhaCategoria.tipo, "D");
});

test("construirLancamentoDeClassificacao: as duas linhas SEMPRE fecham (mesmo valor absoluto)", () => {
  const item = { data: "2026-08-12", descricaoBruta: "x", valor: -37.45, contaOrigemId: "caixa" };
  const { linhas } = construirLancamentoDeClassificacao(item, "energia", idDeterministico);
  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + l.valor, 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + l.valor, 0);
  assert.equal(somaD, somaC);
});

test("recusa item sem contaOrigemId", () => {
  assert.throws(() => construirLancamentoDeClassificacao({ data: "2026-08-12", valor: 10 }, "energia", idDeterministico));
});

test("recusa sem escolher conta de categoria", () => {
  assert.throws(() => construirLancamentoDeClassificacao({ data: "2026-08-12", valor: 10, contaOrigemId: "caixa" }, "", idDeterministico));
});

test("recusa item com valor zero", () => {
  assert.throws(() => construirLancamentoDeClassificacao({ data: "2026-08-12", valor: 0, contaOrigemId: "caixa" }, "energia", idDeterministico));
});
