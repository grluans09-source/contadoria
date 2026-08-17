import React, { useState, useEffect } from "react";
import { supabase } from "../dados/supabase.mjs";
import { Card, Label, Input, Select, Button } from "../ui/primitivas.jsx";

/* Editar o cadastro depois que o Roteiro do Cliente Novo já terminou —
   CNPJ, atividade, WhatsApp e afins mudam com o tempo. Grava direto em
   `negocios` via Supabase (fora do loop reativo do Livro de propósito:
   `negocios` não é uma coleção-filha escopada por negocio_id, é o
   próprio negócio — mesmo raciocínio do ClienteNovo.jsx). */
export function ConfigNegocio({ negocioId, onAtualizado }) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [campo, setCampo] = useState(null);

  useEffect(() => {
    let vivo = true;
    supabase.from("negocios").select("*").eq("id", negocioId).single()
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error) { setErro(error.message); return; }
        setCampo({
          nome: data.nome || "", apelido: data.apelido || "", cnpj: data.cnpj || "",
          atividade: data.atividade || "", whatsapp: data.whatsapp || "",
          tem_funcionario: data.tem_funcionario ? "sim" : "nao",
          dinheiro_misturado: data.dinheiro_misturado ? "sim" : "nao",
          situacao: data.situacao || "ativo",
        });
        setCarregando(false);
      });
    return () => { vivo = false; };
  }, [negocioId]);

  const set = (chave, valor) => setCampo((c) => ({ ...c, [chave]: valor }));

  const salvar = async () => {
    setSalvando(true);
    setErro("");
    const patch = {
      nome: campo.nome.trim(),
      apelido: campo.apelido.trim() || null,
      cnpj: campo.cnpj.trim() || null,
      atividade: campo.atividade.trim() || null,
      whatsapp: campo.whatsapp.trim() || null,
      tem_funcionario: campo.tem_funcionario === "sim",
      dinheiro_misturado: campo.dinheiro_misturado === "sim",
      situacao: campo.situacao,
    };
    const { error } = await supabase.from("negocios").update(patch).eq("id", negocioId);
    setSalvando(false);
    if (error) { setErro(error.message); return; }
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2000);
    /* Manda o patch de volta, não só um "mudou algo" — é o que permite
       quem escuta (App.jsx) atualizar o `negocio` em memória sem
       precisar recarregar a página (bug achado em teste, 15/ago). */
    onAtualizado?.(patch);
  };

  if (carregando) return <div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>;

  return (
    <Card className="max-w-lg">
      <div className="space-y-3">
        <div>
          <Label>Nome</Label>
          <Input value={campo.nome} onChange={(e) => set("nome", e.target.value)} />
        </div>
        <div>
          <Label>Apelido</Label>
          <Input value={campo.apelido} onChange={(e) => set("apelido", e.target.value)} />
        </div>
        <div>
          <Label>CNPJ</Label>
          <Input value={campo.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="opcional" />
        </div>
        <div>
          <Label>Atividade principal</Label>
          <Input value={campo.atividade} onChange={(e) => set("atividade", e.target.value)} />
        </div>
        <div>
          <Label>WhatsApp</Label>
          <Input value={campo.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </div>
        <div>
          <Label>Tem funcionário?</Label>
          <Select value={campo.tem_funcionario} onChange={(v) => set("tem_funcionario", v)} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
        </div>
        <div>
          <Label>Usa o mesmo dinheiro para o negócio e para as coisas dele?</Label>
          <Select value={campo.dinheiro_misturado} onChange={(v) => set("dinheiro_misturado", v)} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
          <div className="nota mt-1.5" style={{ color: "var(--muted)" }}>
            Se sim, gasto pessoal marcado na Caixa de Entrada vira retirada de verdade — não some
            do livro (docs/DECISOES.md C5). Corrigido depois que a resposta do onboarding não
            estava gravando aqui (achado em teste, 15/ago) — se o cliente já respondeu isso antes
            e o botão da Caixa de Entrada ainda mostra "É pessoal, ignorar", confirme aqui.
          </div>
        </div>
        <div>
          <Label>Situação</Label>
          <Select value={campo.situacao} onChange={(v) => set("situacao", v)} options={[{ value: "ativo", label: "Ativo" }, { value: "encerrado", label: "Encerrado" }]} />
        </div>

        {erro && <div className="text-xs rounded-md px-3 py-2" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Button>
          {confirmado && <span className="text-xs" style={{ color: "var(--credit)" }}>Salvo.</span>}
        </div>
      </div>
    </Card>
  );
}
