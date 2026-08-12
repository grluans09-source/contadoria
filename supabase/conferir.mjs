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

const REF = "";
if (!REF) {
  console.error("REF vazio: preencha a referência do projeto Supabase do Contadoria neste arquivo antes de rodar.");
  process.exit(1);
}

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

const tabelas = await q(`
  select c.relname as tabela, c.relrowsecurity as rls,
         (select count(*) from pg_policies p where p.tablename = c.relname) as politicas
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
   order by c.relname;`);

console.log(`TABELAS (${tabelas.length} de ${ESPERADAS.length} esperadas)`);
let semRls = 0, semPol = 0;
const achadas = new Set(tabelas.map(t => t.tabela));
for (const t of tabelas) {
  if (!t.rls) semRls++;
  if (Number(t.politicas) === 0) semPol++;
  console.log(`  ${t.rls ? "🔒" : "⚠️ "} ${t.tabela.padEnd(24)} políticas: ${t.politicas}`);
}
for (const esperada of ESPERADAS) {
  if (!achadas.has(esperada)) console.log(`  ❌ ${esperada.padEnd(24)} NÃO EXISTE no banco`);
}

const funcs = await q(`
  select p.proname, p.prosecdef as security_definer
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
   order by p.proname;`);
console.log(`\nFUNÇÕES (${funcs.length})`);
for (const f of funcs) console.log(`  ${f.security_definer ? "🔑 definer" : "   invoker"}  ${f.proname}`);

const gatilhos = await q(`
  select tgname, tgrelid::regclass::text as tabela, tgdeferrable, tginitdeferred
    from pg_trigger
   where not tgisinternal
   order by tgname;`);
console.log(`\nGATILHOS (${gatilhos.length})`);
for (const g of gatilhos) {
  console.log(`  ${g.tgname} em ${g.tabela}${g.tgdeferrable ? " (deferrable" + (g.tginitdeferred ? ", initially deferred)" : ")") : ""}`);
}

console.log(`\n${semRls === 0 ? "✓" : "⚠️ " + semRls} tabela(s) sem RLS · ${semPol === 0 ? "✓" : "⚠️ " + semPol} tabela(s) sem política`);
