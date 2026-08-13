// src/app/App.jsx
import React12, { useState as useState9, useEffect as useEffect6 } from "react";

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
var Input = ({ mono, money, num, className = "", ...p }) => /* @__PURE__ */ React2.createElement(
  "input",
  {
    ...p,
    inputMode: money ? "decimal" : num ? "numeric" : p.inputMode,
    enterKeyHint: p.enterKeyHint || (money || num ? "done" : void 0),
    className: `w-full rounded-md border px-3 py-2 text-sm transition-colors duration-150 ${money || num ? "text-right tabular-nums" : ""} ${className}`,
    style: { borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)", fontFamily: mono || money || num ? "var(--font-mono)" : "var(--font-body)" }
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
import { Building2, Plus, X } from "lucide-react";
var TIPO_LABEL = { mei: "MEI", informal: "Informal" };
function CardNegocio({ negocio, recemCriado, onAbrir }) {
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
    /* @__PURE__ */ React4.createElement("div", { className: "mt-3 text-xs", style: { color: "var(--muted)" } }, negocio.situacao !== "ativo" ? "Encerrado" : negocio.configuracao?.onboarded ? "Nenhum lan\xE7amento novo ainda" : "Roteiro do Cliente Novo pendente")
  );
}
function FormularioNovoNegocio({ onCriado, onFechar }) {
  const [nome, setNome] = useState3("");
  const [apelido, setApelido] = useState3("");
  const [tipo, setTipo] = useState3("mei");
  const [salvando, setSalvando] = useState3(false);
  const [erro, setErro] = useState3("");
  const salvar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("D\xE1 um nome pro neg\xF3cio \u2014 pode ser s\xF3 o nome do cliente.");
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
  ] })), erro && /* @__PURE__ */ React4.createElement("div", { className: "text-xs rounded-md px-3 py-2", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React4.createElement(Button, { type: "submit", disabled: salvando }, salvando ? "Criando\u2026" : "Criar neg\xF3cio")));
}
function Negocios({ onAbrirNegocio }) {
  const [negocios, setNegocios] = useState3(null);
  const [mostrarForm, setMostrarForm] = useState3(false);
  const [recemCriadoId, setRecemCriadoId] = useState3(null);
  const [erro, setErro] = useState3("");
  const [confirmacao, setConfirmacao] = useState3(false);
  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from("negocios").select("id, nome, apelido, tipo, situacao, created_at, configuracao").order("created_at", { ascending: false });
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
  return /* @__PURE__ */ React4.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React4.createElement("div", { className: "max-w-3xl mx-auto px-5 py-8" }, /* @__PURE__ */ React4.createElement("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("div", { className: "text-xl font-bold", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, "Seus neg\xF3cios"), /* @__PURE__ */ React4.createElement("div", { className: "text-xs mt-1", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "a prateleira")), !mostrarForm && /* @__PURE__ */ React4.createElement(Button, { onClick: () => setMostrarForm(true) }, /* @__PURE__ */ React4.createElement(Plus, { size: 15 }), " Novo neg\xF3cio")), /* @__PURE__ */ React4.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React4.createElement(Confirmacao, { texto: "Neg\xF3cio criado.", ativa: confirmacao })), mostrarForm && /* @__PURE__ */ React4.createElement(FormularioNovoNegocio, { onCriado: aoCriar, onFechar: () => setMostrarForm(false) }), erro && /* @__PURE__ */ React4.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), negocios === null && /* @__PURE__ */ React4.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Carregando\u2026"), negocios !== null && negocios.length === 0 && !mostrarForm && /* @__PURE__ */ React4.createElement(Card, { className: "text-center py-12" }, /* @__PURE__ */ React4.createElement(Building2, { size: 28, className: "mx-auto mb-3", style: { color: "var(--muted)" } }), /* @__PURE__ */ React4.createElement("div", { className: "text-sm", style: { color: "var(--ink)" } }, "Nenhum neg\xF3cio cadastrado ainda."), /* @__PURE__ */ React4.createElement("div", { className: "text-xs mt-1 mb-4", style: { color: "var(--muted)" } }, "O primeiro passo \xE9 criar o neg\xF3cio do seu primeiro cliente."), /* @__PURE__ */ React4.createElement(Button, { onClick: () => setMostrarForm(true) }, /* @__PURE__ */ React4.createElement(Plus, { size: 15 }), " Criar o primeiro")), negocios !== null && negocios.length > 0 && /* @__PURE__ */ React4.createElement("div", { className: "grid gap-3 sm:grid-cols-2" }, negocios.map((n) => /* @__PURE__ */ React4.createElement(CardNegocio, { key: n.id, negocio: n, recemCriado: n.id === recemCriadoId, onAbrir: onAbrirNegocio })))));
}

// src/telas/ClienteNovo.jsx
import React5, { useState as useState4, useEffect as useEffect4 } from "react";
import { Plus as Plus2, Trash2, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";

// src/dominio/planoContas.mjs
function planoDeFabrica() {
  return [
    // ── 1. Ativo ──────────────────────────────────────────────
    { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo", subtipo: "circulante", ordem: 1 },
    { id: "banco", codigo: "1102", nome: "Banco", tipo: "ativo", subtipo: "circulante", ordem: 2 },
    { id: "maquininha_receber", codigo: "1103", nome: "A receber de maquininha", tipo: "ativo", subtipo: "circulante", ordem: 3 },
    { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo", subtipo: "circulante", ordem: 4 },
    { id: "estoque", codigo: "1105", nome: "Estoque", tipo: "ativo", subtipo: "circulante", ordem: 5 },
    { id: "equipamentos", codigo: "1106", nome: "Equipamentos", tipo: "ativo", subtipo: "nao_circulante", ordem: 6 },
    { id: "veiculos", codigo: "1107", nome: "Ve\xEDculos", tipo: "ativo", subtipo: "nao_circulante", ordem: 7 },
    { id: "deprec_acum", codigo: "1108", nome: "Deprecia\xE7\xE3o acumulada", tipo: "ativo", subtipo: "contra", ordem: 8 },
    // ── 2. Passivo ────────────────────────────────────────────
    { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo", subtipo: "circulante", ordem: 1 },
    { id: "das_a_pagar", codigo: "2102", nome: "DAS a pagar", tipo: "passivo", subtipo: "circulante", ordem: 2 },
    { id: "emprestimos", codigo: "2103", nome: "Empr\xE9stimos", tipo: "passivo", subtipo: "circulante", ordem: 3 },
    { id: "salarios_a_pagar", codigo: "2104", nome: "Sal\xE1rios a pagar", tipo: "passivo", subtipo: "circulante", ordem: 4 },
    // ── 3. Patrimônio líquido ─────────────────────────────────
    { id: "capital_titular", codigo: "3101", nome: "Capital do titular", tipo: "pl", ordem: 1 },
    { id: "retiradas_titular", codigo: "3102", nome: "Retiradas do titular", tipo: "pl", ordem: 2 },
    { id: "lucros_acumulados", codigo: "3103", nome: "Lucros acumulados", tipo: "pl", ordem: 3 },
    // ── 4. Receitas ───────────────────────────────────────────
    { id: "venda_mercadorias", codigo: "4101", nome: "Venda de mercadorias", tipo: "receita", ordem: 1 },
    { id: "prestacao_servicos", codigo: "4102", nome: "Presta\xE7\xE3o de servi\xE7os", tipo: "receita", ordem: 2 },
    { id: "outras_receitas", codigo: "4103", nome: "Outras receitas", tipo: "receita", ordem: 3 },
    // ── 5. Despesas ───────────────────────────────────────────
    { id: "cmv", codigo: "5101", nome: "CMV", tipo: "despesa", ordem: 1 },
    { id: "aluguel", codigo: "5102", nome: "Aluguel", tipo: "despesa", ordem: 2 },
    { id: "energia", codigo: "5103", nome: "Energia", tipo: "despesa", ordem: 3 },
    { id: "agua", codigo: "5104", nome: "\xC1gua", tipo: "despesa", ordem: 4 },
    { id: "internet_telefone", codigo: "5105", nome: "Internet e telefone", tipo: "despesa", ordem: 5 },
    { id: "taxa_maquininha", codigo: "5106", nome: "Taxa de maquininha", tipo: "despesa", ordem: 6 },
    { id: "combustivel", codigo: "5107", nome: "Combust\xEDvel", tipo: "despesa", ordem: 7 },
    { id: "material_consumo", codigo: "5108", nome: "Material de consumo", tipo: "despesa", ordem: 8 },
    { id: "marketing", codigo: "5109", nome: "Marketing", tipo: "despesa", ordem: 9 },
    { id: "das_despesa", codigo: "5110", nome: "DAS", tipo: "despesa", ordem: 10 },
    { id: "depreciacao", codigo: "5111", nome: "Deprecia\xE7\xE3o", tipo: "despesa", ordem: 11 },
    { id: "tarifas_bancarias", codigo: "5112", nome: "Tarifas banc\xE1rias", tipo: "despesa", ordem: 12 },
    { id: "outras_despesas", codigo: "5113", nome: "Outras despesas", tipo: "despesa", ordem: 13 }
  ];
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
function BlocoAbertura({ abertura, setAbertura, perguntas }) {
  const porBloco3 = (ordem) => perguntas.find((p) => p.bloco === 3 && p.ordem === ordem)?.porque_importa;
  return /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("div", { className: "text-xs mb-5", style: { color: "var(--muted)" } }, "Todo cliente chega no meio da vida \u2014 esta \xE9 a foto do que ele tem e do que deve hoje. Valor aproximado est\xE1 de bom tamanho; tudo \xE9 corrig\xEDvel depois, com rastro."), /* @__PURE__ */ React5.createElement("div", { className: "grid grid-cols-2 gap-3 mb-6" }, /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement(Label, null, "Dinheiro em esp\xE9cie"), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "0,00", value: abertura.caixa, onChange: (e) => setAbertura({ ...abertura, caixa: e.target.value }) })), /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement(Label, null, "Na conta (banco)"), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "0,00", value: abertura.banco, onChange: (e) => setAbertura({ ...abertura, banco: e.target.value }) }))), /* @__PURE__ */ React5.createElement(PorQueImporta, { texto: porBloco3(1) }), /* @__PURE__ */ React5.createElement(
    ListaItens,
    {
      titulo: "O que o neg\xF3cio tem que vale dinheiro (equipamentos, m\xF3veis, ve\xEDculo)",
      porque: porBloco3(2),
      itens: abertura.equipamentos,
      onChange: (v) => setAbertura({ ...abertura, equipamentos: v })
    }
  ), /* @__PURE__ */ React5.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React5.createElement(Label, null, "Mercadoria parada (valor total aproximado)"), /* @__PURE__ */ React5.createElement(Input, { money: true, placeholder: "0,00", value: abertura.estoque, onChange: (e) => setAbertura({ ...abertura, estoque: e.target.value }) }), /* @__PURE__ */ React5.createElement(PorQueImporta, { texto: porBloco3(3) })), /* @__PURE__ */ React5.createElement(
    ListaItens,
    {
      titulo: "Quem te deve, quanto, e para quando",
      comVencimento: true,
      porque: porBloco3(4),
      itens: abertura.aReceber,
      onChange: (v) => setAbertura({ ...abertura, aReceber: v })
    }
  ), /* @__PURE__ */ React5.createElement(
    ListaItens,
    {
      titulo: "Quanto voc\xEA deve, para quem, e quando vence",
      comVencimento: true,
      porque: porBloco3(5),
      itens: abertura.aPagar,
      onChange: (v) => setAbertura({ ...abertura, aPagar: v })
    }
  ), /* @__PURE__ */ React5.createElement(
    ListaItens,
    {
      titulo: "Empr\xE9stimo ou financiamento (saldo devedor)",
      porque: porBloco3(6),
      itens: abertura.emprestimos,
      onChange: (v) => setAbertura({ ...abertura, emprestimos: v })
    }
  ));
}
function ClienteNovo({ negocio, onConcluido, onVoltarSemSalvar }) {
  const [perguntas, setPerguntas] = useState4([]);
  const [bloco, setBloco] = useState4(1);
  const [respostas, setRespostas] = useState4({});
  const [abertura, setAbertura] = useState4({ caixa: "", banco: "", equipamentos: [], estoque: "", aReceber: [], aPagar: [], emprestimos: [] });
  const [salvando, setSalvando] = useState4(false);
  const [erro, setErro] = useState4("");
  useEffect4(() => {
    supabase.from("roteiro_perguntas").select("*").eq("ativo", true).order("bloco").order("ordem").then(({ data, error }) => {
      if (!error) setPerguntas(data || []);
    });
  }, []);
  const perguntasDoBloco = (n) => perguntas.filter((p) => p.bloco === n && p.destino !== "negocios.tipo");
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
    const estoque = numeroOuNulo(abertura.estoque);
    if (estoque) itens.push({ contaId: "estoque", tipo: "D", valor: estoque, descricao: "Mercadoria em estoque" });
    for (const r of abertura.aReceber) {
      const v = numeroOuNulo(r.valor);
      if (v) itens.push({ contaId: "clientes", tipo: "D", valor: v, descricao: r.descricao || null, vencimento: r.vencimento || null });
    }
    for (const p of abertura.aPagar) {
      const v = numeroOuNulo(p.valor);
      if (v) itens.push({ contaId: "fornecedores", tipo: "C", valor: v, descricao: p.descricao || null, vencimento: p.vencimento || null });
    }
    for (const e of abertura.emprestimos) {
      const v = numeroOuNulo(e.valor);
      if (v) itens.push({ contaId: "emprestimos", tipo: "C", valor: v, descricao: e.descricao || null });
    }
    return itens;
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
        ...planoDeFabrica().map((c) => ({
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
        }))
      ];
      const { error: erroLote } = await supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
      if (erroLote) throw new Error(`N\xE3o consegui gravar o balan\xE7o de abertura: ${erroLote.message}`);
      const bloco1 = respostas;
      const patchNegocio = { inicio_do_servico: hojeISO(), configuracao: { ...negocio.configuracao || {}, onboarded: true } };
      for (const p of perguntas) {
        if (p.bloco !== 1) continue;
        const valor = respostas[p.id];
        if (valor === void 0 || valor === "") continue;
        if (p.destino === "negocios.data_abertura") patchNegocio.data_abertura = valor;
        if (p.destino === "negocios.atividade") patchNegocio.atividade = valor;
        if (p.destino === "negocios.tem_funcionario") patchNegocio.tem_funcionario = valor === "sim";
        if (p.destino === "negocios.whatsapp") patchNegocio.whatsapp = valor;
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
  return /* @__PURE__ */ React5.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React5.createElement("div", { className: "max-w-2xl mx-auto px-5 py-8" }, /* @__PURE__ */ React5.createElement("button", { onClick: onVoltarSemSalvar, className: "inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React5.createElement(ArrowLeft, { size: 14 }), " Voltar"), /* @__PURE__ */ React5.createElement("div", { className: "mb-2 text-xs", style: { color: "var(--muted)", fontFamily: "var(--font-mono)" } }, "Roteiro do Cliente Novo \xB7 Bloco ", bloco, " de 6"), /* @__PURE__ */ React5.createElement("div", { className: "text-xl font-bold mb-6", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, negocio.apelido || negocio.nome, " \u2014 ", NOMES_BLOCO[bloco]), /* @__PURE__ */ React5.createElement("div", { className: "flex gap-1 mb-8" }, [1, 2, 3, 4, 5, 6].map((n) => /* @__PURE__ */ React5.createElement(
    "div",
    {
      key: n,
      className: "h-1 flex-1 rounded-full transition-colors duration-300",
      style: { background: n <= bloco ? "var(--gold)" : "var(--rule-faint)" }
    }
  ))), /* @__PURE__ */ React5.createElement(Card, { className: "mb-6" }, bloco === 3 ? /* @__PURE__ */ React5.createElement(BlocoAbertura, { abertura, setAbertura, perguntas }) : perguntasDoBloco(bloco).map((p) => /* @__PURE__ */ React5.createElement(
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
import React11, { useState as useState8, useEffect as useEffect5, useRef as useRef2, useCallback as useCallback2 } from "react";
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
       depois da 0001 — o schema evolui por ALTER, nunca editando
       migração já aplicada (docs/06 §1). */
    campos: ["id", "lancamentoId", "contaId", "tipo", "valor", "descricao", "vencimento"],
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
import React6, { useMemo } from "react";
var fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
var ORIGEM_LABEL = { manual: "Manual", extrato: "Extrato", recorrente: "Recorrente", abertura: "Abertura", encerramento_mes: "Fechamento", encerramento_ano: "Encerramento" };
function Diario({ contas, lancamentos, lancamentoLinhas }) {
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
    return /* @__PURE__ */ React6.createElement(Card, { key: l.id, pad: "apertado" }, /* @__PURE__ */ React6.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React6.createElement("div", null, /* @__PURE__ */ React6.createElement("span", { className: "font-mono text-xs mr-2", style: { color: "var(--muted)" } }, fmtData(l.data)), /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--ink)" } }, l.descricao)), /* @__PURE__ */ React6.createElement("span", { className: "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full", style: { background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" } }, ORIGEM_LABEL[l.origem] || l.origem)), /* @__PURE__ */ React6.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ React6.createElement("tbody", null, linhas.map((linha) => /* @__PURE__ */ React6.createElement("tr", { key: linha.id }, /* @__PURE__ */ React6.createElement("td", { className: "py-0.5 pr-2", style: { color: linha.tipo === "D" ? "var(--ink)" : "var(--muted)", paddingLeft: linha.tipo === "C" ? "1.5rem" : 0 } }, linha.tipo === "D" ? "D" : "C", " ", nomeConta.get(linha.contaId) || linha.contaId, linha.descricao ? /* @__PURE__ */ React6.createElement("span", { style: { color: "var(--muted)" } }, " \u2014 ", linha.descricao) : null), /* @__PURE__ */ React6.createElement("td", { className: "py-0.5 text-right tabular-nums" }, fmt(linha.valor)))))));
  }));
}

// src/telas/Razao.jsx
import React7, { useState as useState5, useMemo as useMemo2 } from "react";

// src/dominio/razao.mjs
var DEBITO_NORMAL = { ativo: true, despesa: true, passivo: false, pl: false, receita: false };
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

// src/telas/Razao.jsx
var fmt2 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData2 = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
function Razao({ contas, lancamentos, lancamentoLinhas }) {
  const contasOrdenadas = useMemo2(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const [contaId, setContaId] = useState5(contasOrdenadas[0]?.id || "");
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
  return /* @__PURE__ */ React7.createElement("div", null, /* @__PURE__ */ React7.createElement("div", { className: "mb-4 max-w-xs" }, /* @__PURE__ */ React7.createElement(Select, { value: contaId, onChange: setContaId, options: contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` })) })), /* @__PURE__ */ React7.createElement(Card, null, linhas.length === 0 ? /* @__PURE__ */ React7.createElement("div", { className: "text-center py-8 text-sm", style: { color: "var(--muted)" } }, "Nenhum lan\xE7amento nesta conta ainda.") : /* @__PURE__ */ React7.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React7.createElement("thead", null, /* @__PURE__ */ React7.createElement("tr", { style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React7.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "Data"), /* @__PURE__ */ React7.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "Descri\xE7\xE3o"), /* @__PURE__ */ React7.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "D\xE9bito"), /* @__PURE__ */ React7.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "Cr\xE9dito"), /* @__PURE__ */ React7.createElement("th", { className: "text-right py-2", style: { color: "var(--muted)" } }, "Saldo"))), /* @__PURE__ */ React7.createElement("tbody", null, linhas.map((l) => /* @__PURE__ */ React7.createElement("tr", { key: l.id, style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3 font-mono text-xs", style: { color: "var(--muted)" } }, fmtData2(l.data)), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3" }, l.descricao || l.lancDescricao), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, l.tipo === "D" ? fmt2(l.valor) : "\u2014"), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, l.tipo === "C" ? fmt2(l.valor) : "\u2014"), /* @__PURE__ */ React7.createElement("td", { className: "py-1.5 text-right tabular-nums font-medium" }, fmt2(l.saldoCorrente))))))));
}

// src/telas/Balancete.jsx
import React8 from "react";
var TIPO_LABEL2 = { ativo: "Ativo", passivo: "Passivo", pl: "Patrim\xF4nio L\xEDquido", receita: "Receita", despesa: "Despesa" };
var fmt3 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
function Balancete({ contas, lancamentoLinhas }) {
  const b = balancete(contas, lancamentoLinhas);
  return /* @__PURE__ */ React8.createElement(Card, null, /* @__PURE__ */ React8.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React8.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ React8.createElement("thead", null, /* @__PURE__ */ React8.createElement("tr", { style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React8.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "C\xF3digo"), /* @__PURE__ */ React8.createElement("th", { className: "text-left py-2 pr-3", style: { color: "var(--muted)" } }, "Conta"), /* @__PURE__ */ React8.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "D\xE9bito"), /* @__PURE__ */ React8.createElement("th", { className: "text-right py-2 pr-3", style: { color: "var(--muted)" } }, "Cr\xE9dito"), /* @__PURE__ */ React8.createElement("th", { className: "text-right py-2", style: { color: "var(--muted)" } }, "Saldo"))), /* @__PURE__ */ React8.createElement("tbody", null, b.linhas.filter((c) => c.debito || c.credito).map((c) => /* @__PURE__ */ React8.createElement("tr", { key: c.id, style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3 font-mono text-xs", style: { color: "var(--muted)" } }, c.codigo), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3" }, c.nome, /* @__PURE__ */ React8.createElement("span", { className: "text-[10px] ml-2 uppercase tracking-wide", style: { color: "var(--muted)" } }, TIPO_LABEL2[c.tipo])), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, c.debito ? fmt3(c.debito) : "\u2014"), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 pr-3 text-right tabular-nums" }, c.credito ? fmt3(c.credito) : "\u2014"), /* @__PURE__ */ React8.createElement("td", { className: "py-1.5 text-right tabular-nums font-medium", style: { color: "var(--ink)" } }, fmt3(c.saldo)))), b.linhas.every((c) => !c.debito && !c.credito) && /* @__PURE__ */ React8.createElement("tr", null, /* @__PURE__ */ React8.createElement("td", { colSpan: 5, className: "py-8 text-center text-sm", style: { color: "var(--muted)" } }, "Nenhum lan\xE7amento ainda."))), /* @__PURE__ */ React8.createElement("tfoot", null, /* @__PURE__ */ React8.createElement("tr", { style: { borderTop: "2px solid var(--rule)" } }, /* @__PURE__ */ React8.createElement("td", { colSpan: 2, className: "py-2 pr-3 font-medium" }, "Total"), /* @__PURE__ */ React8.createElement("td", { className: "py-2 pr-3 text-right tabular-nums font-medium" }, fmt3(b.totalDebito)), /* @__PURE__ */ React8.createElement("td", { className: "py-2 pr-3 text-right tabular-nums font-medium" }, fmt3(b.totalCredito)), /* @__PURE__ */ React8.createElement("td", { className: "py-2 text-right" }, /* @__PURE__ */ React8.createElement("span", { className: "text-xs px-2 py-1 rounded-full", style: { background: b.fecha ? "var(--credit-soft)" : "var(--debit-soft)", color: b.fecha ? "var(--credit)" : "var(--debit)" } }, b.fecha ? "fecha \u2713" : "n\xE3o fecha \u26A0")))))));
}

// src/telas/Lancar.jsx
import React9, { useState as useState6, useMemo as useMemo3 } from "react";
import { Plus as Plus3, Trash2 as Trash22 } from "lucide-react";
var uid = () => Math.random().toString(36).slice(2, 10);
var hojeISO2 = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var fmt4 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var linhaVazia = () => ({ chave: uid(), contaId: "", tipo: "D", valor: "", descricao: "" });
function Lancar({ contas, onAdicionar }) {
  const contasOrdenadas = useMemo3(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const opcoesContas = contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` }));
  const [data, setData] = useState6(hojeISO2());
  const [descricao, setDescricao] = useState6("");
  const [linhas, setLinhas] = useState6([linhaVazia(), linhaVazia()]);
  const [confirmado, setConfirmado] = useState6(false);
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
  const gravar = () => {
    if (!podeGravar) return;
    const idLancamento = uid();
    onAdicionar({
      lancamento: { id: idLancamento, data, dataCompetencia: data, descricao: descricao.trim(), origem: "manual", documento: null },
      linhas: linhasValidas.map((l) => ({
        id: uid(),
        lancamentoId: idLancamento,
        contaId: l.contaId,
        tipo: l.tipo,
        valor: numero(l.valor),
        descricao: l.descricao.trim() || null,
        vencimento: null
      }))
    });
    setData(hojeISO2());
    setDescricao("");
    setLinhas([linhaVazia(), linhaVazia()]);
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2e3);
  };
  return /* @__PURE__ */ React9.createElement(Card, null, /* @__PURE__ */ React9.createElement("div", { className: "grid grid-cols-2 gap-3 mb-4" }, /* @__PURE__ */ React9.createElement("div", null, /* @__PURE__ */ React9.createElement(Label, null, "Data"), /* @__PURE__ */ React9.createElement(Input, { type: "date", value: data, onChange: (e) => setData(e.target.value) })), /* @__PURE__ */ React9.createElement("div", null, /* @__PURE__ */ React9.createElement(Label, null, "Descri\xE7\xE3o"), /* @__PURE__ */ React9.createElement(Input, { value: descricao, onChange: (e) => setDescricao(e.target.value), placeholder: "ex.: Venda do dia" }))), /* @__PURE__ */ React9.createElement(Label, null, "Linhas"), linhas.map((l) => /* @__PURE__ */ React9.createElement("div", { key: l.chave, className: "flex gap-2 mb-2 items-center animate-[surgir_.2s_ease-out]" }, /* @__PURE__ */ React9.createElement(Select, { value: l.tipo, onChange: (v) => editarLinha(l.chave, "tipo", v), options: [{ value: "D", label: "D" }, { value: "C", label: "C" }] }), /* @__PURE__ */ React9.createElement("div", { className: "flex-[2]" }, /* @__PURE__ */ React9.createElement(Select, { value: l.contaId, onChange: (v) => editarLinha(l.chave, "contaId", v), placeholder: "conta", options: opcoesContas })), /* @__PURE__ */ React9.createElement(Input, { money: true, placeholder: "valor", value: l.valor, onChange: (e) => editarLinha(l.chave, "valor", e.target.value), className: "flex-1" }), /* @__PURE__ */ React9.createElement("button", { type: "button", onClick: () => removerLinha(l.chave), disabled: linhas.length <= 2, className: "transition-opacity hover:opacity-70 disabled:opacity-30 shrink-0", style: { color: "var(--debit)" }, "aria-label": "Remover" }, /* @__PURE__ */ React9.createElement(Trash22, { size: 15 })))), /* @__PURE__ */ React9.createElement("button", { type: "button", onClick: adicionarLinha, className: "text-xs inline-flex items-center gap-1 mt-1 mb-4 transition-opacity hover:opacity-70", style: { color: "var(--accent)" } }, /* @__PURE__ */ React9.createElement(Plus3, { size: 13 }), " adicionar linha"), /* @__PURE__ */ React9.createElement("div", { className: "flex items-center justify-between mb-4 text-xs", style: { color: "var(--muted)" } }, /* @__PURE__ */ React9.createElement("span", null, "D\xE9bitos: ", fmt4(somaD), " \xB7 Cr\xE9ditos: ", fmt4(somaC)), diferenca !== 0 && /* @__PURE__ */ React9.createElement(AlertLine, null, "Diferen\xE7a de ", fmt4(Math.abs(diferenca)), " \u2014 o lan\xE7amento precisa fechar antes de gravar")), /* @__PURE__ */ React9.createElement(Button, { onClick: gravar, disabled: !podeGravar }, "Lan\xE7ar"), confirmado && /* @__PURE__ */ React9.createElement("span", { className: "ml-3 text-xs", style: { color: "var(--credit)" } }, "Lan\xE7ado."));
}

// src/telas/CaixaEntrada.jsx
import React10, { useState as useState7, useMemo as useMemo4 } from "react";
import { Upload, Check, X as X2, HelpCircle as HelpCircle2 } from "lucide-react";

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
var uid2 = () => Math.random().toString(36).slice(2, 10);
var fmt5 = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
var fmtData3 = (d) => d ? d.split("-").reverse().join("/") : "\u2014";
var CONTAS_TRANSITO = [{ value: "caixa", label: "Caixa (dinheiro)" }, { value: "banco", label: "Banco" }];
function ImportarExtrato({ onImportar }) {
  const [texto, setTexto] = useState7("");
  const [contaOrigem, setContaOrigem] = useState7("banco");
  const [linhas, setLinhas] = useState7(null);
  const [erro, setErro] = useState7("");
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
      id: uid2(),
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
  ), erro && /* @__PURE__ */ React10.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-3", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React10.createElement(Button, { onClick: processar }, "Processar")) : /* @__PURE__ */ React10.createElement(React10.Fragment, null, /* @__PURE__ */ React10.createElement("div", { className: "text-xs mb-3", style: { color: "var(--muted)" } }, linhas.length, " linha(s) encontrada(s) \u2014 confira antes de importar:"), /* @__PURE__ */ React10.createElement("div", { className: "max-h-56 overflow-y-auto mb-3 text-xs" }, linhas.map((l, i) => /* @__PURE__ */ React10.createElement("div", { key: i, className: "flex justify-between py-1", style: { borderBottom: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React10.createElement("span", { style: { color: "var(--muted)" } }, fmtData3(l.data)), /* @__PURE__ */ React10.createElement("span", { className: "flex-1 mx-2 truncate" }, l.descricaoBruta), /* @__PURE__ */ React10.createElement("span", { className: "tabular-nums" }, fmt5(l.valor))))), /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React10.createElement(Button, { onClick: confirmar }, "Importar ", linhas.length, " linha(s)"), /* @__PURE__ */ React10.createElement(Button, { variant: "ghost", onClick: () => setLinhas(null) }, "Cancelar"))));
}
function ItemPendente({ item, contas, regras, onClassificar, onPessoal, onDuvida }) {
  const [classificando, setClassificando] = useState7(false);
  const sugestao = useMemo4(() => sugerirConta(item.descricaoBruta, regras), [item.descricaoBruta, regras]);
  const [contaId, setContaId] = useState7(sugestao?.contaId || "");
  const [padrao, setPadrao] = useState7(sugestao?.padrao || item.descricaoBruta);
  const contasOrdenadas = useMemo4(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const confirmar = () => {
    if (!contaId) return;
    onClassificar({ item, contaCategoriaId: contaId, padrao: padrao.trim() || item.descricaoBruta });
    setClassificando(false);
  };
  return /* @__PURE__ */ React10.createElement(Card, { pad: "apertado", className: "mb-2" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React10.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React10.createElement("div", { className: "text-xs", style: { color: "var(--muted)" } }, fmtData3(item.data), " \xB7 ", item.contaOrigemId === "banco" ? "Banco" : "Caixa"), /* @__PURE__ */ React10.createElement("div", { className: "truncate", style: { color: "var(--ink)" } }, item.descricaoBruta), sugestao && !classificando && /* @__PURE__ */ React10.createElement("div", { className: "text-[10px] mt-0.5", style: { color: "var(--accent)" } }, "sugest\xE3o: ", contas.find((c) => c.id === sugestao.contaId)?.nome)), /* @__PURE__ */ React10.createElement("div", { className: "text-sm tabular-nums shrink-0", style: { color: item.valor >= 0 ? "var(--credit)" : "var(--debit)" } }, fmt5(item.valor))), classificando ? /* @__PURE__ */ React10.createElement("div", { className: "mt-3 pt-3 space-y-2", style: { borderTop: "1px solid var(--rule-faint)" } }, /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement(Label, null, "Categoria"), /* @__PURE__ */ React10.createElement(Select, { value: contaId, onChange: setContaId, placeholder: "escolha a conta", options: contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} \u2014 ${c.nome}` })) })), /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement(Label, null, "Padr\xE3o para lembrar da pr\xF3xima vez"), /* @__PURE__ */ React10.createElement(Input, { value: padrao, onChange: (e) => setPadrao(e.target.value) })), /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2 pt-1" }, /* @__PURE__ */ React10.createElement(Button, { small: true, onClick: confirmar, disabled: !contaId }, "Confirmar"), /* @__PURE__ */ React10.createElement(Button, { small: true, variant: "ghost", onClick: () => setClassificando(false) }, "Cancelar"))) : /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2 mt-2" }, /* @__PURE__ */ React10.createElement(Button, { small: true, onClick: () => setClassificando(true) }, /* @__PURE__ */ React10.createElement(Check, { size: 12 }), " Classificar"), /* @__PURE__ */ React10.createElement(Button, { small: true, variant: "ghost", onClick: () => onPessoal(item) }, /* @__PURE__ */ React10.createElement(X2, { size: 12 }), " \xC9 pessoal"), /* @__PURE__ */ React10.createElement(Button, { small: true, variant: "ghost", onClick: () => onDuvida(item) }, /* @__PURE__ */ React10.createElement(HelpCircle2, { size: 12 }), " N\xE3o sei")));
}
function CaixaEntrada({ contas, entradaItens, regrasClassificacao, onImportar, onClassificar, onPessoal, onDuvida }) {
  const pendentes = entradaItens.filter((i) => i.situacao === "pendente" || i.situacao === "duvida");
  return /* @__PURE__ */ React10.createElement("div", null, /* @__PURE__ */ React10.createElement(ImportarExtrato, { onImportar }), /* @__PURE__ */ React10.createElement("div", { className: "text-xs mb-3", style: { color: "var(--muted)" } }, pendentes.length, " item(ns) esperando classifica\xE7\xE3o"), pendentes.length === 0 ? /* @__PURE__ */ React10.createElement(Card, { className: "text-center py-10" }, /* @__PURE__ */ React10.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "Nada esperando \u2014 importe um extrato acima.")) : pendentes.map((item) => /* @__PURE__ */ React10.createElement(
    ItemPendente,
    {
      key: item.id,
      item,
      contas,
      regras: regrasClassificacao,
      onClassificar,
      onPessoal,
      onDuvida
    }
  )));
}

// src/telas/Livro.jsx
var uid3 = () => Math.random().toString(36).slice(2, 10);
var ABAS = [
  { id: "caixa", label: "Caixa de Entrada" },
  { id: "lancar", label: "Lan\xE7ar" },
  { id: "diario", label: "Di\xE1rio" },
  { id: "razao", label: "Raz\xE3o" },
  { id: "balancete", label: "Balancete" }
];
function Livro({ negocio, onVoltar }) {
  const [aba, setAba] = useState8("caixa");
  const [estado, setEstado] = useState8(null);
  const [loaded, setLoaded] = useState8(false);
  const [erro, setErro] = useState8("");
  const [salvando, setSalvando] = useState8(false);
  const [confirmado, setConfirmado] = useState8(false);
  const fotoRef = useRef2(null);
  const estadoRef = useRef2(null);
  const timerRef = useRef2(null);
  useEffect5(() => {
    estadoRef.current = estado;
  }, [estado]);
  useEffect5(() => {
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
  useEffect5(() => {
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
  useEffect5(() => {
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
  const adicionarLancamento = useCallback2(({ lancamento, linhas }) => {
    setEstado((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, lancamento],
      lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas]
    }));
  }, []);
  const importarItens = useCallback2((itens) => {
    setEstado((prev) => ({ ...prev, entradaItens: [...prev.entradaItens, ...itens] }));
  }, []);
  const marcarSituacao = useCallback2((item, situacao) => {
    setEstado((prev) => ({
      ...prev,
      entradaItens: prev.entradaItens.map((i) => i.id === item.id ? { ...i, situacao } : i)
    }));
  }, []);
  const classificarItem = useCallback2(({ item, contaCategoriaId, padrao }) => {
    setEstado((prev) => {
      const { lancamento, linhas } = construirLancamentoDeClassificacao(item, contaCategoriaId);
      const regraExistente = prev.regrasClassificacao.find(
        (r) => (r.padrao || "").toUpperCase() === padrao.toUpperCase() && r.contaId === contaCategoriaId
      );
      const regrasClassificacao = regraExistente ? prev.regrasClassificacao.map((r) => r === regraExistente ? { ...r, acertos: (r.acertos || 1) + 1 } : r) : [...prev.regrasClassificacao, { id: uid3(), padrao, contaId: contaCategoriaId, acertos: 1 }];
      return {
        ...prev,
        lancamentos: [...prev.lancamentos, lancamento],
        lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
        entradaItens: prev.entradaItens.map((i) => i.id === item.id ? { ...i, situacao: "classificado", lancamentoId: lancamento.id } : i),
        regrasClassificacao
      };
    });
  }, []);
  if (!loaded || !estado) {
    return /* @__PURE__ */ React11.createElement("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--paper)" } }, /* @__PURE__ */ React11.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, erro || "Carregando o livro\u2026"));
  }
  return /* @__PURE__ */ React11.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React11.createElement("div", { className: "max-w-4xl mx-auto px-5 py-8" }, /* @__PURE__ */ React11.createElement("button", { onClick: onVoltar, className: "inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React11.createElement(ArrowLeft2, { size: 14 }), " Voltar"), /* @__PURE__ */ React11.createElement("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ React11.createElement("div", { className: "text-xl font-bold", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, negocio.apelido || negocio.nome), /* @__PURE__ */ React11.createElement(Confirmacao, { texto: salvando ? "Salvando\u2026" : "Salvo.", ativa: salvando || confirmado })), erro && /* @__PURE__ */ React11.createElement("div", { className: "text-xs rounded-md px-3 py-2 mb-4", style: { background: "var(--debit-soft)", color: "var(--debit)" } }, erro), /* @__PURE__ */ React11.createElement(Tabs, { tabs: ABAS, active: aba, onChange: setAba }), aba === "caixa" && /* @__PURE__ */ React11.createElement(
    CaixaEntrada,
    {
      contas: estado.contas,
      entradaItens: estado.entradaItens,
      regrasClassificacao: estado.regrasClassificacao,
      onImportar: importarItens,
      onClassificar: classificarItem,
      onPessoal: (item) => marcarSituacao(item, "pessoal"),
      onDuvida: (item) => marcarSituacao(item, "duvida")
    }
  ), aba === "lancar" && /* @__PURE__ */ React11.createElement(Lancar, { contas: estado.contas, onAdicionar: adicionarLancamento }), aba === "diario" && /* @__PURE__ */ React11.createElement(Diario, { contas: estado.contas, lancamentos: estado.lancamentos, lancamentoLinhas: estado.lancamentoLinhas }), aba === "razao" && /* @__PURE__ */ React11.createElement(Razao, { contas: estado.contas, lancamentos: estado.lancamentos, lancamentoLinhas: estado.lancamentoLinhas }), aba === "balancete" && /* @__PURE__ */ React11.createElement(Balancete, { contas: estado.contas, lancamentoLinhas: estado.lancamentoLinhas })));
}

// src/app/App.jsx
function App() {
  const [authSession, setAuthSession] = useState9(void 0);
  const [dark] = useState9(true);
  const [negocioAberto, setNegocioAberto] = useState9(null);
  useEffect6(() => {
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
  return /* @__PURE__ */ React12.createElement(React12.Fragment, null, /* @__PURE__ */ React12.createElement(EstiloGlobal, { dark }), authSession === void 0 ? /* @__PURE__ */ React12.createElement(TelaCarregandoAuth, null) : authSession === null ? /* @__PURE__ */ React12.createElement(TelaAutenticacao, { redirectTo: window.location.origin }) : negocioAberto && !negocioAberto.configuracao?.onboarded ? /* @__PURE__ */ React12.createElement(ClienteNovo, { negocio: negocioAberto, onConcluido: fecharNegocio, onVoltarSemSalvar: fecharNegocio }) : negocioAberto ? (
    /* `key={negocioAberto.id}` desmonta e remonta o Livro inteiro ao
       trocar de negócio — é o que elimina por construção a classe de
       bug H3 do ContLife (doc 26): sem isso, o estado em memória de
       um negócio podia vazar para dentro da chave do próximo por um
       instante, entre trocar o id e a carga nova terminar. */
    /* @__PURE__ */ React12.createElement(Livro, { key: negocioAberto.id, negocio: negocioAberto, onVoltar: fecharNegocio })
  ) : /* @__PURE__ */ React12.createElement(Negocios, { onAbrirNegocio: setNegocioAberto }));
}
export {
  App as default
};
