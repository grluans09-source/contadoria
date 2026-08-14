/* ============================================================
   O VALOR DO TEMPO DELE — e para onde o ano está indo.

   Duas perguntas que ninguém faz ao dono de negócio pequeno, e que o
   sistema consegue responder com o dado que a abertura já captura —
   sem esperar três meses de histórico (docs/09 §5).

   1. QUANTO VALE A SUA HORA?
      Ele trabalha 60 horas por semana e tira R$ 2.000 por mês. Isso dá
      R$ 7,70 por hora. O salário mínimo de 2026, por hora, dá mais. É
      um dos números mais duros que ele vai ver — e é verdade, não
      retórica.

      ⚠️ Este número NÃO diz "feche o negócio". Um negócio em construção
      pode legitimamente pagar mal no começo enquanto constrói ativo,
      carteira ou reputação. Por isso a função devolve o número e o
      contexto, nunca um veredito (docs/09, P4: toda leitura dura vem
      com a explicação inocente ao lado).

   2. PARA ONDE O ANO ESTÁ INDO?
      Não "você já faturou X" — mas "no seu ritmo, você bate o teto em
      outubro". Meses de antecedência numa coisa que, se estourar em
      mais de 20%, custa 12 meses de tributo retroativo (docs/07 §4).

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

const SEMANAS_POR_MES = 4.345; /* 52/12 — mês "médio", não 4 */

/**
 * Quanto vale a hora de trabalho do dono.
 *
 * @param {object} args
 * @param {number} args.retiradaNoMes      quanto ele tirou (conta Retiradas do titular)
 * @param {number} args.horasPorSemana     resposta do Bloco 4 do roteiro
 * @param {number} [args.salarioMinimoHora] para comparar; vem de parametros_fiscais
 * @returns {null | {porHora, horasNoMes, comparacao, abaixoDoMinimo}}
 */
export function horaDoDono({ retiradaNoMes, horasPorSemana, salarioMinimoHora = null }) {
  const horas = Number(horasPorSemana);
  const retirada = Number(retiradaNoMes);

  /* Sem uma das duas pontas, silêncio — não se inventa denominador
     (docs/09, P3). */
  if (!(horas > 0) || !(retirada > 0)) return null;

  const horasNoMes = Math.round(horas * SEMANAS_POR_MES * 10) / 10;
  const porHora = Math.round((retirada / horasNoMes) * 100) / 100;

  return {
    porHora,
    horasNoMes,
    salarioMinimoHora,
    abaixoDoMinimo: salarioMinimoHora ? porHora < salarioMinimoHora : null,
    comparacao: salarioMinimoHora
      ? Math.round((porHora / salarioMinimoHora) * 100) / 100
      : null,
  };
}

/**
 * O salário mínimo por hora, a partir do valor mensal.
 * A jornada legal de referência é 220 horas mensais.
 * ⚠️ Conferir a jornada aplicável antes de usar como argumento formal
 * com um cliente — aqui serve de RÉGUA DE COMPARAÇÃO, não de cálculo
 * trabalhista (docs/02 §4.3: o limite profissional).
 */
export function minimoPorHora(salarioMinimoMensal, horasMensais = 220) {
  const v = Number(salarioMinimoMensal);
  if (!(v > 0)) return null;
  return Math.round((v / horasMensais) * 100) / 100;
}

/**
 * Para onde o ano está indo, no ritmo atual.
 *
 * @param {object} args
 * @param {number} args.receitaAcumulada   receita bruta do ano até agora
 * @param {number} args.mesesDecorridos    quantos meses do ano já passaram (1-12)
 * @param {number} args.limiteAnual        de parametros_fiscais
 * @param {string} [args.dataAbertura]     para a proporcionalidade do 1º ano
 * @param {number} [args.anoCorrente]
 * @returns {null | {projecao, limite, percentual, mesQueEstoura, faixa, sobraAteOTeto}}
 */
export function projecaoDoLimite({ receitaAcumulada, mesesDecorridos, limiteAnual, dataAbertura = null, anoCorrente = null }) {
  const receita = Number(receitaAcumulada);
  const meses = Number(mesesDecorridos);
  const limiteCheio = Number(limiteAnual);

  if (!(meses > 0) || !(limiteCheio > 0) || !(receita >= 0)) return null;

  /* Proporcionalidade do 1º ano: quem abriu em julho não tem o teto
     cheio (docs/07 §4). Conta o mês da abertura como mês inteiro. */
  let limite = limiteCheio;
  if (dataAbertura && anoCorrente) {
    const [anoAb, mesAb] = dataAbertura.split("-").map(Number);
    if (anoAb === anoCorrente) {
      const mesesDeAtividade = 12 - mesAb + 1;
      limite = Math.round((limiteCheio / 12) * mesesDeAtividade * 100) / 100;
    }
  }

  const mediaMensal = receita / meses;
  const projecao = Math.round(mediaMensal * 12 * 100) / 100;
  const percentual = Math.round((receita / limite) * 1000) / 10;

  /* Em que mês do ano o acumulado cruza o teto, mantido o ritmo. */
  let mesQueEstoura = null;
  if (mediaMensal > 0) {
    const mes = Math.ceil(limite / mediaMensal);
    if (mes <= 12) mesQueEstoura = mes;
  }

  /* As duas faixas de estouro têm consequências MUITO diferentes
     (docs/07 §4): até 20% é administrável; acima é retroativo a janeiro. */
  let faixa = "tranquilo";
  if (projecao > limite * 1.2) faixa = "estouro_grave";
  else if (projecao > limite) faixa = "estouro_leve";
  else if (projecao > limite * 0.8) faixa = "atencao";

  return {
    projecao,
    limite,
    percentual,
    mesQueEstoura,
    faixa,
    sobraAteOTeto: Math.round((limite - receita) * 100) / 100,
    proporcional: limite !== limiteCheio,
  };
}

const NOME_MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** O aviso em uma frase. null quando não há o que dizer (docs/09, P3). */
export function aviseSobreOLimite(p) {
  if (!p || p.faixa === "tranquilo") return null;
  const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  if (p.faixa === "estouro_grave") {
    return {
      gravidade: "grave",
      frase: `No ritmo de hoje o ano fecha em ${fmt(p.projecao)} — mais de 20% acima do teto${p.mesQueEstoura ? `, e o limite é ultrapassado em ${NOME_MES[p.mesQueEstoura - 1]}` : ""}.`,
      oQueFazer: "Passar de 20% desenquadra RETROATIVO a janeiro — tributo do ano inteiro de uma vez. Conversar agora sobre segurar faturamento ou preparar a transição para ME.",
    };
  }
  if (p.faixa === "estouro_leve") {
    return {
      gravidade: "atencao",
      frase: `No ritmo de hoje o ano fecha em ${fmt(p.projecao)}, acima do teto${p.mesQueEstoura ? ` (ultrapassa em ${NOME_MES[p.mesQueEstoura - 1]})` : ""}.`,
      oQueFazer: "Até 20% acima é administrável: paga a diferença e vira ME em 1º de janeiro. Vale planejar a transição com calma.",
    };
  }
  return {
    gravidade: "observar",
    frase: `Já usou ${p.percentual}% do teto do ano; no ritmo atual fecha em ${fmt(p.projecao)}.`,
    oQueFazer: "Ainda cabe, mas vale acompanhar de perto nos próximos meses.",
  };
}
