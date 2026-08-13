/* ============================================================
   PAINEL DO MÊS — docs/04_MAPA_DO_APP.md §3, o gargalo nº 2
   (docs/03_CENARIOS_E_CAPACIDADE.md §5.1): "quem mandou e quem não
   mandou", de todos os clientes ao mesmo tempo.

   O SINAL DE "MANDOU" QUE REALMENTE EXISTE NO BANCO
   ------------------------------------------------------------
   O exemplo do doc mostra pendência granular ("extrato de julho, notas
   da semana 3") — isso exigiria uma lista de "o que se espera receber"
   que não existe no modelo (docs/06). Inventar essa granularidade seria
   mentir com o dado. O sinal real e honesto que o banco tem é a Caixa
   de Entrada (`entrada_itens`): quantos itens chegaram este mês, e
   quantos ainda esperam decisão (`pendente`/`duvida`). É menos
   detalhado que o mockup do doc, mas é verdade — e já resolve o gargalo
   (saber QUEM cobrar, mesmo sem saber exatamente O QUE, ainda economiza
   os "minutos por mês" que docs/03 §6 pede).

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

const MES_NOME = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function nomeDoMes(mes) {
  const [ano, m] = mes.split("-");
  return `${MES_NOME[Number(m) - 1]}/${ano}`;
}

/**
 * @param {{situacao:string}[]} itensDoMes entrada_itens deste negócio, já filtrados pro mês
 * @param {boolean} mesFechado
 * @returns {{status: "fechado"|"nada"|"pronto"|"faltando", pendentes: number}}
 */
export function statusDoMes(itensDoMes, mesFechado) {
  if (mesFechado) return { status: "fechado", pendentes: 0 };
  if (!itensDoMes.length) return { status: "nada", pendentes: 0 };
  const pendentes = itensDoMes.filter((i) => i.situacao === "pendente" || i.situacao === "duvida").length;
  return pendentes === 0 ? { status: "pronto", pendentes: 0 } : { status: "faltando", pendentes };
}

/**
 * Monta o painel inteiro: um item por negócio ATIVO e já onboarded
 * (docs/04 §2: colunas ricas só fazem sentido com lançamento de
 * verdade). Ordena os que precisam de cobrança primeiro — é a lista de
 * trabalho do dia 5, não uma lista alfabética à toa.
 *
 * @param {Array<{id, nome, apelido, situacao, configuracao}>} negocios
 * @param {Map<string, Array<{situacao}>>} itensPorNegocio negocio_id → itens do mês
 * @param {Set<string>} negociosComMesFechado ids com "mes:AAAA-MM" fechado
 */
export function montarPainelDoMes(negocios, itensPorNegocio, negociosComMesFechado) {
  const ORDEM = { nada: 0, faltando: 1, pronto: 2, fechado: 3 };
  const linhas = (negocios || [])
    .filter((n) => n.situacao === "ativo" && n.configuracao?.onboarded)
    .map((n) => {
      const itens = itensPorNegocio.get(n.id) || [];
      const info = statusDoMes(itens, negociosComMesFechado.has(n.id));
      return { negocioId: n.id, nome: n.nome, apelido: n.apelido, ...info };
    });
  return linhas.sort((a, b) => ORDEM[a.status] - ORDEM[b.status] || b.pendentes - a.pendentes);
}

/** Mensagem pronta pra colar — só existe para quem precisa ser cobrado. */
export function mensagemCobranca(linha, mes) {
  const nome = linha.apelido || linha.nome;
  const mesTexto = nomeDoMes(mes);
  if (linha.status === "nada") {
    return `Oi, ${nome}! Ainda não recebi nada de ${mesTexto} — pode ir mandando o extrato e as vendas quando puder?`;
  }
  if (linha.status === "faltando") {
    const n = linha.pendentes;
    return `Oi, ${nome}! Para fechar ${mesTexto} ainda preciso que você confirme ${n} ${n === 1 ? "item" : "itens"} que caí(ram) na Caixa de Entrada — dá uma olhada quando puder?`;
  }
  return null;
}
