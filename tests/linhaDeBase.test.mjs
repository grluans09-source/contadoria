/* Testes de src/dominio/linhaDeBase.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { montarRetratoDeEntrada, compararComAEntrada, oQueEleAchava } from "../src/dominio/linhaDeBase.mjs";

const CONTAS = [
  { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo" },
  { id: "banco", codigo: "1102", nome: "Banco", tipo: "ativo" },
  { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo" },
  { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo" },
  { id: "emprestimos", codigo: "2103", nome: "Empréstimos", tipo: "passivo" },
  { id: "capital_titular", codigo: "3101", nome: "Capital do titular", tipo: "pl" },
];

/* Abertura: 500 caixa + 2000 banco + 1500 a receber − 800 fornecedor
   − 4500 empréstimo => capital
   = 4000 − 5300 = −1300 (patrimônio negativo, e é honesto mostrar) */
const LINHAS = [
  { contaId: "caixa", tipo: "D", valor: 500 },
  { contaId: "banco", tipo: "D", valor: 2000 },
  { contaId: "clientes", tipo: "D", valor: 1500 },
  { contaId: "fornecedores", tipo: "C", valor: 800 },
  { contaId: "emprestimos", tipo: "C", valor: 4500 },
  { contaId: "capital_titular", tipo: "D", valor: 1300 },
];

const NEGOCIO = { tipo: "mei", arquetipo: "beneficiamento", dinheiro_misturado: true };

test("o retrato guarda o que ele ACREDITAVA e o que o livro MOSTROU", () => {
  const r = montarRetratoDeEntrada({
    negocio: NEGOCIO, hoje: "2026-08-14", contas: CONTAS, linhasAbertura: LINHAS,
    declarado: { faturamentoMensal: "8000", retiradaMensal: "2000", horasPorSemana: "60",
                 achaQueGanhaDinheiro: "acho que sim", temContaSeparada: "nao" },
  });

  assert.equal(r.capturadoEm, "2026-08-14");
  assert.equal(r.declarado.faturamentoMensal, 8000);
  assert.equal(r.declarado.retiradaMensal, 2000);
  assert.equal(r.medido.caixaEBanco, 2500);
  assert.equal(r.medido.aReceber, 1500);
  assert.equal(r.medido.dividasDoNegocio, 5300);
  assert.ok(r.medido.dinheiroMisturado);
  assert.ok(!r.medido.temContaSeparada);
});

test("o patrimônio negativo é registrado como negativo — a honestidade é o produto", () => {
  const r = montarRetratoDeEntrada({
    negocio: NEGOCIO, hoje: "2026-08-14", contas: CONTAS, linhasAbertura: LINHAS, declarado: {},
  });
  assert.equal(r.medido.patrimonioLiquido, -1300, "deve mais do que tem, e o sistema diz isso");
});

test("a hora declarada sai dos números dele mesmo", () => {
  const r = montarRetratoDeEntrada({
    negocio: NEGOCIO, hoje: "2026-08-14", contas: CONTAS, linhasAbertura: LINHAS,
    declarado: { retiradaMensal: "2000", horasPorSemana: "60" },
  });
  assert.equal(r.declarado.horaDeclarada, 7.67);
});

test("valor em formato brasileiro é entendido", () => {
  const r = montarRetratoDeEntrada({
    negocio: NEGOCIO, hoje: "2026-08-14", contas: CONTAS, linhasAbertura: LINHAS,
    declarado: { faturamentoMensal: "8.500,50" },
  });
  assert.equal(r.declarado.faturamentoMensal, 8500.5);
});

test("campo não respondido vira null, não zero — não se inventa dado", () => {
  const r = montarRetratoDeEntrada({
    negocio: NEGOCIO, hoje: "2026-08-14", contas: CONTAS, linhasAbertura: LINHAS, declarado: {},
  });
  assert.equal(r.declarado.faturamentoMensal, null);
  assert.equal(r.declarado.retiradaMensal, null);
  assert.equal(r.declarado.horaDeclarada, null);
});

/* ── A comparação que vira conversa ─────────────────────────── */

const ENTRADA = {
  capturadoEm: "2026-08-14",
  declarado: { faturamentoMensal: 8000, retiradaMensal: 2000, achaQueGanhaDinheiro: "acho que sim" },
  medido: { patrimonioLiquido: -1300, dividasDoNegocio: 5300, caixaEBanco: 2500 },
};

test("A COMPARAÇÃO QUE JUSTIFICA A PEÇA: ele achava que tirava 2.000, tirou 4.100", () => {
  const r = compararComAEntrada(ENTRADA, { retiradaMensal: 4100 });
  const achado = r.find((a) => a.tipo === "retirada_vs_declarado");

  assert.ok(achado, "é a comparação mais forte do serviço");
  assert.equal(achado.forca, "alta");
  assert.equal(achado.diferenca, 2100);
  /* `\s` e não espaço literal: o Intl pt-BR separa "R$" do número com
     espaço NÃO-QUEBRÁVEL (U+00A0). Regex com espaço comum nunca casa —
     armadilha que já custou um teste vermelho aqui. */
  assert.match(achado.frase, /R\$\s2\.000,00/);
  assert.match(achado.frase, /R\$\s4\.100,00/);
  assert.match(achado.frase, /a mais do que você imaginava/);
});

test("diferença pequena não vira conversa — é ruído, não achado", () => {
  const r = compararComAEntrada(ENTRADA, { retiradaMensal: 2100 });
  assert.equal(r.length, 0, "5% de diferença não merece ser dito");
});

test("o arco do patrimônio desde a entrada", () => {
  const r = compararComAEntrada(ENTRADA, { patrimonioLiquido: 400 });
  const achado = r.find((a) => a.tipo === "patrimonio_desde_a_entrada");
  assert.equal(achado.diferenca, 1700);
  assert.match(achado.frase, /subiu/);
});

test("patrimônio caindo também é dito, com a mesma clareza", () => {
  const r = compararComAEntrada(ENTRADA, { patrimonioLiquido: -3000 });
  const achado = r.find((a) => a.tipo === "patrimonio_desde_a_entrada");
  assert.match(achado.frase, /caiu/);
  assert.equal(achado.forca, "alta");
});

test("dívida caindo é notícia boa e é dita", () => {
  const r = compararComAEntrada(ENTRADA, { dividasDoNegocio: 2000 });
  const achado = r.find((a) => a.tipo === "divida_desde_a_entrada");
  assert.match(achado.frase, /caiu/);
  assert.equal(achado.forca, "media");
});

test("dívida subindo tem força alta — merece atenção", () => {
  const r = compararComAEntrada(ENTRADA, { dividasDoNegocio: 9000 });
  const achado = r.find((a) => a.tipo === "divida_desde_a_entrada");
  assert.equal(achado.forca, "alta");
  assert.match(achado.frase, /subiu/);
});

test("sem retrato ou sem situação atual, devolve vazio em vez de quebrar", () => {
  assert.deepEqual(compararComAEntrada(null, { retiradaMensal: 100 }), []);
  assert.deepEqual(compararComAEntrada(ENTRADA, null), []);
});

test("campo que não foi declarado não gera comparação inventada", () => {
  const semDeclarado = { declarado: {}, medido: { patrimonioLiquido: -1300 } };
  const r = compararComAEntrada(semDeclarado, { retiradaMensal: 4100 });
  assert.ok(!r.some((a) => a.tipo === "retirada_vs_declarado"));
});

test("oQueEleAchava devolve a frase literal dele, para ser lida de volta", () => {
  assert.equal(oQueEleAchava(ENTRADA), "acho que sim");
  assert.equal(oQueEleAchava({ declarado: {} }), null);
});
