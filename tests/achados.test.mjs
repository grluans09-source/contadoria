/* Testes de src/dominio/achados.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import {
  mesesSemMovimento, despesasForaDoPadrao, receitasSemDinheiro, encontrarAchados,
  retiradaAcimaDoResultado, mercadoriaParadaComTerceiro, taxaEngolindoMargem, semReceitaNoPeriodo,
} from "../src/dominio/achados.mjs";

const CONTAS = [
  { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo" },
  { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo" },
  { id: "mercadoria_com_terceiros", codigo: "1123", nome: "Mercadoria com terceiros", tipo: "ativo" },
  { id: "capital_titular", codigo: "3101", nome: "Capital do titular", tipo: "pl" },
  { id: "retiradas_titular", codigo: "3102", nome: "Retiradas do titular", tipo: "pl" },
  { id: "venda", codigo: "4101", nome: "Venda", tipo: "receita" },
  { id: "aluguel", codigo: "5101", nome: "Aluguel", tipo: "despesa" },
  { id: "taxa_maquininha", codigo: "5105", nome: "Taxa de maquininha", tipo: "despesa" },
  { id: "taxa_plataforma", codigo: "5140", nome: "Taxa de plataforma", tipo: "despesa" },
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

/* ── Fase 7 (14/ago): os quatro que revelam a dor invisível ────── */

test("retiradaAcimaDoResultado: retirada maior que o resultado do mês acusa", () => {
  const lancamentos = [{ id: "venda", data: "2026-08-05" }, { id: "saque", data: "2026-08-10" }];
  const linhas = [
    { id: "l1", lancamentoId: "venda", contaId: "caixa", tipo: "D", valor: 2800 }, { id: "l2", lancamentoId: "venda", contaId: "venda", tipo: "C", valor: 2800 },
    { id: "l3", lancamentoId: "saque", contaId: "retiradas_titular", tipo: "D", valor: 4100 }, { id: "l4", lancamentoId: "saque", contaId: "caixa", tipo: "C", valor: 4100 },
  ];
  const achados = retiradaAcimaDoResultado(CONTAS, lancamentos, linhas, [], "2026-08-20");
  assert.equal(achados.length, 1);
  assert.equal(achados[0].retirada, 4100);
  assert.equal(achados[0].resultado, 2800);
  assert.equal(achados[0].diferenca, 1300);
});

test("retiradaAcimaDoResultado: retirada dentro do que sobrou não acusa", () => {
  const lancamentos = [{ id: "venda", data: "2026-08-05" }, { id: "saque", data: "2026-08-10" }];
  const linhas = [
    { id: "l1", lancamentoId: "venda", contaId: "caixa", tipo: "D", valor: 2800 }, { id: "l2", lancamentoId: "venda", contaId: "venda", tipo: "C", valor: 2800 },
    { id: "l3", lancamentoId: "saque", contaId: "retiradas_titular", tipo: "D", valor: 1000 }, { id: "l4", lancamentoId: "saque", contaId: "caixa", tipo: "C", valor: 1000 },
  ];
  assert.deepEqual(retiradaAcimaDoResultado(CONTAS, lancamentos, linhas, [], "2026-08-20"), []);
});

test("retiradaAcimaDoResultado: mês já fechado não acusa de novo — já foi olhado ao fechar", () => {
  const lancamentos = [{ id: "saque", data: "2026-08-10" }];
  const linhas = [{ id: "l1", lancamentoId: "saque", contaId: "retiradas_titular", tipo: "D", valor: 4100 }, { id: "l2", lancamentoId: "saque", contaId: "caixa", tipo: "C", valor: 4100 }];
  assert.deepEqual(retiradaAcimaDoResultado(CONTAS, lancamentos, linhas, ["mes:2026-08"], "2026-08-20"), []);
});

test("mercadoriaParadaComTerceiro: negócio sem a conta (não é beneficiamento) não acusa", () => {
  assert.deepEqual(mercadoriaParadaComTerceiro([{ id: "caixa", nome: "Caixa", tipo: "ativo" }], [], [], "2026-08-20"), []);
});

test("mercadoriaParadaComTerceiro: saldo positivo contínuo há mais de 15 dias acusa, com a data certa", () => {
  const lancamentos = [{ id: "envio", data: "2026-07-20" }];
  const linhas = [
    { id: "l1", lancamentoId: "envio", contaId: "mercadoria_com_terceiros", tipo: "D", valor: 900 },
    { id: "l2", lancamentoId: "envio", contaId: "caixa", tipo: "C", valor: 900 },
  ];
  const achados = mercadoriaParadaComTerceiro(CONTAS, lancamentos, linhas, "2026-08-20");
  assert.equal(achados.length, 1);
  assert.equal(achados[0].valor, 900);
  assert.equal(achados[0].desde, "2026-07-20");
  assert.equal(achados[0].dias, 31);
});

test("mercadoriaParadaComTerceiro: voltou e saiu de novo — conta desde a última vez que ficou positivo, não a primeira", () => {
  const lancamentos = [
    { id: "envio1", data: "2026-06-01" }, { id: "volta", data: "2026-06-10" }, { id: "envio2", data: "2026-08-01" },
  ];
  const linhas = [
    { id: "l1", lancamentoId: "envio1", contaId: "mercadoria_com_terceiros", tipo: "D", valor: 500 }, { id: "l2", lancamentoId: "envio1", contaId: "caixa", tipo: "C", valor: 500 },
    { id: "l3", lancamentoId: "volta", contaId: "mercadoria_com_terceiros", tipo: "C", valor: 500 }, { id: "l4", lancamentoId: "volta", contaId: "caixa", tipo: "D", valor: 500 },
    { id: "l5", lancamentoId: "envio2", contaId: "mercadoria_com_terceiros", tipo: "D", valor: 300 }, { id: "l6", lancamentoId: "envio2", contaId: "caixa", tipo: "C", valor: 300 },
  ];
  // só 19 dias desde envio2 (01/08 -> 20/08) — abaixo do mínimo de 15... então sobe: usa diasMinimo menor pra provar a data
  const achados = mercadoriaParadaComTerceiro(CONTAS, lancamentos, linhas, "2026-08-20", 10);
  assert.equal(achados.length, 1);
  assert.equal(achados[0].desde, "2026-08-01");
  assert.equal(achados[0].valor, 300);
});

test("taxaEngolindoMargem: taxa acima do limite acusa com o percentual certo", () => {
  const lancamentos = [{ id: "venda", data: "2026-08-05" }, { id: "taxa", data: "2026-08-05" }];
  const linhas = [
    { id: "l1", lancamentoId: "venda", contaId: "caixa", tipo: "D", valor: 1000 }, { id: "l2", lancamentoId: "venda", contaId: "venda", tipo: "C", valor: 1000 },
    { id: "l3", lancamentoId: "taxa", contaId: "taxa_maquininha", tipo: "D", valor: 120 }, { id: "l4", lancamentoId: "taxa", contaId: "caixa", tipo: "C", valor: 120 },
  ];
  const achados = taxaEngolindoMargem(CONTAS, lancamentos, linhas, "2026-08", "taxa_maquininha");
  assert.equal(achados.length, 1);
  assert.equal(achados[0].valor, 120);
  assert.equal(achados[0].percentual, 12);
});

test("taxaEngolindoMargem: taxa dentro do limite não acusa", () => {
  const lancamentos = [{ id: "venda", data: "2026-08-05" }, { id: "taxa", data: "2026-08-05" }];
  const linhas = [
    { id: "l1", lancamentoId: "venda", contaId: "caixa", tipo: "D", valor: 1000 }, { id: "l2", lancamentoId: "venda", contaId: "venda", tipo: "C", valor: 1000 },
    { id: "l3", lancamentoId: "taxa", contaId: "taxa_maquininha", tipo: "D", valor: 30 }, { id: "l4", lancamentoId: "taxa", contaId: "caixa", tipo: "C", valor: 30 },
  ];
  assert.deepEqual(taxaEngolindoMargem(CONTAS, lancamentos, linhas, "2026-08", "taxa_maquininha"), []);
});

test("taxaEngolindoMargem: sem contaTaxaId (arquétipo sem taxa mapeada) não acusa nem quebra", () => {
  assert.deepEqual(taxaEngolindoMargem(CONTAS, [], [], "2026-08", undefined), []);
});

test("semReceitaNoPeriodo: muitos dias sem receita no mês já em curso acusa", () => {
  const lancamentos = [{ id: "servico1", data: "2026-08-03" }];
  const linhas = [{ id: "l1", lancamentoId: "servico1", contaId: "caixa", tipo: "D", valor: 200 }, { id: "l2", lancamentoId: "servico1", contaId: "venda", tipo: "C", valor: 200 }];
  const achados = semReceitaNoPeriodo(CONTAS, lancamentos, linhas, "2026-08-20");
  assert.equal(achados.length, 1);
  assert.equal(achados[0].diasSemReceita, 19);
  assert.equal(achados[0].diaHoje, 20);
});

test("semReceitaNoPeriodo: sem NENHUMA receita ainda não acusa — pode ser só o mês não ter começado a girar", () => {
  assert.deepEqual(semReceitaNoPeriodo(CONTAS, [], [], "2026-08-20"), []);
});

test("semReceitaNoPeriodo: receita bem distribuída não acusa", () => {
  const dias = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const lancamentos = dias.map((d) => ({ id: `s${d}`, data: `2026-08-${String(d).padStart(2, "0")}` }));
  const linhas = dias.flatMap((d) => [
    { id: `l${d}a`, lancamentoId: `s${d}`, contaId: "caixa", tipo: "D", valor: 100 },
    { id: `l${d}b`, lancamentoId: `s${d}`, contaId: "venda", tipo: "C", valor: 100 },
  ]);
  assert.deepEqual(semReceitaNoPeriodo(CONTAS, lancamentos, linhas, "2026-08-20"), []);
});

test("encontrarAchados: achado de arquétipo só aparece quando o arquétipo o declara", () => {
  const lancamentos = [{ id: "envio", data: "2026-07-01" }];
  const linhas = [
    { id: "l1", lancamentoId: "envio", contaId: "mercadoria_com_terceiros", tipo: "D", valor: 900 },
    { id: "l2", lancamentoId: "envio", contaId: "caixa", tipo: "C", valor: 900 },
  ];
  const semArquetipo = encontrarAchados(CONTAS, lancamentos, linhas, [], { hoje: "2026-08-20" });
  assert.ok(!semArquetipo.some((a) => a.tipo === "mercadoria_parada_com_terceiro"));

  const comBeneficiamento = encontrarAchados(CONTAS, lancamentos, linhas, [], { arquetipo: "beneficiamento", hoje: "2026-08-20" });
  assert.ok(comBeneficiamento.some((a) => a.tipo === "mercadoria_parada_com_terceiro"));
});

/* ── F4 (14/ago): evidência e hipótese inocente ────────────────── */

test("retiradaAcimaDoResultado: evidência traz o(s) lançamento(s) de retirada do mês", () => {
  const lancamentos = [{ id: "venda", data: "2026-08-05" }, { id: "saque", data: "2026-08-10" }];
  const linhas = [
    { id: "l1", lancamentoId: "venda", contaId: "caixa", tipo: "D", valor: 2800 }, { id: "l2", lancamentoId: "venda", contaId: "venda", tipo: "C", valor: 2800 },
    { id: "l3", lancamentoId: "saque", contaId: "retiradas_titular", tipo: "D", valor: 4100 }, { id: "l4", lancamentoId: "saque", contaId: "caixa", tipo: "C", valor: 4100 },
  ];
  const achados = retiradaAcimaDoResultado(CONTAS, lancamentos, linhas, [], "2026-08-20");
  assert.deepEqual(achados[0].evidencia, ["saque"]);
});

test("receitasSemDinheiro: evidência é o próprio lançamento suspeito", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05", descricao: "Lançamento estranho" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "capital_titular", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "a", contaId: "venda", tipo: "C", valor: 100 }];
  const achados = receitasSemDinheiro(CONTAS, lancamentos, linhas);
  assert.deepEqual(achados[0].evidencia, ["a"]);
});

test("encontrarAchados: todo achado sai com hipoteseInocente anexada", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05", descricao: "X" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "capital_titular", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "a", contaId: "venda", tipo: "C", valor: 100 }];
  const achados = encontrarAchados(CONTAS, lancamentos, linhas, []);
  const receitaSemDinheiro = achados.find((a) => a.tipo === "receita_sem_dinheiro");
  assert.ok(receitaSemDinheiro.hipoteseInocente?.length > 0);
});
