import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../dados/supabase.mjs";
import { carregarEstadoNegocio } from "../dados/estadoNegocio.mjs";
import { calcularDiferenca, fotografar } from "../dados/sinc.mjs";
import { Tabs, Confirmacao } from "../ui/primitivas.jsx";
import { Diario } from "./Diario.jsx";
import { Razao } from "./Razao.jsx";
import { Balancete } from "./Balancete.jsx";
import { Lancar } from "./Lancar.jsx";
import { CaixaEntrada } from "./CaixaEntrada.jsx";
import { Conciliacao } from "./Conciliacao.jsx";
import { Revisao } from "./Revisao.jsx";
import { RetratoDoMes } from "./RetratoDoMes.jsx";
import { PlanoContas } from "./PlanoContas.jsx";
import { ConfigNegocio } from "./ConfigNegocio.jsx";
import { Recorrentes } from "./Recorrentes.jsx";
import { Baixas } from "./Baixas.jsx";
import { Roteiro } from "./Roteiro.jsx";
import { Memoria } from "./Memoria.jsx";
import { construirLancamentoDeClassificacao, construirMovimentoPessoal } from "../dominio/classificacao.mjs";
import { gerarLancamentosDoMes } from "../dominio/recorrentes.mjs";
import { construirBaixa } from "../dominio/baixas.mjs";
import { pendentesDeAprofundamento, respostaPorDestino } from "../dominio/roteiro.mjs";

const uid = () => Math.random().toString(36).slice(2, 10);
const mesDe = (dataIso) => (dataIso || "").slice(0, 7);

/* O Livro — passo 6 do docs/06_MODELO_DE_DADOS.md §13.

   O LOOP REATIVO (a peça que o Roteiro do Cliente Novo não tinha)
   ------------------------------------------------------------
   O onboarding (ClienteNovo.jsx) chama `aplicar_lote` direto no clique
   — justificável ali porque é UM formulário, uma vez só. O Livro terá
   edição contínua (lançar, e mais adiante editar/excluir), e reescrever
   cada mutação para chamar o servidor sozinha é o modo de falha que o
   ContLife decidiu evitar (docs/01 grade A, docs/06 §11): esquecer UM
   ponto de mutação faz aquela ação parar de salvar em SILÊNCIO. Por
   isso aqui é o padrão do ContLife: guarda a última foto confirmada
   pelo servidor (`fotoRef`), toda mudança em memória é comparada contra
   ela (`calcularDiferenca`), e só a DIFERENÇA vai num lote, com debounce
   para não gravar a cada tecla.

   SEM `loadedForKeyRef` (a guarda do bug H3 do ContLife, doc 26)
   ------------------------------------------------------------
   No ContLife, trocar de dossiê SEM desmontar o componente causava o
   bug: a chave mudava, mas o estado em memória ainda era do dossiê
   anterior por um instante. Aqui não existe essa classe de bug: o
   `App.jsx` monta `<Livro key={negocio.id} .../>` — trocar de negócio
   DESMONTA este componente inteiro e monta um novo, do zero. React já
   resolve o problema por construção; não precisa de guarda extra. */

/* "Caixa" vem primeiro — é onde vai 70% do tempo (docs/04 §5), não
   Lançar. O dono chega aqui, não na tela de formulário solto. */
const ABAS = [
  { id: "caixa", label: "Caixa de Entrada" },
  { id: "lancar", label: "Lançar" },
  { id: "diario", label: "Diário" },
  { id: "razao", label: "Razão" },
  { id: "balancete", label: "Balancete" },
  { id: "conciliacao", label: "Conciliação" },
  { id: "baixas", label: "A receber/pagar" },
  { id: "revisao", label: "Revisão" },
  { id: "entregas", label: "Entregas" },
  { id: "memoria", label: "Memória" },
  { id: "roteiro", label: "Roteiro" },
  { id: "plano", label: "Plano de contas" },
  { id: "recorrentes", label: "Recorrentes" },
  { id: "negocio", label: "Negócio" },
];

export function Livro({ negocio, onVoltar }) {
  const [aba, setAba] = useState("caixa");
  const [estado, setEstado] = useState(null); // null = carregando
  const [loaded, setLoaded] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // id do lançamento em edição, ou null
  const [roteiro, setRoteiro] = useState(null); // { perguntas, respostasPorPerguntaId } — fora do loop reativo, é arquivo (docs/06 §9)

  const fotoRef = useRef(null);       // estado como o SERVIDOR o conhece
  const estadoRef = useRef(null);     // último estado em memória, para o flush de saída
  const timerRef = useRef(null);      // debounce pendente

  useEffect(() => { estadoRef.current = estado; }, [estado]);

  useEffect(() => {
    let vivo = true;
    carregarEstadoNegocio(negocio.id)
      .then((estadoServidor) => {
        if (!vivo) return;
        setEstado(estadoServidor);
        fotoRef.current = fotografar(estadoServidor);
        setLoaded(true);
      })
      .catch((e) => { if (vivo) setErro(`Não consegui carregar o livro: ${e.message}`); });
    return () => { vivo = false; };
  }, [negocio.id]);

  /* O roteiro (perguntas + respostas) carrega à parte do loop reativo
     acima — não é lançamento contábil, é arquivo (docs/06 §9), e o
     aviso de pendências nas Entregas precisa dele mesmo que a aba
     Roteiro nunca seja aberta nesta sessão. */
  useEffect(() => {
    let vivo = true;
    Promise.all([
      supabase.from("roteiro_perguntas").select("*").eq("ativo", true).order("bloco").order("ordem"),
      supabase.from("roteiro_respostas").select("pergunta_id, resposta").eq("negocio_id", negocio.id),
    ]).then(([{ data: perguntas, error: e1 }, { data: respostas, error: e2 }]) => {
      if (!vivo || e1 || e2) return;
      const respostasPorPerguntaId = {};
      for (const r of respostas || []) respostasPorPerguntaId[r.pergunta_id] = r.resposta;
      setRoteiro({ perguntas: perguntas || [], respostasPorPerguntaId });
    });
    return () => { vivo = false; };
  }, [negocio.id]);

  const salvarRespostaRoteiro = useCallback(async (perguntaId, resposta) => {
    setRoteiro((prev) => prev && ({ ...prev, respostasPorPerguntaId: { ...prev.respostasPorPerguntaId, [perguntaId]: resposta } }));
    await supabase.from("roteiro_respostas").upsert(
      { negocio_id: negocio.id, pergunta_id: perguntaId, resposta: String(resposta) },
      { onConflict: "negocio_id,pergunta_id" }
    );
  }, [negocio.id]);

  useEffect(() => {
    if (!loaded || !estado) return;
    const { ops, perigo } = calcularDiferenca(fotoRef.current, fotografar(estado));
    if (!ops.length) { timerRef.current = null; return; }

    if (perigo) {
      timerRef.current = null;
      setErro(`Parei antes de salvar: a mudança apagaria ${perigo.apagados} de ${perigo.total} registros de uma vez. Nada foi alterado no servidor.`);
      return;
    }

    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      setSalvando(true);
      setErro("");
      try {
        const { error } = await supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
        if (error) throw new Error(error.message);
        fotoRef.current = fotografar(estado);
        setConfirmado(true);
        setTimeout(() => setConfirmado(false), 1800);
      } catch (e) {
        setErro(`Não consegui salvar: ${e.message}. Nada foi perdido na tela — tente de novo.`);
      } finally {
        setSalvando(false);
      }
    }, 900);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line
  }, [estado, loaded]);

  /* Descarga ao sair: se o dono clicar "Voltar" dentro da janela de
     debounce, o cleanup normal do efeito acima CANCELARIA o salvamento
     — "Voltar" não pode ser um jeito silencioso de perder um
     lançamento. Melhor esforço, sem await (o componente já saiu). */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const { ops, perigo } = calcularDiferenca(fotoRef.current, fotografar(estadoRef.current));
        if (ops.length && !perigo) {
          supabase.rpc("aplicar_lote", { p_negocio: negocio.id, p_ops: ops });
        }
      }
    };
    // eslint-disable-next-line
  }, []);

  /* Guarda central contra escrever num mês fechado — vive AQUI, não em
     cada tela que lança (Lancar, Caixa de Entrada, e qualquer entrada
     futura). Se o mês está fechado, ninguém grava, sem precisar que
     cada tela nova lembre de repetir a checagem — a mesma lógica de
     "corrigir a classe do problema" do resto da sessão. */
  const mesEstaFechado = useCallback(
    (dataIso) => estadoRef.current?.periodosFechados?.includes(`mes:${mesDe(dataIso)}`),
    []
  );

  const adicionarLancamento = useCallback(({ lancamento, linhas }) => {
    if (mesEstaFechado(lancamento.data)) {
      setErro(`O mês de ${mesDe(lancamento.data)} já está fechado — reabra na aba Revisão antes de lançar aqui.`);
      return false;
    }
    setEstado((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, lancamento],
      lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
      trilha: [...prev.trilha, { tipo: "lancar", descricao: lancamento.descricao }],
    }));
    return true;
  }, [mesEstaFechado]);

  const importarItens = useCallback((itens) => {
    setEstado((prev) => ({ ...prev, entradaItens: [...prev.entradaItens, ...itens] }));
  }, []);

  const marcarSituacao = useCallback((item, situacao) => {
    setEstado((prev) => ({
      ...prev,
      entradaItens: prev.entradaItens.map((i) => (i.id === item.id ? { ...i, situacao } : i)),
    }));
  }, []);

  /* "É pessoal" com DINHEIRO MISTURADO não pode ser "some do livro" —
     o dinheiro saiu de verdade da conta que o livro acompanha (achado de
     13/ago). Vira movimento de patrimônio: retirada quando sai, aporte
     quando entra. Com conta separada, o comportamento antigo continua
     certo: a transação é de uma conta que não está no livro. */
  const marcarPessoal = useCallback((item) => {
    if (!negocio.dinheiro_misturado) return marcarSituacao(item, "pessoal");

    if (mesEstaFechado(item.data)) {
      setErro(`O mês de ${mesDe(item.data)} já está fechado — reabra na aba Revisão antes de lançar esta retirada.`);
      return false;
    }

    const { lancamento, linhas } = construirMovimentoPessoal(item);
    setEstado((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, lancamento],
      lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
      entradaItens: prev.entradaItens.map((i) => (i.id === item.id ? { ...i, situacao: "pessoal", lancamentoId: lancamento.id } : i)),
      trilha: [...prev.trilha, { tipo: item.valor > 0 ? "aporte" : "retirada", descricao: item.descricaoBruta }],
    }));
    return true;
  }, [negocio.dinheiro_misturado, marcarSituacao, mesEstaFechado]);

  /* Classificar faz TRÊS coisas de uma vez, no mesmo setEstado — o
     lançamento (2 linhas), o item marcado como resolvido, e a regra
     ensinada (ou reforçada, se já existia). As três entram juntas na
     próxima comparação do loop reativo, então viram UM lote atômico. */
  const classificarItem = useCallback(({ item, contaCategoriaId, padrao }) => {
    if (mesEstaFechado(item.data)) {
      setErro(`O mês de ${mesDe(item.data)} já está fechado — reabra na aba Revisão antes de classificar este item.`);
      return false;
    }
    setEstado((prev) => {
      const { lancamento, linhas } = construirLancamentoDeClassificacao(item, contaCategoriaId);

      const regraExistente = prev.regrasClassificacao.find(
        (r) => (r.padrao || "").toUpperCase() === padrao.toUpperCase() && r.contaId === contaCategoriaId
      );
      const regrasClassificacao = regraExistente
        ? prev.regrasClassificacao.map((r) => (r === regraExistente ? { ...r, acertos: (r.acertos || 1) + 1 } : r))
        : [...prev.regrasClassificacao, { id: uid(), padrao, contaId: contaCategoriaId, acertos: 1 }];

      return {
        ...prev,
        lancamentos: [...prev.lancamentos, lancamento],
        lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
        entradaItens: prev.entradaItens.map((i) => (i.id === item.id ? { ...i, situacao: "classificado", lancamentoId: lancamento.id } : i)),
        regrasClassificacao,
        trilha: [...prev.trilha, { tipo: "classificar", descricao: `${item.descricaoBruta} → ${contaCategoriaId}` }],
      };
    });
    return true;
  }, [mesEstaFechado]);

  const alternarConciliacao = useCallback((lancamentoId, marcar) => {
    setEstado((prev) => ({
      ...prev,
      conciliacoes: marcar ? [...prev.conciliacoes, lancamentoId] : prev.conciliacoes.filter((id) => id !== lancamentoId),
    }));
  }, []);

  const fecharMes = useCallback((mes) => {
    setEstado((prev) => ({
      ...prev,
      periodosFechados: [...prev.periodosFechados, `mes:${mes}`],
      trilha: [...prev.trilha, { tipo: "fechar_mes", descricao: `Mês ${mes} fechado` }],
    }));
  }, []);

  const reabrirMes = useCallback((mes) => {
    setEstado((prev) => ({
      ...prev,
      periodosFechados: prev.periodosFechados.filter((p) => p !== `mes:${mes}`),
      trilha: [...prev.trilha, { tipo: "reabrir_mes", descricao: `Mês ${mes} reaberto` }],
    }));
  }, []);

  const iniciarEdicao = useCallback((lancamentoId) => {
    setEditandoId(lancamentoId);
    setAba("lancar");
  }, []);
  const cancelarEdicao = useCallback(() => setEditandoId(null), []);

  const adicionarConta = useCallback((conta) => {
    setEstado((prev) => ({
      ...prev,
      contas: [...prev.contas, conta],
      trilha: [...prev.trilha, { tipo: "conta_nova", descricao: `${conta.codigo} — ${conta.nome}` }],
    }));
  }, []);

  const alternarAtivaConta = useCallback((contaId, ativa) => {
    setEstado((prev) => ({
      ...prev,
      contas: prev.contas.map((c) => (c.id === contaId ? { ...c, ativa } : c)),
    }));
  }, []);

  const adicionarRecorrente = useCallback(({ recorrente, linhas }) => {
    setEstado((prev) => ({
      ...prev,
      recorrentes: [...prev.recorrentes, recorrente],
      recorrenteLinhas: [...prev.recorrenteLinhas, ...linhas],
      trilha: [...prev.trilha, { tipo: "recorrente_novo", descricao: recorrente.descricao }],
    }));
  }, []);

  const alternarAtivaRecorrente = useCallback((recorrenteId, ativa) => {
    setEstado((prev) => ({
      ...prev,
      recorrentes: prev.recorrentes.map((r) => (r.id === recorrenteId ? { ...r, ativa } : r)),
    }));
  }, []);

  /* Gera os lançamentos do mês CORRENTE (não o mês que a tela está
     olhando — recorrentes são sobre "o que vence agora", docs/05 §7).
     `gerarLancamentosDoMes` (dominio puro) já filtra as inativas e as
     que já foram geradas este mês; aqui só aplica ao estado, dentro do
     mesmo loop reativo de tudo o mais. */
  /* Carta de recomendações — texto livre por mês, fora da trava de mês
     fechado de propósito (docs/04 §9: escreve DEPOIS de fechar, na
     etapa de Entregas, não é um fato contábil). */
  const salvarCarta = useCallback((mes, texto) => {
    setEstado((prev) => {
      const existe = prev.cartas.some((c) => c.mes === mes);
      return {
        ...prev,
        cartas: existe
          ? prev.cartas.map((c) => (c.mes === mes ? { ...c, texto } : c))
          : [...prev.cartas, { mes, texto, seguida: null }],
        trilha: [...prev.trilha, { tipo: "carta", descricao: `Carta de ${mes}` }],
      };
    });
  }, []);

  const avaliarCartaSeguida = useCallback((mes, seguida) => {
    setEstado((prev) => ({
      ...prev,
      cartas: prev.cartas.map((c) => (c.mes === mes ? { ...c, seguida } : c)),
      trilha: [...prev.trilha, { tipo: "carta_avaliada", descricao: `Carta de ${mes}: ${seguida ? "seguida" : "não seguida"}` }],
    }));
  }, []);

  /* O que foi EVITADO, não recomendado para o futuro (F7). Fato datado,
     não parágrafo — por isso lista, mesmo desenho de recorrentes, e
     não um campo a mais na Carta. */
  const adicionarEvitado = useCallback((mes, descricao, valorEstimado) => {
    setEstado((prev) => ({
      ...prev,
      evitados: [...prev.evitados, { id: uid(), mes, descricao, valorEstimado: valorEstimado || null }],
      trilha: [...prev.trilha, { tipo: "evitado", descricao }],
    }));
  }, []);

  /* Baixa: liga um recebimento/pagamento à fatura específica (docs/08
     §2). É um lançamento de verdade, então respeita a mesma trava de
     mês fechado dos demais. */
  const darBaixa = useCallback((linhaOriginal, contaTransitoId, data) => {
    if (mesEstaFechado(data)) {
      setErro(`O mês de ${mesDe(data)} já está fechado — reabra na aba Revisão antes de dar baixa.`);
      return false;
    }
    const { lancamento, linhas } = construirBaixa(linhaOriginal, contaTransitoId, data);
    setEstado((prev) => ({
      ...prev,
      lancamentos: [...prev.lancamentos, lancamento],
      lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
      trilha: [...prev.trilha, { tipo: "baixa", descricao: lancamento.descricao }],
    }));
    return true;
  }, [mesEstaFechado]);

  const gerarRecorrentesDoMes = useCallback(() => {
    const mes = new Date().toISOString().slice(0, 7);
    const dataDoMes = `${mes}-01`;
    if (mesEstaFechado(dataDoMes)) {
      setErro(`O mês de ${mes} já está fechado — reabra na aba Revisão antes de gerar recorrentes.`);
      return { gerados: 0 };
    }
    const { lancamentos, linhas } = gerarLancamentosDoMes(
      estadoRef.current.recorrentes, estadoRef.current.recorrenteLinhas, estadoRef.current.lancamentos, mes, dataDoMes
    );
    if (lancamentos.length) {
      setEstado((prev) => ({
        ...prev,
        lancamentos: [...prev.lancamentos, ...lancamentos],
        lancamentoLinhas: [...prev.lancamentoLinhas, ...linhas],
        trilha: [...prev.trilha, { tipo: "gerar_recorrentes", descricao: `${lancamentos.length} lançamento(s) de ${mes}` }],
      }));
    }
    return { gerados: lancamentos.length };
  }, [mesEstaFechado]);

  /* Editar substitui o cabeçalho e TROCA as linhas inteiras — não tenta
     casar linha por linha (o dono pode ter mudado quantas são). O motor
     de sincronização calcula sozinho o que precisa apagar e o que
     precisa gravar comparando o estado antes/depois; não é preciso
     montar essa diferença na mão aqui (docs/06 §11). */
  const editarLancamento = useCallback(({ lancamentoId, lancamento, linhas }) => {
    const original = estadoRef.current?.lancamentos.find((l) => l.id === lancamentoId);
    if (mesEstaFechado(original?.data) || mesEstaFechado(lancamento.data)) {
      setErro(`O mês está fechado — reabra na aba Revisão antes de editar.`);
      return false;
    }
    setEstado((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.map((l) => (l.id === lancamentoId ? lancamento : l)),
      lancamentoLinhas: [...prev.lancamentoLinhas.filter((l) => l.lancamentoId !== lancamentoId), ...linhas],
      trilha: [...prev.trilha, { tipo: "editar", descricao: lancamento.descricao }],
    }));
    return true;
  }, [mesEstaFechado]);

  /* Excluir vai para a lixeira, nunca desaparece de vez (docs/06 §10).
     Se o lançamento veio da Caixa de Entrada, o item de origem volta
     pra fila de classificação — senão ficaria "classificado" apontando
     pra um lançamento que não existe mais (a FK entre entrada_itens e
     lancamentos, docs/06 §7, exige isso). */
  const excluirLancamento = useCallback((lancamentoId) => {
    const lancamento = estadoRef.current?.lancamentos.find((l) => l.id === lancamentoId);
    if (!lancamento) return;
    if (mesEstaFechado(lancamento.data)) {
      setErro(`O mês de ${mesDe(lancamento.data)} já está fechado — reabra na aba Revisão antes de excluir.`);
      return;
    }
    const linhas = estadoRef.current.lancamentoLinhas.filter((l) => l.lancamentoId === lancamentoId);
    setEstado((prev) => ({
      ...prev,
      lancamentos: prev.lancamentos.filter((l) => l.id !== lancamentoId),
      lancamentoLinhas: prev.lancamentoLinhas.filter((l) => l.lancamentoId !== lancamentoId),
      entradaItens: prev.entradaItens.map((i) => (i.lancamentoId === lancamentoId ? { ...i, situacao: "pendente", lancamentoId: null } : i)),
      lixeira: [...prev.lixeira, { lancamentoId, conteudo: { lancamento, linhas }, excluidoEm: new Date().toISOString() }],
      trilha: [...prev.trilha, { tipo: "excluir", descricao: lancamento.descricao }],
    }));
  }, [mesEstaFechado]);

  const editando = editandoId && estado
    ? { lancamento: estado.lancamentos.find((l) => l.id === editandoId), linhas: estado.lancamentoLinhas.filter((l) => l.lancamentoId === editandoId) }
    : null;

  if (!loaded || !estado) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--paper)" }}>
        <div className="text-sm" style={{ color: "var(--muted)" }}>{erro || "Carregando o livro…"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="max-w-4xl mx-auto px-5 py-8">
        <button onClick={onVoltar} className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={14} /> Voltar
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
            {negocio.apelido || negocio.nome}
          </div>
          <Confirmacao texto={salvando ? "Salvando…" : "Salvo."} ativa={salvando || confirmado} />
        </div>

        {erro && <div className="text-xs rounded-md px-3 py-2 mb-4" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}

        <Tabs tabs={ABAS} active={aba} onChange={setAba} />

        {aba === "caixa" && (
          <CaixaEntrada
            contas={estado.contas}
            entradaItens={estado.entradaItens}
            regrasClassificacao={estado.regrasClassificacao}
            onImportar={importarItens}
            onClassificar={classificarItem}
            onPessoal={marcarPessoal}
            onDuvida={(item) => marcarSituacao(item, "duvida")}
            dinheiroMisturado={negocio.dinheiro_misturado}
          />
        )}
        {aba === "lancar" && (
          <Lancar
            contas={estado.contas}
            onAdicionar={adicionarLancamento}
            editando={editando}
            onEditar={editarLancamento}
            onCancelarEdicao={cancelarEdicao}
          />
        )}
        {aba === "diario" && (
          <Diario
            contas={estado.contas}
            lancamentos={estado.lancamentos}
            lancamentoLinhas={estado.lancamentoLinhas}
            onEditar={iniciarEdicao}
            onExcluir={excluirLancamento}
          />
        )}
        {aba === "razao" && <Razao contas={estado.contas} lancamentos={estado.lancamentos} lancamentoLinhas={estado.lancamentoLinhas} />}
        {aba === "balancete" && <Balancete contas={estado.contas} lancamentoLinhas={estado.lancamentoLinhas} />}
        {aba === "conciliacao" && (
          <Conciliacao
            lancamentos={estado.lancamentos}
            lancamentoLinhas={estado.lancamentoLinhas}
            conciliacoes={estado.conciliacoes}
            onAlternar={alternarConciliacao}
          />
        )}
        {aba === "baixas" && (
          <Baixas contas={estado.contas} lancamentoLinhas={estado.lancamentoLinhas} onDarBaixa={darBaixa} />
        )}
        {aba === "revisao" && (
          <Revisao
            negocio={negocio}
            contas={estado.contas}
            lancamentos={estado.lancamentos}
            lancamentoLinhas={estado.lancamentoLinhas}
            periodosFechados={estado.periodosFechados}
            trilha={estado.trilha}
            onFechar={fecharMes}
            onReabrir={reabrirMes}
          />
        )}
        {aba === "entregas" && (
          <RetratoDoMes
            negocio={negocio}
            contas={estado.contas}
            lancamentos={estado.lancamentos}
            lancamentoLinhas={estado.lancamentoLinhas}
            periodosFechados={estado.periodosFechados}
            cartas={estado.cartas}
            recorrentes={estado.recorrentes}
            recorrenteLinhas={estado.recorrenteLinhas}
            evitados={estado.evitados}
            onSalvarCarta={salvarCarta}
            onAvaliarCartaSeguida={avaliarCartaSeguida}
            onAdicionarEvitado={adicionarEvitado}
            metaDoCliente={roteiro ? respostaPorDestino(roteiro.perguntas, roteiro.respostasPorPerguntaId, "carta.meta") : null}
            pendentesDeAprofundamento={roteiro
              ? pendentesDeAprofundamento(roteiro.perguntas, roteiro.respostasPorPerguntaId, { tipo: negocio.tipo, arquetipo: negocio.arquetipo }).length
              : 0}
            onAbrirRoteiro={() => setAba("roteiro")}
          />
        )}
        {aba === "memoria" && (
          <Memoria
            negocio={negocio}
            contas={estado.contas}
            lancamentos={estado.lancamentos}
            lancamentoLinhas={estado.lancamentoLinhas}
            periodosFechados={estado.periodosFechados}
            cartas={estado.cartas}
            evitados={estado.evitados}
          />
        )}
        {aba === "roteiro" && (
          roteiro
            ? <Roteiro negocio={negocio} perguntas={roteiro.perguntas} respostasPorPerguntaId={roteiro.respostasPorPerguntaId} onSalvarResposta={salvarRespostaRoteiro} />
            : <div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>
        )}
        {aba === "plano" && (
          <PlanoContas contas={estado.contas} onAdicionar={adicionarConta} onAlternarAtiva={alternarAtivaConta} />
        )}
        {aba === "recorrentes" && (
          <Recorrentes
            contas={estado.contas}
            recorrentes={estado.recorrentes}
            recorrenteLinhas={estado.recorrenteLinhas}
            onAdicionar={adicionarRecorrente}
            onAlternarAtiva={alternarAtivaRecorrente}
            onGerar={gerarRecorrentesDoMes}
          />
        )}
        {aba === "negocio" && <ConfigNegocio negocioId={negocio.id} />}
      </div>
    </div>
  );
}
