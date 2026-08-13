import { supabase } from "./supabase.mjs";
import { resultadoDoMes } from "../dominio/razao.mjs";

/* Resumo do mês corrente para a prateleira (docs/04 §2) — reaproveita o
   `resultadoDoMes` já testado (tests/razao.test.mjs), não reinventa a
   soma em SQL. Poucas consultas pequenas por negócio, aceitável pra
   "10 clientes bem feitos" (docs/03 §6) — não para escala; se um dia
   isso ficar lento, é hora de revisitar, não antes (docs/06 §11, mesmo
   raciocínio do teto de volume). */
export async function resumoDoMesAtual(negocioId) {
  const mes = new Date().toISOString().slice(0, 7);
  const inicio = `${mes}-01`;
  const fim = `${mes}-31`; // string ISO — comparação lexicográfica funciona mesmo em mês de 28/30 dias

  const [{ data: contasRaw }, { data: lancRaw }] = await Promise.all([
    supabase.from("contas").select("id, codigo, tipo").eq("negocio_id", negocioId),
    supabase.from("lancamentos").select("id, data").eq("negocio_id", negocioId).gte("data", inicio).lte("data", fim),
  ]);
  if (!lancRaw?.length) return { resultado: 0, temMovimento: false };

  const ids = lancRaw.map((l) => l.id);
  const { data: linhasRaw } = await supabase.from("lancamento_linhas").select("lancamento_id, conta_id, tipo, valor").in("lancamento_id", ids);

  const contas = (contasRaw || []).map((c) => ({ id: c.id, codigo: c.codigo, tipo: c.tipo }));
  const lancamentos = lancRaw.map((l) => ({ id: l.id, data: l.data }));
  const linhas = (linhasRaw || []).map((l) => ({ lancamentoId: l.lancamento_id, contaId: l.conta_id, tipo: l.tipo, valor: Number(l.valor) }));

  const r = resultadoDoMes(contas, lancamentos, linhas, mes);
  return { resultado: r.resultado, temMovimento: true };
}
