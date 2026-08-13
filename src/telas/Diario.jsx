import React, { useMemo } from "react";
import { Card } from "../ui/primitivas.jsx";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");

const ORIGEM_LABEL = { manual: "Manual", extrato: "Extrato", recorrente: "Recorrente", abertura: "Abertura", encerramento_mes: "Fechamento", encerramento_ano: "Encerramento" };

/* O Diário — tudo que aconteceu, em ordem de data (docs/04 §6). Cada
   lançamento com suas N linhas por baixo, não achatado numa linha só —
   é exatamente essa estrutura que motivou o lançamento de N linhas
   desde o desenho (docs/06 §1). */
export function Diario({ contas, lancamentos, lancamentoLinhas }) {
  const nomeConta = useMemo(() => new Map(contas.map((c) => [c.id, c.nome])), [contas]);
  const linhasPorLancamento = useMemo(() => {
    const mapa = new Map();
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
    return <Card className="text-center py-12"><div className="text-sm" style={{ color: "var(--muted)" }}>Nenhum lançamento ainda.</div></Card>;
  }

  return (
    <div className="space-y-3">
      {ordenados.map((l) => {
        const linhas = linhasPorLancamento.get(l.id) || [];
        return (
          <Card key={l.id} pad="apertado">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-mono text-xs mr-2" style={{ color: "var(--muted)" }}>{fmtData(l.data)}</span>
                <span style={{ color: "var(--ink)" }}>{l.descricao}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                {ORIGEM_LABEL[l.origem] || l.origem}
              </span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {linhas.map((linha) => (
                  <tr key={linha.id}>
                    <td className="py-0.5 pr-2" style={{ color: linha.tipo === "D" ? "var(--ink)" : "var(--muted)", paddingLeft: linha.tipo === "C" ? "1.5rem" : 0 }}>
                      {linha.tipo === "D" ? "D" : "C"} {nomeConta.get(linha.contaId) || linha.contaId}
                      {linha.descricao ? <span style={{ color: "var(--muted)" }}> — {linha.descricao}</span> : null}
                    </td>
                    <td className="py-0.5 text-right tabular-nums">{fmt(linha.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        );
      })}
    </div>
  );
}
