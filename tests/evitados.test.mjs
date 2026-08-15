/* Testes de src/dominio/evitados.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { totalEvitado, evitadosDoMes } from "../src/dominio/evitados.mjs";

test("totalEvitado: soma só os itens com valor estimado", () => {
  const evitados = [
    { id: "a", mes: "2026-06", descricao: "Compra errada", valorEstimado: 1200 },
    { id: "b", mes: "2026-07", descricao: "Sem número claro", valorEstimado: null },
    { id: "c", mes: "2026-07", descricao: "Desenquadramento", valorEstimado: 800.5 },
  ];
  assert.equal(totalEvitado(evitados), 2000.5);
});

test("totalEvitado: lista vazia dá zero, sem quebrar", () => {
  assert.equal(totalEvitado([]), 0);
  assert.equal(totalEvitado(undefined), 0);
});

test("evitadosDoMes: filtra só o mês pedido", () => {
  const evitados = [
    { id: "a", mes: "2026-06", descricao: "X" },
    { id: "b", mes: "2026-07", descricao: "Y" },
  ];
  const junho = evitadosDoMes(evitados, "2026-06");
  assert.equal(junho.length, 1);
  assert.equal(junho[0].id, "a");
});
