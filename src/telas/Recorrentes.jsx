import React, { useState, useMemo } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Card, Label, Input, Select, Button, AlertLine } from "../ui/primitivas.jsx";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const linhaVazia = () => ({ chave: uid(), contaId: "", tipo: "D", valor: "" });

/* Formulário de novo template — mesma validação de equilíbrio do
   Lancar.jsx (D=C antes de gravar), mas sem campo de data: um
   recorrente não tem data própria, ganha uma toda vez que é gerado. */
function FormularioNovoRecorrente({ opcoesContas, onAdicionar, onFechar }) {
  const [descricao, setDescricao] = useState("");
  const [linhas, setLinhas] = useState([linhaVazia(), linhaVazia()]);

  const editarLinha = (chave, campo, valor) => setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)));
  const removerLinha = (chave) => setLinhas((ls) => ls.filter((l) => l.chave !== chave));
  const adicionarLinha = () => setLinhas((ls) => [...ls, linhaVazia()]);

  const numero = (v) => { const n = parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : 0; };
  const somaD = linhas.filter((l) => l.tipo === "D").reduce((s, l) => s + numero(l.valor), 0);
  const somaC = linhas.filter((l) => l.tipo === "C").reduce((s, l) => s + numero(l.valor), 0);
  const diferenca = Math.round((somaD - somaC) * 100) / 100;
  const linhasValidas = linhas.filter((l) => l.contaId && numero(l.valor) > 0);
  const podeGravar = descricao.trim() && linhasValidas.length >= 2 && diferenca === 0 && somaD > 0;

  const salvar = () => {
    if (!podeGravar) return;
    const recorrenteId = uid();
    onAdicionar({
      recorrente: { id: recorrenteId, descricao: descricao.trim(), ativa: true },
      linhas: linhasValidas.map((l) => ({ id: uid(), recorrenteId, contaId: l.contaId, tipo: l.tipo, valor: numero(l.valor) })),
    });
    onFechar();
  };

  return (
    <Card className="mb-4">
      <div className="mb-3">
        <Label>Descrição</Label>
        <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="ex.: Aluguel" />
      </div>

      <Label>Linhas</Label>
      {linhas.map((l) => (
        <div key={l.chave} className="flex gap-2 mb-2 items-center">
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
        {diferenca !== 0 && <AlertLine>Diferença de {fmt(Math.abs(diferenca))} — precisa fechar antes de gravar</AlertLine>}
      </div>

      <div className="flex gap-2">
        <Button onClick={salvar} disabled={!podeGravar}>Salvar recorrente</Button>
        <Button variant="ghost" onClick={onFechar}>Cancelar</Button>
      </div>
    </Card>
  );
}

/* Recorrentes — docs/05_ROTEIRO_DO_SERVICO.md §7: "já entram
   cadastradas na abertura — é o que faz o segundo mês ser rápido". Cada
   template é um mini-lançamento sem data; "Gerar lançamentos do mês"
   materializa todos os ativos de uma vez (docs/dominio/recorrentes.mjs
   cuida de não duplicar se já foi gerado este mês). */
export function Recorrentes({ contas, recorrentes, recorrenteLinhas, onAdicionar, onAlternarAtiva, onGerar }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [resultado, setResultado] = useState(null);

  const contasPorId = useMemo(() => new Map(contas.map((c) => [c.id, c])), [contas]);
  const opcoesContas = useMemo(
    () => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)).map((c) => ({ value: c.id, label: `${c.codigo} — ${c.nome}` })),
    [contas]
  );

  const linhasDe = (recorrenteId) => recorrenteLinhas.filter((l) => l.recorrenteId === recorrenteId);

  const gerar = () => {
    const { gerados } = onGerar();
    setResultado(gerados);
    setTimeout(() => setResultado(null), 4000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Button onClick={gerar} disabled={!recorrentes.some((r) => r.ativa)}>
          <RefreshCw size={14} /> Gerar lançamentos do mês
        </Button>
        {!mostrarForm && <Button variant="ghost" onClick={() => setMostrarForm(true)}><Plus size={14} /> Novo recorrente</Button>}
      </div>

      {resultado !== null && (
        <div className="text-xs rounded-md px-3 py-2 mb-4" style={{ background: "var(--credit-soft)", color: "var(--credit)" }}>
          {resultado > 0 ? `${resultado} lançamento(s) gerado(s) — confira no Diário.` : "Nada para gerar: já foi feito este mês, ou não há recorrente ativa."}
        </div>
      )}

      {mostrarForm && <FormularioNovoRecorrente opcoesContas={opcoesContas} onAdicionar={onAdicionar} onFechar={() => setMostrarForm(false)} />}

      {recorrentes.length === 0 && !mostrarForm && (
        <Card className="text-center py-10">
          <div className="text-sm" style={{ color: "var(--ink)" }}>Nenhum recorrente cadastrado ainda.</div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Aluguel, internet, mensalidade — o que se repete todo mês.</div>
        </Card>
      )}

      <div className="space-y-3">
        {recorrentes.map((r) => (
          <Card key={r.id} pad="apertado" style={{ opacity: r.ativa ? 1 : 0.45 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{r.descricao}</span>
              <button onClick={() => onAlternarAtiva(r.id, !r.ativa)} className="text-xs transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
                {r.ativa ? "desativar" : "ativar"}
              </button>
            </div>
            {linhasDe(r.id).map((l) => (
              <div key={l.id} className="flex justify-between text-xs py-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                <span>{l.tipo} · {contasPorId.get(l.contaId)?.nome || l.contaId}</span>
                <span>{fmt(l.valor)}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
