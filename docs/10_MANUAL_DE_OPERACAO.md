---
titulo: Manual de Operação
subtitulo: Como a Contadoria funciona, o que ela entrega e como usá-la no dia a dia
versao: 1.0 — 13/ago/2026
---

# 1 · O que é isto, em uma página

**Você vende um serviço, não um programa.** O cliente nunca compra, instala ou vê a
Contadoria. Ele te manda o que aconteceu no mês; você devolve clareza sobre o dinheiro dele.
O sistema é a sua ferramenta interna — é o que permite atender 15 a 20 clientes no tempo em
que uma planilha atenderia 6 a 8.

**O que o mercado entrega para o MEI hoje:** uma guia de DAS por mês, e olhe lá.

**O que você entrega:** a resposta a três perguntas que ninguém responde para ele.

> **1. Você está ganhando dinheiro?** — quase todo dono de negócio pequeno acha que sim, e
> não sabe.
>
> **2. Para onde foi o que sobrou?** — o mês fechou positivo mas a conta está vazia. Foi
> para estoque, para uma dívida, ou para o bolso dele.
>
> **3. Quanto você pode tirar sem quebrar o mês que vem?** — a decisão financeira mais
> importante que ele toma, e ele toma no chute, todo mês.

**A frase que define o seu serviço**, e que vale decorar:

> *"Eu organizo o seu dinheiro e te digo, todo mês, se o negócio está ganhando, quanto você
> pode tirar, e o que está te comendo por dentro."*

## 1.1 A tradução que sustenta tudo

Repita isso em toda entrega, até o cliente falar por você:

| Termo | O que é |
|---|---|
| **Faturamento** | o que entrou |
| **Lucro** | o que sobrou depois de tudo |
| **Seu dinheiro** | o que dá para tirar sem quebrar o mês que vem |

**São três números diferentes**, e a maioria das pessoas só conhece o primeiro. Fazer o
cliente enxergar os três é, sozinho, metade do seu valor.

---

# 2 · Os oito arquétipos — o que cada negócio precisa que os outros não precisam

**O sistema não trata todo cliente igual.** Ao cadastrar o negócio, você escolhe **o que ele
faz para ganhar dinheiro** — um dos **8 arquétipos** (`src/dominio/arquetipos.mjs`). Essa
escolha decide três coisas antes de qualquer conversa: **o plano de contas** que nasce com o
cliente, **quais campos aparecem no balanço de abertura** e **quais perguntas extras entram
no roteiro**. Sem ela, o eletricista receberia "Estoque" e não receberia "Material aplicado"
— o erro que os arquétipos existem para corrigir.

**Os 8 são dados, não 8 caminhos de código.** A variação entre uma loja e um eletricista é de
conteúdo (quais contas, quais perguntas, qual achado), não de lógica — por isso um nono
arquétipo se acrescenta sem tocar em tela nenhuma. Este capítulo é o guia de campo: o que
perguntar, o que aparece no plano de contas, e qual costuma ser a dor de cada um.

## 2.1 Revenda

**Exemplos:** loja, sacoleira, distribuidora, revenda online, mercadinho.

- **O que perguntar:** quanto ele paga pelo que revende em relação ao preço de venda (a
  margem bruta); tem mercadoria parada há muito tempo; e no balanço de abertura, quanto vale
  a mercadoria parada hoje.
- **Contas que aparecem:** Estoque de mercadorias, Venda de mercadorias, CMV, Frete sobre
  compras.
- **Dor típica:** a taxa da maquininha comendo a margem em silêncio, e mercadoria parada —
  dinheiro preso na prateleira que quase ninguém enxerga como dinheiro.

## 2.2 Produção própria

**Exemplos:** salgados, bolos, marmita, costura, artesanato, marcenaria.

- **O que perguntar:** quanto de insumo entra em cada produto (base do custo por unidade);
  quanto ele perde por mês com quebra, sobra ou produto estragado; no balanço, o insumo
  parado e o produto pronto ainda não vendido.
- **Contas que aparecem:** Estoque de insumos, Produto pronto, Venda de produção própria,
  Insumos e matéria-prima, Embalagem, Perda e quebra.
- **Dor típica:** vender no prejuízo sem perceber — o preço não cobre o que ele gasta para
  fazer — e perda que nunca é contabilizada, vira só "sumiço".

## 2.3 Serviço com mão de obra

**Exemplos:** eletricista, pedreiro, encanador, pintor, mecânico, consertos, diarista.

- **O que perguntar:** se ele cobra o deslocamento até o cliente; se o material é por conta
  dele ou o cliente compra; quantos dias por mês ele fica sem serviço nenhum. No balanço,
  material já comprado para um serviço que ainda não aconteceu (é adiantamento, não despesa).
- **Contas que aparecem:** Prestação de serviços, Material cobrado do cliente, Material
  aplicado em serviço, Ferramentas e manutenção, Deslocamento, Ajudante/diária de terceiro.
- **Dor típica:** trabalhar muito e não sobrar — dia parado é custo fixo correndo sem
  receita, e deslocamento não cobrado é pagar para trabalhar.

## 2.4 Serviço recorrente

**Exemplos:** manutenção mensal, limpeza, aulas, mensalista, assessoria.

- **O que perguntar:** quantos clientes fixos ele tem hoje e quanto cada um paga; se costuma
  ter cliente atrasando a mensalidade.
- **Contas que aparecem:** Mensalidades, Serviços avulsos.
- **Dor típica:** inadimplência silenciosa — o faturamento parece igual, mas o dinheiro não
  entra — e dependência de poucos clientes fixos, que quebra o mês se um sair.

## 2.5 Digital / online

**Exemplos:** infoproduto, sistema, freelancer digital, social media, e-commerce próprio.

- **O que perguntar:** por qual plataforma ele vende e qual a taxa dela; quanto do
  faturamento é recorrente (assinatura) e quanto é venda avulsa; se gasta com anúncio. No
  balanço, dinheiro parado em plataforma (Hotmart, Mercado Pago, PagSeguro…) — já é dele, só
  ainda não caiu na conta.
- **Contas que aparecem:** Saldo em plataforma, Vendas online, Assinaturas, Taxa de
  plataforma, Anúncios e tráfego pago, Ferramentas e assinaturas de software.
- **Dor típica:** a taxa da plataforma é a despesa mais fácil de esquecer, porque já vem
  descontada do valor que cai na conta — ele nunca a vê sair.

## 2.6 Beneficiamento / terceirização

**Exemplos:** manda tecido para costureira, peça para pintura, madeira para corte, facção.

- **O que perguntar:** quanto tempo a mercadoria costuma ficar com o terceiro; se costuma ter
  perda ou peça que volta com defeito. No balanço, quanto está na mão de terceiro agora **e**
  quanto já voltou e está parado com ele.
- **Contas que aparecem:** Estoque de mercadorias, **Mercadoria com terceiros**, Venda de
  mercadorias, CMV, Serviço de terceiros, Perda no beneficiamento.
- **Dor típica:** mercadoria com terceiro é dele, mas não está com ele — se sumir ou
  estragar, a perda é dele, e quase ninguém controla quanto tem parado lá fora.

## 2.7 Intermediação / comissão

**Exemplos:** representante, revendedor comissionado, corretor, dropshipping.

- **O que perguntar:** se ele recebe o valor cheio e repassa, ou só recebe a comissão; qual o
  percentual da comissão. ⚠️ Confirmar o enquadramento na legislação antes de orientar —
  fica fora do que este manual resolve sozinho.
- **Contas que aparecem:** Valores recebidos a repassar, Repasses a pagar, Comissões
  recebidas.
- **Dor típica:** confundir o valor bruto recebido com receita própria. Lançar o repasse como
  receita infla o faturamento e pode disparar alarme falso do teto do MEI — o erro mais caro
  do arquétipo.

## 2.8 Locação

**Exemplos:** aluguel de ferramenta, som, brinquedo, espaço, veículo.

- **O que perguntar:** quantos dias por mês cada equipamento fica alugado, em média (a taxa
  de ocupação); quanto ele gasta de manutenção por mês. No balanço, o valor aproximado de
  hoje dos equipamentos que aluga.
- **Contas que aparecem:** Equipamentos para locação, Aluguéis recebidos, Manutenção de
  equipamentos, Seguro.
- **Dor típica:** equipamento parado é capital investido sem retorno, e a manutenção costuma
  comer boa parte da receita sem que ninguém meça isso contra ela.

---

## 2.9 O que cruza qualquer arquétipo, seja ele qual for

Estas quatro situações não são sobre o que o negócio faz — são sobre **como o dinheiro dele
se comporta**. Valem para qualquer um dos 8 acima.

### Dinheiro misturado — o cenário mais comum

Uma conta só (ou uma carteira só, para o informal), pessoal e negócio no mesmo lugar.

- **O que perguntar:** "você usa o mesmo dinheiro para o negócio e para as suas coisas?" —
  a pergunta mais importante do Bloco 2. Se sim, marca `negocios.dinheiro_misturado`.
- **O que muda no sistema:** deixa de existir o botão **"é pessoal, ignorar"**. Na Caixa de
  Entrada, cada gasto pessoal vira **Retirada**; dinheiro pessoal que entra na mesma conta
  vira **Aporte**. Os dois são lançamentos reais, não anotação — é o que faz o saldo do livro
  continuar batendo com a conta dele de verdade, e é o que revela, no fim do mês, **quanto
  ele realmente tirou**.
- **Como explicar pro cliente:** não é sermão, é aritmética. *"Como você usa a mesma conta
  pra tudo, todo gasto seu que eu identificar no extrato eu registro como retirada — assim
  no fim do mês eu consigo te dizer com precisão quanto o negócio te deu, mesmo estando tudo
  misturado."* Se ele reagir mal a um número (*"eu tirei tanto assim?"*), o número faz o
  sermão sozinho — não repreenda, mostre: *"você tirou R$ 4.100 esse mês, e o negócio gerou
  R$ 2.800."*

### Informal no dinheiro vivo

Sem CNPJ, sem conta, sem nota. Manda áudio: *"hoje vendi 300"*.

- **Dor:** nenhuma obrigação, nenhum risco fiscal — e nenhuma noção. Também: não vende para
  empresa, não emite nota, não contribui para o INSS.
- **O que muda:** não há extrato para conciliar. Sua revisão vira **consistência interna**:
  faltou um mês? a margem despencou sem explicação? tem despesa sem receita nenhuma? O
  roteiro também muda — perguntas de MEI (data de abertura, atividade) somem, e entram outras
  (vende para empresa? já pensou em abrir CNPJ?).
- **Tempo estimado:** 20 a 40 min/mês. O custo aqui é **cobrar**, não digitar.
- **A melhor consultoria que você vai prestar a ele:** *"vale a pena formalizar?"* — com
  número, não opinião. Guarde essa conversa para o 2º ou 3º mês, quando já tiver mostrado o
  faturamento real dele.

### MEI perto do limite

Dor **real e urgente**. Estourar o teto em mais de 20% gera desenquadramento retroativo a
janeiro — uma conta de 12 meses de uma vez. Avisar em setembro em vez de descobrir em
fevereiro pode valer alguns milhares de reais para ele. O sistema projeta isso desde o
primeiro mês, com o que a abertura já captura — não precisa esperar histórico
(`src/dominio/valorDoTempo.mjs`; a Vigia do limite, §3.1).

### MEI com funcionário

Entram folha, FGTS e eSocial. **O serviço fica bem maior — o preço precisa acompanhar.**
Trate como outro produto, não como o mesmo com um extra.

---

# 3 · O que você entrega — as três gavetas

## 3.1 Obrigação — o que o MEI precisa ter

| Entrega | Observação |
|---|---|
| **Relatório Mensal de Receitas Brutas** | obrigatório; sai pronto do razão. Separa comércio/indústria de serviços |
| **Controle do DAS** | vencido, pago, em aberto. **O sistema não emite guia** — isso é no portal do governo. Ele controla e lembra |
| **Base da DASN-SIMEI** | a receita bruta anual consolidada |
| **Vigia do limite** | acumulado no ano, projeção, alerta de desenquadramento |
| **Registro de notas emitidas** | registrar, não emitir |

## 3.2 Gerencial — onde você agrega valor

DRE simplificada · fluxo de caixa · **separação empresa × pessoa** · margem por
produto/serviço · contas a receber e a pagar com vencimento · ponto de equilíbrio ·
comparativo mês a mês e sazonalidade.

## 3.3 Revisão — o seu papel de auditor

Conciliação bancária · Mesa de Revisão (as verificações que ou passam ou falham) · **Achados**
(despesa fora do padrão, mês sem movimento, receita sem dinheiro entrando) · trilha de
auditoria · lixeira · fechamento com selo · Carta de recomendações.

⚠️ **Cuidado com o nome.** "Auditoria independente" e "parecer de auditoria" são termos
regulados. O documento que vai para o cliente se chama **Revisão de Consistência** ou
**Conferência do Período** — nunca "auditoria". O trabalho é o mesmo; a etiqueta é o que
protege você.

## 3.4 O formato da entrega: o Retrato do Mês

**Uma página, não um relatório.** Número grande, três frases, o "quanto você pode tirar", e
o rodapé que diz que é relatório gerencial. O relatório completo existe atrás, para quem
quiser — mas **a entrega é a página.**

Isso não é vaidade: ninguém mostra uma planilha para o cunhado, mas mostra uma página bonita
que diz, em letras grandes, quanto ganhou no mês. **É a sua peça de marketing que se paga
sozinha.**

---

# 4 · O limite profissional — os quatro "não faço"

Você é estudante, **sem CRC**. Isso não te impede de prestar este serviço — o MEI não é
obrigado a ter contador, e é justamente por isso que o mercado está aberto. Mas há uma linha,
e dizê-la em voz alta na primeira conversa é o que te protege.

**A lista, dita de frente:**

- não emito nota fiscal por você
- não acesso sua conta bancária
- não assino peça contábil oficial (ECD, ECF, SPED, balanço assinado) — sou **estudante,
  ainda sem CRC**; o que entrego é **relatório gerencial**
- não falo com a Receita por você

**Isso não te diminui: delimita.** Cliente com expectativa errada vira problema no terceiro
mês, e sempre por algo que ninguém combinou.

## 4.1 O que encaminhar em vez de responder

Desenquadramento e transição para ME · parcelamento de dívida fiscal · defesa em ação fiscal ·
questão trabalhista · qualquer peça oficial assinada · planejamento tributário para quem já
não é MEI.

> **"Não sei, vou confirmar e te respondo hoje" é resposta profissional.** Chutar é o que
> quebra confiança — e em imposto, chute errado custa dinheiro ao cliente.

## 4.2 A regra dos números

**Nunca diga um número fiscal de cabeça.** Limite do MEI, valor do DAS, prazos — tudo isso
muda por lei e sem aviso. Os valores vivem na tabela `parametros_fiscais` do sistema, com
fonte e data de conferência. Consulte antes de falar.

---

# 5 · O sistema, tela por tela

**Endereço:** `contadoria-luan.netlify.app` — funciona no celular e no computador, de
qualquer lugar.

## 5.1 A prateleira (tela inicial)

Todos os seus negócios em cards. Cada card mostra o apelido, o tipo (MEI/Informal) e o
resultado do mês corrente ("sobrou R$ 800,00 este mês"). Clicar abre a pasta daquele cliente.

- **Novo negócio** — cadastra um cliente
- **Painel do Mês** — a tela de cobrança (§5.2)
- **Sair** — encerra a sessão

## 5.2 Painel do Mês — a cobrança

**Abra isto todo dia 5.** Mostra, de todos os clientes ao mesmo tempo, quem mandou e quem
não mandou:

```
Nanda ····· falta: TUDO — nada chegou este mês        [Copiar mensagem]
Léia ······ falta: 2 itens por classificar             [Copiar mensagem]
Zé ········ falta: NADA — pronto pra fechar
```

O botão **Copiar mensagem** monta o texto de cobrança pronto, com o nome do cliente e o que
falta. Cola no WhatsApp e segue. **Dispara todas as cobranças em 10 minutos e esquece.**

Sem essa tela, cobrança vira memória — e memória falha justamente com o cliente que menos
manda.

## 5.3 Roteiro do Cliente Novo

Aparece automaticamente quando você abre um negócio recém-cadastrado. São **6 blocos** de
perguntas que viram registro no sistema — **adaptados ao tipo (MEI/informal) e ao arquétipo**
do cliente, e separados em essencial (1ª conversa) e aprofundamento (meses seguintes).
Detalhe operacional completo no §7; o roteiro em si está em `05_ROTEIRO_DO_SERVICO.md` §4.

**Nem sempre precisa ser você digitando ao vivo.** Existe o **Formulário Público**: um link
com token que você manda pelo WhatsApp, e o cliente responde sozinho, do celular, no tempo
dele — retomável, válido por 30 dias. Cobre os Blocos 1 a 5; o combinado (Bloco 6) continua
sendo sempre conversa, nunca formulário.

## 5.4 Caixa de Entrada — **onde vai 70% do seu tempo**

A mesa onde você despeja o que o cliente mandou e transforma em lançamento.

**O que entra:** extrato do banco (colado como CSV/OFX), lista de vendas, foto de nota, ou o
que ele falou por áudio e você digitou como resumo.

**Para cada item, três botões e um campo:**

| Ação | Quando usar |
|---|---|
| **Classificar** | o normal. O sistema **sugere** a conta se já aprendeu esse padrão antes |
| **É pessoal** *(cliente com conta separada)* | some da apuração — a transação é de uma conta que o livro não acompanha |
| **Retirada / Aporte pessoal** *(cliente de dinheiro misturado)* | mesmo botão, rótulo e efeito diferentes: quando `negocios.dinheiro_misturado` está ligado, o item **não pode sumir** — vira lançamento real de Retirada (saiu) ou Aporte (entrou) do titular. Ver §2.9 |
| **Não sei ainda** | vai para a pilha de dúvidas, para perguntar ao cliente tudo de uma vez |

**O sistema aprende com você.** Se "POSTO IPIRANGA" virou Combustível três vezes, na quarta
já vem preenchido. Depois de dois meses, a maior parte da classificação é só confirmar.

> **Se esta tela for rápida, você atende 20 clientes. Se for lenta, 8.** É a peça mais
> importante do sistema.

## 5.5 Lançar

O formulário de lançamento manual, com N linhas. Débitos e créditos precisam fechar antes de
gravar — o sistema não deixa passar lançamento torto.

**Campo de vencimento:** aparece automaticamente quando a conta escolhida é *Clientes* ou uma
conta de compromisso (Fornecedores, DAS a pagar, Empréstimos, Salários a pagar). Preencher é
o que faz o item aparecer na aba *A receber/pagar* e entrar no cálculo de "quanto pode tirar".

## 5.6 Diário · Razão · Balancete

| Tela | O que é, em português |
|---|---|
| **Diário** | tudo que aconteceu, em ordem de data. O extrato do negócio |
| **Razão** | a mesma coisa vista **por conta**: tudo que entrou e saiu de "Caixa", de "Aluguel"… |
| **Balancete** | a lista de todas as contas com saldo, e a prova de que débito bate com crédito |

No dia a dia você quase não abre. Vem aqui quando algo está estranho, quando o cliente
pergunta *"quanto gastei com isso no ano?"*, ou **quando quer estudar**.

No Diário, cada lançamento tem botões de **editar** e **excluir** (exceto os gerados pelo
sistema, como abertura e fechamento). Excluir manda para a lixeira — nada some sem rastro.

## 5.7 Plano de contas

As gavetas onde as coisas são guardadas. Cada cliente tem o seu, criado a partir da base
comum (~27 contas) mais o que o arquétipo escolhido acrescentou (capítulo 2) —
`planoDeFabrica(arquetipo)` em `src/dominio/arquetipos.mjs`.

Você pode **adicionar** conta nova e **ativar/desativar**. **Não existe excluir, de
propósito:** uma conta com movimento não pode sumir sem quebrar o histórico — desativar tira
da lista de escolha sem apagar nada.

## 5.8 Recorrentes

Contas que se repetem todo mês (aluguel, internet, mensalidade). **Já nascem cadastradas** a
partir do Bloco 4 do Roteiro do Cliente Novo — o que ele te disse que paga todo mês vira
template automaticamente, sem digitar de novo. O botão **Gerar lançamentos do mês**
materializa todos de uma vez; você também pode cadastrar ou ajustar um template a qualquer
momento, aqui.

**Não duplica:** se você já gerou este mês, clicar de novo não faz nada. E o lançamento
gerado pode ser editado normalmente — se a conta de energia veio diferente num mês, corrija
só aquele mês, sem mexer no template.

**É o que faz o segundo mês de cada cliente ser rápido.**

## 5.9 A receber / a pagar

Lista o que está em aberto (vendas a prazo e compromissos), ordenado por vencimento. O botão
**Dar baixa** liga o recebimento/pagamento àquela fatura específica.

**Por que isso importa:** sem a baixa, o sistema só sabe o saldo total da conta. Com ela, sabe
se *aquela* venda de R$300 do dia 20 já foi paga — o que deixa o "quanto você pode tirar"
mais preciso.

⚠️ Baixa é sempre do **valor cheio**. Pagamento parcial ainda não tem tela própria.

## 5.10 Conciliação

O extrato do banco de um lado, o que foi lançado do outro. O que sobrou sem par aparece
destacado.

É a pergunta *"o que o cliente me contou bate com o banco?"*, respondida em minutos. **É a
checagem que mais vale** — e a única que dá autoridade real ao seu papel de revisor.

## 5.11 Revisão — o seu papel de auditor

Quatro coisas numa tela:

**Mesa de Revisão** — verificações que ou passam ou falham, tipo checklist de piloto:
toda linha aponta para conta que existe · datas e valores válidos · sem lançamento duplicado ·
todo lançamento fecha D=C · **a equação patrimonial fecha**.

**Achados** — o que destoa, sem bloquear nada. Universais, para qualquer cliente:
- *mês sem movimento* — um buraco no meio do histórico
- *despesa fora do padrão* — gasto do mês aberto muito acima da média dos meses fechados (só
  aparece quando já existe histórico fechado para comparar)
- *receita sem dinheiro* — venda registrada sem entrar em caixa, banco, maquininha nem
  clientes
- **retirada acima do resultado** — "você tirou R$ 4.100 e o negócio gerou R$ 2.800". Roda
  desde o **dia 1**, sem precisar de mês fechado nem de histórico — é o achado mais forte do
  sistema (`DECISOES.md` F0)

Por arquétipo — só aparecem para quem se aplica (`DECISOES.md` F10):
- **mercadoria parada com terceiro** *(beneficiamento)* — saldo parado há mais de 15 dias
- **taxa engolindo margem** *(revenda, produção, digital)* — taxa de maquininha ou
  plataforma acima de 8% da receita do mês
- **sem receita no período** *(serviço com mão de obra)* — dias do mês já passados sem
  nenhuma receita lançada

**Fechamento de mês** — só fecha se a Mesa passar em tudo. Depois de fechado, o mês não muda
em silêncio (dá para reabrir, e fica registrado).

**Trilha** — tudo que aconteceu, com data e hora. **Isso protege você antes de proteger o
cliente:** se algum dia alguém questionar um número, existe o histórico.

## 5.12 Entregas — o que o cliente vê

**Retrato do Mês:** resultado em número grande, as frases, e o aviso de "para onde foi o que
sobrou" quando o resultado e o caixa não batem.

**Quanto você pode tirar:** o número + a conta que o sustenta (disponível hoje, a receber em
30 dias, compromissos, reserva mínima). **Sempre mostre a conta** — se o cliente esqueceu de
contar uma dívida, ele mesmo vê onde.

**O que vem por aí — os próximos 60 dias:** a peça que vira o serviço de retrospectivo em
preditivo. Cruza saldo atual + a receber com vencimento + a pagar com vencimento + recorrentes
ativos, e avisa **o dia exato em que o caixa fica negativo, e de quanto**. Micronegócio não
morre de prejuízo — morre de ficar sem dinheiro num dia específico, e ninguém mais avisa MEI
disso. **Não projeta venda futura não registrada** — regra de honestidade: é o número que não
pode mentir para cima (`DECISOES.md` F1).

**Quanto vale a sua hora:** cruza a retirada do mês com as horas trabalhadas por semana
(pergunta do Bloco 4) e compara com o salário mínimo por hora. Costuma ser um dos números
mais duros que o cliente vê — tem gente trabalhando 60 horas por semana ganhando menos por
hora que um empregado, e não sabe. Vem acompanhado da **projeção de quando o faturamento bate
o teto do MEI no ritmo atual** (`DECISOES.md` F2).

**Carta de recomendações:** texto livre por mês — o que você viu e o que ele deveria fazer.
No mês seguinte, o sistema pergunta se a recomendação foi seguida. **Responda sempre.** É o
que, daqui a um ano, permite dizer: *"em março você trocou de fornecedor; sua margem subiu 4
pontos desde então — foi a melhor decisão do ano."* Isso transforma guarda-livros em
conselheiro, e não se cria retroativamente.

## 5.13 Negócio

O cadastro do cliente: nome, apelido, CNPJ, atividade, WhatsApp, se tem funcionário, situação
(ativo/encerrado). Editável a qualquer momento.

---

# 6 · O ciclo do mês

**Sempre a mesma ordem. É o que faz caber em 25 horas.**

| Dias | O que fazer | Onde |
|---|---|---|
| **1 a 5** | cobrar todo mundo | Painel do Mês → copiar mensagem |
| **5 a 12** | classificar o que chegou | Caixa de Entrada |
| **12 a 15** | conciliar, revisar, fechar o mês | Conciliação → Revisão |
| **15 a 18** | gerar entregas e **conversar com cada cliente** | Entregas |
| **18 a 25** | folga, estudo, e melhorar o sistema | — |

## 6.1 O roteiro da conversa de entrega

Gerou o pacote, agora vem a parte que **é o produto**. Sempre a mesma ordem, e **sempre três
minutos antes de qualquer número:**

1. **O que aconteceu** — entrou X, saiu Y, sobrou Z
2. **Para onde foi o que sobrou** — é onde ele mais se surpreende
3. **Uma coisa boa** — sempre existe, e é o que faz ele continuar mandando informação
4. **Uma coisa para arrumar** — **uma só.** Duas viram nenhuma
5. **O que vem por aí** — o que vence, e como está o limite do ano

## 6.2 Situações difíceis, com resposta pronta

| Situação | O que dizer |
|---|---|
| **Mês ruim** | mostre a comparação com os meses anteriores **antes** do número do mês. Um mês ruim isolado assusta; dentro da série, informa |
| **Ele mistura tudo** | não repreenda. Mostre o número: *"você tirou R$ 4.100 esse mês, e o negócio gerou R$ 2.800"*. O número faz o sermão sozinho, e melhor |
| **Não mandou nada** | *"não consigo fechar seu mês sem isso — vou juntar com o mês que vem"*. Uma vez. Duas seguidas, é conversa sobre o combinado |
| **"Isso não dá pra descontar do imposto?"** | MEI paga **valor fixo**; despesa não abate. É gerencial, não fiscal — e explicar isso já é entrega |
| **Está chegando no limite** | avise **cedo**, com projeção. Explique que passar do teto significa sair do MEI e precisar de contador registrado — e que você ajuda na transição |

---

# 7 · Cliente novo: da primeira conversa ao primeiro fechamento

**Orçamento de tempo: 1 a 2 horas, uma vez** (menor do que antes — o aprofundamento não entra
mais na primeira conversa; ver Bloco 4). Esse custo some no segundo mês.

## Passo 1 — Cadastre o negócio e escolha o arquétipo
Prateleira → **Novo negócio**. Nome, apelido, tipo (MEI ou Informal) e **o que o negócio faz
para ganhar dinheiro** — um dos 8 arquétipos do capítulo 2. Essa escolha monta o plano de
contas certo antes mesmo de a primeira pergunta acontecer; sem ela, o sistema recusa
prosseguir.

## Passo 2 — Rode o Roteiro do Cliente Novo
O sistema abre sozinho. São 6 blocos, e o que aparece em cada um já vem filtrado pelo tipo e
pelo arquétipo escolhidos no Passo 1 — nada aqui é fixo para todo cliente.

**Bloco 1 — Quem é o negócio:** o que faz, desde quando, CNPJ, atividade, data de abertura
*(perguntas de MEI somem para o informal, e entram outras no lugar — vende para empresa? já
pensou em abrir CNPJ?)*.
⚠️ *A data de abertura decide a proporcionalidade do limite no 1º ano — não pule.*

**Bloco 2 — Como o dinheiro entra e sai:** tem conta separada? **usa o mesmo dinheiro para
tudo?** qual banco, consegue exportar extrato? recebe como (dinheiro, Pix, maquininha,
boleto)? vende fiado? compra a prazo? emite nota?

⚠️ **A pergunta do dinheiro misturado é a mais importante do bloco.** Se sim, o cliente entra
no modo do §2.9: gasto pessoal vira retirada de verdade, não "ignorar". *E maquininha tem
duas pegadinhas: a taxa é despesa que quase ninguém contabiliza, e o dinheiro cai dias depois
— a venda e o recebimento são datas diferentes.*

**Bloco 3 — A foto de hoje (o balanço de abertura):** quanto tem em caixa e banco, o que o
negócio tem que vale dinheiro, **o campo específico do arquétipo** (mercadoria parada, saldo
em plataforma, mercadoria com terceiro…), quem deve a ele, quanto ele deve, empréstimos.

⚠️ **Sem esta foto, o livro nasce desequilibrado e a Mesa de Revisão vai acusar erro para
sempre.** Valor aproximado está de bom tamanho. E **toda dívida se classifica em três tipos**
(do negócio / pessoal mas o dinheiro entrou no negócio / só pessoal) — o do meio é o mais
comum e o mais fácil de esquecer: o empréstimo no nome dele para comprar a moto de entrega
**é** passivo do negócio, porque quem paga a parcela é o caixa do negócio.

**Bloco 4 — O ritmo do negócio:** o que paga todo mês (**vira cadastro real de recorrentes**
ao concluir o roteiro — não precisa cadastrar de novo depois), quanto costuma faturar,
**quanto tira por mês para viver**, quantas horas por semana trabalha nisso, e **as perguntas
específicas do arquétipo** (capítulo 2 — margem, perda, deslocamento, inadimplência, taxa de
plataforma, conforme o caso). Sazonalidade e produtos/preços ficam para o aprofundamento dos
meses seguintes.

⚠️ *"Quanto você tira por mês?" — quase ninguém sabe responder. É a primeira coisa que você
vai descobrir para ele, e costuma ser o momento em que ele entende para que você serve.*

**Bloco 5 — O que ele quer:** o que mais incomoda hoje na parte do dinheiro? sabe se está
ganhando dinheiro? tem alguma meta? — vira o foco da Carta de recomendações o ano inteiro.

**Bloco 6 — O combinado:** como e até quando ele manda a informação · o que você entrega e
quando · quanto e como ele paga · **o que você NÃO faz** (§4).

**Ao concluir o Bloco 6, o sistema grava o Retrato de Entrada** — o que ele disse que fatura,
tira e trabalha, congelado ao lado do que o balanço mediu. Grava uma vez, nunca mais muda: é
o que sustenta a frase, meses depois, *"você me disse que tirava X; os números mostram Y"*
(`05_ROTEIRO_DO_SERVICO.md` §4.1).

**Não precisa ser você digitando ao vivo o tempo todo.** Se a agenda não bater, mande o link
do **Formulário Público** — o cliente responde os Blocos 1 a 5 sozinho, do celular, em até 30
dias, e você fecha o Bloco 6 (o combinado) numa ligação curta depois.

## Passo 3 — Confira o plano de contas
O plano já nasceu pronto: a base comum mais o que o arquétipo escolhido acrescentou
(capítulo 2). Adicione o que for muito específico do negócio dele (ex.: "Embalagens de
entrega" para quem faz delivery).

## Passo 4 — Rode o primeiro mês
Caixa de Entrada → Conciliação → Revisão → Fechar → Entregas.

## Passo 5 — A primeira conversa de entrega
Use o roteiro do §6.1. **É a conversa que decide se ele fica.**

---

# 8 · Contabilidade na prática — o mínimo que sustenta o serviço

Você está estudando contabilidade, e este sistema é seu laboratório. Este capítulo é o chão.

## 8.1 Partida dobrada em cinco minutos

Todo fato econômico tem **duas pernas**: de onde veio e para onde foi. A soma dos débitos
sempre é igual à soma dos créditos. Não é regra burocrática — é que todo dinheiro que entra
em algum lugar saiu de outro.

**O sistema não deixa você errar isso:** o banco recusa lançamento desequilibrado. Não porque
a tela impede — porque o banco recusa.

## 8.2 As cinco naturezas, e para que lado cada uma cresce

| Natureza | Cresce no | Exemplos |
|---|---|---|
| **Ativo** | Débito | Caixa, Banco, Clientes, Estoque, Equipamentos |
| **Passivo** | Crédito | Fornecedores, DAS a pagar, Empréstimos |
| **Patrimônio Líquido** | Crédito | Capital do titular, Retiradas, Lucros acumulados |
| **Receita** | Crédito | Venda de mercadorias, Prestação de serviços |
| **Despesa** | Débito | Aluguel, Energia, CMV, Taxa de maquininha |

**A equação que tem que fechar sempre:** `Ativo = Passivo + PL + Receita − Despesa`

## 8.3 Os dez lançamentos que cobrem 90% de um MEI

| # | Fato | Débito | Crédito |
|---|---|---|---|
| 1 | Venda à vista | Caixa/Banco | Receita |
| 2 | Venda a prazo | Clientes | Receita |
| 3 | Cliente pagou o que devia | Caixa/Banco | Clientes |
| 4 | Venda na maquininha | A receber de maquininha | Receita |
| 5 | Maquininha depositou | Banco | A receber de maquininha |
| 6 | Taxa da maquininha | Taxa de maquininha *(despesa)* | A receber de maquininha |
| 7 | Despesa paga na hora | Despesa | Caixa/Banco |
| 8 | Compra a prazo de fornecedor | Despesa/Estoque | Fornecedores |
| 9 | Pagou o fornecedor | Fornecedores | Caixa/Banco |
| 10 | **O dono tirou dinheiro** | Retiradas do titular *(PL)* | Caixa/Banco |

## 8.4 As quatro coisas que quase todo mundo erra

**1. Retirada não é despesa.** É conta de **patrimônio**. O dono não é funcionário da própria
empresa; o que ele tira é redução do patrimônio dele, não custo do negócio. Se você lançar
retirada como despesa, o lucro fica errado e a conta de "quanto pode tirar" desmorona.

**2. Faturamento não é lucro, e lucro não é dinheiro no bolso.** Ver §1.1.

**3. A taxa da maquininha é despesa, e some se ninguém contabilizar.** É a que mais come
margem em silêncio.

**4. Venda e recebimento são fatos diferentes.** A venda a prazo aumenta o resultado sem
mexer no caixa. É exatamente por isso que o sistema avisa "para onde foi o que sobrou".

## 8.5 O que estudar, em ordem

1. **Partida dobrada e as cinco naturezas** — §8.2, até virar automático
2. **Os dez lançamentos** — §8.3, até não precisar consultar
3. **Regime de caixa × competência** — por que venda e recebimento são fatos separados
4. **DRE e Balanço** — o que cada um responde (resultado do período × foto do patrimônio)
5. **MEI na lei** — `07_MEI_O_QUE_SABER.md`: limite, DAS, DASN, desenquadramento, benefícios
6. **Conciliação e controles internos** — a base do seu papel de revisor
7. **Análise: margem, ponto de equilíbrio, capital de giro** — a base da consultoria

> **A vantagem que ninguém te dá na faculdade:** escriturando de verdade, com dinheiro real
> de cliente real, você vai ter em dois anos mais prática de escrituração do que a maioria
> dos formandos. Quando o CRC vier, você não estará começando — estará mudando de faixa.

---

# 9 · Manutenção do sistema

## 9.1 Os comandos

| Comando | O que faz | Quando |
|---|---|---|
| `npm run backup` | exporta tudo para `backups/` | **toda sexta**, e antes de qualquer mudança grande |
| `npm run build` | recompila o sistema | depois de mudar código |
| `npm run bump` | atualiza o número de versão | sempre junto do build |
| `npm run publicar` | envia para o site publicado | depois do build + bump |
| `npm run serve` | sobe o servidor local (desenvolvimento) | quando for testar antes de publicar |
| `npm run celular` | sobe na rede local para testar do celular | teste em Wi-Fi |
| `npm test` | roda os testes automatizados | antes de publicar |
| `npm run conferir` | mostra o estado real do banco | quando algo estranho acontecer |

⚠️ **Publicar não é automático.** Mudou o código e quer que valha no site? `build` → `bump` →
`publicar`. Sem os três, o site publicado fica desatualizado enquanto o código já mudou.

## 9.2 A rotina de manutenção

| Quando | O quê |
|---|---|
| **Toda sexta** | `npm run backup` |
| **Todo janeiro** | reconferir `parametros_fiscais` — o salário mínimo muda e o DAS sobe junto |
| **Antes do 1º cliente real** | conferir limite do MEI (há projetos de lei para aumentá-lo, nenhum aprovado até ago/2026) e abrir o Manual de Desenquadramento da Receita |
| **Depois dos 3 primeiros clientes** | corrigir as estimativas de tempo e capacidade em `03_CENARIOS_E_CAPACIDADE.md` com o número real |

## 9.3 Se algo der errado

| Sintoma | O que fazer |
|---|---|
| Site local não abre | o servidor caiu. Rode `npm run serve` |
| Site publicado desatualizado | faltou `npm run publicar` |
| Tela travada em "carregando" | abra o console do navegador (F12) e veja o erro |
| Número parece errado | vá no **Balancete** — se débito não bate com crédito, algo está torto; a **Mesa de Revisão** aponta o quê |
| Apaguei sem querer | está na **lixeira**, com o conteúdo completo |
| "O mês está fechado" | reabra em Revisão → Meses fechados → Reabrir |

---

# 10 · Vocabulário — o que ele diz × o que significa

Metade dos mal-entendidos com cliente pequeno é vocabulário. **Traduza sempre.**

| Ele diz | Ele quer dizer | O termo certo |
|---|---|---|
| "faturei 8 mil" | entrou 8 mil | **receita bruta** |
| "ganhei 8 mil" | quase sempre é o mesmo 8 mil | ⚠️ não é lucro |
| "sobrou 2 mil" | o que ficou na conta | **resultado** — e só se ele não tiver tirado nada |
| "meu salário" | o que ele retira | **retirada** — MEI não tem pró-labore formal |
| "a nota" | qualquer papel | pode ser nota, recibo, comprovante ou cupom |
| "meu dinheiro" | o dinheiro da empresa | **é a confusão que você existe para desfazer** |

---

# 11 · Onde está cada coisa

| Documento | Para quê |
|---|---|
| **Este manual** | operação: o que entrega, como usar, o ciclo do mês |
| `11_GO_TO_MARKET.md` | vendas: público, preço, canais, scripts, objeções |
| `07_MEI_O_QUE_SABER.md` | a base legal do MEI, para não ser pego de surpresa |
| `05_ROTEIRO_DO_SERVICO.md` | os roteiros completos de conversa |
| `04_MAPA_DO_APP.md` | o desenho de cada tela e por que ela existe |
| `08_DIFERENCIAL.md` | o raciocínio por trás do que torna o serviço único |
| `09_PRINCIPIOS_DE_VALOR.md` | a lente por trás do que o sistema revela e do que deixa quieto |
| `DECISOES.md` | a fonte de verdade: o que vale hoje, e por quê — consulte antes de confiar em qualquer outro documento |
| `SESSION_STATE.md` | o histórico técnico: o que foi construído, quando e por quê |

**Este manual é vivo.** Editou o Markdown, rode `npm run pdf` e o PDF sai atualizado.
