/* Testes de src/dominio/roteiro.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { perguntasPara, pendentesDeAprofundamento, progresso, BLOCOS_DO_CLIENTE, respostaPorDestino, respostasParaNegocio } from "../src/dominio/roteiro.mjs";

const PERGUNTAS = [
  { id: "p1", bloco: 1, ordem: 1, pergunta: "Quando abriu o MEI?", tipos: ["mei"], arquetipos: null, essencial: true, ativo: true },
  { id: "p2", bloco: 1, ordem: 4, pergunta: "Vende para empresa?", tipos: ["informal"], arquetipos: null, essencial: true, ativo: true },
  { id: "p3", bloco: 1, ordem: 6, pergunta: "WhatsApp", tipos: null, arquetipos: null, essencial: true, ativo: true },
  { id: "p4", bloco: 4, ordem: 14, pergunta: "Cobra deslocamento?", tipos: null, arquetipos: ["servico_mao_obra"], essencial: true, ativo: true },
  { id: "p5", bloco: 4, ordem: 10, pergunta: "Margem da revenda?", tipos: null, arquetipos: ["revenda"], essencial: false, ativo: true },
  { id: "p6", bloco: 4, ordem: 4, pergunta: "Tem mês forte e fraco?", tipos: null, arquetipos: null, essencial: false, ativo: true },
  { id: "p7", bloco: 6, ordem: 1, pergunta: "Quanto e como paga", tipos: null, arquetipos: null, essencial: true, ativo: true },
  { id: "p8", bloco: 2, ordem: 1, pergunta: "Pergunta desativada", tipos: null, arquetipos: null, essencial: true, ativo: false },
];

test("informal NÃO recebe pergunta de MEI — o bug que os arquétipos vieram corrigir", () => {
  const ids = perguntasPara(PERGUNTAS, { tipo: "informal", arquetipo: null }).map((p) => p.id);
  assert.ok(!ids.includes("p1"), "vazou pergunta de MEI para informal");
  assert.ok(ids.includes("p2"), "informal precisa da pergunta dele");
});

test("MEI não recebe a pergunta que é só de informal", () => {
  const ids = perguntasPara(PERGUNTAS, { tipo: "mei", arquetipo: null }).map((p) => p.id);
  assert.ok(ids.includes("p1"));
  assert.ok(!ids.includes("p2"));
});

test("pergunta de arquétipo só aparece para o arquétipo dela", () => {
  const eletricista = perguntasPara(PERGUNTAS, { tipo: "informal", arquetipo: "servico_mao_obra" }).map((p) => p.id);
  assert.ok(eletricista.includes("p4"), "eletricista precisa da pergunta de deslocamento");
  assert.ok(!eletricista.includes("p5"), "não deveria receber pergunta de revenda");

  const loja = perguntasPara(PERGUNTAS, { tipo: "mei", arquetipo: "revenda" }).map((p) => p.id);
  assert.ok(loja.includes("p5"));
  assert.ok(!loja.includes("p4"));
});

test("negócio sem arquétipo recebe só as universais, sem quebrar", () => {
  const ids = perguntasPara(PERGUNTAS, { tipo: "mei", arquetipo: null }).map((p) => p.id);
  assert.ok(ids.includes("p3"));
  assert.ok(!ids.includes("p4") && !ids.includes("p5"));
});

test("apenasEssenciais corta o aprofundamento — é a primeira conversa", () => {
  const ids = perguntasPara(PERGUNTAS, { tipo: "mei", arquetipo: "revenda", apenasEssenciais: true }).map((p) => p.id);
  assert.ok(!ids.includes("p5"), "p5 é aprofundamento");
  assert.ok(!ids.includes("p6"), "p6 é aprofundamento");
  assert.ok(ids.includes("p1"));
});

test("pergunta desativada nunca aparece", () => {
  const ids = perguntasPara(PERGUNTAS, { tipo: "mei", arquetipo: null }).map((p) => p.id);
  assert.ok(!ids.includes("p8"));
});

test("vem ordenado por bloco e ordem", () => {
  const r = perguntasPara(PERGUNTAS, { tipo: "informal", arquetipo: "servico_mao_obra" });
  const chaves = r.map((p) => p.bloco * 100 + p.ordem);
  assert.deepEqual(chaves, [...chaves].sort((a, b) => a - b));
});

test("o formulário do cliente exclui o Bloco 6 — combinado é conversa, não coleta", () => {
  assert.ok(!BLOCOS_DO_CLIENTE.includes(6));
  const ids = perguntasPara(PERGUNTAS, { tipo: "mei", arquetipo: null, blocos: BLOCOS_DO_CLIENTE }).map((p) => p.id);
  assert.ok(!ids.includes("p7"), "preço e 'o que eu não faço' não vão num formulário");
});

test("o formulário do cliente INCLUI o balanço de abertura (bloco 3)", () => {
  assert.ok(BLOCOS_DO_CLIENTE.includes(3));
});

test("pendentesDeAprofundamento só lista o que falta e não é essencial", () => {
  const respostas = { p6: "sim, dezembro é forte" };
  const pend = pendentesDeAprofundamento(PERGUNTAS, respostas, { tipo: "mei", arquetipo: "revenda" });
  const ids = pend.map((p) => p.id);
  assert.ok(ids.includes("p5"), "p5 é aprofundamento e não foi respondida");
  assert.ok(!ids.includes("p6"), "p6 já foi respondida");
  assert.ok(!ids.includes("p1"), "p1 é essencial, não entra no aprofundamento");
});

test("resposta em branco conta como não respondida", () => {
  const pend = pendentesDeAprofundamento(PERGUNTAS, { p6: "   " }, { tipo: "mei", arquetipo: null });
  assert.ok(pend.map((p) => p.id).includes("p6"));
});

test("respostaPorDestino: acha pela coluna destino, não pelo texto — devolve null se pergunta ou resposta não existir", () => {
  const perguntas = [{ id: "m1", destino: "carta.meta" }, { id: "m2", destino: "roteiro_respostas" }];
  assert.equal(respostaPorDestino(perguntas, { m1: "Comprar uma máquina nova" }, "carta.meta"), "Comprar uma máquina nova");
  assert.equal(respostaPorDestino(perguntas, {}, "carta.meta"), null, "pergunta existe mas sem resposta ainda");
  assert.equal(respostaPorDestino(perguntas, { m1: "   " }, "carta.meta"), null, "resposta em branco conta como sem resposta");
  assert.equal(respostaPorDestino(perguntas, { m1: "x" }, "retrato.meta"), null, "destino que não existe na lista");
});

test("respostasParaNegocio: pega negocios.* de QUALQUER bloco, não só do Bloco 1 (regressão do bug de 15/ago)", () => {
  const perguntas = [
    { id: "p1", bloco: 1, destino: "negocios.atividade", tipo_resposta: "texto" },
    { id: "p2", bloco: 2, destino: "negocios.dinheiro_misturado", tipo_resposta: "sim_nao" },
    { id: "p3", bloco: 1, destino: "negocios.tem_funcionario", tipo_resposta: "sim_nao" },
    { id: "p4", bloco: 4, destino: "roteiro_respostas", tipo_resposta: "moeda" },
  ];
  const respostas = { p1: "Elétrica residencial", p2: "sim", p3: "nao", p4: "3500" };
  const patch = respostasParaNegocio(perguntas, respostas);
  assert.deepEqual(patch, { atividade: "Elétrica residencial", dinheiro_misturado: true, tem_funcionario: false });
});

test("respostasParaNegocio: sem_nao vira boolean, resposta em branco ou ausente não entra no patch", () => {
  const perguntas = [
    { id: "p1", bloco: 2, destino: "negocios.dinheiro_misturado", tipo_resposta: "sim_nao" },
    { id: "p2", bloco: 1, destino: "negocios.whatsapp", tipo_resposta: "texto" },
  ];
  assert.deepEqual(respostasParaNegocio(perguntas, { p1: "nao", p2: "" }), { dinheiro_misturado: false });
  assert.deepEqual(respostasParaNegocio(perguntas, {}), {});
});

test("progresso conta respondidas sobre total", () => {
  const perguntas = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  assert.deepEqual(progresso(perguntas, { a: "x", b: "y" }), { respondidas: 2, total: 4, fracao: 0.5 });
  assert.deepEqual(progresso([], {}), { respondidas: 0, total: 0, fracao: 1 });
});
