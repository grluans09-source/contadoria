# 04 · Mapa do Contadoria — o que tem dentro e como se usa

> **11/ago/2026.** Escrito em linguagem natural, a pedido do dono, para ele entender o
> sistema antes de existir código. **Isto é o desenho, não a implementação** — mas é o
> contrato: se algo for construído diferente daqui, este documento é corrigido junto.
>
> Uma coisa atravessa o mapa inteiro e é decisão de produto, não detalhe: **o sistema nunca
> esconde a contabilidade.** Ver §10.

---

## 1. A ideia em uma frase

Uma **prateleira de pastas**. Cada pasta é um cliente. Você abre a pasta, joga dentro o que
ele te mandou, o sistema organiza em livro contábil de verdade, e no fim do mês sai a
entrega — mais o que você tem a dizer pra ele.

---

## 2. Entrar — a prateleira

Você entra com e-mail e senha. Cai numa lista com **todos os seus clientes**, e ao lado de
cada um o que importa saber de relance:

| Coluna | Por que está aí |
|---|---|
| Nome / apelido | quem é |
| Movimento do mês | se está vazio, ele não mandou nada |
| Faturamento acumulado no ano vs. limite MEI | o alerta que vale ouro (`02_ESCOPO.md` §2) |
| DAS do mês | pago / em aberto / vencido |
| Situação do mês | falta informação · classificando · fechado |

**Como você usa:** essa tela responde em 5 segundos "onde eu tenho que trabalhar hoje".

---

## 3. O Painel do Mês — a cobrança

A tela que ataca o gargalo nº 2 (`03_CENARIOS_E_CAPACIDADE.md` §5.1). Mostra, de todos os
clientes ao mesmo tempo, **quem mandou e quem não mandou**, com as pendências em lista:

```
Salgados da Léia ······ falta: extrato de julho, notas da semana 3
Zé Elétrica ··········· falta: NADA — pronto pra fechar
Ateliê da Nanda ······· falta: TUDO — nada chegou este mês
```

E um botão que monta a mensagem de cobrança pronta, com o nome e o que falta, pra você
colar no WhatsApp.

**Como você usa:** dia 5 de cada mês, abre isso, dispara as cobranças em 10 minutos, e
esquece. Sem essa tela, cobrança vira memória — e memória falha justamente com o cliente
que menos manda.

---

## 4. A pasta do cliente

Abriu a pasta, você está **dentro daquele negócio** — e daí em diante tudo na tela é só
dele. O cabeçalho mostra o nome, para você nunca lançar no cliente errado.

Dentro tem: o que ele é (CNPJ, atividade, desde quando), a Caixa de Entrada, o livro, a
revisão, o fechamento e as entregas.

---

## 5. A Caixa de Entrada — onde a bagunça vira contabilidade

**A peça mais importante da v1.** É a mesa onde você despeja o que chegou e transforma em
lançamento.

**O que entra aqui:**
- extrato do banco (CSV/OFX) — importador já pronto no ContLife
- lista de vendas que o cliente mandou
- foto de nota
- o que ele falou por áudio, que você digita como resumo do dia

**Como funciona na prática:** cada item vira uma linha esperando decisão. Para cada uma,
três botões e um campo:

- **classificar** — o sistema **sugere** ("isso parece Energia elétrica, como no mês
  passado"), você confirma ou troca
- **é pessoal, ignorar** — o botão do cenário de conta misturada. Tem que ser tão rápido
  quanto o de classificar
- **não sei ainda** — vai para uma pilha de dúvidas, para você perguntar ao cliente junto

**O que o sistema faz sozinho:** repete o que você já ensinou. Se "POSTO IPIRANGA" virou
Combustível três vezes, na quarta ele já vem preenchido. Depois de dois meses, a maior
parte da classificação é só confirmar.

**Como você usa:** é aqui que você passa 70% do seu tempo. Se essa tela for boa, você
atende 20 clientes. Se for ruim, 8.

---

## 6. O Livro — a contabilidade de verdade

Aqui mora a escrituração, e é onde você **aprende contabilidade praticando** (§10).

| Tela | O que é, em português |
|---|---|
| **Diário** | tudo que aconteceu, em ordem de data. O extrato do negócio |
| **Razão** (razonete) | a mesma coisa vista **por conta**: tudo que entrou e saiu de "Caixa", de "Receita de Vendas", de "Aluguel" |
| **Balancete** | a conferência: a lista de todas as contas com o saldo de cada uma, e a prova de que débito e crédito batem |
| **Plano de contas** | as gavetas onde as coisas são guardadas. Cada cliente tem o seu, montado a partir de um modelo de MEI/serviço |

**Como você usa:** no dia a dia, quase não abre — a Caixa de Entrada já escreve aqui. Você
vem quando algo está estranho, quando o cliente pergunta "quanto eu gastei com isso no
ano?", ou quando quer estudar.

---

## 7. A Revisão — o seu papel de auditor

Quatro coisas, que juntas são o que um auditor faz:

**Conciliação** — o extrato do banco de um lado, o que foi lançado do outro. O que sobrou de
um lado sem par do outro aparece destacado. É a pergunta *"o que o cliente me contou bate
com o banco?"*, respondida em minutos.

**Mesa de Revisão** — um punhado de verificações que ou passam ou falham, tipo checklist de
piloto antes de decolar: toda partida aponta para conta que existe · valores e datas válidos
· débito nunca igual a crédito · sem lançamento duplicado · **a equação contábil fecha**.

> Detalhe herdado caro do ContLife: essas contas são **recalculadas do zero, do livro** —
> nunca a partir de um resumo já pronto. Lá, a versão antiga comparava um número com a
> fórmula que definia esse mesmo número: dava "✓ fecha" com o livro furado em R$ 1.500.

**Achados** — o sistema aponta o que destoa: despesa muito fora do padrão do cliente, mês
sem nenhum movimento, receita registrada sem dinheiro entrando em lugar nenhum.

**Trilha** — todo lançamento, alteração e exclusão fica registrado com data e hora. E a
lixeira guarda por 30 dias o que foi apagado. **Isso protege você antes de proteger o
cliente:** se algum dia alguém questionar um número, existe o histórico.

**Como você usa:** uma passada por cliente antes de fechar o mês. É o que te dá o direito de
falar "conferi" com cara séria.

---

## 8. O Fechamento — o selo

Conferiu, fecha o mês. A partir daí aquele período **não muda mais em silêncio**: para
mexer, você reabre explicitamente, e isso fica registrado.

É a diferença entre um caderno e um livro contábil. Sem isso, o número que você entregou ao
cliente em julho pode ser diferente do número que a tela mostra em novembro — e você não
saberia dizer por quê.

---

## 9. As Entregas — o que o cliente recebe

Fechado o mês, sai o pacote. Todo documento leva o rodapé dizendo que é **relatório
gerencial**, não peça contábil oficial assinada (`02_ESCOPO.md` §4.3).

**Obrigação:**
- Relatório Mensal de Receitas Brutas (o que o MEI é obrigado a guardar)
- Situação do DAS e o que vence
- Posição do limite de faturamento: acumulado, projeção do ano e alerta se estiver perto

**Gerencial — a conversa que você vende:**
- Resultado do mês: entrou, saiu, sobrou
- O que vence nas próximas semanas
- **Empresa × pessoa:** quanto é do negócio, quanto ele já tirou, quanto ainda pode tirar
- Margem por produto ou serviço
- Ponto de equilíbrio: quanto precisa faturar pra não dar prejuízo
- Comparativo com os meses anteriores

**Revisão:**
- **Revisão de Consistência do período** — o resultado da Mesa, em linguagem de gente
- **Carta de recomendações** — o que você viu e o que ele deveria fazer

### 9.1 Balanço patrimonial — sim, mas com dois rostos

Decidido em 11/ago, a pedido do dono. **Custo de ter: quase zero** — com partida dobrada
feita direito, o balanço não é trabalho extra, é subproduto. A Mesa de Revisão já verifica
a equação patrimonial; isso *é* o balanço.

**Mas ele não é entregue como "Balanço Patrimonial" ao cliente.** Dois rostos:

| Rosto | Para quem | Forma |
|---|---|---|
| **Instrumento** | o Luan | balanço completo, com Ativo/Passivo/PL. É a prova de que o livro está certo, e a fonte do "empresa × pessoa" |
| **Entrega** | o cliente | página simples: *"o que o negócio tem · o que deve · o que sobra é seu"*. Sem "circulante/não circulante" |

**O argumento forte, e é o que o vende:** sozinho, o resultado do mês mente por omissão. Se
a DRE diz que sobrou R$ 2.000 e o caixa não cresceu R$ 2.000, **para onde foi?** Só o
balanço responde — virou estoque, virou dívida paga, ficou a receber, ou o dono tirou.
Essa pergunta é a melhor conversa de consultoria que existe com dono de negócio pequeno.

⚠️ **Duas ressalvas honestas, para não vender ilusão:**

1. **MEI é empresário individual — o patrimônio não é separado do pessoal.** Legalmente,
   as dívidas do negócio alcançam os bens da pessoa. O balanço "do negócio" é uma
   separação **gerencial**, útil para decidir, não uma blindagem jurídica. O documento não
   pode dar a entender o contrário.
2. **O balanço de um MEI costuma ter cinco linhas.** Caixa, algum equipamento, o que tem a
   receber, o que deve, e o resto é dele. Não tem por que apresentar isso com a pompa de
   demonstração de S.A. — a simplicidade é honestidade, não preguiça.

**A conta que faz tudo funcionar:** as **retiradas do dono** viram uma conta de patrimônio
líquido. É ela que responde "quanto você já tirou este ano" e sustenta o "empresa ×
pessoa" (§9). Sem balanço, essa pergunta não tem onde morar.

**Como você usa:** gera o pacote, bate o olho, e usa a Carta como roteiro da conversa com o
cliente. O sistema entrega os números; **quem destrincha é você** — foi você mesmo quem
disse, e é isso que ele está comprando.

---

## 10. Como isto te ensina contabilidade sem virar aula

Decisão de produto, não enfeite: **o Contadoria nunca esconde a partida dobrada — ele
traduz.**

Toda vez que um lançamento é criado, a tela mostra os dois lados **e** a frase em português:

```
Compra de material — R$ 250,00
  D  Material de consumo (despesa)  ↑ aumentou o gasto
  C  Caixa (ativo)                  ↓ saiu dinheiro
"Você gastou 250 e o dinheiro saiu do caixa. A despesa cresceu, o caixa encolheu."
```

Você vai ver isso **centenas de vezes por mês**. Não tem como não aprender — é a mesma
lógica de aprender a dirigir dirigindo, não lendo o manual. E como o dado é de cliente real,
o erro tem consequência, que é o que fixa.

Os três lugares onde o aprendizado acontece sozinho:

1. **Cada lançamento**, com a tradução ao lado — a mecânica de débito e crédito
2. **O razonete e o balancete** — as duas ferramentas clássicas de ensino, com dado seu
3. **Quando a Mesa de Revisão falha** — você vai ter que descobrir *por que* não fechou. É
   aí que se aprende de verdade o que a equação contábil significa

O que ele **não** faz: dar aula, gamificar, ter mascote explicando. Você é estudante de
contabilidade, não leigo. O ContLife tem tudo isso porque o usuário dele é leigo — aqui não
entra.

---

## 11. O que NÃO vai ter (e por quê)

| Não tem | Por quê |
|---|---|
| Login para o cliente | v1 é só você. Portal de leitura fica para a v2, e a fechadura já nasce preparada |
| Emissão de nota fiscal | integração com SEFAZ/prefeitura é outro universo. O sistema **registra** nota, não emite |
| Emissão de guia do DAS | é no portal do governo. O sistema controla e lembra |
| Estoque | MEI e informal são serviço e comércio miúdo. Entra depois, sem migração |
| Planos, cobrança, trial, mascotes | uso próprio |
| ECD, ECF, SPED, balanço assinado | exige CRC |

---

## 12. Ordem de construção

Segue a regra do `03` §4.1: **o que economiza minutos por mês vem antes do que impressiona.**

| # | O quê | Por quê nessa ordem |
|---|---|---|
| 1 | Banco, login, cadastro de cliente | fundação |
| 2 | Livro: lançar, diário, razão, balancete | sem isso não existe contabilidade |
| 3 | **Caixa de Entrada** | o gargalo nº 3, e onde vai seu tempo |
| 4 | Fechamento + Revisão | é o que te dá o direito de dizer "conferi" |
| 5 | Entregas (os documentos) | agora sim, o que o cliente vê |
| 6 | **Painel do Mês** | o gargalo nº 2 — sobe de posição se você sentir a dor antes |
| 7 | Limite de faturamento e DAS | vale muito, mas só depois de existir movimento pra medir |

**Vale usar com 1 cliente real assim que o passo 4 estiver de pé.** Sistema contábil só
mostra os defeitos com dado de verdade dentro — e é melhor descobrir com um cliente do que
com oito.
