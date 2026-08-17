/* ============================================================
   DESTINOS DO ROTEIRO — o teste que existe por causa de um bug real.

   17/ago: a migração 0016 trocou o destino da pergunta da meta de
   `retrato.meta` para `carta.meta`, para a Carta de recomendações poder
   lê-la. Ninguém percebeu que `montarRetratoDeEntrada` procura por
   `destino LIKE 'retrato.%'` — então a meta parou de entrar no retrato
   de entrada, que é **write-once**: todo cliente cadastrado nessa janela
   ficou com `meta: null` para sempre, sem conserto (0018 desfez).

   Nenhum teste pegou isso porque a lógica estava certa nos dois lados —
   o que quebrou foi um DADO no banco, escrito por migração. Este teste
   lê as migrações na ordem e recalcula o estado final de `destino` de
   cada pergunta, exatamente como o Postgres faria.

   REGRA QUE ELE GUARDA: destino `retrato.*` é write-once no banco;
   quem congela ganha a chave, quem só lê se adapta. Roubar um
   `retrato.*` para outro prefixo é irreversível para os clientes já
   cadastrados — por isso é erro de teste, não escolha de estilo.
   ============================================================ */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const MIGRACOES_DIR = new URL("../supabase/migrations/", import.meta.url);
const arquivos = () => readdirSync(MIGRACOES_DIR).filter((f) => f.endsWith(".sql")).sort();

/* Reproduz o estado final de `destino` por (bloco, ordem), aplicando os
   INSERTs do seed e depois cada UPDATE na ordem das migrações. */
function destinosFinais() {
  const destino = new Map(); /* "bloco:ordem" -> destino */

  for (const arquivo of arquivos()) {
    const sql = readFileSync(new URL(arquivo, MIGRACOES_DIR), "utf8");

    /* INSERT do seed: linhas `(bloco, ordem, 'pergunta', 'porque', 'tipo', 'destino', ...)`.
       Pega os dois primeiros números e o 4º literal entre aspas. */
    const reInsert = /^\((\d+),\s*(\d+),\s*'(?:[^']|'')*',\s*'(?:[^']|'')*',\s*'(?:[^']|'')*',\s*'([^']*)'/gm;
    let m;
    while ((m = reInsert.exec(sql))) {
      destino.set(`${m[1]}:${m[2]}`, m[4]);
    }

    /* UPDATE ... set destino = 'x' where bloco = N and ordem = M */
    const reUpdate = /update\s+roteiro_perguntas\s+set\s+destino\s*=\s*'([^']*)'\s+where\s+bloco\s*=\s*(\d+)\s+and\s+ordem\s*=\s*(\d+)/gi;
    let u;
    while ((u = reUpdate.exec(sql))) {
      destino.set(`${u[2]}:${u[3]}`, u[1]);
    }
  }
  return destino;
}

test("as migrações produzem os destinos `retrato.*` que a linha de base espera", () => {
  const finais = destinosFinais();
  const retrato = [...finais.entries()].filter(([, d]) => d?.startsWith("retrato."));
  const chaves = retrato.map(([, d]) => d.slice("retrato.".length)).sort();

  /* Estas são as chaves que `montarRetratoDeEntrada` lê de `declarado`
     (src/dominio/linhaDeBase.mjs). Se alguma sumir daqui, o retrato
     grava null naquele campo — write-once, sem conserto. */
  const esperadas = [
    "achaQueGanhaDinheiro", "faturamentoMensal", "horasPorSemana",
    "meta", "oQueIncomoda", "retiradaMensal", "temContaSeparada",
  ].sort();

  assert.deepEqual(chaves, esperadas,
    "algum destino retrato.* foi perdido ou renomeado por uma migração posterior — ver 0018");
});

test("REGRESSÃO 0016→0018: a meta continua alimentando o retrato, não a carta", () => {
  const finais = destinosFinais();
  /* Bloco 5, ordem 3 = "Tem alguma meta?" (seed 0011). */
  assert.equal(finais.get("5:3"), "retrato.meta",
    "a meta voltou a ser roubada por outro prefixo — o retrato é write-once, quem congela ganha a chave");
});

test("nenhuma pergunta tem destino duplicado — destino é chave única", () => {
  const finais = destinosFinais();
  const especificos = [...finais.values()].filter((d) => d && d !== "roteiro_respostas" && d !== "lancamento_abertura");
  const vistos = new Set();
  const duplicados = [];
  for (const d of especificos) {
    if (vistos.has(d)) duplicados.push(d);
    vistos.add(d);
  }
  assert.deepEqual(duplicados, [],
    "duas perguntas gravam no mesmo destino — a segunda sobrescreve a primeira em silêncio");
});
