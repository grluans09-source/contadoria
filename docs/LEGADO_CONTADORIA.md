---
titulo: Legado do Contadoria
subtitulo: Tudo o que foi pensado, construído, aprendido e errado — para o projeto novo começar do zero sem começar do nada
versao: 1.0 — 08/nov/2026
---

# 0 · Como usar este documento

## 0.1 Para quem ele foi escrito

Para a **IA que vai construir o projeto novo** e para o **Luan**, dono dos dois.

O projeto novo é uma **refundação**, não uma continuação: mesmo propósito, cara nova, desenho
mais pensado. Este documento é a memória completa do primeiro projeto — o **Contadoria** —
para que nada do que custou caro aprender se perca, e para que nada do que estava errado seja
copiado por inércia.

**Regra de leitura:** o que está aqui é **matéria-prima para julgamento, não especificação.**
Nada deve ser reconstruído só porque existiu. Cada peça tem de passar de novo pela pergunta
"isto serve ao Luan e ao cliente dele?" (§5.4, a pergunta de sete degraus).

## 0.2 Onde o projeto antigo está

| O quê | Onde | Estado em 08/nov/2026 |
|---|---|---|
| Código e documentação | GitHub `grluans09-source/contadoria` (**privado**) | íntegro, sincronizado |
| Cópia local | `C:\Users\LUAN S\Projetos\contadoria` | íntegra; 223 testes passando |
| Site publicado | `contadoria-luan.netlify.app` (build v35, 27/set) | carrega só a tela de login |
| Banco de dados | Supabase, projeto `gmiiuklkhwjpcowvjbwz`, região São Paulo | **fora do ar** — o endereço deixou de existir no DNS público (ver §15.6) |

**O projeto antigo é fonte de LEITURA, nunca de escrita.** A IA nova pode abrir e copiar
arquivos de lá, mas não deve alterar nada naquela pasta nem naquele repositório.

## 0.3 Legenda de estado — usada no documento inteiro

| Marca | Significa |
|---|---|
| **[NO AR]** | construído, ligado a uma tela e verificado rodando |
| **[SÓ NO MOTOR]** | a regra existe e tem teste, mas **nenhuma tela mostra** — o usuário nunca viu |
| **[SÓ NO PAPEL]** | desenhado em documento, nunca construído |
| **[DESCARTADO]** | avaliado e recusado, com motivo |

A distinção entre **[NO AR]** e **[SÓ NO MOTOR]** é uma das lições mais importantes deste
legado. Vários documentos antigos descrevem como "implementado" o que só existia no motor.
Os estados abaixo foram **conferidos contra o código em 08/nov/2026**, não copiados dos docs.

## 0.4 Índice

1. O produto em uma página
2. O dono e as condições reais de trabalho
3. Modelo de negócio, mercado e preço
4. O que saber de MEI (o chão legal do produto)
5. Os princípios de valor
6. O ofício: o roteiro do serviço
7. Os oito arquétipos de negócio
8. O plano de contas
9. Inventário do sistema, tela por tela
10. As regras de cálculo, exatas
11. Modelo de dados e segurança
12. Arquitetura técnica
13. Identidade visual
14. Infraestrutura e operação
15. O que deu errado, e a lição de cada erro
16. Mapa para o projeto novo: manter, melhorar, refazer, descartar, inovar
17. Perguntas que a IA nova deve fazer antes de codar
18. Glossário

---

# 1 · O produto em uma página

**O Luan vende um serviço, não um software.** Ele atende MEIs e trabalhadores informais como
"o contador" deles — organiza o dinheiro do negócio e, todo mês, devolve clareza. O sistema
é a **ferramenta interna dele**: o cliente nunca compra, instala ou vê licença.

**A frase que define o serviço:**

> *"Eu organizo o seu dinheiro e te digo, todo mês, se o negócio está ganhando, quanto você
> pode tirar, e o que está te comendo por dentro."*

**As três perguntas que ninguém responde para o MEI** — e que o produto existe para responder:

1. **Você está ganhando dinheiro?** Quase todo dono acha que sim, e não sabe.
2. **Para onde foi o que sobrou?** O mês fechou positivo, mas a conta está vazia.
3. **Quanto você pode tirar sem quebrar o mês que vem?** A decisão financeira mais importante
   que ele toma — no chute, todo mês.

**A tradução que sustenta tudo**, repetida em toda entrega:

| Termo | O que é |
|---|---|
| Faturamento | o que entrou |
| Lucro | o que sobrou depois de tudo |
| Seu dinheiro | o que dá para tirar sem quebrar o mês que vem |

**O que o produto entrega**, em três gavetas:

- **Obrigação** — o que o MEI precisa ter (relatório mensal, DAS, declaração anual, limite).
- **Gerencial** — onde está o valor: resultado do mês, para onde foi o dinheiro, quanto pode
  tirar, o que vence, empresa × pessoa.
- **Revisão** — o papel de auditor: conciliação, verificações de integridade, achados,
  trilha, fechamento com selo, carta de recomendações.

**O diferencial em uma linha:** todo contador entrega retrato (faturamento, lucro). O
Contadoria entrega **decisão** ("você pode tirar R$ 2.100 este mês") e **prova de
transformação** ("você me disse que tirava R$ 2.000; os números mostram R$ 4.100").

---

# 2 · O dono e as condições reais de trabalho

Estas condições não são detalhe — moldaram (e devem continuar moldando) o desenho.

| Condição | Consequência para o produto |
|---|---|
| **Estudante de Contabilidade, ainda sem CRC** | só relatório **gerencial**; nunca peça oficial assinada (§4.7) |
| **Único usuário do sistema** | sem planos, cobrança, trial, onboarding de estranho, suporte |
| **Usa no celular e no notebook** | tem de funcionar bem nos dois, de qualquer lugar |
| **Não é programador** | explique em português simples; ele decide produto, a IA decide técnica |
| **Escreve rápido, informal, às vezes em maiúsculas e sem acento** | entenda a intenção, não corrija a forma |
| **Trabalha numa empresa; o OneDrive do PC é da empresa** | nada do projeto, nenhum segredo, nenhum dado de cliente em pasta sincronizada por terceiro (§14.5) |
| **Tem três contas de GitHub no mesmo PC** | `grluans09-source` (pessoal, dona do projeto), `nba99926` (trabalho), `lnfinanceiro9-commits` (outro projeto) — ver §15.8 |
| **Tem outros sistemas** | ContLife (finanças pessoais, mesmo dono), sistemas da empresa (ABN), "fin" — **independentes**; não misturar |
| **Zero clientes reais até hoje** | tudo foi validado com dado fictício; preços e tempos são estimativa, não medição |

**Como ele quer trabalhar com a IA** (regra permanente, herdada do ContLife):

> *"Você não é só o executor. Eu trago uma questão, você analisa, critica, melhora, refina —
> depois colocamos em prática."*

A IA tem **obrigação de discordar** quando enxergar melhor, de apontar custo escondido antes
de construir e de perguntar o que for ambíguo. E tem autorização permanente para **salvar
(commitar) sem pedir**; publicar (deploy) continua exigindo autorização.

**Escolha de modelo, regra dele:** Fable = marca e gosto · Opus = arquitetura e julgamento ·
Sonnet = implementação padrão · Haiku = trabalho braçal verificável. A IA não troca o
modelo — **avisa** quando valer trocar, numa linha, antes do bloco de trabalho.

---

# 3 · Modelo de negócio, mercado e preço

## 3.1 Por que serviço e não software (decisão A1, 11/ago)

1. **O diferencial é ele destrinchar, não a tela.** Vender licença transforma o diferencial
   em commodity.
2. **Software para MEI é mercado ruim:** baixa disposição a pagar, suporte caro, concorrência
   com planilha grátis.
3. **O limite do CRC fica mais folgado** prestando serviço gerencial ele mesmo do que vendendo
   um sistema que se apresenta como "sua contabilidade".
4. **Construir para 1 usuário é ~10x mais simples.**

**Contra-argumento registrado:** serviço não escala além das horas dele. A resposta não é
vender licença — é o sistema **elevar o teto** de clientes que ele atende na mesma semana.

## 3.2 O achado de mercado: o MEI é órfão (pesquisado em ago/2026)

| Quem | O que faz com o MEI |
|---|---|
| Contador tradicional | R$ 50 a R$ 200/mês, entregando basicamente a guia do DAS |
| Contabilidade online (Agilize, Contabilizei) | não atende MEI, ou só ME a partir de ~R$ 195/mês |

A Lei Complementar 128/2008 dispensou o MEI de escrituração obrigatória. **Sem conformidade
para vender, o mercado inteiro o ignora.** Milhões de MEIs não *precisam* de contador, mas
precisam desesperadamente de alguém que diga se estão ganhando dinheiro.

**Consequência estratégica:** não vender contabilidade — **vender clareza.** Quem se apresenta
como "faço a contabilidade do seu MEI" ouve "mas eu não preciso de contador" (e o cliente
está certo).

## 3.3 Os quatro segmentos (por situação do dinheiro)

| Segmento | Por que importa | Preço |
|---|---|---|
| **MEI perto do limite** | dor real, datada e cara (estouro acima de 20% é retroativo a janeiro); fecha rápido | faixa alta |
| **MEI de conta misturada** | o mais comum; o diagnóstico é devastador aqui | faixa média (o cliente-padrão) |
| **MEI com funcionário** | folha, FGTS, eSocial — serviço muito maior | o dobro da média, no mínimo |
| **Informal no dinheiro vivo** | mais fácil de conseguir, ninguém disputa, risco fiscal zero; vira cliente que cresce com ele | faixa de entrada |

Os segmentos cruzam com os **arquétipos** (§7): o segmento decide *quando* fecha e *quanto*
paga; o arquétipo decide *qual dor específica* usar na conversa.

## 3.4 Preço proposto (estimativa de mercado, nunca validada com cliente)

| Plano | Para quem | Entrega | Valor |
|---|---|---|---|
| Essencial | informal ou MEI simples | organização + Retrato do Mês + 1 conversa | R$ 120/mês |
| **Completo** (o alvo) | MEI padrão | + conciliação, revisão, carta, vigia do limite, controle do DAS | **R$ 180/mês** |
| Completo + | com funcionário ou perto do limite | + folha/limite + consultoria mensal | R$ 320/mês |

Avulsos: diagnóstico (grátis para os 5 primeiros, depois R$ 97) · entrada de cliente novo
(R$ 150, ou grátis no anual) · consultoria pontual (R$ 250-450) · acompanhamento de transição
MEI → ME (R$ 400-800; quem assina é contador registrado).

**Regras de preço:** nunca por hora · ancorar no valor, não no custo · preço redondo e
público · reajuste anual em janeiro combinado desde o início.

## 3.5 Capacidade e o gargalo real

- **Tempo estimado em regime:** ~1 hora por cliente por mês (com sistema) contra 2 a 2,5 h
  (com planilha). Entrada de cliente novo: 2 a 4 horas, uma vez.
- **Teto com ~25 h/mês:** 6 a 8 clientes com planilha; **15 a 20 com o sistema.**
- **Os quatro gargalos, em ordem de dor:** (1) conseguir cliente · (2) arrancar a informação
  do cliente · (3) digitar e classificar · (4) gerar relatório. O dono supunha que eram o 3 e
  o 4 — **são os últimos.**
- **No ano 1, a capacidade não é o limite — a venda é.** Expectativa: 4 a 10 clientes no fim
  do ano 1; ~R$ 1.400 a R$ 2.200/mês entre os meses 7 e 12.
- **Regra de prioridade que saiu daqui:** funcionalidade que economiza minutos por cliente por
  mês vale mais que funcionalidade que impressiona.

## 3.6 O Diagnóstico Gratuito — a máquina de venda

*"Se você só implementar uma coisa do go-to-market, implemente esta."*

1. **Convite:** "me manda um mês de extrato (ou me conta o que entrou e saiu); eu monto uma
   página com os seus números. Sem compromisso."
2. **Antes de mostrar qualquer número, pergunte e anote na frente dele:** "quanto você acha
   que faturou? quanto acha que sobrou pra você?"
3. Rode no sistema: cadastro, balanço de abertura simplificado, classificar o mês, fechar,
   gerar o Retrato.
4. **Entregue em pessoa ou por chamada**, nunca só o arquivo: o que aconteceu → para onde foi
   → **a comparação com o chute dele** → uma coisa boa → uma coisa para arrumar.
5. Fechamento: "isso é o que eu te mando todo mês. São R$ 180. Começamos mês que vem?"

**Por que funciona:** mostra em vez de descrever; a maioria nunca viu os próprios números
organizados; inverte a conversa ("e se eu quiser isso todo mês?").

**Canais, em ordem de eficácia real:** círculo próximo (cliente nº 1) · onde o MEI está
fisicamente · o cliente atual como prova (indicação) · grupos locais de WhatsApp · parcerias.

> **Estado no sistema antigo:** o diagnóstico era feito **à mão**, criando um negócio comum.
> Não existia fluxo próprio de "prospecto". Ver §16.5.

---

# 4 · O que saber de MEI (o chão legal do produto)

> Estrutura muda raramente. **Números mudam por lei, sem aviso.** No sistema, todo número
> fiscal vive numa tabela com fonte e data de conferência — **nunca no código.** E nunca se
> diz um número fiscal de cabeça a um cliente: "deixa eu confirmar e te respondo hoje".

## 4.1 Fatos estruturais

1. **É empresário individual — não há separação de patrimônio.** Dívida do negócio alcança
   os bens pessoais. O CNPJ não é escudo.
2. **Paga valor fixo (DAS), não percentual.** Faturando zero ou o teto, o DAS é o mesmo.
3. **Pode ter 1 empregado.**
4. **A atividade precisa estar na lista de ocupações permitidas** (contador, por exemplo, não
   está). Conferir CNAE caso a caso no cadastro.

## 4.2 As quatro obrigações

| Obrigação | Quando | O que pega |
|---|---|---|
| DAS mensal | vence dia 20 | atrasar gera juros **e** buraco na contagem previdenciária |
| Relatório Mensal de Receitas Brutas | até dia 20 do mês seguinte | é **guardado, não enviado**; separa comércio/indústria de serviço |
| DASN-SIMEI (declaração anual) | até 31 de maio | obrigatória **mesmo faturando zero** |
| Nota fiscal | na venda | obrigatória para empresa; para pessoa física só se pedirem |

## 4.3 O DAS

INSS (5% do salário mínimo, sempre) + ICMS (comércio/indústria) e/ou ISS (serviço), valores
fixos pequenos. **Sobe todo janeiro** com o salário mínimo. Despesa **não abate** nada — e
explicar isso já é entrega: *"Sua despesa não muda o seu imposto. Mas muda o seu lucro — e é
disso que eu cuido."*

## 4.4 O limite de faturamento — a parte mais perigosa

- Teto anual de **receita bruta** (tudo o que entrou de venda; não é lucro). Em 2026:
  **R$ 81.000**, com dois projetos de lei para aumentar (PLP 108/2021, aprovado no Senado,
  R$ 130 mil; PLP 186/2026, na Câmara desde jun/2026) — **nenhum era lei em ago/2026.**
- **Proporcionalidade no 1º ano:** quem abre no meio do ano tem teto proporcional aos meses de
  atividade, contando o mês da abertura. Quem abriu em julho tem cerca de metade.
- **Estouro até 20%:** continua MEI até 31/12, paga a diferença, desenquadra em 1º de janeiro.
- **Estouro acima de 20%:** desenquadramento **retroativo a janeiro do próprio ano** — 12
  meses de tributo de uma vez.
- Desenquadrado, vira ME e **precisa de contador registrado.** Avisar antes é o que gera
  confiança.

## 4.5 Previdência — a dúvida nº 1 do cliente

Com o DAS em dia: aposentadoria **por idade**, auxílio-doença, salário-maternidade, pensão por
morte e auxílio-reclusão. **Não** dá aposentadoria por tempo de contribuição (exige
complementar). Benefícios têm **carência**. DAS atrasado pode não contar para carência.

## 4.6 Informal

**Obrigação nenhuma** — o serviço é 100% gerencial. Perde: vender para empresa, emitir nota,
INSS, crédito PJ. A conversa "vale a pena formalizar?" é das melhores consultorias, e deve
ficar para o **2º ou 3º mês**, quando há número real para sustentá-la.

## 4.7 O limite profissional — os quatro "não faço"

Ditos em voz alta na primeira conversa:

- não emito nota fiscal por você
- não acesso sua conta bancária
- não assino peça contábil oficial (ECD, ECF, SPED, balanço assinado) — sou estudante, sem
  CRC; entrego **relatório gerencial**
- não falo com a Receita por você

**Encaminhar, em vez de responder:** desenquadramento e transição para ME · parcelamento e
defesa fiscal · questão trabalhista · qualquer peça oficial · planejamento tributário de quem
não é mais MEI.

**Vocabulário regulado:** "auditoria" e "parecer de auditoria" são termos de profissão. O
documento do cliente se chama **Revisão de Consistência** ou **Conferência do Período**, e
todo documento entregue leva o rodapé de **relatório gerencial, não peça contábil oficial**.

**LGPD, uma linha:** guardar o mínimo de dado de terceiro (sem CPF onde não precisar, nenhuma
senha de cliente em lugar nenhum) e jamais mostrar o dado de um cliente na tela de outro.

---

# 5 · Os princípios de valor

## 5.1 A lente

> Ninguém compra a furadeira; quer o furo — e, no fundo, o quadro na parede.

**O produto não é a escrituração. É a decisão melhor que ela permite.** A cadeia é:

```
DADOS -> CONTEXTO -> ENTENDIMENTO -> DIAGNÓSTICO -> INSIGHT
      -> DECISÃO -> AÇÃO -> RESULTADO -> TRANSFORMAÇÃO
```

**Correção da metáfora (B9):** o cliente da furadeira *sabe* que quer o furo. **O MEI não sabe
que tem problema.** Não há demanda a atender — há **consciência a criar**. Por isso o
Diagnóstico Gratuito é o espelho, e a conversa de entrega vale tanto quanto o número.

## 5.2 Os oito princípios

| # | Princípio | Consequência prática |
|---|---|---|
| P1 | A entrega é a decisão, não o relatório | toda tela responde "que decisão isto melhora?" |
| P2 | O sistema fala com o Luan; o Luan fala com o cliente | achado automático nunca chega ao cliente sem julgamento humano; achados vivem na Revisão, nunca no Retrato |
| P3 | Silêncio é resposta válida | sem evidência suficiente, a análise devolve vazio — e vazio não é falha |
| P4 | Todo achado traz evidência, valor em R$, hipótese inocente e confiança | observação vira decisão; a hipótese inocente impede acusação apressada |
| P5 | Recomendação é hipótese testável | o que fazer → efeito esperado → efeito medido; **mostra coincidência temporal, nunca afirma causalidade** |
| P6 | Medir o antes, ou não haverá depois | linha de base capturada no início e **imutável** |
| P7 | Complexidade no motor, nunca na tela | 200 linhas de regra para gerar uma frase de 12 palavras: ótimo |
| P8 | Nem tudo vira transformação | Diário, Razão, Balancete, Conciliação e Trilha continuam "chatos" — são a base de confiança |

## 5.3 As cinco travas contra o alarmismo

1. **Piso de evidência** — cada análise declara o mínimo de meses fechados; abaixo, silêncio.
2. **Evidência anexada** — o Luan clica e vê os lançamentos que geraram o achado.
3. **Hipótese inocente obrigatória.**
4. **Achado é pergunta para o Luan, não afirmação para o cliente.**
5. **Nada de comparação entre clientes** sem massa de dados — e jamais expor um cliente a outro.

## 5.4 A pergunta de sete degraus (vale para toda funcionalidade)

(1) O que isso faz? · (2) Que problema resolve? · (3) Por que importa? · (4) Qual decisão
melhora? · (5) Qual resultado produz? · (6) Qual transformação gera? · **(7) Existe jeito
melhor de gerar a mesma transformação?** — o degrau que mais dói; a resposta pode ser
simplificar, automatizar ou **remover**.

## 5.5 As três coisas desconfortáveis (ainda verdadeiras)

1. **A maior transformação hoje é a do Luan** — o sistema dobra a capacidade dele.
2. **Transformação sem cliente é zero.** Até haver carteira, a máquina de venda pode valer
   mais que aprofundar análise.
3. **A transformação mais valiosa costuma ser "não fazer"** (evitar a compra errada, o
   desenquadramento) — e não deixa rastro a menos que seja registrada.

## 5.6 O que fazia o código ser "elite" (regra, não adjetivo)

Integridade garantida pelo **banco**, não pela tela · um conceito por arquivo · português em
tudo (código, comentário, tela, commit) · comentário explica o **porquê** · teste que sabe
falhar (sabotar de propósito antes de confiar) · caso negativo antes do positivo · nenhum
número de lei no código · **definição de pronto = roda + testado nos dois sentidos +
documentado + commitado.**

---

# 6 · O ofício: o roteiro do serviço

## 6.1 Três camadas, só uma é documento

| Camada | O que é | Onde vivia |
|---|---|---|
| Roteiro | as perguntas na ordem certa, virando registro real | dentro do sistema, conduzindo a tela |
| "Por que importa" | a explicação de cada dado, no ponto de uso | dentro do sistema, sob demanda |
| Manual | o texto corrido, para estudar | documento |

**O roteiro aprende:** as perguntas são **dado editável no banco**, não texto no código. Depois
de 10 clientes, o roteiro é o ofício dele, não o chute da IA.

## 6.2 Roteiro do Cliente Novo — a primeira conversa (30 a 45 min)

Antes de começar, uma escolha decide o resto: **o arquétipo** (o que o negócio faz para
ganhar dinheiro, §7). Ele define o plano de contas, os campos do balanço de abertura e as
perguntas extras.

O roteiro é **adaptativo em duas camadas**: (1) por **tipo** (MEI/informal) e **arquétipo** —
pergunta sem marca vale para todos; (2) **essencial × aprofundamento** — só o essencial na
primeira conversa; o resto nos meses seguintes. Entrevista longa faz o cliente desistir.

**Bloco 1 — Quem é.** Nome e como quer ser chamado · tem CNPJ de MEI ou é informal ·
*(MEI)* quando abriu (proporcionalidade do 1º ano) · *(MEI)* atividade principal (ICMS, ISS
ou os dois; coluna do relatório) · *(MEI)* tem funcionário · *(informal)* vende para empresa ·
*(informal, aprofundamento)* já pensou em abrir CNPJ, o que segura · WhatsApp.

**Bloco 2 — Como o dinheiro anda.** Tem conta separada · **usa o mesmo dinheiro para o
negócio e para as suas coisas?** (a pergunta mais importante — liga o modo "dinheiro
misturado", §10.6) · qual banco, exporta extrato · recebe como (dinheiro, Pix, maquininha,
boleto — a maquininha tem taxa invisível e prazo de recebimento) · vende fiado · compra a
prazo · emite nota.

**Bloco 3 — A foto de hoje (balanço de abertura).** Dinheiro em mãos e na conta · o que o
negócio tem que vale dinheiro · o campo específico do arquétipo · quem te deve, quanto, para
quando · quanto você deve, para quem, quando vence · empréstimos. **Valor aproximado basta.**
Cada dívida é classificada em um de três tipos (§10.7). A última linha — o que sobra para o
dono — é **calculada, não perguntada.**

**Bloco 4 — O ritmo.** Quais contas você paga todo mês (vira cadastro real de recorrentes) ·
quanto costuma faturar · **quanto você tira por mês para viver** (quase ninguém sabe) · quantas
horas por semana trabalha · *(aprofundamento)* mês forte e mês fraco · principais
produtos/serviços e preço · + as perguntas do arquétipo (§7).

**Bloco 5 — O que ele quer.** O que mais incomoda no dinheiro · sabe se está ganhando
dinheiro · tem meta (comprar, contratar, abrir ponto). Alimenta a Carta de recomendações.

**Bloco 6 — O combinado.** Como e até quando ele manda a informação · o que você entrega e
quando · quanto e como paga · **o que você não faz** (§4.7). *Fica fora do formulário público
de propósito: é negociação olhando no olho, não coleta.*

**O que fica congelado no fim:** o **retrato de entrada** (§10.5).

## 6.3 Roteiro do Mês — o ritmo fixo

| Dias | O quê |
|---|---|
| 1 a 5 | cobrar todo mundo (mensagem pronta) |
| 5 a 12 | classificar o que chegou |
| 12 a 15 | conciliar, revisar, fechar o mês |
| 15 a 18 | gerar as entregas e **conversar com cada cliente** |
| até o 20 | conferir que todos pagaram o DAS |

Fora do ritmo: **janeiro** (virada de ano, DAS sobe, reconferir parâmetros fiscais) e **até
31/5** (declaração anual). **Cliente que atrasa entra no ciclo do mês seguinte** — a bagunça
dele não vira a agenda do Luan.

## 6.4 Roteiro da Conversa — entregando o mês

Sempre a mesma ordem: (1) o que aconteceu — entrou, saiu, sobrou · (2) **para onde foi o que
sobrou** · (3) uma coisa boa · (4) **uma** coisa para arrumar (duas viram nenhuma) · (5) o que
vem por aí — vencimentos e limite do ano.

| Situação difícil | O que dizer |
|---|---|
| Mês ruim | mostrar a série antes do número do mês |
| Mistura tudo | não repreender; o número faz o sermão: "você tirou R$ 4.100, o negócio gerou R$ 2.800" |
| Não mandou nada | "não consigo fechar sem isso — junto com o mês que vem"; duas vezes seguidas é conversa sobre o combinado |
| "Dá pra descontar do imposto?" | MEI paga valor fixo; despesa não abate |
| Chegando no limite | avisar cedo, com projeção; explicar a transição e quem assina |

## 6.5 Formulário Público — o cliente responde sozinho [NO AR]

Link com token, válido 30 dias, **uma pergunta por vez**, barra de progresso, **salva a cada
resposta**, retomável de onde parou, voz em 2ª pessoa sem jargão. Cobre os **Blocos 1 a 5**.
Diferenças em relação à conversa presencial:

| | Presencial (o Luan preenche) | Link (o cliente preenche) |
|---|---|---|
| Apresentação | bloco inteiro por tela | uma pergunta por vez |
| Blocos | 1 a 6 | 1 a 5 |
| Bloco 3 | tela estruturada de balanço (listas de itens) | perguntas em texto livre |
| Explicação | "por que importa", nota técnica para o Luan | `explicacao_cliente`, na voz do cliente |
| Salvamento | tudo ao concluir | a cada resposta |
| Contas fixas | cadastro estruturado | não existe |

> **Problema real apontado pelo dono (out/2026):** respostas em texto livre chegam vagas, e
> perguntar de novo ao cliente "pode soar como incompetência". Duas melhorias foram
> **decididas e não construídas** (§16.2): exemplos dentro dos campos e um checklist de
> conferência das respostas.

---

# 7 · Os oito arquétipos de negócio

**Decisão C7 (13/ago):** o arquétipo decide plano de contas, campos de abertura, perguntas
extras e achados. **Os 8 são DADOS, não 8 caminhos de código** — um nono se acrescenta sem
tocar em tela. *Substituiu um plano de contas único de comércio, que dava "Estoque" ao
eletricista e não dava "Material aplicado".*

| Arquétipo | Exemplos | Contas que só ele ganha | Campo extra no balanço | Achado próprio |
|---|---|---|---|---|
| **Revenda** | loja, sacoleira, distribuidora, mercadinho | Estoque de mercadorias (1120) · Venda de mercadorias (4101) · CMV (5120) · Frete sobre compras (5121) | mercadoria parada, a custo | taxa engolindo a margem |
| **Produção própria** | salgados, bolos, marmita, costura, marcenaria | Estoque de insumos (1121) · Produto pronto (1122) · Venda de produção própria (4102) · Insumos (5122) · Embalagem (5123) · Perda e quebra (5124) | insumo parado · produto pronto não vendido | taxa engolindo a margem |
| **Serviço com mão de obra** | eletricista, pedreiro, pintor, mecânico, diarista | Prestação de serviços (4103) · Material cobrado do cliente (4104) · Material aplicado (5130) · Ferramentas (5131) · Deslocamento (5132) · Ajudante (5133) | material comprado para serviço ainda não feito (é adiantamento, não despesa) | sem receita no período |
| **Serviço recorrente** | manutenção mensal, limpeza, aulas | Mensalidades (4105) · Serviços avulsos (4106) | — | — |
| **Digital / online** | infoproduto, freelancer, social media, e-commerce | Saldo em plataforma (1105) · Vendas online (4107) · Assinaturas (4108) · Taxa de plataforma (5140) · Anúncios (5141) · Software (5142) | dinheiro parado em plataforma | taxa engolindo a margem |
| **Beneficiamento** | manda tecido à costureira, peça à pintura, facção | Estoque (1120) · **Mercadoria com terceiros** (1123) · Venda de mercadorias (4101) · CMV (5120) · Serviço de terceiros (5150) · Perda no beneficiamento (5151) | mercadoria com terceiro agora · pronta parada com ele | mercadoria parada com terceiro |
| **Intermediação / comissão** | representante, corretor, dropshipping | Valores recebidos a repassar (1106) · **Repasses a pagar** (2105) · Comissões recebidas (4109) | dinheiro recebido que ainda vai repassar | — |
| **Locação** | ferramenta, som, brinquedo, espaço, veículo | Equipamentos para locação (1153) · Aluguéis recebidos (4110) · Manutenção de equipamentos (5160) · Seguro (5161) | equipamentos que aluga, valor de hoje | — |

**A dor típica e o gancho de venda de cada um:**

| Arquétipo | Dor típica | Gancho na conversa |
|---|---|---|
| Revenda | maquininha comendo margem; dinheiro parado na prateleira | "você sabe quanto tem parado na prateleira agora?" |
| Produção | vende no prejuízo sem perceber; perda vira "sumiço" | "já calculou quanto de insumo entra em cada salgado?" |
| Mão de obra | trabalha muito e não sobra; deslocamento não cobrado | "você cobra o deslocamento até o cliente?" |
| Recorrente | inadimplência silenciosa; dependência de poucos clientes | "algum cliente atrasa a mensalidade sem você perceber?" |
| Digital | a taxa já vem descontada e ele nunca a vê sair | "já somou quanto a plataforma desconta?" |
| Beneficiamento | mercadoria dele fora da mão dele, sem controle | "quanto de mercadoria sua está com terceiro agora?" |
| Intermediação | confundir o bruto recebido com receita própria (infla o limite do MEI) | "você separa o que é comissão do que é repasse?" |
| Locação | equipamento parado é capital sem retorno | "quantos dias por mês cada equipamento fica parado?" |

**O caso mais delicado, verificado ao vivo em 15/ago:** intermediação com R$ 3.000 recebidos
e R$ 2.500 de repasse resulta em patrimônio de **R$ 500**, não R$ 3.000.

**Quatro situações que cruzam qualquer arquétipo:** dinheiro misturado (o cenário mais
comum) · informal no dinheiro vivo (sem extrato; revisão vira consistência interna) · MEI
perto do limite · MEI com funcionário (outro produto, outro preço).

---

# 8 · O plano de contas

**Base + arquétipo** (`planoBase()` + `planoDeFabrica(arquetipo)`). O dono pode depois
acrescentar ou **desativar** contas — nunca excluir conta com movimento.

| Grupo | Contas do base (todo negócio) |
|---|---|
| 1 Ativo | Caixa · Banco · A receber de maquininha · Clientes · Equipamentos · Veículos · Depreciação acumulada |
| 2 Passivo | Fornecedores · DAS a pagar · Empréstimos · Salários a pagar |
| 3 Patrimônio | Capital do titular · **Retiradas do titular** · Lucros acumulados |
| 4 Receitas | Outras receitas *(a receita principal vem do arquétipo)* |
| 5 Despesas | Aluguel · Energia · Água · Internet e telefone · **Taxa de maquininha** · Combustível · Material de consumo · Marketing · DAS · Depreciação · Tarifas bancárias · Outras |

**Quatro escolhas que não são arbitrárias:**

1. **A receita principal não está no base** — cada arquétipo nomeia a sua; impede o
   eletricista de lançar o próprio trabalho como "venda de mercadorias".
2. **Retiradas do titular é PATRIMÔNIO, não despesa** (regra C3) — o erro conceitual nº 1 do
   dono pequeno. É a conta que responde "quanto você já tirou este ano".
3. **A receber de maquininha é separada de Banco** — a venda é hoje, o dinheiro cai em dias.
4. **Taxa de maquininha tem conta própria** — a despesa invisível que come margem.

Estoque e CMV **não estão no base**: só entram para quem compra ou produz mercadoria.
Numeração com folga (1120+ estoques, 5120+ custos, 5130+ serviço, 5140+ digital) para
acrescentar sem renumerar.

---

# 9 · Inventário do sistema, tela por tela

**Fluxo:** login → **Prateleira** (todos os clientes) → abrir um negócio → **Livro** (14 abas).
Da Prateleira também se abre o **Painel do Mês**. Negócio novo começa pelo **Roteiro do
Cliente Novo**.

## 9.1 Fora do negócio

| Tela | O que fazia | Estado |
|---|---|---|
| Autenticação | entrar, criar conta, link mágico, recuperar senha; erros traduzidos para português | [NO AR] — link mágico e recuperação dependem do endereço do site estar na lista de redirecionamento do Supabase |
| Prateleira | um card por cliente: nome, tipo (MEI/Informal), "sobrou/faltou R$ X este mês" ou "Roteiro pendente"; criar negócio escolhendo o arquétipo | [NO AR] — **o dono achou "muito pobre"** (out/2026) |
| Painel do Mês | todos os clientes ordenados por urgência — *nada chegou / faltam N itens / pronto / fechado* — com botão "copiar mensagem de cobrança" para o WhatsApp | [NO AR] — menos granular que o desenho original (§15.13) |
| Roteiro do Cliente Novo | 6 blocos; botão "mandar para o cliente" (gera o link); balanço de abertura estruturado; contas fixas viram recorrentes; grava o retrato de entrada | [NO AR] |
| Formulário Público | §6.5 | [NO AR] |

## 9.2 Dentro do negócio — as 14 abas do Livro

| Aba | O que fazia | Estado |
|---|---|---|
| **Caixa de Entrada** | importar extrato CSV/OFX com prévia; fila de itens com três saídas: **Classificar** (conta sugerida pelo aprendizado), **É pessoal** (vira **Retirada/Aporte** quando o dinheiro é misturado) e **Não sei** (pilha de dúvidas) | [NO AR] |
| Lançar | lançamento de N linhas, com validação de equilíbrio e vencimento opcional quando a conta é a receber/a pagar; também edita | [NO AR] |
| Diário | tudo em ordem de data; editar e excluir (com confirmação em duas etapas) só lançamentos manuais/extrato/recorrentes — abertura e encerramento são travados | [NO AR] |
| Razão | o movimento por conta, com saldo corrente | [NO AR] |
| Balancete | todas as contas com saldo e a prova de que débito = crédito | [NO AR] |
| Conciliação | marcar cada lançamento como "bate com o extrato" | [NO AR] |
| A receber/pagar | recebíveis e pagáveis em aberto, com "dar baixa" (escolhe caixa/banco e data) | [NO AR] — só baixa pelo valor cheio |
| **Revisão** | Mesa de Revisão (5 verificações, §10.3) · Achados com evidência e hipótese inocente (§10.4) · fechar e reabrir mês · últimas entradas da trilha | [NO AR] |
| **Entregas** (Retrato do Mês) | resultado do mês em número grande · "para onde foi" · **quanto você pode tirar**, com a conta aberta · **o que vem por aí, próximos 60 dias** · Carta de recomendações com "foi seguida?" · "O que evitamos" · aviso de perguntas de aprofundamento pendentes · rodapé de relatório gerencial | [NO AR] — **mas sem exportar, imprimir ou compartilhar** (§15.5) |
| Memória | linha do tempo: o retrato de entrada como primeiro evento, depois cada mês fechado com resultado e carta; no topo, "desde que começamos" | [NO AR] — só leitura |
| Roteiro | todas as perguntas do cliente, respondidas e pendentes, editáveis a qualquer momento | [NO AR] |
| Plano de contas | acrescentar conta, ativar/desativar | [NO AR] |
| Recorrentes | modelos de lançamento mensal; "gerar lançamentos do mês" sem duplicar | [NO AR] |
| Negócio | editar cadastro (nome, apelido, CNPJ, atividade, WhatsApp, funcionário, situação) | [NO AR] |

**Comportamentos transversais [NO AR]:** salvamento automático sem botão "salvar" (§12.4) ·
tradução da partida dobrada para português ao lado do lançamento · "por que isso importa?"
recolhível ao lado das perguntas · lixeira que guarda o lançamento apagado (**sem tela para
restaurar**) · trilha append-only · trava de mês fechado aplicada no ponto central de escrita.

## 9.3 O que estava no motor mas nunca chegou à tela [SÓ NO MOTOR]

**Achado de 08/nov/2026, conferido no código — corrige o que os documentos antigos diziam:**

| Peça | Onde | O que faltou |
|---|---|---|
| **Vigia do limite do MEI** — projeção de quando o cliente bate o teto, com as duas faixas (até 20% / acima de 20%) e a proporcionalidade do 1º ano | `valorDoTempo.mjs`: `projecaoDoLimite`, `aviseSobreOLimite` (testados) | **nenhuma tela chama essas funções.** A "funcionalidade mais valiosa do sistema", segundo o próprio guia de MEI, nunca foi vista pelo usuário |
| **Hora do dono** (quanto vale a hora de trabalho vs. o mínimo por hora) | `horaDoDono`, `minimoPorHora` | só é usada para compor o retrato de entrada; não há leitura mensal na tela |
| **Parâmetros fiscais** (limite, DAS, prazos, salário mínimo — 7 chaves de 2026, com fonte) | tabela `parametros_fiscais` | **populada e nunca lida por nenhuma tela** |

## 9.4 O que ficou só no papel [SÓ NO PAPEL]

- **A gaveta inteira de Obrigação:** controle do DAS (pago/em aberto/vencido) · Relatório
  Mensal de Receitas Brutas (separando comércio/indústria de serviço) · base da DASN-SIMEI ·
  calendário de obrigações · registro de notas emitidas.
- **Virada de ano** (lançamento de encerramento zerando o resultado contra o patrimônio) — a
  origem `encerramento_ano` existe no modelo, o fluxo não.
- **Balanço com "dois rostos"** (completo para o Luan; "o que tem · o que deve · o que sobra é
  seu" para o cliente).
- Ponto de equilíbrio · comparativo mês a mês e sazonalidade · margem por produto (G2) ·
  concentração por cliente (G1).
- Exportar/compartilhar o Retrato do Mês (PDF ou imagem).
- **Coleta mensal pelo link** — o tipo `mes` existe na tabela de formulários; só `onboarding`
  é criado.
- Lançamento de "resumo do dia/semana" e marca de "dado declarado pelo cliente, não
  comprovado" (pensados para o informal do dinheiro vivo).
- Recomendação como hipótese testável, com efeito esperado × medido (F5) — adiada até haver
  cliente com 3 meses fechados.
- Portal do cliente só leitura (v2) — desenho de permissão preparado, tela nunca feita.
- As três melhorias decididas em out/2026 (§16.2).

---

# 10 · As regras de cálculo, exatas

Todas eram **funções puras** em `src/dominio/`, testadas no Node sem navegador.

## 10.1 "Quanto você pode tirar este mês" — o número mais forte

```
quanto pode tirar =   disponível hoje
                    + a receber (próximos 30 dias)
                    - compromissos (próximos 30 dias)
                    - reserva
                    (nunca negativo: o mínimo é zero)
```

- **Disponível hoje** = saldo de Caixa + saldo de Banco.
- **A receber (30 dias)** = linhas da conta Clientes com vencimento entre hoje e hoje+30,
  **excluindo as já baixadas**, e **capado no saldo atual da conta** (usa o menor dos dois — a
  soma por vencimento pode superestimar se algo já foi pago).
- **Compromissos (30 dias)** = o mesmo, nas contas Fornecedores, DAS a pagar, Empréstimos e
  Salários a pagar, cada uma capada no seu saldo.
- **Reserva** = **a MAIOR despesa total de um mês** entre os últimos até 3 meses **fechados**.
  Sem mês fechado, reserva = 0 ("sem histórico, não se inventa número").
- **As três honestidades:** é recomendação, não garantia ("com base no que você me passou") ·
  **mostrar a conta sempre** (as quatro parcelas aparecem embaixo do número) · **errar para
  baixo**.
- **Exemplo conferido à mão:** R$ 1.000 disponível + R$ 300 a receber − R$ 400 de reserva =
  **R$ 900.**

## 10.2 "O que vem por aí" — fluxo de caixa projetado (60 dias)

Parte do saldo de hoje e aplica, dia a dia, os vencimentos a receber/a pagar e os recorrentes
ativos. **Não projeta receita futura que não esteja registrada** — chutar venda transformaria
o aviso em ficção otimista. Dois níveis de aviso: **aperto** (o caixa fica negativo num dia
específico — "é o dia em que o dinheiro acaba se nada mudar") e **apertado** (não fica
negativo, mas o menor saldo do período cai abaixo de 10% do que sai nele — piso relativo, não
um valor fixo). Cada aviso vem com o que fazer: antecipar recebimento, adiar pagamento,
segurar a retirada, evitar compra grande.

**Por que importa:** micronegócio não morre de prejuízo; **morre de ficar sem dinheiro num dia
específico.** Exemplo provado: com R$ 1.000 em caixa, R$ 1.800 vencendo dia 20 e R$ 1.500
entrando dia 25, o "quanto pode tirar" dá +R$ 700 e a projeção acusa **−R$ 800 no dia 20**.
Não é contradição — é a diferença entre **saldo** e **sequência**.

## 10.3 Mesa de Revisão — as 5 verificações

1. Toda linha referencia lançamento e conta existentes (nenhuma órfã)
2. Datas e valores válidos (data no formato certo, valor > 0)
3. Identificadores únicos (sem duplicidade)
4. Todo lançamento tem débito = crédito
5. **Equação patrimonial fecha:** Ativo = Passivo + PL + Receita − Despesa

**Tudo recalculado da fonte (as linhas), nunca de um resumo** — lição paga no ContLife, onde
uma checagem comparava um número com a fórmula que o definia e dizia "fecha" com o livro
furado em R$ 1.500. **Só se fecha um mês se as 5 passarem.** As que "nunca deveriam falhar"
(o banco já impede) existem como defesa em camadas: se falharem, é bug sério ou escrita por
fora do app.

## 10.4 Achados — os 7 tipos

| Achado | Quando dispara | Para quem | Hipótese inocente (texto obrigatório) |
|---|---|---|---|
| Mês sem movimento | buraco entre o primeiro e o último mês com lançamento | todos | sazonal parado de propósito, ou lançamento esquecido |
| Despesa fora do padrão | mês aberto vs. média dos meses **fechados** na mesma conta; só roda com ≥1 mês fechado | todos | compra grande única, não necessariamente problema |
| Receita sem dinheiro | linha de receita cuja contrapartida não é caixa/banco/a receber | todos | correção, permuta, venda com troca |
| Retirada acima do resultado | tirou mais do que o negócio gerou; roda desde o 1º mês | todos | uso de reserva de meses anteriores |
| Mercadoria parada com terceiro | saldo em "Mercadoria com terceiros" há ≥ 15 dias | beneficiamento | prazo de produção normal, combinado |
| Taxa engolindo a margem | taxa de maquininha/plataforma acima de 8% da receita do mês | revenda, produção, digital | mês de vendas baixas infla o percentual |
| Sem receita no período | 40% ou mais dos dias já passados no mês sem nenhuma receita (exige ao menos um dia com receita) | mão de obra | férias combinadas, serviço não faturado |

Cada achado sai com **evidência** (os lançamentos) e a **hipótese inocente**. Achado **avisa,
mas não bloqueia** o fechamento — é diferente da Mesa.

## 10.5 Retrato de entrada — a linha de base

Gravado **uma única vez** ao concluir o roteiro, com dois lados:

- **Declarado** — o que ele respondeu: faturamento mensal, retirada mensal, horas por semana,
  se acha que ganha dinheiro, o que incomoda, a meta.
- **Medido** — o que o balanço de abertura mostrou: caixa e banco, a receber, dívidas do
  negócio, patrimônio líquido.

**O instinto era guardar números — mas o número já está no livro. O que some para sempre é o
que ele ACREDITAVA.** A frase que justifica a peça, meses depois:

> *"Quando começamos, você me disse que tirava R$ 2.000,00 por mês. O que os números mostram
> é R$ 4.100,00 — R$ 2.100,00 a mais do que você imaginava."*

**Imutável no BANCO** (gatilho), não só na tela: qualquer caminho novo — importação, correção,
script — poderia sobrescrever, e a linha de base deixaria de ser linha de base.

## 10.6 Dinheiro misturado (regra C5)

Quando o cliente usa o mesmo dinheiro para tudo, o negócio é tratado como dono de **todo** o
dinheiro: gasto pessoal **saindo** vira lançamento real de **Retirada**; dinheiro pessoal
**entrando** vira **Aporte** (não receita — senão infla o faturamento e dispara alarme falso
do teto). *Substituiu o "é pessoal, ignorar", que fazia o livro achar que o dinheiro
continuava lá; a conciliação nunca fecharia.* Provado: saldo 1000 − 200 + 300 = 1100, balancete
em zero.

## 10.7 As três classificações de dívida (regra C6)

| Tipo | Exemplo | Entra no livro? |
|---|---|---|
| Do negócio | fornecedor, empréstimo no CNPJ | sim |
| **Pessoal, mas o dinheiro entrou no negócio** | empréstimo no nome dele para comprar a moto de entrega | **sim** — quem paga a parcela é o caixa do negócio |
| Só pessoal | financiamento da casa | não — mas fica **anotado**, porque muda quanto ele precisa tirar |

Deixar o caso do meio de fora faz o "quanto pode tirar" **mentir para cima**.

## 10.8 Hora do dono e projeção do limite [SÓ NO MOTOR]

- **Hora do dono** = retirada do mês ÷ (horas por semana × 4,345). Comparada ao mínimo por
  hora = salário mínimo ÷ 220. Sem uma das pontas, devolve nada (P3). Nunca diz "feche o
  negócio" — devolve número e contexto.
- **Calibração medida, não suposta:** a intuição "R$ 2.000 tirando 60 h/semana fica abaixo do
  mínimo" estava **errada** (R$ 7,67/h contra R$ 7,37/h). A fronteira real fica por volta de
  **R$ 1.920**. O alerta dispara menos do que a intuição sugere.
- **Projeção do limite:** extrapola o ritmo do ano para dizer *em que mês* o cliente bate o
  teto; considera o teto proporcional no 1º ano e separa as faixas até 20% / acima de 20%.

## 10.9 Classificação que aprende (Caixa de Entrada)

- Regras **por cliente**, não globais ("MERCADO" é insumo num cliente e pessoal em outro).
- Sugestão por **substring**; o padrão **mais específico** vence; cada confirmação soma um
  acerto.
- **Quem generaliza é o dono, não uma heurística:** ao classificar, o campo "padrão" vem com a
  descrição inteira e editável ("POSTO IPIRANGA 1234" → "POSTO IPIRANGA"). Provado: depois de
  ensinar, "POSTO IPIRANGA 9999" foi sugerido sozinho.
- Item marcado como pessoal **não é apagado** — fica registrado e reconferível.

## 10.10 Outras regras

- **Recorrentes:** cada modelo ativo vira um lançamento real no mês (`origem: recorrente`);
  não duplica se já gerou naquele mês; o lançamento gerado é editável (a conta de energia
  varia).
- **Baixa:** liga o pagamento à linha exata que ele quita (`baixa_de`); sempre pelo valor
  cheio (baixa parcial não existia).
- **Fechamento:** carimba o mês; a trava vive no ponto central de escrita (todo caminho novo
  herda a proteção); reabrir é explícito e vai para a trilha. A Carta fica **fora** da trava —
  é escrita depois de fechar e não é fato contábil.
- **Excluir lançamento:** vai para a lixeira com o conteúdo completo; itens da Caixa de
  Entrada que apontavam para ele voltam a pendentes.
- **Abertura:** id determinístico (`abertura_<negócio>`) + apagar-e-regravar no mesmo lote —
  um retry nunca duplica o balanço.
- **Regime de caixa × competência não é escolha:** venda a prazo são dois fatos (a venda e o
  recebimento). Competência = olhar contas de resultado; caixa = olhar Caixa/Banco. **Não
  existe seletor global de regime** (no ContLife existia e gerava dois resultados diferentes
  para o mesmo mês).

---

# 11 · Modelo de dados e segurança

## 11.1 As tabelas

| Tabela | Para quê |
|---|---|
| `negocios` | o cliente: nome, apelido, tipo (mei/informal), CNPJ, data de abertura, atividade, funcionário, WhatsApp, situação, início do serviço, **arquétipo**, **dinheiro_misturado** (coluna própria porque muda comportamento), **retrato_de_entrada** (jsonb, write-once), configuração |
| `membros` | quem pode ver o quê: negócio, usuário, papel (contador/cliente). Existe desde o dia 1, com uma linha por negócio |
| `contas` | plano de contas por negócio (código, nome, tipo, subtipo, ordem, ativa) |
| `lancamentos` | o fato: data, data de competência, descrição, origem, documento |
| `lancamento_linhas` | as pernas: conta, D/C, valor, descrição, vencimento, `baixa_de` (auto-referência) |
| `periodos_fechados` | mês ou ano fechado |
| `entrada_itens` | Caixa de Entrada: origem, data, descrição bruta, valor, conta de origem, situação (pendente/classificado/pessoal/dúvida), lançamento gerado |
| `regras_classificacao` | o aprendizado: padrão → conta, acertos |
| `recorrentes` / `recorrente_linhas` | modelos mensais, mesmo desenho cabeçalho + linhas |
| `cartas` | carta por mês, com "seguida?" (sim/não/pendente) |
| `evitados` | o que foi evitado, por mês, com valor estimado opcional |
| `roteiro_perguntas` | bloco, ordem, pergunta, `porque_importa`, `explicacao_cliente`, tipo de resposta, **destino**, ativo, tipos, arquétipos, essencial |
| `roteiro_respostas` | o que o cliente disse, mesmo depois de virar registro |
| `formularios` | link público: token, tipo, validade, revogado, aberto em, concluído em |
| `trilha` | append-only: quem fez o quê e quando |
| `lixeira` | o lançamento apagado, com o conteúdo inteiro |
| `conciliacoes` | lançamento marcado como "bate com o extrato" |
| `parametros_fiscais` | ano, chave, valor, **fonte**, **conferido_em** |

## 11.2 As 18 migrações, em ordem

`0001` schema inicial + RLS · `0002` trava de equilíbrio · `0003` `aplicar_lote` · `0004`
grants · `0005` seed do roteiro · `0006` descrição e vencimento por linha · `0007` conta de
origem na Caixa de Entrada · `0008` recorrentes · `0009` cartas · `0010` baixa · `0011`
arquétipos · `0012` formulário público · `0013` explicação na voz do cliente · `0014` retrato
de entrada imutável · `0015` destinos do retrato · `0016` meta para a Carta (**introduziu uma
regressão**) · `0017` evitados · `0018` corrige a 0016.

> O texto final de cada pergunta do roteiro é a soma da 0005 com as atualizações da 0011,
> 0013, 0015, 0016 e 0018. Quem quiser reaproveitar as perguntas deve ler as migrações
> **em ordem** — ou o teste `tests/destinos.test.mjs`, que recalcula o estado final.

## 11.3 Invariantes garantidos pelo BANCO (não pela tela)

1. **Débito = crédito em todo lançamento**, por gatilho **adiado** para o fim da transação,
   cobrindo inserção, alteração e exclusão de linhas — e **ignorando lançamento que não existe
   mais** (senão a exclusão acusaria desequilíbrio do que já sumiu).
2. **`on delete cascade`** de lançamento para linhas (sem linha órfã).
3. **Retrato de entrada imutável** (gatilho): 1ª gravação passa, 2ª é recusada, o resto do
   negócio continua editável.
4. **Chaves estrangeiras reais** e adiadas (a ordem das operações dentro do lote não importa).
5. **Trilha append-only** no app e no banco.

> **"Não existe lançamento torto no Contadoria — não porque a tela impede, mas porque o banco
> recusa."** Provado com o teste negativo primeiro (débito 100 / crédito 90 → HTTP 400, nada
> gravado), só depois o positivo.

## 11.4 Segurança

- **RLS por `membros`:** toda tabela filtra `negocio_id in (negócios onde o usuário é membro)`;
  só o papel `contador` escreve. Preparado para o cliente entrar com leitura na v2.
- **"Expor tabelas novas automaticamente" desligado** — grants explícitos só para
  `authenticated`, nunca para `anon`.
- **O `anon` não alcança tabela nenhuma.** A única porta sem login são três funções
  `security definer` do formulário (`formulario_abrir`, `formulario_responder`,
  `formulario_concluir`). Token inexistente, revogado e vencido respondem **igual** (não
  entrega que existiu); pergunta fora dos blocos 1-5 ou inventada é recusada; resposta acima
  de 4.000 caracteres é recusada; o formulário devolve só o apelido do negócio e as perguntas
  (sem o encanamento interno, como `destino`).
- **`aplicar_lote`:** recebe a lista de operações e aplica **numa transação só**; lista branca
  de tabelas; **freio** que recusa lote que apaga demais de uma vez; `security invoker` (a RLS
  vale dentro dela); `search_path` fixo em toda função; `negocio_id` **carimbado pelo
  servidor**.
- **Regra E7 — `destino` é contrato, texto é editável:** perguntas são localizadas pelo
  `destino`, nunca pelo texto (que o dono edita de propósito). `destino` é **chave única** por
  pergunta; em disputa, **quem congela ganha** (o retrato é irrecuperável; a Carta é
  reeditável).
- **Segredos** (tokens, senha do banco) vivem em **arquivo ignorado pelo git** — nunca no
  código, nunca no chat, nunca em log, nunca em nome de arquivo.

---

# 12 · Arquitetura técnica

## 12.1 A pilha, exatamente

| Peça | O que era |
|---|---|
| Interface | **React 18.3.1** em JSX, **sem framework**, sem TypeScript, sem biblioteca de rotas |
| Dependências no navegador | carregadas por **importmap via esm.sh** (React, ReactDOM, supabase-js 2, lucide-react 0.408) |
| Estilo | **Tailwind pelo script de CDN** (`cdn.tailwindcss.com`) para layout + variáveis CSS para cor |
| Fontes | Google Fonts: Playfair Display, Inter, IBM Plex Mono |
| Empacotamento | **esbuild** gerando `dist/contadoria.js` (~253 KB), dependências marcadas como externas |
| Backend | **Supabase**: Postgres + Auth + RLS + funções RPC; sem servidor próprio |
| Hospedagem | **Netlify**, site 100% estático, deploy **manual** pela linha de comando |
| Testes | `node --test` — **223 testes** em 20 arquivos, sem navegador |
| PDF | `pdfkit`, Markdown → PDF com capa preta e ouro |

**Tamanho:** ~6.900 linhas em 50 arquivos de `src/` — 20 telas, 20 módulos de domínio, 5 de
dados, 3 de interface, 2 de entrada. Os maiores: `ClienteNovo.jsx` (623) e `Livro.jsx` (593).

## 12.2 Estrutura de pastas e a regra que sustentava tudo

```
src/app/       entrada, portão de autenticação, rotas
src/ui/        tema, estilo global, primitivas (Card, Button, Tabs, TituloCard, Selo...)
src/dominio/   motor contábil PURO
src/dados/     cliente Supabase, carga, motor de sincronização
src/telas/     uma tela por arquivo
supabase/      migrações numeradas + scripts (aplicar, conferir, backup)
tests/         testes em Node
docs/          documentação; pdf/ = saída gerada
```

**`dominio/` não importa React, nem Supabase, nem DOM.** Entra dado, sai resultado. É o que
permitia testar a contabilidade inteira no Node.

## 12.3 Comandos que existiam

`npm run build` (empacota) · `npm run bump` (cache-buster `?v=N` no index) · `npm run serve`
(servidor local, porta 8788) · `npm run celular` (servidor na rede local) · `npm test` ·
`npm run migrar` (aplica só migrações novas, registrando em `_migracoes_aplicadas`) ·
`npm run conferir` (prova RLS e grants no banco real) · `npm run backup` (exporta tudo,
mantém 12 cópias) · `npm run pdf` · `npm run publicar` (deploy).

## 12.4 O motor de sincronização (herdado do ContLife)

O app carrega **todas as coleções de um negócio** na memória (paginado — o PostgREST corta em
1.000 linhas em silêncio). A cada mudança, compara o estado atual com a **última foto
confirmada pelo servidor** (`fotoRef`), espera **900 ms** sem mudança (debounce) e envia **só
a diferença** num único `aplicar_lote`. Por quê: reescrever cada ação para salvar sozinha tem
um modo de falha cruel — esquecer **um** ponto de mutação faz aquela ação parar de salvar
**em silêncio**. Com o motor, qualquer mudança em memória é salva.

Detalhes que importam: o Livro é montado com `key={negocio.id}` (trocar de negócio desmonta
tudo, e nada vaza de um cliente para outro) · ao sair dentro da janela de 900 ms, um efeito de
desmontagem **descarrega a gravação pendente** · erro de gravação é **visível** (falha
silenciosa é pior que bug: a pessoa acha que salvou).

Telas de **formulário único** (Roteiro do Cliente Novo, Negócio) gravavam direto, fora do
motor.

## 12.5 A disciplina de teste

- Teste que confere o **JavaScript contra o SQL real**: toda coluna tem quem a preencha e
  nenhuma coluna `not null` recebe nulo (lê as migrações, inclusive `ALTER TABLE`).
- `tests/destinos.test.mjs` recalcula o estado final de cada `destino` lendo as migrações em
  ordem, como o Postgres faria — e foi provado capaz de falhar (sem a 0018, ele acusa o bug).
- **Sabotar o teste de propósito** antes de confiar nele.
- **Caso negativo antes do positivo.**
- Verificação ao vivo no navegador contra o banco real, apagando o negócio de teste depois e
  confirmando zero linhas órfãs.

---

# 13 · Identidade visual

**Decisão E8 (17/ago):** identidade **única com o ContLife** — o ouro nos dois sistemas.
*Substituiu uma variação em cobre (12 a 17/ago).* Motivo do dono: "uma casa com duas caras
enfraquece as duas"; distinguir os sistemas é papel do nome na tela. **Sem** mascotes, sem o
Caduceu Vivo, sem as vozes — essa marca é fechada do ContLife.

| Token | Tema escuro (o padrão da casa) | Tema claro (papel de convite) |
|---|---|---|
| papel (fundo) | `#0B0A07` | `#F4EFE2` |
| superfície | `#14110B` | `#FBF8EF` |
| tinta (texto) | `#EDE6D3` | `#1B1710` |
| apagado | `#9A9078` | `#635B49` |
| ouro / acento | `#D4AF37` | `#7A5C10` |
| ouro 2 (ponta clara do gradiente) | `#F0D77B` | `#C9A227` (como texto: `#856614`) |
| crédito (esmeralda) | `#3E9A6E` | `#23684A` |
| débito (bordô) | `#C56068` | `#964048` |

**Fontes:** Playfair Display (títulos) · Inter (texto) · IBM Plex Mono (números e etiquetas).

**Regras:** os hexadecimais foram **copiados sem alteração** porque já tinham auditoria de
contraste WCAG AA no ContLife — trocar qualquer tom refaz a auditoria · duas classes para a
escala miúda: `.etiqueta` (10 px, moldura) e `.nota` (11 px, leitura) — a auditoria achou três
tamanhos fazendo o mesmo papel em 14 arquivos · cabeçalho de card e selo viraram componentes
(`TituloCard`, `Selo`) porque estavam copiados em 10 e 4 arquivos · alvo de toque mínimo de
40 px · respeita `prefers-reduced-motion` · teclado numérico em campo de dinheiro · campo com
16 px no formulário público (abaixo disso o iPhone dá zoom sozinho) · "vivo" por
**microinteração** (botão que levanta, número que conta, confirmação que pulsa), não por
personagem.

> **Nunca foi visto por um humano com atenção.** Os screenshots falharam a sessão inteira de
> 17/ago; o dourado foi confirmado por **medição de CSS**, não por olho. O dono pediu, para o
> projeto novo, **uma cara nova e mais refinada** — a identidade está em aberto (§17).

---

# 14 · Infraestrutura e operação

## 14.1 Supabase

Projeto `contadoria`, ref `gmiiuklkhwjpcowvjbwz`, região `sa-east-1` (São Paulo), plano
gratuito (que permite 2 projetos ativos; o ContLife ocupava o outro). Data API ligada;
exposição automática de tabelas **desligada**; RLS automática ligada. E-mail pelo servidor
padrão do Supabase, **sem SMTP próprio — limite de 2 e-mails por hora.** Lista de
redirecionamento com `localhost:8788` e o endereço do Netlify. **Em 08/nov/2026 o endereço do
projeto não existe mais** (§15.6).

## 14.2 Netlify

Site `contadoria-luan`, **deploy manual** (`npm run publicar`); `git push` **não** republica.
Plano gratuito: **300 créditos por mês, ~15 por deploy de produção, compartilhados por todos
os sites da conta** (incluindo os já apagados). Publicar depois de cada correção esgotou o mês
em agosto (§15.7).

## 14.3 GitHub

Repositório privado `grluans09-source/contadoria`. Durante o bloqueio do Netlify existiu um
repositório **público temporário** só com o build (`contadoria-site`, GitHub Pages), apagado
em 27/set.

## 14.4 Rotinas que estavam definidas

- Reconferir `parametros_fiscais` **todo janeiro** e antes do primeiro cliente real.
- `npm run backup` semanal — **"a partir do primeiro cliente"** (por isso nunca rodou de
  verdade; §15.6).
- Juntar mudanças e publicar uma vez só.
- Revogar o token do Netlify que foi colado no chat em 27/set (**adiado pelo dono**).

## 14.5 A regra de onde as coisas moram (E10)

**O GitHub privado é o cofre** (código, docs, PDFs). **O computador é a bancada** (cópia do
repositório + as chaves, que nunca entram no git). **Backup, token e dado de cliente nunca em
pasta sincronizada por conta de terceiro** — nem OneDrive corporativo, nem Drive compartilhado,
nem pasta de rede da empresa. O projeto morava no OneDrive da empresa até 17/ago e foi movido
para `C:\Users\LUAN S\Projetos\`.

---

# 15 · O que deu errado, e a lição de cada erro

Esta é a parte mais valiosa do legado. **Nenhum destes erros deve se repetir.**

## 15.1 Cinco bugs reais que nenhum teste pegou (15/ago)

A primeira vez que o sistema foi usado de ponta a ponta, com login de verdade, rendeu cinco
bugs — três deles no retrato de entrada, que é write-once (gravaria errado **para sempre**):

1. **`dinheiro_misturado` nunca era gravado** — a pergunta é do Bloco 2; o código só varria o
   Bloco 1. Gasto pessoal continuava sumindo do livro.
2. **Editar o Negócio não refletia nas outras abas** até recarregar — o estado do negócio
   aberto nunca era atualizado.
3. **Respostas do Formulário Público não apareciam para o contador** — o retrato sairia
   **vazio** para todo cliente que usasse o link.
4. **A meta sumia do retrato** (regressão da migração 0016, §15.2).
5. **"Dinheiro misturado" gravava `false` no retrato** mesmo com o cliente dizendo "sim".

**Lição:** o aviso "não verificado ao vivo", repetido em várias fases, **não era formalidade —
era risco real**, e se materializou em cinco lugares. **Teste de unidade não substitui usar o
sistema como o usuário usa.**

## 15.2 A regressão do `destino` (E7)

Duas funcionalidades quiseram a mesma resposta (a meta do cliente). A migração da Carta tomou
o `destino` do retrato, e o retrato — imutável — passou a gravar a meta como vazia, **em
silêncio**. A lógica estava certa dos dois lados; quebrou um **dado escrito por migração**,
terreno que nenhum teste cobria. **Lição:** contratos entre partes do sistema precisam de
teste próprio; dado semeado por migração também é código.

## 15.3 "Testado" não é "entregue"

A **vigia do limite do MEI** — chamada pelo próprio guia de "a funcionalidade mais valiosa do
sistema" — tinha função pronta e testes, e **nunca foi ligada a nenhuma tela**. Os
`parametros_fiscais` foram pesquisados, preenchidos com fonte, e **nunca lidos**. Documentos
diziam "o sistema projeta isso desde o primeiro mês". **Lição:** a definição de pronto tem de
incluir "o usuário consegue ver e usar"; e o inventário de funcionalidades precisa ser
conferido contra o código, não contra a memória.

## 15.4 A gaveta de Obrigação nunca foi construída

Controle do DAS, relatório mensal de receitas brutas, base da declaração anual e calendário de
obrigações eram parte da proposta de valor (e do plano de R$ 180) — e **nada disso existe nas
telas**. **Lição:** o que o preço promete precisa estar no topo da fila de construção.

## 15.5 A peça de marketing sem saída

O Retrato do Mês foi pensado como "a peça que se paga sozinha — ninguém mostra planilha ao
cunhado, mas mostra uma página bonita". Só que ele **não exportava, não imprimia, não
compartilhava**: vivia dentro do sistema, que o cliente nunca vê. **Lição:** a entrega precisa
de um caminho até o cliente — PDF, imagem para WhatsApp, ou link de leitura.

## 15.6 O banco sumiu e ninguém percebeu

Em 08/nov/2026, o endereço do banco no Supabase **não existe mais no DNS público** (confirmado
em três servidores; outros endereços do Supabase funcionavam). O site continuava "no ar",
mostrando a tela de login — sem ninguém conseguir entrar. **Não havia backup útil:** a rotina
era "a partir do primeiro cliente". O token de gerenciamento também estava inválido, então
nem dava para consultar o projeto. **A causa exata não foi confirmada** (projeto apagado ou
pausado pelo plano gratuito — só o painel do dono mostra). **Lições:** plano gratuito tem
regra de inatividade — prever monitoramento, manter o projeto ativo ou pagar; **backup
automático desde o dia 1**, guardado em lugar que o dono controle; um "estado do sistema"
que avise quando algo morre.

## 15.7 Deploy manual com teto de créditos compartilhado

Publicar cada pequena correção esgotou os 300 créditos do Netlify em agosto (a conta é
dividida com o ContLife e com um site já apagado). O diagnóstico errou duas vezes (culpou o
token, depois um suposto bug do Netlify) até os dados de cobrança do dono mostrarem a causa.
Seguiram-se semanas com o site desatualizado, um contorno pelo GitHub Pages, e depois um
**token que expirou** — e o token novo foi **colado no chat**, quebrando a regra de segredos.
**Lições:** deploy automático a partir do repositório; hospedagem cujo teto não seja dividido
com outros projetos; mudanças agrupadas; segredo nunca no chat.

## 15.8 Três contas de GitHub, um `git push` silenciosamente errado

O `git push` falhava com "repository not found". A primeira suspeita (senha salva no Windows)
não era a causa: o `.gitconfig` global mandava o Git usar o login do **GitHub CLI**, e o CLI
usava a conta **ativa** — que, conforme o dia, era a do trabalho ou a de outro projeto. Os
commits ficavam só no computador **sem aviso**. Em out/2026 aconteceu de novo, com uma
terceira conta. **Lições:** cada projeto deve deixar explícito com qual conta ele se
autentica; conferir `git status` contra o remoto depois de todo push; nunca assumir que "está
no git" significa "está no GitHub".

## 15.9 A pasta do projeto no OneDrive da empresa (E10)

Até 17/ago, código, chave de administração do banco e estratégia comercial moravam numa pasta
sincronizada pela empresa onde o dono trabalha. Corrigido; virou regra.

## 15.10 Documentação demais, e a mais importante desatualizada

O projeto acumulou 14 documentos e ~5.400 linhas; o diário (`SESSION_STATE.md`) passou de
1.000 linhas. Pior: o **`CLAUDE.md` — o único arquivo que a IA lê sozinha em toda sessão — e o
`00_NORTE.md` continuaram dizendo "nada foi construído, escopo não fechado"** até o fim. Toda
sessão nova começava com a instrução errada. **Lições:** poucos documentos, vivos; o arquivo
de instruções automático tem de ser o primeiro a ser atualizado; decisões num arquivo,
estado atual em outro, diário curto.

## 15.11 O visual nunca foi visto

A troca de identidade e a auditoria visual foram conferidas por medição de CSS, porque os
screenshots falharam. O dono depois achou a tela inicial "muito pobre". **Lição:** marcar com
data quando o dono **olhou e aprovou** cada tela; medição não substitui olho.

## 15.12 Construído antes de validado

Onze fases construídas e **zero clientes reais**. Preço, tempo por cliente e capacidade são
estimativas. Muita análise depende de meses fechados que nunca existiram. **Lição:** no
projeto novo, chegar ao primeiro cliente real (ou ao primeiro Diagnóstico Gratuito real) o
quanto antes, e deixar a prática decidir o resto.

## 15.13 Desenhos que o dado não sustentava

O Painel do Mês foi desenhado com pendências granulares ("falta o extrato de julho, as notas
da semana 3") — mas o sistema não sabia **o que se esperava receber** de cada cliente. A
versão construída mostra só "nada chegou / faltam N itens / pronto". Escolha honesta
(não inventar dado), mas a lacuna de modelo continua: falta uma lista de "o que este cliente
costuma mandar".

## 15.14 Outras armadilhas técnicas registradas

- Fontes padrão do PDF não têm `→` nem `−`: "Caixa de Entrada → Revisão" virou "Caixa de
  Entrada  Revisão". Símbolo que carrega sentido precisa de equivalente, não de remoção.
- Tela de boot presa em aba fora de foco (`requestAnimationFrame` pausa); resolvido com
  `setTimeout` de segurança.
- Consulta sem a coluna `codigo` travou um card em "…" para sempre, com erro só no console.
- Formulário que limpa os campos mesmo quando a gravação foi recusada parece sucesso.
- O `python` do PATH do Windows é um atalho da Microsoft Store que falha — usar `node`.
- O CLI do Supabase quebra em pastas do OneDrive no Windows; migrações iam pela API de
  gerenciamento por script.
- Servidor local de teste cai entre sessões; checar se está vivo antes de investigar código.

---

# 16 · Mapa para o projeto novo

> **Tudo nesta seção é recomendação para o dono decidir, exceto o que está marcado como
> DECIDIDO.** A IA nova deve ler, discordar onde enxergar melhor, e propor.

## 16.1 MANTER — o que provou valor e deve atravessar para o projeto novo

**Ideias e regras de produto (as mais valiosas do legado):**

- Vender **serviço**, não software; vender **clareza**, não conformidade.
- O **limite profissional** e o vocabulário que protege ("Revisão de Consistência", rodapé
  gerencial, os quatro "não faço").
- Os **princípios P1 a P8** e as travas contra alarmismo — especialmente P2 (o sistema fala
  com o Luan) e P3 (silêncio é resposta válida).
- **"Quanto você pode tirar"** com as três honestidades e a conta à mostra.
- **Fluxo projetado** sem receita inventada.
- **Retrato de entrada** declarado × medido, imutável no banco.
- **Dinheiro misturado** como retirada/aporte; **três classificações de dívida**.
- **Arquétipos como dado**, com plano de contas, campos, perguntas e achados próprios.
- **Achados com evidência, valor e hipótese inocente.**
- **Roteiro como dado editável**; essencial × aprofundamento; **`destino` como contrato**.
- **Carta com "foi seguida?"** e **"o que evitamos"** — histórico que não se cria
  retroativamente.
- O ritmo do mês, o roteiro da conversa, o Diagnóstico Gratuito.

**Fundamentos técnicos:**

- Lançamento de **N linhas** com débito = crédito **garantido pelo banco**.
- **Integridade no banco**, não na tela; invariantes recalculados da fonte.
- **Isolamento por negócio com tabela de membros** desde o dia 1; nada acessível sem login
  além da porta estreita do formulário.
- **Parâmetros fiscais em tabela com fonte e data** — e, desta vez, **lidos** pelo sistema.
- **Domínio puro e testável**, separado de tela e de banco.
- **Nada se perde em silêncio** — seja pelo motor de diferença, seja por outro mecanismo, a
  garantia tem de existir.
- Teste do código contra o esquema real; teste que sabe falhar; caso negativo primeiro.

## 16.2 DECIDIDO pelo dono e ainda não construído (out/2026)

1. **Exemplos dentro dos campos do formulário público** — para quem preenche saber
   exatamente o que escrever. O texto do exemplo deve ser editável como as perguntas (vir do
   banco, não do código).
2. **Checklist de conferência das respostas do cliente.** O Luan vê cada resposta e marca
   **certa** ou **errada**. **Regra:** o cadastro só é concluído depois que **todas** estiverem
   marcadas como certas; as marcadas como erradas ficam **"pendentes de análise"** até ele
   resolver.
3. **Painel inicial rico, em abas** — algo do Luan, de controle e gestão do escritório, que
   não pareça vazio. Proposta já feita e aprovada na linha geral: **Visão Geral** (clientes
   ativos × cadastro pendente; negócios com pendência de análise; formulários enviados e não
   concluídos; meses em aberto; achados abertos somados; total evitado no mês), **Clientes**
   (a grade de cards) e **Fiscal** (quem está perto do teto do MEI; lembrete da reconferência
   anual). O dono pediu **mais ideias nessa linha.**
4. **Publicar em lote**: juntar as melhorias e publicar uma vez só.

## 16.3 MELHORAR — manter a ideia, refazer a execução

| Peça | O problema | Direção sugerida |
|---|---|---|
| Vigia do limite e hora do dono | só no motor | ligar à tela, lendo `parametros_fiscais` |
| Retrato do Mês | sem saída para o cliente | exportar PDF/imagem com o rodapé; avaliar link de leitura **só da página de entrega** (nunca do livro — ver G6) |
| Painel do Mês | pendência genérica | cadastrar "o que este cliente costuma mandar" e cobrar item por item |
| Formulário público | texto livre vago | exemplos, campos mais estruturados onde der, checklist de conferência |
| Prateleira | "pobre" | o painel em abas de §16.2 |
| Baixa | só valor cheio | permitir baixa parcial |
| Lixeira | sem restaurar | tela de restaurar dentro do prazo |
| Backup | "a partir do 1º cliente" | automático desde o dia 1, em lugar controlado pelo dono, com aviso de atraso |
| Documentação | 14 docs, o mais importante desatualizado | poucos documentos vivos; o arquivo de instruções automático sempre atual |
| Telas grandes | `ClienteNovo` e `Livro` com 600 linhas | dividir por responsabilidade desde o começo |

## 16.4 REFAZER OU RECONSIDERAR (escolhas técnicas)

Não são erros — são escolhas que, num projeto do zero, merecem ser **decididas de novo**:

- **Tailwind pelo script de CDN em produção.** A própria documentação do Tailwind indica o
  "Play CDN" para desenvolvimento, não para produção. Gerar o CSS no build.
- **Dependências carregadas em tempo real do esm.sh.** Se o esm.sh cair, o app não abre.
  Empacotar as dependências junto.
- **JavaScript sem tipos num sistema de dinheiro.** Avaliar TypeScript (ou ao menos
  verificação de tipos) no domínio contábil, ponderando a curva para um dono que não programa.
- **Deploy manual com teto de créditos compartilhado.** Avaliar deploy automático a partir do
  repositório, numa hospedagem cujo limite não seja dividido com outros projetos.
- **Plano gratuito do banco sem monitoramento.** Decidir conscientemente: plano pago, ou
  gratuito com rotina que mantém ativo e avisa quando cai.
- **Carregar todas as coleções na memória.** Funciona para "10 clientes bem feitos" (um MEI
  gera ~600 lançamentos por ano); registrar o teto (~20.000 lançamentos por cliente) e não
  otimizar antes disso.
- **O motor de diferença.** Poderoso e provado, mas complexo. Para um único usuário, avaliar
  se gravações explícitas por ação, com a mesma garantia de "nada se perde em silêncio" e erro
  sempre visível, ficam mais simples de manter. **A garantia é obrigatória; o mecanismo é
  escolha.**

## 16.5 INOVAR — ideias novas para o dono avaliar (PROPOSTA ou HIPÓTESE)

| Ideia | Por que vale | Estado |
|---|---|---|
| **"Meu escritório"** — painel de gestão do próprio negócio do Luan: clientes e prospectos, quanto cada um paga, mensalidades recebidas, reajuste anual, tempo gasto por cliente | o go-to-market tinha um "painel de controle" e um plano de 90 dias que o sistema não acompanhava; e mede de verdade o "1 h por cliente" estimado | PROPOSTA |
| **Modo Diagnóstico Gratuito** — fluxo leve para prospecto (um mês, Retrato, comparação com o chute dele) que vira cliente com um clique | é a máquina de venda nº 1 e era feito à mão | PROPOSTA |
| **A gaveta de Obrigação de verdade** — DAS por cliente e mês (pago/aberto/vencido), relatório mensal de receitas brutas gerado (exige marcar cada conta de receita como comércio ou serviço), base da declaração anual, calendário com avisos | está no preço e nunca existiu | PROPOSTA forte |
| **Coleta mensal pelo link** — o cliente manda o mês pelo mesmo mecanismo do formulário | ataca o gargalo nº 2 (arrancar a informação) | PROPOSTA |
| **Estado do sistema** — avisa banco fora do ar, backup atrasado, token vencendo, parâmetros fiscais não reconferidos no ano, deploy desatualizado | todos esses problemas aconteceram em silêncio | PROPOSTA |
| **Dado "declarado pelo cliente" × "comprovado"** e lançamento de resumo do dia/semana | o informal do dinheiro vivo era o pior cenário e o alvo padrão, e nunca foi atendido | PROPOSTA |
| Balanço com dois rostos; ponto de equilíbrio; comparativo mês a mês | estavam no desenho das entregas | PROPOSTA |
| Recomendação como hipótese testável (F5) | fecha o ciclo da transformação | adiar até haver cliente com 3 meses |
| Leitura de foto de nota/comprovante | reduziria digitação | HIPÓTESE — arriscado; só depois que o básico rodar com cliente real |

## 16.6 DESCARTAR — não trazer

- Planos, cobrança, trial, Stripe, mascotes, metáforas de vida pessoal — herança do ContLife
  que não serve a uso próprio.
- **Portal do cliente com acesso ao livro** (G6) — o cliente entrega fato e documento; quem
  classifica é o contador.
- **Comparação entre clientes / benchmark** (G4) — sem massa de dados e com risco de
  privacidade.
- **Análise automática de causalidade** (G3) — mostrar coincidência temporal, e só.
- **"Plano do Mês" gerado sozinho** (G5) — prescrição sobre ruído é pior que nenhuma.
- **Seletor global de regime caixa/competência.**
- **Arquivo único gigante** (a dívida do ContLife).
- **Documento que diga "pronto" para o que só existe no motor.**

---

# 17 · Perguntas que a IA nova deve fazer antes de codar

Não presuma nenhuma resposta:

1. **Nome e identidade.** O projeto continua se chamando Contadoria? A "cara nova e mais
   refinada" mantém o ouro do ContLife (E8) ou é uma identidade própria? (Marca é território
   do Fable.)
2. **O que aconteceu com o banco antigo** — apagado ou pausado? Há algo a recuperar?
3. **Já existe algum cliente ou prospecto real** para guiar a primeira versão?
4. **Qual é a primeira versão mínima** que permite atender o primeiro cliente — e o que pode
   esperar?
5. **A gaveta de Obrigação** (DAS, relatório mensal, calendário) entra na primeira versão?
6. **Painel do escritório:** quais números o Luan quer ver todo dia ao abrir o sistema?
7. **Orçamento:** aceita pagar banco e/ou hospedagem para não depender de plano gratuito?
8. **Qual conta de GitHub** é a dona do projeto novo, e o repositório será privado?
9. **Uso no celular:** que tarefas ele faz no celular e quais só no notebook?
10. **O que fica do motor de diferença** e da pilha técnica (§16.4)?
11. **Reaproveitar código** do projeto antigo (copiando, com comentário de origem e data) ou
    reescrever a partir das regras deste documento?
12. **O cliente recebe a entrega como** PDF, imagem no WhatsApp, link — ou mais de um?

---

# 18 · Glossário

| Termo | Significado aqui |
|---|---|
| Arquétipo | o que o negócio faz para ganhar dinheiro; um de 8 (§7) |
| Balanço de abertura | o lançamento que registra o que o cliente tem e deve no dia em que o serviço começa |
| Baixa | o lançamento que quita um recebível ou pagável específico |
| Caixa de Entrada | a mesa onde o que o cliente mandou vira lançamento |
| Carta de recomendações | o texto do Luan para o mês, com "foi seguida?" |
| Destino | o campo que diz para onde vai a resposta de uma pergunta; é contrato, não texto |
| Dinheiro misturado | quando o cliente usa o mesmo dinheiro para negócio e vida pessoal |
| Essencial / aprofundamento | pergunta da primeira conversa / dos meses seguintes |
| Evitados | o que o Luan impediu de dar errado, registrado à mão |
| Fechamento | o selo do mês; depois dele, nada muda em silêncio |
| Mesa de Revisão | as 5 verificações de integridade |
| Painel do Mês | quem mandou e quem não mandou, de todos os clientes |
| Prateleira | a tela inicial com todos os clientes |
| Retirada | o que o dono tira; conta de patrimônio, nunca despesa |
| Retrato de entrada | a linha de base: o que o cliente declarou × o que foi medido, congelado |
| Retrato do Mês | a página única de entrega ao cliente |
| Revisão de Consistência | o nome do documento de revisão entregue (nunca "auditoria") |
| Trilha | o registro append-only de tudo o que foi feito |
