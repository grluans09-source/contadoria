/* Testes de src/dominio/recorrentes.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { gerarLancamentosDoMes } from "../src/dominio/recorrentes.mjs";

let contador = 0;
const idDeterministico = () => `id${++contador}`;
function reiniciar() { contador = 0; }

const RECORRENTES = [
  { id: "rec_aluguel", descricao: "Aluguel", ativa: true },
  { id: "rec_internet", descricao: "Internet", ativa: true },
  { id: "rec_antiga", descricao: "Assinatura cancelada", ativa: false },
];

const LINHAS = [
  { id: "l1", recorrenteId: "rec_aluguel", contaId: "aluguel", tipo: "D", valor: 400 },
  { id: "l2", recorrenteId: "rec_aluguel", contaId: "caixa", tipo: "C", valor: 400 },
  { id: "l3", recorrenteId: "rec_internet", contaId: "internet_telefone", tipo: "D", valor: 100 },
  { id: "l4", recorrenteId: "rec_internet", contaId: "banco", tipo: "C", valor: 100 },
  { id: "l5", recorrenteId: "rec_antiga", contaId: "outras_despesas", tipo: "D", valor: 50 },
  { id: "l6", recorrenteId: "rec_antiga", contaId: "caixa", tipo: "C", valor: 50 },
];

test("gera um lançamento equilibrado por recorrente ativa, ignora a inativa", () => {
  reiniciar();
  const { lancamentos, linhas } = gerarLancamentosDoMes(RECORRENTES, LINHAS, [], "2026-08", "2026-08-01", idDeterministico);

  assert.equal(lancamentos.length, 2, "só as 2 ativas geram lançamento");
  assert.ok(lancamentos.every((l) => l.origem === "recorrente"));
  assert.ok(lancamentos.every((l) => l.data === "2026-08-01"));
  assert.deepEqual(lancamentos.map((l) => l.documento).sort(), ["rec_aluguel", "rec_internet"]);
  assert.equal(linhas.length, 4);
});

test("não gera de novo se já existe lançamento de recorrente naquele mês", () => {
  reiniciar();
  const jaExiste = [{ origem: "recorrente", documento: "rec_aluguel", data: "2026-08-05" }];
  const { lancamentos } = gerarLancamentosDoMes(RECORRENTES, LINHAS, jaExiste, "2026-08", "2026-08-01", idDeterministico);

  assert.equal(lancamentos.length, 1, "aluguel já gerado, só falta internet");
  assert.equal(lancamentos[0].documento, "rec_internet");
});

test("mês diferente não conta como já gerado", () => {
  reiniciar();
  const mesPassado = [{ origem: "recorrente", documento: "rec_aluguel", data: "2026-07-01" }];
  const { lancamentos } = gerarLancamentosDoMes(RECORRENTES, LINHAS, mesPassado, "2026-08", "2026-08-01", idDeterministico);

  assert.equal(lancamentos.length, 2, "julho já gerado não impede agosto");
});

test("recorrente sem nenhuma linha não gera lançamento solto (evitaria desequilíbrio)", () => {
  reiniciar();
  const semLinha = [{ id: "rec_vazio", descricao: "Sem linhas ainda", ativa: true }];
  const { lancamentos, linhas } = gerarLancamentosDoMes(semLinha, [], [], "2026-08", "2026-08-01", idDeterministico);
  assert.equal(lancamentos.length, 0);
  assert.equal(linhas.length, 0);
});

test("cada lançamento gerado bate débito com crédito (herda o equilíbrio do template)", () => {
  reiniciar();
  const { lancamentos, linhas } = gerarLancamentosDoMes(RECORRENTES, LINHAS, [], "2026-08", "2026-08-01", idDeterministico);
  for (const l of lancamentos) {
    const doLancamento = linhas.filter((ln) => ln.lancamentoId === l.id);
    const debito = doLancamento.filter((ln) => ln.tipo === "D").reduce((s, ln) => s + ln.valor, 0);
    const credito = doLancamento.filter((ln) => ln.tipo === "C").reduce((s, ln) => s + ln.valor, 0);
    assert.equal(debito, credito, `lançamento ${l.descricao} desequilibrado`);
  }
});
