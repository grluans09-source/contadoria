import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Card } from "../ui/primitivas.jsx";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");
const CONTAS_TRANSITO = new Set(["caixa", "banco"]);

/* Conciliação — "o que eu lancei bate com o extrato?" (docs/04 §7).
   A unidade é o LANÇAMENTO, não a linha: `conciliacoes` é chaveada por
   lancamento_id (docs/06 §10) — um lançamento com uma perna no Caixa ou
   Banco é conferido inteiro de uma vez, não linha por linha. */
export function Conciliacao({ lancamentos, lancamentoLinhas, conciliacoes, onAlternar }) {
  const conferidos = useMemo(() => new Set(conciliacoes), [conciliacoes]);

  const linhasPorLancamento = useMemo(() => {
    const mapa = new Map();
    for (const l of lancamentoLinhas) {
      if (!mapa.has(l.lancamentoId)) mapa.set(l.lancamentoId, []);
      mapa.get(l.lancamentoId).push(l);
    }
    return mapa;
  }, [lancamentoLinhas]);

  const relevantes = useMemo(() => {
    return lancamentos
      .filter((l) => (linhasPorLancamento.get(l.id) || []).some((linha) => CONTAS_TRANSITO.has(linha.contaId)))
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [lancamentos, linhasPorLancamento]);

  if (relevantes.length === 0) {
    return <Card className="text-center py-10"><div className="text-sm" style={{ color: "var(--muted)" }}>Nenhum lançamento em Caixa ou Banco ainda.</div></Card>;
  }

  return (
    <div>
      <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
        Marque o que você já conferiu contra o extrato de verdade.
      </div>
      {relevantes.map((l) => {
        const linhaTransito = (linhasPorLancamento.get(l.id) || []).find((x) => CONTAS_TRANSITO.has(x.contaId));
        const ok = conferidos.has(l.id);
        return (
          <Card key={l.id} pad="apertado" className="mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAlternar(l.id, !ok)}
                className="w-6 h-6 rounded-md border shrink-0 flex items-center justify-center transition-all duration-150"
                style={{ borderColor: ok ? "var(--credit)" : "var(--rule-faint)", background: ok ? "var(--credit-soft)" : "transparent" }}
                aria-label={ok ? "Desmarcar conferido" : "Marcar como conferido"}
              >
                {ok && <Check size={14} style={{ color: "var(--credit)" }} />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-xs" style={{ color: "var(--muted)" }}>{fmtData(l.data)}</div>
                <div className="truncate" style={{ color: "var(--ink)" }}>{l.descricao}</div>
              </div>
              <div className="text-sm tabular-nums shrink-0" style={{ color: "var(--ink)" }}>
                {linhaTransito ? fmt(linhaTransito.valor) : "—"}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
