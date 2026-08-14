/* ============================================================
   PLANO DE CONTAS BASE — docs/06_MODELO_DE_DADOS.md §7

   O que TODO negócio tem, seja loja, eletricista ou quem vende curso
   online. O que é específico de cada tipo vive em `arquetipos.mjs`, que
   compõe base + extras em `planoDeFabrica(arquetipo)`.

   Inserido pelo APP na primeira carga (ao terminar o Roteiro do Cliente
   Novo), não por migração SQL — mesmo padrão do `seedAccounts()` do
   ContLife: editar plano de contas não deveria exigir SQL.

   Função pura: não importa React, Supabase nem DOM (docs/08 §6).

   AS ESCOLHAS QUE NÃO SÃO ARBITRÁRIAS
   ------------------------------------------------------------
   1. **Retiradas do titular é conta de PATRIMÔNIO, não de despesa.** É o
      erro conceitual nº 1 de dono de negócio pequeno ("eu me pago, então
      é custo"). Lançar retirada como despesa faz o lucro sair errado e
      destrói a conta de "quanto você pode tirar". Também é a conta que
      sustenta o achado mais forte do sistema — quanto ele realmente
      tirou no mês — e a que torna possível tratar dinheiro misturado
      com honestidade (docs/10, capítulo do dinheiro misturado).
   2. **A receber de maquininha é separado de Banco.** A venda acontece
      hoje, o dinheiro cai em dias. Juntar os dois esconde o buraco.
   3. **Taxa de maquininha tem conta própria.** É a despesa que mais come
      margem em silêncio quando fica escondida em "outras".
   4. **A receita de venda não está no base.** Cada arquétipo nomeia a
      sua (venda de mercadorias, prestação de serviços, comissões…) — e
      é isso que impede o eletricista de lançar trabalho como "venda de
      mercadorias" só porque era a única opção na lista.

   NUMERAÇÃO COM FOLGA
   ------------------------------------------------------------
   Os códigos do base deixam faixas livres de propósito (1120+ para
   estoques, 5120+ para custos, 5130+ para serviço, 5140+ para digital)
   — assim o arquétipo acrescenta conta sem renumerar nada e sem colidir.
   ============================================================ */

export function planoBase() {
  return [
    // ── 1. Ativo ──────────────────────────────────────────────
    { id: "caixa", codigo: "1101", nome: "Caixa", tipo: "ativo", subtipo: "circulante", ordem: 1 },
    { id: "banco", codigo: "1102", nome: "Banco", tipo: "ativo", subtipo: "circulante", ordem: 2 },
    { id: "maquininha_receber", codigo: "1103", nome: "A receber de maquininha", tipo: "ativo", subtipo: "circulante", ordem: 3 },
    { id: "clientes", codigo: "1104", nome: "Clientes", tipo: "ativo", subtipo: "circulante", ordem: 4 },
    { id: "equipamentos", codigo: "1150", nome: "Equipamentos", tipo: "ativo", subtipo: "nao_circulante", ordem: 50 },
    { id: "veiculos", codigo: "1151", nome: "Veículos", tipo: "ativo", subtipo: "nao_circulante", ordem: 51 },
    { id: "deprec_acum", codigo: "1152", nome: "Depreciação acumulada", tipo: "ativo", subtipo: "contra", ordem: 52 },

    // ── 2. Passivo ────────────────────────────────────────────
    { id: "fornecedores", codigo: "2101", nome: "Fornecedores", tipo: "passivo", subtipo: "circulante", ordem: 1 },
    { id: "das_a_pagar", codigo: "2102", nome: "DAS a pagar", tipo: "passivo", subtipo: "circulante", ordem: 2 },
    { id: "emprestimos", codigo: "2103", nome: "Empréstimos", tipo: "passivo", subtipo: "circulante", ordem: 3 },
    { id: "salarios_a_pagar", codigo: "2104", nome: "Salários a pagar", tipo: "passivo", subtipo: "circulante", ordem: 4 },

    // ── 3. Patrimônio líquido ─────────────────────────────────
    { id: "capital_titular", codigo: "3101", nome: "Capital do titular", tipo: "pl", ordem: 1 },
    { id: "retiradas_titular", codigo: "3102", nome: "Retiradas do titular", tipo: "pl", ordem: 2 },
    { id: "lucros_acumulados", codigo: "3103", nome: "Lucros acumulados", tipo: "pl", ordem: 3 },

    // ── 4. Receita ────────────────────────────────────────────
    /* A receita PRINCIPAL vem do arquétipo — ver escolha 4 acima. */
    { id: "outras_receitas", codigo: "4190", nome: "Outras receitas", tipo: "receita", ordem: 90 },

    // ── 5. Despesa ────────────────────────────────────────────
    { id: "aluguel", codigo: "5101", nome: "Aluguel", tipo: "despesa", ordem: 1 },
    { id: "energia", codigo: "5102", nome: "Energia", tipo: "despesa", ordem: 2 },
    { id: "agua", codigo: "5103", nome: "Água", tipo: "despesa", ordem: 3 },
    { id: "internet_telefone", codigo: "5104", nome: "Internet e telefone", tipo: "despesa", ordem: 4 },
    { id: "taxa_maquininha", codigo: "5105", nome: "Taxa de maquininha", tipo: "despesa", ordem: 5 },
    { id: "combustivel", codigo: "5106", nome: "Combustível", tipo: "despesa", ordem: 6 },
    { id: "material_consumo", codigo: "5107", nome: "Material de consumo", tipo: "despesa", ordem: 7 },
    { id: "marketing", codigo: "5108", nome: "Marketing", tipo: "despesa", ordem: 8 },
    { id: "das_despesa", codigo: "5109", nome: "DAS", tipo: "despesa", ordem: 9 },
    { id: "depreciacao", codigo: "5110", nome: "Depreciação", tipo: "despesa", ordem: 10 },
    { id: "tarifas_bancarias", codigo: "5111", nome: "Tarifas bancárias", tipo: "despesa", ordem: 11 },
    { id: "outras_despesas", codigo: "5190", nome: "Outras despesas", tipo: "despesa", ordem: 90 },
  ];
}

/* Contas de dinheiro imediato — usadas pelo cálculo de "quanto pode
   tirar" e pelo fluxo projetado. `saldo_plataforma` entra aqui quando o
   arquétipo digital a cria: é dinheiro dele, só ainda não caiu na conta. */
export const CONTAS_DINHEIRO = ["caixa", "banco"];
