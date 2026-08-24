/* ============================================================
   GERADOR DE PDF — Markdown → PDF com a identidade da Contadoria.

   Existe para que os manuais sejam ATUALIZÁVEIS: a fonte da verdade é
   o Markdown em docs/, e o PDF é só uma saída. Mudou o texto, roda
   `npm run pdf` e o PDF sai novo — nada de editar PDF à mão, que é o
   jeito garantido de a documentação virar mentira com o tempo.

   Uso:  npm run pdf              (gera todos os documentos listados)
         npm run pdf -- 10        (gera só o que começa com "10")

   POR QUE pdfkit E NÃO UM CONVERSOR PRONTO
   ------------------------------------------------------------
   Conversor pronto (md-to-pdf e afins) puxa um navegador inteiro como
   dependência — 300+ MB para gerar duas páginas. pdfkit é JS puro e
   deixa a identidade visual sob controle: capa preta e ouro, miolo em
   marfim (papel de convite, docs/02 §5), legível impresso.

   ⚠️ Fontes padrão do PDF não têm emoji. Em vez de sair caixa preta na
   página, os emoji conhecidos viram marcador de texto (ou callout, no
   caso do ⚠️) e o resto é removido — ver `sanitizar()`.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DOCS = path.join(RAIZ, "docs");
const SAIDA = path.join(RAIZ, "pdf");

/* Documentos que viram PDF. Acrescentar aqui quando houver outro. */
const DOCUMENTOS = ["09_PRINCIPIOS_DE_VALOR.md", "10_MANUAL_DE_OPERACAO.md", "11_GO_TO_MARKET.md"];

/* ── Paleta ──────────────────────────────────────────────────
   Capa escura (o momento de marca), miolo claro. Relatório que se lê
   e se imprime não pode ter fundo preto — gasta tinta e cansa. */
const COR = {
  papel: "#FDFCF9",
  tinta: "#1A1613",
  /* Os tons do TEMA CLARO (src/ui/tema.mjs) — o PDF imprime sobre papel
     branco, então usa o ouro escurecido/auditado do claro, não o
     metálico do escuro (#D4AF37 sobre branco fica ilegível). */
  ouro: "#7A5C10",
  ouroClaro: "#C9A227",
  ouroFraco: "#F4EDD9",
  muted: "#6E6455",
  regra: "#E3DDD1",
  capaFundo: "#0B0A07",
  capaTinta: "#F4EFE4",
  aviso: "#8C3A22",
  avisoFundo: "#FBF0EA",
  citacaoFundo: "#F7F3EA",
};

const FONTE = {
  normal: "Helvetica",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
  bolditalic: "Helvetica-BoldOblique",
  code: "Courier",
  display: "Times-Bold",
  displayItalic: "Times-Italic",
};

/* Margens largas de propósito (revisão de legibilidade, 20/ago): com
   58pt de margem a linha saía com ~114 caracteres — o olho perde o
   rumo ao voltar para a linha seguinte, e o texto cansa mesmo com a
   fonte grande. 100pt com corpo em 12pt deixa a linha em ~75 caracteres, no teto da faixa
   confortável de leitura contínua. Custa páginas; vale o custo. */
const MARGEM = { topo: 72, base: 68, esq: 100, dir: 100 };
const LARGURA_UTIL = 595.28 - MARGEM.esq - MARGEM.dir; // A4 retrato

/* ── Emoji: mapear os que carregam sentido, remover o resto ──
   Os medalhistas viram numeração (a ordem é o significado deles); os
   decorativos somem porque o texto ao lado já diz a mesma coisa. */
const EMOJI_MAPA = {
  "🥇": "1.", "🥈": "2.", "🥉": "3.", "🏅": "4.",
  "⚠️": "", "⚠": "", "🔥": "", "⭐": "", "💼": "", "🌱": "",
  "✅": "", "➡️": "", "➡": "", "🔁": "", "💣": "", "🔴": "", "🔒": "",
  "✓": "-", "✗": "x", "🚀": "", "📊": "", "💡": "", "🔧": "", "📌": "",
};

/* Símbolos que CARREGAM SENTIDO e não existem no WinAnsi — precisam de
   equivalente, não de remoção. Achado conferindo o PDF gerado: as setas
   estavam sumindo, e "Caixa de Entrada -> Revisão" virava "Caixa de
   Entrada  Revisão"; o menos de "A = P + PL + R − D" saía como caixa
   preta no meio da equação contábil. */
const SIMBOLO_MAPA = {
  "→": "->", "←": "<-", "↔": "<->", "⇒": "=>",
  "−": "-", "≥": ">=", "≤": "<=", "≠": "!=", "≈": "~",
};

function sanitizar(texto) {
  let t = texto;
  for (const [emoji, subst] of Object.entries(EMOJI_MAPA)) t = t.split(emoji).join(subst);
  for (const [simbolo, subst] of Object.entries(SIMBOLO_MAPA)) t = t.split(simbolo).join(subst);
  /* Sobrou algum símbolo fora do que a fonte padrão desenha? Remove,
     em vez de imprimir retângulo preto no meio da frase. */
  t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2190}-\u{21FF}\u{2200}-\u{22FF}]/gu, "");
  return t.replace(/\s{2,}/g, " ").trim();
}

/* ── Frontmatter (título, subtítulo, versão) ───────────────── */
function lerFrontmatter(bruto) {
  const m = bruto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return { meta: {}, corpo: bruto };
  const meta = {};
  for (const linha of m[1].split(/\r?\n/)) {
    const par = linha.match(/^(\w+):\s*(.*)$/);
    if (par) meta[par[1]] = par[2].trim();
  }
  return { meta, corpo: bruto.slice(m[0].length) };
}

/* ── Inline: **negrito**, *itálico*, `código` ───────────────
   Devolve "runs" (pedaços com estilo) em vez de texto puro, porque o
   layout precisa medir cada pedaço com a SUA fonte para quebrar linha
   no lugar certo. */
function partirInline(texto) {
  const runs = [];
  const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let ultimo = 0, m;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) runs.push({ texto: texto.slice(ultimo, m.index), estilo: "normal" });
    if (m[2] !== undefined) runs.push({ texto: m[2], estilo: "bolditalic" });
    else if (m[3] !== undefined) runs.push({ texto: m[3], estilo: "bold" });
    else if (m[4] !== undefined) runs.push({ texto: m[4], estilo: "italic" });
    else if (m[5] !== undefined) runs.push({ texto: m[5], estilo: "code" });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) runs.push({ texto: texto.slice(ultimo), estilo: "normal" });
  return runs.filter((r) => r.texto.length > 0);
}

/* ── Parser de bloco ───────────────────────────────────────── */
function parsear(corpo) {
  const linhas = corpo.split(/\r?\n/);
  const blocos = [];
  let i = 0;

  while (i < linhas.length) {
    const linha = linhas[i];
    const cru = linha.trim();

    if (!cru) { i++; continue; }

    if (cru.startsWith("```")) {
      const codigo = [];
      i++;
      while (i < linhas.length && !linhas[i].trim().startsWith("```")) { codigo.push(linhas[i]); i++; }
      i++;
      blocos.push({ tipo: "codigo", linhas: codigo });
      continue;
    }

    if (/^---+$/.test(cru)) { blocos.push({ tipo: "regra" }); i++; continue; }

    const h = cru.match(/^(#{1,4})\s+(.*)$/);
    if (h) { blocos.push({ tipo: "titulo", nivel: h[1].length, texto: h[2] }); i++; continue; }

    if (cru.startsWith("|")) {
      const tabela = [];
      while (i < linhas.length && linhas[i].trim().startsWith("|")) { tabela.push(linhas[i].trim()); i++; }
      const celulasDe = (l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const todas = tabela.map(celulasDe);
      /* a 2ª linha da tabela markdown é só o separador (---|---) */
      const corpoTabela = todas.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
      blocos.push({ tipo: "tabela", cabecalho: corpoTabela[0], linhas: corpoTabela.slice(1) });
      continue;
    }

    if (cru.startsWith(">")) {
      const citacao = [];
      while (i < linhas.length && (linhas[i].trim().startsWith(">") || (citacao.length && linhas[i].trim() === ""))) {
        if (linhas[i].trim() === "") { if (i + 1 < linhas.length && linhas[i + 1].trim().startsWith(">")) { citacao.push(""); i++; continue; } break; }
        citacao.push(linhas[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocos.push({ tipo: "citacao", texto: citacao.join("\n") });
      continue;
    }

    const li = cru.match(/^([-*])\s+(.*)$/);
    const ol = cru.match(/^(\d+)\.\s+(.*)$/);
    if (li || ol) {
      const itens = [];
      const ordenada = !!ol;
      while (i < linhas.length) {
        const c = linhas[i].trim();
        const mLi = c.match(/^([-*])\s+(.*)$/);
        const mOl = c.match(/^(\d+)\.\s+(.*)$/);
        if (!mLi && !mOl) {
          /* continuação indentada do item anterior */
          if (c && /^\s{2,}/.test(linhas[i]) && itens.length) { itens[itens.length - 1] += " " + c; i++; continue; }
          break;
        }
        itens.push((mLi ? mLi[2] : mOl[2]));
        i++;
      }
      blocos.push({ tipo: "lista", ordenada, itens });
      continue;
    }

    /* parágrafo: junta linhas até a próxima em branco ou início de outro bloco */
    const par = [];
    while (i < linhas.length) {
      const c = linhas[i].trim();
      if (!c || c.startsWith("#") || c.startsWith("|") || c.startsWith(">") || c.startsWith("```") ||
          /^---+$/.test(c) || /^([-*])\s+/.test(c) || /^\d+\.\s+/.test(c)) break;
      par.push(c);
      i++;
    }
    blocos.push({ tipo: "paragrafo", texto: par.join(" ") });
  }

  return blocos;
}

/* ── Renderizador ──────────────────────────────────────────── */
class Render {
  constructor(doc, meta) {
    this.doc = doc;
    this.meta = meta;
    this.y = MARGEM.topo;
    this.pagina = 0;
  }

  get base() { return this.doc.page.height - MARGEM.base; }

  espaco(altura) {
    if (this.y + altura > this.base) this.novaPagina();
  }

  novaPagina() {
    this.doc.addPage();
    this.pagina++;
    this.fundo();
    this.rodape();
    this.y = MARGEM.topo;
  }

  fundo() {
    this.doc.rect(0, 0, this.doc.page.width, this.doc.page.height).fill(COR.papel);
  }

  rodape() {
    const d = this.doc;
    const yLinha = d.page.height - MARGEM.base + 22;
    d.moveTo(MARGEM.esq, yLinha).lineTo(d.page.width - MARGEM.dir, yLinha).lineWidth(0.5).stroke(COR.regra);
    d.font(FONTE.normal).fontSize(7.5).fillColor(COR.muted);
    d.text(sanitizar(this.meta.titulo || "Contadoria"), MARGEM.esq, yLinha + 7, { width: LARGURA_UTIL * 0.6, lineBreak: false });
    d.text(String(this.pagina), MARGEM.esq, yLinha + 7, { width: LARGURA_UTIL, align: "right", lineBreak: false });
  }

  /* Mede e desenha runs com quebra de linha manual — necessário porque
     cada pedaço pode ter fonte diferente, e o text() do pdfkit mede
     tudo com uma fonte só. */
  linhasDeRuns(runs, largura, tamanho) {
    const d = this.doc;
    const linhas = [];
    let atual = [], larguraAtual = 0;

    for (const run of runs) {
      const fonte = FONTE[run.estilo] || FONTE.normal;
      const tam = run.estilo === "code" ? tamanho - 0.5 : tamanho;
      const palavras = run.texto.split(/(\s+)/).filter((p) => p !== "");
      for (const palavra of palavras) {
        d.font(fonte).fontSize(tam);
        const w = d.widthOfString(palavra);
        if (larguraAtual + w > largura && atual.length && palavra.trim()) {
          linhas.push(atual);
          atual = []; larguraAtual = 0;
          if (!palavra.trim()) continue;
        }
        atual.push({ texto: palavra, estilo: run.estilo, largura: w, tamanho: tam });
        larguraAtual += w;
      }
    }
    if (atual.length) linhas.push(atual);
    return linhas;
  }

  desenharRuns(runs, x, largura, tamanho, alturaLinha, cor) {
    const d = this.doc;
    const linhas = this.linhasDeRuns(runs, largura, tamanho);
    for (const linha of linhas) {
      this.espaco(alturaLinha);
      let cx = x;
      for (const pedaco of linha) {
        d.font(FONTE[pedaco.estilo] || FONTE.normal).fontSize(pedaco.tamanho);
        d.fillColor(pedaco.estilo === "code" ? COR.ouro : cor);
        d.text(pedaco.texto, cx, this.y, { lineBreak: false });
        cx += pedaco.largura;
      }
      this.y += alturaLinha;
    }
  }

  alturaDeRuns(runs, largura, tamanho, alturaLinha) {
    return this.linhasDeRuns(runs, largura, tamanho).length * alturaLinha;
  }

  titulo(nivel, texto) {
    const d = this.doc;
    const limpo = sanitizar(texto);

    if (nivel === 1) {
      /* H1 sempre abre página — cada capítulo começa limpo */
      if (this.pagina > 0) this.novaPagina();
      this.y += 6;
      d.font(FONTE.display).fontSize(25).fillColor(COR.tinta);
      d.text(limpo, MARGEM.esq, this.y, { width: LARGURA_UTIL });
      this.y = d.y + 8;
      d.moveTo(MARGEM.esq, this.y).lineTo(MARGEM.esq + 54, this.y).lineWidth(2).stroke(COR.ouro);
      this.y += 18;
      return;
    }

    const tam = nivel === 2 ? 17 : 13.5;
    this.espaco(tam + 28);
    this.y += nivel === 2 ? 18 : 13;
    d.font(nivel === 2 ? FONTE.display : FONTE.bold).fontSize(tam);
    d.fillColor(nivel === 2 ? COR.tinta : COR.ouro);
    d.text(limpo, MARGEM.esq, this.y, { width: LARGURA_UTIL });
    this.y = d.y + (nivel === 2 ? 10 : 7);
  }

  paragrafo(texto) {
    const ehAviso = /^⚠/.test(texto.trim());
    const runs = partirInline(sanitizar(texto));
    if (!runs.length) return;

    if (ehAviso) return this.callout(runs, COR.avisoFundo, COR.aviso, COR.tinta);
    this.desenharRuns(runs, MARGEM.esq, LARGURA_UTIL, 12, 18, COR.tinta);
    this.y += 11;
  }

  callout(runs, fundo, barra, corTexto, italico = false) {
    const d = this.doc;
    const pad = 11;
    const largura = LARGURA_UTIL - pad * 2 - 4;
    const runsFinais = italico
      ? runs.map((r) => ({ ...r, estilo: r.estilo === "bold" ? "bolditalic" : r.estilo === "normal" ? "italic" : r.estilo }))
      : runs;
    const altura = this.alturaDeRuns(runsFinais, largura, 9.5, 14) + pad * 2;

    this.espaco(altura + 10);
    d.rect(MARGEM.esq, this.y, LARGURA_UTIL, altura).fill(fundo);
    d.rect(MARGEM.esq, this.y, 3, altura).fill(barra);

    this.y += pad;
    this.desenharRuns(runsFinais, MARGEM.esq + pad + 4, largura, 12, 18, corTexto);
    this.y += pad + 9;
  }

  citacao(texto) {
    /* linhas em branco dentro da citação separam parágrafos */
    const partes = texto.split(/\n\s*\n/).filter((p) => p.trim());
    const runs = [];
    partes.forEach((p, idx) => {
      if (idx) runs.push({ texto: "   ", estilo: "normal" });
      runs.push(...partirInline(sanitizar(p.replace(/\n/g, " "))));
    });
    this.callout(runs, COR.citacaoFundo, COR.ouro, COR.tinta, true);
  }

  lista(itens, ordenada) {
    const d = this.doc;
    const recuo = 15;
    itens.forEach((item, idx) => {
      const limpo = sanitizar(item);
      const caixa = limpo.match(/^\[([ x])\]\s*(.*)$/i);
      const texto = caixa ? caixa[2] : limpo;
      const runs = partirInline(texto);
      if (!runs.length) return;

      const altura = this.alturaDeRuns(runs, LARGURA_UTIL - recuo, 9.5, 13.5);
      this.espaco(altura);

      const yMarca = this.y;
      if (caixa) {
        d.rect(MARGEM.esq + 2, yMarca + 1.5, 7.5, 7.5).lineWidth(0.8).stroke(COR.ouro);
      } else if (ordenada) {
        d.font(FONTE.bold).fontSize(9.5).fillColor(COR.ouro);
        d.text(`${idx + 1}.`, MARGEM.esq, yMarca, { width: recuo - 4, lineBreak: false });
      } else {
        d.circle(MARGEM.esq + 4, yMarca + 5, 1.7).fill(COR.ouro);
      }

      this.desenharRuns(runs, MARGEM.esq + recuo, LARGURA_UTIL - recuo, 12, 17.5, COR.tinta);
      this.y += 3;
    });
    this.y += 6;
  }

  tabela(cabecalho, linhas) {
    const d = this.doc;
    const nCols = cabecalho.length;
    const padCel = 6;

    /* Largura por coluna proporcional ao conteúdo mais longo, com piso
       e teto para nenhuma coluna sumir nem engolir a tabela. */
    const pesos = cabecalho.map((_, c) => {
      const textos = [cabecalho[c], ...linhas.map((l) => l[c] || "")];
      const maior = Math.max(...textos.map((t) => sanitizar(t).replace(/[*`]/g, "").length));
      return Math.max(6, Math.min(maior, 46));
    });
    const soma = pesos.reduce((s, p) => s + p, 0);
    const larguras = pesos.map((p) => (p / soma) * LARGURA_UTIL);

    const alturaLinhaTabela = 15;

    const desenharLinha = (celulas, ehCabecalho) => {
      const runsPorCel = celulas.map((c) => partirInline(sanitizar(c || "")));
      const alturas = runsPorCel.map((runs, idx) =>
        this.alturaDeRuns(runs, larguras[idx] - padCel * 2, 10, alturaLinhaTabela)
      );
      const alturaCel = Math.max(...alturas, alturaLinhaTabela) + padCel * 1.6;

      this.espaco(alturaCel);
      const yTopo = this.y;

      if (ehCabecalho) d.rect(MARGEM.esq, yTopo, LARGURA_UTIL, alturaCel).fill(COR.ouroFraco);

      let cx = MARGEM.esq;
      runsPorCel.forEach((runs, idx) => {
        const yGuardado = this.y;
        this.y = yTopo + padCel * 0.8;
        const finais = ehCabecalho
          ? runs.map((r) => ({ ...r, estilo: r.estilo === "normal" ? "bold" : r.estilo }))
          : runs;
        this.desenharRuns(finais, cx + padCel, larguras[idx] - padCel * 2, 10, alturaLinhaTabela,
          ehCabecalho ? COR.tinta : COR.tinta);
        this.y = yGuardado;
        cx += larguras[idx];
      });

      this.y = yTopo + alturaCel;
      d.moveTo(MARGEM.esq, this.y).lineTo(MARGEM.esq + LARGURA_UTIL, this.y).lineWidth(0.5).stroke(COR.regra);
    };

    this.espaco(50);
    this.y += 4;
    desenharLinha(cabecalho, true);
    for (const linha of linhas) desenharLinha(linha, false);
    this.y += 10;
  }

  codigo(linhas) {
    const d = this.doc;
    const pad = 9;
    const altura = linhas.length * 11 + pad * 2;
    this.espaco(altura + 8);
    d.rect(MARGEM.esq, this.y, LARGURA_UTIL, altura).fill("#F4F1EA");
    this.y += pad;
    d.font(FONTE.code).fontSize(8).fillColor(COR.tinta);
    for (const l of linhas) {
      d.text(sanitizar(l) || " ", MARGEM.esq + pad, this.y, { width: LARGURA_UTIL - pad * 2, lineBreak: false });
      this.y += 11;
    }
    this.y += pad + 6;
  }

  regra() {
    const d = this.doc;
    this.espaco(20);
    this.y += 8;
    d.moveTo(MARGEM.esq + LARGURA_UTIL * 0.35, this.y)
      .lineTo(MARGEM.esq + LARGURA_UTIL * 0.65, this.y)
      .lineWidth(0.6).stroke(COR.regra);
    this.y += 12;
  }
}

/* ── Capa ──────────────────────────────────────────────────── */
function capa(doc, meta) {
  const L = doc.page.width, A = doc.page.height;
  doc.rect(0, 0, L, A).fill(COR.capaFundo);

  doc.font(FONTE.display).fontSize(11).fillColor(COR.ouroClaro);
  doc.text("CONTADORIA", 0, A * 0.30, { width: L, align: "center", characterSpacing: 4 });

  const yTraco = A * 0.30 + 24;
  doc.moveTo(L / 2 - 28, yTraco).lineTo(L / 2 + 28, yTraco).lineWidth(0.8).stroke(COR.ouro);

  doc.font(FONTE.display).fontSize(34).fillColor(COR.capaTinta);
  doc.text(sanitizar(meta.titulo || ""), 60, A * 0.40, { width: L - 120, align: "center" });

  if (meta.subtitulo) {
    doc.font(FONTE.normal).fontSize(11).fillColor("#9A9078");
    doc.text(sanitizar(meta.subtitulo), 80, doc.y + 14, { width: L - 160, align: "center", lineGap: 3 });
  }

  doc.font(FONTE.code).fontSize(8).fillColor("#6E6455");
  doc.text(sanitizar(meta.versao || ""), 0, A - 92, { width: L, align: "center", characterSpacing: 1 });

  doc.font(FONTE.normal).fontSize(7.5).fillColor("#4E4739");
  doc.text("Documento interno · relatório gerencial, não é peça contábil oficial",
    0, A - 72, { width: L, align: "center" });
}

/* ── Sumário ───────────────────────────────────────────────── */
function sumario(render, blocos) {
  const d = render.doc;
  render.novaPagina();
  d.font(FONTE.display).fontSize(19).fillColor(COR.tinta);
  d.text("Sumário", MARGEM.esq, render.y);
  render.y = d.y + 8;
  d.moveTo(MARGEM.esq, render.y).lineTo(MARGEM.esq + 54, render.y).lineWidth(2).stroke(COR.ouro);
  render.y += 22;

  for (const b of blocos) {
    if (b.tipo !== "titulo" || b.nivel > 2) continue;
    const limpo = sanitizar(b.texto);
    render.espaco(18);
    if (b.nivel === 1) {
      render.y += 6;
      d.font(FONTE.bold).fontSize(10).fillColor(COR.tinta);
      d.text(limpo, MARGEM.esq, render.y, { width: LARGURA_UTIL });
      render.y = d.y + 3;
    } else {
      d.font(FONTE.normal).fontSize(9).fillColor(COR.muted);
      d.text(limpo, MARGEM.esq + 16, render.y, { width: LARGURA_UTIL - 16 });
      render.y = d.y + 2;
    }
  }
}

/* ── Geração de um documento ───────────────────────────────── */
function gerar(arquivo) {
  const bruto = fs.readFileSync(path.join(DOCS, arquivo), "utf8");
  const { meta, corpo } = lerFrontmatter(bruto);
  const blocos = parsear(corpo);

  const nomeSaida = arquivo.replace(/\.md$/, ".pdf");
  const alvo = path.join(SAIDA, nomeSaida);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGEM.topo, bottom: MARGEM.base, left: MARGEM.esq, right: MARGEM.dir },
    info: {
      Title: sanitizar(meta.titulo || arquivo),
      Author: "Contadoria",
      Subject: sanitizar(meta.subtitulo || ""),
    },
    autoFirstPage: false,
  });

  const fluxo = fs.createWriteStream(alvo);
  doc.pipe(fluxo);

  doc.addPage();
  capa(doc, meta);

  const render = new Render(doc, meta);
  sumario(render, blocos);

  for (const b of blocos) {
    switch (b.tipo) {
      case "titulo": render.titulo(b.nivel, b.texto); break;
      case "paragrafo": render.paragrafo(b.texto); break;
      case "lista": render.lista(b.itens, b.ordenada); break;
      case "tabela": render.tabela(b.cabecalho, b.linhas); break;
      case "citacao": render.citacao(b.texto); break;
      case "codigo": render.codigo(b.linhas); break;
      case "regra": render.regra(); break;
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    fluxo.on("finish", () => resolve({ alvo, paginas: render.pagina + 1 }));
    fluxo.on("error", reject);
  });
}

/* ── Principal ─────────────────────────────────────────────── */
const filtro = process.argv[2];
const alvos = filtro ? DOCUMENTOS.filter((d) => d.startsWith(filtro)) : DOCUMENTOS;

if (!alvos.length) {
  console.error(`✗ nenhum documento casa com "${filtro}". Disponíveis:\n  ${DOCUMENTOS.join("\n  ")}`);
  process.exit(1);
}

fs.mkdirSync(SAIDA, { recursive: true });

for (const arquivo of alvos) {
  const { alvo, paginas } = await gerar(arquivo);
  const kb = (fs.statSync(alvo).size / 1024).toFixed(0);
  console.log(`✓ ${path.relative(RAIZ, alvo)}  —  ${paginas} páginas, ${kb} KB`);
}

console.log("\nPronto. Editou o Markdown em docs/, rode de novo e o PDF sai atualizado.");
