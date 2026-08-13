/* Testes de src/dominio/disponivel.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { quantoPodeTirar, reservaMinima } from "../src/dominio/disponivel.mjs";

const contas = [
  { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo" },
  { id: "banco", codigo: "1102", nome: "Banco", tipo: "ativo" },
  { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo" },
  { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo" },
  { id: "das_a_pagar", codigo: "2102", nome: "DAS a pagar", tipo: "passivo" },
  { id: "emprestimos", codigo: "2103", nome: "Empréstimos", tipo: "passivo" },
  { id: "salarios_a_pagar", codigo: "2104", nome: "Salários a pagar", tipo: "passivo" },
  { id: "vendas", codigo: "4101", nome: "Vendas", tipo: "receita" },
  { id: "aluguel", codigo: "5101", nome: "Aluguel", tipo: "despesa" },
];

const HOJE = "2026-08-13";

test("caso simples: só caixa e banco, sem a receber/compromissos/reserva", () => {
  const linhas = [
    { lancamentoId: "l1", contaId: "caixa", tipo: "D", valor: 500 },
    { lancamentoId: "l1", contaId: "vendas", tipo: "C", valor: 500 },
    { lancamentoId: "l2", contaId: "banco", tipo: "D", valor: 1000 },
    { lancamentoId: "l2", contaId: "vendas", tipo: "C", valor: 1000 },
  ];
  const r = quantoPodeTirar({ contas, lancamentos: [], lancamentoLinhas: linhas, periodosFechados: [], hoje: HOJE });
  assert.equal(r.disponivelHoje, 1500);
  assert.equal(r.aReceber, 0);
  assert.equal(r.compromissos, 0);
  assert.equal(r.reserva, 0);
  assert.equal(r.podeTirar, 1500);
});

test("a receber dentro da janela de 30 dias soma; fora da janela, não", () => {
  const linhas = [
    { lancamentoId: "l1", contaId: "clientes", tipo: "D", valor: 400, vencimento: "2026-08-20" }, // dentro
    { lancamentoId: "l1", contaId: "vendas", tipo: "C", valor: 400 },
    { lancamentoId: "l2", contaId: "clientes", tipo: "D", valor: 900, vencimento: "2026-12-01" }, // fora (>30 dias)
    { lancamentoId: "l2", contaId: "vendas", tipo: "C", valor: 900 },
  ];
  const r = quantoPodeTirar({ contas, lancamentos: [], lancamentoLinhas: linhas, periodosFechados: [], hoje: HOJE });
  assert.equal(r.aReceber, 400, "só a linha dentro da janela deveria contar");
});

test("a receber NUNCA passa do saldo total da conta (o capeamento contra superestimar)", () => {
  const linhas = [
    { lancamentoId: "l1", contaId: "clientes", tipo: "D", valor: 500, vencimento: "2026-08-15" },
    { lancamentoId: "l1", contaId: "vendas", tipo: "C", valor: 500 },
    /* o cliente já pagou 500 — o crédito NÃO tem vencimento (é uma
       baixa, não uma nova conta a receber), mas reduz o saldo agregado
       de Clientes para 0. A busca "bruta" por vencimento ainda acharia
       os 500 originais (o registro da linha antiga não desaparece), e
       é exatamente esse excesso que o capeamento tem que impedir. */
    { lancamentoId: "l2", contaId: "banco", tipo: "D", valor: 500 },
    { lancamentoId: "l2", contaId: "clientes", tipo: "C", valor: 500 },
  ];
  const r = quantoPodeTirar({ contas, lancamentos: [], lancamentoLinhas: linhas, periodosFechados: [], hoje: HOJE });
  assert.equal(r.aReceber, 0, "já foi pago — não pode contar de novo só porque a linha antiga ainda tem vencimento registrado");
});

test("baixa por item pega o caso que o capeamento agregado NÃO pega sozinho", () => {
  const linhas = [
    /* uma dívida antiga, fora da janela de 30 dias, ainda em aberto —
       ela sozinha já sustenta o saldo agregado de Clientes em R$1.000,
       então o capeamento (bruto vs. saldo) não teria motivo pra cortar
       nada. */
    { lancamentoId: "lAntiga", contaId: "clientes", tipo: "D", valor: 1000, vencimento: "2026-11-01" },
    { lancamentoId: "lAntiga", contaId: "vendas", tipo: "C", valor: 1000 },
    /* uma venda a prazo DENTRO da janela — mas JÁ FOI PAGA (a linha de
       baixa aponta pra ela via baixaDe). Sem o rastreio por item, a
       busca "bruta" por vencimento ainda a encontraria (400 ≤ saldo de
       1000, o capeamento não desconfiaria de nada) e contaria de novo
       um dinheiro que já entrou. */
    { id: "rJanela", lancamentoId: "lJanela", contaId: "clientes", tipo: "D", valor: 400, vencimento: "2026-08-20" },
    { lancamentoId: "lJanela", contaId: "vendas", tipo: "C", valor: 400 },
    { lancamentoId: "lBaixa", contaId: "banco", tipo: "D", valor: 400 },
    { lancamentoId: "lBaixa", contaId: "clientes", tipo: "C", valor: 400, baixaDe: "rJanela" },
  ];
  const r = quantoPodeTirar({ contas, lancamentos: [], lancamentoLinhas: linhas, periodosFechados: [], hoje: HOJE });
  assert.equal(r.aReceber, 0, "a baixa específica precisa excluir os 400 mesmo com saldo agregado sobrando pra disfarçar");
});

test("compromissos dentro da janela reduzem o disponível; capados no saldo em aberto", () => {
  const linhas = [
    { lancamentoId: "l1", contaId: "caixa", tipo: "D", valor: 1000 },
    { lancamentoId: "l1", contaId: "vendas", tipo: "C", valor: 1000 },
    { lancamentoId: "l2", contaId: "fornecedores", tipo: "C", valor: 300, vencimento: "2026-08-25" },
    { lancamentoId: "l2", contaId: "aluguel", tipo: "D", valor: 300 },
  ];
  const r = quantoPodeTirar({ contas, lancamentos: [], lancamentoLinhas: linhas, periodosFechados: [], hoje: HOJE });
  assert.equal(r.compromissos, 300);
  assert.equal(r.podeTirar, 700);
});

test("nunca devolve valor negativo — se deve mais do que tem, o teto é zero", () => {
  const linhas = [
    { lancamentoId: "l1", contaId: "caixa", tipo: "D", valor: 100 },
    { lancamentoId: "l1", contaId: "vendas", tipo: "C", valor: 100 },
    { lancamentoId: "l2", contaId: "fornecedores", tipo: "C", valor: 5000, vencimento: "2026-08-14" },
    { lancamentoId: "l2", contaId: "aluguel", tipo: "D", valor: 5000 },
  ];
  const r = quantoPodeTirar({ contas, lancamentos: [], lancamentoLinhas: linhas, periodosFechados: [], hoje: HOJE });
  assert.equal(r.podeTirar, 0);
});

test("reservaMinima é zero sem nenhum mês fechado — sem histórico, não inventa número", () => {
  const r = reservaMinima({ contas, lancamentos: [], lancamentoLinhas: [], periodosFechados: [] });
  assert.equal(r, 0);
});

test("reservaMinima usa a MAIOR despesa entre os últimos meses fechados (conservador)", () => {
  const lancamentos = [
    { id: "l1", data: "2026-06-10" },
    { id: "l2", data: "2026-07-10" },
  ];
  const linhas = [
    { lancamentoId: "l1", contaId: "aluguel", tipo: "D", valor: 800 },
    { lancamentoId: "l2", contaId: "aluguel", tipo: "D", valor: 1200 },
  ];
  const r = reservaMinima({ contas, lancamentos, lancamentoLinhas: linhas, periodosFechados: ["mes:2026-06", "mes:2026-07"] });
  assert.equal(r, 1200, "deveria pegar o mês mais caro, não a média — é o lado conservador");
});

test("reservaMinima ignora mês com movimento mas NÃO fechado", () => {
  const lancamentos = [{ id: "l1", data: "2026-08-01" }];
  const linhas = [{ lancamentoId: "l1", contaId: "aluguel", tipo: "D", valor: 900 }];
  const r = reservaMinima({ contas, lancamentos, lancamentoLinhas: linhas, periodosFechados: [] });
  assert.equal(r, 0);
});

test("reserva entra na conta final, reduzindo o quanto pode tirar", () => {
  const lancamentosBase = [{ id: "lr", data: "2026-07-10" }];
  const linhasReserva = [{ lancamentoId: "lr", contaId: "aluguel", tipo: "D", valor: 400 }];
  const linhasSaldo = [
    { lancamentoId: "l1", contaId: "caixa", tipo: "D", valor: 1000 },
    { lancamentoId: "l1", contaId: "vendas", tipo: "C", valor: 1000 },
  ];
  const r = quantoPodeTirar({
    contas, lancamentos: lancamentosBase, lancamentoLinhas: [...linhasReserva, ...linhasSaldo],
    periodosFechados: ["mes:2026-07"], hoje: HOJE,
  });
  assert.equal(r.reserva, 400);
  assert.equal(r.podeTirar, 600);
});
