/* Copiado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   serve.mjs (12/ago/2026) — padrão 100% genérico, nada de domínio dentro.
   Servidor estático de desenvolvimento do Contadoria.

   Uso:  npm run serve      →  http://127.0.0.1:8788/dist/index.html
   Nota: porta DIFERENTE da 8787 do ContLife de propósito — os dois
   podem rodar ao mesmo tempo sem colidir. Use node, nunca python (o do
   PATH no Windows do dono é stub da MS Store e falha). */

import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const PORTA = Number(process.env.PORT) || 8788;
const LAN = process.argv.includes("--lan") || process.env.HOST === "0.0.0.0";
const HOST = LAN ? "0.0.0.0" : "127.0.0.1";

function ipLocal() {
  const redes = os.networkInterfaces();
  for (const nome of Object.keys(redes)) {
    for (const net of redes[nome] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return null;
}

const TIPOS = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const servidor = http.createServer((req, res) => {
  let rota = decodeURIComponent((req.url || "/").split("?")[0]);
  if (rota === "/") rota = "/dist/index.html";

  const alvo = path.join(RAIZ, path.normalize(rota));
  if (!alvo.startsWith(RAIZ)) {
    res.writeHead(403).end("403");
    return;
  }

  fs.readFile(alvo, (erro, dados) => {
    if (erro) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end(`404 — não encontrado: ${rota}`);
      return;
    }
    res.writeHead(200, {
      "content-type": (TIPOS[path.extname(alvo)] || "application/octet-stream") + "; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(dados);
  });
});

servidor.listen(PORTA, HOST, () => {
  console.log(`\nContadoria servindo:`);
  console.log(`  neste PC   http://127.0.0.1:${PORTA}/dist/index.html`);
  if (HOST === "0.0.0.0") {
    const ip = ipLocal();
    if (ip) {
      console.log(`  no celular http://${ip}:${PORTA}/dist/index.html`);
      console.log(`\n  (celular precisa estar no MESMO Wi-Fi)`);
    } else {
      console.log(`  rede local: aberto, mas não achei o IP desta máquina`);
    }
  } else {
    console.log(`\n  Para testar no celular: node serve.mjs --lan`);
  }
  console.log(`\n  Ctrl+F5 no navegador se a tela vier velha.\n`);
});
