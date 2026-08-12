# 05 · O Roteiro — o guia do serviço, e como ele vive dentro do sistema

> **11/ago/2026.** O dono pediu "um guia: quais dados eu preciso, a conversa inicial, por que
> cada dado importa, recomendação e um tutorial — do sistema e do serviço". A IA refinou a
> ideia antes de escrever; o refino está na §1 e **muda a forma de entrega**.
>
> Este documento também é **requisito**: a lista de dados da §4 define os campos do cadastro
> e da tela de abertura. Por isso ele vem **antes** do modelo de dados (doc `06`).

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

Duração alvo: **40 a 60 minutos**, uma vez só.

### Bloco 1 — Quem é

| Pergunta | Por que importa |
|---|---|
| Nome do negócio e como você quer ser chamado | tom da relação; aparece nos documentos |
| Tem CNPJ de MEI, ou é informal? | informal **não tem obrigação nenhuma** — o serviço vira 100% gerencial |
| **Quando você abriu o MEI?** | ⚠️ no **primeiro ano**, o limite de faturamento é **proporcional aos meses** de atividade. Quem abriu em julho tem metade do teto — e essa é uma das armadilhas que mais pega MEI desprevenido |
| Qual é a atividade principal? | define se o DAS leva **ICMS** (comércio/indústria), **ISS** (serviço) ou os dois — e em qual coluna a receita entra no relatório obrigatório |
| Tem funcionário? | MEI pode ter **1**. Se tem, aparecem folha e FGTS — o serviço é bem maior, e o preço deveria refletir |
| WhatsApp | é o canal real. Anotar como registro, não na cabeça |

### Bloco 2 — Como o dinheiro anda

**O bloco que decide quanto trabalho o cliente vai dar.** Vale fazer antes de fechar preço.

| Pergunta | Por que importa |
|---|---|
| Tem conta separada da pessoal? | decide qual dos três cenários (`03` §2) é. Conta misturada custa ~50% mais tempo por mês |
| Qual banco? Consegue exportar o extrato? | se sim, a conciliação é quase automática e você economiza a maior parte do trabalho |
| Recebe como — dinheiro, Pix, maquininha, boleto? | ⚠️ **maquininha tem duas pegadinhas**: a taxa é uma despesa que quase ninguém contabiliza (e come a margem em silêncio), e o dinheiro cai dias depois — a venda e o recebimento são **datas diferentes** |
| Vende fiado / a prazo? | decide se **contas a receber** existem. Se não vende, aquele pedaço do balanço nem aparece |
| Compra a prazo de fornecedor? | idem, para contas a pagar |
| Emite nota? Para empresa? | nota para PJ é obrigatória; para pessoa física, só se pedirem |

### Bloco 3 — A foto de hoje (o balanço de abertura)

**Todo cliente chega no meio da vida.** Sem esta foto, o livro nasce desequilibrado e a
Mesa de Revisão vai acusar erro para sempre — e você não vai entender por quê.

| Pergunta | Vira |
|---|---|
| Quanto você tem hoje, em dinheiro e na conta? | Caixa / Banco |
| O que o negócio tem que vale dinheiro? (forno, moto, máquina, computador) — e quanto valeria hoje | Imobilizado |
| Se tiver mercadoria parada, quanto vale mais ou menos? | Estoque (só valor total; detalhe fica para depois) |
| Quem te deve, quanto, e para quando? | Contas a receber |
| Quanto você deve, para quem, e quando vence? | Contas a pagar |
| Tem empréstimo ou financiamento? Saldo e parcela | Empréstimos |

**Como conduzir:** valor aproximado está de bom tamanho. Um número honesto e redondo vale
mais que a exatidão que trava a conversa — e tudo é corrigível depois, com rastro.

### Bloco 4 — O ritmo do negócio

| Pergunta | Por que importa |
|---|---|
| Quais contas você paga todo mês, e quanto? | viram **recorrentes** — lançadas sozinhas, e é o que faz o mês fechar rápido |
| Quanto costuma faturar por mês? | referência inicial e base do **ponto de equilíbrio** |
| Tem mês forte e mês fraco? | sazonalidade. Sem saber disso, você elogia um mês bom que era só o Natal |
| **Quanto você tira por mês pra viver?** | ⚠️ **quase ninguém sabe responder.** É a primeira coisa que você vai descobrir para ele — e costuma ser o momento em que o cliente entende para que serve o seu serviço |
| Quais os principais produtos/serviços e o preço | base da margem por item |

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

## 7. Como isso muda o que vai ser construído

| Item | Consequência |
|---|---|
| Roteiro do Cliente Novo | **tela guiada de cadastro**, em blocos, cada resposta virando registro — sobe de prioridade: é a primeira coisa que acontece com todo cliente |
| Balanço de abertura (Bloco 3) | resolve o buraco nº 2 do `SESSION_STATE`. **É uma tela, não um formulário** |
| Roteiro editável | tabela no banco, não texto no código (§1) |
| "Por que importa" | tabela de verbetes, engrenagem copiada do ContLife |
| Roteiro do Mês | vive no Painel do Mês, mostrando **em que dia do ciclo ele está** |
| Roteiro da Conversa | aparece junto das Entregas, como roteiro ao lado dos números |
| Recorrentes (Bloco 4) | já entram cadastradas na abertura — é o que faz o segundo mês ser rápido |

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
