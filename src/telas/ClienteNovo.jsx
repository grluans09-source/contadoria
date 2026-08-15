import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, HelpCircle, Send } from "lucide-react";
import { supabase } from "../dados/supabase.mjs";
import { Card, Label, Input, Select, Button } from "../ui/primitivas.jsx";
import { planoDeFabrica, camposAberturaDe } from "../dominio/arquetipos.mjs";
import { separarDividas, CLASSIFICACOES_DIVIDA } from "../dominio/dividas.mjs";
import { perguntasPara, respostaPorDestino, respostasParaNegocio } from "../dominio/roteiro.mjs";
import { montarRetratoDeEntrada } from "../dominio/linhaDeBase.mjs";
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
const fmtMoeda = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const uid = () => Math.random().toString(36).slice(2, 10);

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

/* ── Mandar o roteiro para o cliente responder sozinho ──────────
   Pedido do dono (14/ago): horário de dono de negócio pequeno raramente
   bate com horário de estudante. Gera um link com token, válido 30 dias
   (0012_formulario_publico.sql). */
function MandarParaOCliente({ negocioId, whatsapp }) {
  const [link, setLink] = useState("");
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");

  const gerar = async () => {
    setGerando(true); setErro("");
    const { data, error } = await supabase
      .from("formularios")
      .insert({ negocio_id: negocioId, tipo: "onboarding" })
      .select("token").single();
    setGerando(false);
    if (error) { setErro("Não consegui gerar o link — tenta de novo."); return; }
    setLink(`${window.location.origin}${window.location.pathname}?f=${data.token}`);
  };

  const copiar = async () => {
    await navigator.clipboard.writeText(
      `Oi! Pra eu organizar as contas do seu negócio, preenche essas perguntas rápidas quando puder:\n\n${link}\n\nLeva uns 10 minutos e dá pra parar no meio e voltar depois.`
    );
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Send size={15} style={{ color: "var(--accent)" }} />
        <span className="font-medium" style={{ color: "var(--ink)" }}>Não dá para fazer agora?</span>
      </div>
      <div className="text-xs mb-3" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        Manda o link e o cliente responde do celular, no tempo dele. Ele vê uma pergunta por vez,
        pode parar no meio e voltar. Quando terminar, as respostas aparecem aqui.
        <br />O balanço de abertura e o combinado continuam com você — é onde o seu olho faz diferença.
      </div>
      {!link ? (
        <Button small onClick={gerar} disabled={gerando}>{gerando ? "Gerando…" : "Gerar link do cliente"}</Button>
      ) : (
        <div>
          <div className="text-[11px] rounded-md px-3 py-2 mb-2 break-all"
            style={{ background: "var(--paper)", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{link}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button small onClick={copiar}>{copiado ? "Copiado!" : "Copiar mensagem pronta"}</Button>
            {whatsapp && (
              <a href={`https://wa.me/${String(whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(`Oi! Pra eu organizar as contas do seu negócio, preenche essas perguntas rápidas quando puder: ${link}`)}`}
                target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: "var(--accent)" }}>
                abrir no WhatsApp
              </a>
            )}
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>vale 30 dias</span>
          </div>
        </div>
      )}
      {erro && <div className="text-xs mt-2" style={{ color: "var(--debit)" }}>{erro}</div>}
    </Card>
  );
}

/* ── Lista de dívidas, cada uma com a sua classificação ─────────
   O dono perguntou: "quanto você deve pra quem — seria relacionado ao
   trabalho?". A resposta tem três casos, e o do meio é o mais comum e o
   mais fácil de errar (ver src/dominio/dividas.mjs). */
function ListaDividas({ itens, onChange }) {
  const add = () => onChange([...itens, { descricao: "", valor: "", vencimento: "", classificacao: "negocio", ehFornecedor: true }]);
  const remover = (i) => onChange(itens.filter((_, idx) => idx !== i));
  const editar = (i, campo, v) => onChange(itens.map((it, idx) => (idx === i ? { ...it, [campo]: v } : it)));

  const { notas, totalPessoal } = separarDividas(itens);

  return (
    <div className="mb-6">
      <Label>Quanto você deve, para quem, e quando vence</Label>
      {itens.map((item, i) => {
        const classe = CLASSIFICACOES_DIVIDA.find((c) => c.id === item.classificacao);
        return (
          <div key={i} className="mb-3 pb-3" style={{ borderBottom: "1px solid var(--rule-faint)" }}>
            <div className="flex gap-2 mb-2 items-center">
              <Input placeholder="para quem" value={item.descricao} onChange={(e) => editar(i, "descricao", e.target.value)} className="flex-[2]" />
              <Input money placeholder="valor" value={item.valor} onChange={(e) => editar(i, "valor", e.target.value)} className="flex-1" />
              <Input type="date" value={item.vencimento} onChange={(e) => editar(i, "vencimento", e.target.value)} className="flex-1" />
              <button type="button" onClick={() => remover(i)} className="transition-opacity hover:opacity-70 shrink-0" style={{ color: "var(--debit)" }} aria-label="Remover">
                <Trash2 size={15} />
              </button>
            </div>
            <Select value={item.classificacao} onChange={(v) => editar(i, "classificacao", v)}
              options={CLASSIFICACOES_DIVIDA.map((c) => ({ value: c.id, label: c.rotulo }))} />
            {classe && (
              <div className="text-[11px] mt-1" style={{ color: classe.entraNoLivro ? "var(--muted)" : "var(--accent)" }}>
                {classe.ajuda}
              </div>
            )}
            {item.classificacao === "negocio" && (
              <label className="text-[11px] inline-flex items-center gap-1.5 mt-1.5" style={{ color: "var(--muted)" }}>
                <input type="checkbox" checked={item.ehFornecedor !== false}
                  onChange={(e) => editar(i, "ehFornecedor", e.target.checked)} />
                é fornecedor (se não, entra como empréstimo)
              </label>
            )}
          </div>
        );
      })}
      <button type="button" onClick={add} className="text-xs inline-flex items-center gap-1 mt-1" style={{ color: "var(--accent)" }}>
        <Plus size={13} /> adicionar dívida
      </button>

      {notas.length > 0 && (
        <div className="text-xs rounded-md px-3 py-2 mt-3" style={{ background: "var(--accent-soft)", color: "var(--ink)", lineHeight: 1.6 }}>
          {fmtMoeda(totalPessoal)} em dívida pessoal fica <strong>fora</strong> do livro do negócio — está certo assim.
          Mas anote: isso muda quanto ele precisa tirar por mês, e é conversa da primeira entrega.
        </div>
      )}
    </div>
  );
}

/* ── Contas fixas do Bloco 4 — vira RECORRENTE de verdade ───────
   Pedido do dono (14/ago, Fase 5): "quais contas você paga todo mês"
   deixou de ser texto livre jogado fora — cada item aqui cria um
   template em `recorrentes` + `recorrente_linhas` (mesma tabela da tela
   Recorrentes, src/telas/Recorrentes.jsx), então no segundo mês do
   cliente essas contas já aparecem prontas para gerar o lançamento. */
function BlocoContasFixas({ itens, onChange, opcoesDespesa }) {
  const add = () => onChange([...itens, { descricao: "", valor: "", contaId: "", deOnde: "banco" }]);
  const remover = (i) => onChange(itens.filter((_, idx) => idx !== i));
  const editar = (i, campo, v) => onChange(itens.map((it, idx) => (idx === i ? { ...it, [campo]: v } : it)));

  return (
    <div className="mb-6">
      <Label>Quais contas você paga todo mês (aluguel, internet, mensalidade)</Label>
      {itens.map((item, i) => (
        <div key={i} className="mb-2 pb-2" style={{ borderBottom: "1px solid var(--rule-faint)" }}>
          <div className="flex gap-2 mb-2 items-center animate-[surgir_.2s_ease-out]">
            <Input placeholder="descrição" value={item.descricao} onChange={(e) => editar(i, "descricao", e.target.value)} className="flex-[2]" />
            <Input money placeholder="valor" value={item.valor} onChange={(e) => editar(i, "valor", e.target.value)} className="flex-1" />
            <button type="button" onClick={() => remover(i)} className="transition-opacity hover:opacity-70 shrink-0" style={{ color: "var(--debit)" }} aria-label="Remover">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex-[2]">
              <Select value={item.contaId} onChange={(v) => editar(i, "contaId", v)} placeholder="qual conta" options={opcoesDespesa} />
            </div>
            <div className="flex-1">
              <Select value={item.deOnde} onChange={(v) => editar(i, "deOnde", v)}
                options={[{ value: "banco", label: "sai do banco" }, { value: "caixa", label: "sai do caixa" }]} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-xs inline-flex items-center gap-1 mt-1 transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
        <Plus size={13} /> adicionar conta fixa
      </button>
      <div className="text-[11px] mt-1.5" style={{ color: "var(--muted)" }}>
        Cadastradas aqui, elas já aparecem prontas no mês seguinte — é o que faz o segundo mês do cliente ser rápido.
        Não precisa ser exato nem completo hoje: dá para ajustar e acrescentar depois, na aba Recorrentes.
      </div>
    </div>
  );
}

/* ── Bloco 3 — a foto de hoje, montada a partir do ARQUÉTIPO ────
   Os campos comuns valem para todo negócio; os específicos vêm de
   `camposAbertura` do arquétipo — é o que faz a facção ser perguntada
   sobre mercadoria na mão de terceiro e o eletricista sobre material
   já comprado para obra. */
function BlocoAbertura({ abertura, setAbertura, perguntas, arquetipo, dinheiroMisturado }) {
  const porBloco3 = (ordem) => perguntas.find((p) => p.bloco === 3 && p.ordem === ordem)?.porque_importa;
  const especificos = camposAberturaDe(arquetipo);

  return (
    <div>
      <div className="text-xs mb-5" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        Todo cliente chega no meio da vida — esta é a foto do que ele tem e do que deve hoje.
        Valor aproximado está de bom tamanho; tudo é corrigível depois, com rastro.
      </div>

      {dinheiroMisturado && (
        <div className="text-xs rounded-md px-3 py-2 mb-5" style={{ background: "var(--accent-soft)", color: "var(--ink)", lineHeight: 1.6 }}>
          <strong>Ele usa o mesmo dinheiro para tudo.</strong> Informe o total mesmo — o sistema trata como
          capital do negócio, e a partir daí cada gasto pessoal aparece como retirada.
          Não peça para ele adivinhar quanto é "do negócio": esse número seria invenção, e o
          jeito certo é justamente o que revela, no fim do mês, quanto ele tirou de verdade.
        </div>
      )}

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

      {/* Os campos que só este tipo de negócio tem */}
      {especificos.map((campo) => (
        <div className="mb-6" key={campo.chave}>
          <Label>{campo.rotulo}</Label>
          <Input money placeholder="0,00" value={abertura.especificos?.[campo.chave] ?? ""}
            onChange={(e) => setAbertura({ ...abertura, especificos: { ...(abertura.especificos || {}), [campo.chave]: e.target.value } })} />
          <PorQueImporta texto={campo.porque} />
        </div>
      ))}

      <ListaItens titulo="Quem te deve, quanto, e para quando" comVencimento
        porque={porBloco3(3)} itens={abertura.aReceber}
        onChange={(v) => setAbertura({ ...abertura, aReceber: v })} />

      <ListaDividas itens={abertura.dividas} onChange={(v) => setAbertura({ ...abertura, dividas: v })} />
    </div>
  );
}

export function ClienteNovo({ negocio, onConcluido, onVoltarSemSalvar }) {
  const [perguntas, setPerguntas] = useState([]);
  const [bloco, setBloco] = useState(1);
  const [respostas, setRespostas] = useState({});
  const [abertura, setAbertura] = useState({ caixa: "", banco: "", equipamentos: [], especificos: {}, aReceber: [], dividas: [] });
  const [contasFixas, setContasFixas] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  /* Contas de despesa disponíveis para os itens de "conta fixa" —
     base + o que o arquétipo acrescenta (ex.: taxa de plataforma do
     digital), mesmo plano que vai virar o plano de contas de verdade. */
  const opcoesDespesa = planoDeFabrica(negocio.arquetipo)
    .filter((c) => c.tipo === "despesa")
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
    .map((c) => ({ value: c.id, label: `${c.codigo} — ${c.nome}` }));

  /* BUG achado em teste de ponta a ponta (15/ago): esta tela nunca
     carregava `roteiro_respostas` já existentes — só as perguntas. Para
     um cadastro novo do zero não fazia diferença nenhuma, mas quebra em
     silêncio justamente o caminho que o Formulário Público existe para
     servir: o cliente responde sozinho pelo link (docs/DECISOES.md E4),
     as respostas ficam gravadas no banco, e quando o contador abre o
     Roteiro do Cliente Novo para completar os Blocos 3 e 6, a tela
     aparecia como se nada tivesse sido respondido — inclusive as
     perguntas `retrato.*`. Como o retrato de entrada em `concluir()` lê
     de `respostas` (o estado em memória, não o banco), o resultado seria
     um retrato de entrada **vazio, write-once, sem conserto depois** —
     justamente para o cliente que usou o caminho que mais precisa dele
     (docs/09 P6: "medir o antes, ou não haverá depois"). */
  useEffect(() => {
    let vivo = true;
    Promise.all([
      supabase.from("roteiro_perguntas").select("*").eq("ativo", true).order("bloco").order("ordem"),
      supabase.from("roteiro_respostas").select("pergunta_id, resposta").eq("negocio_id", negocio.id),
    ]).then(([{ data: perguntasData, error: e1 }, { data: respostasData, error: e2 }]) => {
      if (!vivo) return;
      if (!e1) setPerguntas(perguntasData || []);
      if (!e2 && respostasData?.length) {
        const existentes = {};
        for (const r of respostasData) existentes[r.pergunta_id] = r.resposta;
        setRespostas((prev) => ({ ...existentes, ...prev }));
      }
    });
    return () => { vivo = false; };
  }, [negocio.id]);

  /* O roteiro é ADAPTATIVO: filtra por tipo (MEI/informal) e arquétipo,
     e na primeira passada mostra só o essencial — o resto vira
     aprofundamento para os meses seguintes (docs/10). O filtro vive em
     dominio/roteiro.mjs porque o formulário público usa exatamente o
     mesmo; se cada tela filtrasse por conta, um dia divergiriam. */
  const doBloco = (n) => perguntasPara(perguntas, {
    tipo: negocio.tipo,
    arquetipo: negocio.arquetipo,
    apenasEssenciais: true,
    blocos: [n],
  }).filter((p) => p.destino !== "negocios.tipo");

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

    /* Os campos que só este arquétipo tem — mercadoria com terceiro,
       saldo em plataforma, material de obra, estoque de insumo… Cada um
       já traz a conta e o lado (D/C) na definição do arquétipo. */
    for (const campo of camposAberturaDe(negocio.arquetipo)) {
      const v = numeroOuNulo(abertura.especificos?.[campo.chave]);
      if (v) itens.push({ contaId: campo.contaId, tipo: campo.tipo, valor: v, descricao: campo.rotulo });
    }

    for (const r of abertura.aReceber) {
      const v = numeroOuNulo(r.valor);
      if (v) itens.push({ contaId: "clientes", tipo: "D", valor: v, descricao: r.descricao || null, vencimento: r.vencimento || null });
    }

    /* Dívidas: cada uma vai para a conta certa conforme a classificação,
       e a puramente pessoal fica de fora do livro de propósito
       (src/dominio/dividas.mjs). */
    itens.push(...separarDividas(abertura.dividas).itens);

    return itens;
  };

  /* As contas fixas do Bloco 4 viram RECORRENTE de verdade — mesmo
     desenho cabeçalho+linhas de `recorrentes`/`recorrente_linhas`
     (docs/06 §1), já aceito por `aplicar_lote` (0008). Item sem conta,
     sem valor ou sem descrição é ignorado: aqui é onboarding rápido,
     não formulário obrigatório — o que ficar de fora dá para cadastrar
     depois, na aba Recorrentes. */
  const montarOpsRecorrentes = () => {
    const ops = [];
    for (const item of contasFixas) {
      const valor = numeroOuNulo(item.valor);
      if (!valor || !item.contaId || !item.descricao?.trim()) continue;
      const recorrenteId = uid();
      ops.push({ acao: "gravar", tabela: "recorrentes", valores: { id: recorrenteId, descricao: item.descricao.trim(), ativa: true } });
      ops.push({ acao: "gravar", tabela: "recorrente_linhas", valores: { id: uid(), recorrente_id: recorrenteId, conta_id: item.contaId, tipo: "D", valor } });
      ops.push({ acao: "gravar", tabela: "recorrente_linhas", valores: { id: uid(), recorrente_id: recorrenteId, conta_id: item.deOnde || "banco", tipo: "C", valor } });
    }
    return ops;
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
        ...planoDeFabrica(negocio.arquetipo).map((c) => ({
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
        ...montarOpsRecorrentes(),
      ];

      const { error: erroLote } = await supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
      if (erroLote) throw new Error(`Não consegui gravar o balanço de abertura: ${erroLote.message}`);

      /* Campos estruturados do Bloco 1, direto na tabela de negócios —
         fora do aplicar_lote de propósito: `negocios` não é uma
         coleção-filha escopada por negocio_id, é o próprio negócio, e a
         RLS já garante que só o contador dele grava aqui. */
      const patchNegocio = { inicio_do_servico: hojeISO(), configuracao: { ...(negocio.configuracao || {}), onboarded: true } };

      /* A LINHA DE BASE (docs/09, P6). Congelada aqui, uma vez só: o
         que ele ACREDITAVA, ao lado do que o balanço MEDIU. Sem isto,
         daqui a seis meses não há como provar transformação nenhuma —
         e a metade "acreditava" é irrecuperável.
         O banco também recusa sobrescrita (gatilho da 0014); aqui só
         não mandamos quando já existe. */
      if (!negocio.retrato_de_entrada) {
        /* Procura por `destino`, NUNCA pelo texto da pergunta: o texto é
           editável de propósito (C8), e casar por fragmento faria a
           captura falhar em silêncio se alguém reescrevesse a pergunta —
           num campo que é write-once e portanto não teria conserto. */
        const declarado = {};
        for (const p of perguntas) {
          if (!p.destino?.startsWith("retrato.")) continue;
          const chave = p.destino.slice("retrato.".length);
          declarado[chave] = respostas[p.id];
        }

        patchNegocio.retrato_de_entrada = montarRetratoDeEntrada({
          negocio,
          hoje: hojeISO(),
          contas: planoDeFabrica(negocio.arquetipo),
          linhasAbertura: linhas,
          declarado,
        });
      }
      Object.assign(patchNegocio, respostasParaNegocio(perguntas, respostas));
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

  /* Vem da resposta AO VIVO do Bloco 2, não do `negocio` carregado antes
     do roteiro começar — senão o aviso do Bloco 3 nunca apareceria na
     mesma sessão em que a pergunta acabou de ser respondida (o mesmo
     bug corrigido em `concluir()` acima, agora no lado da leitura). Sem
     resposta ainda, cai no que já estava gravado (reabrir um roteiro
     incompleto de um negócio já marcado). */
  const respostaMisturado = respostaPorDestino(perguntas, respostas, "negocios.dinheiro_misturado");
  const dinheiroMisturado = respostaMisturado != null ? respostaMisturado === "sim" : !!negocio.dinheiro_misturado;

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

        {bloco === 1 && <MandarParaOCliente negocioId={negocio.id} whatsapp={negocio.whatsapp} />}

        <Card className="mb-6">
          {bloco === 3 ? (
            <BlocoAbertura abertura={abertura} setAbertura={setAbertura} perguntas={perguntas}
              arquetipo={negocio.arquetipo} dinheiroMisturado={dinheiroMisturado} />
          ) : bloco === 4 ? (
            <>
              {doBloco(4).map((p) => (
                <CampoRoteiro key={p.id} pergunta={p} valor={respostas[p.id]}
                  onChange={(v) => setRespostas({ ...respostas, [p.id]: v })} />
              ))}
              <BlocoContasFixas itens={contasFixas} onChange={setContasFixas} opcoesDespesa={opcoesDespesa} />
            </>
          ) : (
            doBloco(bloco).map((p) => (
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
