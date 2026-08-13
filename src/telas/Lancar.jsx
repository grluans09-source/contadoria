import React, { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, Label, Input, Select, Button, AlertLine } from "../ui/primitivas.jsx";

const uid = () => Math.random().toString(36).slice(2, 10);
const hojeISO = () => new Date().toISOString().slice(0, 10);
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const linhaVazia = () => ({ chave: uid(), contaId: "", tipo: "D", valor: "", descricao: "" });

/* Lançar — o formulário de N linhas. Valida o equilíbrio ANTES de
   mandar pro servidor (a trava do banco, docs/06 §1, ainda é a
   autoridade final — isto só evita a pessoa descobrir o erro depois de
   preencher tudo). */
export function Lancar({ contas, onAdicionar }) {
  const contasOrdenadas = useMemo(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);
  const opcoesContas = contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} — ${c.nome}` }));

  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState("");
  const [linhas, setLinhas] = useState([linhaVazia(), linhaVazia()]);
  const [confirmado, setConfirmado] = useState(false);

  const editarLinha = (chave, campo, valor) => setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)));
  const removerLinha = (chave) => setLinhas((ls) => ls.filter((l) => l.chave !== chave));
  const adicionarLinha = () => setLinhas((ls) => [...ls, linhaVazia()]);

  const numero = (v) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : 0; };
  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + numero(l.valor), 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + numero(l.valor), 0);
  const diferenca = Math.round((somaD - somaC) * 100) / 100;

  const linhasValidas = linhas.filter((l) => l.contaId && numero(l.valor) > 0);
  const podeGravar = descricao.trim() && linhasValidas.length >= 2 && diferenca === 0 && somaD > 0;

  const gravar = () => {
    if (!podeGravar) return;
    const idLancamento = uid();
    /* `onAdicionar` devolve `false` quando o Livro recusa (ex.: mês
       fechado, docs/04 §8) — achado testando: o formulário limpava como
       se tivesse dado certo mesmo quando a mutação era rejeitada, o que
       esconderia o erro embaixo de um "funcionou" falso. Só reseta no
       sucesso de verdade. */
    const aceito = onAdicionar({
      lancamento: { id: idLancamento, data, dataCompetencia: data, descricao: descricao.trim(), origem: "manual", documento: null },
      linhas: linhasValidas.map((l) => ({
        id: uid(), lancamentoId: idLancamento, contaId: l.contaId, tipo: l.tipo, valor: numero(l.valor),
        descricao: l.descricao.trim() || null, vencimento: null,
      })),
    });
    if (aceito === false) return;
    setData(hojeISO()); setDescricao(""); setLinhas([linhaVazia(), linhaVazia()]);
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2000);
  };

  return (
    <Card>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label>Data</Label>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div>
          <Label>Descrição</Label>
          <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="ex.: Venda do dia" />
        </div>
      </div>

      <Label>Linhas</Label>
      {linhas.map((l) => (
        <div key={l.chave} className="flex gap-2 mb-2 items-center animate-[surgir_.2s_ease-out]">
          <Select value={l.tipo} onChange={(v) => editarLinha(l.chave, "tipo", v)} options={[{ value: "D", label: "D" }, { value: "C", label: "C" }]} />
          <div className="flex-[2]"><Select value={l.contaId} onChange={(v) => editarLinha(l.chave, "contaId", v)} placeholder="conta" options={opcoesContas} /></div>
          <Input money placeholder="valor" value={l.valor} onChange={(e) => editarLinha(l.chave, "valor", e.target.value)} className="flex-1" />
          <button type="button" onClick={() => removerLinha(l.chave)} disabled={linhas.length <= 2} className="transition-opacity hover:opacity-70 disabled:opacity-30 shrink-0" style={{ color: "var(--debit)" }} aria-label="Remover">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={adicionarLinha} className="text-xs inline-flex items-center gap-1 mt-1 mb-4 transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
        <Plus size={13} /> adicionar linha
      </button>

      <div className="flex items-center justify-between mb-4 text-xs" style={{ color: "var(--muted)" }}>
        <span>Débitos: {fmt(somaD)} · Créditos: {fmt(somaC)}</span>
        {diferenca !== 0 && <AlertLine>Diferença de {fmt(Math.abs(diferenca))} — o lançamento precisa fechar antes de gravar</AlertLine>}
      </div>

      <Button onClick={gravar} disabled={!podeGravar}>Lançar</Button>
      {confirmado && <span className="ml-3 text-xs" style={{ color: "var(--credit)" }}>Lançado.</span>}
    </Card>
  );
}
