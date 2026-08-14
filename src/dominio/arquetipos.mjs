/* ============================================================
   ARQUÉTIPOS DE NEGÓCIO — o que o negócio FAZ para ganhar dinheiro.

   Por que isto existe (13/ago/2026): até aqui o Contadoria tratava todo
   cliente igual — um plano de contas de COMÉRCIO (CMV, Estoque) para
   todo mundo. Eletricista recebia "Estoque" e não recebia "Material
   aplicado"; quem vende online não recebia "Taxa de plataforma"; e quem
   manda mercadoria para terceiro beneficiar não tinha onde registrar o
   que está fora da mão dele. O roteiro de entrevista tinha o mesmo
   problema: perguntava a informal quando ele "abriu o MEI".

   OS 8 SÃO DADOS, NÃO 8 CAMINHOS DE CÓDIGO
   ------------------------------------------------------------
   A variação entre um eletricista e uma loja de roupa é de CONTEÚDO
   (quais contas, quais perguntas, qual achado), não de lógica. Então
   existe UM motor e oito configurações — não oito telas. É o que permite
   acrescentar o nono arquétipo sem tocar em JavaScript de tela.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).
   ============================================================ */

import { planoBase } from "./planoContas.mjs";

/* ── Os 8 arquétipos ───────────────────────────────────────────
   Cada um declara:
     contasExtras    — o que este tipo de negócio precisa e os outros não
     camposAbertura  — o que perguntar no balanço de abertura, além do comum
     achados         — quais análises fazem sentido rodar para ele

   AS PERGUNTAS DO ROTEIRO NÃO ESTÃO AQUI, DE PROPÓSITO
   ------------------------------------------------------------
   Vivem em `roteiro_perguntas` no banco, marcadas com a coluna
   `arquetipos` — mesma decisão de 12/ago que já valia para as perguntas
   universais: roteiro é DADO editável, não JavaScript. Ter metade das
   perguntas aqui e metade no banco daria duas fontes de verdade para a
   mesma coisa, que é o jeito garantido de as duas divergirem.
   ────────────────────────────────────────────────────────────── */
export const ARQUETIPOS = [
  {
    id: "revenda",
    nome: "Revenda",
    resumo: "Compra pronto e vende sem transformar",
    exemplos: "loja, sacoleira, distribuidora, revenda online, mercadinho",
    contasExtras: [
      { id: "estoque", codigo: "1120", nome: "Estoque de mercadorias", tipo: "ativo", subtipo: "circulante", ordem: 20 },
      { id: "venda_mercadorias", codigo: "4101", nome: "Venda de mercadorias", tipo: "receita", ordem: 1 },
      { id: "cmv", codigo: "5120", nome: "Custo da mercadoria vendida", tipo: "despesa", ordem: 20 },
      { id: "frete_compras", codigo: "5121", nome: "Frete sobre compras", tipo: "despesa", ordem: 21 },
    ],
    camposAbertura: [
      { chave: "estoque", contaId: "estoque", tipo: "D", rotulo: "Mercadoria parada (valor de custo aproximado)",
        porque: "É dinheiro seu que está na prateleira em vez de estar no caixa. Saber quanto é costuma ser o primeiro susto — e é a base para descobrir o que gira devagar." },
    ],
    achados: ["taxa_engolindo_margem"],
  },

  {
    id: "producao",
    nome: "Produção própria",
    resumo: "Transforma insumo em produto e vende",
    exemplos: "salgados, bolos, marmita, costura, artesanato, marcenaria",
    contasExtras: [
      { id: "estoque_insumos", codigo: "1121", nome: "Estoque de insumos", tipo: "ativo", subtipo: "circulante", ordem: 21 },
      { id: "estoque_produtos", codigo: "1122", nome: "Produto pronto", tipo: "ativo", subtipo: "circulante", ordem: 22 },
      { id: "venda_producao", codigo: "4102", nome: "Venda de produção própria", tipo: "receita", ordem: 2 },
      { id: "insumos", codigo: "5122", nome: "Insumos e matéria-prima", tipo: "despesa", ordem: 22 },
      { id: "embalagem", codigo: "5123", nome: "Embalagem", tipo: "despesa", ordem: 23 },
      { id: "perda_producao", codigo: "5124", nome: "Perda e quebra", tipo: "despesa", ordem: 24 },
    ],
    camposAbertura: [
      { chave: "estoque_insumos", contaId: "estoque_insumos", tipo: "D", rotulo: "Insumo/matéria-prima parada (valor aproximado)",
        porque: "Farinha, tecido, madeira — o que já foi comprado e ainda não virou produto." },
      { chave: "estoque_produtos", contaId: "estoque_produtos", tipo: "D", rotulo: "Produto pronto ainda não vendido",
        porque: "Já custou insumo e tempo, mas ainda não virou dinheiro." },
    ],
    achados: ["taxa_engolindo_margem"],
  },

  {
    id: "servico_mao_obra",
    nome: "Serviço com mão de obra",
    resumo: "Vende o próprio trabalho, com ou sem material",
    exemplos: "eletricista, pedreiro, encanador, pintor, mecânico, consertos, diarista",
    contasExtras: [
      { id: "prestacao_servicos", codigo: "4103", nome: "Prestação de serviços", tipo: "receita", ordem: 3 },
      { id: "venda_material_aplicado", codigo: "4104", nome: "Material cobrado do cliente", tipo: "receita", ordem: 4 },
      { id: "material_aplicado", codigo: "5130", nome: "Material aplicado em serviço", tipo: "despesa", ordem: 30 },
      { id: "ferramentas", codigo: "5131", nome: "Ferramentas e manutenção", tipo: "despesa", ordem: 31 },
      { id: "deslocamento", codigo: "5132", nome: "Deslocamento", tipo: "despesa", ordem: 32 },
      { id: "ajudante", codigo: "5133", nome: "Ajudante / diária de terceiro", tipo: "despesa", ordem: 33 },
    ],
    camposAbertura: [
      { chave: "material_obra", contaId: "estoque_insumos", tipo: "D", rotulo: "Material já comprado para serviço ainda não feito",
        porque: "Material comprado para uma obra que ainda não aconteceu é dinheiro adiantado, não despesa do mês.",
        contaExtra: { id: "estoque_insumos", codigo: "1121", nome: "Material para serviço", tipo: "ativo", subtipo: "circulante", ordem: 21 } },
    ],
    achados: ["sem_receita_no_periodo"],
  },

  {
    id: "servico_recorrente",
    nome: "Serviço recorrente",
    resumo: "Contrato ou mensalidade que se repete",
    exemplos: "manutenção mensal, limpeza, aulas, mensalista, assessoria",
    contasExtras: [
      { id: "mensalidades", codigo: "4105", nome: "Mensalidades", tipo: "receita", ordem: 5 },
      { id: "servicos_avulsos", codigo: "4106", nome: "Serviços avulsos", tipo: "receita", ordem: 6 },
    ],
    camposAbertura: [],
    achados: [],
  },

  {
    id: "digital",
    nome: "Digital / online",
    resumo: "Vende pela internet, produto digital ou serviço remoto",
    exemplos: "infoproduto, sistema, freelancer digital, social media, e-commerce próprio",
    contasExtras: [
      { id: "saldo_plataforma", codigo: "1105", nome: "Saldo em plataforma", tipo: "ativo", subtipo: "circulante", ordem: 5 },
      { id: "vendas_online", codigo: "4107", nome: "Vendas online", tipo: "receita", ordem: 7 },
      { id: "assinaturas", codigo: "4108", nome: "Assinaturas", tipo: "receita", ordem: 8 },
      { id: "taxa_plataforma", codigo: "5140", nome: "Taxa de plataforma", tipo: "despesa", ordem: 40 },
      { id: "anuncios", codigo: "5141", nome: "Anúncios e tráfego pago", tipo: "despesa", ordem: 41 },
      { id: "ferramentas_software", codigo: "5142", nome: "Ferramentas e assinaturas de software", tipo: "despesa", ordem: 42 },
    ],
    camposAbertura: [
      { chave: "saldo_plataforma", contaId: "saldo_plataforma", tipo: "D", rotulo: "Dinheiro parado em plataforma (Hotmart, Mercado Pago, PagSeguro…)",
        porque: "Já é dinheiro dele, mas ainda não caiu na conta. Some do controle de quem só olha o extrato do banco." },
    ],
    achados: ["taxa_engolindo_margem"],
  },

  {
    id: "beneficiamento",
    nome: "Beneficiamento / terceirização",
    resumo: "Manda material para terceiro trabalhar e depois vende",
    exemplos: "manda tecido para costureira, peça para pintura, madeira para corte, faccção",
    contasExtras: [
      { id: "estoque", codigo: "1120", nome: "Estoque de mercadorias", tipo: "ativo", subtipo: "circulante", ordem: 20 },
      /* A conta que este arquétipo existe para ter: o que saiu da mão
         dele mas ainda é dele. Sem ela, o valor some do balanço no
         período em que está com o terceiro — e é justamente o período
         de maior risco. */
      { id: "mercadoria_com_terceiros", codigo: "1123", nome: "Mercadoria com terceiros", tipo: "ativo", subtipo: "circulante", ordem: 23 },
      { id: "venda_mercadorias", codigo: "4101", nome: "Venda de mercadorias", tipo: "receita", ordem: 1 },
      { id: "servico_terceiros", codigo: "5150", nome: "Serviço de terceiros", tipo: "despesa", ordem: 50 },
      { id: "perda_beneficiamento", codigo: "5151", nome: "Perda no beneficiamento", tipo: "despesa", ordem: 51 },
    ],
    camposAbertura: [
      { chave: "mercadoria_com_terceiros", contaId: "mercadoria_com_terceiros", tipo: "D", rotulo: "Mercadoria que está na mão de terceiro agora",
        porque: "É seu, mas não está com você. Se sumir ou estragar, a perda é sua — e quase ninguém controla quanto tem parado lá fora." },
      { chave: "estoque", contaId: "estoque", tipo: "D", rotulo: "Mercadoria pronta parada com você",
        porque: "O que já voltou do terceiro e ainda não foi vendido." },
    ],
    achados: ["mercadoria_parada_com_terceiro"],
  },

  {
    id: "intermediacao",
    nome: "Intermediação / comissão",
    resumo: "Vende o produto de outro e fica com a comissão",
    exemplos: "representante, revendedor comissionado, corretor, dropshipping",
    contasExtras: [
      /* O par de contas que impede o erro mais caro deste arquétipo:
         o dinheiro que ele recebe e vai repassar NÃO é receita dele —
         é obrigação com terceiro. Lançar o bruto como receita infla o
         faturamento e pode disparar alarme falso do teto do MEI. */
      { id: "valores_a_repassar", codigo: "1106", nome: "Valores recebidos a repassar", tipo: "ativo", subtipo: "circulante", ordem: 6 },
      { id: "repasses_a_pagar", codigo: "2105", nome: "Repasses a pagar", tipo: "passivo", subtipo: "circulante", ordem: 5 },
      { id: "comissoes", codigo: "4109", nome: "Comissões recebidas", tipo: "receita", ordem: 9 },
    ],
    camposAbertura: [
      { chave: "repasses_a_pagar", contaId: "repasses_a_pagar", tipo: "C", rotulo: "Dinheiro que você já recebeu e ainda vai repassar",
        porque: "Esse dinheiro está na sua conta mas não é seu. Tratar como receita infla o faturamento e atrapalha o controle do limite do MEI." },
    ],
    achados: [],
  },

  {
    id: "locacao",
    nome: "Locação",
    resumo: "Aluga equipamento, espaço ou veículo",
    exemplos: "aluguel de ferramenta, som, brinquedo, espaço, veículo",
    contasExtras: [
      { id: "equipamentos_locacao", codigo: "1153", nome: "Equipamentos para locação", tipo: "ativo", subtipo: "nao_circulante", ordem: 53 },
      { id: "alugueis_recebidos", codigo: "4110", nome: "Aluguéis recebidos", tipo: "receita", ordem: 10 },
      { id: "manutencao_equipamentos", codigo: "5160", nome: "Manutenção de equipamentos", tipo: "despesa", ordem: 60 },
      { id: "seguro", codigo: "5161", nome: "Seguro", tipo: "despesa", ordem: 61 },
    ],
    camposAbertura: [
      { chave: "equipamentos_locacao", contaId: "equipamentos_locacao", tipo: "D", rotulo: "Equipamentos que você aluga (valor aproximado de hoje)",
        porque: "É o ativo que gera a receita do negócio. Sem ele registrado, não dá para saber se o aluguel paga o equipamento." },
    ],
    achados: [],
  },
];

export const IDS_ARQUETIPOS = ARQUETIPOS.map((a) => a.id);

export function acharArquetipo(id) {
  return ARQUETIPOS.find((a) => a.id === id) || null;
}

/**
 * O plano de contas de um negócio: base + o que o arquétipo acrescenta.
 * Arquétipo desconhecido ou ausente devolve só o base — o livro nasce
 * pobre, mas nasce válido, e o dono pode acrescentar conta na mão
 * (tela Plano de Contas).
 */
export function planoDeFabrica(arquetipoId) {
  const arq = acharArquetipo(arquetipoId);
  const contas = [...planoBase()];
  const jaTem = new Set(contas.map((c) => c.id));

  for (const extra of arq?.contasExtras || []) {
    if (jaTem.has(extra.id)) continue;
    contas.push(extra);
    jaTem.add(extra.id);
  }

  /* Campos de abertura podem trazer conta própria (ex.: o "material
     para serviço" do eletricista reaproveita a conta de insumos com
     outro rótulo). */
  for (const campo of arq?.camposAbertura || []) {
    if (campo.contaExtra && !jaTem.has(campo.contaExtra.id)) {
      contas.push(campo.contaExtra);
      jaTem.add(campo.contaExtra.id);
    }
  }

  return contas.map((c) => ({ ...c, subtipo: c.subtipo ?? null, ativa: true }));
}

/** Os campos de abertura de um arquétipo, além dos comuns a todos. */
export function camposAberturaDe(arquetipoId) {
  return acharArquetipo(arquetipoId)?.camposAbertura || [];
}

/** Os achados que fazem sentido para este arquétipo (docs/04 §7). */
export function achadosDe(arquetipoId) {
  return acharArquetipo(arquetipoId)?.achados || [];
}
