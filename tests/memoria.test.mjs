/* Testes de src/dominio/memoria.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { medidoAgora, linhaDoTempo } from "../src/dominio/memoria.mjs";

const CONTAS = [
  { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo" },
  { id: "banco", codigo: "1102", nome: "Banco", tipo: "ativo" },
  { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo" },
  { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo" },
  { id: "emprestimos", codigo: "2103", nome: "Empréstimos", tipo: "passivo" },
  { id: "capital_titular", codigo: "3101", nome: "Capital do titular", tipo: "pl" },
  { id: "retiradas_titular", codigo: "3102", nome: "Retiradas do titular", tipo: "pl" },
  { id: "venda", codigo: "4101", nome: "Venda", tipo: "receita" },
  { id: "aluguel", codigo: "5101", nome: "Aluguel", tipo: "despesa" },
];

test("medidoAgora: sem nenhum mês fechado, faturamento e retirada ficam nulos (sem inventar referência)", () => {
  const lancamentos = [{ id: "a", data: "2026-08-05" }];
  const linhas = [{ id: "l1", lancamentoId: "a", contaId: "caixa", tipo: "D", valor: 1000 }, { id: "l2", lancamentoId: "a", contaId: "capital_titular", tipo: "C", valor: 1000 }];
  const agora = medidoAgora(CONTAS, lancamentos, linhas, []);
  assert.equal(agora.faturamentoMensal, null);
  assert.equal(agora.retiradaMensal, null);
  assert.equal(agora.mesReferencia, null);
  assert.equal(agora.caixaEBanco, 1000);
});

test("medidoAgora: usa o ÚLTIMO mês fechado como referência de faturamento e retirada", () => {
  const lancamentos = [
    { id: "jun_venda", data: "2026-06-05" }, { id: "jul_venda", data: "2026-07-05" }, { id: "jul_saque", data: "2026-07-10" },
  ];
  const linhas = [
    { id: "l1", lancamentoId: "jun_venda", contaId: "caixa", tipo: "D", valor: 1000 }, { id: "l2", lancamentoId: "jun_venda", contaId: "venda", tipo: "C", valor: 1000 },
    { id: "l3", lancamentoId: "jul_venda", contaId: "caixa", tipo: "D", valor: 2000 }, { id: "l4", lancamentoId: "jul_venda", contaId: "venda", tipo: "C", valor: 2000 },
    { id: "l5", lancamentoId: "jul_saque", contaId: "retiradas_titular", tipo: "D", valor: 1500 }, { id: "l6", lancamentoId: "jul_saque", contaId: "caixa", tipo: "C", valor: 1500 },
  ];
  const agora = medidoAgora(CONTAS, lancamentos, linhas, ["mes:2026-06", "mes:2026-07"]);
  assert.equal(agora.mesReferencia, "2026-07");
  assert.equal(agora.faturamentoMensal, 2000);
  assert.equal(agora.retiradaMensal, 1500);
});

test("medidoAgora: patrimônio e dívidas são o saldo vivo de hoje, não do mês de referência", () => {
  const lancamentos = [{ id: "a", data: "2026-06-05" }, { id: "b", data: "2026-08-15" }];
  const linhas = [
    { id: "l1", lancamentoId: "a", contaId: "caixa", tipo: "D", valor: 1000 }, { id: "l2", lancamentoId: "a", contaId: "capital_titular", tipo: "C", valor: 1000 },
    { id: "l3", lancamentoId: "b", contaId: "caixa", tipo: "D", valor: 500 }, { id: "l4", lancamentoId: "b", contaId: "fornecedores", tipo: "C", valor: 500 },
  ];
  const agora = medidoAgora(CONTAS, lancamentos, linhas, ["mes:2026-06"]);
  assert.equal(agora.caixaEBanco, 1500);
  assert.equal(agora.dividasDoNegocio, 500);
  assert.equal(agora.patrimonioLiquido, 1000);
});

function negocioComRetrato(capturadoEm = "2026-06-01") {
  return { retrato_de_entrada: { capturadoEm, declarado: { retiradaMensal: 2000 }, medido: { patrimonioLiquido: 500 } } };
}

test("linhaDoTempo: sem retrato e sem mês fechado, devolve lista vazia", () => {
  assert.deepEqual(linhaDoTempo({ negocio: {}, contas: CONTAS, lancamentos: [], lancamentoLinhas: [], periodosFechados: [], cartas: [] }), []);
});

test("linhaDoTempo: abertura vem primeiro, meses fechados em ordem cronológica", () => {
  const lancamentos = [{ id: "jun", data: "2026-06-05" }, { id: "jul", data: "2026-07-05" }];
  const linhas = [
    { id: "l1", lancamentoId: "jun", contaId: "caixa", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "jun", contaId: "venda", tipo: "C", valor: 100 },
    { id: "l3", lancamentoId: "jul", contaId: "caixa", tipo: "D", valor: 200 }, { id: "l4", lancamentoId: "jul", contaId: "venda", tipo: "C", valor: 200 },
  ];
  const eventos = linhaDoTempo({
    negocio: negocioComRetrato("2026-06-01"), contas: CONTAS, lancamentos, lancamentoLinhas: linhas,
    periodosFechados: ["mes:2026-07", "mes:2026-06"], cartas: [],
  });
  assert.equal(eventos.length, 3);
  assert.equal(eventos[0].tipo, "abertura");
  assert.equal(eventos[1].mes, "2026-06");
  assert.equal(eventos[2].mes, "2026-07");
});

test("linhaDoTempo: mês fechado sem carta ainda entra na linha, com carta null", () => {
  const lancamentos = [{ id: "jun", data: "2026-06-05" }];
  const linhas = [{ id: "l1", lancamentoId: "jun", contaId: "caixa", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "jun", contaId: "venda", tipo: "C", valor: 100 }];
  const eventos = linhaDoTempo({ negocio: {}, contas: CONTAS, lancamentos, lancamentoLinhas: linhas, periodosFechados: ["mes:2026-06"], cartas: [] });
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].carta, null);
  assert.equal(eventos[0].resultado.receita, 100);
});

test("linhaDoTempo: mês aberto (não fechado) NÃO entra na linha do tempo", () => {
  const lancamentos = [{ id: "ago", data: "2026-08-05" }];
  const linhas = [{ id: "l1", lancamentoId: "ago", contaId: "caixa", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "ago", contaId: "venda", tipo: "C", valor: 100 }];
  const eventos = linhaDoTempo({ negocio: {}, contas: CONTAS, lancamentos, lancamentoLinhas: linhas, periodosFechados: [], cartas: [] });
  assert.deepEqual(eventos, []);
});

test("linhaDoTempo: junta a carta certa a cada mês, com o campo `seguida`", () => {
  const lancamentos = [{ id: "jun", data: "2026-06-05" }];
  const linhas = [{ id: "l1", lancamentoId: "jun", contaId: "caixa", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "jun", contaId: "venda", tipo: "C", valor: 100 }];
  const cartas = [{ mes: "2026-06", texto: "Trocar de fornecedor", seguida: true }];
  const eventos = linhaDoTempo({ negocio: {}, contas: CONTAS, lancamentos, lancamentoLinhas: linhas, periodosFechados: ["mes:2026-06"], cartas });
  assert.equal(eventos[0].carta.texto, "Trocar de fornecedor");
  assert.equal(eventos[0].carta.seguida, true);
});

test("linhaDoTempo: junta só os evitados DAQUELE mês a cada evento", () => {
  const lancamentos = [{ id: "jun", data: "2026-06-05" }, { id: "jul", data: "2026-07-05" }];
  const linhas = [
    { id: "l1", lancamentoId: "jun", contaId: "caixa", tipo: "D", valor: 100 }, { id: "l2", lancamentoId: "jun", contaId: "venda", tipo: "C", valor: 100 },
    { id: "l3", lancamentoId: "jul", contaId: "caixa", tipo: "D", valor: 200 }, { id: "l4", lancamentoId: "jul", contaId: "venda", tipo: "C", valor: 200 },
  ];
  const evitados = [
    { id: "e1", mes: "2026-06", descricao: "Evitou compra errada", valorEstimado: 500 },
    { id: "e2", mes: "2026-07", descricao: "Evitou desenquadramento" },
  ];
  const eventos = linhaDoTempo({
    negocio: {}, contas: CONTAS, lancamentos, lancamentoLinhas: linhas,
    periodosFechados: ["mes:2026-06", "mes:2026-07"], cartas: [], evitados,
  });
  const junho = eventos.find((e) => e.mes === "2026-06");
  const julho = eventos.find((e) => e.mes === "2026-07");
  assert.equal(junho.evitados.length, 1);
  assert.equal(junho.evitados[0].id, "e1");
  assert.equal(julho.evitados[0].id, "e2");
});
