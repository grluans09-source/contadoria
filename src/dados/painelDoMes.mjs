import { supabase } from "./supabase.mjs";

/* Carrega tudo que o Painel do Mês precisa NUMA VOLTA de rede por
   tabela, não uma por negócio — a RLS (docs/06 §2) já limita cada
   consulta aos negócios do Luan, então não precisa de `negocio_id`
   explícito aqui; agrupar em memória é mais barato que N idas ao banco
   (mesma decisão de `resumoNegocio.mjs`, mas evitando o N+1 desta vez
   porque aqui já é natural buscar tudo de uma vez). */
export async function carregarPainelDoMes() {
  const mes = new Date().toISOString().slice(0, 7);
  const inicio = `${mes}-01`;
  const fimExclusivo = new Date(`${mes}-01T00:00:00Z`);
  fimExclusivo.setUTCMonth(fimExclusivo.getUTCMonth() + 1);
  const fim = fimExclusivo.toISOString().slice(0, 10);

  const [{ data: negocios, error: e1 }, { data: itens, error: e2 }, { data: periodos, error: e3 }] = await Promise.all([
    supabase.from("negocios").select("id, nome, apelido, situacao, configuracao"),
    supabase.from("entrada_itens").select("negocio_id, situacao, criado_em").gte("criado_em", inicio).lt("criado_em", fim),
    supabase.from("periodos_fechados").select("negocio_id").eq("tipo", "mes").eq("periodo", mes),
  ]);
  if (e1) throw new Error(`Falha ao carregar negócios: ${e1.message}`);
  if (e2) throw new Error(`Falha ao carregar a Caixa de Entrada: ${e2.message}`);
  if (e3) throw new Error(`Falha ao carregar períodos fechados: ${e3.message}`);

  const itensPorNegocio = new Map();
  for (const item of itens || []) {
    if (!itensPorNegocio.has(item.negocio_id)) itensPorNegocio.set(item.negocio_id, []);
    itensPorNegocio.get(item.negocio_id).push({ situacao: item.situacao });
  }

  const negociosComMesFechado = new Set((periodos || []).map((p) => p.negocio_id));

  return { negocios: negocios || [], itensPorNegocio, negociosComMesFechado, mes };
}
