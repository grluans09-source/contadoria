/* Testes de src/dominio/revisao.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { mesaDeRevisao, podeFecharPeriodo } from "../src/dominio/revisao.mjs";

const contas = [
  { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo" },
  { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo" },
  { id: "capital", codigo: "3101", nome: "Capital", tipo: "pl" },
  { id: "vendas", codigo: "4101", nome: "Vendas", tipo: "receita" },
  { id: "aluguel", codigo: "5101", nome: "Aluguel", tipo: "despesa" },
];

function livroLimpo() {
  const lancamentos = [
    { id: "l1", data: "2026-08-01", descricao: "Abertura" },
    { id: "l2", data: "2026-08-05", descricao: "Venda" },
  ];
  const linhas = [
    { id: "a1", lancamentoId: "l1", contaId: "caixa", tipo: "D", valor: 1000 },
    { id: "a2", lancamentoId: "l1", contaId: "capital", tipo: "C", valor: 1000 },
    { id: "a3", lancamentoId: "l2", contaId: "caixa", tipo: "D", valor: 500 },
    { id: "a4", lancamentoId: "l2", contaId: "vendas", tipo: "C", valor: 500 },
  ];
  return { lancamentos, linhas };
}

test("livro limpo: todas as checagens passam e a equação fecha", () => {
  const { lancamentos, linhas } = livroLimpo();
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  assert.ok(checks.every((c) => c.ok), JSON.stringify(checks.filter((c) => !c.ok)));
  assert.ok(podeFecharPeriodo(checks));
});

test("livro vazio também passa — nada para acusar não é o mesmo que estar furado", () => {
  const checks = mesaDeRevisao(contas, [], []);
  assert.ok(checks.every((c) => c.ok));
});

test("acusa linha órfã (conta que não existe no plano)", () => {
  const { lancamentos, linhas } = livroLimpo();
  linhas.push({ id: "x", lancamentoId: "l2", contaId: "conta-fantasma", tipo: "D", valor: 10 });
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  const check = checks.find((c) => c.nome.includes("referencia lançamento e conta"));
  assert.equal(check.ok, false);
  assert.notEqual(podeFecharPeriodo(checks), true);
});

test("acusa linha apontando para lançamento que não existe", () => {
  const { lancamentos, linhas } = livroLimpo();
  linhas.push({ id: "y", lancamentoId: "lancamento-fantasma", contaId: "caixa", tipo: "D", valor: 10 });
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  assert.equal(checks.find((c) => c.nome.includes("referencia lançamento")).ok, false);
});

test("acusa data inválida", () => {
  const { lancamentos, linhas } = livroLimpo();
  lancamentos[0].data = "12/08/2026"; // formato errado, devia ser ISO
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  assert.equal(checks.find((c) => c.nome.includes("Datas e valores")).ok, false);
});

test("acusa valor inválido (zero ou negativo)", () => {
  const { lancamentos, linhas } = livroLimpo();
  linhas[0].valor = 0;
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  assert.equal(checks.find((c) => c.nome.includes("Datas e valores")).ok, false);
});

test("acusa id de lançamento duplicado", () => {
  const { lancamentos, linhas } = livroLimpo();
  lancamentos.push({ id: "l1", data: "2026-08-09", descricao: "duplicado" }); // mesmo id de l1
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  assert.equal(checks.find((c) => c.nome.includes("Identificadores únicos")).ok, false);
});

test("acusa lançamento desequilibrado — não deveria existir, mas se existisse a Mesa precisa ver", () => {
  const { lancamentos, linhas } = livroLimpo();
  linhas.push({ id: "z", lancamentoId: "l2", contaId: "aluguel", tipo: "D", valor: 999 }); // sem contrapartida
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  assert.equal(checks.find((c) => c.nome.includes("débito = crédito")).ok, false);
});

test("a checagem da equação NÃO é tautológica — furando o livro por fora, ela acusa (lição do bug H2 do ContLife)", () => {
  const { lancamentos, linhas } = livroLimpo();
  /* Simula um livro corrompido POR FORA da trava do banco (ex.: escrita
     direta, ou um bug futuro): uma linha extra sem contrapartida em
     lugar nenhum. A equação patrimonial tem que perceber isso mesmo que
     o desequilíbrio POR LANÇAMENTO passe despercebido (linha presa a um
     lançamento que, sozinho, parece batido por coincidência de outro). */
  linhas.push({ id: "w1", lancamentoId: "l1", contaId: "aluguel", tipo: "D", valor: 200 });
  linhas.push({ id: "w2", lancamentoId: "l1", contaId: "caixa", tipo: "D", valor: 200 }); // mesmo lado, "fecha" por acidente
  const checks = mesaDeRevisao(contas, lancamentos, linhas);
  const equacao = checks.find((c) => c.nome.includes("Equação patrimonial"));
  assert.equal(equacao.ok, false, "duas linhas D sem nenhum C do outro lado deveria quebrar a equação");
});

test("podeFecharPeriodo é false se qualquer checagem falhar", () => {
  const checks = [{ ok: true }, { ok: false }, { ok: true }];
  assert.equal(podeFecharPeriodo(checks), false);
});
