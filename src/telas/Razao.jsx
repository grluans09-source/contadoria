import React, { useState, useMemo } from "react";
import { Card, Select } from "../ui/primitivas.jsx";
import { DEBITO_NORMAL } from "../dominio/razao.mjs";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");

/* O Razão (razonete) — a mesma escrituração vista POR CONTA (docs/04
   §6). Saldo corrente calculado linha a linha, na direção normal da
   conta escolhida. */
export function Razao({ contas, lancamentos, lancamentoLinhas }) {
  const contasOrdenadas = useMemo(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const [contaId, setContaId] = useState(contasOrdenadas[0]?.id || "");
  const conta = contas.find((c) => c.id === contaId);

  const linhas = useMemo(() => {
    if (!conta) return [];
    const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
    const normal = DEBITO_NORMAL[conta.tipo];
    let corrente = 0;
    return lancamentoLinhas
      .filter((l) => l.contaId === contaId)
      .map((l) => ({ ...l, data: porLancamento.get(l.lancamentoId)?.data, lancDescricao: porLancamento.get(l.lancamentoId)?.descricao }))
      .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
      .map((l) => {
        corrente += (l.tipo === "D") === normal ? l.valor : -l.valor;
        return { ...l, saldoCorrente: corrente };
      });
  }, [contaId, conta, lancamentoLinhas, lancamentos]);

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <Select value={contaId} onChange={setContaId} options={contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} — ${c.nome}` }))} />
      </div>
      <Card>
        {linhas.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>Nenhum lançamento nesta conta ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule-faint)" }}>
                <th className="text-left py-2 pr-3" style={{ color: "var(--muted)" }}>Data</th>
                <th className="text-left py-2 pr-3" style={{ color: "var(--muted)" }}>Descrição</th>
                <th className="text-right py-2 pr-3" style={{ color: "var(--muted)" }}>Débito</th>
                <th className="text-right py-2 pr-3" style={{ color: "var(--muted)" }}>Crédito</th>
                <th className="text-right py-2" style={{ color: "var(--muted)" }}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--rule-faint)" }}>
                  <td className="py-1.5 pr-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{fmtData(l.data)}</td>
                  <td className="py-1.5 pr-3">{l.descricao || l.lancDescricao}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{l.tipo === "D" ? fmt(l.valor) : "—"}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{l.tipo === "C" ? fmt(l.valor) : "—"}</td>
                  <td className="py-1.5 text-right tabular-nums font-medium">{fmt(l.saldoCorrente)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
