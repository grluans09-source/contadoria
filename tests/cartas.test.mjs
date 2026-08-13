/* Testes de src/dominio/cartas.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { cartaPendenteDeAvaliacao } from "../src/dominio/cartas.mjs";

test("acha a carta do mês anterior, com texto, ainda sem avaliação", () => {
  const cartas = [{ mes: "2026-07", texto: "Trocar de fornecedor", seguida: null }];
  const c = cartaPendenteDeAvaliacao(cartas, "2026-08");
  assert.equal(c.mes, "2026-07");
});

test("carta já avaliada (seguida true ou false) não volta a perguntar", () => {
  assert.equal(cartaPendenteDeAvaliacao([{ mes: "2026-07", texto: "X", seguida: true }], "2026-08"), null);
  assert.equal(cartaPendenteDeAvaliacao([{ mes: "2026-07", texto: "X", seguida: false }], "2026-08"), null);
});

test("carta sem texto (vazia) não gera pergunta — nada foi recomendado", () => {
  assert.equal(cartaPendenteDeAvaliacao([{ mes: "2026-07", texto: "", seguida: null }], "2026-08"), null);
});

test("ignora cartas do mês atual ou futuras", () => {
  const cartas = [{ mes: "2026-08", texto: "Deste mês", seguida: null }];
  assert.equal(cartaPendenteDeAvaliacao(cartas, "2026-08"), null);
});

test("com várias pendentes, pega a mais recente antes do mês atual", () => {
  const cartas = [
    { mes: "2026-05", texto: "Antiga", seguida: null },
    { mes: "2026-07", texto: "Mais recente", seguida: null },
    { mes: "2026-06", texto: "Do meio", seguida: null },
  ];
  const c = cartaPendenteDeAvaliacao(cartas, "2026-08");
  assert.equal(c.mes, "2026-07");
});

test("sem nenhuma carta anterior, devolve null", () => {
  assert.equal(cartaPendenteDeAvaliacao([], "2026-08"), null);
});
