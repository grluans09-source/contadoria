import React, { useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Card, Label, Input, Select } from "../ui/primitivas.jsx";
import { perguntasPara, pendentesDeAprofundamento } from "../dominio/roteiro.mjs";

/* ============================================================
   ROTEIRO — as perguntas do cliente, editáveis a qualquer momento.

   POR QUE ISTO EXISTE (Fase 6, 14/ago)
   O roteiro adaptativo (E3, docs/DECISOES.md) separou a primeira
   conversa (essencial) do aprofundamento, cobrado nos meses seguintes.
   Mas sem esta aba, o aprofundamento não tinha ONDE ser respondido
   depois do onboarding — ficava órfão para sempre assim que
   `configuracao.onboarded` virava true. Esta aba é o lugar.

   FORA DAQUI, DE PROPÓSITO
   ------------------------------------------------------------
   · Bloco 3 (a foto de hoje) — é o balanço de abertura, tem tela
     própria (ClienteNovo.jsx `BlocoAbertura`); generalizar aqui
     misturaria pergunta-resposta com lançamento contábil.
   · Perguntas com `destino` começando em `negocios.` — já editáveis
     na aba Negócio (ConfigNegocio.jsx); duplicar aqui criaria duas
     telas gravando o mesmo campo.
   · Perguntas com `destino` começando em `retrato.` — alimentam a
     linha de base write-once (F3, migração 0014). Editar a resposta
     aqui não mudaria o retrato já congelado, e deixaria os dois
     divergentes em silêncio — pior que não oferecer a edição.

   Cada resposta salva sozinha ao sair do campo (sim/não e data salvam
   na hora — não têm "meio termo" de digitação para esperar). Sem
   RPC, sem loop reativo do Livro: é o mesmo padrão simples que
   `roteiro_respostas` já usa no ClienteNovo.jsx, porque isto é
   arquivo, não contabilidade (docs/06 §9).
   ============================================================ */

const NOMES_BLOCO = {
  1: "Quem é", 2: "Como o dinheiro anda", 4: "O ritmo do negócio",
  5: "O que ele quer", 6: "O combinado",
};

function PorQueImporta({ texto }) {
  const [aberto, setAberto] = useState(false);
  if (!texto) return null;
  return (
    <div className="mt-1">
      <button type="button" onClick={() => setAberto((a) => !a)}
        className="etiqueta inline-flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: "var(--muted)" }}>
        <HelpCircle size={11} /> por que isso importa?
      </button>
      {aberto && (
        <div className="text-xs mt-1.5 rounded-md px-3 py-2 animate-[surgir_.2s_ease-out]" style={{ background: "var(--accent-soft)", color: "var(--ink)" }}>
          {texto}
        </div>
      )}
    </div>
  );
}

function CampoRoteiro({ pergunta, valor, onSalvar }) {
  const [rascunho, setRascunho] = useState(valor ?? "");
  const [salvo, setSalvo] = useState(false);

  const confirmar = (v) => {
    if (v === (valor ?? "")) return;
    onSalvar(v);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Label>{pergunta.pergunta}</Label>
        {!pergunta.essencial && (
          <span className="etiqueta uppercase tracking-wide px-1.5 py-0.5 rounded-full"
            style={{ background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
            aprofundamento
          </span>
        )}
      </div>
      {pergunta.tipo_resposta === "sim_nao" ? (
        <Select value={rascunho} onChange={(v) => { setRascunho(v); confirmar(v); }} placeholder="Escolha"
          options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
      ) : pergunta.tipo_resposta === "data" ? (
        <Input type="date" value={rascunho} onChange={(e) => { setRascunho(e.target.value); confirmar(e.target.value); }} />
      ) : pergunta.tipo_resposta === "moeda" ? (
        <Input money placeholder="0,00" value={rascunho} onChange={(e) => setRascunho(e.target.value)} onBlur={() => confirmar(rascunho)} />
      ) : pergunta.tipo_resposta === "texto_longo" ? (
        <textarea rows={3} value={rascunho} onChange={(e) => setRascunho(e.target.value)} onBlur={() => confirmar(rascunho)}
          className="w-full rounded-md border px-3 py-2 text-sm transition-colors duration-150"
          style={{ borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }} />
      ) : (
        <Input value={rascunho} onChange={(e) => setRascunho(e.target.value)} onBlur={() => confirmar(rascunho)} />
      )}
      {salvo && <div className="etiqueta mt-1" style={{ color: "var(--credit)" }}>salvo</div>}
      <PorQueImporta texto={pergunta.porque_importa} />
    </div>
  );
}

export function Roteiro({ negocio, perguntas, respostasPorPerguntaId, onSalvarResposta }) {
  const opcoes = { tipo: negocio.tipo, arquetipo: negocio.arquetipo };

  const visiveis = useMemo(() => perguntasPara(perguntas, opcoes)
    .filter((p) => p.bloco !== 3)
    .filter((p) => !p.destino?.startsWith("retrato."))
    .filter((p) => !p.destino?.startsWith("negocios.")),
    [perguntas, negocio.tipo, negocio.arquetipo]);

  const pendentes = useMemo(() => pendentesDeAprofundamento(perguntas, respostasPorPerguntaId, opcoes),
    [perguntas, respostasPorPerguntaId, negocio.tipo, negocio.arquetipo]);

  const porBloco = useMemo(() => {
    const grupos = {};
    for (const p of visiveis) (grupos[p.bloco] ||= []).push(p);
    return grupos;
  }, [visiveis]);

  if (!perguntas.length) return <div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>;

  return (
    <div>
      <div className="text-xs mb-5" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        Todas as perguntas do roteiro deste cliente — inclusive as de aprofundamento, que não
        precisaram ser respondidas na primeira conversa. Editável a qualquer momento; cada
        resposta salva sozinha ao sair do campo.
      </div>

      {pendentes.length > 0 && (
        <div className="text-xs rounded-md px-3 py-2 mb-5" style={{ background: "var(--accent-soft)", color: "var(--ink)" }}>
          Faltam {pendentes.length} pergunta{pendentes.length > 1 ? "s" : ""} de aprofundamento —
          a conversa do mês é a boa hora, não uma mensagem avulsa.
        </div>
      )}

      {Object.entries(porBloco).sort(([a], [b]) => a - b).map(([bloco, ps]) => (
        <Card key={bloco} className="mb-4">
          <div className="text-xs font-medium mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            {NOMES_BLOCO[bloco] || `Bloco ${bloco}`}
          </div>
          {ps.map((p) => (
            <CampoRoteiro key={p.id} pergunta={p} valor={respostasPorPerguntaId[p.id]}
              onSalvar={(v) => onSalvarResposta(p.id, v)} />
          ))}
        </Card>
      ))}
    </div>
  );
}
