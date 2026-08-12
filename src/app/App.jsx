import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../dados/supabase.mjs";
import { EstiloGlobal } from "../ui/EstiloGlobal.jsx";
import { TelaCarregandoAuth, TelaAutenticacao } from "../telas/Autenticacao.jsx";
import { Negocios } from "../telas/Negocios.jsx";
import { Button } from "../ui/primitivas.jsx";

/* Placeholder de propósito: a tela de dentro do negócio (Caixa de
   Entrada, Livro, Revisão…) é o passo 5 em diante do docs/06 §13. Sem
   isto o clique no card ficaria morto — pior experiência que não ter o
   clique. Substituído assim que o passo 5 começar. */
function DentroDoNegocio({ negocio, onVoltar }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="max-w-3xl mx-auto px-5 py-8">
        <button onClick={onVoltar} className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={14} /> Voltar
        </button>
        <div className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
          {negocio.apelido || negocio.nome}
        </div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          A Caixa de Entrada e o Livro chegam no próximo passo (docs/06_MODELO_DE_DADOS.md §13, passo 5).
        </div>
      </div>
    </div>
  );
}

export default function App() {
  /* undefined = checando sessão · null = sem sessão · objeto = autenticado —
     mesmo contrato do ContLife (contlife.jsx, ~linha 9285). */
  const [authSession, setAuthSession] = useState(undefined);
  const [dark] = useState(true); /* padrão da casa: preto + cobre. Alternância fica para quando houver ConfigView. */
  const [negocioAberto, setNegocioAberto] = useState(null);

  useEffect(() => {
    let vivo = true;
    supabase.auth.getSession().then(({ data }) => { if (vivo) setAuthSession(data.session); });
    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, session) => { setAuthSession(session); });
    return () => { vivo = false; assinatura.subscription.unsubscribe(); };
  }, []);

  return (
    <>
      <EstiloGlobal dark={dark} />
      {authSession === undefined ? (
        <TelaCarregandoAuth />
      ) : authSession === null ? (
        <TelaAutenticacao redirectTo={window.location.origin} />
      ) : negocioAberto ? (
        <DentroDoNegocio negocio={negocioAberto} onVoltar={() => setNegocioAberto(null)} />
      ) : (
        <Negocios onAbrirNegocio={setNegocioAberto} />
      )}
    </>
  );
}
