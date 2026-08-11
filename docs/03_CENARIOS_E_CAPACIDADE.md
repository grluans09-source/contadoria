# 03 · Cenários e capacidade — quantos clientes cabem, e o que muda o desenho

> **11/ago/2026.** O Luan pediu: trabalhar melhor e pior cenário, e a análise da IA sobre
> quantos clientes ele conseguiria atender de verdade. Este documento existe porque **essas
> respostas mudam o que se constrói primeiro** — não são conversa de negócio solta.
>
> Os números abaixo são **estimativa fundamentada, não medição.** Devem ser conferidos
> contra a realidade depois dos 3 primeiros clientes e este documento corrigido.

---

## 1. Nome

**Contadoria.** Decidido em 11/ago/2026. O dono registrou que, sendo o único usuário, o nome
pesa pouco — então não vale investir sessão de marca nisso. A identidade visual é a do
ContLife (preto/ouro/marfim), sem mascotes.

---

## 2. Os três cenários de dado (o que chega do cliente)

O sistema tem que funcionar nos três. **A regra de desenho: o pior cenário é o alvo
padrão** — se funciona para o cliente que manda áudio no WhatsApp, funciona para todos.

### 2.1 Melhor cenário — MEI organizado

Conta PJ separada, extrato mensal em OFX/CSV, emite nota para PJ.

- Importa o extrato → o sistema já sugere a classificação de cada linha
- Conciliação quase automática
- O papel de revisão é **real**: dá para dizer "o que você me contou bate com o banco"
- **Tempo estimado:** 30-45 min/mês

### 2.2 Cenário do meio — conta misturada (o mais comum)

MEI ou informal com **uma conta só**, pessoal e do negócio no mesmo lugar. Manda print ou
exportação do app do banco.

- O extrato entra, mas cada linha precisa de uma decisão a mais: **isto é da empresa ou é
  seu?**
- É aqui que mora a maior entrega de consultoria do produto: separar as duas vidas. O dono
  do negócio quase nunca sabe quanto realmente sobra
- **Tempo estimado:** 45-75 min/mês
- ⚠️ **Consequência de desenho:** a Caixa de Entrada precisa de um botão de **"pessoal —
  ignorar"** tão rápido quanto o de classificar. Sem isso, conta misturada vira suplício.

### 2.3 Pior cenário — informal no dinheiro vivo

Sem conta, sem nota, sem extrato. Manda áudio: *"hoje vendi 300"*.

- Não há o que conciliar contra o banco
- A revisão deixa de ser "bate com o extrato" e vira **consistência interna**: faltou mês?
  a margem despencou sem explicação? tem despesa sem receita nenhuma no mês?
- **Tempo estimado:** 20-40 min/mês (é pouco dado — o custo aqui é *cobrar*, não digitar)
- ⚠️ **Consequência de desenho:** precisa de um lançamento de **resumo do dia/semana**
  (vendas do dia = um valor) sem exigir detalhe que não existe. E de um jeito honesto de
  marcar que aquele dado é **declarado pelo cliente**, não comprovado — isso protege o Luan
  no papel de revisão.

---

## 3. Quanto tempo custa cada cliente

Estimativa em regime, **com o sistema pronto**:

| Etapa | Tempo | O sistema ajuda? |
|---|---|---|
| Cobrar e receber a informação | 10-20 min | **Sim, e é subestimado** — ver §5 |
| Classificar na Caixa de Entrada | 10-20 min | **Muito.** É o coração da v1 |
| Conciliar | 5-15 min | Sim (já pronto no ContLife) |
| Fechar o mês e gerar as entregas | ~5 min | Quase total |
| Conversar com o cliente (a consultoria) | 15-30 min | Não — e nem deve. É o produto |
| **Total em regime** | **~1 hora/cliente/mês** | |

**Entrada de um cliente novo: 2 a 4 horas, uma vez.** Cadastrar, entender o negócio, montar
o plano de contas, levantar saldos iniciais. Esse custo é fixo e some no segundo mês.

**Sem sistema (planilha): 2 a 2,5 h/cliente/mês**, e piorando conforme o histórico cresce,
porque relatório em planilha se refaz à mão todo mês.

---

## 4. Quantos clientes cabem — a resposta honesta

**Duas perguntas diferentes, e o Luan estava juntando as duas:**

### 4.1 Quantos ele CONSEGUE ATENDER (capacidade)

Estudante, com ~25 h/mês realistas dedicadas à entrega (o resto vai para estudo, venda e
melhorar o sistema):

| Ferramenta | Teto sustentável |
|---|---|
| Planilha | **6 a 8 clientes** — e a qualidade cai antes disso |
| Contadoria | **15 a 20 clientes** |

**É esse o retorno do sistema, e é o único argumento que importa:** ele mais ou menos
**dobra o teto**. Consequência direta para a construção — **a funcionalidade que economiza
minutos por cliente por mês vale mais que a funcionalidade que impressiona.** Um relatório
lindo que ele gera uma vez por mês vale menos que um botão que corta 10 minutos de
classificação toda semana.

### 4.2 Quantos ele CONSEGUE CONSEGUIR (captação)

**Aqui está o gargalo real, e não é técnico.** Começando do zero, sem CRC, sem indicação e
sem reputação:

| Marco | Estimativa |
|---|---|
| Primeiro cliente | mês 1-2, e quase certamente alguém que já o conhece |
| Fim do ano 1, vendendo ativamente | **4 a 10 clientes** |
| Ano excepcional | 15+ |

Ou seja: **a capacidade não vai ser o limite no ano 1. A venda vai.** O sistema não resolve
isso — mas resolve a coisa que sustenta a indicação, que é o cliente sentir que foi bem
atendido.

### 4.3 Ordem de grandeza de receita (para calibrar expectativa)

Um contador tradicional cobra do MEI algo em torno de R$ 60-100/mês só pelas obrigações.
Ele entrega mais (gerencial + consultoria), mas é estudante e sem CRC — então algo entre
**R$ 100 e R$ 180/mês** por cliente é a faixa plausível de entrada.

- 8 clientes → ~R$ 1.000-1.400/mês
- 20 clientes → ~R$ 2.400-3.600/mês

**Chamando pelo nome:** é uma renda de estudante muito boa e um portfólio real — não é uma
empresa ainda. O salto de verdade vem com o **CRC**, que abre o Simples Nacional, onde o
mesmo trabalho vale 3 a 5 vezes mais. O Contadoria continua servindo lá dentro, com outro
plano de contas.

---

## 5. Os quatro gargalos, em ordem — e onde o sistema pode entrar

Ordenados por quanto realmente doem. O Luan supôs que o gargalo era digitar e gerar
relatório. **São o terceiro e o quarto.**

| # | Gargalo | O sistema resolve? |
|---|---|---|
| 1 | **Conseguir cliente** | Não. É trabalho dele |
| 2 | **Arrancar a informação do cliente** | **Sim, e ninguém pensa nisso** — ver abaixo |
| 3 | Digitar e classificar | Sim, muito |
| 4 | Gerar relatório | Sim, quase inteiro |

### 5.1 O achado: o Painel do Mês

O gargalo nº 2 é o que mais consome energia no serviço de contabilidade pequeno — perseguir
cliente que não manda. E é **inteiramente atacável por software**, coisa que nem sistema
grande costuma fazer bem:

- uma tela que mostra, de todos os clientes de uma vez: **quem já mandou, quem não mandou,
  o que falta**
- por cliente: as pendências do mês em lista (extrato de julho, notas da semana 3…)
- e uma **mensagem pronta para copiar e colar no WhatsApp**, já com o nome e o que falta

Isso não aparece em nenhuma lista de "funcionalidades de sistema contábil", e é
provavelmente o que mais tempo economiza no dia a dia dele. **Entra na v1.**

---

## 6. Pior cenário do negócio — e por que ele não desperdiça o trabalho

Se em um ano ele tiver 3 clientes e resolver parar, o que sobra?

- um sistema que ele usa para **estudar contabilidade na prática** (ver `04_MAPA_DO_APP.md`)
- um portfólio real para quando tirar o CRC
- prática de escrituração de verdade, que a faculdade não dá

**Consequência de desenho, e é a mais importante deste documento: construir para 10
clientes, muito bem feito — não para 100.** Nada de fila, cache elaborado, multiusuário
real, cobrança ou automação de e-mail. Se um dia forem 50 clientes, o problema será
excelente e o dinheiro estará lá para resolvê-lo.

---

## 7. O que fica decidido aqui

1. Nome: **Contadoria**
2. O sistema atende os **três cenários de dado**, e o pior é o alvo padrão
3. **Painel do Mês entra na v1** — ataca o gargalo nº 2
4. Prioridade de funcionalidade: **minutos economizados por mês** ganha de impressionar
5. Construir para **10 clientes bem feitos**, não para escala
6. Conferir estes números depois dos 3 primeiros clientes e corrigir este documento
