// src/app/App.jsx
import React23, { useState as useState19, useEffect as useEffect11 } from "react";

// src/dados/supabase.mjs
import { createClient } from "@supabase/supabase-js";
var SUPABASE_URL = "https://gmiiuklkhwjpcowvjbwz.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaWl1a2xraHdqcGNvd3ZqYnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NjU5NTMsImV4cCI6MjEwMjE0MTk1M30.CJ6KsMBPD4J8LkxJeGVIBqI-F9WXX5arOPtLEqIj4Wk";
var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
function traduzErroAuth(msg) {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar \u2014 veja a caixa de entrada (e o spam).";
  if (m.includes("already registered") || m.includes("user already exists")) return "Este e-mail j\xE1 tem cadastro \u2014 tente entrar, ou recupere a senha.";
  if (m.includes("password should be at least") || m.includes("password is too short")) return "A senha precisa de pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many requests")) return "Muitas tentativas em pouco tempo \u2014 espere um minuto e tente de novo.";
  if (m.includes("unable to validate email address") || m.includes("invalid email")) return "Esse e-mail n\xE3o parece v\xE1lido.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Sem conex\xE3o com o servidor \u2014 confira sua internet.";
  return msg || "Algo deu errado. Tente de novo.";
}

// src/ui/EstiloGlobal.jsx
import React from "react";

// src/ui/tema.mjs
var THEMES = {
  light: {
    paper: "#F4EFE2",
    surface: "#FBF8EF",
    ink: "#1B1710",
    muted: "#635B49",
    rule: "#8A4F1E",
    ruleFaint: "#E3DBC5",
    accent: "#8A4F1E",
    gold: "#8A4F1E",
    gold2: "#C97A3D",
    wordGold2: "#7A431A",
    credit: "#23684A",
    debit: "#964048",
    chartGrid: "#E3DBC5",
    pie: ["#8A4F1E", "#23684A", "#C97A3D", "#964048", "#5E5433", "#3E8E68", "#7A5C22", "#8C8270", "#B08D3B"]
  },
  dark: {
    paper: "#0B0A07",
    surface: "#14110B",
    ink: "#EDE6D3",
    muted: "#9A9078",
    rule: "#C97A3D",
    ruleFaint: "#26221680",
    accent: "#C97A3D",
    gold: "#C97A3D",
    gold2: "#E8A46B",
    wordGold2: "#E8A46B",
    credit: "#3E9A6E",
    debit: "#C56068",
    chartGrid: "#262216",
    pie: ["#C97A3D", "#3E9A6E", "#E8A46B", "#C05A62", "#A67C36", "#1F5C44", "#8C8270", "#7A6A2E", "#D9CFAE"]
  }
};
function variaveisCss(T, dark) {
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

// src/ui/EstiloGlobal.jsx
function EstiloGlobal({ dark }) {
  const T = THEMES[dark ? "dark" : "light"];
  return /* @__PURE__ */ React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      :root { ${variaveisCss(T, dark)} }
      body { font-family: var(--font-body); background: ${T.paper}; }
      ::selection { background: var(--gold); color: #171204; }
      button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
      input::placeholder { color: var(--muted); opacity: 0.7; }

      /* alvo de toque m\xEDnimo no celular \u2014 li\xE7\xE3o paga do ContLife (s\xE9rie D) */
      button, select, input[type="checkbox"] { min-height: 40px; }

      /* "surgir": usada em Negocios.jsx quando um card acabou de ser
         criado \u2014 um leve deslizar + aparecer, n\xE3o um piscar seco. */
      @keyframes surgir {
        from { opacity: 0; transform: translateY(6px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation: none !important; transition: none !important; }
      }
    `);
}

// src/telas/Autenticacao.jsx
import React3, { useState as useState2, useEffect as useEffect2 } from "react";
import { Mail } from "lucide-react";

// src/ui/primitivas.jsx
import React2, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
var PADS = { true: "p-5", solto: "p-7", apertado: "px-4 py-3" };
var Card = ({ children, className = "", pad = true, elevavel = false, onClick, id, style }) => /* @__PURE__ */ React2.createElement(
  "div",
  {
    id,
    onClick,
    className: `rounded-md border ${pad ? PADS[pad] || PADS.true : ""} ${elevavel ? "cursor-pointer transition-all duration-150 hover:-translate-y-0.5" : ""} ${className}`,
    style: {
      borderColor: "var(--rule-faint)",
      background: "var(--surface)",
      boxShadow: elevavel ? "0 1px 2px rgba(0,0,0,0.06)" : void 0,
      ...style
    },
    onMouseEnter: elevavel ? (e) => {
      e.currentTarget.style.borderColor = "var(--accent-border)";
      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
    } : void 0,
    onMouseLeave: elevavel ? (e) => {
      e.currentTarget.style.borderColor = "var(--rule-faint)";
      e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)";
    } : void 0
  },
  children
);
var Label = ({ children }) => /* @__PURE__ */ React2.createElement("div", { className: "text-[11px] uppercase tracking-wide mb-1", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, children);
var Input = ({ mono, money, num: num2, className = "", ...p }) => /* @__PURE__ */ React2.createElement(
  "input",
  {
    ...p,
    inputMode: money ? "decimal" : num2 ? "numeric" : p.inputMode,
    enterKeyHint: p.enterKeyHint || (money || num2 ? "done" : void 0),
    className: `w-full rounded-md border px-3 py-2 text-sm transition-colors duration-150 ${money || num2 ? "text-right tabular-nums" : ""} ${className}`,
    style: { borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)", fontFamily: mono || money || num2 ? "var(--font-mono)" : "var(--font-body)" }
  }
);
function Select({ value, onChange, options, placeholder }) {
  return /* @__PURE__ */ React2.createElement("div", { className: "relative" }, /* @__PURE__ */ React2.createElement(
    "select",
    {
      value,
      onChange: (e) => onChange(e.target.value),
      className: "w-full appearance-none rounded-md border px-3 py-2 text-sm pr-8 transition-colors duration-150",
      style: { borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }
    },
    placeholder && /* @__PURE__ */ React2.createElement("option", { value: "" }, placeholder),
    options.map((o) => /* @__PURE__ */ React2.createElement("option", { key: o.value, value: o.value }, o.label))
  ), /* @__PURE__ */ React2.createElement(ChevronDown, { size: 14, className: "absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none", style: { color: "var(--muted)" } }));
}
function Button({ children, onClick, variant = "primary", type = "button", small, disabled }) {
  const s = {
    primary: { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600, boxShadow: "0 1px 0 rgba(0,0,0,0.25)" },
    ghost: { background: "transparent", color: "var(--ink)", border: "1px solid var(--rule-faint)" },
    danger: { background: "var(--debit)", color: "#fff" }
  }[variant];
  return /* @__PURE__ */ React2.createElement(
    "button",
    {
      type,
      onClick,
      disabled,
      className: `inline-flex items-center gap-1.5 rounded-md font-medium transition-all duration-150 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 ${small ? "px-2.5 py-1.5 text-xs min-h-[40px]" : "px-4 py-2.5 text-sm"}`,
      style: s
    },
    children
  );
}
function Confirmacao({ texto, ativa }) {
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "text-xs rounded-md px-3 py-2 transition-all duration-300",
      style: {
        background: "var(--credit-soft)",
        color: "var(--credit)",
        opacity: ativa ? 1 : 0,
        transform: ativa ? "translateY(0)" : "translateY(-4px)",
        pointerEvents: "none"
      }
    },
    texto
  );
}
var AlertLine = ({ children }) => /* @__PURE__ */ React2.createElement("div", { className: "text-xs flex items-center gap-1.5", style: { color: "var(--debit)" } }, children);
function Tabs({ tabs, active, onChange }) {
  return /* @__PURE__ */ React2.createElement("div", { className: "flex flex-wrap gap-1 mb-6 p-1 rounded-lg border w-fit", style: { borderColor: "var(--rule-faint)", background: "var(--surface)" } }, tabs.map((t) => /* @__PURE__ */ React2.createElement(
    "button",
    {
      key: t.id,
      onClick: () => onChange(t.id),
      className: "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
      style: active === t.id ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600 } : { background: "transparent", color: "var(--muted)" }
    },
    t.label
  )));
}

// src/telas/Autenticacao.jsx
function TelaCarregandoAuth() {
  return /* @__PURE__ */ React3.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { background: "var(--paper)" } }, /* @__PURE__ */ React3.createElement("div", { style: { fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "0.08em", background: "linear-gradient(100deg, var(--word-gold-2), var(--gold))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } }, "CONTADORIA"));
}
function TracoAnimado() {
  const [largura, setLargura] = useState2(0);
  useEffect2(() => {
    const id = requestAnimationFrame(() => setLargura(56));
    return () => cancelAnimationFrame(id);
  }, []);
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      className: "mx-auto transition-all duration-700 ease-out",
      style: { height: 0, borderTop: "1px solid var(--gold)", borderBottom: "1px solid var(--gold)", opacity: 0.5, width: largura, marginTop: 10 }
    }
  );
}
function TelaAutenticacao({ redirectTo }) {
  const [modo, setModo] = useState2("entrar");
  const [email, setEmail] = useState2("");
  const [senha, setSenha] = useState2("");
  const [carregando, setCarregando] = useState2(false);
  const [erro, setErro] = useState2("");
  const [mensagem, setMensagem] = useState2("");
  const trocarModo = (m) => {
    setModo(m);
    setErro("");
    setMensagem("");
  };
  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");
    const mail = email.trim();
    if (!mail) {
      setErro("Informe seu e-mail.");
      return;
    }
    if ((modo === "entrar" || modo === "cadastrar") && senha.length < 6) {
      setErro("A senha precisa de pelo menos 6 caracteres.");
      return;
    }
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password: senha });
        if (error) throw error;
      } else if (modo === "cadastrar") {
        const { data, error } = await supabase.auth.signUp({ email: mail, password: senha, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        if (data?.user && !data.session) setMensagem(`Quase l\xE1 \u2014 mandamos um link de confirma\xE7\xE3o pra ${mail}. Abra seu e-mail (e o spam) e clique nele.`);
      } else if (modo === "link_magico") {
        const { error } = await supabase.auth.signInWithOtp({ email: mail, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        setMensagem(`Mandamos um link pra ${mail} \u2014 abra e clique nele. Sem senha nenhuma.`);
      } else if (modo === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo });
        if (error) throw error;
        setMensagem(`Mandamos um link de redefini\xE7\xE3o pra ${mail}.`);
      }
    } catch (err) {
      setErro(traduzErroAuth(err?.message));
    } finally {
      setCarregando(false);
    }
  };
  const precisaSenha = modo === "entrar" || modo === "cadastrar";
  const rotuloBotao = { entrar: "Entrar", cadastrar: "Criar conta", link_magico: "Mandar link m\xE1gico", recuperar: "Mandar link de redefini\xE7\xE3o" }[modo];
  return /* @__PURE__ */ React3.createElement("div", { className: "fixed inset-0 z-50 overflow-y-auto", style: { background: "radial-gradient(120% 80% at 50% -10%, #1a1108 0%, transparent 55%), var(--paper)" } }, /* @__PURE__ */ React3.createElement("div", { className: "min-h-full flex items-center justify-center p-6" }, /* @__PURE__ */ React3.createElement("div", { className: "w-full max-w-sm" }, /* @__PURE__ */ React3.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React3.createElement("div", { className: "text-3xl font-bold", style: { fontFamily: "var(--font-display)", letterSpacing: "0.08em", background: "linear-gradient(100deg, var(--word-gold-2), var(--gold) 45%, var(--word-gold-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } }, "CONTADORIA"), /* @__PURE__ */ React3.createElement(TracoAnimado, null), /* @__PURE__ */ React3.createElement("div", { className: "text-[11px] mt-2", style: { color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.16em" } }, "escritura\xE7\xE3o \xB7 revis\xE3o \xB7 consultoria")), (modo === "entrar" || modo === "cadastrar") && /* @__PURE__ */ React3.createElement("div", { className: "flex gap-1 mb-5 p-1 rounded-lg border w-full", style: { borderColor: "var(--rule-faint)", background: "var(--surface)" } }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: () => trocarModo("entrar"),
      className: "flex-1 rounded-md py-2 text-sm font-medium transition-all duration-150",
      style: modo === "entrar" ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600 } : { color: "var(--muted)" }
    },
    "Entrar"
  ), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: () => trocarModo("cadastrar"),
      className: "flex-1 rounded-md py-2 text-sm font-medium transition-all duration-150",
      style: modo === "cadastrar" ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600 } : { color: "var(--muted)" }
    },
    "Criar conta"
  )), (modo === "link_magico" || modo === "recuperar") && /* @__PURE__ */ React3.createElement("button", { onClick: () => trocarModo("entrar"), className: "text-xs mb-4 inline-flex items-center gap-1 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, "\u2190 Voltar"), /* @__PURE__ */ React3.createElement("form", { onSubmit: enviar, className: "space-y-3" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement(Label, null, "E-mail"), /* @__PURE__ */ React3.createElement(Input, { type: "email", autoComplete: "email", autoFocus: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "voce@exemplo.com" })), precisaSenha && /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement(Label, null, "Senha"), /* @__PURE__ */ React3.createElement(Input, { type: "password", autoComplete: modo === "cadastrar" ? "new-password" : "current-password", value: senha, onChange: (e) => setSenha(e.target.value), placeholder: "m\xEDnimo 6 caracteres" })), erro && /* @__PURE__ */ React3.createElement("div", { className: "text-xs rounded-md px-3 py-2 transition-opacity", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), mensagem && /* @__PURE__ */ React3.createElement("div", { className: "text-xs rounded-md px-3 py-2 inline-flex items-start gap-1.5 transition-opacity", style: { background: "var(--credit-soft)", color: "var(--credit)" } }, /* @__PURE__ */ React3.createElement(Mail, { size: 13, style: { marginTop: 1, flexShrink: 0 } }), /* @__PURE__ */ React3.createElement("span", null, mensagem)), /* @__PURE__ */ React3.createElement(Button, { type: "submit", disabled: carregando }, /* @__PURE__ */ React3.createElement("span", { className: "w-full text-center" }, carregando ? "Um momento\u2026" : rotuloBotao))), modo === "entrar" && /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between mt-4 text-xs", style: { color: "var(--muted)" } }, /* @__PURE__ */ React3.createElement("button", { onClick: () => trocarModo("link_magico"), className: "transition-opacity hover:opacity-70" }, "Entrar com link m\xE1gico"), /* @__PURE__ */ React3.createElement("button", { onClick: () => trocarModo("recuperar"), className: "transition-opacity hover:opacity-70" }, "Esqueci minha senha")))));
}

// src/telas/Negocios.jsx
import React4, { useState as useState3, useEffect as useEffect3, useCallback } from "react";
import { Building2, Plus, X, LogOut, ClipboardList } from "lucide-react";

// src/dominio/razao.mjs
var DEBITO_NORMAL = { ativo: true, despesa: true, passivo: false, pl: false, receita: false };
function saldoDeConta(conta, linhas) {
  let d = 0, c = 0;
  for (const l of linhas) {
    if (l.contaId !== conta.id) continue;
    if (l.tipo === "D") d += l.valor;
    else c += l.valor;
  }
  return DEBITO_NORMAL[conta.tipo] ? d - c : c - d;
}
function balancete(contas, linhas) {
  const porConta = new Map(contas.map((c) => [c.id, { ...c, debito: 0, credito: 0 }]));
  const orfas = [];
  for (const l of linhas) {
    const c = porConta.get(l.contaId);
    if (!c) {
      orfas.push(l);
      continue;
    }
    if (l.tipo === "D") c.debito += l.valor;
    else c.credito += l.valor;
  }
  const linhasBalancete = [...porConta.values()].map((c) => ({ ...c, saldo: DEBITO_NORMAL[c.tipo] ? c.debito - c.credito : c.credito - c.debito })).sort((a, b) => a.codigo.localeCompare(b.codigo));
  const totalDebito = linhasBalancete.reduce((s, c) => s + c.debito, 0);
  const totalCredito = linhasBalancete.reduce((s, c) => s + c.credito, 0);
  return {
    linhas: linhasBalancete,
    totalDebito,
    totalCredito,
    fecha: Math.abs(totalDebito - totalCredito) < 0.01,
    orfas
  };
}
function resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes) {
  const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => l.id));
  const linhasDoMes = lancamentoLinhas.filter((l) => idsDoMes.has(l.lancamentoId));
  const b = balancete(contas, linhasDoMes);
  const receita = b.linhas.filter((c) => c.tipo === "receita").reduce((s, c) => s + c.saldo, 0);
  const despesa = b.linhas.filter((c) => c.tipo === "despesa").reduce((s, c) => s + c.saldo, 0);
  const variacaoCaixaBanco = b.linhas.filter((c) => c.id === "caixa" || c.id === "banco").reduce((s, c) => s + c.saldo, 0);
  return { receita, despesa, resultado: receita - despesa, variacaoCaixaBanco };
}

// src/dados/resumoNegocio.mjs
async function resumoDoMesAtual(negocioId) {
  const mes = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const inicio = `${mes}-01`;
  const fim = `${mes}-31`;
  const [{ data: contasRaw }, { data: lancRaw }] = await Promise.all([
    supabase.from("contas").select("id, codigo, tipo").eq("negocio_id", negocioId),
    supabase.from("lancamentos").select("id, data").eq("negocio_id", negocioId).gte("data", inicio).lte("data", fim)
  ]);
  if (!lancRaw?.length) return { resultado: 0, temMovimento: false };
  const ids = lancRaw.map((l) => l.id);
  const { data: linhasRaw } = await supabase.from("lancamento_linhas").select("lancamento_id, conta_id, tipo, valor").in("lancamento_id", ids);
  const contas = (contasRaw || []).map((c) => ({ id: c.id, codigo: c.codigo, tipo: c.tipo }));
  const lancamentos = lancRaw.map((l) => ({ id: l.id, data: l.data }));
  const linhas = (linhasRaw || []).map((l) => ({ lancamentoId: l.lancamento_id, contaId: l.conta_id, tipo: l.tipo, valor: Number(l.valor) }));
  const r = resultadoDoMes(contas, lancamentos, linhas, mes);
  return { resultado: r.resultado, temMovimento: true };
}

// src/dominio/planoContas.mjs
function planoBase() {
  return [
    // ── 1. Ativo ──────────────────────────────────────────────
    { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo", subtipo: "circulante", ordem: 1 },
    { id: "banco", codigo: "1102", nome: "Banco", tipo: "ativo", subtipo: "circulante", ordem: 2 },
    { id: "maquininha_receber", codigo: "1103", nome: "A receber de maquininha", tipo: "ativo", subtipo: "circulante", ordem: 3 },
    { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo", subtipo: "circulante", ordem: 4 },
    { id: "equipamentos", codigo: "1150", nome: "Equipamentos", tipo: "ativo", subtipo: "nao_circulante", ordem: 50 },
    { id: "veiculos", codigo: "1151", nome: "Ve\xEDculos", tipo: "ativo", subtipo: "nao_circulante", ordem: 51 },
    { id: "deprec_acum", codigo: "1152", nome: "Deprecia\xE7\xE3o acumulada", tipo: "ativo", subtipo: "contra", ordem: 52 },
    // ── 2. Passivo ────────────────────────────────────────────
    { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo", subtipo: "circulante", ordem: 1 },
    { id: "das_a_pagar", codigo: "2102", nome: "DAS a pagar", tipo: "passivo", subtipo: "circulante", ordem: 2 },
    { id: "emprestimos", codigo: "2103", nome: "Empr\xE9stimos", tipo: "passivo", subtipo: "circulante", ordem: 3 },
    { id: "salarios_a_pagar", codigo: "2104", nome: "Sal\xE1rios a pagar", tipo: "passivo", subtipo: "circulante", ordem: 4 },
    // ── 3. Patrimônio líquido ─────────────────────────────────
    { id: "capital_titular", codigo: "3101", nome: "Capital do titular", tipo: "pl", ordem: 1 },
    { id: "retiradas_titular", codigo: "3102", nome: "Retiradas do titular", tipo: "pl", ordem: 2 },
    { id: "lucros_acumulados", codigo: "3103", nome: "Lucros acumulados", tipo: "pl", ordem: 3 },
    // ── 4. Receita ────────────────────────────────────────────
    /* A receita PRINCIPAL vem do arquétipo — ver escolha 4 acima. */
    { id: "outras_receitas", codigo: "4190", nome: "Outras receitas", tipo: "receita", ordem: 90 },
    // ── 5. Despesa ────────────────────────────────────────────
    { id: "aluguel", codigo: "5101", nome: "Aluguel", tipo: "despesa", ordem: 1 },
    { id: "energia", codigo: "5102", nome: "Energia", tipo: "despesa", ordem: 2 },
    { id: "agua", codigo: "5103", nome: "\xC1gua", tipo: "despesa", ordem: 3 },
    { id: "internet_telefone", codigo: "5104", nome: "Internet e telefone", tipo: "despesa", ordem: 4 },
    { id: "taxa_maquininha", codigo: "5105", nome: "Taxa de maquininha", tipo: "despesa", ordem: 5 },
    { id: "combustivel", codigo: "5106", nome: "Combust\xEDvel", tipo: "despesa", ordem: 6 },
    { id: "material_consumo", codigo: "5107", nome: "Material de consumo", tipo: "despesa", ordem: 7 },
    { id: "marketing", codigo: "5108", nome: "Marketing", tipo: "despesa", ordem: 8 },
    { id: "das_despesa", codigo: "5109", nome: "DAS", tipo: "despesa", ordem: 9 },
    { id: "depreciacao", codigo: "5110", nome: "Deprecia\xE7\xE3o", tipo: "despesa", ordem: 10 },
    { id: "tarifas_bancarias", codigo: "5111", nome: "Tarifas banc\xE1rias", tipo: "despesa", ordem: 11 },
    { id: "outras_despesas", codigo: "5190", nome: "Outras despesas", tipo: "despesa", ordem: 90 }
  ];
}
var CONTAS_DINHEIRO = ["caixa", "banco"];

// src/dominio/arquetipos.mjs
var ARQUETIPOS = [
  {
    id: "revenda",
    nome: "Revenda",
    resumo: "Compra pronto e vende sem transformar",
    exemplos: "loja, sacoleira, distribuidora, revenda online, mercadinho",
    contasExtras: [
      { id: "estoque", codigo: "1120", nome: "Estoque de mercadorias", tipo: "ativo", subtipo: "circulante", ordem: 20 },
      { id: "venda_mercadorias", codigo: "4101", nome: "Venda de mercadorias", tipo: "receita", ordem: 1 },
      { id: "cmv", codigo: "5120", nome: "Custo da mercadoria vendida", tipo: "despesa", ordem: 20 },
      { id: "frete_compras", codigo: "5121", nome: "Frete sobre compras", tipo: "despesa", ordem: 21 }
    ],
    camposAbertura: [
      {
        chave: "estoque",
        contaId: "estoque",
        tipo: "D",
        rotulo: "Mercadoria parada (valor de custo aproximado)",
        porque: "\xC9 dinheiro seu que est\xE1 na prateleira em vez de estar no caixa. Saber quanto \xE9 costuma ser o primeiro susto \u2014 e \xE9 a base para descobrir o que gira devagar."
      }
    ],
    achados: ["taxa_engolindo_margem"]
  },
  {
    id: "producao",
    nome: "Produ\xE7\xE3o pr\xF3pria",
    resumo: "Transforma insumo em produto e vende",
    exemplos: "salgados, bolos, marmita, costura, artesanato, marcenaria",
    contasExtras: [
      { id: "estoque_insumos", codigo: "1121", nome: "Estoque de insumos", tipo: "ativo", subtipo: "circulante", ordem: 21 },
      { id: "estoque_produtos", codigo: "1122", nome: "Produto pronto", tipo: "ativo", subtipo: "circulante", ordem: 22 },
      { id: "venda_producao", codigo: "4102", nome: "Venda de produ\xE7\xE3o pr\xF3pria", tipo: "receita", ordem: 2 },
      { id: "insumos", codigo: "5122", nome: "Insumos e mat\xE9ria-prima", tipo: "despesa", ordem: 22 },
      { id: "embalagem", codigo: "5123", nome: "Embalagem", tipo: "despesa", ordem: 23 },
      { id: "perda_producao", codigo: "5124", nome: "Perda e quebra", tipo: "despesa", ordem: 24 }
    ],
    camposAbertura: [
      {
        chave: "estoque_insumos",
        contaId: "estoque_insumos",
        tipo: "D",
        rotulo: "Insumo/mat\xE9ria-prima parada (valor aproximado)",
        porque: "Farinha, tecido, madeira \u2014 o que j\xE1 foi comprado e ainda n\xE3o virou produto."
      },
      {
        chave: "estoque_produtos",
        contaId: "estoque_produtos",
        tipo: "D",
        rotulo: "Produto pronto ainda n\xE3o vendido",
        porque: "J\xE1 custou insumo e tempo, mas ainda n\xE3o virou dinheiro."
      }
    ],
    achados: ["taxa_engolindo_margem"]
  },
  {
    id: "servico_mao_obra",
    nome: "Servi\xE7o com m\xE3o de obra",
    resumo: "Vende o pr\xF3prio trabalho, com ou sem material",
    exemplos: "eletricista, pedreiro, encanador, pintor, mec\xE2nico, consertos, diarista",
    contasExtras: [
      { id: "prestacao_servicos", codigo: "4103", nome: "Presta\xE7\xE3o de servi\xE7os", tipo: "receita", ordem: 3 },
      { id: "venda_material_aplicado", codigo: "4104", nome: "Material cobrado do cliente", tipo: "receita", ordem: 4 },
      { id: "material_aplicado", codigo: "5130", nome: "Material aplicado em servi\xE7o", tipo: "despesa", ordem: 30 },
      { id: "ferramentas", codigo: "5131", nome: "Ferramentas e manuten\xE7\xE3o", tipo: "despesa", ordem: 31 },
      { id: "deslocamento", codigo: "5132", nome: "Deslocamento", tipo: "despesa", ordem: 32 },
      { id: "ajudante", codigo: "5133", nome: "Ajudante / di\xE1ria de terceiro", tipo: "despesa", ordem: 33 }
    ],
    camposAbertura: [
      {
        chave: "material_obra",
        contaId: "estoque_insumos",
        tipo: "D",
        rotulo: "Material j\xE1 comprado para servi\xE7o ainda n\xE3o feito",
        porque: "Material comprado para uma obra que ainda n\xE3o aconteceu \xE9 dinheiro adiantado, n\xE3o despesa do m\xEAs.",
        contaExtra: { id: "estoque_insumos", codigo: "1121", nome: "Material para servi\xE7o", tipo: "ativo", subtipo: "circulante", ordem: 21 }
      }
    ],
    achados: ["sem_receita_no_periodo"]
  },
  {
    id: "servico_recorrente",
    nome: "Servi\xE7o recorrente",
    resumo: "Contrato ou mensalidade que se repete",
    exemplos: "manuten\xE7\xE3o mensal, limpeza, aulas, mensalista, assessoria",
    contasExtras: [
      { id: "mensalidades", codigo: "4105", nome: "Mensalidades", tipo: "receita", ordem: 5 },
      { id: "servicos_avulsos", codigo: "4106", nome: "Servi\xE7os avulsos", tipo: "receita", ordem: 6 }
    ],
    camposAbertura: [],
    achados: []
  },
  {
    id: "digital",
    nome: "Digital / online",
    resumo: "Vende pela internet, produto digital ou servi\xE7o remoto",
    exemplos: "infoproduto, sistema, freelancer digital, social media, e-commerce pr\xF3prio",
    contasExtras: [
      { id: "saldo_plataforma", codigo: "1105", nome: "Saldo em plataforma", tipo: "ativo", subtipo: "circulante", ordem: 5 },
      { id: "vendas_online", codigo: "4107", nome: "Vendas online", tipo: "receita", ordem: 7 },
      { id: "assinaturas", codigo: "4108", nome: "Assinaturas", tipo: "receita", ordem: 8 },
      { id: "taxa_plataforma", codigo: "5140", nome: "Taxa de plataforma", tipo: "despesa", ordem: 40 },
      { id: "anuncios", codigo: "5141", nome: "An\xFAncios e tr\xE1fego pago", tipo: "despesa", ordem: 41 },
      { id: "ferramentas_software", codigo: "5142", nome: "Ferramentas e assinaturas de software", tipo: "despesa", ordem: 42 }
    ],
    camposAbertura: [
      {
        chave: "saldo_plataforma",
        contaId: "saldo_plataforma",
        tipo: "D",
        rotulo: "Dinheiro parado em plataforma (Hotmart, Mercado Pago, PagSeguro\u2026)",
        porque: "J\xE1 \xE9 dinheiro dele, mas ainda n\xE3o caiu na conta. Some do controle de quem s\xF3 olha o extrato do banco."
      }
    ],
    achados: ["taxa_engolindo_margem"]
  },
  {
    id: "beneficiamento",
    nome: "Beneficiamento / terceiriza\xE7\xE3o",
    resumo: "Manda material para terceiro trabalhar e depois vende",
    exemplos: "manda tecido para costureira, pe\xE7a para pintura, madeira para corte, facc\xE7\xE3o",
    contasExtras: [
      { id: "estoque", codigo: "1120", nome: "Estoque de mercadorias", tipo: "ativo", subtipo: "circulante", ordem: 20 },
      /* A conta que este arquétipo existe para ter: o que saiu da mão
         dele mas ainda é dele. Sem ela, o valor some do balanço no
         período em que está com o terceiro — e é justamente o período
         de maior risco. */
      { id: "mercadoria_com_terceiros", codigo: "1123", nome: "Mercadoria com terceiros", tipo: "ativo", subtipo: "circulante", ordem: 23 },
      { id: "venda_mercadorias", codigo: "4101", nome: "Venda de mercadorias", tipo: "receita", ordem: 1 },
      /* Beneficiamento VENDE mercadoria — então precisa de CMV como a
         revenda, senão o custo do que saiu não tem onde ser reconhecido
         e a margem sai inflada. Achado conferindo o plano gerado. */
      { id: "cmv", codigo: "5120", nome: "Custo da mercadoria vendida", tipo: "despesa", ordem: 20 },
      { id: "servico_terceiros", codigo: "5150", nome: "Servi\xE7o de terceiros", tipo: "despesa", ordem: 50 },
      { id: "perda_beneficiamento", codigo: "5151", nome: "Perda no beneficiamento", tipo: "despesa", ordem: 51 }
    ],
    camposAbertura: [
      {
        chave: "mercadoria_com_terceiros",
        contaId: "mercadoria_com_terceiros",
        tipo: "D",
        rotulo: "Mercadoria que est\xE1 na m\xE3o de terceiro agora",
        porque: "\xC9 seu, mas n\xE3o est\xE1 com voc\xEA. Se sumir ou estragar, a perda \xE9 sua \u2014 e quase ningu\xE9m controla quanto tem parado l\xE1 fora."
      },
      {
        chave: "estoque",
        contaId: "estoque",
        tipo: "D",
        rotulo: "Mercadoria pronta parada com voc\xEA",
        porque: "O que j\xE1 voltou do terceiro e ainda n\xE3o foi vendido."
      }
    ],
    achados: ["mercadoria_parada_com_terceiro"]
  },
  {
    id: "intermediacao",
    nome: "Intermedia\xE7\xE3o / comiss\xE3o",
    resumo: "Vende o produto de outro e fica com a comiss\xE3o",
    exemplos: "representante, revendedor comissionado, corretor, dropshipping",
    contasExtras: [
      /* O par de contas que impede o erro mais caro deste arquétipo:
         o dinheiro que ele recebe e vai repassar NÃO é receita dele —
         é obrigação com terceiro. Lançar o bruto como receita infla o
         faturamento e pode disparar alarme falso do teto do MEI. */
      { id: "valores_a_repassar", codigo: "1106", nome: "Valores recebidos a repassar", tipo: "ativo", subtipo: "circulante", ordem: 6 },
      { id: "repasses_a_pagar", codigo: "2105", nome: "Repasses a pagar", tipo: "passivo", subtipo: "circulante", ordem: 5 },
      { id: "comissoes", codigo: "4109", nome: "Comiss\xF5es recebidas", tipo: "receita", ordem: 9 }
    ],
    camposAbertura: [
      {
        chave: "repasses_a_pagar",
        contaId: "repasses_a_pagar",
        tipo: "C",
        rotulo: "Dinheiro que voc\xEA j\xE1 recebeu e ainda vai repassar",
        porque: "Esse dinheiro est\xE1 na sua conta mas n\xE3o \xE9 seu. Tratar como receita infla o faturamento e atrapalha o controle do limite do MEI."
      }
    ],
    achados: []
  },
  {
    id: "locacao",
    nome: "Loca\xE7\xE3o",
    resumo: "Aluga equipamento, espa\xE7o ou ve\xEDculo",
    exemplos: "aluguel de ferramenta, som, brinquedo, espa\xE7o, ve\xEDculo",
    contasExtras: [
      { id: "equipamentos_locacao", codigo: "1153", nome: "Equipamentos para loca\xE7\xE3o", tipo: "ativo", subtipo: "nao_circulante", ordem: 53 },
      { id: "alugueis_recebidos", codigo: "4110", nome: "Alugu\xE9is recebidos", tipo: "receita", ordem: 10 },
      { id: "manutencao_equipamentos", codigo: "5160", nome: "Manuten\xE7\xE3o de equipamentos", tipo: "despesa", ordem: 60 },
      { id: "seguro", codigo: "5161", nome: "Seguro", tipo: "despesa", ordem: 61 }
    ],
    camposAbertura: [
      {
        chave: "equipamentos_locacao",
        contaId: "equipamentos_locacao",
        tipo: "D",
        rotulo: "Equipamentos que voc\xEA aluga (valor aproximado de hoje)",
        porque: "\xC9 o ativo que gera a receita do neg\xF3cio. Sem ele registrado, n\xE3o d\xE1 para saber se o aluguel paga o equipamento."
      }
    ],
    achados: []
  }
];
var IDS_ARQUETIPOS = ARQUETIPOS.map((a) => a.id);
function acharArquetipo(id) {
  return ARQUETIPOS.find((a) => a.id === id) || null;
}
function planoDeFabrica(arquetipoId) {
  const arq = acharArquetipo(arquetipoId);
  const contas = [...planoBase()];
  const jaTem = new Set(contas.map((c) => c.id));
  for (const extra of arq?.contasExtras || []) {
    if (jaTem.has(extra.id)) continue;
    contas.push(extra);
    jaTem.add(extra.id);
  }
  for (const campo of arq?.camposAbertura || []) {
    if (campo.contaExtra && !jaTem.has(campo.contaExtra.id)) {
      contas.push(campo.contaExtra);
      jaTem.add(campo.contaExtra.id);
    }
  }
  return contas.map((c) => ({ ...c, subtipo: c.subtipo ?? null, ativa: true }));
}
function camposAberturaDe(arquetipoId) {
  return acharArquetipo(arquetipoId)?.camposAbertura || [];
}
function achadosDe(arquetipoId) {
  return acharArquetipo(arquetipoId)?.achados || [];
}

// src/telas/Negocios.jsx
var TIPO_LABEL = { mei: "MEI", informal: "Informal" };
var fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
function ResumoDoMes({ negocioId }) {
  const [resumo, setResumo] = useState3(null);
  useEffect3(() => {
    let vivo = true;
    resumoDoMesAtual(negocioId).then((r) => {
      if (vivo) setResumo(r);
    });
    return () => {
      vivo = false;
    };
  }, [negocioId]);
  if (!resumo) return /* @__PURE__ */ React4.createElement("span", { style: { color: "var(--muted)" } }, "\u2026");
  if (!resumo.temMovimento) return /* @__PURE__ */ React4.createElement("span", { style: { color: "var(--muted)" } }, "Nenhum lan\xE7amento neste m\xEAs");
  return /* @__PURE__ */ React4.createElement("span", { style: { color: resumo.resultado >= 0 ? "var(--credit)" : "var(--debit)" } }, resumo.resultado >= 0 ? "sobrou" : "faltou", " ", fmt(Math.abs(resumo.resultado)), " este m\xEAs");
}
function CardNegocio({ negocio, recemCriado, onAbrir }) {
  const onboarded = !!negocio.configuracao?.onboarded;
  return /* @__PURE__ */ React4.createElement(
    Card,
    {
      elevavel: true,
      onClick: () => onAbrir(negocio),
      className: recemCriado ? "animate-[surgir_.4s_ease-out]" : ""
    },
    /* @__PURE__ */ React4.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React4.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React4.createElement("div", { className: "font-medium truncate", style: { color: "var(--ink)", fontFamily: "var(--font-display)" } }, negocio.apelido || negocio.nome), negocio.apelido && /* @__PURE__ */ React4.createElement("div", { className: "text-xs truncate", style: { color: "var(--muted)" } }, negocio.nome)), /* @__PURE__ */ React4.createElement(
      "span",
      {
        className: "text-[10px] uppercase tracking-wide px-2 py-1 rounded-full shrink-0",
        style: { background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" }
      },
      TIPO_LABEL[negocio.tipo] || negocio.tipo
    )),
    /* @__PURE__ */ React4.createElement("div", { className: "mt-3 text-xs" }, negocio.situacao !== "ativo" ? /* @__PURE__ */ React4.createElement("span", { style: { color: "var(--muted)" } }, "Encerrado") : !onboarded ? /* @__PURE__ */ React4.createElement("span", { style: { color: "var(--muted)" } }, "Roteiro do Cliente Novo pendente") : /* @__PURE__ */ React4.createElement(ResumoDoMes, { negocioId: negocio.id }))
  );
}
function FormularioNovoNegocio({ onCriado, onFechar }) {
  const [nome, setNome] = useState3("");
  const [apelido, setApelido] = useState3("");
  const [tipo, setTipo] = useState3("mei");
  const [arquetipo, setArquetipo] = useState3("");
  const [salvando, setSalvando] = useState3(false);
  const [erro, setErro] = useState3("");
  const escolhido = acharArquetipo(arquetipo);
  const salvar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("D\xE1 um nome pro neg\xF3cio \u2014 pode ser s\xF3 o nome do cliente.");
      return;
    }
    if (!arquetipo) {
      setErro("Escolhe o que o neg\xF3cio faz \u2014 \xE9 isso que monta o plano de contas certo pra ele.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const { data, error } = await supabase.rpc("criar_negocio", {
        p_nome: nome.trim(),
        p_apelido: apelido.trim() || null,
        p_tipo: tipo
      });
      if (error) throw error;
      const { error: erroArq } = await supabase.from("negocios").update({ arquetipo }).eq("id", data);
      if (erroArq) throw erroArq;
      onCriado(data);
    } catch (err) {
      setErro(err?.message || "N\xE3o consegui criar \u2014 tenta de novo.");
    } finally {
      setSalvando(false);
    }
  };
  return /* @__PURE__ */ React4.createElement(Card, { className: "mb-6" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React4.createElement("div", { className: "font-medium", style: { color: "var(--ink)", fontFamily: "var(--font-display)" } }, "Novo neg\xF3cio"), /* @__PURE__ */ React4.createElement("button", { onClick: onFechar, className: "transition-opacity hover:opacity-70", "aria-label": "Fechar", style: { color: "var(--muted)" } }, /* @__PURE__ */ React4.createElement(X, { size: 16 }))), /* @__PURE__ */ React4.createElement("form", { onSubmit: salvar, className: "space-y-3" }, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement(Label, null, "Nome do neg\xF3cio ou do cliente"), /* @__PURE__ */ React4.createElement(Input, { autoFocus: true, value: nome, onChange: (e) => setNome(e.target.value), placeholder: "ex.: Salgados da L\xE9ia" })), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement(Label, null, "Apelido (opcional \u2014 como voc\xEA quer ver na lista)"), /* @__PURE__ */ React4.createElement(Input, { value: apelido, onChange: (e) => setApelido(e.target.value), placeholder: "ex.: L\xE9ia" })), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement(Label, null, "Tipo"), /* @__PURE__ */ React4.createElement(Select, { value: tipo, onChange: setTipo, options: [
    { value: "mei", label: "MEI" },
    { value: "informal", label: "Informal" }
  ] })), /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement(Label, null, "O que o neg\xF3cio faz para ganhar dinheiro?"), /* @__PURE__ */ React4.createElement(
    Select,
    {
      value: arquetipo,
      onChange: setArquetipo,
      placeholder: "escolha",
      options: ARQUETIPOS.map((a) => ({ value: a.id, label: `${a.nome} \u2014 ${a.resumo}` }))
    }
  ), escolhido && /* @__PURE__ */ React4.createElement("div", { className: "text-[11px] mt-1.5", style: { color: "var(--muted)" } }, "ex.: ", escolhido.exemplos), /* @__PURE__ */ React4.createElement("div", { className: "text-[11px] mt-1.5", style: { color: "var(--muted)" } }, "Isto decide o plano de contas e as perguntas da entrevista. D\xE1 pra trocar depois, na aba Neg\xF3cio.")), erro && /* @__PURE__ */ React4.createElement("div", { className: "text-xs rounded-md px-3 py-2", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React4.createElement(Button, { type: "submit", disabled: salvando }, salvando ? "Criando\u2026" : "Criar neg\xF3cio")));
}
function Negocios({ onAbrirNegocio, onAbrirPainel }) {
  const [negocios, setNegocios] = useState3(null);
  const [mostrarForm, setMostrarForm] = useState3(false);
  const [recemCriadoId, setRecemCriadoId] = useState3(null);
  const [erro, setErro] = useState3("");
  const [confirmacao, setConfirmacao] = useState3(false);
  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from("negocios").select("id, nome, apelido, tipo, situacao, created_at, configuracao, arquetipo, dinheiro_misturado, retrato_de_entrada").order("created_at", { ascending: false });
    if (error) {
      setErro(error.message);
      return;
    }
    setNegocios(data || []);
  }, []);
  useEffect3(() => {
    carregar();
  }, [carregar]);
  const aoCriar = async (novoId) => {
    setMostrarForm(false);
    await carregar();
    setRecemCriadoId(novoId);
    setConfirmacao(true);
    setTimeout(() => setConfirmacao(false), 2200);
    setTimeout(() => setRecemCriadoId(null), 900);
  };
  return /* @__PURE__ */ React4.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React4.createElement("div", { className: "max-w-3xl mx-auto px-5 py-8" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("div", { className: "text-xl font-bold", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, "Seus neg\xF3cios"), /* @__PURE__ */ React4.createElement("div", { className: "text-xs mt-1", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "a prateleira")), /* @__PURE__ */ React4.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React4.createElement(Button, { variant: "ghost", onClick: onAbrirPainel }, /* @__PURE__ */ React4.createElement(ClipboardList, { size: 15 }), " Painel do M\xEAs"), !mostrarForm && /* @__PURE__ */ React4.createElement(Button, { onClick: () => setMostrarForm(true) }, /* @__PURE__ */ React4.createElement(Plus, { size: 15 }), " Novo neg\xF3cio"), /* @__PURE__ */ React4.createElement(
    "button",
    {
      onClick: () => supabase.auth.signOut(),
      className: "text-xs inline-flex items-center gap-1.5 px-2 py-2 transition-opacity hover:opacity-70",
      style: { color: "var(--muted)" },
      "aria-label": "Sair",
      title: "Sair da conta"
    },
    /* @__PURE__ */ React4.createElement(LogOut, { size: 15 })
  ))), /* @__PURE__ */ React4.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React4.createElement(Confirmacao, { texto: "Neg\xF3cio criado.", ativa: confirmacao })), mostrarForm && /* @__PURE__ */ React4.createElement(FormularioNovoNegocio, { onCriado: aoCriar, onFechar: () => setMostrarForm(false) }), erro && /* @__PURE__ */ React4.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), negocios === null && /* @__PURE__ */ React4.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Carregando\u2026"), negocios !== null && negocios.length === 0 && !mostrarForm && /* @__PURE__ */ React4.createElement(Card, { className: "text-center py-12" }, /* @__PURE__ */ React4.createElement(Building2, { size: 28, className: "mx-auto mb-3", style: { color: "var(--muted)" } }), /* @__PURE__ */ React4.createElement("div", { className: "text-sm", style: { color: "var(--ink)" } }, "Nenhum neg\xF3cio cadastrado ainda."), /* @__PURE__ */ React4.createElement("div", { className: "text-xs mt-1 mb-4", style: { color: "var(--muted)" } }, "O primeiro passo \xE9 criar o neg\xF3cio do seu primeiro cliente."), /* @__PURE__ */ React4.createElement(Button, { onClick: () => setMostrarForm(true) }, /* @__PURE__ */ React4.createElement(Plus, { size: 15 }), " Criar o primeiro")), negocios !== null && negocios.length > 0 && /* @__PURE__ */ React4.createElement("div", { className: "grid gap-3 sm:grid-cols-2" }, negocios.map((n) => /* @__PURE__ */ React4.createElement(CardNegocio, { key: n.id, negocio: n, recemCriado: n.id === recemCriadoId, onAbrir: onAbrirNegocio })))));
}

// src/telas/ClienteNovo.jsx
import React5, { useState as useState4, useEffect as useEffect4 } from "react";
import { Plus as Plus2, Trash2, ArrowLeft, ArrowRight, HelpCircle, Send } from "lucide-react";

// src/dominio/dividas.mjs
var CLASSIFICACOES_DIVIDA = [
  {
    id: "negocio",
    rotulo: "\xC9 do neg\xF3cio",
    ajuda: "Fornecedor, empr\xE9stimo no CNPJ, cart\xE3o da empresa.",
    entraNoLivro: true
  },
  {
    id: "pessoal_no_negocio",
    rotulo: "\xC9 pessoal, mas o dinheiro entrou no neg\xF3cio",
    ajuda: "Empr\xE9stimo no seu nome para comprar equipamento, estoque, ve\xEDculo do trabalho. Quem paga \xE9 o caixa do neg\xF3cio, ent\xE3o conta.",
    entraNoLivro: true
  },
  {
    id: "pessoal",
    rotulo: "\xC9 s\xF3 pessoal",
    ajuda: "Financiamento da casa, cart\xE3o usado em compra pessoal. N\xE3o entra no livro do neg\xF3cio \u2014 mas eu anoto, porque muda quanto voc\xEA precisa tirar por m\xEAs.",
    entraNoLivro: false
  }
];
function contaParaDivida({ classificacao, ehFornecedor }) {
  if (classificacao === "pessoal") return null;
  if (classificacao === "negocio" && ehFornecedor) return "fornecedores";
  return "emprestimos";
}
function separarDividas(dividas) {
  const itens = [];
  const notas = [];
  let totalPessoal = 0;
  for (const d of dividas || []) {
    const valor = Number(d.valor);
    if (!(valor > 0)) continue;
    const conta = contaParaDivida({ classificacao: d.classificacao, ehFornecedor: d.ehFornecedor });
    if (!conta) {
      totalPessoal += valor;
      notas.push({ descricao: d.descricao || "D\xEDvida pessoal", valor, vencimento: d.vencimento || null });
      continue;
    }
    itens.push({
      contaId: conta,
      tipo: "C",
      valor,
      /* A origem fica na descrição da linha: seis meses depois, olhando
         o Razão, ele precisa entender por que uma dívida pessoal está no
         livro do negócio. */
      descricao: d.classificacao === "pessoal_no_negocio" ? `${d.descricao || "Empr\xE9stimo"} (pessoal, aplicado no neg\xF3cio)` : d.descricao || null,
      vencimento: d.vencimento || null
    });
  }
  return { itens, notas, totalPessoal };
}

// src/dominio/roteiro.mjs
function perguntasPara(perguntas, { tipo, arquetipo, apenasEssenciais = false, blocos = null } = {}) {
  return (perguntas || []).filter((p) => p.ativo !== false).filter((p) => !blocos || blocos.includes(p.bloco)).filter((p) => !apenasEssenciais || p.essencial).filter((p) => !p.tipos?.length || p.tipos.includes(tipo)).filter((p) => !p.arquetipos?.length || arquetipo && p.arquetipos.includes(arquetipo)).sort((a, b) => a.bloco - b.bloco || a.ordem - b.ordem);
}
function pendentesDeAprofundamento(perguntas, respostasPorPerguntaId, opcoes) {
  return perguntasPara(perguntas, { ...opcoes, apenasEssenciais: false }).filter((p) => !p.essencial).filter((p) => {
    const r = respostasPorPerguntaId?.[p.id];
    return r === void 0 || r === null || String(r).trim() === "";
  });
}
function respostaPorDestino(perguntas, respostasPorPerguntaId, destino) {
  const pergunta = (perguntas || []).find((p) => p.destino === destino);
  if (!pergunta) return null;
  const resposta = respostasPorPerguntaId?.[pergunta.id];
  return resposta != null && String(resposta).trim() !== "" ? resposta : null;
}
function respostasParaNegocio(perguntas, respostasPorPerguntaId) {
  const patch = {};
  for (const p of perguntas || []) {
    if (!p.destino?.startsWith("negocios.")) continue;
    const valor = respostasPorPerguntaId?.[p.id];
    if (valor === void 0 || valor === "") continue;
    const campo = p.destino.slice("negocios.".length);
    patch[campo] = p.tipo_resposta === "sim_nao" ? valor === "sim" : valor;
  }
  return patch;
}

// src/dominio/valorDoTempo.mjs
var SEMANAS_POR_MES = 4.345;
function horaDoDono({ retiradaNoMes, horasPorSemana, salarioMinimoHora = null }) {
  const horas = Number(horasPorSemana);
  const retirada = Number(retiradaNoMes);
  if (!(horas > 0) || !(retirada > 0)) return null;
  const horasNoMes = Math.round(horas * SEMANAS_POR_MES * 10) / 10;
  const porHora = Math.round(retirada / horasNoMes * 100) / 100;
  return {
    porHora,
    horasNoMes,
    salarioMinimoHora,
    abaixoDoMinimo: salarioMinimoHora ? porHora < salarioMinimoHora : null,
    comparacao: salarioMinimoHora ? Math.round(porHora / salarioMinimoHora * 100) / 100 : null
  };
}

// src/dominio/linhaDeBase.mjs
var num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
function montarRetratoDeEntrada({ negocio, declarado = {}, contas = [], linhasAbertura = [], hoje }) {
  const saldoDe = (id) => {
    const conta = contas.find((c) => c.id === id);
    return conta ? saldoDeConta(conta, linhasAbertura) : 0;
  };
  const caixaEBanco = CONTAS_DINHEIRO.reduce((s, id) => s + saldoDe(id), 0);
  const aReceber = saldoDe("clientes");
  const dividas = Math.abs(saldoDe("fornecedores")) + Math.abs(saldoDe("emprestimos"));
  const patrimonio = Math.round(saldoDe("capital_titular") * 100) / 100;
  const faturamentoDeclarado = num(declarado.faturamentoMensal);
  const retiradaDeclarada = num(declarado.retiradaMensal);
  const horas = num(declarado.horasPorSemana);
  return {
    capturadoEm: hoje,
    tipo: negocio?.tipo ?? null,
    arquetipo: negocio?.arquetipo ?? null,
    /* O que ele ACREDITAVA — a metade que some se não for congelada */
    declarado: {
      faturamentoMensal: faturamentoDeclarado,
      retiradaMensal: retiradaDeclarada,
      horasPorSemana: horas,
      achaQueGanhaDinheiro: declarado.achaQueGanhaDinheiro || null,
      oQueIncomoda: declarado.oQueIncomoda || null,
      meta: declarado.meta || null,
      /* A hora que ele acha que vale, pelos números dele mesmos */
      horaDeclarada: horaDoDono({ retiradaNoMes: retiradaDeclarada, horasPorSemana: horas })?.porHora ?? null
    },
    /* O que o livro MOSTROU no dia 1 */
    medido: {
      caixaEBanco: Math.round(caixaEBanco * 100) / 100,
      aReceber: Math.round(aReceber * 100) / 100,
      dividasDoNegocio: Math.round(dividas * 100) / 100,
      patrimonioLiquido: patrimonio,
      dinheiroMisturado: !!negocio?.dinheiro_misturado,
      temContaSeparada: declarado.temContaSeparada === "sim"
    }
  };
}
function compararComAEntrada(entrada, agora, toleranciaPercentual = 15) {
  if (!entrada || !agora) return [];
  const achados = [];
  const relevante = (antes, depois) => {
    if (antes === null || antes === void 0 || depois === null || depois === void 0) return false;
    if (antes === 0) return depois !== 0;
    return Math.abs((depois - antes) / antes) * 100 >= toleranciaPercentual;
  };
  const retiradaDita = entrada.declarado?.retiradaMensal;
  if (relevante(retiradaDita, agora.retiradaMensal)) {
    const diferenca = Math.round((agora.retiradaMensal - retiradaDita) * 100) / 100;
    achados.push({
      tipo: "retirada_vs_declarado",
      forca: diferenca > 0 ? "alta" : "media",
      antes: retiradaDita,
      depois: agora.retiradaMensal,
      diferenca,
      frase: diferenca > 0 ? `Quando come\xE7amos, voc\xEA me disse que tirava ${fmt2(retiradaDita)} por m\xEAs. O que os n\xFAmeros mostram \xE9 ${fmt2(agora.retiradaMensal)} \u2014 ${fmt2(diferenca)} a mais do que voc\xEA imaginava.` : `Voc\xEA achava que tirava ${fmt2(retiradaDita)} por m\xEAs; na pr\xE1tica est\xE1 tirando ${fmt2(agora.retiradaMensal)}.`
    });
  }
  const faturamentoDito = entrada.declarado?.faturamentoMensal;
  if (relevante(faturamentoDito, agora.faturamentoMensal)) {
    achados.push({
      tipo: "faturamento_vs_declarado",
      forca: "media",
      antes: faturamentoDito,
      depois: agora.faturamentoMensal,
      diferenca: Math.round((agora.faturamentoMensal - faturamentoDito) * 100) / 100,
      frase: `Voc\xEA estimava faturar ${fmt2(faturamentoDito)} por m\xEAs; o medido \xE9 ${fmt2(agora.faturamentoMensal)}.`
    });
  }
  const patrimonioAntes = entrada.medido?.patrimonioLiquido;
  if (relevante(patrimonioAntes, agora.patrimonioLiquido)) {
    const d = Math.round((agora.patrimonioLiquido - patrimonioAntes) * 100) / 100;
    achados.push({
      tipo: "patrimonio_desde_a_entrada",
      forca: "alta",
      antes: patrimonioAntes,
      depois: agora.patrimonioLiquido,
      diferenca: d,
      frase: d > 0 ? `Desde que come\xE7amos, o que \xE9 seu no neg\xF3cio subiu ${fmt2(d)} \u2014 de ${fmt2(patrimonioAntes)} para ${fmt2(agora.patrimonioLiquido)}.` : `Desde que come\xE7amos, o que \xE9 seu no neg\xF3cio caiu ${fmt2(Math.abs(d))} \u2014 de ${fmt2(patrimonioAntes)} para ${fmt2(agora.patrimonioLiquido)}.`
    });
  }
  const dividaAntes = entrada.medido?.dividasDoNegocio;
  if (relevante(dividaAntes, agora.dividasDoNegocio)) {
    const d = Math.round((agora.dividasDoNegocio - dividaAntes) * 100) / 100;
    achados.push({
      tipo: "divida_desde_a_entrada",
      forca: d > 0 ? "alta" : "media",
      antes: dividaAntes,
      depois: agora.dividasDoNegocio,
      diferenca: d,
      frase: d < 0 ? `A d\xEDvida do neg\xF3cio caiu ${fmt2(Math.abs(d))} desde que come\xE7amos.` : `A d\xEDvida do neg\xF3cio subiu ${fmt2(d)} desde que come\xE7amos.`
    });
  }
  return achados;
}
function fmt2(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

// src/dominio/aberturaBalanco.mjs
var uidPadrao = () => Math.random().toString(36).slice(2, 10);
function diaAnterior(isoDate) {
  const d = /* @__PURE__ */ new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
function montarLancamentoAbertura({ inicioDoServico, itens, gerarId = uidPadrao }) {
  if (!inicioDoServico) throw new Error("inicioDoServico \xE9 obrigat\xF3rio \u2014 sem ele n\xE3o d\xE1 para datar a abertura");
  if (!itens || itens.length === 0) throw new Error("balan\xE7o de abertura sem nenhum item \u2014 o cliente tem PELO MENOS caixa ou banco");
  for (const item of itens) {
    if (!["D", "C"].includes(item.tipo)) throw new Error(`item com tipo inv\xE1lido: ${JSON.stringify(item)}`);
    if (!(item.valor > 0)) throw new Error(`item com valor inv\xE1lido (precisa ser > 0): ${JSON.stringify(item)}`);
  }
  const somaDebitos = itens.filter((i) => i.tipo === "D").reduce((s, i) => s + i.valor, 0);
  const somaCreditos = itens.filter((i) => i.tipo === "C").reduce((s, i) => s + i.valor, 0);
  const capitalCalculado = somaDebitos - somaCreditos;
  const idLancamento = gerarId();
  const data = diaAnterior(inicioDoServico);
  const linhas = itens.map((item) => ({
    id: gerarId(),
    lancamentoId: idLancamento,
    contaId: item.contaId,
    tipo: item.tipo,
    valor: item.valor,
    descricao: item.descricao ?? null,
    vencimento: item.vencimento ?? null
  }));
  const valorCapital = Math.round(Math.abs(capitalCalculado) * 100) / 100;
  if (valorCapital > 0) {
    linhas.push({
      id: gerarId(),
      lancamentoId: idLancamento,
      contaId: "capital_titular",
      /* patrimônio positivo (tem mais do que deve) = crédito, fechando os débitos;
         patrimônio negativo (deve mais do que tem) = débito, fechando os créditos */
      tipo: capitalCalculado >= 0 ? "C" : "D",
      valor: valorCapital,
      descricao: "Capital de abertura \u2014 calculado, n\xE3o informado pelo cliente",
      vencimento: null
    });
  }
  const lancamento = {
    id: idLancamento,
    data,
    dataCompetencia: data,
    descricao: "Balan\xE7o de abertura",
    origem: "abertura",
    documento: null
  };
  return { lancamento, linhas, capitalCalculado };
}

// src/telas/ClienteNovo.jsx
var NOMES_BLOCO = {
  1: "Quem \xE9",
  2: "Como o dinheiro anda",
  3: "A foto de hoje",
  4: "O ritmo do neg\xF3cio",
  5: "O que ele quer",
  6: "O combinado"
};
var hojeISO = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var fmtMoeda = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var uid = () => Math.random().toString(36).slice(2, 10);
function PorQueImporta({ texto }) {
  const [aberto, setAberto] = useState4(false);
  if (!texto) return null;
  return /* @__PURE__ */ React5.createElement("div", { className: "mt-1.5" }, /* @__PURE__ */ React5.createElement(
    "button",
    {
      type: "button",
      onClick: () => setAberto((a) => !a),
      className: "text-[10px] inline-flex items-center gap-1 transition-opacity hover:opacity-70",
      style: { color: "var(--muted)" }
    },
    /* @__PURE__ */ React5.createElement(HelpCircle, { size: 11 }),
    " por que isso importa?"
  ), aberto && /* @__PURE__ */ React5.createElement("div", { className: "text-xs mt-1.5 rounded-md px-3 py-2 animate-[surgir_.2s_ease-out]", style: { background: "var(--accent-soft)", color: "var(--ink)" } }, texto));
}
function CampoRoteiro({ pergunta, valor, onChange }) {
  return /* @__PURE__ */ React5.createElement("div", { className: "mb-5" }, /* @__PURE__ */ React5.createElement(Label, null, pergunta.pergunta), pergunta.tipo_resposta === "sim_nao" ? /* @__PURE__ */ React5.createElement(Select, { value: valor ?? "", onChange, placeholder: "Escolha", options: [{ value: "sim", label: "Sim" }, { value: "nao", label: "N\xE3o" }] }) : pergunta.tipo_resposta === "data" ? /* @__PURE__ */ React5.createElement(Input, { type: "date", value: valor ?? "", onChange: (e) => onChange(e.target.value) }) : pergunta.tipo_resposta === "moeda" ? /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "0,00", value: valor ?? "", onChange: (e) => onChange(e.target.value) }) : pergunta.tipo_resposta === "texto_longo" ? /* @__PURE__ */ React5.createElement(
    "textarea",
    {
      rows: 3,
      value: valor ?? "",
      onChange: (e) => onChange(e.target.value),
      className: "w-full rounded-md border px-3 py-2 text-sm transition-colors duration-150",
      style: { borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }
    }
  ) : /* @__PURE__ */ React5.createElement(Input, { value: valor ?? "", onChange: (e) => onChange(e.target.value) }), /* @__PURE__ */ React5.createElement(PorQueImporta, { texto: pergunta.porque_importa }));
}
function ListaItens({ titulo, porque, itens, onChange, comVencimento }) {
  const add = () => onChange([...itens, { descricao: "", valor: "", vencimento: "" }]);
  const remover = (i) => onChange(itens.filter((_, idx) => idx !== i));
  const editar = (i, campo, v) => onChange(itens.map((it, idx) => idx === i ? { ...it, [campo]: v } : it));
  return /* @__PURE__ */ React5.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React5.createElement(Label, null, titulo), itens.map((item, i) => /* @__PURE__ */ React5.createElement("div", { key: i, className: "flex gap-2 mb-2 items-center animate-[surgir_.2s_ease-out]" }, /* @__PURE__ */ React5.createElement(Input, { placeholder: "descri\xE7\xE3o", value: item.descricao, onChange: (e) => editar(i, "descricao", e.target.value), className: "flex-[2]" }), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "valor", value: item.valor, onChange: (e) => editar(i, "valor", e.target.value), className: "flex-1" }), comVencimento && /* @__PURE__ */ React5.createElement(Input, { type: "date", value: item.vencimento, onChange: (e) => editar(i, "vencimento", e.target.value), className: "flex-1" }), /* @__PURE__ */ React5.createElement("button", { type: "button", onClick: () => remover(i), className: "transition-opacity hover:opacity-70 shrink-0", style: { color: "var(--debit)" }, "aria-label": "Remover" }, /* @__PURE__ */ React5.createElement(Trash2, { size: 15 })))), /* @__PURE__ */ React5.createElement("button", { type: "button", onClick: add, className: "text-xs inline-flex items-center gap-1 mt-1 transition-opacity hover:opacity-70", style: { color: "var(--accent)" } }, /* @__PURE__ */ React5.createElement(Plus2, { size: 13 }), " adicionar"), /* @__PURE__ */ React5.createElement(PorQueImporta, { texto: porque }));
}
function MandarParaOCliente({ negocioId, whatsapp }) {
  const [link, setLink] = useState4("");
  const [gerando, setGerando] = useState4(false);
  const [copiado, setCopiado] = useState4(false);
  const [erro, setErro] = useState4("");
  const gerar = async () => {
    setGerando(true);
    setErro("");
    const { data, error } = await supabase.from("formularios").insert({ negocio_id: negocioId, tipo: "onboarding" }).select("token").single();
    setGerando(false);
    if (error) {
      setErro("N\xE3o consegui gerar o link \u2014 tenta de novo.");
      return;
    }
    setLink(`${window.location.origin}${window.location.pathname}?f=${data.token}`);
  };
  const copiar = async () => {
    await navigator.clipboard.writeText(
      `Oi! Pra eu organizar as contas do seu neg\xF3cio, preenche essas perguntas r\xE1pidas quando puder:

${link}

Leva uns 10 minutos e d\xE1 pra parar no meio e voltar depois.`
    );
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  };
  return /* @__PURE__ */ React5.createElement(Card, { className: "mb-6" }, /* @__PURE__ */ React5.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React5.createElement(Send, { size: 15, style: { color: "var(--accent)" } }), /* @__PURE__ */ React5.createElement("span", { className: "font-medium", style: { color: "var(--ink)" } }, "N\xE3o d\xE1 para fazer agora?")), /* @__PURE__ */ React5.createElement("div", { className: "text-xs mb-3", style: { color: "var(--muted)", lineHeight: 1.6 } }, "Manda o link e o cliente responde do celular, no tempo dele. Ele v\xEA uma pergunta por vez, pode parar no meio e voltar. Quando terminar, as respostas aparecem aqui.", /* @__PURE__ */ React5.createElement("br", null), "O balan\xE7o de abertura e o combinado continuam com voc\xEA \u2014 \xE9 onde o seu olho faz diferen\xE7a."), !link ? /* @__PURE__ */ React5.createElement(Button, { small: true, onClick: gerar, disabled: gerando }, gerando ? "Gerando\u2026" : "Gerar link do cliente") : /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement(
    "div",
    {
      className: "text-[11px] rounded-md px-3 py-2 mb-2 break-all",
      style: { background: "var(--paper)", color: "var(--muted)", fontFamily: "var(--font-mono)" }
    },
    link
  ), /* @__PURE__ */ React5.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React5.createElement(Button, { small: true, onClick: copiar }, copiado ? "Copiado!" : "Copiar mensagem pronta"), whatsapp && /* @__PURE__ */ React5.createElement(
    "a",
    {
      href: `https://wa.me/${String(whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(`Oi! Pra eu organizar as contas do seu neg\xF3cio, preenche essas perguntas r\xE1pidas quando puder: ${link}`)}`,
      target: "_blank",
      rel: "noreferrer",
      className: "text-xs underline",
      style: { color: "var(--accent)" }
    },
    "abrir no WhatsApp"
  ), /* @__PURE__ */ React5.createElement("span", { className: "text-[10px]", style: { color: "var(--muted)" } }, "vale 30 dias"))), erro && /* @__PURE__ */ React5.createElement("div", { className: "text-xs mt-2", style: { color: "var(--debit)" } }, erro));
}
function ListaDividas({ itens, onChange }) {
  const add = () => onChange([...itens, { descricao: "", valor: "", vencimento: "", classificacao: "negocio", ehFornecedor: true }]);
  const remover = (i) => onChange(itens.filter((_, idx) => idx !== i));
  const editar = (i, campo, v) => onChange(itens.map((it, idx) => idx === i ? { ...it, [campo]: v } : it));
  const { notas, totalPessoal } = separarDividas(itens);
  return /* @__PURE__ */ React5.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React5.createElement(Label, null, "Quanto voc\xEA deve, para quem, e quando vence"), itens.map((item, i) => {
    const classe = CLASSIFICACOES_DIVIDA.find((c) => c.id === item.classificacao);
    return /* @__PURE__ */ React5.createElement("div", { key: i, className: "mb-3 pb-3", style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React5.createElement("div", { className: "flex gap-2 mb-2 items-center" }, /* @__PURE__ */ React5.createElement(Input, { placeholder: "para quem", value: item.descricao, onChange: (e) => editar(i, "descricao", e.target.value), className: "flex-[2]" }), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "valor", value: item.valor, onChange: (e) => editar(i, "valor", e.target.value), className: "flex-1" }), /* @__PURE__ */ React5.createElement(Input, { type: "date", value: item.vencimento, onChange: (e) => editar(i, "vencimento", e.target.value), className: "flex-1" }), /* @__PURE__ */ React5.createElement("button", { type: "button", onClick: () => remover(i), className: "transition-opacity hover:opacity-70 shrink-0", style: { color: "var(--debit)" }, "aria-label": "Remover" }, /* @__PURE__ */ React5.createElement(Trash2, { size: 15 }))), /* @__PURE__ */ React5.createElement(
      Select,
      {
        value: item.classificacao,
        onChange: (v) => editar(i, "classificacao", v),
        options: CLASSIFICACOES_DIVIDA.map((c) => ({ value: c.id, label: c.rotulo }))
      }
    ), classe && /* @__PURE__ */ React5.createElement("div", { className: "text-[11px] mt-1", style: { color: classe.entraNoLivro ? "var(--muted)" : "var(--accent)" } }, classe.ajuda), item.classificacao === "negocio" && /* @__PURE__ */ React5.createElement("label", { className: "text-[11px] inline-flex items-center gap-1.5 mt-1.5", style: { color: "var(--muted)" } }, /* @__PURE__ */ React5.createElement(
      "input",
      {
        type: "checkbox",
        checked: item.ehFornecedor !== false,
        onChange: (e) => editar(i, "ehFornecedor", e.target.checked)
      }
    ), "\xE9 fornecedor (se n\xE3o, entra como empr\xE9stimo)"));
  }), /* @__PURE__ */ React5.createElement("button", { type: "button", onClick: add, className: "text-xs inline-flex items-center gap-1 mt-1", style: { color: "var(--accent)" } }, /* @__PURE__ */ React5.createElement(Plus2, { size: 13 }), " adicionar d\xEDvida"), notas.length > 0 && /* @__PURE__ */ React5.createElement("div", { className: "text-xs rounded-md px-3 py-2 mt-3", style: { background: "var(--accent-soft)", color: "var(--ink)", lineHeight: 1.6 } }, fmtMoeda(totalPessoal), " em d\xEDvida pessoal fica ", /* @__PURE__ */ React5.createElement("strong", null, "fora"), " do livro do neg\xF3cio \u2014 est\xE1 certo assim. Mas anote: isso muda quanto ele precisa tirar por m\xEAs, e \xE9 conversa da primeira entrega."));
}
function BlocoContasFixas({ itens, onChange, opcoesDespesa }) {
  const add = () => onChange([...itens, { descricao: "", valor: "", contaId: "", deOnde: "banco" }]);
  const remover = (i) => onChange(itens.filter((_, idx) => idx !== i));
  const editar = (i, campo, v) => onChange(itens.map((it, idx) => idx === i ? { ...it, [campo]: v } : it));
  return /* @__PURE__ */ React5.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React5.createElement(Label, null, "Quais contas voc\xEA paga todo m\xEAs (aluguel, internet, mensalidade)"), itens.map((item, i) => /* @__PURE__ */ React5.createElement("div", { key: i, className: "mb-2 pb-2", style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React5.createElement("div", { className: "flex gap-2 mb-2 items-center animate-[surgir_.2s_ease-out]" }, /* @__PURE__ */ React5.createElement(Input, { placeholder: "descri\xE7\xE3o", value: item.descricao, onChange: (e) => editar(i, "descricao", e.target.value), className: "flex-[2]" }), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "valor", value: item.valor, onChange: (e) => editar(i, "valor", e.target.value), className: "flex-1" }), /* @__PURE__ */ React5.createElement("button", { type: "button", onClick: () => remover(i), className: "transition-opacity hover:opacity-70 shrink-0", style: { color: "var(--debit)" }, "aria-label": "Remover" }, /* @__PURE__ */ React5.createElement(Trash2, { size: 15 }))), /* @__PURE__ */ React5.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React5.createElement("div", { className: "flex-[2]" }, /* @__PURE__ */ React5.createElement(Select, { value: item.contaId, onChange: (v) => editar(i, "contaId", v), placeholder: "qual conta", options: opcoesDespesa })), /* @__PURE__ */ React5.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React5.createElement(
    Select,
    {
      value: item.deOnde,
      onChange: (v) => editar(i, "deOnde", v),
      options: [{ value: "banco", label: "sai do banco" }, { value: "caixa", label: "sai do caixa" }]
    }
  ))))), /* @__PURE__ */ React5.createElement("button", { type: "button", onClick: add, className: "text-xs inline-flex items-center gap-1 mt-1 transition-opacity hover:opacity-70", style: { color: "var(--accent)" } }, /* @__PURE__ */ React5.createElement(Plus2, { size: 13 }), " adicionar conta fixa"), /* @__PURE__ */ React5.createElement("div", { className: "text-[11px] mt-1.5", style: { color: "var(--muted)" } }, "Cadastradas aqui, elas j\xE1 aparecem prontas no m\xEAs seguinte \u2014 \xE9 o que faz o segundo m\xEAs do cliente ser r\xE1pido. N\xE3o precisa ser exato nem completo hoje: d\xE1 para ajustar e acrescentar depois, na aba Recorrentes."));
}
function BlocoAbertura({ abertura, setAbertura, perguntas, arquetipo, dinheiroMisturado }) {
  const porBloco3 = (ordem) => perguntas.find((p) => p.bloco === 3 && p.ordem === ordem)?.porque_importa;
  const especificos = camposAberturaDe(arquetipo);
  return /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("div", { className: "text-xs mb-5", style: { color: "var(--muted)", lineHeight: 1.6 } }, "Todo cliente chega no meio da vida \u2014 esta \xE9 a foto do que ele tem e do que deve hoje. Valor aproximado est\xE1 de bom tamanho; tudo \xE9 corrig\xEDvel depois, com rastro."), dinheiroMisturado && /* @__PURE__ */ React5.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-5", style: { background: "var(--accent-soft)", color: "var(--ink)", lineHeight: 1.6 } }, /* @__PURE__ */ React5.createElement("strong", null, "Ele usa o mesmo dinheiro para tudo."), ' Informe o total mesmo \u2014 o sistema trata como capital do neg\xF3cio, e a partir da\xED cada gasto pessoal aparece como retirada. N\xE3o pe\xE7a para ele adivinhar quanto \xE9 "do neg\xF3cio": esse n\xFAmero seria inven\xE7\xE3o, e o jeito certo \xE9 justamente o que revela, no fim do m\xEAs, quanto ele tirou de verdade.'), /* @__PURE__ */ React5.createElement("div", { className: "grid grid-cols-2 gap-3 mb-6" }, /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement(Label, null, "Dinheiro em esp\xE9cie"), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "0,00", value: abertura.caixa, onChange: (e) => setAbertura({ ...abertura, caixa: e.target.value }) })), /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement(Label, null, "Na conta (banco)"), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "0,00", value: abertura.banco, onChange: (e) => setAbertura({ ...abertura, banco: e.target.value }) }))), /* @__PURE__ */ React5.createElement(PorQueImporta, { texto: porBloco3(1) }), /* @__PURE__ */ React5.createElement(
    ListaItens,
    {
      titulo: "O que o neg\xF3cio tem que vale dinheiro (equipamentos, m\xF3veis, ve\xEDculo)",
      porque: porBloco3(2),
      itens: abertura.equipamentos,
      onChange: (v) => setAbertura({ ...abertura, equipamentos: v })
    }
  ), especificos.map((campo) => /* @__PURE__ */ React5.createElement("div", { className: "mb-6", key: campo.chave }, /* @__PURE__ */ React5.createElement(Label, null, campo.rotulo), /* @__PURE__ */ React5.createElement(
    Input,
    {
      money: true,
      placeholder: "0,00",
      value: abertura.especificos?.[campo.chave] ?? "",
      onChange: (e) => setAbertura({ ...abertura, especificos: { ...abertura.especificos || {}, [campo.chave]: e.target.value } })
    }
  ), /* @__PURE__ */ React5.createElement(PorQueImporta, { texto: campo.porque }))), /* @__PURE__ */ React5.createElement(
    ListaItens,
    {
      titulo: "Quem te deve, quanto, e para quando",
      comVencimento: true,
      porque: porBloco3(3),
      itens: abertura.aReceber,
      onChange: (v) => setAbertura({ ...abertura, aReceber: v })
    }
  ), /* @__PURE__ */ React5.createElement(ListaDividas, { itens: abertura.dividas, onChange: (v) => setAbertura({ ...abertura, dividas: v }) }));
}
function ClienteNovo({ negocio, onConcluido, onVoltarSemSalvar }) {
  const [perguntas, setPerguntas] = useState4([]);
  const [bloco, setBloco] = useState4(1);
  const [respostas, setRespostas] = useState4({});
  const [abertura, setAbertura] = useState4({ caixa: "", banco: "", equipamentos: [], especificos: {}, aReceber: [], dividas: [] });
  const [contasFixas, setContasFixas] = useState4([]);
  const [salvando, setSalvando] = useState4(false);
  const [erro, setErro] = useState4("");
  const opcoesDespesa = planoDeFabrica(negocio.arquetipo).filter((c) => c.tipo === "despesa").sort((a, b) => a.codigo.localeCompare(b.codigo)).map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` }));
  useEffect4(() => {
    let vivo = true;
    Promise.all([
      supabase.from("roteiro_perguntas").select("*").eq("ativo", true).order("bloco").order("ordem"),
      supabase.from("roteiro_respostas").select("pergunta_id, resposta").eq("negocio_id", negocio.id)
    ]).then(([{ data: perguntasData, error: e1 }, { data: respostasData, error: e2 }]) => {
      if (!vivo) return;
      if (!e1) setPerguntas(perguntasData || []);
      if (!e2 && respostasData?.length) {
        const existentes = {};
        for (const r of respostasData) existentes[r.pergunta_id] = r.resposta;
        setRespostas((prev) => ({ ...existentes, ...prev }));
      }
    });
    return () => {
      vivo = false;
    };
  }, [negocio.id]);
  const doBloco = (n) => perguntasPara(perguntas, {
    tipo: negocio.tipo,
    arquetipo: negocio.arquetipo,
    apenasEssenciais: true,
    blocos: [n]
  }).filter((p) => p.destino !== "negocios.tipo");
  const numeroOuNulo = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const montarItensAbertura = () => {
    const itens = [];
    const caixa = numeroOuNulo(abertura.caixa);
    if (caixa) itens.push({ contaId: "caixa", tipo: "D", valor: caixa, descricao: "Dinheiro em esp\xE9cie" });
    const banco = numeroOuNulo(abertura.banco);
    if (banco) itens.push({ contaId: "banco", tipo: "D", valor: banco, descricao: "Saldo em conta" });
    for (const eq of abertura.equipamentos) {
      const v = numeroOuNulo(eq.valor);
      if (v) itens.push({ contaId: "equipamentos", tipo: "D", valor: v, descricao: eq.descricao || null });
    }
    for (const campo of camposAberturaDe(negocio.arquetipo)) {
      const v = numeroOuNulo(abertura.especificos?.[campo.chave]);
      if (v) itens.push({ contaId: campo.contaId, tipo: campo.tipo, valor: v, descricao: campo.rotulo });
    }
    for (const r of abertura.aReceber) {
      const v = numeroOuNulo(r.valor);
      if (v) itens.push({ contaId: "clientes", tipo: "D", valor: v, descricao: r.descricao || null, vencimento: r.vencimento || null });
    }
    itens.push(...separarDividas(abertura.dividas).itens);
    return itens;
  };
  const montarOpsRecorrentes = () => {
    const ops = [];
    for (const item of contasFixas) {
      const valor = numeroOuNulo(item.valor);
      if (!valor || !item.contaId || !item.descricao?.trim()) continue;
      const recorrenteId = uid();
      ops.push({ acao: "gravar", tabela: "recorrentes", valores: { id: recorrenteId, descricao: item.descricao.trim(), ativa: true } });
      ops.push({ acao: "gravar", tabela: "recorrente_linhas", valores: { id: uid(), recorrente_id: recorrenteId, conta_id: item.contaId, tipo: "D", valor } });
      ops.push({ acao: "gravar", tabela: "recorrente_linhas", valores: { id: uid(), recorrente_id: recorrenteId, conta_id: item.deOnde || "banco", tipo: "C", valor } });
    }
    return ops;
  };
  const concluir = async () => {
    setErro("");
    const itens = montarItensAbertura();
    if (itens.length === 0) {
      setErro("O Bloco 3 (a foto de hoje) precisa de pelo menos um valor \u2014 nem que seja s\xF3 o caixa.");
      setBloco(3);
      return;
    }
    setSalvando(true);
    try {
      const idAbertura = `abertura_${negocio.id}`;
      const { lancamento, linhas } = montarLancamentoAbertura({
        inicioDoServico: hojeISO(),
        itens
      });
      const { data: linhasAntigas } = await supabase.from("lancamento_linhas").select("id").eq("negocio_id", negocio.id).eq("lancamento_id", idAbertura);
      const ops = [
        ...(linhasAntigas || []).map((l) => ({ acao: "apagar", tabela: "lancamento_linhas", chave: { id: l.id } })),
        ...planoDeFabrica(negocio.arquetipo).map((c) => ({
          acao: "gravar",
          tabela: "contas",
          valores: { id: c.id, codigo: c.codigo, nome: c.nome, tipo: c.tipo, subtipo: c.subtipo ?? null, ordem: c.ordem, ativa: true }
        })),
        {
          acao: "gravar",
          tabela: "lancamentos",
          valores: { id: idAbertura, data: lancamento.data, data_competencia: lancamento.dataCompetencia, descricao: lancamento.descricao, origem: lancamento.origem, documento: null }
        },
        ...linhas.map((l) => ({
          acao: "gravar",
          tabela: "lancamento_linhas",
          valores: { id: l.id, lancamento_id: idAbertura, conta_id: l.contaId, tipo: l.tipo, valor: l.valor, descricao: l.descricao, vencimento: l.vencimento }
        })),
        ...montarOpsRecorrentes()
      ];
      const { error: erroLote } = await supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
      if (erroLote) throw new Error(`N\xE3o consegui gravar o balan\xE7o de abertura: ${erroLote.message}`);
      const patchNegocio = { inicio_do_servico: hojeISO(), configuracao: { ...negocio.configuracao || {}, onboarded: true } };
      Object.assign(patchNegocio, respostasParaNegocio(perguntas, respostas));
      if (!negocio.retrato_de_entrada) {
        const declarado = {};
        for (const p of perguntas) {
          if (!p.destino?.startsWith("retrato.")) continue;
          const chave = p.destino.slice("retrato.".length);
          declarado[chave] = respostas[p.id];
        }
        patchNegocio.retrato_de_entrada = montarRetratoDeEntrada({
          negocio: { ...negocio, ...patchNegocio },
          hoje: hojeISO(),
          contas: planoDeFabrica(negocio.arquetipo),
          linhasAbertura: linhas,
          declarado
        });
      }
      const { error: erroNegocio } = await supabase.from("negocios").update(patchNegocio).eq("id", negocio.id);
      if (erroNegocio) throw new Error(`Balan\xE7o gravado, mas n\xE3o consegui atualizar o cadastro: ${erroNegocio.message}`);
      const linhasRespostas = Object.entries(respostas).filter(([, resposta]) => resposta !== void 0 && resposta !== "").map(([perguntaId, resposta]) => ({ negocio_id: negocio.id, pergunta_id: perguntaId, resposta: String(resposta) }));
      if (linhasRespostas.length) {
        await supabase.from("roteiro_respostas").upsert(linhasRespostas, { onConflict: "negocio_id,pergunta_id" });
      }
      onConcluido();
    } catch (e) {
      setErro(e.message || "Algo deu errado \u2014 tenta de novo.");
    } finally {
      setSalvando(false);
    }
  };
  const ultimoBloco = bloco === 6;
  const respostaMisturado = respostaPorDestino(perguntas, respostas, "negocios.dinheiro_misturado");
  const dinheiroMisturado = respostaMisturado != null ? respostaMisturado === "sim" : !!negocio.dinheiro_misturado;
  return /* @__PURE__ */ React5.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React5.createElement("div", { className: "max-w-2xl mx-auto px-5 py-8" }, /* @__PURE__ */ React5.createElement("button", { onClick: onVoltarSemSalvar, className: "inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React5.createElement(ArrowLeft, { size: 14 }), " Voltar"), /* @__PURE__ */ React5.createElement("div", { className: "mb-2 text-xs", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "Roteiro do Cliente Novo \xB7 Bloco ", bloco, " de 6"), /* @__PURE__ */ React5.createElement("div", { className: "text-xl font-bold mb-6", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, negocio.apelido || negocio.nome, " \u2014 ", NOMES_BLOCO[bloco]), /* @__PURE__ */ React5.createElement("div", { className: "flex gap-1 mb-8" }, [1, 2, 3, 4, 5, 6].map((n) => /* @__PURE__ */ React5.createElement(
    "div",
    {
      key: n,
      className: "h-1 flex-1 rounded-full transition-colors duration-300",
      style: { background: n <= bloco ? "var(--gold)" : "var(--rule-faint)" }
    }
  ))), bloco === 1 && /* @__PURE__ */ React5.createElement(MandarParaOCliente, { negocioId: negocio.id, whatsapp: negocio.whatsapp }), /* @__PURE__ */ React5.createElement(Card, { className: "mb-6" }, bloco === 3 ? /* @__PURE__ */ React5.createElement(
    BlocoAbertura,
    {
      abertura,
      setAbertura,
      perguntas,
      arquetipo: negocio.arquetipo,
      dinheiroMisturado
    }
  ) : bloco === 4 ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, doBloco(4).map((p) => /* @__PURE__ */ React5.createElement(
    CampoRoteiro,
    {
      key: p.id,
      pergunta: p,
      valor: respostas[p.id],
      onChange: (v) => setRespostas({ ...respostas, [p.id]: v })
    }
  )), /* @__PURE__ */ React5.createElement(BlocoContasFixas, { itens: contasFixas, onChange: setContasFixas, opcoesDespesa })) : doBloco(bloco).map((p) => /* @__PURE__ */ React5.createElement(
    CampoRoteiro,
    {
      key: p.id,
      pergunta: p,
      valor: respostas[p.id],
      onChange: (v) => setRespostas({ ...respostas, [p.id]: v })
    }
  ))), erro && /* @__PURE__ */ React5.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React5.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React5.createElement(Button, { variant: "ghost", disabled: bloco === 1, onClick: () => setBloco((b) => b - 1) }, /* @__PURE__ */ React5.createElement(ArrowLeft, { size: 14 }), " Anterior"), ultimoBloco ? /* @__PURE__ */ React5.createElement(Button, { onClick: concluir, disabled: salvando }, salvando ? "Gravando\u2026" : "Concluir cadastro") : /* @__PURE__ */ React5.createElement(Button, { onClick: () => setBloco((b) => b + 1) }, "Pr\xF3ximo ", /* @__PURE__ */ React5.createElement(ArrowRight, { size: 14 })))));
}

// src/telas/Livro.jsx
import React20, { useState as useState16, useEffect as useEffect8, useRef as useRef2, useCallback as useCallback2 } from "react";
import { ArrowLeft as ArrowLeft2 } from "lucide-react";

// src/dados/sinc.mjs
function paraSnake(nome) {
  return nome.replace(/[A-Z]/g, (letra) => "_" + letra.toLowerCase());
}
var COLECOES = {
  contas: {
    tabela: "contas",
    forma: "lista",
    campos: ["id", "codigo", "nome", "tipo", "subtipo", "ordem", "ativa"],
    padroes: { ordem: 0, ativa: true },
    chave: ["id"]
  },
  lancamentos: {
    tabela: "lancamentos",
    forma: "lista",
    campos: ["id", "data", "dataCompetencia", "descricao", "origem", "documento"],
    padroes: { descricao: "", origem: "manual" },
    chave: ["id"]
  },
  lancamentoLinhas: {
    tabela: "lancamento_linhas",
    forma: "lista",
    /* `descricao`/`vencimento` vieram em 0006_linha_descricao.sql,
       `baixaDe` em 0010_baixa_de.sql — o schema evolui por ALTER, nunca
       editando migração já aplicada (docs/06 §1). */
    campos: ["id", "lancamentoId", "contaId", "tipo", "valor", "descricao", "vencimento", "baixaDe"],
    chave: ["id"]
  },
  entradaItens: {
    tabela: "entrada_itens",
    forma: "lista",
    /* `contaOrigemId` veio em 0007_entrada_conta_origem.sql, depois da
       0001 — o schema evolui por ALTER (docs/06 §1). */
    campos: ["id", "origem", "data", "descricaoBruta", "valor", "situacao", "lancamentoId", "contaOrigemId"],
    padroes: { descricaoBruta: "", situacao: "pendente" },
    chave: ["id"]
  },
  regrasClassificacao: {
    tabela: "regras_classificacao",
    forma: "lista",
    campos: ["id", "padrao", "contaId", "acertos"],
    padroes: { acertos: 1 },
    chave: ["id"]
  },
  /* A lixeira guarda o lançamento inteiro (cabeçalho + linhas, como veio
     do estado em memória) na coluna `conteudo`. A chave é `lancamentoId`,
     não `id` — é o caso que motivou o `chaveCampo` (ver cabeçalho). */
  lixeira: {
    tabela: "lixeira",
    forma: "lista",
    chaveCampo: "lancamentoId",
    campos: ["lancamentoId", "conteudo", "excluidoEm"],
    chave: ["lancamento_id"]
  },
  /* Trilha de auditoria: só nasce, nunca morre (docs/06 §10). Comparação
     por IDENTIDADE de objeto, como no ContLife — o estado do React nunca
     muta os antigos no lugar. */
  trilha: {
    tabela: "trilha",
    forma: "trilha",
    apenasInsere: true
  },
  /* Recorrentes — o template (cabeçalho) e suas pernas, mesmo desenho
     cabeçalho+linhas de lancamentos/lancamentoLinhas (docs/06 §1). */
  recorrentes: {
    tabela: "recorrentes",
    forma: "lista",
    campos: ["id", "descricao", "ativa"],
    padroes: { ativa: true },
    chave: ["id"]
  },
  recorrenteLinhas: {
    tabela: "recorrente_linhas",
    forma: "lista",
    campos: ["id", "recorrenteId", "contaId", "tipo", "valor"],
    chave: ["id"]
  },
  /* Carta de recomendações — uma por mês, chave é o próprio mês (texto
     "AAAA-MM"), mesmo raciocínio de `periodosFechados`: não precisa de
     id sintético quando a chave de domínio já é única (docs/08 §4). */
  cartas: {
    tabela: "cartas",
    forma: "lista",
    chaveCampo: "mes",
    campos: ["mes", "texto", "seguida"],
    padroes: { texto: "" },
    chave: ["mes"]
  },
  /* O que foi EVITADO, não recomendado para o futuro (docs/DECISOES.md
     F7, 0017_evitados.sql). Lista, não célula de texto — o mesmo
     desenho de `recorrentes`: vários fatos possíveis no mesmo mês. */
  evitados: {
    tabela: "evitados",
    forma: "lista",
    campos: ["id", "mes", "descricao", "valorEstimado"],
    chave: ["id"]
  },
  /* Array de "mes:AAAA-MM" ou "ano:AAAA" (docs/06 §5). */
  periodosFechados: {
    tabela: "periodos_fechados",
    forma: "conjunto",
    chave: ["tipo", "periodo"],
    partes: ["tipo", "periodo"]
  },
  /* Array de lancamento_id que já foram conferidos contra o extrato. */
  conciliacoes: {
    tabela: "conciliacoes",
    forma: "conjunto",
    chave: ["lancamento_id"],
    partes: ["lancamento_id"]
  }
};
var LIMITE_PERIGO = { minimoAbsoluto: 25, fracao: 0.5 };
function paraLinha(registro, campos, padroes) {
  const linha = {};
  for (const campo of campos) {
    const v = registro[campo];
    linha[paraSnake(campo)] = v === void 0 || v === null ? padroes?.[campo] ?? null : v;
  }
  return linha;
}
function partirChave(texto) {
  const corte = String(texto).lastIndexOf(":");
  return corte < 0 ? [String(texto), ""] : [texto.slice(0, corte), texto.slice(corte + 1)];
}
function mesmoRegistro(a, b) {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}
function diferencaLista(desc, antes, depois, ops) {
  const chaveCampo = desc.chaveCampo || "id";
  const chaveDb = paraSnake(chaveCampo);
  const mapaAntes = new Map((antes || []).map((r) => [r[chaveCampo], r]));
  const mapaDepois = new Map((depois || []).map((r) => [r[chaveCampo], r]));
  for (const [chave, registro] of mapaDepois) {
    const anterior = mapaAntes.get(chave);
    if (!anterior || !mesmoRegistro(anterior, registro)) {
      ops.push({ acao: "gravar", tabela: desc.tabela, valores: paraLinha(registro, desc.campos, desc.padroes) });
    }
  }
  for (const chave of mapaAntes.keys()) {
    if (!mapaDepois.has(chave)) {
      ops.push({ acao: "apagar", tabela: desc.tabela, chave: { [chaveDb]: chave } });
    }
  }
}
function diferencaTrilha(desc, antes, depois, ops) {
  const vistos = new Set(antes || []);
  for (const item of depois || []) {
    if (vistos.has(item)) continue;
    ops.push({
      acao: "gravar",
      tabela: desc.tabela,
      valores: { tipo: item.tipo ?? "", descricao: item.descricao ?? "" }
    });
  }
}
function diferencaConjunto(desc, antes, depois, ops) {
  const a = new Set(antes || []);
  const d = new Set(depois || []);
  const decompor = (texto) => desc.partes.length === 1 ? { [desc.partes[0]]: texto } : (([x, y]) => ({ [desc.partes[0]]: x, [desc.partes[1]]: y }))(partirChave(texto));
  for (const texto of d) if (!a.has(texto)) ops.push({ acao: "gravar", tabela: desc.tabela, valores: decompor(texto) });
  for (const texto of a) if (!d.has(texto)) ops.push({ acao: "apagar", tabela: desc.tabela, chave: decompor(texto) });
}
function totalDe(antes) {
  let total = 0;
  for (const nome of Object.keys(COLECOES)) {
    const valor = antes?.[nome];
    if (Array.isArray(valor)) total += valor.length;
  }
  return total;
}
function calcularDiferenca(antes, depois) {
  const ops = [];
  for (const [nome, desc] of Object.entries(COLECOES)) {
    const a = antes?.[nome];
    const d = depois?.[nome];
    if (a === d) continue;
    if (desc.forma === "lista") diferencaLista(desc, a, d, ops);
    else if (desc.forma === "trilha") diferencaTrilha(desc, a, d, ops);
    else if (desc.forma === "conjunto") diferencaConjunto(desc, a, d, ops);
  }
  const apagados = ops.filter((o) => o.acao === "apagar").length;
  const gravados = ops.length - apagados;
  const total = totalDe(antes);
  const perigo = apagados >= LIMITE_PERIGO.minimoAbsoluto && total > 0 && apagados >= total * LIMITE_PERIGO.fracao ? { motivo: "exclusao_em_massa", apagados, total } : null;
  return { ops, resumo: { gravar: gravados, apagar: apagados }, perigo };
}
function montarEstado(tabelas) {
  const estado = {};
  for (const [nome, desc] of Object.entries(COLECOES)) {
    const linhas = tabelas?.[desc.tabela] || [];
    if (desc.forma === "lista") {
      estado[nome] = linhas.map((linha) => {
        const registro = {};
        for (const campo of desc.campos) registro[campo] = linha[paraSnake(campo)];
        return registro;
      });
    } else if (desc.forma === "trilha") {
      estado[nome] = linhas.map((l) => ({ tipo: l.tipo, descricao: l.descricao }));
    } else if (desc.forma === "conjunto") {
      estado[nome] = linhas.map((l) => desc.partes.map((p) => l[p]).join(":"));
    }
  }
  return estado;
}
var TABELAS = Object.values(COLECOES).map((c) => c.tabela);
function fotografar(estado) {
  const foto = {};
  for (const nome of Object.keys(COLECOES)) foto[nome] = estado?.[nome];
  return foto;
}

// src/dados/estadoNegocio.mjs
var PAGINA = 1e3;
async function carregarTabela(tabela, negocioId) {
  let todas = [];
  let pagina = 0;
  while (true) {
    const { data, error } = await supabase.from(tabela).select("*").eq("negocio_id", negocioId).range(pagina * PAGINA, pagina * PAGINA + PAGINA - 1);
    if (error) throw new Error(`Falha ao carregar ${tabela}: ${error.message}`);
    todas = todas.concat(data || []);
    if (!data || data.length < PAGINA) break;
    pagina++;
  }
  return todas;
}
async function carregarEstadoNegocio(negocioId) {
  const entradas = await Promise.all(
    TABELAS.map(async (tabela) => [tabela, await carregarTabela(tabela, negocioId)])
  );
  const tabelas = Object.fromEntries(entradas);
  return montarEstado(tabelas);
}

// src/telas/Diario.jsx
import React6, { useMemo, useState as useState5 } from "react";
import { Pencil, Trash2 as Trash22, Check, X as X2 } from "lucide-react";
var fmt3 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
var ORIGEM_LABEL = { manual: "Manual", extrato: "Extrato", recorrente: "Recorrente", abertura: "Abertura", encerramento_mes: "Fechamento", encerramento_ano: "Encerramento" };
var ORIGENS_EDITAVEIS = /* @__PURE__ */ new Set(["manual", "extrato", "recorrente"]);
function LinhaExcluir({ lancamento, onConfirmar }) {
  const [confirmando, setConfirmando] = useState5(false);
  if (confirmando) {
    return /* @__PURE__ */ React6.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React6.createElement("span", { className: "text-[10px]", style: { color: "var(--debit)" } }, "Excluir de vez?"), /* @__PURE__ */ React6.createElement("button", { onClick: () => onConfirmar(lancamento.id), className: "transition-opacity hover:opacity-70", style: { color: "var(--debit)" }, "aria-label": "Confirmar exclus\xE3o" }, /* @__PURE__ */ React6.createElement(Check, { size: 13 })), /* @__PURE__ */ React6.createElement("button", { onClick: () => setConfirmando(false), className: "transition-opacity hover:opacity-70", style: { color: "var(--muted)" }, "aria-label": "Cancelar" }, /* @__PURE__ */ React6.createElement(X2, { size: 13 })));
  }
  return /* @__PURE__ */ React6.createElement("button", { onClick: () => setConfirmando(true), className: "transition-opacity hover:opacity-70", style: { color: "var(--muted)" }, "aria-label": "Excluir" }, /* @__PURE__ */ React6.createElement(Trash22, { size: 13 }));
}
function Diario({ contas, lancamentos, lancamentoLinhas, onEditar, onExcluir }) {
  const nomeConta = useMemo(() => new Map(contas.map((c) => [c.id, c.nome])), [contas]);
  const linhasPorLancamento = useMemo(() => {
    const mapa = /* @__PURE__ */ new Map();
    for (const l of lancamentoLinhas) {
      if (!mapa.has(l.lancamentoId)) mapa.set(l.lancamentoId, []);
      mapa.get(l.lancamentoId).push(l);
    }
    return mapa;
  }, [lancamentoLinhas]);
  const ordenados = useMemo(
    () => [...lancamentos].sort((a, b) => (b.data || "").localeCompare(a.data || "")),
    [lancamentos]
  );
  if (ordenados.length === 0) {
    return /* @__PURE__ */ React6.createElement(Card, { className: "text-center py-12" }, /* @__PURE__ */ React6.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Nenhum lan\xE7amento ainda."));
  }
  return /* @__PURE__ */ React6.createElement("div", { className: "space-y-3" }, ordenados.map((l) => {
    const linhas = linhasPorLancamento.get(l.id) || [];
    const editavel = ORIGENS_EDITAVEIS.has(l.origem);
    return /* @__PURE__ */ React6.createElement(Card, { key: l.id, pad: "apertado" }, /* @__PURE__ */ React6.createElement("div", { className: "flex items-center justify-between mb-2 gap-2" }, /* @__PURE__ */ React6.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React6.createElement("span", { className: "font-mono text-xs mr-2", style: { color: "var(--muted)" } }, fmtData(l.data)), /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--ink)" } }, l.descricao)), /* @__PURE__ */ React6.createElement("div", { className: "flex items-center gap-2 shrink-0" }, /* @__PURE__ */ React6.createElement("span", { className: "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full", style: { background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" } }, ORIGEM_LABEL[l.origem] || l.origem), editavel && /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("button", { onClick: () => onEditar(l.id), className: "transition-opacity hover:opacity-70", style: { color: "var(--muted)" }, "aria-label": "Editar" }, /* @__PURE__ */ React6.createElement(Pencil, { size: 13 })), /* @__PURE__ */ React6.createElement(LinhaExcluir, { lancamento: l, onConfirmar: onExcluir })))), /* @__PURE__ */ React6.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ React6.createElement("tbody", null, linhas.map((linha) => /* @__PURE__ */ React6.createElement("tr", { key: linha.id }, /* @__PURE__ */ React6.createElement("td", { className: "py-0.5 pr-2", style: { color: linha.tipo === "D" ? "var(--ink)" : "var(--muted)", paddingLeft: linha.tipo === "C" ? "1.5rem" : 0 } }, linha.tipo === "D" ? "D" : "C", " ", nomeConta.get(linha.contaId) || linha.contaId, linha.descricao ? /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--muted)" } }, " \u2014 ", linha.descricao) : null), /* @__PURE__ */ React6.createElement("td", { className: "py-0.5 text-right tabular-nums" }, fmt3(linha.valor)))))));
  }));
}

// src/telas/Razao.jsx
import React7, { useState as useState6, useMemo as useMemo2 } from "react";
var fmt4 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData2 = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
function Razao({ contas, lancamentos, lancamentoLinhas }) {
  const contasOrdenadas = useMemo2(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const [contaId, setContaId] = useState6(contasOrdenadas[0]?.id || "");
  const conta = contas.find((c) => c.id === contaId);
  const linhas = useMemo2(() => {
    if (!conta) return [];
    const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
    const normal = DEBITO_NORMAL[conta.tipo];
    let corrente = 0;
    return lancamentoLinhas.filter((l) => l.contaId === contaId).map((l) => ({ ...l, data: porLancamento.get(l.lancamentoId)?.data, lancDescricao: porLancamento.get(l.lancamentoId)?.descricao })).sort((a, b) => (a.data || "").localeCompare(b.data || "")).map((l) => {
      corrente += l.tipo === "D" === normal ? l.valor : -l.valor;
      return { ...l, saldoCorrente: corrente };
    });
  }, [contaId, conta, lancamentoLinhas, lancamentos]);
  return /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("div", { className: "mb-4 max-w-xs" }, /* @__PURE__ */ React7.createElement(Select, { value: contaId, onChange: setContaId, options: contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` })) })), /* @__PURE__ */ React7.createElement(Card, null, linhas.length === 0 ? /* @__PURE__ */ React7.createElement("div", { className: "text-center py-8 text-sm", style: { color: "var(--muted)" } }, "Nenhum lan\xE7amento nesta conta ainda.") : /* @__PURE__ */ React7.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React7.createElement("thead", null, /* @__PURE__ */ React7.createElement("tr", { style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React7.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "Data"), /* @__PURE__ */ React7.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "Descri\xE7\xE3o"), /* @__PURE__ */ React7.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "D\xE9bito"), /* @__PURE__ */ React7.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "Cr\xE9dito"), /* @__PURE__ */ React7.createElement("th", { className: "text-right py-2", style: { color: "var(--muted)" } }, "Saldo"))), /* @__PURE__ */ React7.createElement("tbody", null, linhas.map((l) => /* @__PURE__ */ React7.createElement("tr", { key: l.id, style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3 font-mono text-xs", style: { color: "var(--muted)" } }, fmtData2(l.data)), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3" }, l.descricao || l.lancDescricao), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, l.tipo === "D" ? fmt4(l.valor) : "\u2014"), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, l.tipo === "C" ? fmt4(l.valor) : "\u2014"), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 text-right tabular-nums font-medium" }, fmt4(l.saldoCorrente))))))));
}

// src/telas/Balancete.jsx
import React8 from "react";
var TIPO_LABEL2 = { ativo: "Ativo", passivo: "Passivo", pl: "Patrim\xF4nio L\xEDquido", receita: "Receita", despesa: "Despesa" };
var fmt5 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
function Balancete({ contas, lancamentoLinhas }) {
  const b = balancete(contas, lancamentoLinhas);
  return /* @__PURE__ */ React8.createElement(Card, null, /* @__PURE__ */ React8.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React8.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React8.createElement("thead", null, /* @__PURE__ */ React8.createElement("tr", { style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React8.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "C\xF3digo"), /* @__PURE__ */ React8.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "Conta"), /* @__PURE__ */ React8.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "D\xE9bito"), /* @__PURE__ */ React8.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "Cr\xE9dito"), /* @__PURE__ */ React8.createElement("th", { className: "text-right py-2", style: { color: "var(--muted)" } }, "Saldo"))), /* @__PURE__ */ React8.createElement("tbody", null, b.linhas.filter((c) => c.debito || c.credito).map((c) => /* @__PURE__ */ React8.createElement("tr", { key: c.id, style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3 font-mono text-xs", style: { color: "var(--muted)" } }, c.codigo), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3" }, c.nome, /* @__PURE__ */ React8.createElement("span", { className: "text-[10px] ml-2 uppercase tracking-wide", style: { color: "var(--muted)" } }, TIPO_LABEL2[c.tipo])), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, c.debito ? fmt5(c.debito) : "\u2014"), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, c.credito ? fmt5(c.credito) : "\u2014"), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 text-right tabular-nums font-medium", style: { color: "var(--ink)" } }, fmt5(c.saldo)))), b.linhas.every((c) => !c.debito && !c.credito) && /* @__PURE__ */ React8.createElement("tr", null, /* @__PURE__ */ React8.createElement("td", { colSpan: 5, className: "py-8 text-center text-sm", style: { color: "var(--muted)" } }, "Nenhum lan\xE7amento ainda."))), /* @__PURE__ */ React8.createElement("tfoot", null, /* @__PURE__ */ React8.createElement("tr", { style: { borderTop: "2px solid var(--rule)" } }, /* @__PURE__ */ React8.createElement("td", { colSpan: 2, className: "py-2 pr-3 font-medium" }, "Total"), /* @__PURE__ */ React8.createElement("td", { className: "py-2 pr-3 text-right tabular-nums font-medium" }, fmt5(b.totalDebito)), /* @__PURE__ */ React8.createElement("td", { className: "py-2 pr-3 text-right tabular-nums font-medium" }, fmt5(b.totalCredito)), /* @__PURE__ */ React8.createElement("td", { className: "py-2 text-right" }, /* @__PURE__ */ React8.createElement("span", { className: "text-xs px-2 py-1 rounded-full", style: { background: b.fecha ? "var(--credit-soft)" : "var(--debit-soft)", color: b.fecha ? "var(--credit)" : "var(--debit)" } }, b.fecha ? "fecha \u2713" : "n\xE3o fecha \u26A0")))))));
}

// src/telas/Lancar.jsx
import React9, { useState as useState7, useMemo as useMemo3, useEffect as useEffect5 } from "react";
import { Plus as Plus3, Trash2 as Trash23, X as X3 } from "lucide-react";

// src/dominio/disponivel.mjs
var DIAS_JANELA = 30;
var CONTA_A_RECEBER = "clientes";
var CONTAS_COMPROMISSO = ["fornecedores", "das_a_pagar", "emprestimos", "salarios_a_pagar"];
function addDias(iso, n) {
  const d = /* @__PURE__ */ new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function somaComVencimentoEmJanela(linhas, contaId, tipo, hoje, dias, baixadas) {
  const limite = addDias(hoje, dias);
  return linhas.filter((l) => l.contaId === contaId && l.tipo === tipo && l.vencimento && l.vencimento >= hoje && l.vencimento <= limite && !baixadas.has(l.id)).reduce((s, l) => s + l.valor, 0);
}
function capadoNoSaldo(valorBruto, contas, contaId, linhas) {
  const conta = contas.find((c) => c.id === contaId);
  if (!conta) return 0;
  const saldoAberto = Math.max(0, saldoDeConta(conta, linhas));
  return Math.min(valorBruto, saldoAberto);
}
function reservaMinima({ contas, lancamentos, lancamentoLinhas, periodosFechados }) {
  const mesesFechados = (periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4)).sort().slice(-3);
  if (!mesesFechados.length) return 0;
  const idsDespesa = new Set(contas.filter((c) => c.tipo === "despesa").map((c) => c.id));
  const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
  const despesaPorMes = /* @__PURE__ */ new Map();
  for (const linha of lancamentoLinhas) {
    if (!idsDespesa.has(linha.contaId) || linha.tipo !== "D") continue;
    const mes = (porLancamento.get(linha.lancamentoId)?.data || "").slice(0, 7);
    if (!mesesFechados.includes(mes)) continue;
    despesaPorMes.set(mes, (despesaPorMes.get(mes) || 0) + linha.valor);
  }
  return despesaPorMes.size ? Math.max(...despesaPorMes.values()) : 0;
}
function quantoPodeTirar({ contas, lancamentos, lancamentoLinhas, periodosFechados, hoje }) {
  const caixaConta = contas.find((c) => c.id === "caixa");
  const bancoConta = contas.find((c) => c.id === "banco");
  const disponivelHoje = (caixaConta ? saldoDeConta(caixaConta, lancamentoLinhas) : 0) + (bancoConta ? saldoDeConta(bancoConta, lancamentoLinhas) : 0);
  const baixadas = new Set(lancamentoLinhas.filter((l) => l.baixaDe).map((l) => l.baixaDe));
  const aReceberBruto = somaComVencimentoEmJanela(lancamentoLinhas, CONTA_A_RECEBER, "D", hoje, DIAS_JANELA, baixadas);
  const aReceber = capadoNoSaldo(aReceberBruto, contas, CONTA_A_RECEBER, lancamentoLinhas);
  let compromissos = 0;
  for (const contaId of CONTAS_COMPROMISSO) {
    const bruto = somaComVencimentoEmJanela(lancamentoLinhas, contaId, "C", hoje, DIAS_JANELA, baixadas);
    compromissos += capadoNoSaldo(bruto, contas, contaId, lancamentoLinhas);
  }
  const reserva = reservaMinima({ contas, lancamentos, lancamentoLinhas, periodosFechados });
  const podeTirar = Math.max(0, disponivelHoje + aReceber - compromissos - reserva);
  return { podeTirar, disponivelHoje, aReceber, compromissos, reserva };
}

// src/telas/Lancar.jsx
var CONTAS_COM_VENCIMENTO = /* @__PURE__ */ new Set([CONTA_A_RECEBER, ...CONTAS_COMPROMISSO]);
var uid2 = () => Math.random().toString(36).slice(2, 10);
var hojeISO2 = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var fmt6 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var linhaVazia = () => ({ chave: uid2(), contaId: "", tipo: "D", valor: "", descricao: "", vencimento: "" });
var linhaDe = (l) => ({ chave: uid2(), contaId: l.contaId, tipo: l.tipo, valor: String(l.valor), descricao: l.descricao || "", vencimento: l.vencimento || "" });
function Lancar({ contas, onAdicionar, editando, onEditar, onCancelarEdicao }) {
  const contasOrdenadas = useMemo3(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const opcoesContas = contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` }));
  const [data, setData] = useState7(editando?.lancamento.data || hojeISO2());
  const [descricao, setDescricao] = useState7(editando?.lancamento.descricao || "");
  const [linhas, setLinhas] = useState7(editando ? editando.linhas.map(linhaDe) : [linhaVazia(), linhaVazia()]);
  const [confirmado, setConfirmado] = useState7(false);
  useEffect5(() => {
    if (!editando) return;
    setData(editando.lancamento.data);
    setDescricao(editando.lancamento.descricao);
    setLinhas(editando.linhas.map(linhaDe));
  }, [editando]);
  const editarLinha = (chave, campo, valor) => setLinhas((ls) => ls.map((l) => l.chave === chave ? { ...l, [campo]: valor } : l));
  const removerLinha = (chave) => setLinhas((ls) => ls.filter((l) => l.chave !== chave));
  const adicionarLinha = () => setLinhas((ls) => [...ls, linhaVazia()]);
  const numero = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + numero(l.valor), 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + numero(l.valor), 0);
  const diferenca = Math.round((somaD - somaC) * 100) / 100;
  const linhasValidas = linhas.filter((l) => l.contaId && numero(l.valor) > 0);
  const podeGravar = descricao.trim() && linhasValidas.length >= 2 && diferenca === 0 && somaD > 0;
  const limpar = () => {
    setData(hojeISO2());
    setDescricao("");
    setLinhas([linhaVazia(), linhaVazia()]);
  };
  const gravar = () => {
    if (!podeGravar) return;
    if (editando) {
      const aceito2 = onEditar({
        lancamentoId: editando.lancamento.id,
        lancamento: { id: editando.lancamento.id, data, dataCompetencia: data, descricao: descricao.trim(), origem: editando.lancamento.origem, documento: editando.lancamento.documento },
        linhas: linhasValidas.map((l) => ({
          id: uid2(),
          lancamentoId: editando.lancamento.id,
          contaId: l.contaId,
          tipo: l.tipo,
          valor: numero(l.valor),
          descricao: l.descricao.trim() || null,
          vencimento: l.vencimento || null
        }))
      });
      if (aceito2 === false) return;
      onCancelarEdicao();
      limpar();
      setConfirmado(true);
      setTimeout(() => setConfirmado(false), 2e3);
      return;
    }
    const idLancamento = uid2();
    const aceito = onAdicionar({
      lancamento: { id: idLancamento, data, dataCompetencia: data, descricao: descricao.trim(), origem: "manual", documento: null },
      linhas: linhasValidas.map((l) => ({
        id: uid2(),
        lancamentoId: idLancamento,
        contaId: l.contaId,
        tipo: l.tipo,
        valor: numero(l.valor),
        descricao: l.descricao.trim() || null,
        vencimento: null
      }))
    });
    if (aceito === false) return;
    limpar();
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2e3);
  };
  return /* @__PURE__ */ React9.createElement(Card, null, editando && /* @__PURE__ */ React9.createElement("div", { className: "flex items-center justify-between mb-4 pb-3", style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React9.createElement("span", { className: "text-xs uppercase tracking-wide", style: { color: "var(--accent)", fontFamily: "var(--font-mono)" } }, "Editando lan\xE7amento"), /* @__PURE__ */ React9.createElement("button", { onClick: () => {
    onCancelarEdicao();
    limpar();
  }, className: "text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React9.createElement(X3, { size: 13 }), " Cancelar")), /* @__PURE__ */ React9.createElement("div", { className: "grid grid-cols-2 gap-3 mb-4" }, /* @__PURE__ */ React9.createElement("div", null, /* @__PURE__ */ React9.createElement(Label, null, "Data"), /* @__PURE__ */ React9.createElement(Input, { type: "date", value: data, onChange: (e) => setData(e.target.value) })), /* @__PURE__ */ React9.createElement("div", null, /* @__PURE__ */ React9.createElement(Label, null, "Descri\xE7\xE3o"), /* @__PURE__ */ React9.createElement(Input, { value: descricao, onChange: (e) => setDescricao(e.target.value), placeholder: "ex.: Venda do dia" }))), /* @__PURE__ */ React9.createElement(Label, null, "Linhas"), linhas.map((l) => /* @__PURE__ */ React9.createElement("div", { key: l.chave, className: "flex gap-2 mb-2 items-center flex-wrap animate-[surgir_.2s_ease-out]" }, /* @__PURE__ */ React9.createElement(Select, { value: l.tipo, onChange: (v) => editarLinha(l.chave, "tipo", v), options: [{ value: "D", label: "D" }, { value: "C", label: "C" }] }), /* @__PURE__ */ React9.createElement("div", { className: "flex-[2]" }, /* @__PURE__ */ React9.createElement(Select, { value: l.contaId, onChange: (v) => editarLinha(l.chave, "contaId", v), placeholder: "conta", options: opcoesContas })), /* @__PURE__ */ React9.createElement(Input, { money: true, placeholder: "valor", value: l.valor, onChange: (e) => editarLinha(l.chave, "valor", e.target.value), className: "flex-1" }), CONTAS_COM_VENCIMENTO.has(l.contaId) && /* @__PURE__ */ React9.createElement(Input, { type: "date", value: l.vencimento, onChange: (e) => editarLinha(l.chave, "vencimento", e.target.value), className: "w-36", title: "Vencimento (opcional) \u2014 pra aparecer em 'A receber/pagar'" }), /* @__PURE__ */ React9.createElement("button", { type: "button", onClick: () => removerLinha(l.chave), disabled: linhas.length <= 2, className: "transition-opacity hover:opacity-70 disabled:opacity-30 shrink-0", style: { color: "var(--debit)" }, "aria-label": "Remover" }, /* @__PURE__ */ React9.createElement(Trash23, { size: 15 })))), /* @__PURE__ */ React9.createElement("button", { type: "button", onClick: adicionarLinha, className: "text-xs inline-flex items-center gap-1 mt-1 mb-4 transition-opacity hover:opacity-70", style: { color: "var(--accent)" } }, /* @__PURE__ */ React9.createElement(Plus3, { size: 13 }), " adicionar linha"), /* @__PURE__ */ React9.createElement("div", { className: "flex items-center justify-between mb-4 text-xs", style: { color: "var(--muted)" } }, /* @__PURE__ */ React9.createElement("span", null, "D\xE9bitos: ", fmt6(somaD), " \xB7 Cr\xE9ditos: ", fmt6(somaC)), diferenca !== 0 && /* @__PURE__ */ React9.createElement(AlertLine, null, "Diferen\xE7a de ", fmt6(Math.abs(diferenca)), " \u2014 o lan\xE7amento precisa fechar antes de gravar")), /* @__PURE__ */ React9.createElement(Button, { onClick: gravar, disabled: !podeGravar }, editando ? "Salvar edi\xE7\xE3o" : "Lan\xE7ar"), confirmado && /* @__PURE__ */ React9.createElement("span", { className: "ml-3 text-xs", style: { color: "var(--credit)" } }, "Lan\xE7ado."));
}

// src/telas/CaixaEntrada.jsx
import React10, { useState as useState8, useMemo as useMemo4 } from "react";
import { Upload, Check as Check2, X as X4, HelpCircle as HelpCircle2, ArrowUpFromLine } from "lucide-react";

// src/dominio/importarExtrato.mjs
function parseOFX(text) {
  const rows = [];
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  for (const b of blocks) {
    const g = (tag) => {
      const m = b.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"));
      return m ? m[1].trim() : "";
    };
    const dt = g("DTPOSTED").slice(0, 8);
    const date = dt.length === 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : "";
    const amt = parseFloat(g("TRNAMT").replace(",", "."));
    const desc = g("MEMO") || g("NAME");
    if (date && !isNaN(amt)) rows.push({ date, desc, amount: amt });
  }
  return rows;
}
function parseCSVText(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { header: [], rows: [] };
  const sep = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
  const split = (l) => l.split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
  const header = split(lines[0]);
  return { header, rows: lines.slice(1).map(split) };
}
var toISO = (s) => {
  s = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return "";
};

// src/dominio/classificacao.mjs
var uidPadrao2 = () => Math.random().toString(36).slice(2, 10);
function sugerirConta(descricaoBruta, regras) {
  const texto = (descricaoBruta || "").toUpperCase();
  if (!texto) return null;
  const candidatas = (regras || []).filter((r) => r.padrao && texto.includes(r.padrao.toUpperCase()));
  if (!candidatas.length) return null;
  candidatas.sort((a, b) => b.padrao.length - a.padrao.length || (b.acertos || 0) - (a.acertos || 0));
  return candidatas[0];
}
function construirMovimentoPessoal(item, gerarId = uidPadrao2) {
  if (!item.contaOrigemId) throw new Error("item sem conta de origem \u2014 n\xE3o d\xE1 para saber de qual conta o dinheiro saiu ou entrou");
  const valorAbs = Math.abs(item.valor);
  if (!(valorAbs > 0)) throw new Error(`item com valor inv\xE1lido: ${item.valor}`);
  const entrou = item.valor > 0;
  const idLancamento = gerarId();
  const contaPatrimonio = entrou ? "capital_titular" : "retiradas_titular";
  return {
    lancamento: {
      id: idLancamento,
      data: item.data,
      dataCompetencia: item.data,
      descricao: entrou ? `Aporte do titular \u2014 ${item.descricaoBruta}` : `Retirada do titular \u2014 ${item.descricaoBruta}`,
      origem: "manual",
      documento: null
    },
    linhas: [
      /* Retirada DEBITA a conta de patrimônio (reduz o PL) e CREDITA o
         trânsito (o dinheiro saiu). Aporte é o inverso. */
      { id: gerarId(), lancamentoId: idLancamento, contaId: contaPatrimonio, tipo: entrou ? "C" : "D", valor: valorAbs, descricao: item.descricaoBruta, vencimento: null, baixaDe: null },
      { id: gerarId(), lancamentoId: idLancamento, contaId: item.contaOrigemId, tipo: entrou ? "D" : "C", valor: valorAbs, descricao: null, vencimento: null, baixaDe: null }
    ]
  };
}
function construirLancamentoDeClassificacao(item, contaCategoriaId, gerarId = uidPadrao2) {
  if (!item.contaOrigemId) throw new Error("item sem conta de origem \u2014 n\xE3o d\xE1 para saber qual conta de tr\xE2nsito debitar/creditar");
  if (!contaCategoriaId) throw new Error("escolha uma conta de categoria antes de classificar");
  const valorAbs = Math.abs(item.valor);
  if (!(valorAbs > 0)) throw new Error(`item com valor inv\xE1lido: ${item.valor}`);
  const entrou = item.valor > 0;
  const idLancamento = gerarId();
  return {
    lancamento: {
      id: idLancamento,
      data: item.data,
      dataCompetencia: item.data,
      descricao: item.descricaoBruta,
      origem: item.origem === "extrato" ? "extrato" : "manual",
      documento: null
    },
    linhas: [
      { id: gerarId(), lancamentoId: idLancamento, contaId: item.contaOrigemId, tipo: entrou ? "D" : "C", valor: valorAbs, descricao: item.descricaoBruta, vencimento: null },
      { id: gerarId(), lancamentoId: idLancamento, contaId: contaCategoriaId, tipo: entrou ? "C" : "D", valor: valorAbs, descricao: null, vencimento: null }
    ]
  };
}

// src/telas/CaixaEntrada.jsx
var uid3 = () => Math.random().toString(36).slice(2, 10);
var fmt7 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData3 = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
var CONTAS_TRANSITO = [{ value: "caixa", label: "Caixa (dinheiro)" }, { value: "banco", label: "Banco" }];
function ImportarExtrato({ onImportar }) {
  const [texto, setTexto] = useState8("");
  const [contaOrigem, setContaOrigem] = useState8("banco");
  const [linhas, setLinhas] = useState8(null);
  const [erro, setErro] = useState8("");
  const processar = () => {
    setErro("");
    const bruto = texto.trim();
    if (!bruto) {
      setErro("Cole o conte\xFAdo do extrato (CSV ou OFX) primeiro.");
      return;
    }
    if (bruto.includes("<STMTTRN>") || bruto.includes("<OFX>")) {
      const linhasOfx = parseOFX(bruto);
      if (!linhasOfx.length) {
        setErro("N\xE3o achei nenhuma transa\xE7\xE3o no OFX \u2014 confira o arquivo.");
        return;
      }
      setLinhas(linhasOfx.map((l) => ({ data: l.date, descricaoBruta: l.desc, valor: l.amount })));
      return;
    }
    const { header, rows } = parseCSVText(bruto);
    if (!rows.length) {
      setErro("N\xE3o achei nenhuma linha no CSV.");
      return;
    }
    const idx = (nomes) => header.findIndex((h) => nomes.some((n) => h.toLowerCase().includes(n)));
    const iData = idx(["data", "date"]);
    const iDesc = idx(["descri", "histor", "memo"]);
    const iValor = idx(["valor", "amount"]);
    const linhasCsv = rows.map((r) => ({
      data: toISO(r[iData >= 0 ? iData : 0] || ""),
      descricaoBruta: (r[iDesc >= 0 ? iDesc : 1] || "").trim(),
      valor: parseFloat((r[iValor >= 0 ? iValor : 2] || "0").replace(/\./g, "").replace(",", ".")) || parseFloat(r[iValor >= 0 ? iValor : 2] || "0") || 0
    })).filter((l) => l.data && l.valor);
    if (!linhasCsv.length) {
      setErro("N\xE3o consegui reconhecer as colunas de data/descri\xE7\xE3o/valor \u2014 confira o CSV.");
      return;
    }
    setLinhas(linhasCsv);
  };
  const confirmar = () => {
    onImportar(linhas.map((l) => ({
      id: uid3(),
      origem: "extrato",
      data: l.data,
      descricaoBruta: l.descricaoBruta,
      valor: l.valor,
      situacao: "pendente",
      lancamentoId: null,
      contaOrigemId: contaOrigem
    })));
    setTexto("");
    setLinhas(null);
  };
  return /* @__PURE__ */ React10.createElement(Card, { className: "mb-6" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center gap-2 mb-3" }, /* @__PURE__ */ React10.createElement(Upload, { size: 15, style: { color: "var(--accent)" } }), /* @__PURE__ */ React10.createElement("span", { className: "font-medium", style: { color: "var(--ink)" } }, "Importar extrato")), linhas === null ? /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement("div", { className: "mb-3 max-w-xs" }, /* @__PURE__ */ React10.createElement(Label, null, "Esta \xE9 a conta de"), /* @__PURE__ */ React10.createElement(Select, { value: contaOrigem, onChange: setContaOrigem, options: CONTAS_TRANSITO })), /* @__PURE__ */ React10.createElement(
    "textarea",
    {
      rows: 4,
      value: texto,
      onChange: (e) => setTexto(e.target.value),
      placeholder: "Cole aqui o conte\xFAdo do arquivo CSV ou OFX exportado do banco\u2026",
      className: "w-full rounded-md border px-3 py-2 text-xs font-mono mb-3 transition-colors duration-150",
      style: { borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }
    }
  ), erro && /* @__PURE__ */ React10.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-3", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React10.createElement(Button, { onClick: processar }, "Processar")) : /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement("div", { className: "text-xs mb-3", style: { color: "var(--muted)" } }, linhas.length, " linha(s) encontrada(s) \u2014 confira antes de importar:"), /* @__PURE__ */ React10.createElement("div", { className: "max-h-56 overflow-y-auto mb-3 text-xs" }, linhas.map((l, i) => /* @__PURE__ */ React10.createElement("div", { key: i, className: "flex justify-between py-1", style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React10.createElement("span", { style: { color: "var(--muted)" } }, fmtData3(l.data)), /* @__PURE__ */ React10.createElement("span", { className: "flex-1 mx-2 truncate" }, l.descricaoBruta), /* @__PURE__ */ React10.createElement("span", { className: "tabular-nums" }, fmt7(l.valor))))), /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React10.createElement(Button, { onClick: confirmar }, "Importar ", linhas.length, " linha(s)"), /* @__PURE__ */ React10.createElement(Button, { variant: "ghost", onClick: () => setLinhas(null) }, "Cancelar"))));
}
function ItemPendente({ item, contas, regras, onClassificar, onPessoal, onDuvida, dinheiroMisturado }) {
  const [classificando, setClassificando] = useState8(false);
  const sugestao = useMemo4(() => sugerirConta(item.descricaoBruta, regras), [item.descricaoBruta, regras]);
  const [contaId, setContaId] = useState8(sugestao?.contaId || "");
  const [padrao, setPadrao] = useState8(sugestao?.padrao || item.descricaoBruta);
  const contasOrdenadas = useMemo4(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const confirmar = () => {
    if (!contaId) return;
    const aceito = onClassificar({ item, contaCategoriaId: contaId, padrao: padrao.trim() || item.descricaoBruta });
    if (aceito !== false) setClassificando(false);
  };
  return /* @__PURE__ */ React10.createElement(Card, { pad: "apertado", className: "mb-2" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React10.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React10.createElement("div", { className: "text-xs", style: { color: "var(--muted)" } }, fmtData3(item.data), " \xB7 ", item.contaOrigemId === "banco" ? "Banco" : "Caixa"), /* @__PURE__ */ React10.createElement("div", { className: "truncate", style: { color: "var(--ink)" } }, item.descricaoBruta), sugestao && !classificando && /* @__PURE__ */ React10.createElement("div", { className: "text-[10px] mt-0.5", style: { color: "var(--accent)" } }, "sugest\xE3o: ", contas.find((c) => c.id === sugestao.contaId)?.nome)), /* @__PURE__ */ React10.createElement("div", { className: "text-sm tabular-nums shrink-0", style: { color: item.valor >= 0 ? "var(--credit)" : "var(--debit)" } }, fmt7(item.valor))), classificando ? /* @__PURE__ */ React10.createElement("div", { className: "mt-3 pt-3 space-y-2", style: { borderTop: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement(Label, null, "Categoria"), /* @__PURE__ */ React10.createElement(Select, { value: contaId, onChange: setContaId, placeholder: "escolha a conta", options: contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` })) })), /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement(Label, null, "Padr\xE3o para lembrar da pr\xF3xima vez"), /* @__PURE__ */ React10.createElement(Input, { value: padrao, onChange: (e) => setPadrao(e.target.value) })), /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2 pt-1" }, /* @__PURE__ */ React10.createElement(Button, { small: true, onClick: confirmar, disabled: !contaId }, "Confirmar"), /* @__PURE__ */ React10.createElement(Button, { small: true, variant: "ghost", onClick: () => setClassificando(false) }, "Cancelar"))) : /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2 mt-2 flex-wrap items-center" }, /* @__PURE__ */ React10.createElement(Button, { small: true, onClick: () => setClassificando(true) }, /* @__PURE__ */ React10.createElement(Check2, { size: 12 }), " Classificar"), /* @__PURE__ */ React10.createElement(Button, { small: true, variant: "ghost", onClick: () => onPessoal(item) }, dinheiroMisturado ? /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(ArrowUpFromLine, { size: 12 }), " ", item.valor > 0 ? "Aporte pessoal" : "Retirada") : /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement(X4, { size: 12 }), " \xC9 pessoal")), /* @__PURE__ */ React10.createElement(Button, { small: true, variant: "ghost", onClick: () => onDuvida(item) }, /* @__PURE__ */ React10.createElement(HelpCircle2, { size: 12 }), " N\xE3o sei"), dinheiroMisturado && /* @__PURE__ */ React10.createElement("span", { className: "text-[10px]", style: { color: "var(--muted)" } }, item.valor > 0 ? "entra como aporte, n\xE3o como receita" : "vira retirada \u2014 n\xE3o some do livro")));
}
function CaixaEntrada({ contas, entradaItens, regrasClassificacao, onImportar, onClassificar, onPessoal, onDuvida, dinheiroMisturado }) {
  const pendentes = entradaItens.filter((i) => i.situacao === "pendente" || i.situacao === "duvida");
  return /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement(ImportarExtrato, { onImportar }), dinheiroMisturado && /* @__PURE__ */ React10.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-3", style: { background: "var(--accent-soft)", color: "var(--ink)" } }, "Este cliente usa o mesmo dinheiro para tudo. Gasto pessoal aqui vira ", /* @__PURE__ */ React10.createElement("strong", null, "retirada"), " e dinheiro pessoal que entra vira ", /* @__PURE__ */ React10.createElement("strong", null, "aporte"), " \u2014 nada \xE9 ignorado, sen\xE3o o saldo do livro para de bater com a conta dele."), /* @__PURE__ */ React10.createElement("div", { className: "text-xs mb-3", style: { color: "var(--muted)" } }, pendentes.length, " item(ns) esperando classifica\xE7\xE3o"), pendentes.length === 0 ? /* @__PURE__ */ React10.createElement(Card, { className: "text-center py-10" }, /* @__PURE__ */ React10.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Nada esperando \u2014 importe um extrato acima.")) : pendentes.map((item) => /* @__PURE__ */ React10.createElement(
    ItemPendente,
    {
      key: item.id,
      item,
      contas,
      regras: regrasClassificacao,
      onClassificar,
      onPessoal,
      onDuvida,
      dinheiroMisturado
    }
  )));
}

// src/telas/Conciliacao.jsx
import React11, { useMemo as useMemo5 } from "react";
import { Check as Check3 } from "lucide-react";
var fmt8 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData4 = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
var CONTAS_TRANSITO2 = /* @__PURE__ */ new Set(["caixa", "banco"]);
function Conciliacao({ lancamentos, lancamentoLinhas, conciliacoes, onAlternar }) {
  const conferidos = useMemo5(() => new Set(conciliacoes), [conciliacoes]);
  const linhasPorLancamento = useMemo5(() => {
    const mapa = /* @__PURE__ */ new Map();
    for (const l of lancamentoLinhas) {
      if (!mapa.has(l.lancamentoId)) mapa.set(l.lancamentoId, []);
      mapa.get(l.lancamentoId).push(l);
    }
    return mapa;
  }, [lancamentoLinhas]);
  const relevantes = useMemo5(() => {
    return lancamentos.filter((l) => (linhasPorLancamento.get(l.id) || []).some((linha) => CONTAS_TRANSITO2.has(linha.contaId))).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [lancamentos, linhasPorLancamento]);
  if (relevantes.length === 0) {
    return /* @__PURE__ */ React11.createElement(Card, { className: "text-center py-10" }, /* @__PURE__ */ React11.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Nenhum lan\xE7amento em Caixa ou Banco ainda."));
  }
  return /* @__PURE__ */ React11.createElement("div", null, /* @__PURE__ */ React11.createElement("div", { className: "text-xs mb-3", style: { color: "var(--muted)" } }, "Marque o que voc\xEA j\xE1 conferiu contra o extrato de verdade."), relevantes.map((l) => {
    const linhaTransito = (linhasPorLancamento.get(l.id) || []).find((x) => CONTAS_TRANSITO2.has(x.contaId));
    const ok = conferidos.has(l.id);
    return /* @__PURE__ */ React11.createElement(Card, { key: l.id, pad: "apertado", className: "mb-2" }, /* @__PURE__ */ React11.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React11.createElement(
      "button",
      {
        onClick: () => onAlternar(l.id, !ok),
        className: "w-6 h-6 rounded-md border shrink-0 flex items-center justify-center transition-all duration-150",
        style: { borderColor: ok ? "var(--credit)" : "var(--rule-faint)", background: ok ? "var(--credit-soft)" : "transparent" },
        "aria-label": ok ? "Desmarcar conferido" : "Marcar como conferido"
      },
      ok && /* @__PURE__ */ React11.createElement(Check3, { size: 14, style: { color: "var(--credit)" } })
    ), /* @__PURE__ */ React11.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React11.createElement("div", { className: "text-xs", style: { color: "var(--muted)" } }, fmtData4(l.data)), /* @__PURE__ */ React11.createElement("div", { className: "truncate", style: { color: "var(--ink)" } }, l.descricao)), /* @__PURE__ */ React11.createElement("div", { className: "text-sm tabular-nums shrink-0", style: { color: "var(--ink)" } }, linhaTransito ? fmt8(linhaTransito.valor) : "\u2014")));
  }));
}

// src/telas/Revisao.jsx
import React12, { useMemo as useMemo6, useState as useState9 } from "react";
import { CheckCircle2, AlertTriangle, Lock, Unlock, Search, HelpCircle as HelpCircle3 } from "lucide-react";

// src/dominio/revisao.mjs
function mesaDeRevisao(contas, lancamentos, lancamentoLinhas) {
  const checks = [];
  const push = (nome, ok, detalhe) => checks.push({ nome, ok, detalhe: detalhe || "" });
  const idsContas = new Set(contas.map((c) => c.id));
  const idsLancamentos = new Set(lancamentos.map((l) => l.id));
  const orfas = lancamentoLinhas.filter((l) => !idsContas.has(l.contaId) || !idsLancamentos.has(l.lancamentoId));
  push(
    "Toda linha referencia lan\xE7amento e conta existentes",
    orfas.length === 0,
    orfas.length ? `${orfas.length} linha(s) \xF3rf\xE3(s)` : "nenhuma linha \xF3rf\xE3"
  );
  const datasInvalidas = lancamentos.filter((l) => !/^\d{4}-\d{2}-\d{2}$/.test(l.data || ""));
  const valoresInvalidos = lancamentoLinhas.filter((l) => !(l.valor > 0));
  push(
    "Datas e valores v\xE1lidos",
    datasInvalidas.length === 0 && valoresInvalidos.length === 0,
    datasInvalidas.length || valoresInvalidos.length ? `${datasInvalidas.length} data(s) e ${valoresInvalidos.length} valor(es) inv\xE1lido(s)` : "tudo v\xE1lido"
  );
  const idsLancVistos = /* @__PURE__ */ new Set();
  let dupLanc = 0;
  for (const l of lancamentos) {
    if (idsLancVistos.has(l.id)) dupLanc++;
    idsLancVistos.add(l.id);
  }
  const idsLinhaVistos = /* @__PURE__ */ new Set();
  let dupLinha = 0;
  for (const l of lancamentoLinhas) {
    if (idsLinhaVistos.has(l.id)) dupLinha++;
    idsLinhaVistos.add(l.id);
  }
  push(
    "Identificadores \xFAnicos",
    dupLanc === 0 && dupLinha === 0,
    dupLanc || dupLinha ? `${dupLanc} lan\xE7amento(s) e ${dupLinha} linha(s) duplicados` : "sem duplicidade"
  );
  const porLancamento = /* @__PURE__ */ new Map();
  for (const l of lancamentoLinhas) {
    if (!porLancamento.has(l.lancamentoId)) porLancamento.set(l.lancamentoId, { d: 0, c: 0 });
    const acc = porLancamento.get(l.lancamentoId);
    if (l.tipo === "D") acc.d += l.valor;
    else acc.c += l.valor;
  }
  const desequilibrados = [...porLancamento.entries()].filter(([, v]) => Math.abs(v.d - v.c) >= 0.01);
  push(
    "Todo lan\xE7amento tem d\xE9bito = cr\xE9dito",
    desequilibrados.length === 0,
    desequilibrados.length ? `${desequilibrados.length} lan\xE7amento(s) desequilibrado(s) \u2014 n\xE3o deveria ser poss\xEDvel, \xE9 o que a trava do banco existe para impedir` : "todos fecham"
  );
  const b = balancete(contas, lancamentoLinhas);
  const soma = (tipo) => b.linhas.filter((c) => c.tipo === tipo).reduce((s, c) => s + c.saldo, 0);
  const ativo = soma("ativo"), passivo = soma("passivo"), pl = soma("pl"), receita = soma("receita"), despesa = soma("despesa");
  const diferenca = ativo - passivo - pl - receita + despesa;
  push(
    "Equa\xE7\xE3o patrimonial fecha (A = P + PL + R \u2212 D)",
    Math.abs(diferenca) < 0.01,
    Math.abs(diferenca) < 0.01 ? `${fmtSimples(ativo)} = ${fmtSimples(passivo)} + ${fmtSimples(pl)} + ${fmtSimples(receita)} \u2212 ${fmtSimples(despesa)}` : `diferen\xE7a de ${fmtSimples(diferenca)}`
  );
  return checks;
}
function fmtSimples(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
function podeFecharPeriodo(checks) {
  return checks.every((c) => c.ok);
}

// src/dominio/achados.mjs
var CONTAS_DINHEIRO_OU_A_RECEBER = /* @__PURE__ */ new Set(["caixa", "banco", "maquininha_receber", "clientes"]);
function mesSeguinte(mes) {
  const [ano, m] = mes.split("-").map(Number);
  return m === 12 ? `${ano + 1}-01` : `${ano}-${String(m + 1).padStart(2, "0")}`;
}
function mesesSemMovimento(lancamentos) {
  const meses = [...new Set((lancamentos || []).map((l) => (l.data || "").slice(0, 7)).filter(Boolean))].sort();
  if (meses.length < 2) return [];
  const presentes = new Set(meses);
  const faltando = [];
  let atual = meses[0];
  const ultimo = meses[meses.length - 1];
  while (atual < ultimo) {
    atual = mesSeguinte(atual);
    if (atual < ultimo && !presentes.has(atual)) faltando.push(atual);
  }
  return faltando;
}
function saldoDaContaNoMes(contaId, mes, lancamentos, lancamentoLinhas) {
  const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => l.id));
  let saldo = 0;
  for (const linha of lancamentoLinhas) {
    if (linha.contaId !== contaId || !idsDoMes.has(linha.lancamentoId)) continue;
    saldo += linha.tipo === "D" ? linha.valor : -linha.valor;
  }
  return saldo;
}
function idsDeContaNoMes(contaId, tipoLinha, mes, lancamentos, lancamentoLinhas) {
  const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => l.id));
  const ids = /* @__PURE__ */ new Set();
  for (const linha of lancamentoLinhas) {
    if (linha.contaId !== contaId || linha.tipo !== tipoLinha || !idsDoMes.has(linha.lancamentoId)) continue;
    ids.add(linha.lancamentoId);
  }
  return [...ids];
}
function despesasForaDoPadrao(contas, lancamentos, lancamentoLinhas, periodosFechados, multiplicador = 2) {
  const mesesFechados = (periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4));
  if (!mesesFechados.length) return [];
  const todosMeses = [...new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean))];
  const mesesAbertos = todosMeses.filter((m) => !mesesFechados.includes(m));
  if (!mesesAbertos.length) return [];
  const despesas = contas.filter((c) => c.tipo === "despesa");
  const achados = [];
  for (const conta of despesas) {
    const historico = mesesFechados.map((m) => saldoDaContaNoMes(conta.id, m, lancamentos, lancamentoLinhas));
    const comMovimento = historico.filter((v) => v > 0);
    if (!comMovimento.length) continue;
    const media = comMovimento.reduce((s, v) => s + v, 0) / comMovimento.length;
    for (const mes of mesesAbertos) {
      const atual = saldoDaContaNoMes(conta.id, mes, lancamentos, lancamentoLinhas);
      if (atual > media * multiplicador) {
        achados.push({
          tipo: "despesa_fora_padrao",
          contaId: conta.id,
          contaNome: conta.nome,
          mes,
          valor: atual,
          media,
          evidencia: idsDeContaNoMes(conta.id, "D", mes, lancamentos, lancamentoLinhas)
        });
      }
    }
  }
  return achados;
}
function receitasSemDinheiro(contas, lancamentos, lancamentoLinhas) {
  const contasPorId = new Map(contas.map((c) => [c.id, c]));
  const linhasPorLancamento = /* @__PURE__ */ new Map();
  for (const l of lancamentoLinhas) {
    if (!linhasPorLancamento.has(l.lancamentoId)) linhasPorLancamento.set(l.lancamentoId, []);
    linhasPorLancamento.get(l.lancamentoId).push(l);
  }
  const achados = [];
  for (const lanc of lancamentos) {
    const linhas = linhasPorLancamento.get(lanc.id) || [];
    const temReceita = linhas.some((l) => contasPorId.get(l.contaId)?.tipo === "receita");
    if (!temReceita) continue;
    const temDinheiro = linhas.some((l) => CONTAS_DINHEIRO_OU_A_RECEBER.has(l.contaId));
    if (!temDinheiro) {
      achados.push({ tipo: "receita_sem_dinheiro", lancamentoId: lanc.id, descricao: lanc.descricao, data: lanc.data, evidencia: [lanc.id] });
    }
  }
  return achados;
}
function saldoContinuoDesde(contaId, lancamentos, lancamentoLinhas) {
  const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
  const linhas = lancamentoLinhas.filter((l) => l.contaId === contaId).map((l) => ({ ...l, data: porLancamento.get(l.lancamentoId)?.data })).filter((l) => l.data).sort((a, b) => a.data.localeCompare(b.data));
  let saldo = 0;
  let desde = null;
  for (const l of linhas) {
    const antes = saldo;
    saldo += l.tipo === "D" ? l.valor : -l.valor;
    if (antes <= 0 && saldo > 0) desde = l.data;
    if (saldo <= 0) desde = null;
  }
  return { saldo: Math.round(saldo * 100) / 100, desde };
}
var UM_DIA_MS = 24 * 60 * 60 * 1e3;
function diasEntre(dataIso, hoje) {
  return Math.round((new Date(hoje) - new Date(dataIso)) / UM_DIA_MS);
}
function retiradaAcimaDoResultado(contas, lancamentos, lancamentoLinhas, periodosFechados, hoje) {
  const mesesFechados = new Set((periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4)));
  const mes = (hoje || "").slice(0, 7);
  if (mesesFechados.has(mes)) return [];
  const retirada = saldoDaContaNoMes("retiradas_titular", mes, lancamentos, lancamentoLinhas);
  if (retirada <= 0) return [];
  const { resultado } = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes);
  if (retirada <= resultado) return [];
  return [{
    tipo: "retirada_acima_do_resultado",
    mes,
    retirada,
    resultado,
    diferenca: Math.round((retirada - resultado) * 100) / 100,
    evidencia: idsDeContaNoMes("retiradas_titular", "D", mes, lancamentos, lancamentoLinhas)
  }];
}
function mercadoriaParadaComTerceiro(contas, lancamentos, lancamentoLinhas, hoje, diasMinimo = 15) {
  if (!contas.some((c) => c.id === "mercadoria_com_terceiros")) return [];
  const { saldo, desde } = saldoContinuoDesde("mercadoria_com_terceiros", lancamentos, lancamentoLinhas);
  if (saldo <= 0 || !desde) return [];
  const dias = diasEntre(desde, hoje);
  if (dias < diasMinimo) return [];
  const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
  const evidencia = lancamentoLinhas.filter((l) => l.contaId === "mercadoria_com_terceiros" && l.tipo === "D").filter((l) => (porLancamento.get(l.lancamentoId)?.data || "") >= desde).map((l) => l.lancamentoId);
  return [{ tipo: "mercadoria_parada_com_terceiro", valor: saldo, desde, dias, evidencia: [...new Set(evidencia)] }];
}
function taxaEngolindoMargem(contas, lancamentos, lancamentoLinhas, mes, contaTaxaId, percentualLimite = 0.08) {
  if (!contaTaxaId || !contas.some((c) => c.id === contaTaxaId)) return [];
  const taxa = saldoDaContaNoMes(contaTaxaId, mes, lancamentos, lancamentoLinhas);
  if (taxa <= 0) return [];
  const { receita } = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes);
  if (receita <= 0) return [];
  const percentual = taxa / receita;
  if (percentual < percentualLimite) return [];
  return [{
    tipo: "taxa_engolindo_margem",
    mes,
    contaId: contaTaxaId,
    valor: taxa,
    receita,
    percentual: Math.round(percentual * 1e3) / 10,
    evidencia: idsDeContaNoMes(contaTaxaId, "D", mes, lancamentos, lancamentoLinhas)
  }];
}
function semReceitaNoPeriodo(contas, lancamentos, lancamentoLinhas, hoje, fracaoMinima = 0.4) {
  const mes = (hoje || "").slice(0, 7);
  const diaHoje = Number((hoje || "").slice(8, 10));
  if (!diaHoje) return [];
  const contasReceita = new Set(contas.filter((c) => c.tipo === "receita").map((c) => c.id));
  const porLancamento = new Map(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => [l.id, l]));
  const diasComReceita = /* @__PURE__ */ new Set();
  for (const linha of lancamentoLinhas) {
    const lanc = porLancamento.get(linha.lancamentoId);
    if (!lanc || !contasReceita.has(linha.contaId)) continue;
    diasComReceita.add(Number(lanc.data.slice(8, 10)));
  }
  if (!diasComReceita.size) return [];
  const diasSemReceita = diaHoje - diasComReceita.size;
  const fracao = diasSemReceita / diaHoje;
  if (fracao < fracaoMinima) return [];
  return [{ tipo: "sem_receita_no_periodo", mes, diasSemReceita, diaHoje, fracaoPercentual: Math.round(fracao * 100) }];
}
var CONTA_TAXA_POR_ARQUETIPO = { revenda: "taxa_maquininha", producao: "taxa_maquininha", digital: "taxa_plataforma" };
var HIPOTESE_INOCENTE = {
  mes_sem_movimento: "Pode ser um m\xEAs de neg\xF3cio sazonal parado de prop\xF3sito, ou um lan\xE7amento esquecido \u2014 vale perguntar antes de estranhar.",
  despesa_fora_padrao: "Pode ser uma compra grande \xFAnica (equipamento, estoque, manuten\xE7\xE3o) que n\xE3o se repete todo m\xEAs, n\xE3o necessariamente um problema.",
  receita_sem_dinheiro: "Pode ser corre\xE7\xE3o de um lan\xE7amento anterior, permuta ou venda com troca \u2014 nem toda receita sem contrapartida em dinheiro \xE9 erro.",
  retirada_acima_do_resultado: "Pode ser uso de uma reserva de meses anteriores (ele guardou e agora est\xE1 usando), n\xE3o necessariamente insustent\xE1vel.",
  mercadoria_parada_com_terceiro: "Pode ser um prazo de produ\xE7\xE3o normal, combinado com o parceiro \u2014 vale confirmar o prazo esperado antes de tratar como atraso.",
  taxa_engolindo_margem: "Pode ser um m\xEAs de vendas totais baixas, o que infla o percentual sem a taxa em si ter mudado.",
  sem_receita_no_periodo: "Pode ser f\xE9rias combinadas ou trabalho em andamento ainda n\xE3o faturado, n\xE3o necessariamente ociosidade."
};
function encontrarAchados(contas, lancamentos, lancamentoLinhas, periodosFechados, opcoes = {}) {
  const { arquetipo = null, hoje = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) } = opcoes;
  const achados = [];
  for (const mes of mesesSemMovimento(lancamentos)) {
    achados.push({ tipo: "mes_sem_movimento", mes });
  }
  achados.push(...despesasForaDoPadrao(contas, lancamentos, lancamentoLinhas, periodosFechados));
  achados.push(...receitasSemDinheiro(contas, lancamentos, lancamentoLinhas));
  achados.push(...retiradaAcimaDoResultado(contas, lancamentos, lancamentoLinhas, periodosFechados, hoje));
  const declarados = achadosDe(arquetipo);
  if (declarados.includes("mercadoria_parada_com_terceiro")) {
    achados.push(...mercadoriaParadaComTerceiro(contas, lancamentos, lancamentoLinhas, hoje));
  }
  if (declarados.includes("taxa_engolindo_margem")) {
    achados.push(...taxaEngolindoMargem(contas, lancamentos, lancamentoLinhas, hoje.slice(0, 7), CONTA_TAXA_POR_ARQUETIPO[arquetipo]));
  }
  if (declarados.includes("sem_receita_no_periodo")) {
    achados.push(...semReceitaNoPeriodo(contas, lancamentos, lancamentoLinhas, hoje));
  }
  return achados.map((a) => ({ ...a, hipoteseInocente: HIPOTESE_INOCENTE[a.tipo] || null }));
}

// src/telas/Revisao.jsx
var fmt9 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtMes = (m) => {
  const [ano, mes] = m.split("-");
  return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
var fmtData5 = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
var hojeISO3 = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function textoAchado(a) {
  if (a.tipo === "mes_sem_movimento") return `${fmtMes(a.mes)} n\xE3o tem nenhum lan\xE7amento \u2014 m\xEAs pulado no meio da hist\xF3ria`;
  if (a.tipo === "despesa_fora_padrao") return `${a.contaNome} em ${fmtMes(a.mes)}: ${fmt9(a.valor)} \u2014 bem acima da m\xE9dia de meses fechados (${fmt9(a.media)})`;
  if (a.tipo === "receita_sem_dinheiro") return `"${a.descricao}" (${fmtData5(a.data)}) \u2014 receita registrada sem dinheiro nem a receber em lugar nenhum`;
  if (a.tipo === "retirada_acima_do_resultado") return `Em ${fmtMes(a.mes)}, a retirada (${fmt9(a.retirada)}) j\xE1 passou o que o neg\xF3cio gerou (${fmt9(a.resultado)}) em ${fmt9(a.diferenca)}`;
  if (a.tipo === "mercadoria_parada_com_terceiro") return `${fmt9(a.valor)} em mercadoria parada com terceiro h\xE1 ${a.dias} dias (desde ${fmtData5(a.desde)})`;
  if (a.tipo === "taxa_engolindo_margem") return `A taxa comeu ${fmt9(a.valor)} em ${fmtMes(a.mes)} \u2014 ${a.percentual}% da receita (${fmt9(a.receita)})`;
  if (a.tipo === "sem_receita_no_periodo") return `${a.diasSemReceita} de ${a.diaHoje} dias de ${fmtMes(a.mes)} sem nenhuma receita lan\xE7ada (${a.fracaoPercentual}%)`;
  return "";
}
function LinhaDeAchado({ a }) {
  const [aberto, setAberto] = useState9(false);
  const nEvidencia = a.evidencia?.length || 0;
  return /* @__PURE__ */ React12.createElement("div", { className: "text-sm" }, /* @__PURE__ */ React12.createElement("div", { className: "flex items-start gap-2" }, /* @__PURE__ */ React12.createElement(AlertTriangle, { size: 15, style: { color: "var(--debit)", marginTop: 2, flexShrink: 0 } }), /* @__PURE__ */ React12.createElement("span", { style: { color: "var(--ink)" } }, textoAchado(a))), /* @__PURE__ */ React12.createElement("div", { className: "flex items-center gap-3 mt-1 ml-[23px]" }, nEvidencia > 0 && /* @__PURE__ */ React12.createElement("span", { className: "text-[10px]", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, nEvidencia, " lan\xE7amento", nEvidencia > 1 ? "s" : "", " \u2014 ver no Di\xE1rio"), a.hipoteseInocente && /* @__PURE__ */ React12.createElement(
    "button",
    {
      type: "button",
      onClick: () => setAberto((v) => !v),
      className: "text-[10px] inline-flex items-center gap-1 transition-opacity hover:opacity-70",
      style: { color: "var(--muted)" }
    },
    /* @__PURE__ */ React12.createElement(HelpCircle3, { size: 10 }),
    " pode n\xE3o ser problema?"
  )), aberto && a.hipoteseInocente && /* @__PURE__ */ React12.createElement("div", { className: "text-xs mt-1.5 ml-[23px] rounded-md px-3 py-2 animate-[surgir_.2s_ease-out]", style: { background: "var(--accent-soft)", color: "var(--ink)" } }, a.hipoteseInocente));
}
function Achados({ achados }) {
  return /* @__PURE__ */ React12.createElement(Card, { className: "mb-6" }, /* @__PURE__ */ React12.createElement("div", { className: "font-medium mb-3 flex items-center gap-2", style: { color: "var(--ink)" } }, /* @__PURE__ */ React12.createElement(Search, { size: 15 }), " Achados"), achados.length === 0 ? /* @__PURE__ */ React12.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Nada fora do padr\xE3o encontrado.") : /* @__PURE__ */ React12.createElement("div", { className: "space-y-3" }, achados.map((a, i) => /* @__PURE__ */ React12.createElement(LinhaDeAchado, { key: i, a }))));
}
function MesaChecks({ checks }) {
  return /* @__PURE__ */ React12.createElement(Card, { className: "mb-6" }, /* @__PURE__ */ React12.createElement("div", { className: "font-medium mb-3", style: { color: "var(--ink)" } }, "Mesa de Revis\xE3o"), /* @__PURE__ */ React12.createElement("div", { className: "space-y-2" }, checks.map((c, i) => /* @__PURE__ */ React12.createElement("div", { key: i, className: "flex items-start gap-2 text-sm" }, c.ok ? /* @__PURE__ */ React12.createElement(CheckCircle2, { size: 15, style: { color: "var(--credit)", marginTop: 2, flexShrink: 0 } }) : /* @__PURE__ */ React12.createElement(AlertTriangle, { size: 15, style: { color: "var(--debit)", marginTop: 2, flexShrink: 0 } }), /* @__PURE__ */ React12.createElement("div", null, /* @__PURE__ */ React12.createElement("span", { style: { color: "var(--ink)" } }, c.nome), /* @__PURE__ */ React12.createElement("span", { className: "text-xs ml-2", style: { color: c.ok ? "var(--muted)" : "var(--debit)" } }, c.detalhe))))));
}
function Fechamento({ lancamentos, periodosFechados, mesaPassa, onFechar, onReabrir }) {
  const mesesComMovimento = useMemo6(() => {
    const meses = new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean));
    return [...meses].sort();
  }, [lancamentos]);
  const fechados = useMemo6(() => new Set(periodosFechados.filter((p) => p.startsWith("mes:")).map((p) => p.slice(4))), [periodosFechados]);
  const abertos = mesesComMovimento.filter((m) => !fechados.has(m));
  const [mesEscolhido, setMesEscolhido] = useState9(abertos[0] || "");
  return /* @__PURE__ */ React12.createElement(Card, null, /* @__PURE__ */ React12.createElement("div", { className: "font-medium mb-3", style: { color: "var(--ink)" } }, "Fechamento de m\xEAs"), abertos.length === 0 ? /* @__PURE__ */ React12.createElement("div", { className: "text-sm mb-4", style: { color: "var(--muted)" } }, "Nenhum m\xEAs em aberto com movimento para fechar.") : /* @__PURE__ */ React12.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React12.createElement("div", { className: "w-48" }, /* @__PURE__ */ React12.createElement(Select, { value: mesEscolhido, onChange: setMesEscolhido, options: abertos.map((m) => ({ value: m, label: fmtMes(m) })) })), /* @__PURE__ */ React12.createElement(Button, { onClick: () => onFechar(mesEscolhido), disabled: !mesaPassa || !mesEscolhido }, /* @__PURE__ */ React12.createElement(Lock, { size: 13 }), " Fechar ", mesEscolhido ? fmtMes(mesEscolhido) : "")), !mesaPassa && abertos.length > 0 && /* @__PURE__ */ React12.createElement("div", { className: "text-xs mb-4", style: { color: "var(--debit)" } }, "A Mesa de Revis\xE3o precisa passar em tudo antes de fechar."), fechados.size > 0 && /* @__PURE__ */ React12.createElement("div", null, /* @__PURE__ */ React12.createElement("div", { className: "text-xs uppercase tracking-wide mb-2", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "Meses fechados"), [...fechados].sort().reverse().map((m) => /* @__PURE__ */ React12.createElement("div", { key: m, className: "flex items-center justify-between py-1.5 text-sm", style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React12.createElement("span", { style: { color: "var(--ink)" } }, fmtMes(m)), /* @__PURE__ */ React12.createElement("button", { onClick: () => onReabrir(m), className: "text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React12.createElement(Unlock, { size: 12 }), " Reabrir")))));
}
function Trilha({ trilha }) {
  const recentes = [...trilha].slice(-15).reverse();
  if (recentes.length === 0) return null;
  return /* @__PURE__ */ React12.createElement(Card, { className: "mt-6" }, /* @__PURE__ */ React12.createElement("div", { className: "font-medium mb-3", style: { color: "var(--ink)" } }, "Trilha \u2014 o que aconteceu por \xFAltimo"), /* @__PURE__ */ React12.createElement("div", { className: "space-y-1.5 text-xs" }, recentes.map((t, i) => /* @__PURE__ */ React12.createElement("div", { key: i, style: { color: "var(--muted)" } }, /* @__PURE__ */ React12.createElement("span", { className: "font-mono uppercase", style: { color: "var(--accent)" } }, t.tipo), " \u2014 ", t.descricao))));
}
function Revisao({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, trilha, onFechar, onReabrir }) {
  const checks = useMemo6(() => mesaDeRevisao(contas, lancamentos, lancamentoLinhas), [contas, lancamentos, lancamentoLinhas]);
  const mesaPassa = podeFecharPeriodo(checks);
  const achados = useMemo6(
    () => encontrarAchados(contas, lancamentos, lancamentoLinhas, periodosFechados, { arquetipo: negocio?.arquetipo, hoje: hojeISO3() }),
    [contas, lancamentos, lancamentoLinhas, periodosFechados, negocio?.arquetipo]
  );
  return /* @__PURE__ */ React12.createElement("div", null, /* @__PURE__ */ React12.createElement(MesaChecks, { checks }), /* @__PURE__ */ React12.createElement(Achados, { achados }), /* @__PURE__ */ React12.createElement(Fechamento, { lancamentos, periodosFechados, mesaPassa, onFechar, onReabrir }), /* @__PURE__ */ React12.createElement(Trilha, { trilha }));
}

// src/telas/RetratoDoMes.jsx
import React13, { useState as useState10, useMemo as useMemo7, useEffect as useEffect6 } from "react";

// src/dominio/cartas.mjs
function cartaPendenteDeAvaliacao(cartas, mesAtual) {
  const candidatas = (cartas || []).filter((c) => c.mes < mesAtual && (c.texto || "").trim() && (c.seguida === null || c.seguida === void 0)).sort((a, b) => b.mes.localeCompare(a.mes));
  return candidatas[0] || null;
}

// src/dominio/fluxoProjetado.mjs
var DIAS_PADRAO = 60;
function addDias2(iso, n) {
  const d = /* @__PURE__ */ new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function saldoDaConta(linhas, contaId) {
  let s = 0;
  for (const l of linhas) {
    if (l.contaId !== contaId) continue;
    s += l.tipo === "D" ? l.valor : -l.valor;
  }
  return s;
}
function ocorrenciasDe(recorrente, hoje, limite) {
  const dia = Math.min(Math.max(Number(recorrente.diaVencimento) || 1, 1), 28);
  const datas = [];
  const inicio = /* @__PURE__ */ new Date(hoje + "T12:00:00");
  for (let m = 0; m <= 3; m++) {
    const d = new Date(inicio.getFullYear(), inicio.getMonth() + m, dia, 12);
    const iso = d.toISOString().slice(0, 10);
    if (iso > hoje && iso <= limite) datas.push(iso);
  }
  return datas;
}
function fluxoProjetado({ lancamentos, lancamentoLinhas, recorrentes = [], recorrenteLinhas = [], hoje, dias = DIAS_PADRAO }) {
  const limite = addDias2(hoje, dias);
  const linhas = lancamentoLinhas || [];
  const saldoHoje = CONTAS_DINHEIRO.reduce((s, id) => s + saldoDaConta(linhas, id), 0);
  const baixadas = new Set(linhas.filter((l) => l.baixaDe).map((l) => l.baixaDe));
  const descricaoDe = new Map((lancamentos || []).map((l) => [l.id, l.descricao]));
  const eventos = [];
  for (const l of linhas) {
    if (!l.vencimento || l.vencimento <= hoje || l.vencimento > limite) continue;
    if (baixadas.has(l.id)) continue;
    const rotulo = l.descricao || descricaoDe.get(l.lancamentoId) || "";
    if (l.contaId === CONTA_A_RECEBER && l.tipo === "D") {
      eventos.push({ data: l.vencimento, descricao: rotulo || "A receber", valor: l.valor, tipo: "entra" });
    } else if (CONTAS_COMPROMISSO.includes(l.contaId) && l.tipo === "C") {
      eventos.push({ data: l.vencimento, descricao: rotulo || "A pagar", valor: -l.valor, tipo: "sai" });
    }
  }
  for (const rec of recorrentes) {
    if (!rec.ativa) continue;
    const pernas = recorrenteLinhas.filter((l) => l.recorrenteId === rec.id);
    const saida = pernas.filter((l) => CONTAS_DINHEIRO.includes(l.contaId) && l.tipo === "C").reduce((s, l) => s + l.valor, 0);
    if (!(saida > 0)) continue;
    for (const data of ocorrenciasDe(rec, hoje, limite)) {
      eventos.push({ data, descricao: rec.descricao, valor: -saida, tipo: "recorrente" });
    }
  }
  eventos.sort((a, b) => a.data.localeCompare(b.data) || a.valor - b.valor);
  const curva = [];
  let saldo = saldoHoje;
  let aperto = null;
  let menorSaldo = { data: hoje, saldo: saldoHoje };
  for (const ev of eventos) {
    saldo = Math.round((saldo + ev.valor) * 100) / 100;
    curva.push({ data: ev.data, saldo });
    if (saldo < menorSaldo.saldo) menorSaldo = { data: ev.data, saldo };
    if (saldo < 0 && !aperto) {
      aperto = { data: ev.data, saldo, faltam: Math.round(Math.abs(saldo) * 100) / 100 };
    }
  }
  const entram = eventos.filter((e) => e.valor > 0).reduce((s, e) => s + e.valor, 0);
  const saem = eventos.filter((e) => e.valor < 0).reduce((s, e) => s - e.valor, 0);
  return { saldoHoje, eventos, curva, aperto, menorSaldo, entram, saem };
}
function aviseSobreOCaixa(fluxo) {
  if (fluxo.aperto) {
    return {
      gravidade: "aperto",
      frase: `No dia ${fmtDia(fluxo.aperto.data)} o caixa fica negativo em ${fmtBRL(fluxo.aperto.faltam)} \u2014 \xE9 o dia em que o dinheiro acaba se nada mudar.`,
      oQueFazer: "Antecipar recebimento, adiar um pagamento, ou segurar a retirada at\xE9 l\xE1."
    };
  }
  if (fluxo.saem > 0 && fluxo.menorSaldo.saldo < fluxo.saem * 0.1) {
    return {
      gravidade: "apertado",
      frase: `O caixa chega a ${fmtBRL(fluxo.menorSaldo.saldo)} no dia ${fmtDia(fluxo.menorSaldo.data)} \u2014 n\xE3o fica negativo, mas qualquer imprevisto vira aperto.`,
      oQueFazer: "Vale evitar compra grande at\xE9 depois dessa data."
    };
  }
  return null;
}
function fmtBRL(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
function fmtDia(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// src/dominio/evitados.mjs
function totalEvitado(evitados) {
  return Math.round((evitados || []).reduce((s, e) => s + (e.valorEstimado || 0), 0) * 100) / 100;
}
function evitadosDoMes(evitados, mes) {
  return (evitados || []).filter((e) => e.mes === mes);
}

// src/telas/RetratoDoMes.jsx
var fmt10 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtMes2 = (m) => {
  const [ano, mes] = m.split("-");
  return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
var hojeISO4 = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function OQueVemPorAi({ lancamentos, lancamentoLinhas, recorrentes, recorrenteLinhas }) {
  const fluxo = useMemo7(
    () => fluxoProjetado({
      lancamentos,
      lancamentoLinhas,
      recorrentes: recorrentes || [],
      recorrenteLinhas: recorrenteLinhas || [],
      hoje: hojeISO4(),
      dias: 60
    }),
    [lancamentos, lancamentoLinhas, recorrentes, recorrenteLinhas]
  );
  const aviso = useMemo7(() => aviseSobreOCaixa(fluxo), [fluxo]);
  if (!fluxo.eventos.length) return null;
  const corAviso = aviso?.gravidade === "aperto" ? "var(--debit)" : "var(--accent)";
  return /* @__PURE__ */ React13.createElement(Card, { className: "mb-4" }, /* @__PURE__ */ React13.createElement("div", { className: "text-xs uppercase tracking-wide mb-2", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "O que vem por a\xED \xB7 pr\xF3ximos 60 dias"), aviso ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement("div", { className: "text-sm font-medium mb-1", style: { color: corAviso, lineHeight: 1.5 } }, aviso.frase), /* @__PURE__ */ React13.createElement("div", { className: "text-xs mb-3", style: { color: "var(--muted)" } }, aviso.oQueFazer)) : /* @__PURE__ */ React13.createElement("div", { className: "text-sm mb-3", style: { color: "var(--ink)" } }, "O caixa se mant\xE9m positivo no per\xEDodo \u2014 o menor ponto \xE9 ", fmt10(fluxo.menorSaldo.saldo), "."), /* @__PURE__ */ React13.createElement("div", { className: "text-xs space-y-0.5", style: { color: "var(--muted)" } }, /* @__PURE__ */ React13.createElement("div", null, fmt10(fluxo.saldoHoje), " em caixa e banco hoje"), fluxo.entram > 0 && /* @__PURE__ */ React13.createElement("div", null, "+ ", fmt10(fluxo.entram), " a receber com vencimento no per\xEDodo"), fluxo.saem > 0 && /* @__PURE__ */ React13.createElement("div", null, "\u2212 ", fmt10(fluxo.saem), " a pagar e contas fixas no per\xEDodo")), /* @__PURE__ */ React13.createElement("div", { className: "text-[11px] mt-3", style: { color: "var(--muted)" } }, "S\xF3 entra o que j\xE1 est\xE1 prometido \u2014 venda futura n\xE3o registrada n\xE3o \xE9 contada, de prop\xF3sito."));
}
function CartaDeRecomendacoes({ mes, cartas, onSalvar, onAvaliarSeguida, metaDoCliente }) {
  const cartaDoMes = cartas.find((c) => c.mes === mes);
  const [texto, setTexto] = useState10(cartaDoMes?.texto || "");
  const [confirmado, setConfirmado] = useState10(false);
  useEffect6(() => {
    setTexto(cartaDoMes?.texto || "");
  }, [mes]);
  const pendente = useMemo7(() => cartaPendenteDeAvaliacao(cartas, mes), [cartas, mes]);
  const salvar = () => {
    onSalvar(mes, texto.trim());
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2e3);
  };
  return /* @__PURE__ */ React13.createElement(Card, { className: "mb-4" }, /* @__PURE__ */ React13.createElement("div", { className: "text-xs uppercase tracking-wide mb-2", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "Carta de recomenda\xE7\xF5es"), pendente && /* @__PURE__ */ React13.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-3", style: { background: "var(--accent-soft)", color: "var(--accent)" } }, /* @__PURE__ */ React13.createElement("div", { className: "mb-2" }, "A recomenda\xE7\xE3o de ", fmtMes2(pendente.mes), " foi seguida? ", /* @__PURE__ */ React13.createElement("em", null, '"', pendente.texto, '"')), /* @__PURE__ */ React13.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React13.createElement("button", { onClick: () => onAvaliarSeguida(pendente.mes, true), className: "text-xs px-2 py-1 rounded transition-opacity hover:opacity-70", style: { background: "var(--credit-soft)", color: "var(--credit)" } }, "Sim"), /* @__PURE__ */ React13.createElement("button", { onClick: () => onAvaliarSeguida(pendente.mes, false), className: "text-xs px-2 py-1 rounded transition-opacity hover:opacity-70", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, "N\xE3o"))), metaDoCliente && /* @__PURE__ */ React13.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-3", style: { background: "var(--rule-faint)", color: "var(--muted)", lineHeight: 1.6 } }, "A meta que ele contou l\xE1 no in\xEDcio: ", /* @__PURE__ */ React13.createElement("em", null, '"', metaDoCliente, '"'), " \u2014 vale olhar se a recomenda\xE7\xE3o deste m\xEAs aproxima ou afasta disso."), /* @__PURE__ */ React13.createElement(
    "textarea",
    {
      value: texto,
      onChange: (e) => setTexto(e.target.value),
      placeholder: "O que voc\xEA viu este m\xEAs, e o que ele deveria fazer\u2026",
      rows: 3,
      className: "w-full rounded-md border px-3 py-2 text-sm mb-2",
      style: { borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }
    }
  ), /* @__PURE__ */ React13.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React13.createElement(Button, { small: true, onClick: salvar }, "Salvar carta"), confirmado && /* @__PURE__ */ React13.createElement("span", { className: "text-xs", style: { color: "var(--credit)" } }, "Salvo.")));
}
function OQueEvitamos({ mes, evitados, onAdicionar }) {
  const [descricao, setDescricao] = useState10("");
  const [valor, setValor] = useState10("");
  const [confirmado, setConfirmado] = useState10(false);
  const doMes = useMemo7(() => evitadosDoMes(evitados, mes), [evitados, mes]);
  const total = useMemo7(() => totalEvitado(evitados), [evitados]);
  const adicionar = () => {
    if (!descricao.trim()) return;
    const v = parseFloat(String(valor).replace(",", "."));
    onAdicionar(mes, descricao.trim(), Number.isFinite(v) && v > 0 ? v : null);
    setDescricao("");
    setValor("");
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2e3);
  };
  return /* @__PURE__ */ React13.createElement(Card, { className: "mb-4" }, /* @__PURE__ */ React13.createElement("div", { className: "flex items-center justify-between mb-2 flex-wrap gap-1" }, /* @__PURE__ */ React13.createElement("div", { className: "text-xs uppercase tracking-wide", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "O que evitamos"), total > 0 && /* @__PURE__ */ React13.createElement("div", { className: "text-xs", style: { color: "var(--credit)" } }, fmt10(total), " evitado desde o in\xEDcio")), doMes.length > 0 && /* @__PURE__ */ React13.createElement("div", { className: "space-y-1.5 mb-3" }, doMes.map((e) => /* @__PURE__ */ React13.createElement("div", { key: e.id, className: "text-sm flex items-start justify-between gap-2", style: { color: "var(--ink)" } }, /* @__PURE__ */ React13.createElement("span", null, e.descricao), e.valorEstimado > 0 && /* @__PURE__ */ React13.createElement("span", { className: "shrink-0", style: { color: "var(--credit)" } }, fmt10(e.valorEstimado))))), /* @__PURE__ */ React13.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React13.createElement(Input, { placeholder: "ex.: evitou comprar equipamento sem precisar", value: descricao, onChange: (e) => setDescricao(e.target.value), className: "flex-[2]" }), /* @__PURE__ */ React13.createElement(Input, { money: true, placeholder: "valor (opcional)", value: valor, onChange: (e) => setValor(e.target.value), className: "flex-1" })), /* @__PURE__ */ React13.createElement("div", { className: "flex items-center gap-3 mt-2" }, /* @__PURE__ */ React13.createElement(Button, { small: true, onClick: adicionar, disabled: !descricao.trim() }, "Registrar"), confirmado && /* @__PURE__ */ React13.createElement("span", { className: "text-xs", style: { color: "var(--credit)" } }, "Registrado.")), /* @__PURE__ */ React13.createElement("div", { className: "text-[11px] mt-2", style: { color: "var(--muted)" } }, "A transforma\xE7\xE3o que impede um erro n\xE3o deixa rastro sozinha \u2014 registrar aqui \xE9 o que permite mostrar isso daqui a um ano."));
}
function AvisoAprofundamento({ quantidade, onAbrir }) {
  if (!quantidade) return null;
  return /* @__PURE__ */ React13.createElement(
    "button",
    {
      onClick: onAbrir,
      className: "w-full text-left text-xs rounded-md px-3 py-2 mb-4 transition-opacity hover:opacity-80",
      style: { background: "var(--accent-soft)", color: "var(--ink)" }
    },
    "Faltam ",
    quantidade,
    " pergunta",
    quantidade > 1 ? "s" : "",
    " de aprofundamento \u2014 vale perguntar nesta conversa. ",
    /* @__PURE__ */ React13.createElement("span", { style: { color: "var(--accent)" } }, "Ver no Roteiro \u2192")
  );
}
function RetratoDoMes({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, recorrentes, recorrenteLinhas, evitados, onSalvarCarta, onAvaliarCartaSeguida, onAdicionarEvitado, metaDoCliente, pendentesDeAprofundamento: pendentesDeAprofundamento2, onAbrirRoteiro }) {
  const mesesComMovimento = useMemo7(() => {
    const meses = new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean));
    return [...meses].sort().reverse();
  }, [lancamentos]);
  const mesesFechados = useMemo7(
    () => new Set((periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4))),
    [periodosFechados]
  );
  const mesPadrao = [...mesesFechados].sort().reverse()[0] || mesesComMovimento[0] || hojeISO4().slice(0, 7);
  const [mes, setMes] = useState10(mesPadrao);
  const opcoesMes = useMemo7(() => {
    const todos = /* @__PURE__ */ new Set([...mesesComMovimento, ...mesesFechados, mes]);
    return [...todos].sort().reverse().map((m) => ({ value: m, label: `${fmtMes2(m)}${mesesFechados.has(m) ? " \xB7 fechado" : ""}` }));
  }, [mesesComMovimento, mesesFechados, mes]);
  const r = useMemo7(() => resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes), [contas, lancamentos, lancamentoLinhas, mes]);
  const disp = useMemo7(
    () => quantoPodeTirar({ contas, lancamentos, lancamentoLinhas, periodosFechados, hoje: hojeISO4() }),
    [contas, lancamentos, lancamentoLinhas, periodosFechados]
  );
  const diferenca = Math.round((r.resultado - r.variacaoCaixaBanco) * 100) / 100;
  const sobrouPositivo = r.resultado >= 0;
  return /* @__PURE__ */ React13.createElement("div", { className: "max-w-lg" }, /* @__PURE__ */ React13.createElement("div", { className: "mb-4 max-w-xs" }, /* @__PURE__ */ React13.createElement(Select, { value: mes, onChange: setMes, options: opcoesMes })), /* @__PURE__ */ React13.createElement(AvisoAprofundamento, { quantidade: pendentesDeAprofundamento2, onAbrir: onAbrirRoteiro }), /* @__PURE__ */ React13.createElement(Card, { className: "mb-4", style: { background: "linear-gradient(160deg, var(--surface), var(--paper))" } }, /* @__PURE__ */ React13.createElement("div", { className: "text-xs uppercase tracking-wide mb-1", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, negocio.apelido || negocio.nome, " \xB7 ", fmtMes2(mes)), /* @__PURE__ */ React13.createElement("div", { className: "text-3xl font-bold mb-3", style: { fontFamily: "var(--font-display)", color: sobrouPositivo ? "var(--credit)" : "var(--debit)" } }, fmt10(r.resultado)), /* @__PURE__ */ React13.createElement("div", { className: "text-sm mb-1", style: { color: "var(--ink)" } }, "Entrou ", fmt10(r.receita), ", saiu ", fmt10(r.despesa), ", ", sobrouPositivo ? "sobrou" : "faltou", " ", fmt10(Math.abs(r.resultado)), "."), Math.abs(diferenca) >= 0.01 && /* @__PURE__ */ React13.createElement("div", { className: "text-xs mt-2", style: { color: "var(--muted)" } }, "O caixa e o banco se mexeram ", fmt10(r.variacaoCaixaBanco), " \u2014 a diferen\xE7a de ", fmt10(Math.abs(diferenca)), " ", "virou estoque, conta a receber, pagamento de d\xEDvida ou retirada. \xC9 o Balan\xE7o que mostra onde exatamente.")), /* @__PURE__ */ React13.createElement(Card, { className: "mb-4" }, /* @__PURE__ */ React13.createElement("div", { className: "text-xs uppercase tracking-wide mb-2", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "Quanto voc\xEA pode tirar"), /* @__PURE__ */ React13.createElement("div", { className: "text-2xl font-bold mb-2", style: { fontFamily: "var(--font-display)", color: "var(--accent)" } }, fmt10(disp.podeTirar)), /* @__PURE__ */ React13.createElement("div", { className: "text-xs space-y-0.5", style: { color: "var(--muted)" } }, /* @__PURE__ */ React13.createElement("div", null, fmt10(disp.disponivelHoje), " dispon\xEDvel hoje em caixa e banco"), disp.aReceber > 0 && /* @__PURE__ */ React13.createElement("div", null, "+ ", fmt10(disp.aReceber), " a receber nos pr\xF3ximos 30 dias"), disp.compromissos > 0 && /* @__PURE__ */ React13.createElement("div", null, "\u2212 ", fmt10(disp.compromissos), " em compromissos que vencem nos pr\xF3ximos 30 dias"), disp.reserva > 0 && /* @__PURE__ */ React13.createElement("div", null, "\u2212 ", fmt10(disp.reserva), " de reserva m\xEDnima")), /* @__PURE__ */ React13.createElement("div", { className: "text-[11px] mt-3", style: { color: "var(--muted)" } }, "\xC9 uma recomenda\xE7\xE3o com base no que foi lan\xE7ado, n\xE3o uma garantia.")), /* @__PURE__ */ React13.createElement(
    OQueVemPorAi,
    {
      lancamentos,
      lancamentoLinhas,
      recorrentes,
      recorrenteLinhas
    }
  ), /* @__PURE__ */ React13.createElement(CartaDeRecomendacoes, { mes, cartas, onSalvar: onSalvarCarta, onAvaliarSeguida: onAvaliarCartaSeguida, metaDoCliente }), /* @__PURE__ */ React13.createElement(OQueEvitamos, { mes, evitados, onAdicionar: onAdicionarEvitado }), /* @__PURE__ */ React13.createElement("div", { className: "text-[10px] text-center", style: { color: "var(--muted)" } }, "Relat\xF3rio gerencial \u2014 n\xE3o \xE9 pe\xE7a cont\xE1bil oficial assinada."));
}

// src/telas/PlanoContas.jsx
import React14, { useState as useState11, useMemo as useMemo8 } from "react";
import { Plus as Plus4, X as X5 } from "lucide-react";
var uid4 = () => Math.random().toString(36).slice(2, 10);
var TIPO_LABEL3 = { ativo: "Ativo", passivo: "Passivo", pl: "Patrim\xF4nio L\xEDquido", receita: "Receita", despesa: "Despesa" };
var slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
function FormularioNovaConta({ contas, onAdicionar, onFechar }) {
  const [codigo, setCodigo] = useState11("");
  const [nome, setNome] = useState11("");
  const [tipo, setTipo] = useState11("despesa");
  const [erro, setErro] = useState11("");
  const salvar = () => {
    if (!codigo.trim() || !nome.trim()) {
      setErro("C\xF3digo e nome s\xE3o obrigat\xF3rios.");
      return;
    }
    const id = slug(nome) + "_" + uid4().slice(0, 4);
    if (contas.some((c) => c.codigo === codigo.trim())) {
      setErro("J\xE1 existe uma conta com esse c\xF3digo.");
      return;
    }
    onAdicionar({ id, codigo: codigo.trim(), nome: nome.trim(), tipo, subtipo: null, ordem: contas.filter((c) => c.tipo === tipo).length + 1, ativa: true });
    setCodigo("");
    setNome("");
    onFechar();
  };
  return /* @__PURE__ */ React14.createElement(Card, { className: "mb-4" }, /* @__PURE__ */ React14.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React14.createElement("div", { className: "font-medium", style: { color: "var(--ink)" } }, "Nova conta"), /* @__PURE__ */ React14.createElement("button", { onClick: onFechar, style: { color: "var(--muted)" }, "aria-label": "Fechar" }, /* @__PURE__ */ React14.createElement(X5, { size: 15 }))), /* @__PURE__ */ React14.createElement("div", { className: "grid grid-cols-3 gap-2 mb-3" }, /* @__PURE__ */ React14.createElement("div", null, /* @__PURE__ */ React14.createElement(Label, null, "C\xF3digo"), /* @__PURE__ */ React14.createElement(Input, { value: codigo, onChange: (e) => setCodigo(e.target.value), placeholder: "ex.: 5114" })), /* @__PURE__ */ React14.createElement("div", { className: "col-span-2" }, /* @__PURE__ */ React14.createElement(Label, null, "Nome"), /* @__PURE__ */ React14.createElement(Input, { value: nome, onChange: (e) => setNome(e.target.value), placeholder: "ex.: Manuten\xE7\xE3o de equipamento" }))), /* @__PURE__ */ React14.createElement("div", { className: "mb-3 max-w-xs" }, /* @__PURE__ */ React14.createElement(Label, null, "Tipo"), /* @__PURE__ */ React14.createElement(Select, { value: tipo, onChange: setTipo, options: Object.entries(TIPO_LABEL3).map(([value, label]) => ({ value, label })) })), erro && /* @__PURE__ */ React14.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-3", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React14.createElement(Button, { onClick: salvar }, "Adicionar"));
}
function PlanoContas({ contas, onAdicionar, onAlternarAtiva }) {
  const [mostrarForm, setMostrarForm] = useState11(false);
  const porTipo = useMemo8(() => {
    const grupos = {};
    for (const c of [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo))) {
      (grupos[c.tipo] = grupos[c.tipo] || []).push(c);
    }
    return grupos;
  }, [contas]);
  return /* @__PURE__ */ React14.createElement("div", null, /* @__PURE__ */ React14.createElement("div", { className: "flex justify-end mb-4" }, !mostrarForm && /* @__PURE__ */ React14.createElement(Button, { onClick: () => setMostrarForm(true) }, /* @__PURE__ */ React14.createElement(Plus4, { size: 14 }), " Nova conta")), mostrarForm && /* @__PURE__ */ React14.createElement(FormularioNovaConta, { contas, onAdicionar, onFechar: () => setMostrarForm(false) }), Object.entries(TIPO_LABEL3).map(([tipo, label]) => (porTipo[tipo] || []).length > 0 && /* @__PURE__ */ React14.createElement("div", { key: tipo, className: "mb-5" }, /* @__PURE__ */ React14.createElement("div", { className: "text-xs uppercase tracking-wide mb-2", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, label), /* @__PURE__ */ React14.createElement(Card, { pad: "apertado" }, porTipo[tipo].map((c) => /* @__PURE__ */ React14.createElement("div", { key: c.id, className: "flex items-center justify-between py-1.5", style: { borderBottom: "1px solid var(--rule-faint)", opacity: c.ativa ? 1 : 0.45 } }, /* @__PURE__ */ React14.createElement("div", { className: "text-sm" }, /* @__PURE__ */ React14.createElement("span", { className: "font-mono text-xs mr-2", style: { color: "var(--muted)" } }, c.codigo), /* @__PURE__ */ React14.createElement("span", { style: { color: "var(--ink)" } }, c.nome)), /* @__PURE__ */ React14.createElement("button", { onClick: () => onAlternarAtiva(c.id, !c.ativa), className: "text-xs transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, c.ativa ? "desativar" : "ativar")))))));
}

// src/telas/ConfigNegocio.jsx
import React15, { useState as useState12, useEffect as useEffect7 } from "react";
function ConfigNegocio({ negocioId, onAtualizado }) {
  const [carregando, setCarregando] = useState12(true);
  const [erro, setErro] = useState12("");
  const [salvando, setSalvando] = useState12(false);
  const [confirmado, setConfirmado] = useState12(false);
  const [campo, setCampo] = useState12(null);
  useEffect7(() => {
    let vivo = true;
    supabase.from("negocios").select("*").eq("id", negocioId).single().then(({ data, error }) => {
      if (!vivo) return;
      if (error) {
        setErro(error.message);
        return;
      }
      setCampo({
        nome: data.nome || "",
        apelido: data.apelido || "",
        cnpj: data.cnpj || "",
        atividade: data.atividade || "",
        whatsapp: data.whatsapp || "",
        tem_funcionario: data.tem_funcionario ? "sim" : "nao",
        dinheiro_misturado: data.dinheiro_misturado ? "sim" : "nao",
        situacao: data.situacao || "ativo"
      });
      setCarregando(false);
    });
    return () => {
      vivo = false;
    };
  }, [negocioId]);
  const set = (chave, valor) => setCampo((c) => ({ ...c, [chave]: valor }));
  const salvar = async () => {
    setSalvando(true);
    setErro("");
    const patch = {
      nome: campo.nome.trim(),
      apelido: campo.apelido.trim() || null,
      cnpj: campo.cnpj.trim() || null,
      atividade: campo.atividade.trim() || null,
      whatsapp: campo.whatsapp.trim() || null,
      tem_funcionario: campo.tem_funcionario === "sim",
      dinheiro_misturado: campo.dinheiro_misturado === "sim",
      situacao: campo.situacao
    };
    const { error } = await supabase.from("negocios").update(patch).eq("id", negocioId);
    setSalvando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2e3);
    onAtualizado?.(patch);
  };
  if (carregando) return /* @__PURE__ */ React15.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Carregando\u2026");
  return /* @__PURE__ */ React15.createElement(Card, { className: "max-w-lg" }, /* @__PURE__ */ React15.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "Nome"), /* @__PURE__ */ React15.createElement(Input, { value: campo.nome, onChange: (e) => set("nome", e.target.value) })), /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "Apelido"), /* @__PURE__ */ React15.createElement(Input, { value: campo.apelido, onChange: (e) => set("apelido", e.target.value) })), /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "CNPJ"), /* @__PURE__ */ React15.createElement(Input, { value: campo.cnpj, onChange: (e) => set("cnpj", e.target.value), placeholder: "opcional" })), /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "Atividade principal"), /* @__PURE__ */ React15.createElement(Input, { value: campo.atividade, onChange: (e) => set("atividade", e.target.value) })), /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "WhatsApp"), /* @__PURE__ */ React15.createElement(Input, { value: campo.whatsapp, onChange: (e) => set("whatsapp", e.target.value) })), /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "Tem funcion\xE1rio?"), /* @__PURE__ */ React15.createElement(Select, { value: campo.tem_funcionario, onChange: (v) => set("tem_funcionario", v), options: [{ value: "sim", label: "Sim" }, { value: "nao", label: "N\xE3o" }] })), /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "Usa o mesmo dinheiro para o neg\xF3cio e para as coisas dele?"), /* @__PURE__ */ React15.createElement(Select, { value: campo.dinheiro_misturado, onChange: (v) => set("dinheiro_misturado", v), options: [{ value: "sim", label: "Sim" }, { value: "nao", label: "N\xE3o" }] }), /* @__PURE__ */ React15.createElement("div", { className: "text-[11px] mt-1.5", style: { color: "var(--muted)" } }, 'Se sim, gasto pessoal marcado na Caixa de Entrada vira retirada de verdade \u2014 n\xE3o some do livro (docs/DECISOES.md C5). Corrigido depois que a resposta do onboarding n\xE3o estava gravando aqui (achado em teste, 15/ago) \u2014 se o cliente j\xE1 respondeu isso antes e o bot\xE3o da Caixa de Entrada ainda mostra "\xC9 pessoal, ignorar", confirme aqui.')), /* @__PURE__ */ React15.createElement("div", null, /* @__PURE__ */ React15.createElement(Label, null, "Situa\xE7\xE3o"), /* @__PURE__ */ React15.createElement(Select, { value: campo.situacao, onChange: (v) => set("situacao", v), options: [{ value: "ativo", label: "Ativo" }, { value: "encerrado", label: "Encerrado" }] })), erro && /* @__PURE__ */ React15.createElement("div", { className: "text-xs rounded-md px-3 py-2", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React15.createElement("div", { className: "flex items-center gap-3 pt-1" }, /* @__PURE__ */ React15.createElement(Button, { onClick: salvar, disabled: salvando }, salvando ? "Salvando\u2026" : "Salvar"), confirmado && /* @__PURE__ */ React15.createElement("span", { className: "text-xs", style: { color: "var(--credit)" } }, "Salvo."))));
}

// src/telas/Recorrentes.jsx
import React16, { useState as useState13, useMemo as useMemo9 } from "react";
import { Plus as Plus5, Trash2 as Trash24, RefreshCw } from "lucide-react";
var uid5 = () => Math.random().toString(36).slice(2, 10);
var fmt11 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var linhaVazia2 = () => ({ chave: uid5(), contaId: "", tipo: "D", valor: "" });
function FormularioNovoRecorrente({ opcoesContas, onAdicionar, onFechar }) {
  const [descricao, setDescricao] = useState13("");
  const [linhas, setLinhas] = useState13([linhaVazia2(), linhaVazia2()]);
  const editarLinha = (chave, campo, valor) => setLinhas((ls) => ls.map((l) => l.chave === chave ? { ...l, [campo]: valor } : l));
  const removerLinha = (chave) => setLinhas((ls) => ls.filter((l) => l.chave !== chave));
  const adicionarLinha = () => setLinhas((ls) => [...ls, linhaVazia2()]);
  const numero = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + numero(l.valor), 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + numero(l.valor), 0);
  const diferenca = Math.round((somaD - somaC) * 100) / 100;
  const linhasValidas = linhas.filter((l) => l.contaId && numero(l.valor) > 0);
  const podeGravar = descricao.trim() && linhasValidas.length >= 2 && diferenca === 0 && somaD > 0;
  const salvar = () => {
    if (!podeGravar) return;
    const recorrenteId = uid5();
    onAdicionar({
      recorrente: { id: recorrenteId, descricao: descricao.trim(), ativa: true },
      linhas: linhasValidas.map((l) => ({ id: uid5(), recorrenteId, contaId: l.contaId, tipo: l.tipo, valor: numero(l.valor) }))
    });
    onFechar();
  };
  return /* @__PURE__ */ React16.createElement(Card, { className: "mb-4" }, /* @__PURE__ */ React16.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React16.createElement(Label, null, "Descri\xE7\xE3o"), /* @__PURE__ */ React16.createElement(Input, { value: descricao, onChange: (e) => setDescricao(e.target.value), placeholder: "ex.: Aluguel" })), /* @__PURE__ */ React16.createElement(Label, null, "Linhas"), linhas.map((l) => /* @__PURE__ */ React16.createElement("div", { key: l.chave, className: "flex gap-2 mb-2 items-center" }, /* @__PURE__ */ React16.createElement(Select, { value: l.tipo, onChange: (v) => editarLinha(l.chave, "tipo", v), options: [{ value: "D", label: "D" }, { value: "C", label: "C" }] }), /* @__PURE__ */ React16.createElement("div", { className: "flex-[2]" }, /* @__PURE__ */ React16.createElement(Select, { value: l.contaId, onChange: (v) => editarLinha(l.chave, "contaId", v), placeholder: "conta", options: opcoesContas })), /* @__PURE__ */ React16.createElement(Input, { money: true, placeholder: "valor", value: l.valor, onChange: (e) => editarLinha(l.chave, "valor", e.target.value), className: "flex-1" }), /* @__PURE__ */ React16.createElement("button", { type: "button", onClick: () => removerLinha(l.chave), disabled: linhas.length <= 2, className: "transition-opacity hover:opacity-70 disabled:opacity-30 shrink-0", style: { color: "var(--debit)" }, "aria-label": "Remover" }, /* @__PURE__ */ React16.createElement(Trash24, { size: 15 })))), /* @__PURE__ */ React16.createElement("button", { type: "button", onClick: adicionarLinha, className: "text-xs inline-flex items-center gap-1 mt-1 mb-4 transition-opacity hover:opacity-70", style: { color: "var(--accent)" } }, /* @__PURE__ */ React16.createElement(Plus5, { size: 13 }), " adicionar linha"), /* @__PURE__ */ React16.createElement("div", { className: "flex items-center justify-between mb-4 text-xs", style: { color: "var(--muted)" } }, /* @__PURE__ */ React16.createElement("span", null, "D\xE9bitos: ", fmt11(somaD), " \xB7 Cr\xE9ditos: ", fmt11(somaC)), diferenca !== 0 && /* @__PURE__ */ React16.createElement(AlertLine, null, "Diferen\xE7a de ", fmt11(Math.abs(diferenca)), " \u2014 precisa fechar antes de gravar")), /* @__PURE__ */ React16.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React16.createElement(Button, { onClick: salvar, disabled: !podeGravar }, "Salvar recorrente"), /* @__PURE__ */ React16.createElement(Button, { variant: "ghost", onClick: onFechar }, "Cancelar")));
}
function Recorrentes({ contas, recorrentes, recorrenteLinhas, onAdicionar, onAlternarAtiva, onGerar }) {
  const [mostrarForm, setMostrarForm] = useState13(false);
  const [resultado, setResultado] = useState13(null);
  const contasPorId = useMemo9(() => new Map(contas.map((c) => [c.id, c])), [contas]);
  const opcoesContas = useMemo9(
    () => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)).map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` })),
    [contas]
  );
  const linhasDe = (recorrenteId) => recorrenteLinhas.filter((l) => l.recorrenteId === recorrenteId);
  const gerar = () => {
    const { gerados } = onGerar();
    setResultado(gerados);
    setTimeout(() => setResultado(null), 4e3);
  };
  return /* @__PURE__ */ React16.createElement("div", null, /* @__PURE__ */ React16.createElement("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2" }, /* @__PURE__ */ React16.createElement(Button, { onClick: gerar, disabled: !recorrentes.some((r) => r.ativa) }, /* @__PURE__ */ React16.createElement(RefreshCw, { size: 14 }), " Gerar lan\xE7amentos do m\xEAs"), !mostrarForm && /* @__PURE__ */ React16.createElement(Button, { variant: "ghost", onClick: () => setMostrarForm(true) }, /* @__PURE__ */ React16.createElement(Plus5, { size: 14 }), " Novo recorrente")), resultado !== null && /* @__PURE__ */ React16.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--credit-soft)", color: "var(--credit)" } }, resultado > 0 ? `${resultado} lan\xE7amento(s) gerado(s) \u2014 confira no Di\xE1rio.` : "Nada para gerar: j\xE1 foi feito este m\xEAs, ou n\xE3o h\xE1 recorrente ativa."), mostrarForm && /* @__PURE__ */ React16.createElement(FormularioNovoRecorrente, { opcoesContas, onAdicionar, onFechar: () => setMostrarForm(false) }), recorrentes.length === 0 && !mostrarForm && /* @__PURE__ */ React16.createElement(Card, { className: "text-center py-10" }, /* @__PURE__ */ React16.createElement("div", { className: "text-sm", style: { color: "var(--ink)" } }, "Nenhum recorrente cadastrado ainda."), /* @__PURE__ */ React16.createElement("div", { className: "text-xs mt-1", style: { color: "var(--muted)" } }, "Aluguel, internet, mensalidade \u2014 o que se repete todo m\xEAs.")), /* @__PURE__ */ React16.createElement("div", { className: "space-y-3" }, recorrentes.map((r) => /* @__PURE__ */ React16.createElement(Card, { key: r.id, pad: "apertado", style: { opacity: r.ativa ? 1 : 0.45 } }, /* @__PURE__ */ React16.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React16.createElement("span", { className: "text-sm font-medium", style: { color: "var(--ink)" } }, r.descricao), /* @__PURE__ */ React16.createElement("button", { onClick: () => onAlternarAtiva(r.id, !r.ativa), className: "text-xs transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, r.ativa ? "desativar" : "ativar")), linhasDe(r.id).map((l) => /* @__PURE__ */ React16.createElement("div", { key: l.id, className: "flex justify-between text-xs py-0.5", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, /* @__PURE__ */ React16.createElement("span", null, l.tipo, " \xB7 ", contasPorId.get(l.contaId)?.nome || l.contaId), /* @__PURE__ */ React16.createElement("span", null, fmt11(l.valor))))))));
}

// src/telas/Baixas.jsx
import React17, { useMemo as useMemo10, useState as useState14 } from "react";
import { CheckCircle2 as CheckCircle22, X as X6 } from "lucide-react";

// src/dominio/baixas.mjs
function itensEmAberto(lancamentoLinhas, contasAlvo, tipo) {
  const baixadas = new Set((lancamentoLinhas || []).filter((l) => l.baixaDe).map((l) => l.baixaDe));
  return (lancamentoLinhas || []).filter((l) => contasAlvo.includes(l.contaId) && l.tipo === tipo && !baixadas.has(l.id)).sort((a, b) => (a.vencimento || "9999-99").localeCompare(b.vencimento || "9999-99"));
}
function recebiveisEmAberto(lancamentoLinhas) {
  return itensEmAberto(lancamentoLinhas, [CONTA_A_RECEBER], "D");
}
function pagaveisEmAberto(lancamentoLinhas) {
  return itensEmAberto(lancamentoLinhas, CONTAS_COMPROMISSO, "C");
}
var uidPadrao3 = () => Math.random().toString(36).slice(2, 10);
function construirBaixa(linhaOriginal, contaTransitoId, data, gerarId = uidPadrao3) {
  if (!linhaOriginal) throw new Error("selecione um item em aberto para dar baixa");
  if (!contaTransitoId) throw new Error("escolha caixa ou banco");
  const ehReceber = linhaOriginal.tipo === "D";
  const idLancamento = gerarId();
  const descricaoBase = linhaOriginal.descricao ? `Baixa: ${linhaOriginal.descricao}` : "Baixa";
  return {
    lancamento: { id: idLancamento, data, dataCompetencia: data, descricao: descricaoBase, origem: "manual", documento: null },
    linhas: [
      { id: gerarId(), lancamentoId: idLancamento, contaId: contaTransitoId, tipo: ehReceber ? "D" : "C", valor: linhaOriginal.valor, descricao: null, vencimento: null, baixaDe: null },
      { id: gerarId(), lancamentoId: idLancamento, contaId: linhaOriginal.contaId, tipo: ehReceber ? "C" : "D", valor: linhaOriginal.valor, descricao: null, vencimento: null, baixaDe: linhaOriginal.id }
    ]
  };
}

// src/telas/Baixas.jsx
var fmt12 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData6 = (d) => d ? d.split("-").reverse().join("/") : "sem vencimento";
var hojeISO5 = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var OPCOES_TRANSITO = [{ value: "caixa", label: "Caixa" }, { value: "banco", label: "Banco" }];
function LinhaItem({ item, nomeConta, onDarBaixa }) {
  const [abrindo, setAbrindo] = useState14(false);
  const [data, setData] = useState14(hojeISO5());
  const [contaTransito, setContaTransito] = useState14("caixa");
  const confirmar = () => {
    onDarBaixa(item, contaTransito, data);
    setAbrindo(false);
  };
  return /* @__PURE__ */ React17.createElement("div", { className: "py-2", style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React17.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React17.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React17.createElement("div", { className: "text-sm truncate", style: { color: "var(--ink)" } }, item.descricao || nomeConta(item.contaId)), /* @__PURE__ */ React17.createElement("div", { className: "text-xs", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, fmtData6(item.vencimento))), /* @__PURE__ */ React17.createElement("div", { className: "flex items-center gap-2 shrink-0" }, /* @__PURE__ */ React17.createElement("span", { className: "text-sm tabular-nums", style: { color: "var(--ink)" } }, fmt12(item.valor)), !abrindo && /* @__PURE__ */ React17.createElement("button", { onClick: () => setAbrindo(true), className: "text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70", style: { color: "var(--accent)" } }, /* @__PURE__ */ React17.createElement(CheckCircle22, { size: 13 }), " Dar baixa"))), abrindo && /* @__PURE__ */ React17.createElement("div", { className: "flex items-end gap-2 mt-2 flex-wrap" }, /* @__PURE__ */ React17.createElement("div", null, /* @__PURE__ */ React17.createElement("div", { className: "text-[10px] uppercase mb-1", style: { color: "var(--muted)" } }, "Data"), /* @__PURE__ */ React17.createElement(Input, { type: "date", value: data, onChange: (e) => setData(e.target.value) })), /* @__PURE__ */ React17.createElement("div", { className: "w-28" }, /* @__PURE__ */ React17.createElement("div", { className: "text-[10px] uppercase mb-1", style: { color: "var(--muted)" } }, "Onde"), /* @__PURE__ */ React17.createElement(Select, { value: contaTransito, onChange: setContaTransito, options: OPCOES_TRANSITO })), /* @__PURE__ */ React17.createElement(Button, { small: true, onClick: confirmar }, "Confirmar"), /* @__PURE__ */ React17.createElement("button", { onClick: () => setAbrindo(false), className: "transition-opacity hover:opacity-70", style: { color: "var(--muted)" }, "aria-label": "Cancelar" }, /* @__PURE__ */ React17.createElement(X6, { size: 15 }))));
}
function Baixas({ contas, lancamentoLinhas, onDarBaixa }) {
  const nomeConta = useMemo10(() => {
    const mapa = new Map(contas.map((c) => [c.id, c.nome]));
    return (id) => mapa.get(id) || id;
  }, [contas]);
  const recebiveis = useMemo10(() => recebiveisEmAberto(lancamentoLinhas), [lancamentoLinhas]);
  const pagaveis = useMemo10(() => pagaveisEmAberto(lancamentoLinhas), [lancamentoLinhas]);
  return /* @__PURE__ */ React17.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React17.createElement(Card, null, /* @__PURE__ */ React17.createElement("div", { className: "font-medium mb-2", style: { color: "var(--ink)" } }, "A receber em aberto"), recebiveis.length === 0 ? /* @__PURE__ */ React17.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Nada em aberto \u2014 nenhuma venda a prazo esperando pagamento.") : recebiveis.map((item) => /* @__PURE__ */ React17.createElement(LinhaItem, { key: item.id, item, nomeConta, onDarBaixa }))), /* @__PURE__ */ React17.createElement(Card, null, /* @__PURE__ */ React17.createElement("div", { className: "font-medium mb-2", style: { color: "var(--ink)" } }, "A pagar em aberto"), pagaveis.length === 0 ? /* @__PURE__ */ React17.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Nada em aberto \u2014 nenhum compromisso esperando pagamento.") : pagaveis.map((item) => /* @__PURE__ */ React17.createElement(LinhaItem, { key: item.id, item, nomeConta, onDarBaixa }))), /* @__PURE__ */ React17.createElement("div", { className: "text-[11px]", style: { color: "var(--muted)" } }, 'Dar baixa aqui liga o recebimento/pagamento a este item espec\xEDfico \u2014 \xE9 o que deixa "quanto voc\xEA pode tirar" mais preciso (docs/08 \xA72). Baixa \xE9 sempre do valor cheio; pagamento parcial ainda n\xE3o tem uma tela pr\xF3pria.'));
}

// src/telas/Roteiro.jsx
import React18, { useMemo as useMemo11, useState as useState15 } from "react";
import { HelpCircle as HelpCircle4 } from "lucide-react";
var NOMES_BLOCO2 = {
  1: "Quem \xE9",
  2: "Como o dinheiro anda",
  4: "O ritmo do neg\xF3cio",
  5: "O que ele quer",
  6: "O combinado"
};
function PorQueImporta2({ texto }) {
  const [aberto, setAberto] = useState15(false);
  if (!texto) return null;
  return /* @__PURE__ */ React18.createElement("div", { className: "mt-1" }, /* @__PURE__ */ React18.createElement(
    "button",
    {
      type: "button",
      onClick: () => setAberto((a) => !a),
      className: "text-[10px] inline-flex items-center gap-1 transition-opacity hover:opacity-70",
      style: { color: "var(--muted)" }
    },
    /* @__PURE__ */ React18.createElement(HelpCircle4, { size: 11 }),
    " por que isso importa?"
  ), aberto && /* @__PURE__ */ React18.createElement("div", { className: "text-xs mt-1.5 rounded-md px-3 py-2 animate-[surgir_.2s_ease-out]", style: { background: "var(--accent-soft)", color: "var(--ink)" } }, texto));
}
function CampoRoteiro2({ pergunta, valor, onSalvar }) {
  const [rascunho, setRascunho] = useState15(valor ?? "");
  const [salvo, setSalvo] = useState15(false);
  const confirmar = (v) => {
    if (v === (valor ?? "")) return;
    onSalvar(v);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  };
  return /* @__PURE__ */ React18.createElement("div", { className: "mb-5" }, /* @__PURE__ */ React18.createElement("div", { className: "flex items-center gap-2 mb-1 flex-wrap" }, /* @__PURE__ */ React18.createElement(Label, null, pergunta.pergunta), !pergunta.essencial && /* @__PURE__ */ React18.createElement(
    "span",
    {
      className: "text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full",
      style: { background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" }
    },
    "aprofundamento"
  )), pergunta.tipo_resposta === "sim_nao" ? /* @__PURE__ */ React18.createElement(
    Select,
    {
      value: rascunho,
      onChange: (v) => {
        setRascunho(v);
        confirmar(v);
      },
      placeholder: "Escolha",
      options: [{ value: "sim", label: "Sim" }, { value: "nao", label: "N\xE3o" }]
    }
  ) : pergunta.tipo_resposta === "data" ? /* @__PURE__ */ React18.createElement(Input, { type: "date", value: rascunho, onChange: (e) => {
    setRascunho(e.target.value);
    confirmar(e.target.value);
  } }) : pergunta.tipo_resposta === "moeda" ? /* @__PURE__ */ React18.createElement(Input, { money: true, placeholder: "0,00", value: rascunho, onChange: (e) => setRascunho(e.target.value), onBlur: () => confirmar(rascunho) }) : pergunta.tipo_resposta === "texto_longo" ? /* @__PURE__ */ React18.createElement(
    "textarea",
    {
      rows: 3,
      value: rascunho,
      onChange: (e) => setRascunho(e.target.value),
      onBlur: () => confirmar(rascunho),
      className: "w-full rounded-md border px-3 py-2 text-sm transition-colors duration-150",
      style: { borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }
    }
  ) : /* @__PURE__ */ React18.createElement(Input, { value: rascunho, onChange: (e) => setRascunho(e.target.value), onBlur: () => confirmar(rascunho) }), salvo && /* @__PURE__ */ React18.createElement("div", { className: "text-[10px] mt-1", style: { color: "var(--credit)" } }, "salvo"), /* @__PURE__ */ React18.createElement(PorQueImporta2, { texto: pergunta.porque_importa }));
}
function Roteiro({ negocio, perguntas, respostasPorPerguntaId, onSalvarResposta }) {
  const opcoes = { tipo: negocio.tipo, arquetipo: negocio.arquetipo };
  const visiveis = useMemo11(
    () => perguntasPara(perguntas, opcoes).filter((p) => p.bloco !== 3).filter((p) => !p.destino?.startsWith("retrato.")).filter((p) => !p.destino?.startsWith("negocios.")),
    [perguntas, negocio.tipo, negocio.arquetipo]
  );
  const pendentes = useMemo11(
    () => pendentesDeAprofundamento(perguntas, respostasPorPerguntaId, opcoes),
    [perguntas, respostasPorPerguntaId, negocio.tipo, negocio.arquetipo]
  );
  const porBloco = useMemo11(() => {
    const grupos = {};
    for (const p of visiveis) (grupos[p.bloco] ||= []).push(p);
    return grupos;
  }, [visiveis]);
  if (!perguntas.length) return /* @__PURE__ */ React18.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Carregando\u2026");
  return /* @__PURE__ */ React18.createElement("div", null, /* @__PURE__ */ React18.createElement("div", { className: "text-xs mb-5", style: { color: "var(--muted)", lineHeight: 1.6 } }, "Todas as perguntas do roteiro deste cliente \u2014 inclusive as de aprofundamento, que n\xE3o precisaram ser respondidas na primeira conversa. Edit\xE1vel a qualquer momento; cada resposta salva sozinha ao sair do campo."), pendentes.length > 0 && /* @__PURE__ */ React18.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-5", style: { background: "var(--accent-soft)", color: "var(--ink)" } }, "Faltam ", pendentes.length, " pergunta", pendentes.length > 1 ? "s" : "", " de aprofundamento \u2014 a conversa do m\xEAs \xE9 a boa hora, n\xE3o uma mensagem avulsa."), Object.entries(porBloco).sort(([a], [b]) => a - b).map(([bloco, ps]) => /* @__PURE__ */ React18.createElement(Card, { key: bloco, className: "mb-4" }, /* @__PURE__ */ React18.createElement("div", { className: "text-xs font-medium mb-3", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, NOMES_BLOCO2[bloco] || `Bloco ${bloco}`), ps.map((p) => /* @__PURE__ */ React18.createElement(
    CampoRoteiro2,
    {
      key: p.id,
      pergunta: p,
      valor: respostasPorPerguntaId[p.id],
      onSalvar: (v) => onSalvarResposta(p.id, v)
    }
  )))));
}

// src/telas/Memoria.jsx
import React19, { useMemo as useMemo12 } from "react";
import { Sparkles, FileText } from "lucide-react";

// src/dominio/memoria.mjs
function mesesFechadosDe(periodosFechados) {
  return [...periodosFechados || []].filter((p) => p.startsWith("mes:")).map((p) => p.slice(4)).sort();
}
function medidoAgora(contas, lancamentos, lancamentoLinhas, periodosFechados) {
  const contasPorId = new Map(contas.map((c) => [c.id, c]));
  const saldoDe = (id) => {
    const c = contasPorId.get(id);
    return c ? saldoDeConta(c, lancamentoLinhas) : 0;
  };
  const caixaEBanco = CONTAS_DINHEIRO.reduce((s, id) => s + saldoDe(id), 0);
  const aReceber = saldoDe("clientes");
  const dividas = Math.abs(saldoDe("fornecedores")) + Math.abs(saldoDe("emprestimos"));
  const patrimonioLiquido = Math.round(saldoDe("capital_titular") * 100) / 100;
  const mesesFechados = mesesFechadosDe(periodosFechados);
  const mesReferencia = mesesFechados[mesesFechados.length - 1] || null;
  let faturamentoMensal = null;
  let retiradaMensal = null;
  if (mesReferencia) {
    faturamentoMensal = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mesReferencia).receita;
    const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mesReferencia).map((l) => l.id));
    let retirada = 0;
    for (const linha of lancamentoLinhas) {
      if (linha.contaId !== "retiradas_titular" || !idsDoMes.has(linha.lancamentoId)) continue;
      retirada += linha.tipo === "D" ? linha.valor : -linha.valor;
    }
    retiradaMensal = Math.round(retirada * 100) / 100;
  }
  return {
    caixaEBanco: Math.round(caixaEBanco * 100) / 100,
    aReceber: Math.round(aReceber * 100) / 100,
    dividasDoNegocio: Math.round(dividas * 100) / 100,
    patrimonioLiquido,
    faturamentoMensal,
    retiradaMensal,
    mesReferencia
  };
}
function linhaDoTempo({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, evitados }) {
  const eventos = [];
  if (negocio?.retrato_de_entrada) {
    eventos.push({ tipo: "abertura", data: negocio.retrato_de_entrada.capturadoEm, retrato: negocio.retrato_de_entrada });
  }
  for (const mes of mesesFechadosDe(periodosFechados)) {
    const resultado = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes);
    const carta = (cartas || []).find((c) => c.mes === mes) || null;
    const evitadosDoMesEvento = (evitados || []).filter((e) => e.mes === mes);
    eventos.push({ tipo: "mes", data: `${mes}-01`, mes, resultado, carta, evitados: evitadosDoMesEvento });
  }
  return eventos.sort((a, b) => (a.data || "").localeCompare(b.data || ""));
}

// src/telas/Memoria.jsx
var fmt13 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtMes3 = (m) => {
  const [ano, mes] = m.split("-");
  return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
var fmtData7 = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
function SeloSeguida({ seguida }) {
  if (seguida === true) return /* @__PURE__ */ React19.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full", style: { background: "var(--credit-soft)", color: "var(--credit)" } }, "seguida");
  if (seguida === false) return /* @__PURE__ */ React19.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, "n\xE3o seguida");
  return /* @__PURE__ */ React19.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full", style: { background: "var(--rule-faint)", color: "var(--muted)" } }, "ainda n\xE3o avaliada");
}
function EventoAbertura({ retrato }) {
  const d = retrato.declarado || {};
  return /* @__PURE__ */ React19.createElement(Card, { className: "mb-3", pad: "apertado" }, /* @__PURE__ */ React19.createElement("div", { className: "flex items-center gap-2 mb-1.5" }, /* @__PURE__ */ React19.createElement(Sparkles, { size: 13, style: { color: "var(--accent)" } }), /* @__PURE__ */ React19.createElement("span", { className: "text-xs font-medium", style: { color: "var(--ink)" } }, "In\xEDcio \u2014 ", fmtData7(retrato.capturadoEm))), /* @__PURE__ */ React19.createElement("div", { className: "text-xs", style: { color: "var(--muted)", lineHeight: 1.6 } }, d.faturamentoMensal != null && /* @__PURE__ */ React19.createElement(React19.Fragment, null, "Disse que faturava ", fmt13(d.faturamentoMensal), "/m\xEAs. "), d.retiradaMensal != null && /* @__PURE__ */ React19.createElement(React19.Fragment, null, "Disse que tirava ", fmt13(d.retiradaMensal), "/m\xEAs. "), d.meta && /* @__PURE__ */ React19.createElement(React19.Fragment, null, 'Meta: "', d.meta, '". '), d.oQueIncomoda && /* @__PURE__ */ React19.createElement(React19.Fragment, null, 'O que incomodava: "', d.oQueIncomoda, '".')));
}
function EventoMes({ mes, resultado, carta, evitados }) {
  const positivo = resultado.resultado >= 0;
  return /* @__PURE__ */ React19.createElement(Card, { className: "mb-3", pad: "apertado" }, /* @__PURE__ */ React19.createElement("div", { className: "flex items-center justify-between mb-1.5" }, /* @__PURE__ */ React19.createElement("span", { className: "text-xs font-medium capitalize", style: { color: "var(--ink)" } }, fmtMes3(mes)), /* @__PURE__ */ React19.createElement("span", { className: "text-xs font-medium", style: { color: positivo ? "var(--credit)" : "var(--debit)" } }, positivo ? "sobrou" : "faltou", " ", fmt13(Math.abs(resultado.resultado)))), carta?.texto ? /* @__PURE__ */ React19.createElement("div", { className: "text-xs flex items-start gap-1.5", style: { color: "var(--muted)", lineHeight: 1.6 } }, /* @__PURE__ */ React19.createElement(FileText, { size: 12, style: { marginTop: 2, flexShrink: 0 } }), /* @__PURE__ */ React19.createElement("span", null, '"', carta.texto, '" ', /* @__PURE__ */ React19.createElement(SeloSeguida, { seguida: carta.seguida }))) : /* @__PURE__ */ React19.createElement("div", { className: "text-xs", style: { color: "var(--muted)" } }, "Sem carta registrada neste m\xEAs."), evitados?.length > 0 && /* @__PURE__ */ React19.createElement("div", { className: "text-xs mt-1.5 space-y-0.5", style: { color: "var(--credit)", lineHeight: 1.6 } }, evitados.map((e) => /* @__PURE__ */ React19.createElement("div", { key: e.id }, "evitou: ", e.descricao, e.valorEstimado > 0 ? ` (${fmt13(e.valorEstimado)})` : ""))));
}
function Memoria({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, evitados }) {
  const eventos = useMemo12(
    () => linhaDoTempo({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, evitados }),
    [negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, evitados]
  );
  const comparacao = useMemo12(() => {
    if (!negocio?.retrato_de_entrada) return [];
    const agora = medidoAgora(contas, lancamentos, lancamentoLinhas, periodosFechados);
    return compararComAEntrada(negocio.retrato_de_entrada, agora);
  }, [negocio, contas, lancamentos, lancamentoLinhas, periodosFechados]);
  if (!eventos.length) {
    return /* @__PURE__ */ React19.createElement(Card, { className: "text-center py-10" }, /* @__PURE__ */ React19.createElement("div", { className: "text-sm", style: { color: "var(--ink)" } }, "Ainda n\xE3o h\xE1 hist\xF3ria para contar."), /* @__PURE__ */ React19.createElement("div", { className: "text-xs mt-1", style: { color: "var(--muted)" } }, "Aparece aqui assim que houver um retrato de entrada ou o primeiro m\xEAs fechado."));
  }
  return /* @__PURE__ */ React19.createElement("div", null, comparacao.length > 0 && /* @__PURE__ */ React19.createElement(Card, { className: "mb-4", style: { background: "linear-gradient(160deg, var(--surface), var(--paper))" } }, /* @__PURE__ */ React19.createElement("div", { className: "text-xs uppercase tracking-wide mb-2", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "Desde que come\xE7amos"), /* @__PURE__ */ React19.createElement("div", { className: "space-y-2" }, comparacao.map((a, i) => /* @__PURE__ */ React19.createElement("div", { key: i, className: "text-sm", style: { color: "var(--ink)", lineHeight: 1.6 } }, a.frase)))), /* @__PURE__ */ React19.createElement("div", null, eventos.map((ev, i) => ev.tipo === "abertura" ? /* @__PURE__ */ React19.createElement(EventoAbertura, { key: i, retrato: ev.retrato }) : /* @__PURE__ */ React19.createElement(EventoMes, { key: i, mes: ev.mes, resultado: ev.resultado, carta: ev.carta, evitados: ev.evitados }))));
}

// src/dominio/recorrentes.mjs
var uidPadrao4 = () => Math.random().toString(36).slice(2, 10);
function gerarLancamentosDoMes(recorrentes, recorrenteLinhas, lancamentos, mes, dataDoMes, gerarId = uidPadrao4) {
  const jaGeradas = new Set(
    (lancamentos || []).filter((l) => l.origem === "recorrente" && (l.data || "").slice(0, 7) === mes).map((l) => l.documento)
  );
  const novosLancamentos = [];
  const novasLinhas = [];
  for (const rec of recorrentes || []) {
    if (!rec.ativa || jaGeradas.has(rec.id)) continue;
    const linhasDoTemplate = (recorrenteLinhas || []).filter((l) => l.recorrenteId === rec.id);
    if (!linhasDoTemplate.length) continue;
    const lancamentoId = gerarId();
    novosLancamentos.push({
      id: lancamentoId,
      data: dataDoMes,
      dataCompetencia: dataDoMes,
      descricao: rec.descricao,
      origem: "recorrente",
      documento: rec.id
    });
    for (const l of linhasDoTemplate) {
      novasLinhas.push({ id: gerarId(), lancamentoId, contaId: l.contaId, tipo: l.tipo, valor: l.valor, descricao: null, vencimento: null });
    }
  }
  return { lancamentos: novosLancamentos, linhas: novasLinhas };
}

// src/telas/Livro.jsx
var uid6 = () => Math.random().toString(36).slice(2, 10);
var mesDe = (dataIso) => (dataIso || "").slice(0, 7);
var ABAS = [
  { id: "caixa", label: "Caixa de Entrada" },
  { id: "lancar", label: "Lan\xE7ar" },
  { id: "diario", label: "Di\xE1rio" },
  { id: "razao", label: "Raz\xE3o" },
  { id: "balancete", label: "Balancete" },
  { id: "conciliacao", label: "Concilia\xE7\xE3o" },
  { id: "baixas", label: "A receber/pagar" },
  { id: "revisao", label: "Revis\xE3o" },
  { id: "entregas", label: "Entregas" },
  { id: "memoria", label: "Mem\xF3ria" },
  { id: "roteiro", label: "Roteiro" },
  { id: "plano", label: "Plano de contas" },
  { id: "recorrentes", label: "Recorrentes" },
  { id: "negocio", label: "Neg\xF3cio" }
];
function Livro({ negocio, onVoltar, onNegocioAtualizado }) {
  const [aba, setAba] = useState16("caixa");
  const [estado, setEstado] = useState16(null);
  const [loaded, setLoaded] = useState16(false);
  const [erro, setErro] = useState16("");
  const [salvando, setSalvando] = useState16(false);
  const [confirmado, setConfirmado] = useState16(false);
  const [editandoId, setEditandoId] = useState16(null);
  const [roteiro, setRoteiro] = useState16(null);
  const fotoRef = useRef2(null);
  const estadoRef = useRef2(null);
  const timerRef = useRef2(null);
  useEffect8(() => {
    estadoRef.current = estado;
  }, [estado]);
  useEffect8(() => {
    let vivo = true;
    carregarEstadoNegocio(negocio.id).then((estadoServidor) => {
      if (!vivo) return;
      setEstado(estadoServidor);
      fotoRef.current = fotografar(estadoServidor);
      setLoaded(true);
    }).catch((e) => {
      if (vivo) setErro(`N\xE3o consegui carregar o livro: ${e.message}`);
    });
    return () => {
      vivo = false;
    };
  }, [negocio.id]);
  useEffect8(() => {
    let vivo = true;
    Promise.all([
      supabase.from("roteiro_perguntas").select("*").eq("ativo", true).order("bloco").order("ordem"),
      supabase.from("roteiro_respostas").select("pergunta_id, resposta").eq("negocio_id", negocio.id)
    ]).then(([{ data: perguntas, error: e1 }, { data: respostas, error: e2 }]) => {
      if (!vivo || e1 || e2) return;
      const respostasPorPerguntaId = {};
      for (const r of respostas || []) respostasPorPerguntaId[r.pergunta_id] = r.resposta;
      setRoteiro({ perguntas: perguntas || [], respostasPorPerguntaId });
    });
    return () => {
      vivo = false;
    };
  }, [negocio.id]);
  const salvarRespostaRoteiro = useCallback2(async (perguntaId, resposta) => {
    setRoteiro((prev) => prev && { ...prev, respostasPorPerguntaId: { ...prev.respostasPorPerguntaId, [perguntaId]: resposta } });
    await supabase.from("roteiro_respostas").upsert(
      { negocio_id: negocio.id, pergunta_id: perguntaId, resposta: String(resposta) },
      { onConflict: "negocio_id,pergunta_id" }
    );
  }, [negocio.id]);
  useEffect8(() => {
    if (!loaded || !estado) return;
    const { ops, perigo } = calcularDiferenca(fotoRef.current, fotografar(estado));
    if (!ops.length) {
      timerRef.current = null;
      return;
    }
    if (perigo) {
      timerRef.current = null;
      setErro(`Parei antes de salvar: a mudan\xE7a apagaria ${perigo.apagados} de ${perigo.total} registros de uma vez. Nada foi alterado no servidor.`);
      return;
    }
    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      setSalvando(true);
      setErro("");
      try {
        const { error } = await supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
        if (error) throw new Error(error.message);
        fotoRef.current = fotografar(estado);
        setConfirmado(true);
        setTimeout(() => setConfirmado(false), 1800);
      } catch (e) {
        setErro(`N\xE3o consegui salvar: ${e.message}. Nada foi perdido na tela \u2014 tente de novo.`);
      } finally {
        setSalvando(false);
      }
    }, 900);
    return () => clearTimeout(timerRef.current);
  }, [estado, loaded]);
  useEffect8(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const { ops, perigo } = calcularDiferenca(fotoRef.current, fotografar(estadoRef.current));
        if (ops.length && !perigo) {
          supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
        }
      }
    };
  }, []);
  const mesEstaFechado = useCallback2(
    (dataIso) => estadoRef.current?.periodosFechados?.includes(`mes:${mesDe(dataIso)}`),
    []
  );
  const adicionarLancamento = useCallback2(({ lancamento, linhas }) => {
    if (mesEstaFechado(lancamento.data)) {
      setErro(`O m\xEAs de ${mesDe(lancamento.data)} j\xE1 est\xE1 fechado \u2014 reabra na aba Revis\xE3o antes de lan\xE7ar aqui.`);
      return false;
    }
    setEstado((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, lancamento],
      lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
      trilha: [...prev.trilha, { tipo: "lancar", descricao: lancamento.descricao }]
    }));
    return true;
  }, [mesEstaFechado]);
  const importarItens = useCallback2((itens) => {
    setEstado((prev) => ({ ...prev, entradaItens: [...prev.entradaItens, ...itens] }));
  }, []);
  const marcarSituacao = useCallback2((item, situacao) => {
    setEstado((prev) => ({
      ...prev,
      entradaItens: prev.entradaItens.map((i) => i.id === item.id ? { ...i, situacao } : i)
    }));
  }, []);
  const marcarPessoal = useCallback2((item) => {
    if (!negocio.dinheiro_misturado) return marcarSituacao(item, "pessoal");
    if (mesEstaFechado(item.data)) {
      setErro(`O m\xEAs de ${mesDe(item.data)} j\xE1 est\xE1 fechado \u2014 reabra na aba Revis\xE3o antes de lan\xE7ar esta retirada.`);
      return false;
    }
    const { lancamento, linhas } = construirMovimentoPessoal(item);
    setEstado((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, lancamento],
      lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
      entradaItens: prev.entradaItens.map((i) => i.id === item.id ? { ...i, situacao: "pessoal", lancamentoId: lancamento.id } : i),
      trilha: [...prev.trilha, { tipo: item.valor > 0 ? "aporte" : "retirada", descricao: item.descricaoBruta }]
    }));
    return true;
  }, [negocio.dinheiro_misturado, marcarSituacao, mesEstaFechado]);
  const classificarItem = useCallback2(({ item, contaCategoriaId, padrao }) => {
    if (mesEstaFechado(item.data)) {
      setErro(`O m\xEAs de ${mesDe(item.data)} j\xE1 est\xE1 fechado \u2014 reabra na aba Revis\xE3o antes de classificar este item.`);
      return false;
    }
    setEstado((prev) => {
      const { lancamento, linhas } = construirLancamentoDeClassificacao(item, contaCategoriaId);
      const regraExistente = prev.regrasClassificacao.find(
        (r) => (r.padrao || "").toUpperCase() === padrao.toUpperCase() && r.contaId === contaCategoriaId
      );
      const regrasClassificacao = regraExistente ? prev.regrasClassificacao.map((r) => r === regraExistente ? { ...r, acertos: (r.acertos || 1) + 1 } : r) : [...prev.regrasClassificacao, { id: uid6(), padrao, contaId: contaCategoriaId, acertos: 1 }];
      return {
        ...prev,
        lancamentos: [...prev.lancamentos, lancamento],
        lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
        entradaItens: prev.entradaItens.map((i) => i.id === item.id ? { ...i, situacao: "classificado", lancamentoId: lancamento.id } : i),
        regrasClassificacao,
        trilha: [...prev.trilha, { tipo: "classificar", descricao: `${item.descricaoBruta} \u2192 ${contaCategoriaId}` }]
      };
    });
    return true;
  }, [mesEstaFechado]);
  const alternarConciliacao = useCallback2((lancamentoId, marcar) => {
    setEstado((prev) => ({
      ...prev,
      conciliacoes: marcar ? [...prev.conciliacoes, lancamentoId] : prev.conciliacoes.filter((id) => id !== lancamentoId)
    }));
  }, []);
  const fecharMes = useCallback2((mes) => {
    setEstado((prev) => ({
      ...prev,
      periodosFechados: [...prev.periodosFechados, `mes:${mes}`],
      trilha: [...prev.trilha, { tipo: "fechar_mes", descricao: `M\xEAs ${mes} fechado` }]
    }));
  }, []);
  const reabrirMes = useCallback2((mes) => {
    setEstado((prev) => ({
      ...prev,
      periodosFechados: prev.periodosFechados.filter((p) => p !== `mes:${mes}`),
      trilha: [...prev.trilha, { tipo: "reabrir_mes", descricao: `M\xEAs ${mes} reaberto` }]
    }));
  }, []);
  const iniciarEdicao = useCallback2((lancamentoId) => {
    setEditandoId(lancamentoId);
    setAba("lancar");
  }, []);
  const cancelarEdicao = useCallback2(() => setEditandoId(null), []);
  const adicionarConta = useCallback2((conta) => {
    setEstado((prev) => ({
      ...prev,
      contas: [...prev.contas, conta],
      trilha: [...prev.trilha, { tipo: "conta_nova", descricao: `${conta.codigo} \u2014 ${conta.nome}` }]
    }));
  }, []);
  const alternarAtivaConta = useCallback2((contaId, ativa) => {
    setEstado((prev) => ({
      ...prev,
      contas: prev.contas.map((c) => c.id === contaId ? { ...c, ativa } : c)
    }));
  }, []);
  const adicionarRecorrente = useCallback2(({ recorrente, linhas }) => {
    setEstado((prev) => ({
      ...prev,
      recorrentes: [...prev.recorrentes, recorrente],
      recorrenteLinhas: [...prev.recorrenteLinhas, ...linhas],
      trilha: [...prev.trilha, { tipo: "recorrente_novo", descricao: recorrente.descricao }]
    }));
  }, []);
  const alternarAtivaRecorrente = useCallback2((recorrenteId, ativa) => {
    setEstado((prev) => ({
      ...prev,
      recorrentes: prev.recorrentes.map((r) => r.id === recorrenteId ? { ...r, ativa } : r)
    }));
  }, []);
  const salvarCarta = useCallback2((mes, texto) => {
    setEstado((prev) => {
      const existe = prev.cartas.some((c) => c.mes === mes);
      return {
        ...prev,
        cartas: existe ? prev.cartas.map((c) => c.mes === mes ? { ...c, texto } : c) : [...prev.cartas, { mes, texto, seguida: null }],
        trilha: [...prev.trilha, { tipo: "carta", descricao: `Carta de ${mes}` }]
      };
    });
  }, []);
  const avaliarCartaSeguida = useCallback2((mes, seguida) => {
    setEstado((prev) => ({
      ...prev,
      cartas: prev.cartas.map((c) => c.mes === mes ? { ...c, seguida } : c),
      trilha: [...prev.trilha, { tipo: "carta_avaliada", descricao: `Carta de ${mes}: ${seguida ? "seguida" : "n\xE3o seguida"}` }]
    }));
  }, []);
  const adicionarEvitado = useCallback2((mes, descricao, valorEstimado) => {
    setEstado((prev) => ({
      ...prev,
      evitados: [...prev.evitados, { id: uid6(), mes, descricao, valorEstimado: valorEstimado || null }],
      trilha: [...prev.trilha, { tipo: "evitado", descricao }]
    }));
  }, []);
  const darBaixa = useCallback2((linhaOriginal, contaTransitoId, data) => {
    if (mesEstaFechado(data)) {
      setErro(`O m\xEAs de ${mesDe(data)} j\xE1 est\xE1 fechado \u2014 reabra na aba Revis\xE3o antes de dar baixa.`);
      return false;
    }
    const { lancamento, linhas } = construirBaixa(linhaOriginal, contaTransitoId, data);
    setEstado((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, lancamento],
      lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
      trilha: [...prev.trilha, { tipo: "baixa", descricao: lancamento.descricao }]
    }));
    return true;
  }, [mesEstaFechado]);
  const gerarRecorrentesDoMes = useCallback2(() => {
    const mes = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
    const dataDoMes = `${mes}-01`;
    if (mesEstaFechado(dataDoMes)) {
      setErro(`O m\xEAs de ${mes} j\xE1 est\xE1 fechado \u2014 reabra na aba Revis\xE3o antes de gerar recorrentes.`);
      return { gerados: 0 };
    }
    const { lancamentos, linhas } = gerarLancamentosDoMes(
      estadoRef.current.recorrentes,
      estadoRef.current.recorrenteLinhas,
      estadoRef.current.lancamentos,
      mes,
      dataDoMes
    );
    if (lancamentos.length) {
      setEstado((prev) => ({
        ...prev,
        lancamentos: [...prev.lancamentos, ...lancamentos],
        lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
        trilha: [...prev.trilha, { tipo: "gerar_recorrentes", descricao: `${lancamentos.length} lan\xE7amento(s) de ${mes}` }]
      }));
    }
    return { gerados: lancamentos.length };
  }, [mesEstaFechado]);
  const editarLancamento = useCallback2(({ lancamentoId, lancamento, linhas }) => {
    const original = estadoRef.current?.lancamentos.find((l) => l.id === lancamentoId);
    if (mesEstaFechado(original?.data) || mesEstaFechado(lancamento.data)) {
      setErro(`O m\xEAs est\xE1 fechado \u2014 reabra na aba Revis\xE3o antes de editar.`);
      return false;
    }
    setEstado((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.map((l) => l.id === lancamentoId ? lancamento : l),
      lancamentoLinhas: [...prev.lancamentoLinhas.filter((l) => l.lancamentoId !== lancamentoId), ...linhas],
      trilha: [...prev.trilha, { tipo: "editar", descricao: lancamento.descricao }]
    }));
    return true;
  }, [mesEstaFechado]);
  const excluirLancamento = useCallback2((lancamentoId) => {
    const lancamento = estadoRef.current?.lancamentos.find((l) => l.id === lancamentoId);
    if (!lancamento) return;
    if (mesEstaFechado(lancamento.data)) {
      setErro(`O m\xEAs de ${mesDe(lancamento.data)} j\xE1 est\xE1 fechado \u2014 reabra na aba Revis\xE3o antes de excluir.`);
      return;
    }
    const linhas = estadoRef.current.lancamentoLinhas.filter((l) => l.lancamentoId === lancamentoId);
    setEstado((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.filter((l) => l.id !== lancamentoId),
      lancamentoLinhas: prev.lancamentoLinhas.filter((l) => l.lancamentoId !== lancamentoId),
      entradaItens: prev.entradaItens.map((i) => i.lancamentoId === lancamentoId ? { ...i, situacao: "pendente", lancamentoId: null } : i),
      lixeira: [...prev.lixeira, { lancamentoId, conteudo: { lancamento, linhas }, excluidoEm: (/* @__PURE__ */ new Date()).toISOString() }],
      trilha: [...prev.trilha, { tipo: "excluir", descricao: lancamento.descricao }]
    }));
  }, [mesEstaFechado]);
  const editando = editandoId && estado ? { lancamento: estado.lancamentos.find((l) => l.id === editandoId), linhas: estado.lancamentoLinhas.filter((l) => l.lancamentoId === editandoId) } : null;
  if (!loaded || !estado) {
    return /* @__PURE__ */ React20.createElement("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--paper)" } }, /* @__PURE__ */ React20.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, erro || "Carregando o livro\u2026"));
  }
  return /* @__PURE__ */ React20.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React20.createElement("div", { className: "max-w-4xl mx-auto px-5 py-8" }, /* @__PURE__ */ React20.createElement("button", { onClick: onVoltar, className: "inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React20.createElement(ArrowLeft2, { size: 14 }), " Voltar"), /* @__PURE__ */ React20.createElement("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ React20.createElement("div", { className: "text-xl font-bold", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, negocio.apelido || negocio.nome), /* @__PURE__ */ React20.createElement(Confirmacao, { texto: salvando ? "Salvando\u2026" : "Salvo.", ativa: salvando || confirmado })), erro && /* @__PURE__ */ React20.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React20.createElement(Tabs, { tabs: ABAS, active: aba, onChange: setAba }), aba === "caixa" && /* @__PURE__ */ React20.createElement(
    CaixaEntrada,
    {
      contas: estado.contas,
      entradaItens: estado.entradaItens,
      regrasClassificacao: estado.regrasClassificacao,
      onImportar: importarItens,
      onClassificar: classificarItem,
      onPessoal: marcarPessoal,
      onDuvida: (item) => marcarSituacao(item, "duvida"),
      dinheiroMisturado: negocio.dinheiro_misturado
    }
  ), aba === "lancar" && /* @__PURE__ */ React20.createElement(
    Lancar,
    {
      contas: estado.contas,
      onAdicionar: adicionarLancamento,
      editando,
      onEditar: editarLancamento,
      onCancelarEdicao: cancelarEdicao
    }
  ), aba === "diario" && /* @__PURE__ */ React20.createElement(
    Diario,
    {
      contas: estado.contas,
      lancamentos: estado.lancamentos,
      lancamentoLinhas: estado.lancamentoLinhas,
      onEditar: iniciarEdicao,
      onExcluir: excluirLancamento
    }
  ), aba === "razao" && /* @__PURE__ */ React20.createElement(Razao, { contas: estado.contas, lancamentos: estado.lancamentos, lancamentoLinhas: estado.lancamentoLinhas }), aba === "balancete" && /* @__PURE__ */ React20.createElement(Balancete, { contas: estado.contas, lancamentoLinhas: estado.lancamentoLinhas }), aba === "conciliacao" && /* @__PURE__ */ React20.createElement(
    Conciliacao,
    {
      lancamentos: estado.lancamentos,
      lancamentoLinhas: estado.lancamentoLinhas,
      conciliacoes: estado.conciliacoes,
      onAlternar: alternarConciliacao
    }
  ), aba === "baixas" && /* @__PURE__ */ React20.createElement(Baixas, { contas: estado.contas, lancamentoLinhas: estado.lancamentoLinhas, onDarBaixa: darBaixa }), aba === "revisao" && /* @__PURE__ */ React20.createElement(
    Revisao,
    {
      negocio,
      contas: estado.contas,
      lancamentos: estado.lancamentos,
      lancamentoLinhas: estado.lancamentoLinhas,
      periodosFechados: estado.periodosFechados,
      trilha: estado.trilha,
      onFechar: fecharMes,
      onReabrir: reabrirMes
    }
  ), aba === "entregas" && /* @__PURE__ */ React20.createElement(
    RetratoDoMes,
    {
      negocio,
      contas: estado.contas,
      lancamentos: estado.lancamentos,
      lancamentoLinhas: estado.lancamentoLinhas,
      periodosFechados: estado.periodosFechados,
      cartas: estado.cartas,
      recorrentes: estado.recorrentes,
      recorrenteLinhas: estado.recorrenteLinhas,
      evitados: estado.evitados,
      onSalvarCarta: salvarCarta,
      onAvaliarCartaSeguida: avaliarCartaSeguida,
      onAdicionarEvitado: adicionarEvitado,
      metaDoCliente: roteiro ? respostaPorDestino(roteiro.perguntas, roteiro.respostasPorPerguntaId, "retrato.meta") : null,
      pendentesDeAprofundamento: roteiro ? pendentesDeAprofundamento(roteiro.perguntas, roteiro.respostasPorPerguntaId, { tipo: negocio.tipo, arquetipo: negocio.arquetipo }).length : 0,
      onAbrirRoteiro: () => setAba("roteiro")
    }
  ), aba === "memoria" && /* @__PURE__ */ React20.createElement(
    Memoria,
    {
      negocio,
      contas: estado.contas,
      lancamentos: estado.lancamentos,
      lancamentoLinhas: estado.lancamentoLinhas,
      periodosFechados: estado.periodosFechados,
      cartas: estado.cartas,
      evitados: estado.evitados
    }
  ), aba === "roteiro" && (roteiro ? /* @__PURE__ */ React20.createElement(Roteiro, { negocio, perguntas: roteiro.perguntas, respostasPorPerguntaId: roteiro.respostasPorPerguntaId, onSalvarResposta: salvarRespostaRoteiro }) : /* @__PURE__ */ React20.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Carregando\u2026")), aba === "plano" && /* @__PURE__ */ React20.createElement(PlanoContas, { contas: estado.contas, onAdicionar: adicionarConta, onAlternarAtiva: alternarAtivaConta }), aba === "recorrentes" && /* @__PURE__ */ React20.createElement(
    Recorrentes,
    {
      contas: estado.contas,
      recorrentes: estado.recorrentes,
      recorrenteLinhas: estado.recorrenteLinhas,
      onAdicionar: adicionarRecorrente,
      onAlternarAtiva: alternarAtivaRecorrente,
      onGerar: gerarRecorrentesDoMes
    }
  ), aba === "negocio" && /* @__PURE__ */ React20.createElement(ConfigNegocio, { negocioId: negocio.id, onAtualizado: onNegocioAtualizado })));
}

// src/telas/PainelDoMes.jsx
import React21, { useEffect as useEffect9, useState as useState17 } from "react";
import { ArrowLeft as ArrowLeft3, Copy, Check as Check4 } from "lucide-react";

// src/dados/painelDoMes.mjs
async function carregarPainelDoMes() {
  const mes = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const inicio = `${mes}-01`;
  const fimExclusivo = /* @__PURE__ */ new Date(`${mes}-01T00:00:00Z`);
  fimExclusivo.setUTCMonth(fimExclusivo.getUTCMonth() + 1);
  const fim = fimExclusivo.toISOString().slice(0, 10);
  const [{ data: negocios, error: e1 }, { data: itens, error: e2 }, { data: periodos, error: e3 }] = await Promise.all([
    supabase.from("negocios").select("id, nome, apelido, situacao, configuracao"),
    supabase.from("entrada_itens").select("negocio_id, situacao, criado_em").gte("criado_em", inicio).lt("criado_em", fim),
    supabase.from("periodos_fechados").select("negocio_id").eq("tipo", "mes").eq("periodo", mes)
  ]);
  if (e1) throw new Error(`Falha ao carregar neg\xF3cios: ${e1.message}`);
  if (e2) throw new Error(`Falha ao carregar a Caixa de Entrada: ${e2.message}`);
  if (e3) throw new Error(`Falha ao carregar per\xEDodos fechados: ${e3.message}`);
  const itensPorNegocio = /* @__PURE__ */ new Map();
  for (const item of itens || []) {
    if (!itensPorNegocio.has(item.negocio_id)) itensPorNegocio.set(item.negocio_id, []);
    itensPorNegocio.get(item.negocio_id).push({ situacao: item.situacao });
  }
  const negociosComMesFechado = new Set((periodos || []).map((p) => p.negocio_id));
  return { negocios: negocios || [], itensPorNegocio, negociosComMesFechado, mes };
}

// src/dominio/painelDoMes.mjs
var MES_NOME = ["janeiro", "fevereiro", "mar\xE7o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
function nomeDoMes(mes) {
  const [ano, m] = mes.split("-");
  return `${MES_NOME[Number(m) - 1]}/${ano}`;
}
function statusDoMes(itensDoMes, mesFechado) {
  if (mesFechado) return { status: "fechado", pendentes: 0 };
  if (!itensDoMes.length) return { status: "nada", pendentes: 0 };
  const pendentes = itensDoMes.filter((i) => i.situacao === "pendente" || i.situacao === "duvida").length;
  return pendentes === 0 ? { status: "pronto", pendentes: 0 } : { status: "faltando", pendentes };
}
function montarPainelDoMes(negocios, itensPorNegocio, negociosComMesFechado) {
  const ORDEM = { nada: 0, faltando: 1, pronto: 2, fechado: 3 };
  const linhas = (negocios || []).filter((n) => n.situacao === "ativo" && n.configuracao?.onboarded).map((n) => {
    const itens = itensPorNegocio.get(n.id) || [];
    const info = statusDoMes(itens, negociosComMesFechado.has(n.id));
    return { negocioId: n.id, nome: n.nome, apelido: n.apelido, ...info };
  });
  return linhas.sort((a, b) => ORDEM[a.status] - ORDEM[b.status] || b.pendentes - a.pendentes);
}
function mensagemCobranca(linha, mes) {
  const nome = linha.apelido || linha.nome;
  const mesTexto = nomeDoMes(mes);
  if (linha.status === "nada") {
    return `Oi, ${nome}! Ainda n\xE3o recebi nada de ${mesTexto} \u2014 pode ir mandando o extrato e as vendas quando puder?`;
  }
  if (linha.status === "faltando") {
    const n = linha.pendentes;
    return `Oi, ${nome}! Para fechar ${mesTexto} ainda preciso que voc\xEA confirme ${n} ${n === 1 ? "item" : "itens"} que ca\xED(ram) na Caixa de Entrada \u2014 d\xE1 uma olhada quando puder?`;
  }
  return null;
}

// src/telas/PainelDoMes.jsx
var STATUS_INFO = {
  nada: { texto: "falta: TUDO \u2014 nada chegou este m\xEAs", cor: "var(--debit)" },
  faltando: { texto: null, cor: "var(--debit)" },
  // texto vem de `pendentes`, montado abaixo
  pronto: { texto: "falta: NADA \u2014 pronto pra fechar", cor: "var(--credit)" },
  fechado: { texto: "m\xEAs fechado", cor: "var(--muted)" }
};
function BotaoCopiar({ texto }) {
  const [copiado, setCopiado] = useState17(false);
  const copiar = async () => {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };
  return /* @__PURE__ */ React21.createElement("button", { onClick: copiar, className: "text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70 shrink-0", style: { color: "var(--accent)" } }, copiado ? /* @__PURE__ */ React21.createElement(React21.Fragment, null, /* @__PURE__ */ React21.createElement(Check4, { size: 13 }), " Copiado") : /* @__PURE__ */ React21.createElement(React21.Fragment, null, /* @__PURE__ */ React21.createElement(Copy, { size: 13 }), " Copiar mensagem"));
}
function PainelDoMes({ onVoltar }) {
  const [dados, setDados] = useState17(null);
  const [erro, setErro] = useState17("");
  useEffect9(() => {
    let vivo = true;
    carregarPainelDoMes().then((d) => {
      if (vivo) setDados(d);
    }).catch((e) => {
      if (vivo) setErro(e.message);
    });
    return () => {
      vivo = false;
    };
  }, []);
  return /* @__PURE__ */ React21.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React21.createElement("div", { className: "max-w-2xl mx-auto px-5 py-8" }, /* @__PURE__ */ React21.createElement("button", { onClick: onVoltar, className: "inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React21.createElement(ArrowLeft3, { size: 14 }), " Voltar"), /* @__PURE__ */ React21.createElement("div", { className: "mb-1 text-xl font-bold", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, "Painel do M\xEAs"), dados && /* @__PURE__ */ React21.createElement("div", { className: "text-xs mb-6", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, nomeDoMes(dados.mes), " \u2014 quem mandou, quem falta"), erro && /* @__PURE__ */ React21.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), !dados && !erro && /* @__PURE__ */ React21.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Carregando\u2026"), dados && (() => {
    const painel = montarPainelDoMes(dados.negocios, dados.itensPorNegocio, dados.negociosComMesFechado);
    if (!painel.length) {
      return /* @__PURE__ */ React21.createElement(Card, { className: "text-center py-12" }, /* @__PURE__ */ React21.createElement("div", { className: "text-sm", style: { color: "var(--ink)" } }, "Nenhum neg\xF3cio ativo com onboarding conclu\xEDdo ainda."));
    }
    return /* @__PURE__ */ React21.createElement("div", { className: "space-y-2" }, painel.map((linha) => {
      const info = STATUS_INFO[linha.status];
      const texto = linha.status === "faltando" ? `falta: ${linha.pendentes} ${linha.pendentes === 1 ? "item" : "itens"} por classificar` : info.texto;
      const mensagem = mensagemCobranca(linha, dados.mes);
      return /* @__PURE__ */ React21.createElement(Card, { key: linha.negocioId, pad: "apertado" }, /* @__PURE__ */ React21.createElement("div", { className: "flex items-center justify-between gap-3 flex-wrap" }, /* @__PURE__ */ React21.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React21.createElement("span", { className: "text-sm font-medium mr-2", style: { color: "var(--ink)" } }, linha.apelido || linha.nome), /* @__PURE__ */ React21.createElement("span", { className: "text-xs", style: { color: info.cor } }, texto)), mensagem && /* @__PURE__ */ React21.createElement(BotaoCopiar, { texto: mensagem })));
    }));
  })()));
}

// src/telas/FormularioPublico.jsx
import React22, { useState as useState18, useEffect as useEffect10, useCallback as useCallback3 } from "react";
import { Check as Check5, ArrowLeft as ArrowLeft4, ArrowRight as ArrowRight2 } from "lucide-react";
var fmtBloco = {
  1: "Sobre voc\xEA e o neg\xF3cio",
  2: "Como o dinheiro anda",
  3: "A foto de hoje",
  4: "O ritmo do neg\xF3cio",
  5: "O que voc\xEA quer"
};
function Capa({ negocio, total, jaRespondidas, onComecar }) {
  const retomando = jaRespondidas > 0;
  return /* @__PURE__ */ React22.createElement("div", { className: "text-center" }, /* @__PURE__ */ React22.createElement("div", { className: "text-[11px] uppercase mb-3", style: { color: "var(--gold)", letterSpacing: "0.18em", fontFamily: "var(--font-mono)" } }, "Contadoria"), /* @__PURE__ */ React22.createElement("h1", { className: "text-2xl font-bold mb-3", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, retomando ? `Bem-vindo de volta, ${negocio}` : `Vamos organizar o ${negocio}`), /* @__PURE__ */ React22.createElement("p", { className: "text-sm mb-2", style: { color: "var(--muted)", lineHeight: 1.6 } }, retomando ? `Voc\xEA j\xE1 respondeu ${jaRespondidas} de ${total}. Continua de onde parou.` : `S\xE3o ${total} perguntas r\xE1pidas sobre o seu neg\xF3cio. Leva uns 10 minutos.`), /* @__PURE__ */ React22.createElement("p", { className: "text-xs mb-8", style: { color: "var(--muted)", lineHeight: 1.6 } }, "Pode parar no meio e voltar depois \u2014 o que voc\xEA responder fica salvo.", /* @__PURE__ */ React22.createElement("br", null), "N\xE3o sabe algum n\xFAmero? Responde por alto, a gente acerta depois."), /* @__PURE__ */ React22.createElement(
    "button",
    {
      onClick: onComecar,
      className: "px-6 py-3 rounded-md text-sm font-semibold transition-transform active:scale-[0.98]",
      style: { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204" }
    },
    retomando ? "Continuar" : "Come\xE7ar"
  ));
}
function Fim({ negocio, onRevisar }) {
  return /* @__PURE__ */ React22.createElement("div", { className: "text-center" }, /* @__PURE__ */ React22.createElement(
    "div",
    {
      className: "mx-auto mb-5 rounded-full flex items-center justify-center",
      style: { width: 54, height: 54, background: "var(--credit-soft)" }
    },
    /* @__PURE__ */ React22.createElement(Check5, { size: 26, style: { color: "var(--credit)" } })
  ), /* @__PURE__ */ React22.createElement("h1", { className: "text-2xl font-bold mb-3", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, "Pronto, obrigado!"), /* @__PURE__ */ React22.createElement("p", { className: "text-sm mb-8", style: { color: "var(--muted)", lineHeight: 1.7 } }, "J\xE1 recebi as suas respostas sobre o ", negocio, ".", /* @__PURE__ */ React22.createElement("br", null), "Agora eu monto a organiza\xE7\xE3o das suas contas e volto com o primeiro retrato do seu m\xEAs."), /* @__PURE__ */ React22.createElement("button", { onClick: onRevisar, className: "text-xs underline", style: { color: "var(--muted)" } }, "rever ou corrigir alguma resposta"));
}
function FormularioPublico({ token }) {
  const [dados, setDados] = useState18(null);
  const [erro, setErro] = useState18("");
  const [etapa, setEtapa] = useState18("capa");
  const [indice, setIndice] = useState18(0);
  const [respostas, setRespostas] = useState18({});
  const [salvando, setSalvando] = useState18(false);
  useEffect10(() => {
    supabase.rpc("formulario_abrir", { p_token: token }).then(({ data, error }) => {
      if (error) return setErro("N\xE3o consegui abrir este formul\xE1rio.");
      if (!data?.ok) return setErro("Este link n\xE3o est\xE1 mais dispon\xEDvel. Pe\xE7a um novo para quem te enviou.");
      setDados(data);
      setRespostas(data.respostas || {});
      if (data.concluido) setEtapa("fim");
    });
  }, [token]);
  const perguntas = dados?.perguntas || [];
  const atual = perguntas[indice];
  const gravar = useCallback3(async (perguntaId, valor2) => {
    setSalvando(true);
    try {
      await supabase.rpc("formulario_responder", { p_token: token, p_pergunta: perguntaId, p_resposta: valor2 ?? "" });
    } catch {
    }
    setSalvando(false);
  }, [token]);
  const avancar = async () => {
    if (atual) await gravar(atual.id, respostas[atual.id]);
    if (indice + 1 < perguntas.length) return setIndice(indice + 1);
    await supabase.rpc("formulario_concluir", { p_token: token });
    setEtapa("fim");
  };
  const voltar = async () => {
    if (atual) await gravar(atual.id, respostas[atual.id]);
    setIndice(Math.max(0, indice - 1));
  };
  if (erro) {
    return /* @__PURE__ */ React22.createElement(Moldura, null, /* @__PURE__ */ React22.createElement("div", { className: "text-center text-sm", style: { color: "var(--muted)" } }, erro));
  }
  if (!dados) {
    return /* @__PURE__ */ React22.createElement(Moldura, null, /* @__PURE__ */ React22.createElement("div", { className: "text-center text-sm", style: { color: "var(--muted)" } }, "Abrindo\u2026"));
  }
  const respondidas = perguntas.filter((p) => String(respostas[p.id] ?? "").trim()).length;
  if (etapa === "capa") {
    return /* @__PURE__ */ React22.createElement(Moldura, null, /* @__PURE__ */ React22.createElement(
      Capa,
      {
        negocio: dados.negocio,
        total: perguntas.length,
        jaRespondidas: respondidas,
        onComecar: () => {
          const primeiraVazia = perguntas.findIndex((p) => !String(respostas[p.id] ?? "").trim());
          setIndice(primeiraVazia >= 0 ? primeiraVazia : 0);
          setEtapa("perguntas");
        }
      }
    ));
  }
  if (etapa === "fim") {
    return /* @__PURE__ */ React22.createElement(Moldura, null, /* @__PURE__ */ React22.createElement(Fim, { negocio: dados.negocio, onRevisar: () => {
      setIndice(0);
      setEtapa("perguntas");
    } }));
  }
  const valor = respostas[atual.id] ?? "";
  const definir = (v) => setRespostas({ ...respostas, [atual.id]: v });
  const fracao = perguntas.length ? (indice + 1) / perguntas.length : 1;
  return /* @__PURE__ */ React22.createElement(Moldura, null, /* @__PURE__ */ React22.createElement("div", { className: "mb-1 flex justify-between text-[10px]", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, /* @__PURE__ */ React22.createElement("span", null, fmtBloco[atual.bloco] || ""), /* @__PURE__ */ React22.createElement("span", null, indice + 1, " de ", perguntas.length)), /* @__PURE__ */ React22.createElement("div", { className: "h-1 rounded-full mb-8", style: { background: "var(--rule-faint)" } }, /* @__PURE__ */ React22.createElement(
    "div",
    {
      className: "h-1 rounded-full transition-all duration-300",
      style: { width: `${fracao * 100}%`, background: "linear-gradient(90deg, var(--gold-2), var(--gold))" }
    }
  )), /* @__PURE__ */ React22.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React22.createElement("div", { className: "text-lg font-medium mb-2", style: { color: "var(--ink)", fontFamily: "var(--font-display)", lineHeight: 1.4 } }, atual.pergunta), atual.explicacao && /* @__PURE__ */ React22.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--accent-soft)", color: "var(--ink)", lineHeight: 1.6 } }, atual.explicacao), /* @__PURE__ */ React22.createElement(CampoResposta, { pergunta: atual, valor, onChange: definir, onEnter: avancar })), /* @__PURE__ */ React22.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React22.createElement(
    "button",
    {
      onClick: voltar,
      disabled: indice === 0,
      className: "text-xs inline-flex items-center gap-1 disabled:opacity-30",
      style: { color: "var(--muted)" }
    },
    /* @__PURE__ */ React22.createElement(ArrowLeft4, { size: 13 }),
    " Voltar"
  ), /* @__PURE__ */ React22.createElement("div", { className: "flex items-center gap-3" }, !String(valor).trim() && /* @__PURE__ */ React22.createElement("button", { onClick: avancar, className: "text-xs", style: { color: "var(--muted)" } }, "pular"), /* @__PURE__ */ React22.createElement(
    "button",
    {
      onClick: avancar,
      disabled: salvando,
      className: "px-5 py-2.5 rounded-md text-sm font-semibold inline-flex items-center gap-1.5 transition-transform active:scale-[0.98] disabled:opacity-60",
      style: { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204" }
    },
    indice + 1 === perguntas.length ? "Terminei" : "Pr\xF3xima",
    " ",
    /* @__PURE__ */ React22.createElement(ArrowRight2, { size: 14 })
  ))));
}
function CampoResposta({ pergunta, valor, onChange, onEnter }) {
  const base = {
    borderColor: "var(--rule-faint)",
    background: "var(--paper)",
    color: "var(--ink)"
  };
  if (pergunta.tipo_resposta === "sim_nao") {
    return /* @__PURE__ */ React22.createElement("div", { className: "flex gap-2" }, [["sim", "Sim"], ["nao", "N\xE3o"]].map(([v, rotulo]) => /* @__PURE__ */ React22.createElement(
      "button",
      {
        key: v,
        onClick: () => onChange(v),
        className: "flex-1 py-3 rounded-md border text-sm font-medium transition-all",
        style: valor === v ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", borderColor: "transparent" } : { ...base, borderWidth: 1 }
      },
      rotulo
    )));
  }
  if (pergunta.tipo_resposta === "texto_longo" || pergunta.tipo_resposta === "lista_valores") {
    return /* @__PURE__ */ React22.createElement(
      "textarea",
      {
        rows: 4,
        value: valor,
        onChange: (e) => onChange(e.target.value),
        placeholder: pergunta.tipo_resposta === "lista_valores" ? "Pode escrever do seu jeito, um por linha" : "Escreva do seu jeito",
        className: "w-full rounded-md border px-3 py-3 text-base",
        style: base
      }
    );
  }
  const tipo = pergunta.tipo_resposta === "data" ? "date" : pergunta.tipo_resposta === "moeda" ? "text" : "text";
  return /* @__PURE__ */ React22.createElement(
    "input",
    {
      type: tipo,
      value: valor,
      onChange: (e) => onChange(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") onEnter();
      },
      inputMode: pergunta.tipo_resposta === "moeda" ? "decimal" : void 0,
      placeholder: pergunta.tipo_resposta === "moeda" ? "R$ 0,00" : "",
      className: "w-full rounded-md border px-3 py-3 text-base",
      style: base
    }
  );
}
function Moldura({ children }) {
  return /* @__PURE__ */ React22.createElement(
    "div",
    {
      className: "min-h-screen flex items-center justify-center px-5 py-10",
      style: { background: "radial-gradient(120% 70% at 50% -10%, #1a1108 0%, transparent 55%), var(--paper)" }
    },
    /* @__PURE__ */ React22.createElement("div", { className: "w-full", style: { maxWidth: 460 } }, /* @__PURE__ */ React22.createElement(
      "div",
      {
        className: "rounded-lg border p-6 sm:p-8",
        style: { borderColor: "var(--rule-faint)", background: "var(--surface)" }
      },
      children
    ), /* @__PURE__ */ React22.createElement("div", { className: "text-center text-[10px] mt-4", style: { color: "var(--muted)" } }, "Suas respostas s\xE3o vistas s\xF3 por quem cuida das suas contas."))
  );
}

// src/app/App.jsx
var TOKEN_FORMULARIO = new URLSearchParams(window.location.search).get("f");
function App() {
  const [authSession, setAuthSession] = useState19(void 0);
  const [dark] = useState19(true);
  const [negocioAberto, setNegocioAberto] = useState19(null);
  const [painelAberto, setPainelAberto] = useState19(false);
  useEffect11(() => {
    let vivo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (vivo) setAuthSession(data.session);
    });
    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, session) => {
      setAuthSession(session);
    });
    return () => {
      vivo = false;
      assinatura.subscription.unsubscribe();
    };
  }, []);
  const fecharNegocio = () => setNegocioAberto(null);
  const atualizarNegocioAberto = (patch) => setNegocioAberto((prev) => prev && { ...prev, ...patch });
  if (TOKEN_FORMULARIO) {
    return /* @__PURE__ */ React23.createElement(React23.Fragment, null, /* @__PURE__ */ React23.createElement(EstiloGlobal, { dark }), /* @__PURE__ */ React23.createElement(FormularioPublico, { token: TOKEN_FORMULARIO }));
  }
  return /* @__PURE__ */ React23.createElement(React23.Fragment, null, /* @__PURE__ */ React23.createElement(EstiloGlobal, { dark }), authSession === void 0 ? /* @__PURE__ */ React23.createElement(TelaCarregandoAuth, null) : authSession === null ? /* @__PURE__ */ React23.createElement(TelaAutenticacao, { redirectTo: window.location.origin }) : negocioAberto && !negocioAberto.configuracao?.onboarded ? /* @__PURE__ */ React23.createElement(ClienteNovo, { negocio: negocioAberto, onConcluido: fecharNegocio, onVoltarSemSalvar: fecharNegocio }) : negocioAberto ? (
    /* `key={negocioAberto.id}` desmonta e remonta o Livro inteiro ao
       trocar de negócio — é o que elimina por construção a classe de
       bug H3 do ContLife (doc 26): sem isso, o estado em memória de
       um negócio podia vazar para dentro da chave do próximo por um
       instante, entre trocar o id e a carga nova terminar. */
    /* @__PURE__ */ React23.createElement(Livro, { key: negocioAberto.id, negocio: negocioAberto, onVoltar: fecharNegocio, onNegocioAtualizado: atualizarNegocioAberto })
  ) : painelAberto ? /* @__PURE__ */ React23.createElement(PainelDoMes, { onVoltar: () => setPainelAberto(false) }) : /* @__PURE__ */ React23.createElement(Negocios, { onAbrirNegocio: setNegocioAberto, onAbrirPainel: () => setPainelAberto(true) }));
}
export {
  App as default
};
