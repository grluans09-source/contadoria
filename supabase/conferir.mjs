/* Copiado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   supabase/conferir.mjs (11/ago/2026), adaptado à lista de tabelas do
   Contadoria. Confere o que existe DE FATO no banco remoto: tabelas, RLS,
   políticas, funções e gatilhos — não presume que a migração aplicou
   igual ao que está no arquivo.

   Uso:  node supabase/conferir.mjs                                        */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const REF = "gmiiuklkhwjpcowvjbwz";

const token = fs.readFileSync(path.join(AQUI, ".access-token"), "utf8").trim();

const q = async (sql) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 400)}`);
  return r.json();
};

const ESPERADAS = [
  "negocios", "membros", "contas", "lancamentos", "lancamento_linhas",
  "periodos_fechados", "entrada_itens", "regras_classificacao",
  "roteiro_perguntas", "roteiro_respostas", "trilha", "lixeira",
  "conciliacoes", "parametros_fiscais",
];

/* Tabela de infraestrutura do PRÓPRIO aplicar-migracoes.mjs (não é dado
   de domínio, não vive em supabase/migrations/ — nasce ali mesmo, na
   primeira vez que o script roda). RLS ligada sem política nenhuma
   (graças ao "Enable automatic RLS") é o estado CERTO para ela: zero
   acesso via API, de propósito — só a API de gerenciamento a toca.
   Sem esta exceção, `conferir.mjs` acusaria "sem política/grant" para
   sempre, mesmo estando tudo certo. */
const INFRAESTRUTURA = ["_migracoes_aplicadas"];

const tabelas = await q(`
  select c.relname as tabela, c.relrowsecurity as rls,
         (select count(*) from pg_policies p where p.tablename = c.relname) as politicas,
         has_table_privilege('authenticated', c.oid, 'SELECT') as pode_ler,
         has_table_privilege('authenticated', c.oid, 'INSERT') as pode_gravar
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
   order by c.relname;`);

/* 0004_grants.sql existe porque "Automatically expose new tables" fica
   DESLIGADO no projeto (decisão de 12/ago) — sem o GRANT explícito, RLS
   correta não basta: o papel nem chega a tentar a operação. */
console.log(`TABELAS (${tabelas.length} de ${ESPERADAS.length} esperadas)`);
let semRls = 0, semPol = 0, semGrant = 0;
const achadas = new Set(tabelas.map(t => t.tabela));
for (const t of tabelas) {
  const infra = INFRAESTRUTURA.includes(t.tabela);
  if (!t.rls && !infra) semRls++;
  if (Number(t.politicas) === 0 && !infra) semPol++;
  if ((!t.pode_ler || !t.pode_gravar) && !infra) semGrant++;
  const rotulo = infra ? "🔧 infra, sem acesso via API de propósito" : `grant: ${t.pode_ler && t.pode_gravar ? "✓" : "❌ FALTA (ver 0004_grants.sql)"}`;
  console.log(`  ${t.rls ? "🔒" : "⚠️ "} ${t.tabela.padEnd(24)} políticas: ${t.politicas}  ${rotulo}`);
}
for (const esperada of ESPERADAS) {
  if (!achadas.has(esperada)) console.log(`  ❌ ${esperada.padEnd(24)} NÃO EXISTE no banco`);
}

const funcs = await q(`
  select p.proname, p.prosecdef as security_definer,
         has_function_privilege('authenticated', p.oid, 'EXECUTE') as pode_chamar
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
   order by p.proname;`);
console.log(`\nFUNÇÕES (${funcs.length})`);
for (const f of funcs) console.log(`  ${f.security_definer ? "🔑 definer" : "   invoker"}  ${f.proname.padEnd(28)} grant: ${f.pode_chamar ? "✓" : "❌ FALTA"}`);

const gatilhos = await q(`
  select tgname, tgrelid::regclass::text as tabela, tgdeferrable, tginitdeferred
    from pg_trigger
   where not tgisinternal
   order by tgname;`);
console.log(`\nGATILHOS (${gatilhos.length})`);
for (const g of gatilhos) {
  console.log(`  ${g.tgname} em ${g.tabela}${g.tgdeferrable ? " (deferrable" + (g.tginitdeferred ? ", initially deferred)" : ")") : ""}`);
}

console.log(`\n${semRls === 0 ? "✓" : "⚠️ " + semRls} tabela(s) sem RLS · ${semPol === 0 ? "✓" : "⚠️ " + semPol} tabela(s) sem política · ${semGrant === 0 ? "✓" : "⚠️ " + semGrant} tabela(s) sem grant`);
