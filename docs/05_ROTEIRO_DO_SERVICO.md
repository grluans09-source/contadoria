# 05 · O Roteiro — o guia do serviço, e como ele vive dentro do sistema

> **11/ago/2026.** O dono pediu "um guia: quais dados eu preciso, a conversa inicial, por que
> cada dado importa, recomendação e um tutorial — do sistema e do serviço". A IA refinou a
> ideia antes de escrever; o refino está na §1 e **muda a forma de entrega**.
>
> Este documento também é **requisito**: a lista de dados da §4 define os campos do cadastro
> e da tela de abertura. Por isso ele vem **antes** do modelo de dados (doc `06`).
>
> 📚 **Leitura de base, antes deste:** [`07_MEI_O_QUE_SABER.md`](07_MEI_O_QUE_SABER.md) — o
> que saber sobre MEI antes de sentar com um cliente. Ficou separado de propósito: aquele
> documento **envelhece por lei** e se atualiza sozinho; este, não.

---

## 1. O refino — por que "um guia" não é a resposta certa

Guia em documento tem um problema conhecido: **lê-se uma vez, na hora errada, e esquece.**
O próprio dono já registrou no `CLAUDE.md` que não vai lembrar de coisas assim. Um manual de
40 páginas seria escrever para o lixo.

O que ele precisa são **três camadas**, e só uma é documento:

| Camada | O que é | Onde vive |
|---|---|---|
| **1. Roteiro** | as perguntas na ordem certa, virando registro real enquanto ele pergunta | **dentro do sistema**, conduzindo a tela |
| **2. Por que importa** | a explicação de cada dado, uma por vez, no ponto de uso | **dentro do sistema**, sob demanda |
| **3. Manual** | o texto corrido, para estudar fora da hora do trabalho | documento (este) |

E o refino que faz a coisa durar:

> ### O Roteiro aprende.
> Toda vez que ele descobrir uma pergunta que faltava — porque um cliente trouxe uma
> situação que o roteiro não previa — ele **acrescenta ali mesmo**. Depois de 10 clientes, o
> roteiro não é mais o chute da IA: é o ofício dele, acumulado. É a diferença entre um
> manual que envelhece e um caderno de receitas que melhora.

**Consequência técnica:** o roteiro é **dado no banco**, não texto no código. Perguntas
editáveis, com ordem, bloco e um campo de "por que importa". Custa pouco e é o que permite
a camada 1 evoluir sem mexer no programa.

---

## 2. As três frentes do Roteiro

| Roteiro | Quando aparece | Responde |
|---|---|---|
| **Do Cliente Novo** | ao cadastrar um cliente | "o que eu pergunto, e em que ordem?" |
| **Do Mês** | no Painel do Mês | "o que eu faço, e quando?" |
| **Da Conversa** | ao gerar as entregas | "o que eu falo, e como explico?" |

---

## 3. Roteiro do Mês — o ritmo do serviço

Ninguém ensina isso a estudante, e é o que separa serviço que sobrevive de serviço que
atrasa: **ter um ritmo fixo, sempre igual.** Quando o mês tem forma, ele cabe.

| Dias | O que fazer | Onde no sistema |
|---|---|---|
| **1 a 5** | cobrar todo mundo | Painel do Mês → mensagem pronta |
| **5 a 12** | classificar o que chegou | Caixa de Entrada |
| **12 a 15** | conciliar, revisar, fechar o mês | Revisão → Fechamento |
| **15 a 18** | gerar as entregas e **conversar com cada cliente** | Entregas → Roteiro da Conversa |
| **até o 20** | conferir que todo mundo pagou o DAS | prateleira, coluna do DAS |

Fora do ritmo, dois momentos por ano: **janeiro** (virada de ano, limite zera) e **até 31 de
maio** (declaração anual de cada cliente).

**Recomendação forte:** cliente que atrasa a informação **não empurra o seu calendário** —
ele entra no ciclo do mês seguinte. Um contador pequeno morre quando deixa a bagunça do
cliente virar a agenda dele.

---

## 4. Roteiro do Cliente Novo — os dados, e por que cada um importa

Esta é a conversa inicial, na ordem em que deve acontecer. **Cada resposta vira registro
real no sistema**, não anotação solta — mesma ideia do onboarding guiado do ContLife, mas
com ele entrevistando o cliente.

**Antes de o roteiro começar, uma escolha que decide o resto.** Ao cadastrar o negócio
("Novo negócio", na Prateleira), você escolhe **o que ele faz para ganhar dinheiro** — um
dos **8 arquétipos**: revenda, produção própria, serviço com mão de obra, serviço
recorrente, digital, beneficiamento, intermediação, locação (`src/dominio/arquetipos.mjs`).
O arquétipo decide três coisas antes mesmo da primeira pergunta: **o plano de contas** que
nasce com o cliente, **quais campos aparecem no Bloco 3** (a foto de hoje) e **quais
perguntas extras aparecem no Bloco 4**. Sem essa escolha, o eletricista receberia "Estoque"
e não receberia "Material aplicado" — o erro que os arquétipos existem para corrigir
(`DECISOES.md` C7).

**O roteiro é adaptativo em duas camadas, e as duas decidem o que você vê:**

1. **Por tipo e arquétipo** — uma pergunta só aparece se valer para aquele cliente. "Quando
   você abriu o MEI?" some para o informal; "Cobra o deslocamento até o cliente?" só aparece
   para quem vive de mão de obra. Pergunta sem tipo nem arquétipo marcado vale para todo
   mundo — é o caso comum, e é assim que a maioria das perguntas fica.
2. **Essencial × aprofundamento** — dentro do que vale para aquele cliente, uma parte é
   **essencial** (perguntada na primeira conversa; o livro não nasce certo sem ela) e outra
   é **aprofundamento** (fica para os meses seguintes — sazonalidade, produtos e preços, a
   objeção do informal sobre abrir CNPJ). Entrevista longa faz cliente desistir antes de
   fechar; por isso a primeira conversa cobre só o essencial (`DECISOES.md` E3).

**Duração alvo da primeira conversa: 30 a 45 minutos** — mais curta do que antes, porque o
aprofundamento ficou para depois.

**Alternativa não presencial — o Formulário Público.** Nem sempre dá para sentar junto. Você
pode gerar um link com token e mandar pelo WhatsApp: o cliente responde sozinho, do celular,
no tempo dele. É **retomável** — salva a cada resposta, então ele pode fechar no meio e
voltar depois — e vale por **30 dias**. Cobre os **Blocos 1 a 5**; o **Bloco 6 fica de fora
de propósito**, porque o combinado é negociação olhando no olho, não coleta por formulário.
O balanço de abertura (Bloco 3) entra: em linguagem simples o cliente costuma saber responder
quanto tem na carteira e quem lhe deve, e valor aproximado já resolve. É também o que torna o
Diagnóstico Gratuito escalável (`11_GO_TO_MARKET.md` §5) — mandar o mesmo link para vários
candidatos de uma vez.

### Bloco 1 — Quem é

| Pergunta | Por que importa |
|---|---|
| Nome do negócio e como você quer ser chamado | tom da relação; aparece nos documentos |
| Tem CNPJ de MEI, ou é informal? | decide o resto do roteiro: as perguntas de MEI abaixo somem para o informal, e entram outras no lugar |
| **Quando você abriu o MEI?** *(só MEI)* | ⚠️ no **primeiro ano**, o limite de faturamento é **proporcional aos meses** de atividade. Quem abriu em julho tem metade do teto — e essa é uma das armadilhas que mais pega MEI desprevenido |
| Qual é a atividade principal? *(só MEI)* | define se o DAS leva **ICMS** (comércio/indústria), **ISS** (serviço) ou os dois — e em qual coluna a receita entra no relatório obrigatório |
| Tem funcionário? *(só MEI)* | MEI pode ter **1**. Se tem, aparecem folha e FGTS — o serviço é bem maior, e o preço deveria refletir |
| Você vende para empresa, ou só para pessoa física? *(só informal)* | é o que trava o crescimento do informal: sem CNPJ ele não emite nota, e sem nota não vende para empresa. É o gancho da conversa sobre formalizar |
| Já pensou em abrir CNPJ? O que te segura? *(só informal, aprofundamento)* | guarda a objeção real dele para a conversa do 2º ou 3º mês, quando o argumento se sustenta sozinho com número em vez de opinião |
| WhatsApp | é o canal real. Anotar como registro, não na cabeça |

### Bloco 2 — Como o dinheiro anda

**O bloco que decide quanto trabalho o cliente vai dar.** Vale fazer antes de fechar preço.

| Pergunta | Por que importa |
|---|---|
| Tem conta separada da pessoal? | decide qual dos três cenários (`03` §2) é. Conta misturada custa ~50% mais tempo por mês |
| **Você usa o mesmo dinheiro para o negócio e para as suas coisas?** | ⚠️ **a pergunta mais importante do bloco.** Se sim, liga `negocios.dinheiro_misturado` — e o sistema passa a tratar **todo** o dinheiro como sendo do negócio: cada gasto pessoal vira uma **retirada de verdade** (lançamento real), não mais "é pessoal, ignorar". E dinheiro pessoal **entrando** vira **aporte**, não receita — senão infla o faturamento e pode disparar alarme falso do teto do MEI. É o que faz o saldo bater com a realidade e revela, no fim do mês, quanto ele tirou de fato (`DECISOES.md` C5) |
| Qual banco? Consegue exportar o extrato? | se sim, a conciliação é quase automática e você economiza a maior parte do trabalho |
| Recebe como — dinheiro, Pix, maquininha, boleto? | ⚠️ **maquininha tem duas pegadinhas**: a taxa é uma despesa que quase ninguém contabiliza (e come a margem em silêncio), e o dinheiro cai dias depois — a venda e o recebimento são **datas diferentes** |
| Vende fiado / a prazo? | decide se **contas a receber** existem. Se não vende, aquele pedaço do balanço nem aparece |
| Compra a prazo de fornecedor? | idem, para contas a pagar |
| Emite nota? Para empresa? | nota para PJ é obrigatória; para pessoa física, só se pedirem |

### Bloco 3 — A foto de hoje (o balanço de abertura)

**Todo cliente chega no meio da vida.** Sem esta foto, o livro nasce desequilibrado e a
Mesa de Revisão vai acusar erro para sempre — e você não vai entender por quê.

**Os campos comuns valem para todo mundo. O arquétipo acrescenta os dele.** Um vendedor de
revenda vê "mercadoria parada"; quem manda peça para beneficiar em terceiro vê também
"mercadoria com terceiro" (o que saiu da mão dele mas ainda é dele); quem vende pela internet
vê "saldo parado em plataforma". A lista completa por arquétipo está em `camposAbertura`,
dentro de `src/dominio/arquetipos.mjs`.

| Pergunta | Vira |
|---|---|
| Quanto você tem hoje, em dinheiro e na conta? | Caixa / Banco |
| O que o negócio tem que vale dinheiro? (forno, moto, máquina, computador) — e quanto valeria hoje | Imobilizado |
| *(o campo específico do arquétipo, quando existir — mercadoria parada, saldo em plataforma, mercadoria com terceiro…)* | a conta que o arquétipo definiu |
| Quem te deve, quanto, e para quando? | Contas a receber |
| Quanto você deve, para quem, e quando vence? | Contas a pagar — ver classificação abaixo |
| Tem empréstimo ou financiamento? Saldo e parcela | Empréstimos — mesma classificação |

**Toda dívida se classifica em um de três tipos** (`src/dominio/dividas.mjs`,
`DECISOES.md` C6) — e o do meio é o mais comum e o mais fácil de errar:

| Tipo | Exemplo | Entra no livro? |
|---|---|---|
| **Do negócio** | fornecedor, empréstimo no CNPJ, cartão da empresa | sim |
| **Pessoal, mas o dinheiro entrou no negócio** | empréstimo no nome dele para comprar a moto de entrega, o forno, o estoque | **sim** — juridicamente é dele, mas quem paga a parcela é o caixa do negócio |
| **Só pessoal** | financiamento da casa, cartão usado em compra pessoal | não entra no livro — mas fica **anotado**, porque muda quanto ele precisa tirar por mês para viver |

Deixar a segunda de fora faz o "quanto você pode tirar" **mentir para cima** — e é
justamente o número que não pode.

**Como conduzir:** valor aproximado está de bom tamanho. Um número honesto e redondo vale
mais que a exatidão que trava a conversa — e tudo é corrigível depois, com rastro.

### Bloco 4 — O ritmo do negócio

| Pergunta | Por que importa |
|---|---|
| Quais contas você paga todo mês, e quanto? | **vira cadastro real de recorrentes** (`recorrentes` + `recorrente_linhas`) — não mais texto solto jogado fora. É o que faz o segundo mês fechar rápido (`DECISOES.md` F8, §7 abaixo) |
| Quanto costuma faturar por mês? | referência inicial e base do **ponto de equilíbrio** — e vira parte do retrato de entrada (§4.1) |
| **Quanto você tira por mês pra viver?** | ⚠️ **quase ninguém sabe responder.** É a primeira coisa que você vai descobrir para ele — e costuma ser o momento em que o cliente entende para que serve o seu serviço |
| Quantas horas por semana você trabalha nisso? | com a retirada, o sistema calcula quanto vale a **hora dele** e compara com o salário mínimo por hora (`src/dominio/valorDoTempo.mjs`) — um dos números mais duros que ele vai ver |
| Tem mês forte e mês fraco? *(aprofundamento)* | sazonalidade. Sem saber disso, você elogia um mês bom que era só o Natal |
| Quais os principais produtos/serviços e o preço *(aprofundamento)* | base da margem por item |

**Depois dessas, o arquétipo acrescenta as dele.** Só aparecem para quem se aplica —
detalhadas em `roteiro_perguntas` e resumidas aqui:

| Arquétipo | Pergunta extra que só ele vê |
|---|---|
| Revenda | Quanto paga pelo que revende, em relação ao preço de venda? Tem mercadoria parada há muito tempo? |
| Produção própria | Quanto de insumo entra em cada produto? Quanto perde por mês com quebra, sobra ou produto estragado? |
| Serviço com mão de obra | Cobra o deslocamento até o cliente? O material é por sua conta ou o cliente compra? Quantos dias fica sem serviço nenhum? |
| Serviço recorrente | Quantos clientes fixos, e quanto cada um paga? Costuma ter cliente atrasando a mensalidade? |
| Digital | Vende por qual plataforma, e qual a taxa dela? Quanto é recorrente e quanto é avulso? Gasta com anúncio? |
| Beneficiamento | Quanto tempo a mercadoria fica com o terceiro? Costuma ter perda ou peça que volta com defeito? |
| Intermediação | Você recebe o valor cheio e repassa, ou só a sua comissão? Qual o percentual? |
| Locação | Quantos dias por mês cada equipamento fica alugado? Quanto gasta de manutenção? |

Cada uma existe para destravar um achado específico daquele tipo de negócio — a lista
completa, com o "por quê" de cada uma, está na migração `0011_arquetipos.sql` e em
`arquetipos.achados`.

### Bloco 5 — O que ele quer

Cinco minutos, e define a consultoria do ano inteiro.

- *O que mais te incomoda hoje na parte do dinheiro?*
- *Você sabe se está ganhando dinheiro?* — a resposta quase sempre é "acho que sim"
- *Tem alguma meta? Comprar equipamento, contratar, abrir outro ponto?*

Vira o foco da **Carta de recomendações** todo mês. Sem isso, a consultoria vira relatório
genérico e o cliente não vê valor.

### Bloco 6 — O combinado (proteção sua)

| Combinar | Por quê |
|---|---|
| Como e até quando ele manda a informação | sem prazo combinado, você vira o chato |
| O que você entrega, e quando | expectativa clara |
| Quanto, e como ele paga | óbvio, e todo iniciante esquece |
| **O que você NÃO faz** | ver abaixo — é o mais importante |

**A lista do "não faço", dita em voz alta na primeira conversa:**

- não emito nota fiscal por você
- não acesso sua conta bancária
- não assino peça contábil oficial (ECD, ECF, SPED, balanço assinado) — sou **estudante,
  ainda sem CRC**; o que entrego é **relatório gerencial**
- não falo com a Receita por você

Isso não te diminui: **delimita.** Cliente com expectativa errada vira problema no terceiro
mês, e sempre por algo que ninguém combinou. E é exatamente o que mantém você dentro do seu
limite profissional (`02_ESCOPO.md` §2) sem precisar improvisar uma explicação depois.

**E o inverso — o que dizer que você faz:** *"eu organizo o seu dinheiro e te digo, todo mês,
se o negócio está ganhando, quanto você pode tirar, e o que está te comendo por dentro."*

### 4.1 O retrato de entrada — o que fica congelado no fim

Ao concluir o roteiro (seja na conversa presencial, seja pelo Formulário Público), o sistema
grava, **uma única vez**, o **retrato de entrada** (`negocios.retrato_de_entrada`,
`src/dominio/linhaDeBase.mjs`).

O instinto seria guardar números — mas o número da abertura já está no livro. O que **some
para sempre**, se não for capturado agora, é a outra metade: **o que ele ACREDITAVA**. Por
isso o retrato tem dois lados:

- **Declarado** — o que ele respondeu: faturamento, retirada, horas por semana, se acha que
  ganha dinheiro
- **Medido** — o que o balanço de abertura mostrou de verdade

É a distância entre os dois que sustenta a frase mais forte do serviço, meses depois:

> *"Quando começamos, você me disse que tirava R$ 2.000,00 por mês. O que os números mostram
> é R$ 4.100,00 — R$ 2.100,00 a mais do que você imaginava."*

**É write-once, travado por gatilho no banco** — não só na tela. Se ficasse só no app,
qualquer caminho novo (importação, correção, script) poderia sobrescrever sem querer, e a
linha de base deixaria de ser linha de base (`DECISOES.md` F3). Uma vez gravado, **nada**
recalcula esse campo — nem você, editando o cadastro depois.

---

## 5. Roteiro da Conversa — entregando o mês

Gerou o pacote, agora vem a parte que é o produto. **Sempre a mesma ordem, sempre três
minutos antes de qualquer número:**

1. **O que aconteceu** — entrou X, saiu Y, sobrou Z
2. **Para onde foi o que sobrou** — a pergunta do balanço (`04` §9.1). É onde ele mais se
   surpreende
3. **Uma coisa boa** — sempre existe, e é o que faz ele continuar mandando informação
4. **Uma coisa para arrumar** — uma só. Duas viram nenhuma
5. **O que vem por aí** — o que vence, e como está o limite do ano

### Situações difíceis, com resposta pronta

| Situação | O que dizer |
|---|---|
| **Mês ruim** | mostrar a comparação com os meses anteriores antes do número do mês. Um mês ruim isolado assusta; dentro da série, informa |
| **Ele mistura tudo** | não repreender. Mostrar o número: *"você tirou R$ 4.100 esse mês, e o negócio gerou R$ 2.800"*. O número faz o sermão sozinho, e melhor |
| **Não mandou nada** | *"não consigo fechar seu mês sem isso — vou juntar com o mês que vem"*. Uma vez. Duas vezes seguidas, é conversa sobre o combinado |
| **"Isso não dá pra descontar do imposto?"** | MEI paga **valor fixo**; despesa não abate. É gerencial, não fiscal — e explicar isso já é entrega |
| **Está chegando no limite** | avisar **cedo**, com a projeção. Explicar que passar do teto significa sair do MEI e precisar de contador registrado — e que você ajuda na transição |

---

## 6. A camada 2 — "por que isso importa", dentro do sistema

Ao lado de cada campo, um botão discreto que abre **um parágrafo**. Não é ajuda genérica:
diz **o que aquele dado desbloqueia**.

```
Data de abertura do MEI                    [ por que isso importa? ]

  No primeiro ano, o limite de faturamento não é o cheio — é proporcional
  aos meses em que a empresa existiu. Quem abriu em julho tem cerca de
  metade do teto. Sem essa data, o alerta de limite avisa tarde demais.
```

O ContLife já tem essa peça pronta (os verbetes e o `openVerbete`) — vem junto. **A
diferença de propósito:** lá explica contabilidade para leigo; aqui explica **para que serve
o dado**, para um estudante de contabilidade. É outro texto, mesma engrenagem.

---

## 7. Onde cada peça vive no sistema, hoje

| Item | Onde vive |
|---|---|
| Roteiro do Cliente Novo | `src/telas/ClienteNovo.jsx` — tela guiada em **6 blocos**, cada resposta virando registro real. Primeira coisa que acontece com todo cliente novo |
| Roteiro adaptativo (tipo, arquétipo, essencial) | `src/dominio/roteiro.mjs` — filtra as perguntas de `roteiro_perguntas`; usado tanto pela entrevista presencial quanto pelo Formulário Público, para os dois nunca divergirem |
| Formulário Público | `src/telas/FormularioPublico.jsx` + `formulario_abrir` / `formulario_responder` / `formulario_concluir` no banco (`DECISOES.md` E4) — a única porta do sistema sem login |
| Balanço de abertura (Bloco 3) | tela dedicada dentro do `ClienteNovo.jsx`, campos montados a partir do arquétipo (`camposAberturaDe`) |
| Recorrentes (Bloco 4) | vira cadastro real em `recorrentes` / `recorrente_linhas` ao concluir o roteiro (`DECISOES.md` F8) — é o que faz o segundo mês ser rápido |
| Retrato de entrada | `src/dominio/linhaDeBase.mjs`, gravado ao fim do roteiro, write-once (§4.1) |
| Roteiro editável | tabela `roteiro_perguntas` no banco, não texto no código (§1) |
| "Por que importa" | tabela de verbetes, engrenagem copiada do ContLife |
| Roteiro do Mês | vive no Painel do Mês, mostrando **em que dia do ciclo ele está** |
| Roteiro da Conversa | aparece junto das Entregas, como roteiro ao lado dos números |
| Aba Roteiro (aprofundamento) | `src/telas/Roteiro.jsx`, dentro do Livro — todas as perguntas do cliente, respondidas e pendentes, editáveis a qualquer momento. Entregas avisa quantas de aprofundamento faltam antes da conversa do mês (`DECISOES.md` F9) |

---

## 8. O que ainda precisa ser conferido

⚠️ Antes do primeiro cliente real, conferir na legislação vigente (e registrar na tabela de
parâmetros, `02_ESCOPO.md` §2):

- limite anual do MEI e **a regra de proporcionalidade no primeiro ano**
- valor e composição do DAS (INSS + ICMS e/ou ISS) por tipo de atividade
- quantos empregados o MEI pode ter
- prazos: relatório mensal e declaração anual

**Nada disso vai escrito no código.** Muda por lei, e código com número de lei dentro é
bomba-relógio.
