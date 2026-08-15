import React, { useState, useEffect } from "react";
import { supabase } from "../dados/supabase.mjs";
import { EstiloGlobal } from "../ui/EstiloGlobal.jsx";
import { TelaCarregandoAuth, TelaAutenticacao } from "../telas/Autenticacao.jsx";
import { Negocios } from "../telas/Negocios.jsx";
import { ClienteNovo } from "../telas/ClienteNovo.jsx";
import { Livro } from "../telas/Livro.jsx";
import { PainelDoMes } from "../telas/PainelDoMes.jsx";
import { FormularioPublico } from "../telas/FormularioPublico.jsx";

/* O formulário do cliente é a ÚNICA rota sem login do sistema. A
   credencial é o token na URL (?f=…), validado por função no banco
   (0012_formulario_publico.sql) — o `anon` não alcança tabela nenhuma.
   Lido uma vez, fora do componente: não muda durante a sessão. */
const TOKEN_FORMULARIO = new URLSearchParams(window.location.search).get("f");

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

  /* Bug achado em teste de ponta a ponta (15/ago): editar o cadastro em
     ConfigNegocio.jsx grava no banco, mas `negocioAberto` — carregado
     UMA vez ao abrir o negócio e usado por toda a árvore do Livro —
     nunca era atualizado. Resultado: mudar "usa o mesmo dinheiro pra
     tudo?" e ir direto para a Caixa de Entrada mostrava o botão antigo,
     na mesma sessão, sem nenhum aviso. Corrigido aqui, na única fonte
     de verdade deste objeto — não em cada tela que o lê. */
  const atualizarNegocioAberto = (patch) => setNegocioAberto((prev) => prev && ({ ...prev, ...patch }));

  /* Antes de qualquer checagem de sessão: quem chega pelo link do
     formulário é o CLIENTE, não o Luan. Se isto ficasse depois do
     `authSession`, ele veria a tela de senha — e desistiria ali. */
  if (TOKEN_FORMULARIO) {
    return (
      <>
        <EstiloGlobal dark={dark} />
        <FormularioPublico token={TOKEN_FORMULARIO} />
      </>
    );
  }

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
        <Livro key={negocioAberto.id} negocio={negocioAberto} onVoltar={fecharNegocio} onNegocioAtualizado={atualizarNegocioAberto} />
      ) : painelAberto ? (
        <PainelDoMes onVoltar={() => setPainelAberto(false)} />
      ) : (
        <Negocios onAbrirNegocio={setNegocioAberto} onAbrirPainel={() => setPainelAberto(true)} />
      )}
    </>
  );
}
