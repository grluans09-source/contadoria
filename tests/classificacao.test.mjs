/* Testes de src/dominio/classificacao.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { sugerirConta, construirLancamentoDeClassificacao, construirMovimentoPessoal } from "../src/dominio/classificacao.mjs";
import { saldoDeConta } from "../src/dominio/razao.mjs";

let contador = 0;
const idDeterministico = () => `id${++contador}`;
function reiniciar() { contador = 0; }

test("sugerirConta acha regra cujo padrão é substring da descrição", () => {
  const regras = [{ padrao: "POSTO IPIRANGA", contaId: "combustivel", acertos: 3 }];
  const sugestao = sugerirConta("POSTO IPIRANGA LOJA 42", regras);
  assert.equal(sugestao.contaId, "combustivel");
});

test("sugerirConta devolve null quando nada combina", () => {
  assert.equal(sugerirConta("PIX RECEBIDO JOAO", [{ padrao: "POSTO IPIRANGA", contaId: "combustivel", acertos: 1 }]), null);
});

test("sugerirConta prefere o padrão MAIS ESPECÍFICO entre vários que combinam", () => {
  const regras = [
    { padrao: "MERCADO", contaId: "material_consumo", acertos: 5 },
    { padrao: "MERCADO EXTRA", contaId: "outras_despesas", acertos: 1 },
  ];
  const sugestao = sugerirConta("COMPRA MERCADO EXTRA UNID 12", regras);
  assert.equal(sugestao.contaId, "outras_despesas", "o padrão mais longo/específico deveria vencer, mesmo com menos acertos");
});

test("sugerirConta é insensível a maiúscula/minúscula", () => {
  const regras = [{ padrao: "netflix", contaId: "marketing", acertos: 1 }];
  assert.ok(sugerirConta("PAGAMENTO NETFLIX.COM", regras));
});

test("construirLancamentoDeClassificacao: dinheiro que ENTROU vira débito na conta de trânsito", () => {
  reiniciar();
  const item = { data: "2026-08-12", descricaoBruta: "PIX RECEBIDO JOAO", valor: 150, contaOrigemId: "banco", origem: "extrato" };
  const { lancamento, linhas } = construirLancamentoDeClassificacao(item, "prestacao_servicos", idDeterministico);

  assert.equal(lancamento.origem, "extrato");
  assert.equal(lancamento.descricao, "PIX RECEBIDO JOAO");

  const linhaBanco = linhas.find((l) => l.contaId === "banco");
  const linhaCategoria = linhas.find((l) => l.contaId === "prestacao_servicos");
  assert.equal(linhaBanco.tipo, "D");
  assert.equal(linhaCategoria.tipo, "C");
  assert.equal(linhaBanco.valor, 150);
  assert.equal(linhaCategoria.valor, 150);
});

test("construirLancamentoDeClassificacao: dinheiro que SAIU vira crédito na conta de trânsito", () => {
  const item = { data: "2026-08-12", descricaoBruta: "POSTO IPIRANGA", valor: -80, contaOrigemId: "banco", origem: "extrato" };
  const { linhas } = construirLancamentoDeClassificacao(item, "combustivel", idDeterministico);
  const linhaBanco = linhas.find((l) => l.contaId === "banco");
  const linhaCategoria = linhas.find((l) => l.contaId === "combustivel");
  assert.equal(linhaBanco.tipo, "C");
  assert.equal(linhaCategoria.tipo, "D");
});

test("construirLancamentoDeClassificacao: as duas linhas SEMPRE fecham (mesmo valor absoluto)", () => {
  const item = { data: "2026-08-12", descricaoBruta: "x", valor: -37.45, contaOrigemId: "caixa" };
  const { linhas } = construirLancamentoDeClassificacao(item, "energia", idDeterministico);
  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + l.valor, 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + l.valor, 0);
  assert.equal(somaD, somaC);
});

test("recusa item sem contaOrigemId", () => {
  assert.throws(() => construirLancamentoDeClassificacao({ data: "2026-08-12", valor: 10 }, "energia", idDeterministico));
});

test("recusa sem escolher conta de categoria", () => {
  assert.throws(() => construirLancamentoDeClassificacao({ data: "2026-08-12", valor: 10, contaOrigemId: "caixa" }, "", idDeterministico));
});

test("recusa item com valor zero", () => {
  assert.throws(() => construirLancamentoDeClassificacao({ data: "2026-08-12", valor: 0, contaOrigemId: "caixa" }, "energia", idDeterministico));
});

/* ============================================================
   MOVIMENTO PESSOAL COM DINHEIRO MISTURADO

   O achado de 13/ago: "é pessoal" não podia continuar sendo "some do
   livro" quando o dinheiro é misturado — o saldo passava a mentir.
   ============================================================ */

test("gasto pessoal vira RETIRADA: debita patrimônio, credita a conta de onde saiu", () => {
  reiniciar();
  const item = { data: "2026-08-12", descricaoBruta: "MERCADO EXTRA", valor: -200, contaOrigemId: "caixa" };
  const { lancamento, linhas } = construirMovimentoPessoal(item, idDeterministico);

  assert.match(lancamento.descricao, /Retirada do titular/);
  assert.equal(linhas.length, 2);

  const patrimonio = linhas.find((l) => l.contaId === "retiradas_titular");
  const transito = linhas.find((l) => l.contaId === "caixa");
  assert.equal(patrimonio.tipo, "D", "retirada reduz o patrimônio — débito em Retiradas");
  assert.equal(transito.tipo, "C", "o dinheiro saiu do caixa");
  assert.equal(patrimonio.valor, 200);
});

test("dinheiro pessoal ENTRANDO vira APORTE, não receita — senão inflaria o faturamento", () => {
  reiniciar();
  const item = { data: "2026-08-12", descricaoBruta: "TRANSFERENCIA SALARIO", valor: 1500, contaOrigemId: "banco" };
  const { lancamento, linhas } = construirMovimentoPessoal(item, idDeterministico);

  assert.match(lancamento.descricao, /Aporte do titular/);
  const patrimonio = linhas.find((l) => l.contaId === "capital_titular");
  const transito = linhas.find((l) => l.contaId === "banco");
  assert.equal(patrimonio.tipo, "C", "aporte aumenta o patrimônio");
  assert.equal(transito.tipo, "D", "o dinheiro entrou no banco");
  assert.ok(!linhas.some((l) => l.contaId.startsWith("venda") || l.contaId.startsWith("prestacao")),
    "não pode encostar em conta de receita");
});

test("o lançamento de movimento pessoal fecha D = C", () => {
  reiniciar();
  for (const valor of [-200, 1500, -0.01]) {
    const { linhas } = construirMovimentoPessoal(
      { data: "2026-08-12", descricaoBruta: "X", valor, contaOrigemId: "caixa" }, idDeterministico);
    const d = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + l.valor, 0);
    const c = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + l.valor, 0);
    assert.equal(Math.round(d * 100), Math.round(c * 100), `desequilibrado para valor ${valor}`);
  }
});

test("O TESTE QUE IMPORTA: depois da retirada, o saldo de caixa bate com a realidade", () => {
  reiniciar();
  const contaCaixa = { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo" };

  /* Abertura: R$ 1.000 em caixa (dinheiro misturado — tudo entrou como
     capital do negócio). */
  const linhas = [{ lancamentoId: "abertura", contaId: "caixa", tipo: "D", valor: 1000 }];
  assert.equal(saldoDeConta(contaCaixa, linhas), 1000);

  /* Ele gasta R$ 200 no mercado, pessoal. Antes deste conserto isso não
     gerava lançamento e o livro continuaria dizendo 1000 — mentindo. */
  const { linhas: linhasRetirada } = construirMovimentoPessoal(
    { data: "2026-08-12", descricaoBruta: "MERCADO", valor: -200, contaOrigemId: "caixa" }, idDeterministico);
  linhas.push(...linhasRetirada);

  assert.equal(saldoDeConta(contaCaixa, linhas), 800, "o caixa precisa refletir que o dinheiro saiu de verdade");
});

test("recusa item sem conta de origem ou com valor zero", () => {
  assert.throws(() => construirMovimentoPessoal({ data: "2026-08-12", descricaoBruta: "X", valor: -100 }));
  assert.throws(() => construirMovimentoPessoal({ data: "2026-08-12", descricaoBruta: "X", valor: 0, contaOrigemId: "caixa" }));
});
