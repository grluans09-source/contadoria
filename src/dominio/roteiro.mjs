/* ============================================================
   ROTEIRO — quais perguntas este cliente vê.

   Existe como módulo próprio porque tem DOIS consumidores, e eles
   precisam concordar:
     · a entrevista presencial (src/telas/ClienteNovo.jsx)
     · o formulário que o cliente responde sozinho por link
       (src/telas/FormularioPublico.jsx)

   Se cada tela filtrasse por conta própria, um dia o formulário
   perguntaria a um informal quando ele abriu o MEI — exatamente o bug
   que os arquétipos vieram corrigir.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

/* Blocos que fazem sentido o CLIENTE responder sozinho.

   Fora ficam, de propósito:
     · Bloco 6 (o combinado) — é negociação, não coleta. Preço e "o que
       eu não faço" se dizem olhando no olho, não num formulário.
   O Bloco 3 (a foto de hoje) ENTRA: em linguagem simples, o cliente
   sabe responder quanto tem na carteira e quem lhe deve — e valor
   aproximado já resolve (docs/05 §4). */
export const BLOCOS_DO_CLIENTE = [1, 2, 3, 4, 5];

/**
 * Filtra o roteiro para um negócio específico.
 *
 * @param {Array} perguntas          linhas de roteiro_perguntas
 * @param {object} opcoes
 * @param {string} opcoes.tipo       'mei' | 'informal'
 * @param {string} opcoes.arquetipo  id do arquétipo, ou null
 * @param {boolean} [opcoes.apenasEssenciais]  true = só a primeira conversa
 * @param {number[]} [opcoes.blocos]  restringe a estes blocos
 */
export function perguntasPara(perguntas, { tipo, arquetipo, apenasEssenciais = false, blocos = null } = {}) {
  return (perguntas || [])
    .filter((p) => p.ativo !== false)
    .filter((p) => !blocos || blocos.includes(p.bloco))
    .filter((p) => !apenasEssenciais || p.essencial)
    /* Array nulo/vazio = vale para todos. É o caso comum, então o
       default precisa ser "aparece", não "some". */
    .filter((p) => !p.tipos?.length || p.tipos.includes(tipo))
    .filter((p) => !p.arquetipos?.length || (arquetipo && p.arquetipos.includes(arquetipo)))
    .sort((a, b) => a.bloco - b.bloco || a.ordem - b.ordem);
}

/** Quantas perguntas de aprofundamento ainda não foram respondidas —
 *  alimenta o lembrete antes da conversa do mês (docs/10). */
export function pendentesDeAprofundamento(perguntas, respostasPorPerguntaId, opcoes) {
  return perguntasPara(perguntas, { ...opcoes, apenasEssenciais: false })
    .filter((p) => !p.essencial)
    .filter((p) => {
      const r = respostasPorPerguntaId?.[p.id];
      return r === undefined || r === null || String(r).trim() === "";
    });
}

/** A resposta de UMA pergunta específica, achada por `destino` — nunca
 *  por texto (C8: texto é editável de propósito). Usado por telas que
 *  precisam de UM campo conhecido do roteiro (ex.: a meta do cliente
 *  alimentando a Carta, `destino = 'carta.meta'`, F6). */
export function respostaPorDestino(perguntas, respostasPorPerguntaId, destino) {
  const pergunta = (perguntas || []).find((p) => p.destino === destino);
  if (!pergunta) return null;
  const resposta = respostasPorPerguntaId?.[pergunta.id];
  return resposta != null && String(resposta).trim() !== "" ? resposta : null;
}

/**
 * Monta o patch de `negocios` a partir das respostas do roteiro — toda
 * pergunta com destino `negocios.*`, em QUALQUER bloco.
 *
 * BUG achado em teste de ponta a ponta (15/ago): a versão original
 * deste código só varria o Bloco 1, então "você usa o mesmo dinheiro
 * para tudo?" (Bloco 2, destino `negocios.dinheiro_misturado`) nunca
 * era gravada — o campo ficava `false` pra sempre, e o gasto pessoal
 * continuava sumindo do livro em silêncio (o exato problema que C5,
 * docs/DECISOES.md, existe para resolver). Extraído pra cá, testável,
 * pra este tipo de regressão não voltar a passar despercebido.
 */
export function respostasParaNegocio(perguntas, respostasPorPerguntaId) {
  const patch = {};
  for (const p of perguntas || []) {
    if (!p.destino?.startsWith("negocios.")) continue;
    const valor = respostasPorPerguntaId?.[p.id];
    if (valor === undefined || valor === "") continue;
    const campo = p.destino.slice("negocios.".length);
    patch[campo] = p.tipo_resposta === "sim_nao" ? valor === "sim" : valor;
  }
  return patch;
}

/** Progresso de preenchimento, para a barra do formulário do cliente. */
export function progresso(perguntas, respostasPorPerguntaId) {
  const total = perguntas.length;
  if (!total) return { respondidas: 0, total: 0, fracao: 1 };
  const respondidas = perguntas.filter((p) => {
    const r = respostasPorPerguntaId?.[p.id];
    return r !== undefined && r !== null && String(r).trim() !== "";
  }).length;
  return { respondidas, total, fracao: respondidas / total };
}
