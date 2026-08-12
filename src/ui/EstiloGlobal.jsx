import React from "react";
import { THEMES, variaveisCss } from "./tema.mjs";

/* Adaptado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   contlife.jsx (bloco de <style> dentro de Shell, 12/ago/2026) — mesma
   fonte, mesmas regras de acessibilidade (D7: alvo de toque no celular,
   foco visível, `prefers-reduced-motion`). Modularizado aqui porque o
   Contadoria começa em vários arquivos de propósito (docs/01 §3.3: não
   herdar o arquivo único). */
export function EstiloGlobal({ dark }) {
  const T = THEMES[dark ? "dark" : "light"];
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      :root { ${variaveisCss(T, dark)} }
      body { font-family: var(--font-body); background: ${T.paper}; }
      ::selection { background: var(--gold); color: #171204; }
      button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
      input::placeholder { color: var(--muted); opacity: 0.7; }

      /* alvo de toque mínimo no celular — lição paga do ContLife (série D) */
      button, select, input[type="checkbox"] { min-height: 40px; }

      /* "surgir": usada em Negocios.jsx quando um card acabou de ser
         criado — um leve deslizar + aparecer, não um piscar seco. */
      @keyframes surgir {
        from { opacity: 0; transform: translateY(6px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation: none !important; transition: none !important; }
      }
    `}</style>
  );
}
