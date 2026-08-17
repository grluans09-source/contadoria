import React, { useMemo, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Card, Selo } from "../ui/primitivas.jsx";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");

const ORIGEM_LABEL = { manual: "Manual", extrato: "Extrato", recorrente: "Recorrente", abertura: "Abertura", encerramento_mes: "Fechamento", encerramento_ano: "Encerramento" };

/* Lançamento gerado pelo sistema (abertura, fechamento) não se edita
   nem apaga na mão — são a fundação do livro ou o selo de um mês.
   `recorrente` fica DE FORA dessa trava: é só um lançamento manual que
   nasceu sozinho (docs/05 §7) — se o valor variar um mês (conta de
   energia, por exemplo), o dono precisa poder corrigir só aquele mês,
   sem mexer no template. */
const ORIGENS_EDITAVEIS = new Set(["manual", "extrato", "recorrente"]);

function LinhaExcluir({ lancamento, onConfirmar }) {
  const [confirmando, setConfirmando] = useState(false);
  if (confirmando) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="etiqueta" style={{ color: "var(--debit)" }}>Excluir de vez?</span>
        <button onClick={() => onConfirmar(lancamento.id)} className="transition-opacity hover:opacity-70" style={{ color: "var(--debit)" }} aria-label="Confirmar exclusão"><Check size={13} /></button>
        <button onClick={() => setConfirmando(false)} className="transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="Cancelar"><X size={13} /></button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirmando(true)} className="transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="Excluir">
      <Trash2 size={13} />
    </button>
  );
}

/* O Diário — tudo que aconteceu, em ordem de data (docs/04 §6). Cada
   lançamento com suas N linhas por baixo, não achatado numa linha só —
   é exatamente essa estrutura que motivou o lançamento de N linhas
   desde o desenho (docs/06 §1). */
export function Diario({ contas, lancamentos, lancamentoLinhas, onEditar, onExcluir }) {
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
        const editavel = ORIGENS_EDITAVEIS.has(l.origem);
        return (
          <Card key={l.id} pad="apertado">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="min-w-0">
                <span className="font-mono text-xs mr-2" style={{ color: "var(--muted)" }}>{fmtData(l.data)}</span>
                <span style={{ color: "var(--ink)" }}>{l.descricao}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Selo>{ORIGEM_LABEL[l.origem] || l.origem}</Selo>
                {editavel && (
                  <>
                    <button onClick={() => onEditar(l.id)} className="transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="Editar">
                      <Pencil size={13} />
                    </button>
                    <LinhaExcluir lancamento={l} onConfirmar={onExcluir} />
                  </>
                )}
              </div>
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
