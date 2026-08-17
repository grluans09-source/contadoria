import React, { useMemo } from "react";
import { Sparkles, FileText } from "lucide-react";
import { Card, TituloCard, Selo } from "../ui/primitivas.jsx";
import { linhaDoTempo, medidoAgora } from "../dominio/memoria.mjs";
import { compararComAEntrada } from "../dominio/linhaDeBase.mjs";

/* ============================================================
   MEMÓRIA — o dossiê que não esquece (docs/08 §4, Fase 11, 14/ago).

   "Em março você me disse que ia trocar de fornecedor. Trocou em
   maio. Sua margem subiu 4 pontos desde então — foi a melhor decisão
   que você tomou no ano." É isso que esta tela precisa deixar você
   dizer, sem ter que lembrar de cabeça.

   Só LEITURA — nada aqui grava nada. Cada peça já é gravada em outro
   lugar (retrato de entrada no onboarding, resultado a cada
   fechamento, carta nas Entregas); esta tela só junta.
   ============================================================ */

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtMes = (m) => {
  const [ano, mes] = m.split("-");
  return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");

function SeloSeguida({ seguida }) {
  if (seguida === true) return <Selo tom="credit">seguida</Selo>;
  if (seguida === false) return <Selo tom="debit">não seguida</Selo>;
  return <Selo tom="neutro">ainda não avaliada</Selo>;
}

function EventoAbertura({ retrato }) {
  const d = retrato.declarado || {};
  return (
    <Card className="mb-3" pad="apertado">
      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles size={13} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--ink)" }}>Início — {fmtData(retrato.capturadoEm)}</span>
      </div>
      <div className="text-xs" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        {d.faturamentoMensal != null && <>Disse que faturava {fmt(d.faturamentoMensal)}/mês. </>}
        {d.retiradaMensal != null && <>Disse que tirava {fmt(d.retiradaMensal)}/mês. </>}
        {d.meta && <>Meta: "{d.meta}". </>}
        {d.oQueIncomoda && <>O que incomodava: "{d.oQueIncomoda}".</>}
      </div>
    </Card>
  );
}

function EventoMes({ mes, resultado, carta, evitados }) {
  const positivo = resultado.resultado >= 0;
  return (
    <Card className="mb-3" pad="apertado">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium capitalize" style={{ color: "var(--ink)" }}>{fmtMes(mes)}</span>
        <span className="text-xs font-medium" style={{ color: positivo ? "var(--credit)" : "var(--debit)" }}>
          {positivo ? "sobrou" : "faltou"} {fmt(Math.abs(resultado.resultado))}
        </span>
      </div>
      {carta?.texto ? (
        <div className="text-xs flex items-start gap-1.5" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          <FileText size={12} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>"{carta.texto}" <SeloSeguida seguida={carta.seguida} /></span>
        </div>
      ) : (
        <div className="text-xs" style={{ color: "var(--muted)" }}>Sem carta registrada neste mês.</div>
      )}
      {evitados?.length > 0 && (
        <div className="text-xs mt-1.5 space-y-0.5" style={{ color: "var(--credit)", lineHeight: 1.6 }}>
          {evitados.map((e) => (
            <div key={e.id}>evitou: {e.descricao}{e.valorEstimado > 0 ? ` (${fmt(e.valorEstimado)})` : ""}</div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function Memoria({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, evitados }) {
  const eventos = useMemo(
    () => linhaDoTempo({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, evitados }),
    [negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, evitados]
  );

  const comparacao = useMemo(() => {
    if (!negocio?.retrato_de_entrada) return [];
    const agora = medidoAgora(contas, lancamentos, lancamentoLinhas, periodosFechados);
    return compararComAEntrada(negocio.retrato_de_entrada, agora);
  }, [negocio, contas, lancamentos, lancamentoLinhas, periodosFechados]);

  if (!eventos.length) {
    return (
      <Card className="text-center py-10">
        <div className="text-sm" style={{ color: "var(--ink)" }}>Ainda não há história para contar.</div>
        <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Aparece aqui assim que houver um retrato de entrada ou o primeiro mês fechado.
        </div>
      </Card>
    );
  }

  return (
    <div>
      {comparacao.length > 0 && (
        <Card className="mb-4" style={{ background: "linear-gradient(160deg, var(--surface), var(--paper))" }}>
          <TituloCard>
            Desde que começamos
          </TituloCard>
          <div className="space-y-2">
            {comparacao.map((a, i) => (
              <div key={i} className="text-sm" style={{ color: "var(--ink)", lineHeight: 1.6 }}>{a.frase}</div>
            ))}
          </div>
        </Card>
      )}

      <div>
        {eventos.map((ev, i) => (
          ev.tipo === "abertura"
            ? <EventoAbertura key={i} retrato={ev.retrato} />
            : <EventoMes key={i} mes={ev.mes} resultado={ev.resultado} carta={ev.carta} evitados={ev.evitados} />
        ))}
      </div>
    </div>
  );
}
