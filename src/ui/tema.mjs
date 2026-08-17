/* ============================================================
   CONTADORIA — TEMA

   Copiado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   contlife.jsx (bloco THEMES) — preto-carvão + marfim + OURO metálico +
   esmeralda/bordô, papel de convite. Decisão de docs/02_ESCOPO.md §5:
   "passa luxo, contabilidade, seriedade, dinheiro".

   IDENTIDADE ÚNICA COM O CONTLIFE — DECIDIDO 17/ago/2026
   ------------------------------------------------------------
   SUBSTITUI a variação em cobre que vigorou de 12 a 17/ago. A ideia
   original era distinguir os dois sistemas num relance trocando o metal
   (ouro → cobre). O dono decidiu o contrário: **uma identidade só**, o
   ouro do ContLife nos dois. O motivo vence o anterior — os dois
   sistemas são do mesmo dono, para o mesmo tipo de trabalho, e uma casa
   com duas caras enfraquece as duas. Distinguir qual sistema está
   aberto é papel do NOME na tela, não da cor.

   POR QUE ESTES HEXADECIMAIS EXATOS, E NÃO "UM DOURADO QUALQUER"
   ------------------------------------------------------------
   Não é gosto: são os valores já auditados para contraste no ContLife
   (notas A16 e D1 de lá, jul/2026), medidos contra WCAG AA:
     · claro — muted/accent/gold escurecidos até ≥4,5:1 no texto e
       4,96:1 no texto do botão sobre o gradiente
     · escuro — bordô nudge #C05A62 → #C56068 para passar 4,56:1 sobre a
       superfície escura (o anterior dava 4,38:1)
   `gold2` é a ponta CLARA do gradiente de botão — funciona ali porque o
   texto do botão é escuro por cima. Como TEXTO no tema claro daria só
   2,1:1 e a palavra sumiria; por isso `wordGold2` existe separado,
   recalibrado para ≥4,5:1. No escuro os dois coincidem (gold2 já tem
   ~14:1 sobre o papel).
   Trocar qualquer um destes tons refaz a auditoria de contraste.
   ============================================================ */

export const THEMES = {
  light: {
    /* marfim + ouro envelhecido: papel de convite, não escritório */
    paper: "#F4EFE2", surface: "#FBF8EF", ink: "#1B1710", muted: "#635B49",
    rule: "#7A5C10", ruleFaint: "#E3DBC5", accent: "#7A5C10",
    gold: "#7A5C10", gold2: "#C9A227",
    wordGold2: "#856614",
    credit: "#23684A", debit: "#964048", chartGrid: "#E3DBC5",
    pie: ["#7A5C10", "#23684A", "#C9A227", "#964048", "#5E5433", "#3E8E68", "#7A5C22", "#8C8270", "#B08D3B"],
  },
  dark: {
    /* preto-carvão quente + ouro metálico + esmeralda: o padrão da casa */
    paper: "#0B0A07", surface: "#14110B", ink: "#EDE6D3", muted: "#9A9078",
    rule: "#D4AF37", ruleFaint: "#26221680", accent: "#D4AF37",
    gold: "#D4AF37", gold2: "#F0D77B",
    wordGold2: "#F0D77B",
    credit: "#3E9A6E", debit: "#C56068", chartGrid: "#262216",
    pie: ["#D4AF37", "#3E9A6E", "#F0D77B", "#C05A62", "#A67C36", "#1F5C44", "#8C8270", "#7A6A2E", "#D9CFAE"],
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
    --accent-soft:${dark ? "rgba(212,175,55,0.10)" : "rgba(122,92,16,0.09)"};
    --accent-border:${dark ? "rgba(212,175,55,0.32)" : "rgba(122,92,16,0.28)"};
    --credit-soft:${dark ? "rgba(62,154,110,0.14)" : "rgba(35,104,74,0.10)"};
    --debit-soft:${dark ? "rgba(192,90,98,0.14)" : "rgba(150,64,72,0.10)"};
    --font-display:'Playfair Display',serif; --font-body:'Inter',sans-serif; --font-mono:'IBM Plex Mono',monospace;
  `;
}
