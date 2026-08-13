import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

/* ============================================================
   CONTADORIA — PRIMITIVAS DE UI

   Base copiada de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   contlife.jsx (Card/Button/Input/Label/Select, ~linha 4110-4290,
   12/ago/2026) — Tailwind para layout/espaçamento, `style={{}}` com
   variáveis CSS para cor (docs/08 §6, convenção herdada).

   O QUE MUDOU DE PROPÓSITO EM RELAÇÃO AO ORIGINAL
   ------------------------------------------------------------
   O dono pediu, no meio da sessão que criou este arquivo: visual
   "interativo, intuitivo e nada cansativo", um sistema "vivo" como o
   ContLife — mas SEM mascote (docs/02 §5: aqui o usuário é ele mesmo,
   não um leigo precisando de acolhimento). A resposta é microinteração,
   não personagem: toda ação dá uma resposta visual pequena e imediata —
   hover que levanta, clique que "aperta", número que conta em vez de
   aparecer pronto, confirmação de salvo que pulsa e some. Isso entra
   AQUI, na base, porque plantar depois em 40 telas custaria muito mais
   que nascer com a primitiva.
   ============================================================ */

const PADS = { true: "p-5", solto: "p-7", apertado: "px-4 py-3" };

/* `elevavel`: hover levanta o card 1px e escurece a borda — usado em
   cards que são também botão (ex.: abrir um negócio na prateleira). Card
   comum (formulário, texto) fica parado — nem tudo precisa reagir. */
export const Card = ({ children, className = "", pad = true, elevavel = false, onClick, id, style }) => (
  <div
    id={id}
    onClick={onClick}
    className={`rounded-md border ${pad ? (PADS[pad] || PADS.true) : ""} ${elevavel ? "cursor-pointer transition-all duration-150 hover:-translate-y-0.5" : ""} ${className}`}
    style={{
      borderColor: "var(--rule-faint)",
      background: "var(--surface)",
      boxShadow: elevavel ? "0 1px 2px rgba(0,0,0,0.06)" : undefined,
      ...style,
    }}
    onMouseEnter={elevavel ? (e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)"; } : undefined}
    onMouseLeave={elevavel ? (e) => { e.currentTarget.style.borderColor = "var(--rule-faint)"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)"; } : undefined}
  >
    {children}
  </div>
);

export const Label = ({ children }) => (
  <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{children}</div>
);

/* transição suave na borda ao focar — sensação de resposta, não só o
   outline seco do navegador */
export const Input = ({ mono, money, num, className = "", ...p }) => (
  <input {...p}
    inputMode={money ? "decimal" : num ? "numeric" : p.inputMode}
    enterKeyHint={p.enterKeyHint || (money || num ? "done" : undefined)}
    className={`w-full rounded-md border px-3 py-2 text-sm transition-colors duration-150 ${money || num ? "text-right tabular-nums" : ""} ${className}`}
    style={{ borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)", fontFamily: (mono || money || num) ? "var(--font-mono)" : "var(--font-body)" }} />
);

export function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full appearance-none rounded-md border px-3 py-2 text-sm pr-8 transition-colors duration-150"
        style={{ borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
    </div>
  );
}

/* Hover levanta 1px, clique "aperta" (scale 0.97) — o toque tem peso,
   não é só cor mudando. `disabled` já não reage, sem precisar de lógica
   extra: `active:scale-100` some quando `pointer-events-none` entra. */
export function Button({ children, onClick, variant = "primary", type = "button", small, disabled }) {
  const s = {
    primary: { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600, boxShadow: "0 1px 0 rgba(0,0,0,0.25)" },
    ghost: { background: "transparent", color: "var(--ink)", border: "1px solid var(--rule-faint)" },
    danger: { background: "var(--debit)", color: "#fff" },
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-all duration-150 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 ${small ? "px-2.5 py-1.5 text-xs min-h-[40px]" : "px-4 py-2.5 text-sm"}`}
      style={s}>{children}</button>
  );
}

/* Contagem animada — em vez do número aparecer pronto, ele sobe até o
   valor final em ~500ms. Usado em qualquer StatCard/resumo numérico do
   Contadoria (herdado do princípio do useContagem do ContLife, ~linha
   4072, mas exposto aqui como hook de primitiva, não escondido dentro de
   uma tela só). Números que não mudam não pulam: o efeito só dispara
   quando o VALOR muda de verdade. */
export function useContagem(valorFinal, ativo = true) {
  const [valor, setValor] = useState(ativo ? 0 : valorFinal);
  const anterior = useRef(ativo ? 0 : valorFinal);
  useEffect(() => {
    if (!ativo) { setValor(valorFinal); return; }
    const de = anterior.current;
    const inicio = performance.now();
    const DURACAO = 500;
    let quadro;
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / DURACAO);
      const suavizado = 1 - Math.pow(1 - t, 3); /* ease-out cúbico */
      setValor(de + (valorFinal - de) * suavizado);
      if (t < 1) quadro = requestAnimationFrame(passo);
      else anterior.current = valorFinal;
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
    // eslint-disable-next-line
  }, [valorFinal, ativo]);
  return valor;
}

/* Confirmação de ação — pulsa e some sozinha. Mesmo papel do "savedTick"
   do ContLife (ver contlife.jsx, App), mas como componente reaproveitável
   em qualquer tela, não só na gravação do estado inteiro. */
export function Confirmacao({ texto, ativa }) {
  return (
    <div
      className="text-xs rounded-md px-3 py-2 transition-all duration-300"
      style={{
        background: "var(--credit-soft)", color: "var(--credit)",
        opacity: ativa ? 1 : 0,
        transform: ativa ? "translateY(0)" : "translateY(-4px)",
        pointerEvents: "none",
      }}
    >{texto}</div>
  );
}

export const AlertLine = ({ children }) => (
  <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--debit)" }}>{children}</div>
);

/* Abas — copiado do ContLife (contlife.jsx, ~linha 4303), a peça que
   faltava para o Livro (Lançar/Diário/Razão/Balancete). */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-lg border w-fit" style={{ borderColor: "var(--rule-faint)", background: "var(--surface)" }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
          style={active === t.id
            ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600 }
            : { background: "transparent", color: "var(--muted)" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
