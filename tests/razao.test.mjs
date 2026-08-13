/* Testes de src/dominio/razao.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { saldoDeConta, balancete, linhasComContexto, resultadoDoMes } from "../src/dominio/razao.mjs";

const contas = [
  { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo" },
  { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo" },
  { id: "capital", codigo: "3101", nome: "Capital", tipo: "pl" },
  { id: "vendas", codigo: "4101", nome: "Vendas", tipo: "receita" },
  { id: "aluguel", codigo: "5101", nome: "Aluguel", tipo: "despesa" },
];

test("conta de ativo cresce no débito", () => {
  const linhas = [
    { contaId: "caixa", tipo: "D", valor: 1000 },
    { contaId: "caixa", tipo: "C", valor: 300 },
  ];
  assert.equal(saldoDeConta(contas[0], linhas), 700);
});

test("conta de passivo cresce no crédito", () => {
  const linhas = [
    { contaId: "fornecedores", tipo: "C", valor: 800 },
    { contaId: "fornecedores", tipo: "D", valor: 200 },
  ];
  assert.equal(saldoDeConta(contas[1], linhas), 600);
});

test("conta de receita cresce no crédito, despesa cresce no débito", () => {
  const linhas = [
    { contaId: "vendas", tipo: "C", valor: 500 },
    { contaId: "aluguel", tipo: "D", valor: 150 },
  ];
  assert.equal(saldoDeConta(contas[3], linhas), 500);
  assert.equal(saldoDeConta(contas[4], linhas), 150);
});

test("saldo ignora linhas de OUTRA conta", () => {
  const linhas = [
    { contaId: "caixa", tipo: "D", valor: 100 },
    { contaId: "vendas", tipo: "C", valor: 100 },
  ];
  assert.equal(saldoDeConta(contas[0], linhas), 100);
});

test("balancete: total débito bate com total crédito (equilibrado por construção)", () => {
  const linhas = [
    { contaId: "caixa", tipo: "D", valor: 500 },
    { contaId: "vendas", tipo: "C", valor: 500 },
    { contaId: "aluguel", tipo: "D", valor: 150 },
    { contaId: "caixa", tipo: "C", valor: 150 },
  ];
  const b = balancete(contas, linhas);
  assert.equal(b.totalDebito, 650);
  assert.equal(b.totalCredito, 650);
  assert.ok(b.fecha);
});

test("balancete: cada conta tem débito, crédito e saldo próprios, não só o líquido", () => {
  const linhas = [
    { contaId: "caixa", tipo: "D", valor: 1000 },
    { contaId: "caixa", tipo: "C", valor: 300 },
  ];
  const b = balancete(contas, linhas);
  const caixa = b.linhas.find((c) => c.id === "caixa");
  assert.equal(caixa.debito, 1000);
  assert.equal(caixa.credito, 300);
  assert.equal(caixa.saldo, 700);
});

test("balancete: conta sem nenhuma linha aparece com saldo zero, não some", () => {
  const b = balancete(contas, [{ contaId: "caixa", tipo: "D", valor: 100 }]);
  const vendas = b.linhas.find((c) => c.id === "vendas");
  assert.equal(vendas.saldo, 0);
});

test("balancete: linha órfã (conta que não existe) não derruba a tela — só é reportada", () => {
  const linhas = [{ contaId: "conta-fantasma", tipo: "D", valor: 999 }];
  const b = balancete(contas, linhas);
  assert.equal(b.orfas.length, 1);
  assert.equal(b.totalDebito, 0, "linha órfã não deveria entrar nas somas — a conta dela nem existe no plano");
});

test("resultadoDoMes: quando o dinheiro entra e o resultado bate, a variação de caixa/banco é igual ao resultado", () => {
  const lancamentos = [{ id: "l1", data: "2026-08-05" }];
  const linhas = [
    { contaId: "caixa", tipo: "D", valor: 500, lancamentoId: "l1" },
    { contaId: "vendas", tipo: "C", valor: 500, lancamentoId: "l1" },
  ];
  const r = resultadoDoMes(contas, lancamentos, linhas, "2026-08");
  assert.equal(r.receita, 500);
  assert.equal(r.resultado, 500);
  assert.equal(r.variacaoCaixaBanco, 500);
});

test("resultadoDoMes: venda a prazo — o resultado sobe mas o caixa NÃO se mexe (é a pergunta 'pra onde foi')", () => {
  const lancamentos = [{ id: "l1", data: "2026-08-05" }];
  const linhas = [
    { contaId: "vendas", tipo: "C", valor: 300, lancamentoId: "l1" },
  ];
  /* falta a contrapartida em Clientes de propósito — o teste olha só
     receita/despesa/caixa, não precisa fechar como lançamento de
     verdade para provar o comportamento da função */
  const r = resultadoDoMes(contas, lancamentos, linhas, "2026-08");
  assert.equal(r.resultado, 300);
  assert.equal(r.variacaoCaixaBanco, 0, "o resultado subiu mas nenhum caixa/banco tem linha neste mês — a diferença é exatamente o que foi para outro lugar");
});

test("resultadoDoMes ignora lançamentos de OUTRO mês", () => {
  const lancamentos = [
    { id: "l1", data: "2026-07-20" },
    { id: "l2", data: "2026-08-05" },
  ];
  const linhas = [
    { contaId: "caixa", tipo: "D", valor: 900, lancamentoId: "l1" },
    { contaId: "vendas", tipo: "C", valor: 900, lancamentoId: "l1" },
    { contaId: "caixa", tipo: "D", valor: 100, lancamentoId: "l2" },
    { contaId: "vendas", tipo: "C", valor: 100, lancamentoId: "l2" },
  ];
  const r = resultadoDoMes(contas, lancamentos, linhas, "2026-08");
  assert.equal(r.receita, 100, "julho não deveria contar no relatório de agosto");
});

test("linhasComContexto junta data e descrição do lançamento pai, ordenado por data", () => {
  const lancamentos = [
    { id: "l1", data: "2026-08-10", descricao: "Venda", origem: "manual" },
    { id: "l2", data: "2026-08-05", descricao: "Compra", origem: "manual" },
  ];
  const linhas = [
    { id: "a", lancamentoId: "l1", contaId: "caixa", tipo: "D", valor: 100 },
    { id: "b", lancamentoId: "l2", contaId: "caixa", tipo: "C", valor: 50 },
  ];
  const resultado = linhasComContexto(lancamentos, linhas);
  assert.equal(resultado[0].data, "2026-08-05"); // l2 vem primeiro, é mais antigo
  assert.equal(resultado[0].lancamentoDescricao, "Compra");
  assert.equal(resultado[1].data, "2026-08-10");
});
