/* ============================================================
   TESTES DO MOTOR DE SINCRONIZAÇÃO — Contadoria

   Padrão herdado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   tests/sinc.test.mjs (11/ago/2026) — a disciplina em si (docs/01 §grade A):
   conferir o motor CONTRA O SQL REAL, não contra o que a gente acha que
   escreveu. `calcularDiferenca` é a única peça capaz de apagar dado
   contábil de cliente por engano — cobrir ANTES de ligar no app.

   Rode com `npm test`.
   ============================================================ */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  calcularDiferenca, montarEstado, fotografar, mesmoConteudo,
  COLECOES, LIMITE_PERIGO,
} from "../src/dados/sinc.mjs";

const MIGRACOES_DIR = new URL("../supabase/migrations/", import.meta.url);
/* schema evolui por ALTER, nunca editando migração já aplicada (docs/06
   §1) — ler TODOS os .sql, na ordem, é o que mantém este teste honesto
   contra o schema de verdade, e não só contra o 0001 original. */
const arquivosMigracao = () => readdirSync(MIGRACOES_DIR).filter((f) => f.endsWith(".sql")).sort();

const vazio = {
  contas: [], lancamentos: [], lancamentoLinhas: [], entradaItens: [],
  regrasClassificacao: [], lixeira: [], trilha: [],
  recorrentes: [], recorrenteLinhas: [], cartas: [],
  periodosFechados: [], conciliacoes: [],
};

function estadoCheio() {
  return {
    contas: [{ id: "c1", codigo: "1101", nome: "Caixa", tipo: "ativo",
               subtipo: "circulante", ordem: 1, ativa: true }],
    lancamentos: [{ id: "l1", data: "2026-08-01", dataCompetencia: "2026-08-01",
                    descricao: "Venda", origem: "manual", documento: "NF 42" }],
    lancamentoLinhas: [{ id: "ll1", lancamentoId: "l1", contaId: "c1", tipo: "D", valor: 150.5,
                         descricao: "Saldo inicial do caixa", vencimento: null, baixaDe: null }],
    entradaItens: [{ id: "e1", origem: "extrato", data: "2026-08-01",
                     descricaoBruta: "PIX RECEBIDO", valor: 150.5, situacao: "classificado",
                     lancamentoId: "l1", contaOrigemId: "c1" }],
    regrasClassificacao: [{ id: "r1", padrao: "POSTO IPIRANGA", contaId: "c1", acertos: 3 }],
    lixeira: [{ lancamentoId: "l9", conteudo: { id: "l9", linhas: [] }, excluidoEm: "2026-08-01T10:00:00.000Z" }],
    trilha: [{ tipo: "criar", descricao: "lançamento l1" }],
    recorrentes: [{ id: "rec1", descricao: "Aluguel", ativa: true }],
    recorrenteLinhas: [{ id: "rl1", recorrenteId: "rec1", contaId: "c1", tipo: "D", valor: 400 }],
    cartas: [{ mes: "2026-07", texto: "Trocar de fornecedor", seguida: true }],
    periodosFechados: ["mes:2026-07"],
    conciliacoes: ["l1"],
  };
}

/* ── Lê as colunas reais do SQL que está no banco (mesmo parser do
      ContLife — testado à mão contra este schema antes de escrever este
      arquivo, ver histórico da sessão), agora somado ao que `ALTER TABLE
      ... ADD COLUMN` acrescentou em migrações posteriores à 0001. ── */
function colunasDoSql() {
  const tabelas = {};
  for (const arquivo of arquivosMigracao()) {
    const sql = readFileSync(new URL(arquivo, MIGRACOES_DIR), "utf8");

    const reCriar = /create table if not exists (\w+) \(([\s\S]*?)\n\);/g;
    let m;
    while ((m = reCriar.exec(sql))) {
      const colunas = [];
      for (const bruta of m[2].split("\n")) {
        const linha = bruta.trim();
        if (!linha || linha.startsWith("--")) continue;
        if (/^(primary key|constraint|unique|check|foreign key)\b/i.test(linha)) continue;
        const nome = linha.match(/^(\w+)\s+/);
        if (nome) colunas.push(nome[1]);
      }
      tabelas[m[1]] = colunas;
    }

    const reAlter = /alter table (\w+)([\s\S]*?);/g;
    let a;
    while ((a = reAlter.exec(sql))) {
      const tabela = a[1];
      tabelas[tabela] = tabelas[tabela] || [];
      const reColuna = /add column if not exists (\w+)/gi;
      let c;
      while ((c = reColuna.exec(a[2]))) tabelas[tabela].push(c[1]);
    }
  }
  return tabelas;
}

/* Colunas que o SERVIDOR preenche sozinho — o app não deve mandá-las. */
const SERVIDOR_CUIDA = {
  lancamentos: ["criado_em", "criado_por"],
  periodos_fechados: ["fechado_em"],
  entrada_itens: ["criado_em"],
  regras_classificacao: ["atualizado_em"],
  trilha: ["id", "criado_em"],
  conciliacoes: ["conferido_em"],
  recorrentes: ["criado_em"],
  cartas: ["atualizado_em"],
};

/* ============================================================
   1. O TESTE QUE IMPEDE O "CAMPO QUE NÃO SALVA"
   ============================================================ */
test("toda coluna do SQL tem quem a preencha (e nenhuma inventada)", () => {
  const sql = colunasDoSql();
  const { ops } = calcularDiferenca(vazio, estadoCheio());

  const emitido = {};
  for (const op of ops) {
    if (op.acao !== "gravar") continue;
    emitido[op.tabela] = emitido[op.tabela] || new Set();
    for (const col of Object.keys(op.valores)) emitido[op.tabela].add(col);
  }

  for (const desc of Object.values(COLECOES)) {
    const tabela = desc.tabela;
    const esperadas = (sql[tabela] || [])
      .filter((c) => c !== "negocio_id")
      .filter((c) => !(SERVIDOR_CUIDA[tabela] || []).includes(c));
    assert.ok(esperadas.length > 0, `tabela ${tabela} não foi encontrada no SQL`);

    const escritas = emitido[tabela] || new Set();
    const faltando = esperadas.filter((c) => !escritas.has(c));
    const sobrando = [...escritas].filter((c) => !(sql[tabela] || []).includes(c));

    assert.deepEqual(faltando, [], `${tabela}: coluna existe no banco mas ninguém preenche`);
    assert.deepEqual(sobrando, [], `${tabela}: motor manda coluna que não existe no banco`);
  }
});

/* ============================================================
   1b. O TESTE QUE IMPEDE O "NULL EM COLUNA not null"

   A mesma classe de bug que travou o cadastro do plano de contas no
   ContLife (05/ago/2026, doc 29 §8.5): campo ausente vira null quando
   deveria virar o PADRÃO da coluna. Refaz a situação para TODAS as
   tabelas: manda o registro mais magro possível e exige que nenhuma
   coluna `not null` com padrão no SQL receba null.
   ============================================================ */
test("nenhuma coluna `not null` com padrão recebe null quando o campo falta", () => {
  const comPadrao = {};
  for (const arquivo of arquivosMigracao()) {
    const sql = readFileSync(new URL(arquivo, MIGRACOES_DIR), "utf8");
    const re = /create table if not exists (\w+) \(([\s\S]*?)\n\);/g;
    let m;
    while ((m = re.exec(sql))) {
      comPadrao[m[1]] = comPadrao[m[1]] || new Set();
      for (const bruta of m[2].split("\n")) {
        const linha = bruta.trim();
        if (!linha || linha.startsWith("--")) continue;
        if (/^(primary key|constraint|unique|check|foreign key)\b/i.test(linha)) continue;
        const nome = linha.match(/^(\w+)\s+/);
        if (nome && /\bnot null\b/i.test(linha) && /\bdefault\b/i.test(linha)) comPadrao[m[1]].add(nome[1]);
      }
    }
  }

  const magro = {
    contas: [{ id: "x", codigo: "1", nome: "n", tipo: "ativo" }],
    lancamentos: [{ id: "x", data: "2026-08-01" }],
    lancamentoLinhas: [{ id: "x", lancamentoId: "l1", contaId: "c1", tipo: "D", valor: 1 }],
    entradaItens: [{ id: "x", origem: "extrato" }],
    regrasClassificacao: [{ id: "x", padrao: "p" }],
    lixeira: [{ lancamentoId: "l1", conteudo: {}, excluidoEm: "2026-08-01T00:00:00Z" }],
    trilha: [{ tipo: "a", descricao: "d" }],
    recorrentes: [{ id: "x", descricao: "d" }],
    recorrenteLinhas: [{ id: "x", recorrenteId: "rec1", contaId: "c1", tipo: "D", valor: 1 }],
    cartas: [{ mes: "2026-07" }],
    periodosFechados: ["mes:2026-07"],
    conciliacoes: ["l1"],
  };

  const { ops } = calcularDiferenca(vazio, magro);
  const problemas = [];
  for (const op of ops) {
    if (op.acao !== "gravar") continue;
    for (const [coluna, valor] of Object.entries(op.valores)) {
      if (valor === null && comPadrao[op.tabela]?.has(coluna)) problemas.push(`${op.tabela}.${coluna}`);
    }
  }
  assert.deepEqual(problemas, []);
});

/* ============================================================
   2. IDA E VOLTA — calcularDiferenca / montarEstado são inversos
   ============================================================ */
test("um estado cheio sobrevive a ir para o banco e voltar", () => {
  const cheio = estadoCheio();
  const { ops } = calcularDiferenca(vazio, cheio);

  const tabelas = {};
  for (const op of ops) {
    if (op.acao !== "gravar") continue;
    tabelas[op.tabela] = tabelas[op.tabela] || [];
    tabelas[op.tabela].push(op.valores);
  }

  const reconstruido = montarEstado(tabelas);
  assert.deepEqual(reconstruido.contas, cheio.contas);
  assert.deepEqual(reconstruido.lancamentos, cheio.lancamentos);
  assert.deepEqual(reconstruido.lancamentoLinhas, cheio.lancamentoLinhas);
  assert.deepEqual(reconstruido.recorrentes, cheio.recorrentes);
  assert.deepEqual(reconstruido.recorrenteLinhas, cheio.recorrenteLinhas);
  assert.deepEqual(reconstruido.cartas, cheio.cartas);
  assert.deepEqual(reconstruido.periodosFechados, cheio.periodosFechados);
  assert.deepEqual(reconstruido.conciliacoes, cheio.conciliacoes);
});

test("nada muda → nenhuma operação", () => {
  const cheio = estadoCheio();
  const { ops, resumo, perigo } = calcularDiferenca(cheio, cheio);
  assert.deepEqual(ops, []);
  assert.deepEqual(resumo, { gravar: 0, apagar: 0 });
  assert.equal(perigo, null);
});

/* ============================================================
   3. FORMA "lista" com chaveCampo customizado (lixeira)
   ============================================================ */
test("lixeira é identificada por lancamentoId, não por id", () => {
  const antes = { ...vazio };
  const depois = { ...vazio, lixeira: [{ lancamentoId: "l9", conteudo: { x: 1 }, excluidoEm: "2026-08-01T00:00:00Z" }] };
  const { ops } = calcularDiferenca(antes, depois);
  const grava = ops.find((o) => o.tabela === "lixeira" && o.acao === "gravar");
  assert.ok(grava, "deveria gravar a entrada da lixeira");
  assert.equal(grava.valores.lancamento_id, "l9");

  const semAqueleItem = { ...vazio, lixeira: [] };
  const { ops: opsApagar } = calcularDiferenca(depois, semAqueleItem);
  const apaga = opsApagar.find((o) => o.tabela === "lixeira" && o.acao === "apagar");
  assert.ok(apaga, "deveria apagar quando some da memória (restaurado)");
  assert.deepEqual(apaga.chave, { lancamento_id: "l9" });
});

/* ============================================================
   4. FORMA "conjunto" — uma e duas partes
   ============================================================ */
test("periodosFechados (2 partes) grava tipo e periodo separados", () => {
  const { ops } = calcularDiferenca(vazio, { ...vazio, periodosFechados: ["ano:2026"] });
  const grava = ops.find((o) => o.tabela === "periodos_fechados");
  assert.deepEqual(grava.valores, { tipo: "ano", periodo: "2026" });
});

test("conciliacoes (1 parte) grava só a chave, sem inventar campo", () => {
  const { ops } = calcularDiferenca(vazio, { ...vazio, conciliacoes: ["l1"] });
  const grava = ops.find((o) => o.tabela === "conciliacoes");
  assert.deepEqual(grava.valores, { lancamento_id: "l1" });
});

/* ============================================================
   5. FORMA "trilha" — só insere, compara por identidade
   ============================================================ */
test("trilha nunca gera 'apagar', mesmo quando o array em memória encolhe", () => {
  const item1 = { tipo: "criar", descricao: "a" };
  const cheia = { ...vazio, trilha: [item1] };
  const cortada = { ...vazio, trilha: [] }; // ex.: slice(-399) no app
  const { ops } = calcularDiferenca(cheia, cortada);
  assert.deepEqual(ops, [], "cortar o array em memória não deve apagar auditoria no banco");
});

test("trilha grava item novo mesmo com conteúdo igual a um antigo (identidade, não valor)", () => {
  const a = { tipo: "x", descricao: "mesmo texto" };
  const b = { tipo: "x", descricao: "mesmo texto" }; // objeto DIFERENTE, mesmo conteúdo
  const { ops } = calcularDiferenca({ ...vazio, trilha: [a] }, { ...vazio, trilha: [a, b] });
  assert.equal(ops.length, 1);
  assert.equal(ops[0].acao, "gravar");
});

/* ============================================================
   6. O FREIO CONTRA EXCLUSÃO EM MASSA
   ============================================================ */
test("apagar quase tudo de uma vez aciona o freio", () => {
  const muitasContas = Array.from({ length: 30 }, (_, i) => ({ id: `c${i}`, codigo: `${i}`, nome: `Conta ${i}`, tipo: "despesa" }));
  const antes = { ...vazio, contas: muitasContas };
  const depois = { ...vazio, contas: [] };
  const { perigo } = calcularDiferenca(antes, depois);
  assert.ok(perigo, "deveria sinalizar perigo ao apagar 30 de 30 contas");
  assert.equal(perigo.motivo, "exclusao_em_massa");
});

test("apagar poucos registros de um total pequeno NÃO aciona o freio (é rotina)", () => {
  const tresContas = [
    { id: "c1", codigo: "1", nome: "A", tipo: "ativo" },
    { id: "c2", codigo: "2", nome: "B", tipo: "ativo" },
    { id: "c3", codigo: "3", nome: "C", tipo: "ativo" },
  ];
  const { perigo } = calcularDiferenca({ ...vazio, contas: tresContas }, { ...vazio, contas: [] });
  assert.equal(perigo, null, `apagar ${LIMITE_PERIGO.minimoAbsoluto - 1} de 3 é abaixo do mínimo absoluto`);
});

/* ============================================================
   7. mesmoConteudo — ignora ordem de chaves (jsonb reordena)
   ============================================================ */
test("mesmoConteudo não acusa mudança só por causa da ordem das chaves", () => {
  assert.ok(mesmoConteudo({ a: 1, b: 2 }, { b: 2, a: 1 }));
  assert.ok(!mesmoConteudo({ a: 1, b: 2 }, { a: 1, b: 3 }));
});

/* ============================================================
   8. fotografar — recorte raso, por referência
   ============================================================ */
test("fotografar copia só as chaves de COLECOES, por referência", () => {
  const cheio = estadoCheio();
  const foto = fotografar({ ...cheio, algoQueNaoEDoModelo: [1, 2, 3] });
  assert.ok(foto.contas === cheio.contas, "deveria ser a MESMA referência, não um clone");
  assert.equal(foto.algoQueNaoEDoModelo, undefined);
});
