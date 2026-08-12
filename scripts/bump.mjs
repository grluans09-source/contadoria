/* Copiado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   scripts/bump.mjs (12/ago/2026), adaptado: contlife.js → contadoria.js.
   Incrementa o cache-buster de dist/index.html — esquecer esse passo faz
   o navegador servir bundle velho, armadilha já documentada no ContLife.
   `npm run dev` chama isto sozinho depois do build. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const INDEX = path.join(RAIZ, "dist", "index.html");

const html = fs.readFileSync(INDEX, "utf8");
const achado = html.match(/contadoria\.js\?v=(\d+)/);

if (!achado) {
  console.error("✗ não encontrei `contadoria.js?v=N` em dist/index.html — bumpe à mão.");
  process.exit(1);
}

const de = Number(achado[1]);
const para = de + 1;
fs.writeFileSync(INDEX, html.replace(/contadoria\.js\?v=\d+/g, `contadoria.js?v=${para}`));
console.log(`✓ cache-buster v${de} → v${para}`);
