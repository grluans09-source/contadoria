import { supabase } from "./supabase.mjs";
import { montarEstado, TABELAS } from "./sinc.mjs";

/* O PostgREST devolve no máximo 1.000 linhas por consulta, EM SILÊNCIO
   — mesma armadilha documentada no ContLife (docs/06 §11). Sem paginar,
   um negócio com mais de mil linhas numa tabela abriria com o livro pela
   metade, e todo saldo sairia errado sem aviso nenhum. Para o volume
   esperado de um MEI (dezenas a poucas centenas de lançamentos por ano),
   isto quase nunca entra em ação — mas custa pouco e evita a pior
   classe de bug possível aqui. */
const PAGINA = 1000;

async function carregarTabela(tabela, negocioId) {
  let todas = [];
  let pagina = 0;
  while (true) {
    const { data, error } = await supabase
      .from(tabela).select("*")
      .eq("negocio_id", negocioId)
      .range(pagina * PAGINA, pagina * PAGINA + PAGINA - 1);
    if (error) throw new Error(`Falha ao carregar ${tabela}: ${error.message}`);
    todas = todas.concat(data || []);
    if (!data || data.length < PAGINA) break;
    pagina++;
  }
  return todas;
}

/** Carrega o estado inteiro de um negócio (todas as coleções de
 *  COLECOES, docs/06) e devolve no formato que a memória do app usa —
 *  via `montarEstado`, o inverso exato de `calcularDiferenca`. */
export async function carregarEstadoNegocio(negocioId) {
  const entradas = await Promise.all(
    TABELAS.map(async (tabela) => [tabela, await carregarTabela(tabela, negocioId)])
  );
  const tabelas = Object.fromEntries(entradas);
  return montarEstado(tabelas);
}
