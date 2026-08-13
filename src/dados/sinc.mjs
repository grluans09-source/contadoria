/* ============================================================
   CONTADORIA — MOTOR DE SINCRONIZAÇÃO

   Adaptado de C:\Users\LUAN S\OneDrive\Documentos\sistema financeio,
   contlife-sinc.mjs (11/ago/2026). O algoritmo (calcularDiferenca,
   montarEstado, fotografar, mesmoConteudo) é o mesmo — só a declaração
   COLECOES muda de domínio, exatamente como previsto em
   docs/01_ANALISE_REAPROVEITAMENTO.md §2 (nota A: "copia quase intacto").

   UMA GENERALIZAÇÃO REAL EM RELAÇÃO AO ORIGINAL — não cosmética
   ------------------------------------------------------------
   No ContLife, a forma "lista" tinha a chave de identidade hardcoded em
   `.id` (dentro de `diferencaLista` e do ramo "lista" de `montarEstado`).
   Funcionava porque toda coleção-lista de lá era chaveada por `id`. Aqui
   não é: `lixeira` do Contadoria é chaveada por `lancamentoId` (o PK real
   da tabela é `lancamento_id`, não `id` — ver 0001_schema_inicial.sql).
   Forçar isso a caber em "id" seria mentira estrutural. Em vez de copiar
   o hardcode adiante, `forma: "lista"` ganhou um `chaveCampo` opcional
   (default "id") — a mesma função agora serve aos dois casos, sem
   duplicar lógica. Registrado aqui porque é exatamente o tipo de detalhe
   que se perde se só se copia sem entender.

   O QUE ELE FAZ E AS TRAVAS CONTRA CATÁSTROFE
   ------------------------------------------------------------
   Ver o comentário completo no arquivo de origem — a lógica de fundo é a
   mesma: comparar o estado ANTES (o que o servidor confirmou) com o
   estado DEPOIS (o que está em memória) e devolver as operações que
   levam um ao outro, com o freio de exclusão em massa (LIMITE_PERIGO)
   como última linha de defesa antes de qualquer `apagar` em lote.
   ============================================================ */

/* ── tradução de nome: camelCase (memória) → snake_case (banco) ── */
function paraSnake(nome) {
  return nome.replace(/[A-Z]/g, (letra) => "_" + letra.toLowerCase());
}

/* ── Descrição das coleções ──────────────────────────────────
   `campos` é a lista COMPLETA do que vai para o banco. Verificada contra
   o SQL real em tests/sinc.test.mjs — se alguém criar uma coluna e
   esquecer de listar aqui, o teste quebra.
   ────────────────────────────────────────────────────────────── */
export const COLECOES = {
  contas: {
    tabela: "contas",
    forma: "lista",
    campos: ["id", "codigo", "nome", "tipo", "subtipo", "ordem", "ativa"],
    padroes: { ordem: 0, ativa: true },
    chave: ["id"],
  },
  lancamentos: {
    tabela: "lancamentos",
    forma: "lista",
    campos: ["id", "data", "dataCompetencia", "descricao", "origem", "documento"],
    padroes: { descricao: "", origem: "manual" },
    chave: ["id"],
  },
  lancamentoLinhas: {
    tabela: "lancamento_linhas",
    forma: "lista",
    /* `descricao`/`vencimento` vieram em 0006_linha_descricao.sql,
       `baixaDe` em 0010_baixa_de.sql — o schema evolui por ALTER, nunca
       editando migração já aplicada (docs/06 §1). */
    campos: ["id", "lancamentoId", "contaId", "tipo", "valor", "descricao", "vencimento", "baixaDe"],
    chave: ["id"],
  },
  entradaItens: {
    tabela: "entrada_itens",
    forma: "lista",
    /* `contaOrigemId` veio em 0007_entrada_conta_origem.sql, depois da
       0001 — o schema evolui por ALTER (docs/06 §1). */
    campos: ["id", "origem", "data", "descricaoBruta", "valor", "situacao", "lancamentoId", "contaOrigemId"],
    padroes: { descricaoBruta: "", situacao: "pendente" },
    chave: ["id"],
  },
  regrasClassificacao: {
    tabela: "regras_classificacao",
    forma: "lista",
    campos: ["id", "padrao", "contaId", "acertos"],
    padroes: { acertos: 1 },
    chave: ["id"],
  },

  /* A lixeira guarda o lançamento inteiro (cabeçalho + linhas, como veio
     do estado em memória) na coluna `conteudo`. A chave é `lancamentoId`,
     não `id` — é o caso que motivou o `chaveCampo` (ver cabeçalho). */
  lixeira: {
    tabela: "lixeira",
    forma: "lista",
    chaveCampo: "lancamentoId",
    campos: ["lancamentoId", "conteudo", "excluidoEm"],
    chave: ["lancamento_id"],
  },

  /* Trilha de auditoria: só nasce, nunca morre (docs/06 §10). Comparação
     por IDENTIDADE de objeto, como no ContLife — o estado do React nunca
     muta os antigos no lugar. */
  trilha: {
    tabela: "trilha",
    forma: "trilha",
    apenasInsere: true,
  },

  /* Recorrentes — o template (cabeçalho) e suas pernas, mesmo desenho
     cabeçalho+linhas de lancamentos/lancamentoLinhas (docs/06 §1). */
  recorrentes: {
    tabela: "recorrentes",
    forma: "lista",
    campos: ["id", "descricao", "ativa"],
    padroes: { ativa: true },
    chave: ["id"],
  },
  recorrenteLinhas: {
    tabela: "recorrente_linhas",
    forma: "lista",
    campos: ["id", "recorrenteId", "contaId", "tipo", "valor"],
    chave: ["id"],
  },

  /* Carta de recomendações — uma por mês, chave é o próprio mês (texto
     "AAAA-MM"), mesmo raciocínio de `periodosFechados`: não precisa de
     id sintético quando a chave de domínio já é única (docs/08 §4). */
  cartas: {
    tabela: "cartas",
    forma: "lista",
    chaveCampo: "mes",
    campos: ["mes", "texto", "seguida"],
    padroes: { texto: "" },
    chave: ["mes"],
  },

  /* Array de "mes:AAAA-MM" ou "ano:AAAA" (docs/06 §5). */
  periodosFechados: {
    tabela: "periodos_fechados",
    forma: "conjunto",
    chave: ["tipo", "periodo"],
    partes: ["tipo", "periodo"],
  },

  /* Array de lancamento_id que já foram conferidos contra o extrato. */
  conciliacoes: {
    tabela: "conciliacoes",
    forma: "conjunto",
    chave: ["lancamento_id"],
    partes: ["lancamento_id"],
  },
};

/* Quanto uma exclusão precisa ser grande para ser suspeita. Os dois
   critérios valem JUNTOS — herdado do ContLife, mesmo raciocínio:
   apagar as 3 linhas de quem tem 3 é rotina; apagar 1.500 de quem tem
   2.000 não é. */
export const LIMITE_PERIGO = { minimoAbsoluto: 25, fracao: 0.5 };

/* ── Conversão de um registro em memória para linha do banco ────── */
function paraLinha(registro, campos, padroes) {
  const linha = {};
  for (const campo of campos) {
    const v = registro[campo];
    linha[paraSnake(campo)] = v === undefined || v === null ? (padroes?.[campo] ?? null) : v;
  }
  return linha;
}

/* Divide "parte1:parte2" no ÚLTIMO ":" — a segunda parte tem forma fixa
   no fim (mês ou ano), a primeira pode conter ":" sem quebrar nada. */
function partirChave(texto) {
  const corte = String(texto).lastIndexOf(":");
  return corte < 0 ? [String(texto), ""] : [texto.slice(0, corte), texto.slice(corte + 1)];
}

function mesmoRegistro(a, b) {
  if (a === b) return true; /* atalho: React preserva a identidade do que não mudou */
  return JSON.stringify(a) === JSON.stringify(b);
}

/* ── Diferença de uma lista chaveada por `chaveCampo` (default "id") ── */
function diferencaLista(desc, antes, depois, ops) {
  const chaveCampo = desc.chaveCampo || "id";
  const chaveDb = paraSnake(chaveCampo);
  const mapaAntes = new Map((antes || []).map((r) => [r[chaveCampo], r]));
  const mapaDepois = new Map((depois || []).map((r) => [r[chaveCampo], r]));

  for (const [chave, registro] of mapaDepois) {
    const anterior = mapaAntes.get(chave);
    if (!anterior || !mesmoRegistro(anterior, registro)) {
      ops.push({ acao: "gravar", tabela: desc.tabela, valores: paraLinha(registro, desc.campos, desc.padroes) });
    }
  }
  for (const chave of mapaAntes.keys()) {
    if (!mapaDepois.has(chave)) {
      ops.push({ acao: "apagar", tabela: desc.tabela, chave: { [chaveDb]: chave } });
    }
  }
}

/* ── Diferença da trilha de auditoria (só insere) ───────────
   Compara por IDENTIDADE de objeto: item novo é objeto novo. */
function diferencaTrilha(desc, antes, depois, ops) {
  const vistos = new Set(antes || []);
  for (const item of depois || []) {
    if (vistos.has(item)) continue;
    ops.push({
      acao: "gravar", tabela: desc.tabela,
      valores: { tipo: item.tipo ?? "", descricao: item.descricao ?? "" },
    });
  }
}

/* ── Diferença de um conjunto de strings ("tipo:periodo" ou "id" só) ── */
function diferencaConjunto(desc, antes, depois, ops) {
  const a = new Set(antes || []);
  const d = new Set(depois || []);
  const decompor = (texto) =>
    desc.partes.length === 1
      ? { [desc.partes[0]]: texto }
      : (([x, y]) => ({ [desc.partes[0]]: x, [desc.partes[1]]: y }))(partirChave(texto));

  for (const texto of d) if (!a.has(texto)) ops.push({ acao: "gravar", tabela: desc.tabela, valores: decompor(texto) });
  for (const texto of a) if (!d.has(texto)) ops.push({ acao: "apagar", tabela: desc.tabela, chave: decompor(texto) });
}

/* ── Quantos registros existiam antes (base do freio de perigo) ── */
function totalDe(antes) {
  let total = 0;
  for (const nome of Object.keys(COLECOES)) {
    const valor = antes?.[nome];
    if (Array.isArray(valor)) total += valor.length;
  }
  return total;
}

/**
 * Compara dois estados e devolve o que precisa ser feito no banco.
 * PURA: não toca em rede, relógio nem nada fora dos argumentos.
 *
 * @param {object} antes  estado como o banco o conhece (a última carga confirmada)
 * @param {object} depois estado atual em memória
 * @returns {{ops: Array, resumo: object, perigo: null|object}}
 */
export function calcularDiferenca(antes, depois) {
  const ops = [];
  for (const [nome, desc] of Object.entries(COLECOES)) {
    const a = antes?.[nome];
    const d = depois?.[nome];
    if (a === d) continue;

    if (desc.forma === "lista") diferencaLista(desc, a, d, ops);
    else if (desc.forma === "trilha") diferencaTrilha(desc, a, d, ops);
    else if (desc.forma === "conjunto") diferencaConjunto(desc, a, d, ops);
  }

  const apagados = ops.filter((o) => o.acao === "apagar").length;
  const gravados = ops.length - apagados;
  const total = totalDe(antes);
  const perigo =
    apagados >= LIMITE_PERIGO.minimoAbsoluto && total > 0 && apagados >= total * LIMITE_PERIGO.fracao
      ? { motivo: "exclusao_em_massa", apagados, total }
      : null;

  return { ops, resumo: { gravar: gravados, apagar: apagados }, perigo };
}

/* ── A VOLTA: linhas do banco → estado em memória ─────────────
   Inverso exato de `calcularDiferenca`, derivado da MESMA COLECOES. */
export function montarEstado(tabelas) {
  const estado = {};
  for (const [nome, desc] of Object.entries(COLECOES)) {
    const linhas = tabelas?.[desc.tabela] || [];
    if (desc.forma === "lista") {
      estado[nome] = linhas.map((linha) => {
        const registro = {};
        for (const campo of desc.campos) registro[campo] = linha[paraSnake(campo)];
        return registro;
      });
    } else if (desc.forma === "trilha") {
      estado[nome] = linhas.map((l) => ({ tipo: l.tipo, descricao: l.descricao }));
    } else if (desc.forma === "conjunto") {
      estado[nome] = linhas.map((l) => desc.partes.map((p) => l[p]).join(":"));
    }
  }
  return estado;
}

export const TABELAS = Object.values(COLECOES).map((c) => c.tabela);

/* Compara dois objetos ignorando a ORDEM das chaves — mesma razão do
   ContLife: o `jsonb` do Postgres reordena, `JSON.stringify` é sensível
   a isso. Usado para `negocios.configuracao`. */
export function mesmoConteudo(a, b) {
  const ordenar = (v) => {
    if (v === null || typeof v !== "object") return v;
    if (Array.isArray(v)) return v.map(ordenar);
    return Object.keys(v).sort().reduce((acc, k) => { acc[k] = ordenar(v[k]); return acc; }, {});
  };
  return JSON.stringify(ordenar(a)) === JSON.stringify(ordenar(b));
}

/* ── Recorte do estado que este módulo persiste ────────────────
   Copiar as REFERÊNCIAS (não clonar) mantém o atalho de identidade de
   `calcularDiferenca` — seguro porque o estado do React nunca é mutado
   no lugar. */
export function fotografar(estado) {
  const foto = {};
  for (const nome of Object.keys(COLECOES)) foto[nome] = estado?.[nome];
  return foto;
}
