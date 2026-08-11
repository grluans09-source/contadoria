# 00 · Norte — o ponto de partida deste projeto

> **Escrito em 10/ago/2026**, no fim da sessão que colocou o ContLife no ar.
> Este é o **primeiro documento deste projeto**. Ele existe para uma sessão nova começar com
> contexto, sem precisar redescobrir nada.
>
> **Nada foi construído ainda.** Não há código, não há banco, não há nome definitivo. O dono
> disse explicitamente que ainda vai desenvolver a ideia — **não presuma requisitos que não
> estão aqui.**

---

## 1. O que é este projeto

Um sistema **para pequenos negócios** (o exemplo dado foi **loja de roupa**), **para uso do
próprio dono**, para cuidar da parte contábil e gerencial de clientes pequenos.

Nas palavras dele:

- É construído **em paralelo** aos 3 meses de teste do ContLife — o ContLife **não para e
  não deve ser alterado** por causa deste projeto
- Ele mesmo levantou a ressalva: **"dentro do que eu posso, claro, enquanto estudante, já
  que não tenho certificado de contador"**
- Acredita que **muita coisa do ContLife pode ser reaproveitada**
- São **apps diferentes, mas com semelhanças**

**Este projeto é independente:** pasta própria, git próprio, banco próprio (quando houver).
O ContLife é **fonte de reaproveitamento**, não é a base sobre a qual isto roda.

---

## 2. Onde está o ContLife (a fonte de reaproveitamento)

```
C:\Users\LUAN S\OneDrive\Documentos\sistema financeio\
```

Leitura recomendada lá, nesta ordem, antes de decidir o que copiar:

| Arquivo | Para quê |
|---|---|
| `PROJECT_DOCS/30_ONDE_TUDO_ESTA.md` | mapa de onde tudo mora (site, banco, chaves, limites) |
| `PROJECT_DOCS/29_ARQUITETURA_BACKEND.md` | o backend inteiro: schema, RLS, transação, decisões |
| `PROJECT_DOCS/08_PADROES.md` | as armadilhas técnicas que já custaram horas |
| `PROJECT_DOCS/00_READ_FIRST.md` | porta de entrada da documentação |
| `contlife-sinc.mjs` | o motor de sincronização (402 linhas, genérico) |
| `contlife.jsx` | o app inteiro (10.361 linhas, arquivo único) |

⚠️ **Não altere nada dentro da pasta do ContLife.** Ele está no ar, em beta, prestes a
receber pessoas reais.

---

## 3. Mapa de reaproveitamento

### 3.1 Pega praticamente inteiro (o ouro)

| O quê | Onde no ContLife | Por que serve igual |
|---|---|---|
| **Motor de sincronização** | `contlife-sinc.mjs` | O algoritmo (`calcularDiferenca`, `montarEstado`, `fotografar`) é **100% genérico** — só a declaração `COLECOES` no topo é do ContLife. Troca a declaração, serve qualquer domínio. |
| **Transação no banco** | `supabase/migrations/0003_aplicar_lote.sql` | Recebe uma lista de operações e aplica numa transação só. Nada de finanças pessoais dentro. |
| **Isolamento por dossiê (RLS)** | `supabase/migrations/0001_schema_inicial.sql` | Toda tabela escopada por `dossier_id`, não `user_id`. **Isso já É a estrutura multiempresa** que um sistema de vários negócios precisa. |
| **Autenticação** | `TelaAutenticacao` (linha ~3279), `traduzErroAuth` | Cadastro, senha, link mágico, recuperação, erros traduzidos. Pronto. |
| **Primitivas de UI** | `Card`, `Button` (~4287), `Input`, `Label`, `Select` (~4266), `Tabs` (~4303), `StatCard` (~4178), `ZonaColapsavel` (~4120) | Sistema visual inteiro, já responsivo e auditado. |
| **Limite de Erro** | `LimiteDeErro` | Tela que quebra não derruba o app. |
| **Pipeline de build** | `package.json`, `scripts/bump.mjs`, `serve.mjs` | esbuild + importmap CDN + cache-buster + servidor local. |
| **Disciplina de teste** | `tests/sinc.test.mjs` | O padrão de conferir o código **contra o SQL real** — replicar. |

### 3.2 O motor contábil — serve, mas o plano de contas não

As funções são puras e valem para qualquer escrituração (partida dobrada é partida dobrada):

`trialBalance` (~442) · `balanceOf` (~533) · `computeStats` (~566) · `integrityCheck`
(~1790) · `explainEntry` (~1989) · fechamento de mês · lixeira de 30 dias · trilha de
auditoria

**O que muda:** o **plano de contas**. O do ContLife é da vida pessoal (Moradia,
Alimentação, Lazer, Salário). Um negócio precisa de outro: Receita de Vendas, **Estoque**,
**CMV**, Fornecedores, Impostos a Recolher, Pró-labore, Despesas Operacionais. Mesma
mecânica, contas diferentes.

### 3.3 Não serve (é identidade do ContLife)

- **A marca inteira**: Caduceu Vivo, os mascotes (Folgado/Razão/Arca), a paleta, as vozes.
  Sistema fechado e documentado — este projeto precisa da **identidade dele**.
- **Metáforas de vida pessoal**: Score, Idade Financeira, Você S.A., Carta do Sócio,
  Compêndio, Sala de Aula, Metas pessoais, Projeções de vida, membros da família.
- **Estrutura de planos/avaliação/fundador**: o ContLife tem isso porque vai ser vendido.
  Este é **para uso próprio** — provavelmente não precisa de nada disso, o que simplifica
  MUITO (sem trial, sem plano, sem Stripe, sem Porta).

### 3.4 O que este projeto precisa e o ContLife não tem

A parte **nova de verdade**:

- **Estoque** — comprar → estocar → vender → dar baixa no CMV. Numa loja de roupa é o
  coração. Envolve grade (tamanho/cor), custo médio, e é o que mais dá trabalho de acertar.
- **Vendas** com produto e quantidade, não só um valor solto
- **Clientes e fornecedores** com contas a receber/pagar e vencimento (aging)
- **Regime tributário** (MEI, Simples Nacional) — DAS, limite de faturamento, anexo
- **Notas fiscais** — no mínimo registrar; emitir é outro universo (integração SEFAZ)
- **Pró-labore vs distribuição de lucro** — separação que não existe em finança pessoal
- **Margem por produto/categoria** — a pergunta que todo lojista faz
- **Vários negócios ao mesmo tempo** — cuidar de mais de um cliente

Já prontos no ContLife e que servem direto: **Conciliação bancária**, **Importar extrato
(CSV/OFX)**, **Orçado x Realizado**, **DRE**, **Balanço**, **DFC**, **Fechamento de mês**,
**Recorrentes**, **Centros de resultado** (viram "lojas"/"canais"/"departamentos").

---

## 4. Como reaproveitar, na prática

**Copiar arquivos para cá, não importar de lá.** Este projeto não depende da pasta do
ContLife para rodar — se o ContLife mudar amanhã, este sistema não pode quebrar.

**Mas copie com registro.** Todo arquivo trazido do ContLife deve ganhar, no topo, um
comentário dizendo de onde veio e em que data. Sem isso, um bug corrigido lá nunca chega
aqui (e vice-versa), e os dois divergem em silêncio. Candidatos a virem quase intactos:
`contlife-sinc.mjs`, as primitivas de UI, `aplicar_lote.sql`, o pipeline de build.

**Banco:** projeto Supabase **novo e separado**. Não misturar dados de negócio com os dados
dos testadores do ContLife — a RLS ficaria mais complexa sem ganho, e o risco de vazamento
entre contextos apareceria de graça. (Conferir antes o limite de projetos do plano
gratuito; o ContLife já ocupa um.)

**Git:** este repositório é independente. Ainda **não tem remoto** — criar um no GitHub
quando fizer sentido, provavelmente privado, como o do ContLife.

---

## 5. Uma restrição de produto, não um sermão

O dono levantou sozinho: **estudante, sem CRC**. Isso não impede nada do que ele descreveu
(organizar, escriturar, gerar relatório gerencial), mas **é uma linha de desenho**:

- **Relatório gerencial** (para o dono do negócio decidir) — livre.
- **Peça oficial para o fisco** (ECD, ECF, SPED, DIRF, balanço assinado) — exige
  profissional registrado. O sistema **não deve emitir documento que se apresente como peça
  contábil oficial assinada**, nem induzir o cliente a achar que substitui o contador dele.

Traduzindo em produto: é **ferramenta de organização e gestão**, e todo documento emitido
deve deixar isso claro. É honesto e evita problema real.

---

## 6. Perguntas que a sessão nova DEVE fazer antes de codar

Não presuma nenhuma — o escopo ainda não está fechado:

1. **Um negócio ou vários?** (muda tudo na estrutura; o modelo por dossiê já resolve se for vários)
2. **Estoque entra na primeira versão?** É a parte mais cara de fazer certo. Dá pra começar
   sem, tratando compra como despesa direta, e adicionar depois.
3. **Regime tributário** — MEI? Simples? Define impostos, limites e relatórios.
4. **Quem digita** — só ele, ou o dono da loja também? Muda linguagem e permissões.
5. **De onde vêm os dados** — digitação, extrato, planilha, integração?
6. **Emite documento para o cliente?** Se sim, quais e com que aparência.
7. **Nome e identidade** — produto novo, marca nova. Não reciclar a do ContLife.
8. **Roda só no computador dele ou vai pra web com login?** (o backend do ContLife dá o
   caminho pronto se for web)

---

## 6.1 Prompt para abrir a sessão nova

Abra a sessão **nesta pasta**. O `CLAUDE.md` da raiz é lido automaticamente e já carrega
toda a disciplina de trabalho (arquiteto e não executor, escolha de modelo, documentação
obrigatória, salvar sem pedir, validar rodando, não tocar no ContLife). Por isso o prompt
pode ser curto:

```
Vou começar este sistema do zero. Leia docs/SESSION_STATE.md e docs/00_NORTE.md.

Depois analise o ContLife em:
C:\Users\LUAN S\OneDrive\Documentos\sistema financeio
(comece por PROJECT_DOCS/30_ONDE_TUDO_ESTA.md e PROJECT_DOCS/29_ARQUITETURA_BACKEND.md)

Me diga o que dá pra reaproveitar de verdade e o que é melhor refazer — e me faça
as 8 perguntas da seção 6 do NORTE antes de escrever qualquer código.
```

Se a sessão disser que não consegue ler a pasta do ContLife, é só autorizar o acesso a esse
diretório — ela vai pedir.

**Comece em Opus:** esta primeira etapa é desenho e julgamento (o que reaproveitar, como
modelar, qual escopo). Troque com `/model claude-opus-5` antes de colar.

---

## 7. Regras de trabalho herdadas (valem aqui também)

Vieram do ContLife e foram caras de aprender:

- **Modular e incremental** — nunca um bloco grande de mudança; validar cada passo
- **Provar rodando**, não por leitura
- **Testar o caso positivo E o negativo**
- **Corrigir a classe do problema**, não a ocorrência
- **Servidor de teste isolado**, nunca a porta que o dono usa de verdade
- **Segredo em arquivo gitignored**, nunca colado no chat nem em nome de arquivo

---

## 8. Estado atual

**Nada construído.** Este documento é tudo que existe. A próxima sessão deve:
1. Ler este arquivo
2. Ler os documentos do ContLife listados na seção 2
3. **Fazer as perguntas da seção 6** ao dono
4. Só então propor um desenho
