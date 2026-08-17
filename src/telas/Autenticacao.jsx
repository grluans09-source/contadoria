import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { supabase, traduzErroAuth } from "../dados/supabase.mjs";
import { Label, Input, Button } from "../ui/primitivas.jsx";

/* Adaptado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   contlife.jsx (TelaCarregandoAuth + TelaAutenticacao, ~linha 3265-3394,
   12/ago/2026) — docs/01 §2 nota A: "copia quase intacto". A lógica de
   entrar/cadastrar/link mágico/recuperar é idêntica; o que muda é a
   identidade visual (sem LogoMarca — o Contadoria ainda não tem marca
   própria, ver docs/SESSION_STATE.md item "nome e identidade") e o
   wordmark, que ganhou um traço animado no carregamento (docs/04 e o
   pedido do dono, 12/ago: "vivo", sem precisar de mascote). */

function TelaCarregandoAuth() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "var(--paper)" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, letterSpacing: "0.08em", background: "linear-gradient(100deg, var(--word-gold-2), var(--gold))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CONTADORIA</div>
    </div>
  );
}

/* O traço sob o wordmark cresce de 0 até a largura final ao montar — um
   toque de vida no primeiro instante que a pessoa vê a tela, sem ser
   chamativo (uma transição só, ~600ms, e para). */
function TracoAnimado() {
  const [largura, setLargura] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLargura(56));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      className="mx-auto transition-all duration-700 ease-out"
      style={{ height: 0, borderTop: "1px solid var(--gold)", borderBottom: "1px solid var(--gold)", opacity: 0.5, width: largura, marginTop: 10 }}
    />
  );
}

function TelaAutenticacao({ redirectTo }) {
  const [modo, setModo] = useState("entrar"); /* entrar · cadastrar · link_magico · recuperar */
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const trocarModo = (m) => { setModo(m); setErro(""); setMensagem(""); };

  const enviar = async (e) => {
    e.preventDefault();
    setErro(""); setMensagem("");
    const mail = email.trim();
    if (!mail) { setErro("Informe seu e-mail."); return; }
    if ((modo === "entrar" || modo === "cadastrar") && senha.length < 6) { setErro("A senha precisa de pelo menos 6 caracteres."); return; }
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password: senha });
        if (error) throw error;
        /* sucesso: onAuthStateChange no App percebe e troca de tela sozinho */
      } else if (modo === "cadastrar") {
        const { data, error } = await supabase.auth.signUp({ email: mail, password: senha, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        if (data?.user && !data.session) setMensagem(`Quase lá — mandamos um link de confirmação pra ${mail}. Abra seu e-mail (e o spam) e clique nele.`);
      } else if (modo === "link_magico") {
        const { error } = await supabase.auth.signInWithOtp({ email: mail, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        setMensagem(`Mandamos um link pra ${mail} — abra e clique nele. Sem senha nenhuma.`);
      } else if (modo === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo });
        if (error) throw error;
        setMensagem(`Mandamos um link de redefinição pra ${mail}.`);
      }
    } catch (err) {
      setErro(traduzErroAuth(err?.message));
    } finally {
      setCarregando(false);
    }
  };

  const precisaSenha = modo === "entrar" || modo === "cadastrar";
  const rotuloBotao = { entrar: "Entrar", cadastrar: "Criar conta", link_magico: "Mandar link mágico", recuperar: "Mandar link de redefinição" }[modo];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "radial-gradient(120% 80% at 50% -10%, #171206 0%, transparent 55%), var(--paper)" }}>
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em", background: "linear-gradient(100deg, var(--word-gold-2), var(--gold) 45%, var(--word-gold-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CONTADORIA</div>
            <TracoAnimado />
            <div className="nota mt-2" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}>escrituração · revisão · consultoria</div>
          </div>

          {(modo === "entrar" || modo === "cadastrar") && (
            <div className="flex gap-1 mb-5 p-1 rounded-lg border w-full" style={{ borderColor: "var(--rule-faint)", background: "var(--surface)" }}>
              <button onClick={() => trocarModo("entrar")} className="flex-1 rounded-md py-2 text-sm font-medium transition-all duration-150"
                style={modo === "entrar" ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600 } : { color: "var(--muted)" }}>Entrar</button>
              <button onClick={() => trocarModo("cadastrar")} className="flex-1 rounded-md py-2 text-sm font-medium transition-all duration-150"
                style={modo === "cadastrar" ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", fontWeight: 600 } : { color: "var(--muted)" }}>Criar conta</button>
            </div>
          )}
          {(modo === "link_magico" || modo === "recuperar") && (
            <button onClick={() => trocarModo("entrar")} className="text-xs mb-4 inline-flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>← Voltar</button>
          )}

          <form onSubmit={enviar} className="space-y-3">
            <div>
              <Label>E-mail</Label>
              <Input type="email" autoComplete="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
            </div>
            {precisaSenha && (
              <div>
                <Label>Senha</Label>
                <Input type="password" autoComplete={modo === "cadastrar" ? "new-password" : "current-password"} value={senha} onChange={e => setSenha(e.target.value)} placeholder="mínimo 6 caracteres" />
              </div>
            )}
            {erro && <div className="text-xs rounded-md px-3 py-2 transition-opacity" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}
            {mensagem && <div className="text-xs rounded-md px-3 py-2 inline-flex items-start gap-1.5 transition-opacity" style={{ background: "var(--credit-soft)", color: "var(--credit)" }}><Mail size={13} style={{ marginTop: 1, flexShrink: 0 }} /><span>{mensagem}</span></div>}
            <Button type="submit" disabled={carregando}>
              <span className="w-full text-center">{carregando ? "Um momento…" : rotuloBotao}</span>
            </Button>
          </form>

          {modo === "entrar" && (
            <div className="flex items-center justify-between mt-4 text-xs" style={{ color: "var(--muted)" }}>
              <button onClick={() => trocarModo("link_magico")} className="transition-opacity hover:opacity-70">Entrar com link mágico</button>
              <button onClick={() => trocarModo("recuperar")} className="transition-opacity hover:opacity-70">Esqueci minha senha</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { TelaCarregandoAuth, TelaAutenticacao };
