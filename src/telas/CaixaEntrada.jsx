import React, { useState, useMemo } from "react";
import { Upload, Check, X, HelpCircle } from "lucide-react";
import { Card, Label, Input, Select, Button } from "../ui/primitivas.jsx";
import { parseOFX, parseCSVText, toISO } from "../dominio/importarExtrato.mjs";
import { sugerirConta } from "../dominio/classificacao.mjs";

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");

const CONTAS_TRANSITO = [{ value: "caixa", label: "Caixa (dinheiro)" }, { value: "banco", label: "Banco" }];

/* ── Importar extrato — CSV ou OFX, colado ou solto no campo ── */
function ImportarExtrato({ onImportar }) {
  const [texto, setTexto] = useState("");
  const [contaOrigem, setContaOrigem] = useState("banco");
  const [linhas, setLinhas] = useState(null); // preview antes de confirmar
  const [erro, setErro] = useState("");

  const processar = () => {
    setErro("");
    const bruto = texto.trim();
    if (!bruto) { setErro("Cole o conteúdo do extrato (CSV ou OFX) primeiro."); return; }

    if (bruto.includes("<STMTTRN>") || bruto.includes("<OFX>")) {
      const linhasOfx = parseOFX(bruto);
      if (!linhasOfx.length) { setErro("Não achei nenhuma transação no OFX — confira o arquivo."); return; }
      setLinhas(linhasOfx.map((l) => ({ data: l.date, descricaoBruta: l.desc, valor: l.amount })));
      return;
    }

    const { header, rows } = parseCSVText(bruto);
    if (!rows.length) { setErro("Não achei nenhuma linha no CSV."); return; }
    /* Tenta achar as colunas por nome comum; se não achar, usa as três primeiras
       colunas na ordem data/descrição/valor — é o formato mais comum de exportação
       de banco brasileiro. */
    const idx = (nomes) => header.findIndex((h) => nomes.some((n) => h.toLowerCase().includes(n)));
    const iData = idx(["data", "date"]); const iDesc = idx(["descri", "histor", "memo"]); const iValor = idx(["valor", "amount"]);
    const linhasCsv = rows.map((r) => ({
      data: toISO(r[iData >= 0 ? iData : 0] || ""),
      descricaoBruta: (r[iDesc >= 0 ? iDesc : 1] || "").trim(),
      valor: parseFloat((r[iValor >= 0 ? iValor : 2] || "0").replace(/\./g, "").replace(",", ".")) || parseFloat(r[iValor >= 0 ? iValor : 2] || "0") || 0,
    })).filter((l) => l.data && l.valor);
    if (!linhasCsv.length) { setErro("Não consegui reconhecer as colunas de data/descrição/valor — confira o CSV."); return; }
    setLinhas(linhasCsv);
  };

  const confirmar = () => {
    onImportar(linhas.map((l) => ({
      id: uid(), origem: "extrato", data: l.data, descricaoBruta: l.descricaoBruta,
      valor: l.valor, situacao: "pendente", lancamentoId: null, contaOrigemId: contaOrigem,
    })));
    setTexto(""); setLinhas(null);
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Upload size={15} style={{ color: "var(--accent)" }} />
        <span className="font-medium" style={{ color: "var(--ink)" }}>Importar extrato</span>
      </div>

      {linhas === null ? (
        <>
          <div className="mb-3 max-w-xs">
            <Label>Esta é a conta de</Label>
            <Select value={contaOrigem} onChange={setContaOrigem} options={CONTAS_TRANSITO} />
          </div>
          <textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole aqui o conteúdo do arquivo CSV ou OFX exportado do banco…"
            className="w-full rounded-md border px-3 py-2 text-xs font-mono mb-3 transition-colors duration-150"
            style={{ borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }} />
          {erro && <div className="text-xs rounded-md px-3 py-2 mb-3" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}
          <Button onClick={processar}>Processar</Button>
        </>
      ) : (
        <>
          <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>{linhas.length} linha(s) encontrada(s) — confira antes de importar:</div>
          <div className="max-h-56 overflow-y-auto mb-3 text-xs">
            {linhas.map((l, i) => (
              <div key={i} className="flex justify-between py-1" style={{ borderBottom: "1px solid var(--rule-faint)" }}>
                <span style={{ color: "var(--muted)" }}>{fmtData(l.data)}</span>
                <span className="flex-1 mx-2 truncate">{l.descricaoBruta}</span>
                <span className="tabular-nums">{fmt(l.valor)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={confirmar}>Importar {linhas.length} linha(s)</Button>
            <Button variant="ghost" onClick={() => setLinhas(null)}>Cancelar</Button>
          </div>
        </>
      )}
    </Card>
  );
}

/* ── Um item pendente — os três destinos possíveis ── */
function ItemPendente({ item, contas, regras, onClassificar, onPessoal, onDuvida }) {
  const [classificando, setClassificando] = useState(false);
  const sugestao = useMemo(() => sugerirConta(item.descricaoBruta, regras), [item.descricaoBruta, regras]);
  const [contaId, setContaId] = useState(sugestao?.contaId || "");
  const [padrao, setPadrao] = useState(sugestao?.padrao || item.descricaoBruta);

  const contasOrdenadas = useMemo(() => [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo)), [contas]);

  const confirmar = () => {
    if (!contaId) return;
    /* Só fecha o formulário inline se o Livro aceitou de verdade (ex.:
       recusaria com mês fechado, docs/04 §8) — mesmo cuidado do Lancar.jsx. */
    const aceito = onClassificar({ item, contaCategoriaId: contaId, padrao: padrao.trim() || item.descricaoBruta });
    if (aceito !== false) setClassificando(false);
  };

  return (
    <Card pad="apertado" className="mb-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs" style={{ color: "var(--muted)" }}>{fmtData(item.data)} · {item.contaOrigemId === "banco" ? "Banco" : "Caixa"}</div>
          <div className="truncate" style={{ color: "var(--ink)" }}>{item.descricaoBruta}</div>
          {sugestao && !classificando && (
            <div className="text-[10px] mt-0.5" style={{ color: "var(--accent)" }}>
              sugestão: {contas.find((c) => c.id === sugestao.contaId)?.nome}
            </div>
          )}
        </div>
        <div className="text-sm tabular-nums shrink-0" style={{ color: item.valor >= 0 ? "var(--credit)" : "var(--debit)" }}>{fmt(item.valor)}</div>
      </div>

      {classificando ? (
        <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid var(--rule-faint)" }}>
          <div>
            <Label>Categoria</Label>
            <Select value={contaId} onChange={setContaId} placeholder="escolha a conta" options={contasOrdenadas.map((c) => ({ value: c.id, label: `${c.codigo} — ${c.nome}` }))} />
          </div>
          <div>
            <Label>Padrão para lembrar da próxima vez</Label>
            <Input value={padrao} onChange={(e) => setPadrao(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button small onClick={confirmar} disabled={!contaId}>Confirmar</Button>
            <Button small variant="ghost" onClick={() => setClassificando(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 mt-2">
          <Button small onClick={() => setClassificando(true)}><Check size={12} /> Classificar</Button>
          <Button small variant="ghost" onClick={() => onPessoal(item)}><X size={12} /> É pessoal</Button>
          <Button small variant="ghost" onClick={() => onDuvida(item)}><HelpCircle size={12} /> Não sei</Button>
        </div>
      )}
    </Card>
  );
}

/* A Caixa de Entrada — o gargalo real do serviço (docs/03 §5, docs/04 §5). */
export function CaixaEntrada({ contas, entradaItens, regrasClassificacao, onImportar, onClassificar, onPessoal, onDuvida }) {
  const pendentes = entradaItens.filter((i) => i.situacao === "pendente" || i.situacao === "duvida");

  return (
    <div>
      <ImportarExtrato onImportar={onImportar} />
      <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
        {pendentes.length} item(ns) esperando classificação
      </div>
      {pendentes.length === 0 ? (
        <Card className="text-center py-10">
          <div className="text-sm" style={{ color: "var(--muted)" }}>Nada esperando — importe um extrato acima.</div>
        </Card>
      ) : (
        pendentes.map((item) => (
          <ItemPendente key={item.id} item={item} contas={contas} regras={regrasClassificacao}
            onClassificar={onClassificar} onPessoal={onPessoal} onDuvida={onDuvida} />
        ))
      )}
    </div>
  );
}
