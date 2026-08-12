/* Prova, contra o banco de verdade, a trava mais importante do Contadoria
   (docs/06 §1 e §13 passo 2): NÃO EXISTE lançamento torto porque o banco
   recusa — não porque a tela impede.

   Padrão herdado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   supabase/testar-lote.mjs (11/ago/2026): roda como USUÁRIO AUTENTICADO de
   verdade, não pelo painel — porque `aplicar_lote` é `security invoker`, e
   testar como administrador não provaria nada sobre a RLS.

   REGRA DESTA SESSÃO: o teste NEGATIVO vem antes do positivo. Se este
   script não conseguir fazer o banco RECUSAR um lançamento torto, não
   importa quantos lançamentos certos ele aceite depois — a trava não
   está provada.

   Uso:  node supabase/testar-equilibrio.mjs                               */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const REF = "";
const ANON = "";
if (!REF || !ANON) {
  console.error("REF/ANON vazios: preencha com os dados do projeto Supabase do Contadoria.");
  process.exit(1);
}
const BASE = `https://${REF}.supabase.co`;

const EMAIL = "contadoria-teste@mailinator.com";
const SENHA = "senhaDeTeste123";

const token = fs.readFileSync(path.join(AQUI, ".access-token"), "utf8").trim();

let falhas = 0;
const ok = (nome) => console.log(`   ✓ ${nome}`);
const nok = (nome, detalhe) => { falhas++; console.error(`   ✗ ${nome}\n     ${detalhe}`); };

async function sqlAdmin(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(`SQL admin falhou (${r.status}): ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function rest(caminho, jwt, opcoes = {}) {
  const r = await fetch(`${BASE}${caminho}`, {
    ...opcoes,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
      ...(opcoes.headers || {}),
    },
  });
  const texto = await r.text();
  let corpo = null;
  try { corpo = texto ? JSON.parse(texto) : null; } catch { corpo = texto; }
  return { ok: r.ok, status: r.status, corpo };
}

const uid = () => Math.random().toString(36).slice(2, 10);

const lote = (jwt, negocio, ops) =>
  rest("/rest/v1/rpc/aplicar_lote", jwt, {
    method: "POST",
    body: JSON.stringify({ p_negocio: negocio, p_ops: ops }),
  });

/* ── preparo ───────────────────────────────────────────────── */
console.log("\n── Preparo ──");
await sqlAdmin(`update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = '${EMAIL}';`);
ok("e-mail do usuário de teste confirmado");

const entrada = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: ANON, "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: SENHA }),
});
const sessao = await entrada.json();
if (!sessao.access_token) { console.error("Não consegui entrar:", JSON.stringify(sessao).slice(0, 300)); process.exit(1); }
const JWT = sessao.access_token;
ok("entrou como usuário de verdade (JWT em mãos)");

const criado = await rest("/rest/v1/rpc/criar_negocio", JWT, {
  method: "POST",
  body: JSON.stringify({ p_nome: "Negócio de Teste — Trava de Equilíbrio" }),
});
if (!criado.ok) { console.error("criar_negocio falhou:", JSON.stringify(criado.corpo).slice(0, 300)); process.exit(1); }
const NEGOCIO = criado.corpo;
ok(`negócio de teste criado (${NEGOCIO})`);

// duas contas mínimas para lançar contra
await sqlAdmin(`
  insert into contas (negocio_id, id, codigo, nome, tipo) values
    ('${NEGOCIO}', 'caixa', '1101', 'Caixa', 'ativo'),
    ('${NEGOCIO}', 'receita', '4101', 'Receita de serviços', 'receita')
  on conflict do nothing;`);
ok("contas de teste inseridas");

/* ── TESTE NEGATIVO — o que este script existe para provar ─── */
console.log("\n── Teste negativo: lançamento TORTO precisa ser recusado ──");
const idTorto = uid();
const torto = await lote(JWT, NEGOCIO, [
  { acao: "gravar", tabela: "lancamentos", valores: { id: idTorto, data: "2026-08-12", descricao: "torto de propósito", origem: "manual" } },
  { acao: "gravar", tabela: "lancamento_linhas", valores: { id: uid(), lancamento_id: idTorto, conta_id: "caixa", tipo: "D", valor: 100 } },
  { acao: "gravar", tabela: "lancamento_linhas", valores: { id: uid(), lancamento_id: idTorto, conta_id: "receita", tipo: "C", valor: 90 } },
]);
if (torto.ok) {
  nok("lançamento desequilibrado (100 ≠ 90) foi ACEITO — a trava não está funcionando", JSON.stringify(torto.corpo).slice(0, 300));
} else {
  ok(`lançamento desequilibrado foi RECUSADO (HTTP ${torto.status}) — a trava funciona`);
}

/* confirma que nada do lote torto ficou gravado (tudo-ou-nada) */
const sobrouTorto = await rest(`/rest/v1/lancamentos?negocio_id=eq.${NEGOCIO}&id=eq.${idTorto}`, JWT);
if (Array.isArray(sobrouTorto.corpo) && sobrouTorto.corpo.length > 0) {
  nok("o lançamento torto ficou gravado parcialmente — a transação não foi atômica", JSON.stringify(sobrouTorto.corpo).slice(0, 300));
} else {
  ok("nada do lote torto ficou no banco — tudo ou nada, como esperado");
}

/* ── teste positivo — só depois do negativo provado ─────────── */
console.log("\n── Teste positivo: lançamento equilibrado precisa ser aceito ──");
const idCerto = uid();
const certo = await lote(JWT, NEGOCIO, [
  { acao: "gravar", tabela: "lancamentos", valores: { id: idCerto, data: "2026-08-12", descricao: "certo", origem: "manual" } },
  { acao: "gravar", tabela: "lancamento_linhas", valores: { id: uid(), lancamento_id: idCerto, conta_id: "caixa", tipo: "D", valor: 100 } },
  { acao: "gravar", tabela: "lancamento_linhas", valores: { id: uid(), lancamento_id: idCerto, conta_id: "receita", tipo: "C", valor: 100 } },
]);
if (certo.ok) ok("lançamento equilibrado foi aceito");
else nok("lançamento equilibrado foi recusado — bug na trava, falso positivo", JSON.stringify(certo.corpo).slice(0, 300));

/* ── armadilha 1: apagar o lançamento inteiro tem que funcionar ─ */
console.log("\n── Armadilha 1: apagar o lançamento inteiro (não deve acusar desequilíbrio do que já sumiu) ──");
const linhas = await rest(`/rest/v1/lancamento_linhas?negocio_id=eq.${NEGOCIO}&lancamento_id=eq.${idCerto}&select=id`, JWT);
const apagar = await lote(JWT, NEGOCIO, [
  ...linhas.corpo.map(l => ({ acao: "apagar", tabela: "lancamento_linhas", chave: { id: l.id } })),
  { acao: "apagar", tabela: "lancamentos", chave: { id: idCerto } },
]);
if (apagar.ok) ok("lançamento inteiro apagado sem erro (armadilha 1 coberta)");
else nok("apagar o lançamento inteiro falhou — a trava não está ignorando lançamento já apagado", JSON.stringify(apagar.corpo).slice(0, 300));

/* ── limpeza ──────────────────────────────────────────────── */
console.log("\n── Limpeza ──");
await sqlAdmin(`delete from negocios where id = '${NEGOCIO}';`); // cascade cuida do resto
ok("negócio de teste removido");

console.log(falhas === 0 ? `\n✅ TODOS OS TESTES PASSARAM (0 falhas)` : `\n❌ ${falhas} FALHA(S) — não seguir sem corrigir`);
process.exit(falhas === 0 ? 0 : 1);
