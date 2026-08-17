import React from "react";
import { Card } from "../ui/primitivas.jsx";
import { balancete } from "../dominio/razao.mjs";

const TIPO_LABEL = { ativo: "Ativo", passivo: "Passivo", pl: "Patrimônio Líquido", receita: "Receita", despesa: "Despesa" };
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

/* O balancete — a conferência (docs/04 §6). Toda coluna RECOMPUTADA das
   linhas, nunca de um saldo em cache — a mesma disciplina do razao.mjs
   (docs/01 §3.2, lição do ContLife). */
export function Balancete({ contas, lancamentoLinhas }) {
  const b = balancete(contas, lancamentoLinhas);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rule-faint)" }}>
              <th className="text-left py-2 pr-3" style={{ color: "var(--muted)" }}>Código</th>
              <th className="text-left py-2 pr-3" style={{ color: "var(--muted)" }}>Conta</th>
              <th className="text-right py-2 pr-3" style={{ color: "var(--muted)" }}>Débito</th>
              <th className="text-right py-2 pr-3" style={{ color: "var(--muted)" }}>Crédito</th>
              <th className="text-right py-2" style={{ color: "var(--muted)" }}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {b.linhas.filter((c) => c.debito || c.credito).map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--rule-faint)" }}>
                <td className="py-1.5 pr-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{c.codigo}</td>
                <td className="py-1.5 pr-3">
                  {c.nome}
                  <span className="etiqueta ml-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>{TIPO_LABEL[c.tipo]}</span>
                </td>
                <td className="py-1.5 pr-3 text-right tabular-nums">{c.debito ? fmt(c.debito) : "—"}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums">{c.credito ? fmt(c.credito) : "—"}</td>
                <td className="py-1.5 text-right tabular-nums font-medium" style={{ color: "var(--ink)" }}>{fmt(c.saldo)}</td>
              </tr>
            ))}
            {b.linhas.every((c) => !c.debito && !c.credito) && (
              <tr><td colSpan={5} className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>Nenhum lançamento ainda.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid var(--rule)" }}>
              <td colSpan={2} className="py-2 pr-3 font-medium">Total</td>
              <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmt(b.totalDebito)}</td>
              <td className="py-2 pr-3 text-right tabular-nums font-medium">{fmt(b.totalCredito)}</td>
              <td className="py-2 text-right">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: b.fecha ? "var(--credit-soft)" : "var(--debit-soft)", color: b.fecha ? "var(--credit)" : "var(--debit)" }}>
                  {b.fecha ? "fecha ✓" : "não fecha ⚠"}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
