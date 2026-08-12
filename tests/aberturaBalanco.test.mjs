/* Testes de src/dominio/aberturaBalanco.mjs — docs/06 §4.
   Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { montarLancamentoAbertura, diaAnterior } from "../src/dominio/aberturaBalanco.mjs";

let contador = 0;
const idDeterministico = () => `id${++contador}`;
function reiniciarIds() { contador = 0; }

test("diaAnterior recua um dia, mesmo virando mês", () => {
  assert.equal(diaAnterior("2026-08-12"), "2026-08-11");
  assert.equal(diaAnterior("2026-08-01"), "2026-07-31");
  assert.equal(diaAnterior("2026-01-01"), "2025-12-31");
});

test("patrimônio positivo: capital do titular fecha como CRÉDITO", () => {
  reiniciarIds();
  const { lancamento, linhas, capitalCalculado } = montarLancamentoAbertura({
    inicioDoServico: "2026-08-12",
    itens: [
      { contaId: "caixa", tipo: "D", valor: 350 },
      { contaId: "banco", tipo: "D", valor: 1240 },
      { contaId: "fornecedores", tipo: "C", valor: 800 },
    ],
    gerarId: idDeterministico,
  });

  assert.equal(lancamento.data, "2026-08-11");
  assert.equal(lancamento.origem, "abertura");
  assert.equal(capitalCalculado, 790); // 350 + 1240 - 800

  const capital = linhas.find((l) => l.contaId === "capital_titular");
  assert.ok(capital, "deveria ter gerado a linha de capital");
  assert.equal(capital.tipo, "C");
  assert.equal(capital.valor, 790);

  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + l.valor, 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + l.valor, 0);
  assert.equal(somaD, somaC, "o lançamento inteiro precisa fechar — é o que a trava do banco exige");
});

test("patrimônio negativo (deve mais do que tem): capital do titular fecha como DÉBITO", () => {
  const { linhas, capitalCalculado } = montarLancamentoAbertura({
    inicioDoServico: "2026-08-12",
    itens: [
      { contaId: "caixa", tipo: "D", valor: 100 },
      { contaId: "emprestimos", tipo: "C", valor: 3000 },
    ],
    gerarId: idDeterministico,
  });

  assert.equal(capitalCalculado, -2900);
  const capital = linhas.find((l) => l.contaId === "capital_titular");
  assert.equal(capital.tipo, "D");
  assert.equal(capital.valor, 2900);

  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + l.valor, 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + l.valor, 0);
  assert.equal(somaD, somaC, "mesmo com patrimônio negativo, o lançamento precisa fechar");
});

test("débitos já batem com créditos: NÃO gera linha de capital zerada", () => {
  const { linhas } = montarLancamentoAbertura({
    inicioDoServico: "2026-08-12",
    itens: [
      { contaId: "caixa", tipo: "D", valor: 500 },
      { contaId: "fornecedores", tipo: "C", valor: 500 },
    ],
    gerarId: idDeterministico,
  });
  assert.equal(linhas.find((l) => l.contaId === "capital_titular"), undefined,
    "capital zerado não deveria virar linha — evita ruído no razão");
});

test("cada item carrega descrição e vencimento próprios — é o que resolve 'quem deve, quanto e pra quando'", () => {
  const { linhas } = montarLancamentoAbertura({
    inicioDoServico: "2026-08-12",
    itens: [
      { contaId: "caixa", tipo: "D", valor: 100 },
      { contaId: "clientes", tipo: "D", valor: 420, descricao: "Padaria do Chico", vencimento: "2026-08-15" },
      { contaId: "clientes", tipo: "D", valor: 180, descricao: "Mercado da Ana", vencimento: "2026-08-20" },
      { contaId: "fornecedores", tipo: "C", valor: 700 },
    ],
    gerarId: idDeterministico,
  });
  const doChico = linhas.find((l) => l.descricao === "Padaria do Chico");
  const daAna = linhas.find((l) => l.descricao === "Mercado da Ana");
  assert.equal(doChico.vencimento, "2026-08-15");
  assert.equal(daAna.vencimento, "2026-08-20");
  assert.notEqual(doChico.id, daAna.id, "duas linhas na MESMA conta precisam de identidade própria");
});

test("recusa balanço sem nenhum item", () => {
  assert.throws(() => montarLancamentoAbertura({ inicioDoServico: "2026-08-12", itens: [] }));
});

test("recusa item com valor zero ou negativo", () => {
  assert.throws(() => montarLancamentoAbertura({
    inicioDoServico: "2026-08-12",
    itens: [{ contaId: "caixa", tipo: "D", valor: 0 }],
  }));
  assert.throws(() => montarLancamentoAbertura({
    inicioDoServico: "2026-08-12",
    itens: [{ contaId: "caixa", tipo: "D", valor: -50 }],
  }));
});

test("recusa item com tipo que não é D nem C", () => {
  assert.throws(() => montarLancamentoAbertura({
    inicioDoServico: "2026-08-12",
    itens: [{ contaId: "caixa", tipo: "X", valor: 50 }],
  }));
});
