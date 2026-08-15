/* Publica dist/ no Netlify (contadoria-luan.netlify.app) — deploy MANUAL
   via CLI, não é deploy contínuo ligado ao GitHub (docs/SESSION_STATE.md,
   13/ago/2026). Precisa rodar depois de `npm run build` + `npm run bump`
   toda vez que algo mudar e for pra produção — o site publicado não se
   atualiza sozinho quando o git recebe um commit novo.

   Uso:  npm run publicar
   Precisa de netlify/.access-token (gitignored) — mesmo padrão dos
   tokens do Supabase: nunca no código, nunca no chat de novo.

   ⚠️ OS CRÉDITOS SÃO DA CONTA INTEIRA, NÃO SÓ DESTE SITE (15/ago/2026)
   A conta grluans09-source no Netlify é plano gratuito: 300 créditos/mês,
   ~15 por deploy de produção — e esse teto é COMPARTILHADO entre todos
   os sites da conta (contadoria-luan, contlife-beta, e qualquer outro
   que exista ou já tenha existido ali — apagar um site não devolve os
   créditos já gastos por ele no ciclo). Se `netlify deploy` devolver
   "JSONHTTPError: Forbidden" / "Account credit usage exceeded", quase
   certo que é isso, não o token: confira em
   app.netlify.com/teams/grluans09-source/billing antes de desconfiar
   de token expirado. O ciclo reseta uma vez por mês (dia do onboarding
   da conta — ~dia 27-28). Sem custo pra esperar; ou upgrade do plano
   se for urgente (decisão do dono, nunca automática).
   Lição prática: publicar depois de CADA correção pequena esgota o mês
   rápido — junte várias mudanças e publique uma vez só. */

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
