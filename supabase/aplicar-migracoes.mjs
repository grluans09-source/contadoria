/* Baseado em C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   supabase/aplicar-migracoes.mjs (11/ago/2026) — mas com uma correção
   real, achada ao aplicar a segunda leva de migrações do Contadoria
   (12/ago): o script original aplica TODOS os .sql sempre, sem saber
   quais já rodaram. Isso é seguro só na primeira vez — `create table
   if not exists` é idempotente, mas `create policy` e `create
   constraint trigger` NÃO são; reaplicar a 0001 depois de já ter rodado
   quebraria com "política já existe" e abortaria o lote inteiro,
   inclusive as migrações novas que vieram DEPOIS dela.

   A CORREÇÃO: uma tabela `_migracoes_aplicadas` registra o que já
   rodou. Cada arquivo só é executado uma vez, para sempre — rodar este
   script de novo é seguro e só aplica o que é novo.

   Por que não o CLI do Supabase: a versão 2.111 falha no Windows com
   "AlreadyExists: FileSystem.makeDirectory" sempre que a pasta
   supabase/ já existe. A API de gerenciamento faz o mesmo sem tocar
   em disco.

   O token NUNCA é impresso: é lido do arquivo e usado só no cabeçalho.

   Uso:  node supabase/aplicar-migracoes.mjs [--dry]                        */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

/* Projeto Supabase do Contadoria — criado em 12/ago/2026, ver docs/SESSION_STATE.md. */
const REF = "gmiiuklkhwjpcowvjbwz";
const SECO = process.argv.includes("--dry");

if (!REF) {
  console.error("REF vazio: preencha a referência do projeto Supabase do Contadoria neste arquivo antes de rodar.");
  process.exit(1);
}

const token = fs.readFileSync(path.join(AQUI, ".access-token"), "utf8").trim();
if (!token.startsWith("sbp_")) {
  console.error("Token inválido em supabase/.access-token");
  process.exit(1);
}

const arquivos = fs.readdirSync(path.join(AQUI, "migrations"))
  .filter(f => f.endsWith(".sql"))
  .sort();

if (!arquivos.length) { console.error("Nenhum .sql em supabase/migrations/"); process.exit(1); }

const rodar = async (sql) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const texto = await r.text();
  return { ok: r.ok, status: r.status, texto };
};

if (!SECO) {
  await rodar(`create table if not exists _migracoes_aplicadas (
    nome text primary key,
    aplicada_em timestamptz not null default now()
  );`);
}

let jaAplicadas = new Set();
if (!SECO) {
  const resp = await rodar(`select nome from _migracoes_aplicadas order by nome;`);
  if (resp.ok) jaAplicadas = new Set(JSON.parse(resp.texto).map(r => r.nome));
}

for (const arq of arquivos) {
  if (jaAplicadas.has(arq)) {
    console.log(`\n── ${arq} ── já aplicada, pulando`);
    continue;
  }
  const sql = fs.readFileSync(path.join(AQUI, "migrations", arq), "utf8");
  console.log(`\n── ${arq} (${sql.split("\n").length} linhas) ──`);
  if (SECO) { console.log("   [--dry] não enviado"); continue; }
  const res = await rodar(sql);
  if (res.ok) {
    await rodar(`insert into _migracoes_aplicadas (nome) values ('${arq.replace(/'/g, "''")}');`);
    console.log("   ✓ aplicado e registrado");
  } else {
    console.error(`   ✗ FALHOU (HTTP ${res.status})`);
    console.error("   " + res.texto.slice(0, 1500));
    process.exit(1);
  }
}

console.log("\nPronto.");
