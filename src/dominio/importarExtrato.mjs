/* ============================================================
   IMPORTAR EXTRATO — copiado de C:\Users\LUAN S\OneDrive\Documentos\
   sistema financeio, contlife.jsx (parseOFX/parseCSVText/toISO,
   ~linha 2069-2091, 12/ago/2026) — quase ao pé da letra: docs/01 §grade A.
   Nenhuma linha de domínio aqui — parsing de arquivo é parsing de
   arquivo, vale igual para qualquer app.
   ============================================================ */

export function parseOFX(text) {
  const rows = [];
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  for (const b of blocks) {
    const g = (tag) => { const m = b.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i")); return m ? m[1].trim() : ""; };
    const dt = g("DTPOSTED").slice(0, 8);
    const date = dt.length === 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : "";
    const amt = parseFloat(g("TRNAMT").replace(",", "."));
    const desc = g("MEMO") || g("NAME");
    if (date && !isNaN(amt)) rows.push({ date, desc, amount: amt });
  }
  return rows;
}

export function parseCSVText(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { header: [], rows: [] };
  const sep = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
  const split = (l) => l.split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
  const header = split(lines[0]);
  return { header, rows: lines.slice(1).map(split) };
}

export const toISO = (s) => {
  s = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
  if (m) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; }
  return "";
};
