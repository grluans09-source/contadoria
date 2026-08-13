import React, { useState, useMemo } from "react";
import { Card, Select } from "../ui/primitivas.jsx";
import { resultadoDoMes } from "../dominio/razao.mjs";
import { quantoPodeTirar } from "../dominio/disponivel.mjs";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtMes = (m) => {
  const [ano, mes] = m.split("-");
  return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
const hojeISO = () => new Date().toISOString().slice(0, 10);

/* O Retrato do Mês — UMA página, não um relatório (docs/08 §3). O
   artefato é parte do produto: número grande, poucas frases, a
   pergunta que ninguém mais responde ("quanto você pode tirar",
   docs/08 §2), e o rodapé que protege o limite profissional (docs/02
   §4.3). Nada de tabela de 30 linhas — o Balancete existe pra isso. */
export function RetratoDoMes({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados }) {
  const mesesComMovimento = useMemo(() => {
    const meses = new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean));
    return [...meses].sort().reverse();
  }, [lancamentos]);

  const mesesFechados = useMemo(
    () => new Set((periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4))),
    [periodosFechados]
  );

  const mesPadrao = [...mesesFechados].sort().reverse()[0] || mesesComMovimento[0] || hojeISO().slice(0, 7);
  const [mes, setMes] = useState(mesPadrao);

  const opcoesMes = useMemo(() => {
    const todos = new Set([...mesesComMovimento, ...mesesFechados, mes]);
    return [...todos].sort().reverse().map((m) => ({ value: m, label: `${fmtMes(m)}${mesesFechados.has(m) ? " · fechado" : ""}` }));
  }, [mesesComMovimento, mesesFechados, mes]);

  const r = useMemo(() => resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes), [contas, lancamentos, lancamentoLinhas, mes]);
  const disp = useMemo(
    () => quantoPodeTirar({ contas, lancamentos, lancamentoLinhas, periodosFechados, hoje: hojeISO() }),
    [contas, lancamentos, lancamentoLinhas, periodosFechados]
  );

  const diferenca = Math.round((r.resultado - r.variacaoCaixaBanco) * 100) / 100;
  const sobrouPositivo = r.resultado >= 0;

  return (
    <div className="max-w-lg">
      <div className="mb-4 max-w-xs">
        <Select value={mes} onChange={setMes} options={opcoesMes} />
      </div>

      <Card className="mb-4" style={{ background: "linear-gradient(160deg, var(--surface), var(--paper))" }}>
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          {negocio.apelido || negocio.nome} · {fmtMes(mes)}
        </div>
        <div className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: sobrouPositivo ? "var(--credit)" : "var(--debit)" }}>
          {fmt(r.resultado)}
        </div>
        <div className="text-sm mb-1" style={{ color: "var(--ink)" }}>
          Entrou {fmt(r.receita)}, saiu {fmt(r.despesa)}, {sobrouPositivo ? "sobrou" : "faltou"} {fmt(Math.abs(r.resultado))}.
        </div>
        {Math.abs(diferenca) >= 0.01 && (
          <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            O caixa e o banco se mexeram {fmt(r.variacaoCaixaBanco)} — a diferença de {fmt(Math.abs(diferenca))}{" "}
            virou estoque, conta a receber, pagamento de dívida ou retirada. É o Balanço que mostra onde exatamente.
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Quanto você pode tirar
        </div>
        <div className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
          {fmt(disp.podeTirar)}
        </div>
        <div className="text-xs space-y-0.5" style={{ color: "var(--muted)" }}>
          <div>{fmt(disp.disponivelHoje)} disponível hoje em caixa e banco</div>
          {disp.aReceber > 0 && <div>+ {fmt(disp.aReceber)} a receber nos próximos 30 dias</div>}
          {disp.compromissos > 0 && <div>− {fmt(disp.compromissos)} em compromissos que vencem nos próximos 30 dias</div>}
          {disp.reserva > 0 && <div>− {fmt(disp.reserva)} de reserva mínima</div>}
        </div>
        <div className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>
          É uma recomendação com base no que foi lançado, não uma garantia.
        </div>
      </Card>

      <div className="text-[10px] text-center" style={{ color: "var(--muted)" }}>
        Relatório gerencial — não é peça contábil oficial assinada.
      </div>
    </div>
  );
}
