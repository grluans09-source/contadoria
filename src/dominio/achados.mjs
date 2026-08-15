/* ============================================================
   ACHADOS — docs/04_MAPA_DO_APP.md §7: "o sistema aponta o que
   destoa: despesa muito fora do padrão do cliente, mês sem nenhum
   movimento, receita registrada sem dinheiro entrando em lugar
   nenhum".

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   Mesma disciplina da Mesa de Revisão (docs/dominio/revisao.mjs):
   recalcula da fonte (lancamentoLinhas), nunca de um resumo pronto.

   POR QUE NÃO TEM A GRANULARIDADE DO MOCKUP
   ------------------------------------------------------------
   "despesa muito fora do padrão" só existe se houver PADRÃO — meses
   FECHADOS pra comparar (docs/SESSION_STATE já registrava isto como
   adiado por falta de histórico). Sem nenhum mês fechado, esta função
   devolve lista vazia — silêncio aqui é a resposta certa, não bug.

   FASE 7 (14/ago) — OS QUATRO QUE REVELAM A DOR INVISÍVEL
   ------------------------------------------------------------
   `retiradaAcimaDoResultado` roda para QUALQUER negócio, desde o dia 1
   (F0, docs/DECISOES.md): é o achado mais forte do sistema, e não
   precisa de mês fechado nem de histórico. Os outros três só rodam se
   o ARQUÉTIPO do negócio os declarar (`achadosDe`, arquetipos.mjs) —
   "achado errado porque não se aplica a este negócio" é pior que
   silêncio (P3, docs/09).
   ============================================================ */
import { achadosDe } from "./arquetipos.mjs";
import { resultadoDoMes } from "./razao.mjs";

/* Contas que representam dinheiro entrando ou a receber — o modelo de
   fábrica (docs/06 §7). Lista fechada de propósito: um plano de contas
   editado pelo dono (PlanoContas.jsx) pode criar conta de dinheiro com
   outro id, e esta função não tem como adivinhar isso — prefere
   simplicidade honesta a uma heurística frágil tentando generalizar. */
const CONTAS_DINHEIRO_OU_A_RECEBER = new Set(["caixa", "banco", "maquininha_receber", "clientes"]);

function mesSeguinte(mes) {
  const [ano, m] = mes.split("-").map(Number);
  return m === 12 ? `${ano + 1}-01` : `${ano}-${String(m + 1).padStart(2, "0")}`;
}

/** Meses SEM nenhum lançamento, dentro do intervalo entre o primeiro e
 *  o último mês que já teve movimento (gaps no meio da história — não
 *  o mês corrente ainda em aberto, que a prateleira já cobre). */
export function mesesSemMovimento(lancamentos) {
  const meses = [...new Set((lancamentos || []).map((l) => (l.data || "").slice(0, 7)).filter(Boolean))].sort();
  if (meses.length < 2) return [];
  const presentes = new Set(meses);
  const faltando = [];
  let atual = meses[0];
  const ultimo = meses[meses.length - 1];
  while (atual < ultimo) {
    atual = mesSeguinte(atual);
    if (atual < ultimo && !presentes.has(atual)) faltando.push(atual);
  }
  return faltando;
}

/** Saldo de UMA conta em UM mês, somando direto das linhas — mesma
 *  disciplina "nunca de um resumo pronto" da Mesa de Revisão. */
function saldoDaContaNoMes(contaId, mes, lancamentos, lancamentoLinhas) {
  const idsDoMes = new Set(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => l.id));
  let saldo = 0;
  for (const linha of lancamentoLinhas) {
    if (linha.contaId !== contaId || !idsDoMes.has(linha.lancamentoId)) continue;
    saldo += linha.tipo === "D" ? linha.valor : -linha.valor; /* despesa: normal no débito */
  }
  return saldo;
}

/**
 * Despesas do(s) mês(es) ABERTO(S) muito acima da média dos mesmos
 * meses FECHADOS — só roda se existir pelo menos 1 mês fechado (docs/04
 * §7: "muito fora do padrão do CLIENTE", não um número arbitrário
 * inventado sem histórico).
 */
export function despesasForaDoPadrao(contas, lancamentos, lancamentoLinhas, periodosFechados, multiplicador = 2) {
  const mesesFechados = (periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4));
  if (!mesesFechados.length) return [];

  const todosMeses = [...new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean))];
  const mesesAbertos = todosMeses.filter((m) => !mesesFechados.includes(m));
  if (!mesesAbertos.length) return [];

  const despesas = contas.filter((c) => c.tipo === "despesa");
  const achados = [];
  for (const conta of despesas) {
    const historico = mesesFechados.map((m) => saldoDaContaNoMes(conta.id, m, lancamentos, lancamentoLinhas));
    const comMovimento = historico.filter((v) => v > 0);
    if (!comMovimento.length) continue; /* sem histórico de gasto nessa conta, sem padrão pra comparar */
    const media = comMovimento.reduce((s, v) => s + v, 0) / comMovimento.length;

    for (const mes of mesesAbertos) {
      const atual = saldoDaContaNoMes(conta.id, mes, lancamentos, lancamentoLinhas);
      if (atual > media * multiplicador) {
        achados.push({ tipo: "despesa_fora_padrao", contaId: conta.id, contaNome: conta.nome, mes, valor: atual, media });
      }
    }
  }
  return achados;
}

/** Lançamento com linha de receita cuja contrapartida não toca
 *  dinheiro/a-receber nenhum — receita "solta", sem explicação de pra
 *  onde foi o valor (docs/04 §7). */
export function receitasSemDinheiro(contas, lancamentos, lancamentoLinhas) {
  const contasPorId = new Map(contas.map((c) => [c.id, c]));
  const linhasPorLancamento = new Map();
  for (const l of lancamentoLinhas) {
    if (!linhasPorLancamento.has(l.lancamentoId)) linhasPorLancamento.set(l.lancamentoId, []);
    linhasPorLancamento.get(l.lancamentoId).push(l);
  }

  const achados = [];
  for (const lanc of lancamentos) {
    const linhas = linhasPorLancamento.get(lanc.id) || [];
    const temReceita = linhas.some((l) => contasPorId.get(l.contaId)?.tipo === "receita");
    if (!temReceita) continue;
    const temDinheiro = linhas.some((l) => CONTAS_DINHEIRO_OU_A_RECEBER.has(l.contaId));
    if (!temDinheiro) {
      achados.push({ tipo: "receita_sem_dinheiro", lancamentoId: lanc.id, descricao: lanc.descricao, data: lanc.data });
    }
  }
  return achados;
}

/** Saldo "vivo" de uma conta ao longo do tempo, na ordem dos
 *  lançamentos — usado para achar DESDE QUANDO um valor está parado
 *  sem interrupção (ex.: mercadoria com terceiro). "desde" é a última
 *  vez que o saldo saiu de zero/negativo para positivo e nunca mais
 *  voltou — não a data do lançamento mais antigo, que pode já ter
 *  sido zerado no meio (a mercadoria voltou e saiu outra vez). */
function saldoContinuoDesde(contaId, lancamentos, lancamentoLinhas) {
  const porLancamento = new Map(lancamentos.map((l) => [l.id, l]));
  const linhas = lancamentoLinhas
    .filter((l) => l.contaId === contaId)
    .map((l) => ({ ...l, data: porLancamento.get(l.lancamentoId)?.data }))
    .filter((l) => l.data)
    .sort((a, b) => a.data.localeCompare(b.data));

  let saldo = 0;
  let desde = null;
  for (const l of linhas) {
    const antes = saldo;
    saldo += l.tipo === "D" ? l.valor : -l.valor;
    if (antes <= 0 && saldo > 0) desde = l.data;
    if (saldo <= 0) desde = null;
  }
  return { saldo: Math.round(saldo * 100) / 100, desde };
}

const UM_DIA_MS = 24 * 60 * 60 * 1000;
function diasEntre(dataIso, hoje) {
  return Math.round((new Date(hoje) - new Date(dataIso)) / UM_DIA_MS);
}

/**
 * Retirada do titular no mês (aberto) acima do que o negócio gerou —
 * o achado mais forte do sistema (F0, docs/DECISOES.md): "você tirou
 * R$ 4.100 e o negócio gerou R$ 2.800". Roda para QUALQUER arquétipo,
 * desde o dia 1 — não depende de mês fechado nem de histórico.
 * Mês já fechado não entra aqui: já foi olhado na hora de fechar.
 */
export function retiradaAcimaDoResultado(contas, lancamentos, lancamentoLinhas, periodosFechados, hoje) {
  const mesesFechados = new Set((periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4)));
  const mes = (hoje || "").slice(0, 7);
  if (mesesFechados.has(mes)) return [];

  const retirada = saldoDaContaNoMes("retiradas_titular", mes, lancamentos, lancamentoLinhas);
  if (retirada <= 0) return [];

  const { resultado } = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes);
  if (retirada <= resultado) return [];

  return [{ tipo: "retirada_acima_do_resultado", mes, retirada, resultado, diferenca: Math.round((retirada - resultado) * 100) / 100 }];
}

/**
 * Valor parado na mão de terceiro (beneficiamento) — "é seu, mas não
 * está com você" (arquetipos.mjs). Só dispara com sinal real: saldo
 * positivo e contínuo por pelo menos `diasMinimo` dias.
 */
export function mercadoriaParadaComTerceiro(contas, lancamentos, lancamentoLinhas, hoje, diasMinimo = 15) {
  if (!contas.some((c) => c.id === "mercadoria_com_terceiros")) return [];
  const { saldo, desde } = saldoContinuoDesde("mercadoria_com_terceiros", lancamentos, lancamentoLinhas);
  if (saldo <= 0 || !desde) return [];
  const dias = diasEntre(desde, hoje);
  if (dias < diasMinimo) return [];
  return [{ tipo: "mercadoria_parada_com_terceiro", valor: saldo, desde, dias }];
}

/**
 * Taxa (maquininha ou plataforma) comendo uma fatia grande da receita
 * do mês — "a despesa que mais come margem em silêncio" (revenda,
 * produção) ou "que já vem descontada, ele nunca a vê sair" (digital).
 * `contaTaxaId` vem de quem chama porque depende do arquétipo.
 */
export function taxaEngolindoMargem(contas, lancamentos, lancamentoLinhas, mes, contaTaxaId, percentualLimite = 0.08) {
  if (!contaTaxaId || !contas.some((c) => c.id === contaTaxaId)) return [];
  const taxa = saldoDaContaNoMes(contaTaxaId, mes, lancamentos, lancamentoLinhas);
  if (taxa <= 0) return [];
  const { receita } = resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes);
  if (receita <= 0) return [];
  const percentual = taxa / receita;
  if (percentual < percentualLimite) return [];
  return [{ tipo: "taxa_engolindo_margem", mes, contaId: contaTaxaId, valor: taxa, receita, percentual: Math.round(percentual * 1000) / 10 }];
}

/**
 * Dias do mês corrente, até hoje, sem nenhuma receita lançada — "dia
 * parado é custo fixo correndo sem receita" (servico_mao_obra). Só
 * dispara com sinal real: o mês já tem alguma receita (não é só "o
 * mês não começou ainda") e uma fração alta dos dias já passados
 * ficou sem nada.
 */
export function semReceitaNoPeriodo(contas, lancamentos, lancamentoLinhas, hoje, fracaoMinima = 0.4) {
  const mes = (hoje || "").slice(0, 7);
  const diaHoje = Number((hoje || "").slice(8, 10));
  if (!diaHoje) return [];

  const contasReceita = new Set(contas.filter((c) => c.tipo === "receita").map((c) => c.id));
  const porLancamento = new Map(lancamentos.filter((l) => (l.data || "").slice(0, 7) === mes).map((l) => [l.id, l]));
  const diasComReceita = new Set();
  for (const linha of lancamentoLinhas) {
    const lanc = porLancamento.get(linha.lancamentoId);
    if (!lanc || !contasReceita.has(linha.contaId)) continue;
    diasComReceita.add(Number(lanc.data.slice(8, 10)));
  }
  if (!diasComReceita.size) return [];

  const diasSemReceita = diaHoje - diasComReceita.size;
  const fracao = diasSemReceita / diaHoje;
  if (fracao < fracaoMinima) return [];
  return [{ tipo: "sem_receita_no_periodo", mes, diasSemReceita, diaHoje, fracaoPercentual: Math.round(fracao * 100) }];
}

/* Qual conta de taxa cada arquétipo tem — vive aqui, não em
   arquetipos.mjs, porque é detalhe de COMO calcular o achado, não do
   que o negócio É (arquetipos.mjs descreve só QUE achados se aplicam). */
const CONTA_TAXA_POR_ARQUETIPO = { revenda: "taxa_maquininha", producao: "taxa_maquininha", digital: "taxa_plataforma" };

/** Junta todas as checagens numa lista só, pronta pra tela.
 *  `opcoes.arquetipo` decide quais dos achados de Fase 7 rodam
 *  (docs/DECISOES.md: "cada um só roda se o arquétipo o declarar"). */
export function encontrarAchados(contas, lancamentos, lancamentoLinhas, periodosFechados, opcoes = {}) {
  const { arquetipo = null, hoje = new Date().toISOString().slice(0, 10) } = opcoes;
  const achados = [];
  for (const mes of mesesSemMovimento(lancamentos)) {
    achados.push({ tipo: "mes_sem_movimento", mes });
  }
  achados.push(...despesasForaDoPadrao(contas, lancamentos, lancamentoLinhas, periodosFechados));
  achados.push(...receitasSemDinheiro(contas, lancamentos, lancamentoLinhas));
  achados.push(...retiradaAcimaDoResultado(contas, lancamentos, lancamentoLinhas, periodosFechados, hoje));

  const declarados = achadosDe(arquetipo);
  if (declarados.includes("mercadoria_parada_com_terceiro")) {
    achados.push(...mercadoriaParadaComTerceiro(contas, lancamentos, lancamentoLinhas, hoje));
  }
  if (declarados.includes("taxa_engolindo_margem")) {
    achados.push(...taxaEngolindoMargem(contas, lancamentos, lancamentoLinhas, hoje.slice(0, 7), CONTA_TAXA_POR_ARQUETIPO[arquetipo]));
  }
  if (declarados.includes("sem_receita_no_periodo")) {
    achados.push(...semReceitaNoPeriodo(contas, lancamentos, lancamentoLinhas, hoje));
  }

  return achados;
}
