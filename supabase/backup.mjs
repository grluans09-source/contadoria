/* ============================================================
   BACKUP — exportação semanal de segurança (docs/SESSION_STATE.md,
   "antes do primeiro cliente real": lacuna registrada desde a criação
   do projeto).

   Por que via API de gerenciamento, não via app: o app roda com a
   chave `anon` e RLS por negócio (docs/06 §2) — um backup que dependa
   de login enxergaria só os negócios daquele usuário, e um dia pode
   existir mais de um contador. Este script usa o mesmo caminho de
   `conferir.mjs`/`aplicar-migracoes.mjs` (token de gerenciamento, bypassa
   RLS de propósito) para garantir uma cópia COMPLETA, sempre.

   Uso:  node supabase/backup.mjs            (ou `npm run backup`)
   Sugestão de rotina: toda sexta-feira, ou antes de qualquer migração
   arriscada. Guarda as últimas 12 cópias (~3 meses no ritmo semanal) e
   apaga o resto sozinho — não é lugar pra crescer sem limite.        */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.dirname(AQUI);
const PASTA_BACKUPS = path.join(RAIZ, "backups");
const REF = "gmiiuklkhwjpcowvjbwz";
const MANTER_ULTIMOS = 12;

const token = fs.readFileSync(path.join(AQUI, ".access-token"), "utf8").trim();

const q = async (sql) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 400)}`);
  return r.json();
};

/* Tabela de infraestrutura do próprio aplicar-migracoes.mjs (não é
   dado de domínio) — mesma exceção documentada em conferir.mjs. */
const INFRAESTRUTURA = new Set(["_migracoes_aplicadas"]);

async function listarTabelas() {
  const linhas = await q(`
    select c.relname as tabela
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r'
     order by c.relname;`);
  return linhas.map((l) => l.tabela).filter((t) => !INFRAESTRUTURA.has(t));
}

async function main() {
  fs.mkdirSync(PASTA_BACKUPS, { recursive: true });

  const tabelas = await listarTabelas();
  const dump = {};
  const contagens = [];

  for (const tabela of tabelas) {
    const linhas = await q(`select * from "${tabela}";`);
    dump[tabela] = linhas;
    contagens.push(`  ${tabela.padEnd(24)} ${linhas.length}`);
  }

  const geradoEm = new Date().toISOString();
  const nomeArquivo = `contadoria-backup-${geradoEm.replace(/[:.]/g, "-")}.json`;
  const alvo = path.join(PASTA_BACKUPS, nomeArquivo);

  fs.writeFileSync(alvo, JSON.stringify({ geradoEm, tabelas: dump }, null, 2), "utf8");

  console.log(`\nBackup gravado em backups/${nomeArquivo}\n`);
  console.log(contagens.join("\n"));

  /* Poda: mantém só as últimas N cópias — mesmo raciocínio do "teto de
     volume" do resto do projeto (docs/03 §6), aplicado a disco. */
  const existentes = fs.readdirSync(PASTA_BACKUPS)
    .filter((f) => f.startsWith("contadoria-backup-") && f.endsWith(".json"))
    .sort();
  const apagar = existentes.slice(0, Math.max(0, existentes.length - MANTER_ULTIMOS));
  for (const f of apagar) fs.unlinkSync(path.join(PASTA_BACKUPS, f));
  if (apagar.length) console.log(`\n${apagar.length} backup(s) antigo(s) removido(s) (mantendo os últimos ${MANTER_ULTIMOS}).`);

  console.log(`\nPronto — ${existentes.length - apagar.length} backup(s) na pasta.`);
}

main().catch((e) => {
  console.error("✗ backup falhou:", e.message);
  process.exit(1);
});
