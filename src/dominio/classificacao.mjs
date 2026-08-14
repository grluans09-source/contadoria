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
 * O item é PESSOAL, e o dinheiro é misturado — então ele não some do
 * livro: vira movimento de patrimônio.
 *
 * POR QUE ISTO EXISTE (achado de 13/ago/2026)
 * ------------------------------------------------------------
 * Antes, "é pessoal" apenas marcava o item e NÃO gerava lançamento
 * nenhum. Para quem tem conta separada isso está certo — a transação é
 * de uma conta que o livro não acompanha. Mas para quem usa o mesmo
 * dinheiro pra tudo (o cenário mais comum, docs/03 §2.2), o saldo de
 * caixa do livro passava a mentir: o dinheiro saiu de verdade e o livro
 * continuava achando que estava lá. A conciliação nunca mais fechava.
 *
 * Com o dinheiro misturado, TODO o dinheiro entrou como capital do
 * negócio na abertura. Logo:
 *   · dinheiro pessoal SAINDO  = Retirada do titular (reduz patrimônio)
 *   · dinheiro pessoal ENTRANDO = Aporte do titular  (aumenta patrimônio)
 *
 * O segundo caso é real e fácil de esquecer: ele recebe de outro
 * trabalho e deposita na mesma conta. Isso não é receita do negócio —
 * lançar como receita inflaria o faturamento e, num MEI, poderia
 * disparar alarme falso do teto.
 *
 * É também o que torna possível o achado mais forte do sistema: no fim
 * do mês, a conta de Retiradas mostra quanto ele realmente tirou.
 *
 * @param {{data, descricaoBruta, valor, contaOrigemId}} item
 */
export function construirMovimentoPessoal(item, gerarId = uidPadrao) {
  if (!item.contaOrigemId) throw new Error("item sem conta de origem — não dá para saber de qual conta o dinheiro saiu ou entrou");
  const valorAbs = Math.abs(item.valor);
  if (!(valorAbs > 0)) throw new Error(`item com valor inválido: ${item.valor}`);

  const entrou = item.valor > 0;
  const idLancamento = gerarId();
  const contaPatrimonio = entrou ? "capital_titular" : "retiradas_titular";

  return {
    lancamento: {
      id: idLancamento,
      data: item.data,
      dataCompetencia: item.data,
      descricao: entrou ? `Aporte do titular — ${item.descricaoBruta}` : `Retirada do titular — ${item.descricaoBruta}`,
      origem: "manual",
      documento: null,
    },
    linhas: [
      /* Retirada DEBITA a conta de patrimônio (reduz o PL) e CREDITA o
         trânsito (o dinheiro saiu). Aporte é o inverso. */
      { id: gerarId(), lancamentoId: idLancamento, contaId: contaPatrimonio, tipo: entrou ? "C" : "D", valor: valorAbs, descricao: item.descricaoBruta, vencimento: null, baixaDe: null },
      { id: gerarId(), lancamentoId: idLancamento, contaId: item.contaOrigemId, tipo: entrou ? "D" : "C", valor: valorAbs, descricao: null, vencimento: null, baixaDe: null },
    ],
  };
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
