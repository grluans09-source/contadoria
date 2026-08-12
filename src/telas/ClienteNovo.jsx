import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { supabase } from "../dados/supabase.mjs";
import { Card, Label, Input, Select, Button } from "../ui/primitivas.jsx";
import { planoDeFabrica } from "../dominio/planoContas.mjs";
import { montarLancamentoAbertura } from "../dominio/aberturaBalanco.mjs";

/* O Roteiro do Cliente Novo — docs/05_ROTEIRO_DO_SERVICO.md §4 e
   docs/06_MODELO_DE_DADOS.md §4. Passo 5 do docs/06 §13.

   DECISÃO DE ARQUITETURA (registrada em docs/SESSION_STATE.md, 12/ago):
   as perguntas moram no banco (`roteiro_perguntas`, docs/06 §9) — é o
   texto e o "por que importa" que ficam editáveis sem mexer em código.
   Mas NÃO existe um interpretador genérico do campo `destino`: cada
   bloco tem código explícito que lê a resposta e grava no lugar certo.
   Um interpretador genérico seria abstração para um problema que hoje
   tem exatamente UM formulário (CLAUDE.md: "três linhas parecidas é
   melhor que abstração prematura").

   O Bloco 3 (a foto de hoje) é o único que foge do formulário genérico
   de pergunta-resposta: são LISTAS de itens (vários equipamentos, vários
   clientes que devem), não uma resposta por pergunta — por isso tem sua
   própria tela dentro deste arquivo. */

const NOMES_BLOCO = {
  1: "Quem é", 2: "Como o dinheiro anda", 3: "A foto de hoje",
  4: "O ritmo do negócio", 5: "O que ele quer", 6: "O combinado",
};

const hojeISO = () => new Date().toISOString().slice(0, 10);

/* ── "por que isso importa" — docs/05 §6, ao lado de cada campo ── */
function PorQueImporta({ texto }) {
  const [aberto, setAberto] = useState(false);
  if (!texto) return null;
  return (
    <div className="mt-1.5">
      <button type="button" onClick={() => setAberto((a) => !a)}
        className="text-[10px] inline-flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: "var(--muted)" }}>
        <HelpCircle size={11} /> por que isso importa?
      </button>
      {aberto && (
        <div className="text-xs mt-1.5 rounded-md px-3 py-2 animate-[surgir_.2s_ease-out]" style={{ background: "var(--accent-soft)", color: "var(--ink)" }}>
          {texto}
        </div>
      )}
    </div>
  );
}

/* ── campo genérico: o tipo de input vem de `tipo_resposta` ── */
function CampoRoteiro({ pergunta, valor, onChange }) {
  return (
    <div className="mb-5">
      <Label>{pergunta.pergunta}</Label>
      {pergunta.tipo_resposta === "sim_nao" ? (
        <Select value={valor ?? ""} onChange={onChange} placeholder="Escolha" options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
      ) : pergunta.tipo_resposta === "data" ? (
        <Input type="date" value={valor ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : pergunta.tipo_resposta === "moeda" ? (
        <Input money placeholder="0,00" value={valor ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : pergunta.tipo_resposta === "texto_longo" ? (
        <textarea rows={3} value={valor ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm transition-colors duration-150"
          style={{ borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }} />
      ) : (
        <Input value={valor ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
      <PorQueImporta texto={pergunta.porque_importa} />
    </div>
  );
}

/* ── lista de itens repetíveis (equipamentos, a receber, a pagar…) ── */
function ListaItens({ titulo, porque, itens, onChange, comVencimento }) {
  const add = () => onChange([...itens, { descricao: "", valor: "", vencimento: "" }]);
  const remover = (i) => onChange(itens.filter((_, idx) => idx !== i));
  const editar = (i, campo, v) => onChange(itens.map((it, idx) => (idx === i ? { ...it, [campo]: v } : it)));
  return (
    <div className="mb-6">
      <Label>{titulo}</Label>
      {itens.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center animate-[surgir_.2s_ease-out]">
          <Input placeholder="descrição" value={item.descricao} onChange={(e) => editar(i, "descricao", e.target.value)} className="flex-[2]" />
          <Input money placeholder="valor" value={item.valor} onChange={(e) => editar(i, "valor", e.target.value)} className="flex-1" />
          {comVencimento && <Input type="date" value={item.vencimento} onChange={(e) => editar(i, "vencimento", e.target.value)} className="flex-1" />}
          <button type="button" onClick={() => remover(i)} className="transition-opacity hover:opacity-70 shrink-0" style={{ color: "var(--debit)" }} aria-label="Remover">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs inline-flex items-center gap-1 mt-1 transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
        <Plus size={13} /> adicionar
      </button>
      <PorQueImporta texto={porque} />
    </div>
  );
}

/* ── Bloco 3 — a tela especializada do balanço de abertura ── */
function BlocoAbertura({ abertura, setAbertura, perguntas }) {
  const porBloco3 = (ordem) => perguntas.find((p) => p.bloco === 3 && p.ordem === ordem)?.porque_importa;
  return (
    <div>
      <div className="text-xs mb-5" style={{ color: "var(--muted)" }}>
        Todo cliente chega no meio da vida — esta é a foto do que ele tem e do que deve hoje.
        Valor aproximado está de bom tamanho; tudo é corrigível depois, com rastro.
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <Label>Dinheiro em espécie</Label>
          <Input money placeholder="0,00" value={abertura.caixa} onChange={(e) => setAbertura({ ...abertura, caixa: e.target.value })} />
        </div>
        <div>
          <Label>Na conta (banco)</Label>
          <Input money placeholder="0,00" value={abertura.banco} onChange={(e) => setAbertura({ ...abertura, banco: e.target.value })} />
        </div>
      </div>
      <PorQueImporta texto={porBloco3(1)} />

      <ListaItens titulo="O que o negócio tem que vale dinheiro (equipamentos, móveis, veículo)"
        porque={porBloco3(2)} itens={abertura.equipamentos}
        onChange={(v) => setAbertura({ ...abertura, equipamentos: v })} />

      <div className="mb-6">
        <Label>Mercadoria parada (valor total aproximado)</Label>
        <Input money placeholder="0,00" value={abertura.estoque} onChange={(e) => setAbertura({ ...abertura, estoque: e.target.value })} />
        <PorQueImporta texto={porBloco3(3)} />
      </div>

      <ListaItens titulo="Quem te deve, quanto, e para quando" comVencimento
        porque={porBloco3(4)} itens={abertura.aReceber}
        onChange={(v) => setAbertura({ ...abertura, aReceber: v })} />

      <ListaItens titulo="Quanto você deve, para quem, e quando vence" comVencimento
        porque={porBloco3(5)} itens={abertura.aPagar}
        onChange={(v) => setAbertura({ ...abertura, aPagar: v })} />

      <ListaItens titulo="Empréstimo ou financiamento (saldo devedor)"
        porque={porBloco3(6)} itens={abertura.emprestimos}
        onChange={(v) => setAbertura({ ...abertura, emprestimos: v })} />
    </div>
  );
}

export function ClienteNovo({ negocio, onConcluido, onVoltarSemSalvar }) {
  const [perguntas, setPerguntas] = useState([]);
  const [bloco, setBloco] = useState(1);
  const [respostas, setRespostas] = useState({});
  const [abertura, setAbertura] = useState({ caixa: "", banco: "", equipamentos: [], estoque: "", aReceber: [], aPagar: [], emprestimos: [] });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    supabase.from("roteiro_perguntas").select("*").eq("ativo", true).order("bloco").order("ordem")
      .then(({ data, error }) => { if (!error) setPerguntas(data || []); });
  }, []);

  /* Bloco 1 pergunta sobre tipo MEI/informal já foi respondida na
     criação do negócio (Negocios.jsx) — não repetir. */
  const perguntasDoBloco = (n) => perguntas.filter((p) => p.bloco === n && p.destino !== "negocios.tipo");

  const numeroOuNulo = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const montarItensAbertura = () => {
    const itens = [];
    const caixa = numeroOuNulo(abertura.caixa);
    if (caixa) itens.push({ contaId: "caixa", tipo: "D", valor: caixa, descricao: "Dinheiro em espécie" });
    const banco = numeroOuNulo(abertura.banco);
    if (banco) itens.push({ contaId: "banco", tipo: "D", valor: banco, descricao: "Saldo em conta" });
    for (const eq of abertura.equipamentos) {
      const v = numeroOuNulo(eq.valor);
      if (v) itens.push({ contaId: "equipamentos", tipo: "D", valor: v, descricao: eq.descricao || null });
    }
    const estoque = numeroOuNulo(abertura.estoque);
    if (estoque) itens.push({ contaId: "estoque", tipo: "D", valor: estoque, descricao: "Mercadoria em estoque" });
    for (const r of abertura.aReceber) {
      const v = numeroOuNulo(r.valor);
      if (v) itens.push({ contaId: "clientes", tipo: "D", valor: v, descricao: r.descricao || null, vencimento: r.vencimento || null });
    }
    for (const p of abertura.aPagar) {
      const v = numeroOuNulo(p.valor);
      if (v) itens.push({ contaId: "fornecedores", tipo: "C", valor: v, descricao: p.descricao || null, vencimento: p.vencimento || null });
    }
    for (const e of abertura.emprestimos) {
      const v = numeroOuNulo(e.valor);
      if (v) itens.push({ contaId: "emprestimos", tipo: "C", valor: v, descricao: e.descricao || null });
    }
    return itens;
  };

  const concluir = async () => {
    setErro("");
    const itens = montarItensAbertura();
    if (itens.length === 0) {
      setErro("O Bloco 3 (a foto de hoje) precisa de pelo menos um valor — nem que seja só o caixa.");
      setBloco(3);
      return;
    }

    setSalvando(true);
    try {
      /* Id DETERMINÍSTICO do lançamento de abertura — se essa gravação
         falhar no meio e o dono tentar de novo, o retry PRECISA cair no
         mesmo lançamento, não criar um segundo. É por isso que, logo
         abaixo, apagamos as linhas antigas antes de regravar: tudo no
         MESMO lote atômico, então ou o balanço fica limpo, ou nada muda. */
      const idAbertura = `abertura_${negocio.id}`;
      const { lancamento, linhas } = montarLancamentoAbertura({
        inicioDoServico: hojeISO(),
        itens,
      });

      const { data: linhasAntigas } = await supabase
        .from("lancamento_linhas").select("id")
        .eq("negocio_id", negocio.id).eq("lancamento_id", idAbertura);

      const ops = [
        ...(linhasAntigas || []).map((l) => ({ acao: "apagar", tabela: "lancamento_linhas", chave: { id: l.id } })),
        ...planoDeFabrica().map((c) => ({
          acao: "gravar", tabela: "contas",
          valores: { id: c.id, codigo: c.codigo, nome: c.nome, tipo: c.tipo, subtipo: c.subtipo ?? null, ordem: c.ordem, ativa: true },
        })),
        {
          acao: "gravar", tabela: "lancamentos",
          valores: { id: idAbertura, data: lancamento.data, data_competencia: lancamento.dataCompetencia, descricao: lancamento.descricao, origem: lancamento.origem, documento: null },
        },
        ...linhas.map((l) => ({
          acao: "gravar", tabela: "lancamento_linhas",
          valores: { id: l.id, lancamento_id: idAbertura, conta_id: l.contaId, tipo: l.tipo, valor: l.valor, descricao: l.descricao, vencimento: l.vencimento },
        })),
      ];

      const { error: erroLote } = await supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
      if (erroLote) throw new Error(`Não consegui gravar o balanço de abertura: ${erroLote.message}`);

      /* Campos estruturados do Bloco 1, direto na tabela de negócios —
         fora do aplicar_lote de propósito: `negocios` não é uma
         coleção-filha escopada por negocio_id, é o próprio negócio, e a
         RLS já garante que só o contador dele grava aqui. */
      const bloco1 = respostas;
      const patchNegocio = { inicio_do_servico: hojeISO(), configuracao: { ...(negocio.configuracao || {}), onboarded: true } };
      for (const p of perguntas) {
        if (p.bloco !== 1) continue;
        const valor = respostas[p.id];
        if (valor === undefined || valor === "") continue;
        if (p.destino === "negocios.data_abertura") patchNegocio.data_abertura = valor;
        if (p.destino === "negocios.atividade") patchNegocio.atividade = valor;
        if (p.destino === "negocios.tem_funcionario") patchNegocio.tem_funcionario = valor === "sim";
        if (p.destino === "negocios.whatsapp") patchNegocio.whatsapp = valor;
      }
      const { error: erroNegocio } = await supabase.from("negocios").update(patchNegocio).eq("id", negocio.id);
      if (erroNegocio) throw new Error(`Balanço gravado, mas não consegui atualizar o cadastro: ${erroNegocio.message}`);

      /* O que foi dito nos outros blocos — arquivo, mesmo já tendo virado
         registro em outro lugar (docs/06 §9). */
      const linhasRespostas = Object.entries(respostas)
        .filter(([, resposta]) => resposta !== undefined && resposta !== "")
        .map(([perguntaId, resposta]) => ({ negocio_id: negocio.id, pergunta_id: perguntaId, resposta: String(resposta) }));
      if (linhasRespostas.length) {
        await supabase.from("roteiro_respostas").upsert(linhasRespostas, { onConflict: "negocio_id,pergunta_id" });
      }

      onConcluido();
    } catch (e) {
      setErro(e.message || "Algo deu errado — tenta de novo.");
    } finally {
      setSalvando(false);
    }
  };

  const ultimoBloco = bloco === 6;

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <button onClick={onVoltarSemSalvar} className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={14} /> Voltar
        </button>

        <div className="mb-2 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Roteiro do Cliente Novo · Bloco {bloco} de 6
        </div>
        <div className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
          {negocio.apelido || negocio.nome} — {NOMES_BLOCO[bloco]}
        </div>

        {/* trilha de blocos */}
        <div className="flex gap-1 mb-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{ background: n <= bloco ? "var(--gold)" : "var(--rule-faint)" }} />
          ))}
        </div>

        <Card className="mb-6">
          {bloco === 3 ? (
            <BlocoAbertura abertura={abertura} setAbertura={setAbertura} perguntas={perguntas} />
          ) : (
            perguntasDoBloco(bloco).map((p) => (
              <CampoRoteiro key={p.id} pergunta={p} valor={respostas[p.id]}
                onChange={(v) => setRespostas({ ...respostas, [p.id]: v })} />
            ))
          )}
        </Card>

        {erro && <div className="text-xs rounded-md px-3 py-2 mb-4" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}

        <div className="flex justify-between">
          <Button variant="ghost" disabled={bloco === 1} onClick={() => setBloco((b) => b - 1)}>
            <ArrowLeft size={14} /> Anterior
          </Button>
          {ultimoBloco ? (
            <Button onClick={concluir} disabled={salvando}>{salvando ? "Gravando…" : "Concluir cadastro"}</Button>
          ) : (
            <Button onClick={() => setBloco((b) => b + 1)}>Próximo <ArrowRight size={14} /></Button>
          )}
        </div>
      </div>
    </div>
  );
}
