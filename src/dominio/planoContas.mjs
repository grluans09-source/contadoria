/* ============================================================
   PLANO DE CONTAS DE FÁBRICA — docs/06_MODELO_DE_DADOS.md §7

   Modelo de MEI/serviço, copiado para cada negócio novo. Inserido pelo
   APP na primeira carga (aqui: ao terminar o Roteiro do Cliente Novo),
   não por migração SQL — mesmo padrão do `seedAccounts()` do ContLife:
   editar o plano de contas não deveria exigir SQL.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6) — por
   isso é testável no Node puro, sem servidor nenhum.

   AS QUATRO ESCOLHAS QUE NÃO SÃO ARBITRÁRIAS (docs/06 §7)
   ------------------------------------------------------------
   1. Venda de mercadorias SEPARADA de Prestação de serviços — o
      relatório mensal obrigatório do MEI exige as duas colunas.
   2. Retiradas do titular é conta de PATRIMÔNIO, não de despesa — é o
      erro conceitual nº 1 de dono de negócio pequeno ("eu me pago,
      então é custo"). Também é a conta que responde "quanto você já
      tirou este ano".
   3. A receber de maquininha SEPARADA de Banco — a venda acontece hoje,
      o dinheiro cai em dias.
   4. Taxa de maquininha tem conta própria — é a despesa que mais come
      margem em silêncio quando fica escondida em "outras".
   ============================================================ */

export function planoDeFabrica() {
  return [
    // ── 1. Ativo ──────────────────────────────────────────────
    { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo", subtipo: "circulante", ordem: 1 },
    { id: "banco", codigo: "1102", nome: "Banco", tipo: "ativo", subtipo: "circulante", ordem: 2 },
    { id: "maquininha_receber", codigo: "1103", nome: "A receber de maquininha", tipo: "ativo", subtipo: "circulante", ordem: 3 },
    { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo", subtipo: "circulante", ordem: 4 },
    { id: "estoque", codigo: "1105", nome: "Estoque", tipo: "ativo", subtipo: "circulante", ordem: 5 },
    { id: "equipamentos", codigo: "1106", nome: "Equipamentos", tipo: "ativo", subtipo: "nao_circulante", ordem: 6 },
    { id: "veiculos", codigo: "1107", nome: "Veículos", tipo: "ativo", subtipo: "nao_circulante", ordem: 7 },
    { id: "deprec_acum", codigo: "1108", nome: "Depreciação acumulada", tipo: "ativo", subtipo: "contra", ordem: 8 },

    // ── 2. Passivo ────────────────────────────────────────────
    { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo", subtipo: "circulante", ordem: 1 },
    { id: "das_a_pagar", codigo: "2102", nome: "DAS a pagar", tipo: "passivo", subtipo: "circulante", ordem: 2 },
    { id: "emprestimos", codigo: "2103", nome: "Empréstimos", tipo: "passivo", subtipo: "circulante", ordem: 3 },
    { id: "salarios_a_pagar", codigo: "2104", nome: "Salários a pagar", tipo: "passivo", subtipo: "circulante", ordem: 4 },

    // ── 3. Patrimônio líquido ─────────────────────────────────
    { id: "capital_titular", codigo: "3101", nome: "Capital do titular", tipo: "pl", ordem: 1 },
    { id: "retiradas_titular", codigo: "3102", nome: "Retiradas do titular", tipo: "pl", ordem: 2 },
    { id: "lucros_acumulados", codigo: "3103", nome: "Lucros acumulados", tipo: "pl", ordem: 3 },

    // ── 4. Receitas ───────────────────────────────────────────
    { id: "venda_mercadorias", codigo: "4101", nome: "Venda de mercadorias", tipo: "receita", ordem: 1 },
    { id: "prestacao_servicos", codigo: "4102", nome: "Prestação de serviços", tipo: "receita", ordem: 2 },
    { id: "outras_receitas", codigo: "4103", nome: "Outras receitas", tipo: "receita", ordem: 3 },

    // ── 5. Despesas ───────────────────────────────────────────
    { id: "cmv", codigo: "5101", nome: "CMV", tipo: "despesa", ordem: 1 },
    { id: "aluguel", codigo: "5102", nome: "Aluguel", tipo: "despesa", ordem: 2 },
    { id: "energia", codigo: "5103", nome: "Energia", tipo: "despesa", ordem: 3 },
    { id: "agua", codigo: "5104", nome: "Água", tipo: "despesa", ordem: 4 },
    { id: "internet_telefone", codigo: "5105", nome: "Internet e telefone", tipo: "despesa", ordem: 5 },
    { id: "taxa_maquininha", codigo: "5106", nome: "Taxa de maquininha", tipo: "despesa", ordem: 6 },
    { id: "combustivel", codigo: "5107", nome: "Combustível", tipo: "despesa", ordem: 7 },
    { id: "material_consumo", codigo: "5108", nome: "Material de consumo", tipo: "despesa", ordem: 8 },
    { id: "marketing", codigo: "5109", nome: "Marketing", tipo: "despesa", ordem: 9 },
    { id: "das_despesa", codigo: "5110", nome: "DAS", tipo: "despesa", ordem: 10 },
    { id: "depreciacao", codigo: "5111", nome: "Depreciação", tipo: "despesa", ordem: 11 },
    { id: "tarifas_bancarias", codigo: "5112", nome: "Tarifas bancárias", tipo: "despesa", ordem: 12 },
    { id: "outras_despesas", codigo: "5113", nome: "Outras despesas", tipo: "despesa", ordem: 13 },
  ];
}
