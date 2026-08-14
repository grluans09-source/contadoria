/* Testes de src/dominio/arquetipos.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { ARQUETIPOS, IDS_ARQUETIPOS, acharArquetipo, planoDeFabrica, camposAberturaDe, achadosDe } from "../src/dominio/arquetipos.mjs";
import { planoBase } from "../src/dominio/planoContas.mjs";

test("os 8 arquétipos existem e têm id único", () => {
  assert.equal(ARQUETIPOS.length, 8);
  assert.equal(new Set(IDS_ARQUETIPOS).size, 8);
});

test("todo arquétipo tem nome, resumo e exemplos — é o que o Luan lê na hora de escolher", () => {
  for (const a of ARQUETIPOS) {
    assert.ok(a.nome, `${a.id} sem nome`);
    assert.ok(a.resumo, `${a.id} sem resumo`);
    assert.ok(a.exemplos, `${a.id} sem exemplos`);
  }
});

test("todo plano gerado tem id e código únicos — código repetido quebraria a ordenação e o balancete", () => {
  for (const id of IDS_ARQUETIPOS) {
    const plano = planoDeFabrica(id);
    const ids = plano.map((c) => c.id);
    const codigos = plano.map((c) => c.codigo);
    assert.equal(new Set(ids).size, ids.length, `${id}: conta duplicada por id`);
    assert.equal(new Set(codigos).size, codigos.length, `${id}: código duplicado`);
  }
});

test("todo plano gerado tem os campos que o banco exige", () => {
  for (const id of IDS_ARQUETIPOS) {
    for (const c of planoDeFabrica(id)) {
      assert.ok(c.id && c.codigo && c.nome, `${id}: conta incompleta ${JSON.stringify(c)}`);
      assert.ok(["ativo", "passivo", "pl", "receita", "despesa"].includes(c.tipo), `${id}: tipo inválido em ${c.id}`);
      assert.equal(c.ativa, true);
      assert.ok("subtipo" in c, `${id}: ${c.id} sem subtipo (nem que seja null)`);
    }
  }
});

test("todo arquétipo tem PELO MENOS uma conta de receita própria — senão o cliente lança na conta errada", () => {
  for (const id of IDS_ARQUETIPOS) {
    const receitas = planoDeFabrica(id).filter((c) => c.tipo === "receita" && c.id !== "outras_receitas");
    assert.ok(receitas.length > 0, `${id} não tem receita própria — só sobraria "Outras receitas"`);
  }
});

test("os 8 planos são realmente diferentes entre si", () => {
  const assinaturas = IDS_ARQUETIPOS.map((id) => planoDeFabrica(id).map((c) => c.id).sort().join(","));
  assert.equal(new Set(assinaturas).size, 8, "algum arquétipo gerou plano idêntico a outro");
});

test("o plano sempre contém o base inteiro", () => {
  const idsBase = planoBase().map((c) => c.id);
  for (const id of IDS_ARQUETIPOS) {
    const gerados = new Set(planoDeFabrica(id).map((c) => c.id));
    for (const idBase of idsBase) assert.ok(gerados.has(idBase), `${id} perdeu a conta base ${idBase}`);
  }
});

test("arquétipo desconhecido ou ausente devolve o base — livro pobre, mas válido", () => {
  assert.deepEqual(planoDeFabrica("nao_existe").map((c) => c.id), planoBase().map((c) => c.id));
  assert.deepEqual(planoDeFabrica(undefined).map((c) => c.id), planoBase().map((c) => c.id));
});

/* ── As contas que existem por um motivo específico ─────────── */

test("revenda tem CMV e estoque; serviço com mão de obra NÃO tem", () => {
  const revenda = new Set(planoDeFabrica("revenda").map((c) => c.id));
  assert.ok(revenda.has("cmv") && revenda.has("estoque"));

  const servico = new Set(planoDeFabrica("servico_mao_obra").map((c) => c.id));
  assert.ok(!servico.has("cmv"), "eletricista não deveria receber CMV");
  assert.ok(servico.has("material_aplicado"), "eletricista precisa de Material aplicado");
  assert.ok(servico.has("deslocamento"), "deslocamento é a despesa que ele mais esquece de cobrar");
});

test("beneficiamento tem a conta de mercadoria com terceiros — a razão de o arquétipo existir", () => {
  const contas = new Set(planoDeFabrica("beneficiamento").map((c) => c.id));
  assert.ok(contas.has("mercadoria_com_terceiros"));
  assert.ok(contas.has("servico_terceiros"));
});

test("intermediação tem repasses a pagar — o dinheiro que passa pela conta e não é dele", () => {
  const plano = planoDeFabrica("intermediacao");
  const repasse = plano.find((c) => c.id === "repasses_a_pagar");
  assert.ok(repasse, "sem repasses_a_pagar, o bruto vira receita e infla o faturamento");
  assert.equal(repasse.tipo, "passivo", "repasse é obrigação com terceiro, não receita");
  assert.ok(plano.some((c) => c.id === "comissoes"));
});

test("digital tem taxa de plataforma e saldo em plataforma", () => {
  const contas = new Set(planoDeFabrica("digital").map((c) => c.id));
  assert.ok(contas.has("taxa_plataforma"), "é a despesa que some porque já vem descontada");
  assert.ok(contas.has("saldo_plataforma"), "dinheiro dele que ainda não caiu na conta");
});

/* ── Campos de abertura e achados ───────────────────────────── */

test("camposAberturaDe devolve campos com conta, tipo e explicação", () => {
  for (const id of IDS_ARQUETIPOS) {
    for (const campo of camposAberturaDe(id)) {
      assert.ok(campo.chave && campo.contaId && campo.rotulo, `${id}: campo incompleto`);
      assert.ok(["D", "C"].includes(campo.tipo), `${id}: tipo de campo inválido`);
      assert.ok(campo.porque, `${id}: campo ${campo.chave} sem "por que importa"`);
    }
  }
});

test("toda conta citada por um campo de abertura existe no plano daquele arquétipo", () => {
  for (const id of IDS_ARQUETIPOS) {
    const contas = new Set(planoDeFabrica(id).map((c) => c.id));
    for (const campo of camposAberturaDe(id)) {
      assert.ok(contas.has(campo.contaId), `${id}: campo ${campo.chave} aponta para conta inexistente ${campo.contaId}`);
    }
  }
});

test("intermediação abre com repasse no CRÉDITO — é obrigação, não bem", () => {
  const campo = camposAberturaDe("intermediacao").find((c) => c.contaId === "repasses_a_pagar");
  assert.equal(campo.tipo, "C");
});

test("arquétipo NÃO carrega perguntas — elas vivem no banco, fonte única do roteiro", () => {
  for (const a of ARQUETIPOS) {
    assert.equal(a.perguntas, undefined,
      `${a.id} voltou a declarar perguntas em código — daria duas fontes de verdade com roteiro_perguntas`);
  }
});

test("achadosDe só devolve achados conhecidos", () => {
  const conhecidos = new Set(["taxa_engolindo_margem", "sem_receita_no_periodo", "mercadoria_parada_com_terceiro"]);
  for (const id of IDS_ARQUETIPOS) {
    for (const achado of achadosDe(id)) {
      assert.ok(conhecidos.has(achado), `${id}: achado desconhecido "${achado}"`);
    }
  }
});

test("acharArquetipo devolve null para id inexistente, sem estourar", () => {
  assert.equal(acharArquetipo("nada"), null);
  assert.equal(acharArquetipo(undefined), null);
});
