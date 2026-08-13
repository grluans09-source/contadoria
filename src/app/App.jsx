import React, { useState, useEffect } from "react";
import { supabase } from "../dados/supabase.mjs";
import { EstiloGlobal } from "../ui/EstiloGlobal.jsx";
import { TelaCarregandoAuth, TelaAutenticacao } from "../telas/Autenticacao.jsx";
import { Negocios } from "../telas/Negocios.jsx";
import { ClienteNovo } from "../telas/ClienteNovo.jsx";
import { Livro } from "../telas/Livro.jsx";
import { PainelDoMes } from "../telas/PainelDoMes.jsx";

export default function App() {
  /* undefined = checando sessão · null = sem sessão · objeto = autenticado —
     mesmo contrato do ContLife (contlife.jsx, ~linha 9285). */
  const [authSession, setAuthSession] = useState(undefined);
  const [dark] = useState(true); /* padrão da casa: preto + cobre. Alternância fica para quando houver ConfigView. */
  const [negocioAberto, setNegocioAberto] = useState(null);
  const [painelAberto, setPainelAberto] = useState(false);

  useEffect(() => {
    let vivo = true;
    supabase.auth.getSession().then(({ data }) => { if (vivo) setAuthSession(data.session); });
    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, session) => { setAuthSession(session); });
    return () => { vivo = false; assinatura.subscription.unsubscribe(); };
  }, []);

  const fecharNegocio = () => setNegocioAberto(null);

  return (
    <>
      <EstiloGlobal dark={dark} />
      {authSession === undefined ? (
        <TelaCarregandoAuth />
      ) : authSession === null ? (
        <TelaAutenticacao redirectTo={window.location.origin} />
      ) : negocioAberto && !negocioAberto.configuracao?.onboarded ? (
        <ClienteNovo negocio={negocioAberto} onConcluido={fecharNegocio} onVoltarSemSalvar={fecharNegocio} />
      ) : negocioAberto ? (
        /* `key={negocioAberto.id}` desmonta e remonta o Livro inteiro ao
           trocar de negócio — é o que elimina por construção a classe de
           bug H3 do ContLife (doc 26): sem isso, o estado em memória de
           um negócio podia vazar para dentro da chave do próximo por um
           instante, entre trocar o id e a carga nova terminar. */
        <Livro key={negocioAberto.id} negocio={negocioAberto} onVoltar={fecharNegocio} />
      ) : painelAberto ? (
        <PainelDoMes onVoltar={() => setPainelAberto(false)} />
      ) : (
        <Negocios onAbrirNegocio={setNegocioAberto} onAbrirPainel={() => setPainelAberto(true)} />
      )}
    </>
  );
}
