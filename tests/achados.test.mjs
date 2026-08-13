/* Testes de src/dominio/achados.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { mesesSemMovimento, despesasForaDoPadrao, receitasSemDinheiro, encontrarAchados } from "../src/dominio/achados.mjs";

const CONTAS = [
  { id: "caixa", nome: "Caixa", tipo: "ativo" },
  { id: "clientes", nome: "Clientes", tipo: "ativo" },
  { id: "capital_titular", nome: "Capital do titular", tipo: "pl" },
  { id: "venda", nome: "Venda", tipo: "receita" },
  { id: "aluguel", nome: "Aluguel", tipo: "despesa" },
];

test("mesesSemMovimento: acusa o gap no meio, ignora antes do primeiro e depois do último", () => {
  const lancamentos = [{ id: "a", data: "2026-05-10" }, { id: "b", data: "2026-07-20" }];
  assert.deepEqual(mesesSemMovimento(lancamentos), ["2026-06"]);
});

test("mesesSemMovimento: sem gap não acusa nada", () => {
  const lancamentos = [{ id: "a", data: "2026-05-10" }, { id: "b", data: "2026-06-20" }];
  assert.deepEqual(mesesSemMovimento(lancamentos), []);
});

test("mesesSemMovimento: com 0 ou 1 mês de histórico não há gap possível", () => {
  assert.deepEqual(mesesSemMovimento([]), []);
  assert.deepEqual(mesesSemMovimento([{ id: "a", data: "2026-05-10" }]), []);
});

function lanc(id, data, linhas) {
  return { lancamento: { id, data }, linhas: linhas.map((l, i) => ({ id: `${id}l${i}`, lancamentoId: id, ...l })) };
}

test("despesasForaDoPadrao: sem NENHUM mês fechado, não inventa padrão nenhum", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "aluguel", tipo: "D", valor: 2000 }, { id: "l2", lancamentoId: "a", contaId: "caixa", tipo: "C", valor: 2000 }];
  assert.deepEqual(despesasForaDoPadrao(CONTAS, lancamentos, linhas, []), []);
});

test("despesasForaDoPadrao: acusa gasto do mês aberto muito acima da média dos fechados", () => {
  const lancamentos = [
    { id: "jun", data: "2026-06-05" }, { id: "jul", data: "2026-07-05" }, { id: "ago", data: "2026-08-05" },
  ];
  const linhas = [
    { id: "l1", lancamentoId: "jun", contaId: "aluguel", tipo: "D", valor: 400 }, { id: "l2", lancamentoId: "jun", contaId: "caixa", tipo: "C", valor: 400 },
    { id: "l3", lancamentoId: "jul", contaId: "aluguel", tipo: "D", valor: 420 }, { id: "l4", lancamentoId: "jul", contaId: "caixa", tipo: "C", valor: 420 },
    { id: "l5", lancamentoId: "ago", contaId: "aluguel", tipo: "D", valor: 2000 }, { id: "l6", lancamentoId: "ago", contaId: "caixa", tipo: "C", valor: 2000 },
  ];
  const periodosFechados = ["mes:2026-06", "mes:2026-07"];
  const achados = despesasForaDoPadrao(CONTAS, lancamentos, linhas, periodosFechados);
  assert.equal(achados.length, 1);
  assert.equal(achados[0].contaId, "aluguel");
  assert.equal(achados[0].mes, "2026-08");
  assert.equal(achados[0].valor, 2000);
});

test("despesasForaDoPadrao: gasto dentro do normal não acusa", () => {
  const lancamentos = [{ id: "jun", data: "2026-06-05" }, { id: "ago", data: "2026-08-05" }];
  const linhas = [
    { id: "l1", lancamentoId: "jun", contaId: "aluguel", tipo: "D", valor: 400 }, { id: "l2", lancamentoId: "jun", contaId: "caixa", tipo: "C", valor: 400 },
    { id: "l3", lancamentoId: "ago", contaId: "aluguel", tipo: "D", valor: 420 }, { id: "l4", lancamentoId: "ago", contaId: "caixa", tipo: "C", valor: 420 },
  ];
  assert.deepEqual(despesasForaDoPadrao(CONTAS, lancamentos, linhas, ["mes:2026-06"]), []);
});

test("despesasForaDoPadrao: conta despesa sem NENHUM histórico de gasto não vira padrão inventado", () => {
  const lancamentos = [{ id: "jun", data: "2026-06-05" }, { id: "ago", data: "2026-08-05" }];
  const linhas = [
    { id: "l1", lancamentoId: "jun", contaId: "caixa", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "jun", contaId: "venda", tipo: "C", valor: 100 },
    { id: "l3", lancamentoId: "ago", contaId: "aluguel", tipo: "D", valor: 500 }, { id: "l4", lancamentoId: "ago", contaId: "caixa", tipo: "C", valor: 500 },
  ];
  assert.deepEqual(despesasForaDoPadrao(CONTAS, lancamentos, linhas, ["mes:2026-06"]), []);
});

test("receitasSemDinheiro: venda normal (débito em caixa) não acusa", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05", descricao: "Venda" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "caixa", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "a", contaId: "venda", tipo: "C", valor: 100 }];
  assert.deepEqual(receitasSemDinheiro(CONTAS, lancamentos, linhas), []);
});

test("receitasSemDinheiro: venda a prazo (débito em Clientes) não acusa — é a receber, não dinheiro sumido", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05", descricao: "Venda a prazo" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "clientes", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "a", contaId: "venda", tipo: "C", valor: 100 }];
  assert.deepEqual(receitasSemDinheiro(CONTAS, lancamentos, linhas), []);
});

test("receitasSemDinheiro: receita cuja contrapartida não é dinheiro nem a receber ACUSA", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05", descricao: "Lançamento estranho" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "capital_titular", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "a", contaId: "venda", tipo: "C", valor: 100 }];
  const achados = receitasSemDinheiro(CONTAS, lancamentos, linhas);
  assert.equal(achados.length, 1);
  assert.equal(achados[0].lancamentoId, "a");
});

test("encontrarAchados junta as três checagens", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05", descricao: "X" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "capital_titular", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "a", contaId: "venda", tipo: "C", valor: 100 }];
  const achados = encontrarAchados(CONTAS, lancamentos, linhas, []);
  assert.ok(achados.some((a) => a.tipo === "receita_sem_dinheiro"));
});
