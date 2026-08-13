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
import { construirLancamentoDeClassificacao } from "../dominio/classificacao.mjs";

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
  { id: "revisao", label: "Revisão" },
];

export function Livro({ negocio, onVoltar }) {
  const [aba, setAba] = useState("caixa");
  const [estado, setEstado] = useState(null); // null = carregando
  const [loaded, setLoaded] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

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
            onPessoal={(item) => marcarSituacao(item, "pessoal")}
            onDuvida={(item) => marcarSituacao(item, "duvida")}
          />
        )}
        {aba === "lancar" && <Lancar contas={estado.contas} onAdicionar={adicionarLancamento} />}
        {aba === "diario" && <Diario contas={estado.contas} lancamentos={estado.lancamentos} lancamentoLinhas={estado.lancamentoLinhas} />}
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
        {aba === "revisao" && (
          <Revisao
            contas={estado.contas}
            lancamentos={estado.lancamentos}
            lancamentoLinhas={estado.lancamentoLinhas}
            periodosFechados={estado.periodosFechados}
            trilha={estado.trilha}
            onFechar={fecharMes}
            onReabrir={reabrirMes}
          />
        )}
      </div>
    </div>
  );
}
