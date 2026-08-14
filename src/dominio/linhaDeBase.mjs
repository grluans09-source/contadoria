/* ============================================================
   O RETRATO DE ENTRADA — como o cliente chegou.

   POR QUE ISTO EXISTE, E POR QUE É URGENTE (docs/09, P6)
   ------------------------------------------------------------
   Transformação exige um ANTES. Se a foto de como o cliente chegou não
   for tirada no onboarding, ela **não é recuperável depois** — os
   lançamentos vão sendo corrigidos, o balanço evolui, e daqui a seis
   meses ninguém consegue reconstruir o que ele acreditava no dia 1.
   Mesma lógica do campo "recomendação seguida?" (docs/08 §4): barato
   agora, impossível depois.

   O QUE REALMENTE IMPORTA CAPTURAR — e é contraintuitivo
   ------------------------------------------------------------
   O instinto é guardar números. Mas o número da abertura já está no
   livro (lançamento de abertura). O que **some para sempre** é a outra
   metade: **o que ele ACREDITAVA**.

   Ele diz que tira R$ 2.000 por mês. No primeiro mês medido, foram
   R$ 4.100. Essa distância entre a crença e o fato é a entrega mais
   forte do serviço inteiro — e ela só existe se o "ele disse" tiver
   sido congelado ANTES de existir medição.

   Por isso o retrato tem dois lados:
     · DECLARADO — o que ele respondeu no roteiro, na voz dele
     · MEDIDO    — o que o balanço de abertura mostrou

   IMUTÁVEL POR CONSTRUÇÃO
   ------------------------------------------------------------
   Grava uma vez e nunca mais. Se fosse recalculado, deixaria de ser
   linha de base e viraria só "o estado atual de novo" — e a comparação
   perderia o sentido.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

import { saldoDeConta } from "./razao.mjs";
import { CONTAS_DINHEIRO } from "./planoContas.mjs";
import { horaDoDono } from "./valorDoTempo.mjs";

const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/**
 * Monta o retrato de entrada, para gravar UMA vez ao concluir o
 * onboarding.
 *
 * @param {object} args
 * @param {object} args.negocio            tipo, arquetipo, dinheiro_misturado
 * @param {object} args.declarado          respostas do roteiro já resolvidas por chave
 * @param {Array}  args.contas
 * @param {Array}  args.linhasAbertura     as linhas do lançamento de abertura
 * @param {string} args.hoje
 */
export function montarRetratoDeEntrada({ negocio, declarado = {}, contas = [], linhasAbertura = [], hoje }) {
  const saldoDe = (id) => {
    const conta = contas.find((c) => c.id === id);
    return conta ? saldoDeConta(conta, linhasAbertura) : 0;
  };

  const caixaEBanco = CONTAS_DINHEIRO.reduce((s, id) => s + saldoDe(id), 0);
  const aReceber = saldoDe("clientes");
  const dividas = Math.abs(saldoDe("fornecedores")) + Math.abs(saldoDe("emprestimos"));

  /* O patrimônio da entrada é o que o balanço calculou, não um número
     digitado — é justamente o número que o cliente nunca soube.

     Sem inverter sinal: `saldoDeConta` já entrega o valor com o sinal
     certo para conta de PL (cresce no crédito). Patrimônio negativo
     — deve mais do que tem — sai negativo, e é assim que tem que ser
     mostrado (docs/06 §4: "com a mesma honestidade que mostraria um
     lucro"). */
  const patrimonio = Math.round(saldoDe("capital_titular") * 100) / 100;

  const faturamentoDeclarado = num(declarado.faturamentoMensal);
  const retiradaDeclarada = num(declarado.retiradaMensal);
  const horas = num(declarado.horasPorSemana);

  return {
    capturadoEm: hoje,
    tipo: negocio?.tipo ?? null,
    arquetipo: negocio?.arquetipo ?? null,

    /* O que ele ACREDITAVA — a metade que some se não for congelada */
    declarado: {
      faturamentoMensal: faturamentoDeclarado,
      retiradaMensal: retiradaDeclarada,
      horasPorSemana: horas,
      achaQueGanhaDinheiro: declarado.achaQueGanhaDinheiro || null,
      oQueIncomoda: declarado.oQueIncomoda || null,
      meta: declarado.meta || null,
      /* A hora que ele acha que vale, pelos números dele mesmos */
      horaDeclarada: horaDoDono({ retiradaNoMes: retiradaDeclarada, horasPorSemana: horas })?.porHora ?? null,
    },

    /* O que o livro MOSTROU no dia 1 */
    medido: {
      caixaEBanco: Math.round(caixaEBanco * 100) / 100,
      aReceber: Math.round(aReceber * 100) / 100,
      dividasDoNegocio: Math.round(dividas * 100) / 100,
      patrimonioLiquido: patrimonio,
      dinheiroMisturado: !!negocio?.dinheiro_misturado,
      temContaSeparada: declarado.temContaSeparada === "sim",
    },
  };
}

/**
 * A comparação que vira conversa. Devolve só o que MUDOU o suficiente
 * para valer ser dito — silêncio é resposta válida (docs/09, P3).
 *
 * @param {object} entrada   o retrato guardado
 * @param {object} agora     { faturamentoMensal, retiradaMensal, patrimonioLiquido, caixaEBanco, dividasDoNegocio }
 * @param {number} toleranciaPercentual  abaixo disso, não é diferença, é ruído
 */
export function compararComAEntrada(entrada, agora, toleranciaPercentual = 15) {
  if (!entrada || !agora) return [];
  const achados = [];

  const relevante = (antes, depois) => {
    if (antes === null || antes === undefined || depois === null || depois === undefined) return false;
    if (antes === 0) return depois !== 0;
    return Math.abs((depois - antes) / antes) * 100 >= toleranciaPercentual;
  };

  /* A comparação mais forte: o que ele ACHAVA que tirava contra o que
     tirou de verdade. É o momento em que o serviço se explica sozinho. */
  const retiradaDita = entrada.declarado?.retiradaMensal;
  if (relevante(retiradaDita, agora.retiradaMensal)) {
    const diferenca = Math.round((agora.retiradaMensal - retiradaDita) * 100) / 100;
    achados.push({
      tipo: "retirada_vs_declarado",
      forca: diferenca > 0 ? "alta" : "media",
      antes: retiradaDita,
      depois: agora.retiradaMensal,
      diferenca,
      frase: diferenca > 0
        ? `Quando começamos, você me disse que tirava ${fmt(retiradaDita)} por mês. O que os números mostram é ${fmt(agora.retiradaMensal)} — ${fmt(diferenca)} a mais do que você imaginava.`
        : `Você achava que tirava ${fmt(retiradaDita)} por mês; na prática está tirando ${fmt(agora.retiradaMensal)}.`,
    });
  }

  const faturamentoDito = entrada.declarado?.faturamentoMensal;
  if (relevante(faturamentoDito, agora.faturamentoMensal)) {
    achados.push({
      tipo: "faturamento_vs_declarado",
      forca: "media",
      antes: faturamentoDito,
      depois: agora.faturamentoMensal,
      diferenca: Math.round((agora.faturamentoMensal - faturamentoDito) * 100) / 100,
      frase: `Você estimava faturar ${fmt(faturamentoDito)} por mês; o medido é ${fmt(agora.faturamentoMensal)}.`,
    });
  }

  /* O arco de verdade: como o patrimônio andou desde o dia 1. É o único
     número que responde "o negócio está construindo alguma coisa?". */
  const patrimonioAntes = entrada.medido?.patrimonioLiquido;
  if (relevante(patrimonioAntes, agora.patrimonioLiquido)) {
    const d = Math.round((agora.patrimonioLiquido - patrimonioAntes) * 100) / 100;
    achados.push({
      tipo: "patrimonio_desde_a_entrada",
      forca: "alta",
      antes: patrimonioAntes,
      depois: agora.patrimonioLiquido,
      diferenca: d,
      frase: d > 0
        ? `Desde que começamos, o que é seu no negócio subiu ${fmt(d)} — de ${fmt(patrimonioAntes)} para ${fmt(agora.patrimonioLiquido)}.`
        : `Desde que começamos, o que é seu no negócio caiu ${fmt(Math.abs(d))} — de ${fmt(patrimonioAntes)} para ${fmt(agora.patrimonioLiquido)}.`,
    });
  }

  const dividaAntes = entrada.medido?.dividasDoNegocio;
  if (relevante(dividaAntes, agora.dividasDoNegocio)) {
    const d = Math.round((agora.dividasDoNegocio - dividaAntes) * 100) / 100;
    achados.push({
      tipo: "divida_desde_a_entrada",
      forca: d > 0 ? "alta" : "media",
      antes: dividaAntes,
      depois: agora.dividasDoNegocio,
      diferenca: d,
      frase: d < 0
        ? `A dívida do negócio caiu ${fmt(Math.abs(d))} desde que começamos.`
        : `A dívida do negócio subiu ${fmt(d)} desde que começamos.`,
    });
  }

  return achados;
}

/** O que ele respondeu quando perguntado se sabia se ganhava dinheiro —
 *  guardado literal, para ser lido de volta na conversa. */
export function oQueEleAchava(entrada) {
  const d = entrada?.declarado;
  if (!d?.achaQueGanhaDinheiro) return null;
  return d.achaQueGanhaDinheiro;
}

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
