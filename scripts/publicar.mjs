/* Publica dist/ no Netlify (contadoria-luan.netlify.app) — deploy MANUAL
   via CLI, não é deploy contínuo ligado ao GitHub (docs/SESSION_STATE.md,
   13/ago/2026). Precisa rodar depois de `npm run build` + `npm run bump`
   toda vez que algo mudar e for pra produção — o site publicado não se
   atualiza sozinho quando o git recebe um commit novo.

   Uso:  npm run publicar
   Precisa de netlify/.access-token (gitignored) — mesmo padrão dos
   tokens do Supabase: nunca no código, nunca no chat de novo. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SITE_ID = "9843ac09-e6a6-44a8-bab5-3bafcd515dd8";
const TOKEN_PATH = path.join(RAIZ, "netlify", ".access-token");

if (!fs.existsSync(TOKEN_PATH)) {
  console.error(`✗ não achei ${TOKEN_PATH} — token de acesso pessoal do Netlify precisa estar lá.`);
  process.exit(1);
}

const token = fs.readFileSync(TOKEN_PATH, "utf8").trim();

const resultado = spawnSync(
  "netlify",
  ["deploy", "--prod", "--dir=dist", `--site=${SITE_ID}`],
  { cwd: RAIZ, env: { ...process.env, NETLIFY_AUTH_TOKEN: token }, stdio: "inherit", shell: true }
);

process.exit(resultado.status ?? 1);
