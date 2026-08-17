import React, { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Card, Label, Input, Select, Button, TituloCard } from "../ui/primitivas.jsx";

const uid = () => Math.random().toString(36).slice(2, 10);
const TIPO_LABEL = { ativo: "Ativo", passivo: "Passivo", pl: "Patrimônio Líquido", receita: "Receita", despesa: "Despesa" };
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

function FormularioNovaConta({ contas, onAdicionar, onFechar }) {
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("despesa");
  const [erro, setErro] = useState("");

  const salvar = () => {
    if (!codigo.trim() || !nome.trim()) { setErro("Código e nome são obrigatórios."); return; }
    const id = slug(nome) + "_" + uid().slice(0, 4);
    if (contas.some((c) => c.codigo === codigo.trim())) { setErro("Já existe uma conta com esse código."); return; }
    onAdicionar({ id, codigo: codigo.trim(), nome: nome.trim(), tipo, subtipo: null, ordem: contas.filter((c) => c.tipo === tipo).length + 1, ativa: true });
    setCodigo(""); setNome(""); onFechar();
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium" style={{ color: "var(--ink)" }}>Nova conta</div>
        <button onClick={onFechar} style={{ color: "var(--muted)" }} aria-label="Fechar"><X size={15} /></button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <Label>Código</Label>
          <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="ex.: 5114" />
        </div>
        <div className="col-span-2">
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex.: Manutenção de equipamento" />
        </div>
      </div>
      <div className="mb-3 max-w-xs">
        <Label>Tipo</Label>
        <Select value={tipo} onChange={setTipo} options={Object.entries(TIPO_LABEL).map(([value, label]) => ({ value, label }))} />
      </div>
      {erro && <div className="text-xs rounded-md px-3 py-2 mb-3" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}
      <Button onClick={salvar}>Adicionar</Button>
    </Card>
  );
}

/* O Plano de Contas — adicionar conta nova, ativar/desativar. Passa
   pelo loop reativo normal do Livro (contas já é coleção sincronizada,
   docs/06 §9). Não existe "excluir conta" de propósito: uma conta com
   movimento não pode sumir sem quebrar o histórico — desativar
   (`ativa=false`) tira da lista de escolha sem apagar nada. */
export function PlanoContas({ contas, onAdicionar, onAlternarAtiva }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const porTipo = useMemo(() => {
    const grupos = {};
    for (const c of [...contas].sort((a, b) => a.codigo.localeCompare(b.codigo))) {
      (grupos[c.tipo] = grupos[c.tipo] || []).push(c);
    }
    return grupos;
  }, [contas]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!mostrarForm && <Button onClick={() => setMostrarForm(true)}><Plus size={14} /> Nova conta</Button>}
      </div>
      {mostrarForm && <FormularioNovaConta contas={contas} onAdicionar={onAdicionar} onFechar={() => setMostrarForm(false)} />}

      {Object.entries(TIPO_LABEL).map(([tipo, label]) => (
        (porTipo[tipo] || []).length > 0 && (
          <div key={tipo} className="mb-5">
            <TituloCard>{label}</TituloCard>
            <Card pad="apertado">
              {porTipo[tipo].map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--rule-faint)", opacity: c.ativa ? 1 : 0.45 }}>
                  <div className="text-sm">
                    <span className="font-mono text-xs mr-2" style={{ color: "var(--muted)" }}>{c.codigo}</span>
                    <span style={{ color: "var(--ink)" }}>{c.nome}</span>
                  </div>
                  <button onClick={() => onAlternarAtiva(c.id, !c.ativa)} className="text-xs transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
                    {c.ativa ? "desativar" : "ativar"}
                  </button>
                </div>
              ))}
            </Card>
          </div>
        )
      ))}
    </div>
  );
}
