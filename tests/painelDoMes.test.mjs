/* Testes de src/dominio/painelDoMes.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { statusDoMes, montarPainelDoMes, mensagemCobranca, nomeDoMes } from "../src/dominio/painelDoMes.mjs";

test("statusDoMes: mês fechado vence tudo, mesmo com pendência", () => {
  assert.deepEqual(statusDoMes([{ situacao: "pendente" }], true), { status: "fechado", pendentes: 0 });
});

test("statusDoMes: nenhum item chegou este mês → nada", () => {
  assert.deepEqual(statusDoMes([], false), { status: "nada", pendentes: 0 });
});

test("statusDoMes: tudo classificado ou pessoal → pronto", () => {
  const itens = [{ situacao: "classificado" }, { situacao: "pessoal" }];
  assert.deepEqual(statusDoMes(itens, false), { status: "pronto", pendentes: 0 });
});

test("statusDoMes: pendente e dúvida contam como falta", () => {
  const itens = [{ situacao: "classificado" }, { situacao: "pendente" }, { situacao: "duvida" }];
  assert.deepEqual(statusDoMes(itens, false), { status: "faltando", pendentes: 2 });
});

test("montarPainelDoMes: ignora negócio encerrado e negócio ainda não onboarded", () => {
  const negocios = [
    { id: "a", nome: "A", situacao: "ativo", configuracao: { onboarded: true } },
    { id: "b", nome: "B", situacao: "encerrado", configuracao: { onboarded: true } },
    { id: "c", nome: "C", situacao: "ativo", configuracao: {} },
  ];
  const painel = montarPainelDoMes(negocios, new Map(), new Set());
  assert.equal(painel.length, 1);
  assert.equal(painel[0].negocioId, "a");
});

test("montarPainelDoMes: ordena quem precisa de cobrança antes de quem já está pronto", () => {
  const negocios = [
    { id: "pronto", nome: "Pronto", situacao: "ativo", configuracao: { onboarded: true } },
    { id: "nada", nome: "Nada", situacao: "ativo", configuracao: { onboarded: true } },
    { id: "fechado", nome: "Fechado", situacao: "ativo", configuracao: { onboarded: true } },
    { id: "faltando", nome: "Faltando", situacao: "ativo", configuracao: { onboarded: true } },
  ];
  const itensPorNegocio = new Map([
    ["pronto", [{ situacao: "classificado" }]],
    ["faltando", [{ situacao: "pendente" }]],
  ]);
  const painel = montarPainelDoMes(negocios, itensPorNegocio, new Set(["fechado"]));
  assert.deepEqual(painel.map((l) => l.negocioId), ["nada", "faltando", "pronto", "fechado"]);
});

test("mensagemCobranca: só existe para quem falta algo, null para pronto/fechado", () => {
  assert.equal(mensagemCobranca({ status: "pronto", nome: "X" }, "2026-08"), null);
  assert.equal(mensagemCobranca({ status: "fechado", nome: "X" }, "2026-08"), null);
  assert.ok(mensagemCobranca({ status: "nada", nome: "X" }, "2026-08").includes("X"));
  assert.ok(mensagemCobranca({ status: "nada", nome: "X" }, "2026-08").includes("agosto/2026"));
});

test("mensagemCobranca: usa o apelido quando existe, não o nome", () => {
  const msg = mensagemCobranca({ status: "faltando", pendentes: 3, nome: "Salgados da Léia", apelido: "Léia" }, "2026-08");
  assert.ok(msg.includes("Léia"));
  assert.ok(!msg.includes("Salgados"));
  assert.ok(msg.includes("3 itens"));
});

test("mensagemCobranca: singular quando é só 1 item pendente", () => {
  const msg = mensagemCobranca({ status: "faltando", pendentes: 1, nome: "X" }, "2026-08");
  assert.ok(msg.includes("1 item "));
});

test("nomeDoMes formata mês/ano por extenso", () => {
  assert.equal(nomeDoMes("2026-08"), "agosto/2026");
  assert.equal(nomeDoMes("2026-01"), "janeiro/2026");
});
