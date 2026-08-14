/* Testes de src/dominio/valorDoTempo.mjs. Rode com `npm test`. */
import test from "node:test";
import assert from "node:assert/strict";
import { horaDoDono, minimoPorHora, projecaoDoLimite, aviseSobreOLimite } from "../src/dominio/valorDoTempo.mjs";

/* ── A hora do dono ─────────────────────────────────────────── */

test("O NÚMERO DURO: 60h por semana tirando R$1.800 fica ABAIXO do mínimo por hora", () => {
  const minimo = minimoPorHora(1621); // salário mínimo 2026 -> R$7,37/h
  const h = horaDoDono({ retiradaNoMes: 1800, horasPorSemana: 60, salarioMinimoHora: minimo });

  assert.equal(h.horasNoMes, 260.7);
  assert.equal(h.porHora, 6.9);
  assert.ok(h.abaixoDoMinimo, "é o achado que costuma calar o cliente");
  assert.ok(h.comparacao < 1);
});

test("A FRONTEIRA REAL, medida e não suposta: R$2.000 em 60h fica LOGO ACIMA do mínimo", () => {
  /* Escrevi este teste esperando que 2.000 por 60h/semana fosse abaixo
     do mínimo — e a conta provou o contrário: R$7,67/h contra R$7,37/h.
     Fica registrado porque calibra o produto: o alerta dispara menos do
     que a intuição sugere, o que é BOM (menos alarme falso), e o ponto
     de virada com 60h/semana está por volta de R$1.920 de retirada. */
  const minimo = minimoPorHora(1621);
  const h = horaDoDono({ retiradaNoMes: 2000, horasPorSemana: 60, salarioMinimoHora: minimo });
  assert.equal(h.porHora, 7.67);
  assert.ok(!h.abaixoDoMinimo, "acima do mínimo, ainda que por pouco");
});

test("quem tira bem trabalhando pouco fica acima do mínimo", () => {
  const h = horaDoDono({ retiradaNoMes: 8000, horasPorSemana: 20, salarioMinimoHora: minimoPorHora(1621) });
  assert.ok(!h.abaixoDoMinimo);
  assert.ok(h.porHora > 90);
});

test("sem horas ou sem retirada, devolve null — não se inventa denominador", () => {
  assert.equal(horaDoDono({ retiradaNoMes: 2000, horasPorSemana: 0 }), null);
  assert.equal(horaDoDono({ retiradaNoMes: 0, horasPorSemana: 40 }), null);
  assert.equal(horaDoDono({ retiradaNoMes: 2000, horasPorSemana: "" }), null);
});

test("sem salário mínimo informado, ainda dá o número, mas não julga", () => {
  const h = horaDoDono({ retiradaNoMes: 2000, horasPorSemana: 40 });
  assert.ok(h.porHora > 0);
  assert.equal(h.abaixoDoMinimo, null, "sem régua, não existe veredito");
});

test("minimoPorHora usa a jornada de 220h", () => {
  assert.equal(minimoPorHora(1621), 7.37);
  assert.equal(minimoPorHora(0), null);
});

/* ── A projeção do limite ───────────────────────────────────── */

test("no ritmo tranquilo, não há aviso", () => {
  const p = projecaoDoLimite({ receitaAcumulada: 20000, mesesDecorridos: 8, limiteAnual: 81000 });
  assert.equal(p.faixa, "tranquilo");
  assert.equal(aviseSobreOLimite(p), null, "silêncio quando não há o que dizer");
});

test("O AVISO QUE VALE MESES DE ANTECEDÊNCIA: estouro acima de 20% é retroativo", () => {
  /* R$ 12.000/mês em agosto → projeta 144.000, muito acima de 81.000 */
  const p = projecaoDoLimite({ receitaAcumulada: 96000, mesesDecorridos: 8, limiteAnual: 81000 });
  assert.equal(p.faixa, "estouro_grave");
  assert.equal(p.projecao, 144000);
  assert.equal(p.mesQueEstoura, 7, "com 12.000/mês, o teto cai no 7º mês");

  const aviso = aviseSobreOLimite(p);
  assert.equal(aviso.gravidade, "grave");
  assert.match(aviso.oQueFazer, /RETROATIVO a janeiro/);
});

test("estouro até 20% é administrável e o texto diz isso", () => {
  const p = projecaoDoLimite({ receitaAcumulada: 58000, mesesDecorridos: 8, limiteAnual: 81000 });
  assert.equal(p.faixa, "estouro_leve");
  const aviso = aviseSobreOLimite(p);
  assert.match(aviso.oQueFazer, /Até 20% acima é administrável/);
});

test("acima de 80% do teto já pede atenção", () => {
  const p = projecaoDoLimite({ receitaAcumulada: 50000, mesesDecorridos: 9, limiteAnual: 81000 });
  assert.equal(p.faixa, "atencao");
  assert.match(aviseSobreOLimite(p).frase, /% do teto/);
});

test("A PEGADINHA DO 1º ANO: quem abriu em julho tem cerca de metade do teto", () => {
  const p = projecaoDoLimite({
    receitaAcumulada: 30000, mesesDecorridos: 2,
    limiteAnual: 81000, dataAbertura: "2026-07-15", anoCorrente: 2026,
  });
  assert.ok(p.proporcional, "precisa marcar que o limite foi reduzido");
  assert.equal(p.limite, 40500, "julho a dezembro = 6 meses = metade");
  assert.equal(p.faixa, "estouro_grave", "30.000 em 2 meses estoura o teto proporcional");
});

test("quem abriu em ano anterior tem o teto cheio", () => {
  const p = projecaoDoLimite({
    receitaAcumulada: 30000, mesesDecorridos: 6,
    limiteAnual: 81000, dataAbertura: "2024-07-15", anoCorrente: 2026,
  });
  assert.ok(!p.proporcional);
  assert.equal(p.limite, 81000);
});

test("sobraAteOTeto diz quanto ainda cabe", () => {
  const p = projecaoDoLimite({ receitaAcumulada: 60000, mesesDecorridos: 9, limiteAnual: 81000 });
  assert.equal(p.sobraAteOTeto, 21000);
});

test("entrada inválida devolve null em vez de número inventado", () => {
  assert.equal(projecaoDoLimite({ receitaAcumulada: 100, mesesDecorridos: 0, limiteAnual: 81000 }), null);
  assert.equal(projecaoDoLimite({ receitaAcumulada: 100, mesesDecorridos: 3, limiteAnual: 0 }), null);
  assert.equal(aviseSobreOLimite(null), null);
});
