/* ============================================================
   CONTADORIA — TEMA

   Estrutura copiada de C:\Users\LUAN S\OneDrive\Documentos\sistema
   financeio, contlife.jsx (bloco THEMES, 12/ago/2026) — mesma família:
   preto-carvão + marfim + esmeralda/bordô, papel de convite. É a decisão
   registrada em docs/02_ESCOPO.md §5: "passa luxo, contabilidade,
   seriedade, dinheiro — os dois sistemas são primos".

   A VARIAÇÃO DELIBERADA (docs/SESSION_STATE.md, lacuna 3, 12/ago)
   ------------------------------------------------------------
   Herdar a paleta IGUAL tinha um custo: o dono não distinguiria num
   relance qual sistema está aberto. Em vez do OURO do ContLife
   (`#D4AF37`), o Contadoria usa COBRE — mesma família de "metal precioso
   sobre preto", tom diferente. `credit`/`debit` (esmeralda/bordô) são
   cor SEMÂNTICA (o que sobe é verde, o que desce é vermelho em qualquer
   contabilidade) — essas não mudam entre os dois sistemas de propósito.

   Os valores do claro seguem a MESMA lógica do ContLife (comentário A16
   de lá): a ponta clara do gradiente (`gold2`) só funciona como fundo de
   BOTÃO (texto escuro por cima); usada como texto teria contraste baixo
   demais sobre o papel claro — por isso `wordGold2` é recalibrado à
   parte, mais escuro, só para uso em texto/gradiente de palavra.
   ⚠️ Os tons abaixo seguem essa lógica por ANALOGIA aos pares já
   auditados do ContLife — vale medir com um verificador de contraste de
   verdade antes de expor isto a alguém além do dono (hoje é uso interno).
   ============================================================ */

export const THEMES = {
  light: {
    paper: "#F4EFE2", surface: "#FBF8EF", ink: "#1B1710", muted: "#635B49",
    rule: "#8A4F1E", ruleFaint: "#E3DBC5", accent: "#8A4F1E",
    gold: "#8A4F1E", gold2: "#C97A3D",
    wordGold2: "#7A431A",
    credit: "#23684A", debit: "#964048", chartGrid: "#E3DBC5",
    pie: ["#8A4F1E", "#23684A", "#C97A3D", "#964048", "#5E5433", "#3E8E68", "#7A5C22", "#8C8270", "#B08D3B"],
  },
  dark: {
    paper: "#0B0A07", surface: "#14110B", ink: "#EDE6D3", muted: "#9A9078",
    rule: "#C97A3D", ruleFaint: "#26221680", accent: "#C97A3D",
    gold: "#C97A3D", gold2: "#E8A46B",
    wordGold2: "#E8A46B",
    credit: "#3E9A6E", debit: "#C56068", chartGrid: "#262216",
    pie: ["#C97A3D", "#3E9A6E", "#E8A46B", "#C05A62", "#A67C36", "#1F5C44", "#8C8270", "#7A6A2E", "#D9CFAE"],
  },
};

/* Monta o bloco de variáveis CSS para o tema ativo — usado pelo
   <EstiloGlobal> em src/ui/EstiloGlobal.jsx. Separado em função pura para
   poder existir fora do componente (ex.: pré-visualização de tema). */
export function variaveisCss(T, dark) {
  return `
    --paper:${T.paper}; --surface:${T.surface}; --ink:${T.ink}; --muted:${T.muted};
    --rule:${T.rule}; --rule-faint:${T.ruleFaint}; --accent:${T.accent};
    --gold:${T.gold}; --gold-2:${T.gold2}; --word-gold-2:${T.wordGold2};
    --credit:${T.credit}; --debit:${T.debit};
    --accent-soft:${dark ? "rgba(201,122,61,0.10)" : "rgba(138,79,30,0.09)"};
    --accent-border:${dark ? "rgba(201,122,61,0.32)" : "rgba(138,79,30,0.28)"};
    --credit-soft:${dark ? "rgba(62,154,110,0.14)" : "rgba(35,104,74,0.10)"};
    --debit-soft:${dark ? "rgba(192,90,98,0.14)" : "rgba(150,64,72,0.10)"};
    --font-display:'Playfair Display',serif; --font-body:'Inter',sans-serif; --font-mono:'IBM Plex Mono',monospace;
  `;
}
