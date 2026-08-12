import React, { useState, useEffect, useCallback } from "react";
import { Building2, Plus, X } from "lucide-react";
import { supabase } from "../dados/supabase.mjs";
import { Card, Label, Input, Select, Button, Confirmacao } from "../ui/primitivas.jsx";

/* A prateleira (docs/04_MAPA_DO_APP.md §2) — versão inicial do passo 4.
   As colunas ricas (movimento do mês, faturamento × limite, DAS) chegam
   no passo 5+, quando existir lançamento de verdade para mostrar; até
   lá, mostrar "—" seria mentir que há dado onde não há. */

const TIPO_LABEL = { mei: "MEI", informal: "Informal" };

function CardNegocio({ negocio, recemCriado, onAbrir }) {
  return (
    <Card
      elevavel
      onClick={() => onAbrir(negocio)}
      className={recemCriado ? "animate-[surgir_.4s_ease-out]" : ""}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate" style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>
            {negocio.apelido || negocio.nome}
          </div>
          {negocio.apelido && (
            <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{negocio.nome}</div>
          )}
        </div>
        <span
          className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full shrink-0"
          style={{ background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}
        >
          {TIPO_LABEL[negocio.tipo] || negocio.tipo}
        </span>
      </div>
      <div className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
        {negocio.situacao === "ativo" ? "Nenhum lançamento ainda" : "Encerrado"}
      </div>
    </Card>
  );
}

function FormularioNovoNegocio({ onCriado, onFechar }) {
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [tipo, setTipo] = useState("mei");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const salvar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) { setErro("Dá um nome pro negócio — pode ser só o nome do cliente."); return; }
    setSalvando(true);
    setErro("");
    try {
      const { data, error } = await supabase.rpc("criar_negocio", {
        p_nome: nome.trim(),
        p_apelido: apelido.trim() || null,
        p_tipo: tipo,
      });
      if (error) throw error;
      onCriado(data);
    } catch (err) {
      setErro(err?.message || "Não consegui criar — tenta de novo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-medium" style={{ color: "var(--ink)", fontFamily: "var(--font-display)" }}>Novo negócio</div>
        <button onClick={onFechar} className="transition-opacity hover:opacity-70" aria-label="Fechar" style={{ color: "var(--muted)" }}>
          <X size={16} />
        </button>
      </div>
      <form onSubmit={salvar} className="space-y-3">
        <div>
          <Label>Nome do negócio ou do cliente</Label>
          <Input autoFocus value={nome} onChange={e => setNome(e.target.value)} placeholder="ex.: Salgados da Léia" />
        </div>
        <div>
          <Label>Apelido (opcional — como você quer ver na lista)</Label>
          <Input value={apelido} onChange={e => setApelido(e.target.value)} placeholder="ex.: Léia" />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select value={tipo} onChange={setTipo} options={[
            { value: "mei", label: "MEI" },
            { value: "informal", label: "Informal" },
          ]} />
        </div>
        {erro && <div className="text-xs rounded-md px-3 py-2" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}
        <Button type="submit" disabled={salvando}>{salvando ? "Criando…" : "Criar negócio"}</Button>
      </form>
    </Card>
  );
}

export function Negocios({ onAbrirNegocio }) {
  const [negocios, setNegocios] = useState(null); /* null = carregando */
  const [mostrarForm, setMostrarForm] = useState(false);
  const [recemCriadoId, setRecemCriadoId] = useState(null);
  const [erro, setErro] = useState("");
  const [confirmacao, setConfirmacao] = useState(false);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from("negocios")
      .select("id, nome, apelido, tipo, situacao, created_at")
      .order("created_at", { ascending: false });
    if (error) { setErro(error.message); return; }
    setNegocios(data || []);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const aoCriar = async (novoId) => {
    setMostrarForm(false);
    await carregar();
    setRecemCriadoId(novoId);
    setConfirmacao(true);
    setTimeout(() => setConfirmacao(false), 2200);
    setTimeout(() => setRecemCriadoId(null), 900);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>Seus negócios</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>a prateleira</div>
          </div>
          {!mostrarForm && (
            <Button onClick={() => setMostrarForm(true)}>
              <Plus size={15} /> Novo negócio
            </Button>
          )}
        </div>

        <div className="mb-4"><Confirmacao texto="Negócio criado." ativa={confirmacao} /></div>

        {mostrarForm && <FormularioNovoNegocio onCriado={aoCriar} onFechar={() => setMostrarForm(false)} />}

        {erro && <div className="text-xs rounded-md px-3 py-2 mb-4" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}

        {negocios === null && (
          <div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>
        )}

        {negocios !== null && negocios.length === 0 && !mostrarForm && (
          <Card className="text-center py-12">
            <Building2 size={28} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
            <div className="text-sm" style={{ color: "var(--ink)" }}>Nenhum negócio cadastrado ainda.</div>
            <div className="text-xs mt-1 mb-4" style={{ color: "var(--muted)" }}>O primeiro passo é criar o negócio do seu primeiro cliente.</div>
            <Button onClick={() => setMostrarForm(true)}><Plus size={15} /> Criar o primeiro</Button>
          </Card>
        )}

        {negocios !== null && negocios.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {negocios.map(n => (
              <CardNegocio key={n.id} negocio={n} recemCriado={n.id === recemCriadoId} onAbrir={onAbrirNegocio} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
