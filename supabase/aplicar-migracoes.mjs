/* Copiado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   supabase/aplicar-migracoes.mjs (11/ago/2026) — padrão genérico, nada
   de domínio dentro. Só o `REF` muda entre os dois projetos.

   Aplica os .sql de supabase/migrations/ no projeto remoto.

   Por que não o CLI: a versão 2.111 do `supabase` falha no Windows com
   "AlreadyExists: FileSystem.makeDirectory" sempre que a pasta supabase/
   já existe — o que impede `init`, `link` e, por tabela, `db push`.
   A API de gerenciamento faz o mesmo trabalho sem tocar em disco.

   O token NUNCA é impresso: é lido do arquivo e usado só no cabeçalho.

   Uso:  node supabase/aplicar-migracoes.mjs [--dry]                        */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

/* Preenchido quando o projeto Supabase do Contadoria existir — ver
   docs/SESSION_STATE.md. Até lá, este script não roda (falha cedo e claro,
   em vez de apontar sem querer para o banco do ContLife). */
const REF = "";
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

for (const arq of arquivos) {
  const sql = fs.readFileSync(path.join(AQUI, "migrations", arq), "utf8");
  console.log(`\n── ${arq} (${sql.split("\n").length} linhas) ──`);
  if (SECO) { console.log("   [--dry] não enviado"); continue; }
  const res = await rodar(sql);
  if (res.ok) {
    console.log("   ✓ aplicado");
  } else {
    console.error(`   ✗ FALHOU (HTTP ${res.status})`);
    console.error("   " + res.texto.slice(0, 1500));
    process.exit(1);
  }
}

console.log("\nPronto.");
