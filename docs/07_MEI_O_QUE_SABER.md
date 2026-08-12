# 07 · MEI — o que saber antes de sentar com o cliente

> **11/ago/2026.** Base de conhecimento para o Luan. Não é a lei — é o que ele precisa ter
> na cabeça para conduzir a conversa sem ser pego de surpresa.
>
> ## ⚠️ Como ler este documento
>
> Ele tem **duas naturezas misturadas**, e confundir as duas é o risco:
>
> - **Estrutura** (como a coisa funciona) — muda raramente. Pode confiar.
> - 🔢 **Números** (limites, valores, prazos) — mudam por lei, sem aviso. **Todo item marcado
>   com 🔢 precisa ser conferido antes de ser dito a um cliente.**
>
> Os números vivem em `parametros_fiscais`, com fonte e data (`06` §6). Este documento
> ensina o **mecanismo**; o sistema guarda o **valor**.
>
> **Nunca diga um número de cabeça para um cliente.** "Deixa eu confirmar e te respondo hoje"
> é resposta profissional; chutar é o que destrói confiança — e um número errado sobre
> imposto tem consequência no bolso dele.

---

## 1. O que o MEI é, de verdade

Microempreendedor Individual. Um regime simplificado dentro do Simples Nacional (o
**SIMEI**), criado para tirar da informalidade quem trabalha por conta própria.

**Quatro fatos estruturais que você precisa saber de cor:**

1. **É empresário individual — não há separação de patrimônio.** Ele tem CNPJ, mas
   juridicamente a pessoa e a empresa são o mesmo patrimônio. **Dívida do negócio alcança os
   bens pessoais dele.** Muito cliente acha que o CNPJ é um escudo. Não é — e é você quem
   deve avisar, com calma, na primeira conversa.
2. **Paga valor fixo, não percentual.** Faturando zero ou faturando o teto, o DAS é o mesmo.
3. **Pode ter 1 empregado** 🔢. Se tem, aparecem folha, FGTS e eSocial — o serviço fica
   bem maior e o preço deveria acompanhar.
4. **A atividade precisa estar na lista de ocupações permitidas.** Várias profissões
   regulamentadas estão **fora** — inclusive contador. Se o cliente exerce algo que não está
   na lista, ele não pode ser MEI, ponto.

**Não pode ser MEI quem:** é sócio ou administrador de outra empresa · exerce ocupação fora
da lista · precisa de mais de um empregado · vai faturar acima do limite.

---

## 2. As obrigações — são só quatro

**É importante você saber que são poucas**, porque o cliente costuma achar que são muitas —
e porque isso define honestamente o que você está vendendo (`02` §2).

| Obrigação | Quando | Detalhe que pega gente |
|---|---|---|
| **DAS mensal** | vence dia 20 🔢 | atrasar gera juros **e** abre buraco na contagem previdenciária |
| **Relatório Mensal de Receitas Brutas** | até dia 20 do mês seguinte 🔢 | **é guardado, não enviado** — mas é obrigatório existir, com as notas anexas |
| **DASN-SIMEI** (declaração anual) | até 31 de maio 🔢 | **tem que declarar mesmo faturando zero** |
| **Nota fiscal** | na venda | obrigatória para **empresa**; para pessoa física só se pedirem |

Se tiver empregado, some folha, FGTS e eSocial. **Isso muda o tamanho do serviço** — trate
como outro produto.

---

## 3. O DAS — o que ele está pagando

Valor fixo mensal, composto de três pedaços 🔢:

| Pedaço | O que é | Quando entra |
|---|---|---|
| **INSS** | 5% do salário mínimo | sempre — é a contribuição previdenciária dele |
| **ICMS** | valor fixo pequeno | comércio, indústria, transporte de carga |
| **ISS** | valor fixo pequeno | prestação de serviço |

Atividade mista paga os dois. O INSS acompanha o salário mínimo — **então o DAS sobe todo
janeiro**, e todo janeiro algum cliente vai te perguntar por quê.

### A pergunta que você vai ouvir mais

> *"E se eu comprar isso pela empresa, desconta do imposto?"*

**Não.** O DAS é fixo. Despesa não abate nada, nota de compra não gera crédito, nada muda o
valor. Explicar isso **já é entrega** — e é o gancho perfeito para a frase que define seu
serviço:

> *"Sua despesa não muda o seu imposto. Mas muda o seu lucro — e é disso que eu cuido."*

---

## 4. O limite de faturamento — a parte mais perigosa

**Onde mora o maior risco do seu cliente, e a sua maior entrega.**

### O básico

Existe um teto de receita bruta por ano-calendário 🔢. Receita bruta é **tudo que entrou de
venda**, sem descontar nada — não é lucro.

### 🔴 A proporcionalidade do primeiro ano

Quem abre no meio do ano **não tem o teto cheio**. O limite é proporcional aos meses de
atividade, contando o mês da abertura. Quem abriu em julho tem cerca de metade.

Essa regra pega **muito** MEI desprevenido, e é o motivo de `data_abertura` ser campo
obrigatório no cadastro (`05` §4).

### 🔴 O que acontece se estourar — e por que avisar cedo importa tanto

Há **dois desfechos muito diferentes** 🔢:

| Estouro | O que acontece | Gravidade |
|---|---|---|
| **Até 20% acima do teto** | continua MEI até 31/12, paga a diferença, e é desenquadrado **a partir de 1º de janeiro do ano seguinte** | ruim, mas administrável |
| **Mais de 20% acima** | desenquadramento **retroativo a janeiro do próprio ano** — ele passa a ser tributado como Microempresa **desde o começo do ano** | 💣 conta retroativa de 12 meses |

**É por isso que o alerta de limite é a funcionalidade mais valiosa do sistema.** A diferença
entre avisar em setembro e descobrir em fevereiro pode ser alguns milhares de reais.

E é também o momento honesto de encaminhar: **desenquadrado, ele vira ME no Simples Nacional
e passa a precisar de contador registrado.** Você acompanha a transição, mas quem assina é
outra pessoa — e dizer isso antes de acontecer é o que faz ele confiar em você.

---

## 5. Aposentadoria e benefícios — a dúvida nº 1 do cliente

Quase nenhum MEI sabe responder isso, e quase nenhum prestador de serviço sabe explicar.
Saber isso te destaca.

**Contribuindo com os 5% do mínimo dentro do DAS, ele tem direito a** 🔢:

- **aposentadoria por idade** (não por tempo de contribuição)
- **auxílio-doença**
- **salário-maternidade**
- **pensão por morte** e **auxílio-reclusão** para os dependentes

**O que ele NÃO tem:** aposentadoria por tempo de contribuição. Para isso, precisa
**complementar** a contribuição (a diferença entre os 5% e os 20%), recolhendo em guia
separada 🔢.

**Duas coisas que você precisa avisar:**

1. **Benefício tem carência** 🔢 — auxílio-doença e salário-maternidade exigem alguns meses
   de contribuição antes de valerem. Quem abriu MEI ontem não está coberto hoje.
2. **DAS atrasado abre buraco na contagem.** Não é só juros: o mês não pago pode não contar
   para carência e para o tempo de contribuição. Isso costuma assustar mais que a multa — e
   é o argumento que faz o cliente parar de atrasar.

---

## 6. Os erros que você vai encontrar (em ordem de frequência)

Cada um é uma oportunidade de mostrar valor logo na primeira conversa.

| Erro | O que dizer |
|---|---|
| **Mistura conta pessoal com a da empresa** | o mais comum de todos. Não repreenda — mostre o número (`05` §5) |
| **Acha que o CNPJ protege o patrimônio pessoal** | não protege. Diga com calma, mas diga |
| **Acha que despesa abate imposto** | §3 |
| **Não guarda o relatório mensal** | é obrigatório existir, mesmo não sendo enviado |
| **Não emite nota para empresa** | obrigatório para PJ |
| **Não declara porque faturou zero** | declaração anual é obrigatória mesmo com receita zero |
| **Atrasa o DAS achando que "depois acerta"** | §5 — o argumento previdenciário funciona melhor que o da multa |
| **Atividade cadastrada não bate com o que faz** | pode invalidar o enquadramento. Vale conferir no cadastro |
| **Confunde faturamento com lucro** | §8 |

---

## 7. Trabalhador informal — o que muda

**Obrigação: nenhuma.** Seu serviço para ele é 100% gerencial, e isso é ótimo — sem prazo,
sem multa, sem risco fiscal.

**O que ele perde por não ter CNPJ:** não vende para empresa, não emite nota, não contribui
para o INSS (logo, não se aposenta por essa via), não acessa crédito de pessoa jurídica.

**A conversa "vale a pena formalizar?"** é uma das melhores consultorias que você vai
prestar, e a conta é simples de montar:

- **Custo:** o DAS mensal
- **Ganho:** cobertura previdenciária, poder vender para empresa, poder emitir nota, acesso a
  crédito PJ
- **Risco de continuar informal:** perder cliente PJ, e nenhuma proteção se ficar doente

Com os dados que você já tem no sistema, dá para responder isso com número, não com opinião.
**Guarde essa conversa para o segundo ou terceiro mês** — quando você já tiver mostrado o
faturamento real dele, o argumento se sustenta sozinho.

---

## 8. Vocabulário — o que ele diz × o que significa

Metade dos mal-entendidos com cliente pequeno é vocabulário. Traduza sempre.

| Ele diz | Ele quer dizer | O termo certo |
|---|---|---|
| "faturei 8 mil" | entrou 8 mil | **receita bruta** |
| "ganhei 8 mil" | quase sempre é o mesmo 8 mil | ⚠️ não é lucro |
| "sobrou 2 mil" | o que ficou na conta | **resultado**, e só se ele não tiver tirado nada |
| "meu salário" | o que ele retira | **retirada** — MEI não tem pró-labore formal |
| "a nota" | qualquer papel | pode ser nota, recibo, comprovante ou cupom |
| "meu dinheiro" | o dinheiro da empresa | **é a confusão que você existe para desfazer** |

**A tradução mais importante do seu serviço**, e vale repetir toda entrega:

> **Faturamento** é o que entrou. **Lucro** é o que sobrou depois de tudo. **Seu dinheiro** é
> o que você pode tirar sem quebrar o mês que vem. **São três números diferentes** — e a
> maioria das pessoas só conhece o primeiro.

---

## 9. Onde parar — o que encaminhar em vez de responder

Você é estudante, sem CRC (`02` §1). Isso não te impede de fazer o serviço, mas há perguntas
em que a resposta certa é **"isso eu não faço, e vou te indicar quem faz"**:

- desenquadramento e transição para Microempresa
- parcelamento de dívida fiscal, defesa em ação fiscal
- questão trabalhista (mesmo com o único empregado permitido)
- qualquer peça oficial assinada (ECD, ECF, SPED, balanço assinado)
- planejamento tributário para quem já não é MEI

**"Não sei, vou confirmar e te respondo hoje" é resposta profissional.** Chutar é o que
quebra a confiança — e em imposto, chute errado custa dinheiro ao cliente.

---

## 10. Antes do primeiro cliente

Conferir na legislação vigente e **registrar em `parametros_fiscais` com fonte e data**
(`06` §6) — nunca no código:

- [ ] limite anual de receita bruta e a regra de proporcionalidade do 1º ano
- [ ] valor e composição do DAS (INSS + ICMS e/ou ISS) por tipo de atividade
- [ ] prazos: DAS, relatório mensal, declaração anual
- [ ] quantos empregados o MEI pode ter
- [ ] as duas faixas de estouro do limite (até 20% / acima de 20%) e seus efeitos
- [ ] carências dos benefícios previdenciários
- [ ] a lista de ocupações permitidas (só conferir se a atividade do cliente está lá)

**Sugestão de rotina:** reconferir tudo isto **todo mês de janeiro**, quando o salário mínimo
muda e o DAS sobe junto. Marque no calendário — é a manutenção anual do seu serviço.
