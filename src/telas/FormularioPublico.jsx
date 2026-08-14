import React, { useState, useEffect, useCallback } from "react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "../dados/supabase.mjs";

/* ============================================================
   O FORMULÁRIO QUE O CLIENTE RESPONDE SOZINHO

   Pedido do dono (14/ago): horário de dono de negócio pequeno raramente
   bate com horário de estudante. Com um link, o cliente responde no
   tempo dele, do celular.

   TRÊS DECISÕES QUE DEFINEM A EXPERIÊNCIA
   ------------------------------------------------------------
   1. UMA PERGUNTA POR VEZ. Um paredão de 24 campos no celular faz
      qualquer um desistir. Uma pergunta grande, com espaço para pensar,
      e uma barra mostrando que está acabando.
   2. SALVA A CADA RESPOSTA. Ele vai parar no meio — atender cliente,
      descarregar o carro, o que for. Voltar no link tem que continuar
      de onde parou, nunca recomeçar.
   3. VOZ DE GENTE. Nada de "receita bruta", "patrimônio", "competência".
      Quem escreveu as perguntas foi o Luan; quem lê é o cliente dele.

   Esta tela NÃO usa as primitivas de src/ui: ela é a única coisa que um
   estranho vê, e é peça de marketing tanto quanto de coleta (docs/11).
   Roda sem login — a autenticação é o token na URL.
   ============================================================ */

const fmtBloco = {
  1: "Sobre você e o negócio",
  2: "Como o dinheiro anda",
  3: "A foto de hoje",
  4: "O ritmo do negócio",
  5: "O que você quer",
};

function Capa({ negocio, total, jaRespondidas, onComecar }) {
  const retomando = jaRespondidas > 0;
  return (
    <div className="text-center">
      <div className="text-[11px] uppercase mb-3" style={{ color: "var(--gold)", letterSpacing: "0.18em", fontFamily: "var(--font-mono)" }}>
        Contadoria
      </div>
      <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
        {retomando ? `Bem-vindo de volta, ${negocio}` : `Vamos organizar o ${negocio}`}
      </h1>
      <p className="text-sm mb-2" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        {retomando
          ? `Você já respondeu ${jaRespondidas} de ${total}. Continua de onde parou.`
          : `São ${total} perguntas rápidas sobre o seu negócio. Leva uns 10 minutos.`}
      </p>
      <p className="text-xs mb-8" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        Pode parar no meio e voltar depois — o que você responder fica salvo.
        <br />Não sabe algum número? Responde por alto, a gente acerta depois.
      </p>
      <button onClick={onComecar}
        className="px-6 py-3 rounded-md text-sm font-semibold transition-transform active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204" }}>
        {retomando ? "Continuar" : "Começar"}
      </button>
    </div>
  );
}

function Fim({ negocio, onRevisar }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 rounded-full flex items-center justify-center"
        style={{ width: 54, height: 54, background: "var(--credit-soft)" }}>
        <Check size={26} style={{ color: "var(--credit)" }} />
      </div>
      <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
        Pronto, obrigado!
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)", lineHeight: 1.7 }}>
        Já recebi as suas respostas sobre o {negocio}.<br />
        Agora eu monto a organização das suas contas e volto com o primeiro retrato do seu mês.
      </p>
      <button onClick={onRevisar} className="text-xs underline" style={{ color: "var(--muted)" }}>
        rever ou corrigir alguma resposta
      </button>
    </div>
  );
}

export function FormularioPublico({ token }) {
  const [dados, setDados] = useState(null);   // null = carregando
  const [erro, setErro] = useState("");
  const [etapa, setEtapa] = useState("capa"); // capa · perguntas · fim
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.rpc("formulario_abrir", { p_token: token })
      .then(({ data, error }) => {
        if (error) return setErro("Não consegui abrir este formulário.");
        if (!data?.ok) return setErro("Este link não está mais disponível. Peça um novo para quem te enviou.");
        setDados(data);
        setRespostas(data.respostas || {});
        if (data.concluido) setEtapa("fim");
      });
  }, [token]);

  const perguntas = dados?.perguntas || [];
  const atual = perguntas[indice];

  /* Grava a resposta da pergunta que está saindo da tela. Falha de rede
     aqui não pode travar o cliente no meio do formulário — ele segue, e
     a resposta é reenviada quando ele passar de novo. */
  const gravar = useCallback(async (perguntaId, valor) => {
    setSalvando(true);
    try {
      await supabase.rpc("formulario_responder", { p_token: token, p_pergunta: perguntaId, p_resposta: valor ?? "" });
    } catch { /* silencioso de propósito — ver comentário acima */ }
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
    return (
      <Moldura>
        <div className="text-center text-sm" style={{ color: "var(--muted)" }}>{erro}</div>
      </Moldura>
    );
  }
  if (!dados) {
    return <Moldura><div className="text-center text-sm" style={{ color: "var(--muted)" }}>Abrindo…</div></Moldura>;
  }

  const respondidas = perguntas.filter((p) => String(respostas[p.id] ?? "").trim()).length;

  if (etapa === "capa") {
    return (
      <Moldura>
        <Capa negocio={dados.negocio} total={perguntas.length} jaRespondidas={respondidas}
          onComecar={() => {
            /* Retomando: pula direto para a primeira sem resposta. */
            const primeiraVazia = perguntas.findIndex((p) => !String(respostas[p.id] ?? "").trim());
            setIndice(primeiraVazia >= 0 ? primeiraVazia : 0);
            setEtapa("perguntas");
          }} />
      </Moldura>
    );
  }

  if (etapa === "fim") {
    return <Moldura><Fim negocio={dados.negocio} onRevisar={() => { setIndice(0); setEtapa("perguntas"); }} /></Moldura>;
  }

  const valor = respostas[atual.id] ?? "";
  const definir = (v) => setRespostas({ ...respostas, [atual.id]: v });
  const fracao = perguntas.length ? (indice + 1) / perguntas.length : 1;

  return (
    <Moldura>
      {/* progresso */}
      <div className="mb-1 flex justify-between text-[10px]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
        <span>{fmtBloco[atual.bloco] || ""}</span>
        <span>{indice + 1} de {perguntas.length}</span>
      </div>
      <div className="h-1 rounded-full mb-8" style={{ background: "var(--rule-faint)" }}>
        <div className="h-1 rounded-full transition-all duration-300"
          style={{ width: `${fracao * 100}%`, background: "linear-gradient(90deg, var(--gold-2), var(--gold))" }} />
      </div>

      <div className="mb-6">
        <div className="text-lg font-medium mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-display)", lineHeight: 1.4 }}>
          {atual.pergunta}
        </div>
        {atual.explicacao && (
          <div className="text-xs rounded-md px-3 py-2 mb-4" style={{ background: "var(--accent-soft)", color: "var(--ink)", lineHeight: 1.6 }}>
            {atual.explicacao}
          </div>
        )}

        <CampoResposta pergunta={atual} valor={valor} onChange={definir} onEnter={avancar} />
      </div>

      <div className="flex items-center justify-between">
        <button onClick={voltar} disabled={indice === 0}
          className="text-xs inline-flex items-center gap-1 disabled:opacity-30" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={13} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          {!String(valor).trim() && (
            <button onClick={avancar} className="text-xs" style={{ color: "var(--muted)" }}>pular</button>
          )}
          <button onClick={avancar} disabled={salvando}
            className="px-5 py-2.5 rounded-md text-sm font-semibold inline-flex items-center gap-1.5 transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204" }}>
            {indice + 1 === perguntas.length ? "Terminei" : "Próxima"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Moldura>
  );
}

function CampoResposta({ pergunta, valor, onChange, onEnter }) {
  const base = {
    borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)",
  };

  if (pergunta.tipo_resposta === "sim_nao") {
    return (
      <div className="flex gap-2">
        {[["sim", "Sim"], ["nao", "Não"]].map(([v, rotulo]) => (
          <button key={v} onClick={() => onChange(v)}
            className="flex-1 py-3 rounded-md border text-sm font-medium transition-all"
            style={valor === v
              ? { background: "linear-gradient(135deg, var(--gold-2), var(--gold))", color: "#171204", borderColor: "transparent" }
              : { ...base, borderWidth: 1 }}>
            {rotulo}
          </button>
        ))}
      </div>
    );
  }

  if (pergunta.tipo_resposta === "texto_longo" || pergunta.tipo_resposta === "lista_valores") {
    return (
      <textarea rows={4} value={valor} onChange={(e) => onChange(e.target.value)}
        placeholder={pergunta.tipo_resposta === "lista_valores" ? "Pode escrever do seu jeito, um por linha" : "Escreva do seu jeito"}
        className="w-full rounded-md border px-3 py-3 text-base" style={base} />
    );
  }

  const tipo = pergunta.tipo_resposta === "data" ? "date"
    : pergunta.tipo_resposta === "moeda" ? "text" : "text";

  return (
    <input type={tipo} value={valor} onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
      inputMode={pergunta.tipo_resposta === "moeda" ? "decimal" : undefined}
      placeholder={pergunta.tipo_resposta === "moeda" ? "R$ 0,00" : ""}
      /* text-base (16px) e não text-sm: abaixo de 16px o iPhone dá zoom
         sozinho ao focar o campo, e o formulário "pula" na cara do
         cliente. Detalhe pequeno, e é o tipo de coisa que faz parecer
         amador. */
      className="w-full rounded-md border px-3 py-3 text-base" style={base} />
  );
}

function Moldura({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: "radial-gradient(120% 70% at 50% -10%, #1a1108 0%, transparent 55%), var(--paper)" }}>
      <div className="w-full" style={{ maxWidth: 460 }}>
        <div className="rounded-lg border p-6 sm:p-8"
          style={{ borderColor: "var(--rule-faint)", background: "var(--surface)" }}>
          {children}
        </div>
        <div className="text-center text-[10px] mt-4" style={{ color: "var(--muted)" }}>
          Suas respostas são vistas só por quem cuida das suas contas.
        </div>
      </div>
    </div>
  );
}
