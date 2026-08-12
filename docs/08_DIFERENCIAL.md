# 08 · O diferencial — o que faz o Contadoria não ser só "um sistema contábil"

> **11/ago/2026, em Opus.** O dono pediu: *"veja se tem algo realmente único e que me dê um
> diferencial"*. Este documento é a resposta, e é **crítica antes de ser proposta** — a §1
> diz o que o desenho ainda **não** tinha.

---

## 1. A crítica: até aqui, o desenho era muito bom e nada único

Vale começar sendo honesto. O que está desenhado nos documentos `01`-`07` é um sistema
contábil **bem-feito**: integridade garantida pelo banco, motor de sincronização com freio,
testes contra o SQL real, trilha de auditoria, fechamento com selo. Isso é qualidade acima
da média do mercado pequeno.

**Mas qualidade de engenharia é invisível para o cliente.** O MEI não vai contratar o Luan
porque o gatilho do banco recusa lançamento desequilibrado. Ele nem sabe o que é isso.

E as entregas listadas até aqui — DRE, balanço, fluxo, margem — são o que **todo** sistema
contábil entrega. Bem-feitas, mas não únicas.

**Faltava a resposta para: por que contratar ELE, e não o contador de R$ 80 do bairro?**

Este documento propõe **quatro coisas**. As três primeiras são para o cliente; a quarta é
para ele. Nenhuma exige tecnologia nova — todas saem de dados que o sistema já vai ter.

---

## 2. 🥇 "Quanto você pode tirar este mês" — o número que ninguém dá

**A proposta mais forte deste documento.**

Todo contador entrega **faturamento** e **lucro**. Nenhum entrega uma **prescrição**. E a
pergunta que o dono de negócio pequeno realmente faz, todo mês, é outra:

> *"Quanto eu posso tirar sem me ferrar mês que vem?"*

Ele decide isso **no chute**, todo mês, e é a decisão financeira mais importante que ele
toma. Errar significa não ter dinheiro para o fornecedor em duas semanas.

### Como se calcula

Tudo com dado que o sistema já terá:

```
   dinheiro em caixa e banco hoje
 + a receber com vencimento confiável nos próximos 30 dias
 − compromissos que vencem nos próximos 30 dias
     (fornecedores, parcelas, DAS, despesas fixas recorrentes)
 − reserva mínima (padrão: 1 mês de despesa fixa; ajustável por cliente)
 ─────────────────────────────────────────────────────────────
 = quanto dá para tirar este mês
```

### Como se entrega

Não como tabela. Como **frase**:

> **Você pode tirar R$ 2.100 este mês.**
> Você tem R$ 4.800 disponível, R$ 1.900 vence até o dia 30, e deixei R$ 800 de reserva.
> No mês passado você tirou R$ 3.400 — foi por isso que agosto apertou.

### Por que é um diferencial de verdade

- **É a única entrega que é uma decisão, não um retrato.** Todo o resto informa; esta
  resolve.
- **Justifica sozinha toda a chatice da escrituração.** O cliente não vê valor em mandar
  extrato todo mês — mas vê valor em receber esse número. É o que faz ele colaborar.
- **É a prova viva do "empresa × pessoa".** A conta só existe porque a retirada é conta de
  patrimônio (`06` §7), e não despesa.
- **Ninguém faz.** Contador de MEI entrega guia de DAS. Aplicativo de gestão entrega
  gráfico. Ninguém olha o cliente e diz um número com nome e sobrenome.

### ⚠️ As três honestidades obrigatórias

1. **É recomendação, não garantia.** O texto sempre diz "com base no que você me passou".
2. **Mostrar a conta, sempre.** As quatro parcelas do cálculo aparecem embaixo do número. Se
   o cliente esqueceu de contar uma dívida, ele mesmo vê onde.
3. **Errar para baixo.** A reserva existe para o número ser conservador. Um número otimista
   que quebra o cliente destrói a relação; um conservador só faz sobrar.

---

## 3. 🥈 O Retrato do Mês — uma página, não um relatório

**Princípio: o artefato é parte do produto.**

O que o MEI recebe hoje do contador dele, quando recebe: um PDF com tabelas, ou nada. O que
ele vai receber do Luan:

**Uma página só.** O resultado do mês em número grande, três frases, o "quanto você pode
tirar", e o alerta do limite se houver. O relatório completo existe atrás, para quem quiser
— mas **a entrega é a página.**

E ela usa a linguagem visual do ContLife: preto, ouro, marfim, ar de papel de convite
(`02` §5). Para um cliente que paga R$ 150 e nunca recebeu nada bonito na vida, o impacto é
desproporcional ao custo.

### Por que isso não é vaidade

Volta no gargalo real: **captação é o gargalo nº 1** (`03` §5). E o que gera indicação em
negócio pequeno é o cliente **mostrar para alguém**.

Ninguém mostra uma planilha para o cunhado. Mas mostra uma página bonita que diz, em letras
grandes, quanto ele ganhou no mês.

> **O Retrato do Mês é a peça de marketing que se paga sozinha** — e não custa nada além do
> cuidado de fazer uma página bem-feita em vez de um relatório feio.

---

## 4. 🥉 A memória do cliente — o dossiê que não esquece

Uma linha do tempo por cliente, guardando **tudo**: o que foi recebido e quando, o que foi
entregue, o que ele respondeu na abertura, cada recomendação da Carta — **e se foi seguida.**

O que isso permite dizer no ano 2:

> *"Em março você me disse que ia trocar de fornecedor. Trocou em maio. Sua margem subiu 4
> pontos desde então — foi a melhor decisão que você tomou no ano."*

**Isso é o que transforma guarda-livros em conselheiro.** E nenhuma operação pequena tem —
porque exige ter guardado, com disciplina, coisas que parecem irrelevantes na hora.

**Custo:** quase zero. A trilha, as respostas do roteiro e o histórico das cartas já estão no
modelo (`06` §9 e §10). Falta só **juntar numa tela** e acrescentar um campo: *"a
recomendação foi seguida?"*.

---

## 5. E para ele: o sistema que ensina enquanto trabalha

Já desenhado (`04` §10), mas vale nomear como diferencial — **dele, não do produto.**

Escriturando de verdade, com dinheiro real de cliente real, vendo a partida dobrada
traduzida centenas de vezes por mês, ele vai ter, em dois anos, **mais prática de
escrituração do que a maioria dos formandos.** Quando o CRC vier, ele não vai estar
começando — vai estar mudando de faixa.

**Isso é o que faz o pior cenário do `03` §6 não ser desperdício.**

---

## 6. O que faz ser "elite" no código

O dono pediu que o sistema fosse elite também por dentro. Traduzindo em regra, não em adjetivo:

| Princípio | Como se cumpre |
|---|---|
| **A integridade é do banco, não da tela** | débitos = créditos por gatilho; chaves estrangeiras reais; trilha append-only no cliente **e** no banco |
| **Modular desde o dia 1** | um conceito por arquivo. O ContLife virou 10.361 linhas num arquivo por deixar para depois (`01` §3.3) |
| **Português em tudo** | código, comentário, tela, commit. Herdado do ContLife |
| **Comentário explica o PORQUÊ** | o que a linha faz, lê-se na linha. Por que ela existe, não |
| **Teste que sabe falhar** | sabotar de propósito antes de confiar. Foi assim que 3 bugs reais apareceram no ContLife |
| **Caso negativo antes do positivo** | provar que o banco **recusa** lançamento torto antes de comemorar que aceita o certo |
| **Nada de número de lei no código** | `parametros_fiscais`, com fonte e data (`06` §6) |
| **Definição de pronto** | roda + testado nos dois sentidos + documentado + commitado. Sem os quatro, não está pronto |

### Estrutura de pastas proposta

```
contadoria/
  docs/                     esta documentação
  src/
    app/                    entrada, rotas, estado raiz
    ui/                     primitivas visuais e tema
    dominio/                motor contábil puro (sem React, testável no Node)
      lancamento.mjs        equilíbrio, validação
      razao.mjs             saldos, balancete
      demonstracoes.mjs     DRE, balanço, fluxo
      mei.mjs               limite, proporcionalidade, DAS
      disponivel.mjs        §2 — "quanto você pode tirar"
    dados/
      sinc.mjs              motor de sincronização (do ContLife)
      supabase.mjs          cliente e carga
    telas/                  uma tela por arquivo
  supabase/
    migrations/             o SQL, numerado
    conferir.mjs            lê o banco de verdade
  tests/                    testes em Node, sem navegador
```

**A regra que sustenta tudo:** `dominio/` **não importa React, nem Supabase, nem DOM.**
Entra dado, sai resultado. É o que permite testar a contabilidade inteira no Node, sem
navegador — e foi exatamente o que salvou o ContLife nas auditorias das Séries G e H.

---

## 7. O que isso muda na ordem de construção

| Item | Onde entra |
|---|---|
| **"Quanto você pode tirar"** (§2) | junto das Entregas (passo 9 do `06` §13). Depende de contas a pagar/receber existirem |
| **Retrato do Mês** (§3) | é a **forma** das Entregas, não um item a mais. Nasce junto |
| **Memória do cliente** (§4) | tela nova, depois do Painel do Mês. O dado já está sendo guardado desde o início |
| **Campo "recomendação seguida?"** | entra na Carta de recomendações desde a primeira versão — barato agora, impossível de recuperar depois |

⚠️ **A única coisa que precisa entrar cedo mesmo sem uso imediato:** guardar as
recomendações e se foram seguidas. Histórico não se cria retroativamente — ou se guarda
desde o primeiro mês, ou aquela conversa do ano 2 nunca vai existir.
