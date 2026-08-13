/* ============================================================
   CLASSIFICAÇÃO — a Caixa de Entrada (docs/06 §8, docs/04 §5)

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).

   O APRENDIZADO É DO DONO, NÃO DE HEURÍSTICA
   ------------------------------------------------------------
   `regras_classificacao.padrao` é um FRAGMENTO de texto que casa por
   substring dentro da descrição bruta ("MERCADO" casa com "MERCADO
   EXTRA 123" e "MERCADO SAO JOSE" — docs/06 §8). Este módulo NÃO tenta
   extrair esse fragmento sozinho a partir da descrição crua — inventar
   um tokenizador/heurística de generalização seria abstração frágil
   demais para confiar sem supervisão. Em vez disso, `sugerirConta`
   procura o que já foi ENSINADO, e quem decide o padrão de uma regra
   nova é o dono, na tela, ao classificar (o campo vem pré-preenchido
   com a descrição inteira, editável). É o "roteiro aprende" (docs/05
   §1) aplicado aqui: o sistema não adivinha, ele lembra o que já foi
   dito.
   ============================================================ */

const uidPadrao = () => Math.random().toString(36).slice(2, 10);

/**
 * Acha a melhor regra já ensinada que combina com esta descrição.
 * Entre várias que combinam, vence a mais ESPECÍFICA (padrão mais
 * longo) — "MERCADO EXTRA" deveria vencer "MERCADO" se as duas casarem.
 * @param {string} descricaoBruta
 * @param {Array<{padrao:string, contaId:string, acertos:number}>} regras
 * @returns {null | {padrao, contaId, acertos}}
 */
export function sugerirConta(descricaoBruta, regras) {
  const texto = (descricaoBruta || "").toUpperCase();
  if (!texto) return null;
  const candidatas = (regras || []).filter((r) => r.padrao && texto.includes(r.padrao.toUpperCase()));
  if (!candidatas.length) return null;
  candidatas.sort((a, b) => b.padrao.length - a.padrao.length || (b.acertos || 0) - (a.acertos || 0));
  return candidatas[0];
}

/**
 * Monta o lançamento de 2 linhas que classifica um item da Caixa de
 * Entrada: uma perna na conta de TRÂNSITO (caixa ou banco — de onde o
 * dinheiro veio/foi, já sabida desde a importação), outra na conta de
 * CATEGORIA que o dono escolheu.
 *
 * A direção (D/C) vem do SINAL do valor bruto: item.valor > 0 é dinheiro
 * que ENTROU na conta de trânsito (débito nela — é ativo, cresce no
 * débito), item.valor < 0 é dinheiro que SAIU (crédito nela).
 *
 * @param {{data, descricaoBruta, valor, contaOrigemId, origem}} item
 * @param {string} contaCategoriaId
 */
export function construirLancamentoDeClassificacao(item, contaCategoriaId, gerarId = uidPadrao) {
  if (!item.contaOrigemId) throw new Error("item sem conta de origem — não dá para saber qual conta de trânsito debitar/creditar");
  if (!contaCategoriaId) throw new Error("escolha uma conta de categoria antes de classificar");
  const valorAbs = Math.abs(item.valor);
  if (!(valorAbs > 0)) throw new Error(`item com valor inválido: ${item.valor}`);

  const entrou = item.valor > 0;
  const idLancamento = gerarId();

  return {
    lancamento: {
      id: idLancamento,
      data: item.data,
      dataCompetencia: item.data,
      descricao: item.descricaoBruta,
      origem: item.origem === "extrato" ? "extrato" : "manual",
      documento: null,
    },
    linhas: [
      { id: gerarId(), lancamentoId: idLancamento, contaId: item.contaOrigemId, tipo: entrou ? "D" : "C", valor: valorAbs, descricao: item.descricaoBruta, vencimento: null },
      { id: gerarId(), lancamentoId: idLancamento, contaId: contaCategoriaId, tipo: entrou ? "C" : "D", valor: valorAbs, descricao: null, vencimento: null },
    ],
  };
}
