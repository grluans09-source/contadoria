/* Testes de src/dominio/baixas.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { recebiveisEmAberto, pagaveisEmAberto, construirBaixa } from "../src/dominio/baixas.mjs";

let contador = 0;
const idDeterministico = () => `id${++contador}`;
function reiniciar() { contador = 0; }

test("recebiveisEmAberto: acha linhas D em Clientes que ninguém baixou ainda", () => {
  const linhas = [
    { id: "r1", contaId: "clientes", tipo: "D", valor: 300, vencimento: "2026-08-20" },
    { id: "r2", contaId: "caixa", tipo: "D", valor: 100, vencimento: null }, // outra conta, ignora
  ];
  const abertos = recebiveisEmAberto(linhas);
  assert.equal(abertos.length, 1);
  assert.equal(abertos[0].id, "r1");
});

test("recebiveisEmAberto: linha já baixada (outra linha aponta baixaDe pra ela) some da lista", () => {
  const linhas = [
    { id: "r1", contaId: "clientes", tipo: "D", valor: 300, vencimento: "2026-08-20" },
    { id: "pgto", contaId: "clientes", tipo: "C", valor: 300, baixaDe: "r1" },
  ];
  assert.deepEqual(recebiveisEmAberto(linhas), []);
});

test("recebiveisEmAberto: ordena por vencimento, sem vencimento vai pro fim", () => {
  const linhas = [
    { id: "r1", contaId: "clientes", tipo: "D", valor: 100, vencimento: "2026-09-01" },
    { id: "r2", contaId: "clientes", tipo: "D", valor: 200, vencimento: "2026-08-05" },
    { id: "r3", contaId: "clientes", tipo: "D", valor: 50, vencimento: null },
  ];
  const abertos = recebiveisEmAberto(linhas);
  assert.deepEqual(abertos.map((l) => l.id), ["r2", "r1", "r3"]);
});

test("pagaveisEmAberto: acha C em qualquer conta de compromisso (fornecedores, DAS, empréstimos, salários)", () => {
  const linhas = [
    { id: "p1", contaId: "fornecedores", tipo: "C", valor: 400, vencimento: "2026-08-15" },
    { id: "p2", contaId: "das_a_pagar", tipo: "C", valor: 70, vencimento: "2026-08-20" },
    { id: "p3", contaId: "clientes", tipo: "C", valor: 300 }, // não é conta de compromisso
  ];
  const abertos = pagaveisEmAberto(linhas);
  assert.deepEqual(abertos.map((l) => l.id).sort(), ["p1", "p2"]);
});

test("construirBaixa de um RECEBÍVEL: dinheiro entra (D) na conta trânsito, credita (C) Clientes", () => {
  reiniciar();
  const original = { id: "r1", contaId: "clientes", tipo: "D", valor: 300, descricao: "Venda a prazo 10/07" };
  const { lancamento, linhas } = construirBaixa(original, "caixa", "2026-08-05", idDeterministico);

  assert.equal(lancamento.data, "2026-08-05");
  assert.match(lancamento.descricao, /Baixa/);
  assert.equal(linhas.length, 2);

  const linhaCaixa = linhas.find((l) => l.contaId === "caixa");
  const linhaClientes = linhas.find((l) => l.contaId === "clientes");
  assert.equal(linhaCaixa.tipo, "D");
  assert.equal(linhaClientes.tipo, "C");
  assert.equal(linhaClientes.valor, 300);
  assert.equal(linhaClientes.baixaDe, "r1", "a linha que quita precisa apontar pra original");
  assert.equal(linhaCaixa.baixaDe, null, "só a linha que quita carrega baixaDe, não a de trânsito");
});

test("construirBaixa de um PAGÁVEL: dinheiro sai (C) da conta trânsito, debita (D) Fornecedores", () => {
  reiniciar();
  const original = { id: "p1", contaId: "fornecedores", tipo: "C", valor: 400, descricao: "Compra a prazo" };
  const { linhas } = construirBaixa(original, "banco", "2026-08-05", idDeterministico);

  const linhaBanco = linhas.find((l) => l.contaId === "banco");
  const linhaFornecedores = linhas.find((l) => l.contaId === "fornecedores");
  assert.equal(linhaBanco.tipo, "C");
  assert.equal(linhaFornecedores.tipo, "D");
  assert.equal(linhaFornecedores.baixaDe, "p1");
});

test("construirBaixa: lançamento gerado sempre fecha D = C, herdando o valor exato da original", () => {
  reiniciar();
  const original = { id: "r1", contaId: "clientes", tipo: "D", valor: 123.45 };
  const { linhas } = construirBaixa(original, "caixa", "2026-08-05", idDeterministico);
  const d = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + l.valor, 0);
  const c = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + l.valor, 0);
  assert.equal(d, c);
});

test("construirBaixa recusa sem item original ou sem conta de trânsito", () => {
  assert.throws(() => construirBaixa(null, "caixa", "2026-08-05"));
  assert.throws(() => construirBaixa({ id: "r1", contaId: "clientes", tipo: "D", valor: 100 }, "", "2026-08-05"));
});
