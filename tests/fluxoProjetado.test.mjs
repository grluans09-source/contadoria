/* Testes de src/dominio/fluxoProjetado.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { fluxoProjetado, aviseSobreOCaixa } from "../src/dominio/fluxoProjetado.mjs";

const HOJE = "2026-08-14";

/* R$1.000 em caixa como ponto de partida de quase todo teste. */
const caixa1000 = [{ id: "s1", lancamentoId: "ab", contaId: "caixa", tipo: "D", valor: 1000 }];

test("sem nenhum vencimento, a curva é plana e não há aviso", () => {
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: caixa1000, hoje: HOJE });
  assert.equal(f.saldoHoje, 1000);
  assert.deepEqual(f.eventos, []);
  assert.equal(f.aperto, null);
  assert.equal(aviseSobreOCaixa(f), null, "silêncio é resposta válida");
});

test("O CASO QUE JUSTIFICA A PEÇA: o dia em que o dinheiro acaba", () => {
  /* R$1.000 em caixa, R$1.800 vencendo dia 20, cliente só paga dia 25. */
  const linhas = [
    ...caixa1000,
    { id: "p1", lancamentoId: "l1", contaId: "fornecedores", tipo: "C", valor: 1800, vencimento: "2026-08-20", descricao: "Distribuidora" },
    { id: "r1", lancamentoId: "l2", contaId: "clientes", tipo: "D", valor: 1500, vencimento: "2026-08-25", descricao: "Cliente Silva" },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE });

  assert.ok(f.aperto, "precisa detectar o aperto");
  assert.equal(f.aperto.data, "2026-08-20");
  assert.equal(f.aperto.faltam, 800, "1000 - 1800 = -800");

  const aviso = aviseSobreOCaixa(f);
  assert.equal(aviso.gravidade, "aperto");
  assert.match(aviso.frase, /20\/08/);
  assert.match(aviso.frase, /800,00/);
});

test("o dinheiro que entra ANTES salva o mês — a ordem das datas importa", () => {
  const linhas = [
    ...caixa1000,
    { id: "r1", lancamentoId: "l2", contaId: "clientes", tipo: "D", valor: 1500, vencimento: "2026-08-18" },
    { id: "p1", lancamentoId: "l1", contaId: "fornecedores", tipo: "C", valor: 1800, vencimento: "2026-08-20" },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE });
  assert.equal(f.aperto, null, "recebendo antes de pagar, não aperta");
  assert.equal(f.curva.at(-1).saldo, 700);
});

test("fatura já baixada não conta de novo", () => {
  const linhas = [
    ...caixa1000,
    { id: "r1", lancamentoId: "l2", contaId: "clientes", tipo: "D", valor: 1500, vencimento: "2026-08-25" },
    /* a baixa: o cliente já pagou */
    { id: "b1", lancamentoId: "l3", contaId: "caixa", tipo: "D", valor: 1500 },
    { id: "b2", lancamentoId: "l3", contaId: "clientes", tipo: "C", valor: 1500, baixaDe: "r1" },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE });
  assert.deepEqual(f.eventos, [], "já entrou no caixa; contar de novo seria contar em dobro");
  assert.equal(f.saldoHoje, 2500);
});

test("vencimento fora da janela não entra", () => {
  const linhas = [
    ...caixa1000,
    { id: "p1", lancamentoId: "l1", contaId: "fornecedores", tipo: "C", valor: 5000, vencimento: "2027-01-10" },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE, dias: 60 });
  assert.equal(f.eventos.length, 0);
  assert.equal(f.aperto, null);
});

test("vencimento no passado não entra — já aconteceu ou está atrasado, não é projeção", () => {
  const linhas = [
    ...caixa1000,
    { id: "p1", lancamentoId: "l1", contaId: "fornecedores", tipo: "C", valor: 500, vencimento: "2026-08-01" },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE });
  assert.equal(f.eventos.length, 0);
});

test("recorrente ativo entra na projeção, no dia dele", () => {
  const recorrentes = [{ id: "rec1", descricao: "Aluguel", ativa: true, diaVencimento: 5 }];
  const recorrenteLinhas = [
    { id: "rl1", recorrenteId: "rec1", contaId: "aluguel", tipo: "D", valor: 400 },
    { id: "rl2", recorrenteId: "rec1", contaId: "caixa", tipo: "C", valor: 400 },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: caixa1000, recorrentes, recorrenteLinhas, hoje: HOJE, dias: 60 });

  assert.ok(f.eventos.length >= 1, "o aluguel de setembro precisa aparecer");
  assert.ok(f.eventos.every((e) => e.valor === -400));
  assert.ok(f.eventos.every((e) => e.data.endsWith("-05")));
});

test("recorrente DESATIVADO não entra", () => {
  const recorrentes = [{ id: "rec1", descricao: "Assinatura cancelada", ativa: false, diaVencimento: 5 }];
  const recorrenteLinhas = [
    { id: "rl1", recorrenteId: "rec1", contaId: "aluguel", tipo: "D", valor: 400 },
    { id: "rl2", recorrenteId: "rec1", contaId: "caixa", tipo: "C", valor: 400 },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: caixa1000, recorrentes, recorrenteLinhas, hoje: HOJE });
  assert.deepEqual(f.eventos, []);
});

test("NÃO inventa receita futura — só entra o que já está prometido", () => {
  /* Um negócio que fatura muito mas não tem nada registrado a receber
     não pode ter o aperto "salvo" por otimismo. */
  const linhas = [
    ...caixa1000,
    { id: "v1", lancamentoId: "l9", contaId: "caixa", tipo: "D", valor: 8000 },
    { id: "v2", lancamentoId: "l9", contaId: "venda_mercadorias", tipo: "C", valor: 8000 },
    { id: "p1", lancamentoId: "l1", contaId: "fornecedores", tipo: "C", valor: 20000, vencimento: "2026-08-20" },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE });
  assert.ok(f.aperto, "vendeu bem no passado não garante caixa no futuro");
  assert.equal(f.aperto.faltam, 11000, "9000 em caixa - 20000 = -11000");
});

test("sobra pouco também avisa, com gravidade menor", () => {
  const linhas = [
    ...caixa1000,
    { id: "p1", lancamentoId: "l1", contaId: "fornecedores", tipo: "C", valor: 960, vencimento: "2026-08-20" },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE });
  assert.equal(f.aperto, null, "não fica negativo");
  const aviso = aviseSobreOCaixa(f);
  assert.equal(aviso.gravidade, "apertado");
  assert.match(aviso.frase, /40,00/);
});

test("o piso do aviso é relativo ao que sai, não um valor fixo", () => {
  /* R$300 sobrando é folga para quem gasta pouco… */
  const pequeno = fluxoProjetado({
    lancamentos: [], hoje: HOJE,
    lancamentoLinhas: [...caixa1000, { id: "p", lancamentoId: "l", contaId: "fornecedores", tipo: "C", valor: 700, vencimento: "2026-08-20" }],
  });
  assert.equal(aviseSobreOCaixa(pequeno), null, "sobrar 300 de 700 que saem é folga");

  /* …e é risco para quem gasta muito. */
  const grande = fluxoProjetado({
    lancamentos: [], hoje: HOJE,
    lancamentoLinhas: [
      { id: "s", lancamentoId: "ab", contaId: "caixa", tipo: "D", valor: 20300 },
      { id: "p", lancamentoId: "l", contaId: "fornecedores", tipo: "C", valor: 20000, vencimento: "2026-08-20" },
    ],
  });
  assert.equal(aviseSobreOCaixa(grande).gravidade, "apertado", "sobrar 300 de 20.000 que saem é risco");
});

test("banco e caixa somam no saldo de partida", () => {
  const linhas = [
    { id: "a", lancamentoId: "ab", contaId: "caixa", tipo: "D", valor: 300 },
    { id: "b", lancamentoId: "ab", contaId: "banco", tipo: "D", valor: 700 },
  ];
  const f = fluxoProjetado({ lancamentos: [], lancamentoLinhas: linhas, hoje: HOJE });
  assert.equal(f.saldoHoje, 1000);
});

test("a descrição do lançamento pai vira o rótulo do evento", () => {
  const f = fluxoProjetado({
    hoje: HOJE,
    lancamentos: [{ id: "l1", descricao: "Compra de tecido" }],
    lancamentoLinhas: [...caixa1000, { id: "p1", lancamentoId: "l1", contaId: "fornecedores", tipo: "C", valor: 200, vencimento: "2026-08-20" }],
  });
  assert.equal(f.eventos[0].descricao, "Compra de tecido");
});
