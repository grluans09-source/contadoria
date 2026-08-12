// src/app/App.jsx
import React5, { useState as useState4, useEffect as useEffect4 } from "react";
import { ArrowLeft } from "lucide-react";

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
    /* @__PURE__ */ React4.createElement("div", { className: "mt-3 text-xs", style: { color: "var(--muted)" } }, negocio.situacao === "ativo" ? "Nenhum lan\xE7amento ainda" : "Encerrado")
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
    const { data, error } = await supabase.from("negocios").select("id, nome, apelido, tipo, situacao, created_at").order("created_at", { ascending: false });
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

// src/app/App.jsx
function DentroDoNegocio({ negocio, onVoltar }) {
  return /* @__PURE__ */ React5.createElement("div", { className: "min-h-screen", style: { background: "var(--paper)" } }, /* @__PURE__ */ React5.createElement("div", { className: "max-w-3xl mx-auto px-5 py-8" }, /* @__PURE__ */ React5.createElement("button", { onClick: onVoltar, className: "inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70", style: { color: "var(--muted)" } }, /* @__PURE__ */ React5.createElement(ArrowLeft, { size: 14 }), " Voltar"), /* @__PURE__ */ React5.createElement("div", { className: "text-xl font-bold mb-2", style: { fontFamily: "var(--font-display)", color: "var(--ink)" } }, negocio.apelido || negocio.nome), /* @__PURE__ */ React5.createElement("div", { className: "text-sm", style: { color: "var(--muted)" } }, "A Caixa de Entrada e o Livro chegam no pr\xF3ximo passo (docs/06_MODELO_DE_DADOS.md \xA713, passo 5).")));
}
function App() {
  const [authSession, setAuthSession] = useState4(void 0);
  const [dark] = useState4(true);
  const [negocioAberto, setNegocioAberto] = useState4(null);
  useEffect4(() => {
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
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(EstiloGlobal, { dark }), authSession === void 0 ? /* @__PURE__ */ React5.createElement(TelaCarregandoAuth, null) : authSession === null ? /* @__PURE__ */ React5.createElement(TelaAutenticacao, { redirectTo: window.location.origin }) : negocioAberto ? /* @__PURE__ */ React5.createElement(DentroDoNegocio, { negocio: negocioAberto, onVoltar: () => setNegocioAberto(null) }) : /* @__PURE__ */ React5.createElement(Negocios, { onAbrirNegocio: setNegocioAberto }));
}
export {
  App as default
};
