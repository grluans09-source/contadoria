# 02 · Escopo — o que este sistema é, decidido com o dono

> **11/ago/2026.** Respostas do Luan às 8 perguntas do `00_NORTE.md`, mais as consequências
> técnicas de cada uma. Substitui qualquer suposição anterior.
>
> Ainda **nenhuma linha de código.** Falta fechar o item §7.

---

## 1. O modelo de negócio (define tudo o resto)

**O Luan vende o SERVIÇO, não o sistema.** Ele é o "contador" de vários negócios pequenos —
MEIs e trabalhadores informais. O sistema é **ferramenta interna dele**: o cliente nunca
compra, nunca instala, nunca vê licença.

**Recomendação da IA: manter assim.** Motivos, na ordem do peso:

1. **O diferencial é ele, não o software.** O valor que ele descreveu é gerar o dado *e*
   destrinchar pro cliente. Software não destrincha; ele entrega tela. Vender licença
   transforma o diferencial em commodity.
2. **Vender software para MEI é mercado ruim.** Baixíssima disposição a pagar, custo de
   suporte alto, e concorrência com planilha grátis e com plataformas de Simples que já
   têm time e capital.
3. **O limite do CRC fica mais folgado.** Prestar serviço de organização e relatório
   gerencial, ele mesmo, é uma coisa. Vender um sistema que se apresenta como "sua
   contabilidade" para centenas de desconhecidos é outra — cria expectativa de peça oficial
   que ele não pode assinar.
4. **Construir para 1 usuário é 10x mais simples.** Sem cobrança, sem planos, sem trial, sem
   onboarding de estranho, sem suporte, sem Stripe. Tudo isso o ContLife tem — e aqui vira
   peso morto.

**Contra-argumento honesto, registrado:** serviço não escala além das horas dele. A resposta
não é vender licença, é o próprio sistema **elevar o teto** — se ele atende 8 clientes hoje
com planilha, o objetivo do sistema é atender 40 com a mesma semana. A alavanca é a
produtividade dele, não a venda de assinatura. Se um dia o produto virar SaaS, o sistema já
existe e provado; o caminho inverso (construir SaaS e não achar comprador) desperdiça um ano.

---

## 2. MEI — o fato que redesenha o produto

**MEI não é obrigado a ter contador nem escrituração contábil formal.** As obrigações reais
são poucas:

- **Relatório Mensal de Receitas Brutas** — preenchido até o dia 20 do mês seguinte,
  guardado com as notas. Separa receita de **comércio/indústria** de receita de **serviços**.
- **DAS mensal** — valor fixo, vence dia 20.
- **DASN-SIMEI** — declaração anual da receita bruta, até 31 de maio.
- **Nota fiscal** — obrigatória quando o cliente é PJ; dispensada para pessoa física.

E o **trabalhador informal não tem obrigação nenhuma.**

**As duas consequências, e as duas importam:**

1. **É por isso que o mercado está aberto para ele.** Não há reserva de CRC bloqueando a
   porta, porque não há obrigação legal a cumprir. Ele não está tomando trabalho de
   contador registrado — está atendendo quem não tem contador nenhum.
2. **Ele não vende conformidade. Vende clareza.** "Você está ganhando dinheiro?", "quanto
   dá pra tirar sem quebrar o mês?", "está perto de estourar o limite?" — o MEI não perde o
   sono com o DAS, perde com isso. O sistema tem que responder essas perguntas primeiro.

**Oportunidade que sai de graça disso:** vigiar o limite de faturamento. Quando o cliente se
aproxima do teto, o desenquadramento vira Simples Nacional — e **aí sim** ele precisa de
contador registrado. O sistema avisar isso com meses de antecedência é entrega de altíssimo
valor, e é também o momento honesto de encaminhar o cliente adiante.

⚠️ **Valores (limite anual, DAS, faixas) nunca entram no código.** Vão para uma tabela de
parâmetros com vigência por ano — muda por lei e sem aviso. O limite histórico é
R$ 81.000/ano, mas **precisa ser conferido antes do primeiro uso**: havia proposta de
elevação em tramitação.

---

## 3. Quem digita — como funciona de verdade, e o que faremos

**Como os escritórios trabalham hoje, na prática:**

| Modelo | Quem digita | Quem vê o sistema |
|---|---|---|
| Escritório tradicional | equipe do escritório, no sistema dele (Domínio, Alterdata, Questor) | só o escritório |
| Escritório digital (Contabilizei, Agilize) | equipe do escritório faz a escrituração; o cliente tem um **portal limitado** | cliente vê relatório e envia documento — **nunca o razão** |

A regra que vale nos dois: **o cliente entrega fato e documento; o contador classifica e
fecha.** Ninguém, em lugar nenhum, deixa o cliente encostar no plano de contas ou no diário.
Não é desconfiança — é que classificar é justamente o serviço.

**Decisão para este sistema:**

- **v1: só o Luan digita.** O cliente manda pelo WhatsApp do jeito que conseguir.
- **O gargalo real do serviço não é o relatório, é a entrada.** Então a peça mais importante
  da v1 é uma **Caixa de Entrada**: onde ele joga o que o cliente mandou (foto de nota,
  lista de vendas, extrato) e classifica rápido, em lote, com sugestão automática. Se isso
  for lento, o serviço não escala e nada mais importa.
- **v2 (só se o serviço vender): portal do cliente**, somente leitura + envio de documento.
  Nunca acesso ao livro.

### 3.1 Correção da recomendação anterior sobre a fechadura

A análise (`01`, §4.2) sugeriu ficar com `owner_id` e adiar a tabela de membros. **Com a
resposta do Luan ("precisa poder evoluir depois"), a recomendação muda:** criar a tabela de
membros **desde o primeiro dia**, com uma linha só (ele, papel `contador`).

Custo hoje: uma tabela a mais e uma linha a mais em cada política. Custo depois: trocar a
fechadura de todas as portas ao mesmo tempo. Não vale adiar.

---

## 4. O que o sistema entrega — as três gavetas

O Luan quer exercer **dois papéis** (auditoria e consultoria) e pediu para incluir o que
mais um contador entrega. Organizado por gaveta:

### 4.1 Obrigação — o que o MEI precisa ter

| Entrega | Observação |
|---|---|
| **Relatório Mensal de Receitas Brutas** | obrigatório; sai pronto do razão. Separa comércio/indústria de serviços |
| **Controle do DAS** | vencido/pago/em aberto, com histórico. O sistema **não emite guia** (é no portal do governo) — controla e lembra |
| **Base da DASN-SIMEI** | a receita bruta anual consolidada |
| **Vigia do limite de faturamento** | acumulado no ano, projeção de fechamento, alerta de desenquadramento |
| **Registro de notas emitidas** | registrar, não emitir — emitir é integração com SEFAZ/prefeitura, outro universo |

### 4.2 Gerencial — onde ele agrega valor (a consultoria)

| Entrega | Por que importa para MEI/informal |
|---|---|
| **DRE simplificada mensal** | entrou, saiu, sobrou |
| **Fluxo de caixa e projeção** | o que vence nas próximas semanas |
| **Separação empresa × pessoa** | o problema nº 1 de pequeno negócio: misturar o caixa com o bolso. Quanto dá para retirar sem quebrar o mês |
| **Margem por produto/serviço** | a pergunta que todo dono faz |
| **Contas a receber / a pagar com vencimento** | inclusive quem está atrasado |
| **Ponto de equilíbrio do negócio** | quanto precisa faturar para não dar prejuízo |
| **Comparativo mês a mês e sazonalidade** | onde a consultoria fica visível |

### 4.3 Revisão — o papel de auditoria

⚠️ **Nome importa aqui.** "Auditoria independente" e "parecer de auditoria" são termos
regulados. Internamente pode chamar do que quiser; **o documento entregue ao cliente deve
se chamar outra coisa** — *Revisão de Consistência*, *Conferência do Período* — e dizer, no
rodapé, que é revisão gerencial e não peça de auditoria independente. O trabalho é o mesmo;
a etiqueta é o que protege ele.

| Entrega | Reaproveita do ContLife |
|---|---|
| **Conciliação bancária** | ✅ pronto. É a checagem que mais vale: o que o cliente contou bate com o extrato? |
| **Mesa de Revisão (os invariantes)** | ✅ o conceito da Mesa de Auditoria — recalculados da fonte, nunca do resumo |
| **Achados e anomalias** | ✅ a ideia de `findAnomalies`: despesa fora do padrão, mês sem movimento, receita sem depósito correspondente |
| **Trilha de auditoria** | ✅ pronto. Quem mudou o quê e quando — protege ele antes de proteger o cliente |
| **Lixeira com prazo** | ✅ pronto. Nada some sem rastro |
| **Fechamento de mês com selo** | ✅ pronto. Depois de fechado, o período não muda em silêncio |
| **Carta de recomendações** | 🔁 o formato da "Carta do Sócio", reescrito para negócio |

### 4.4 O que mais um contador entrega, e cabe aqui

- **Calendário de obrigações** do cliente (DAS dia 20, DASN até 31/5, alvará, etc.)
- **Pró-labore / retirada** — quanto e quando, registrado
- **Controle de INSS do MEI** (o DAS já recolhe, mas a contagem para aposentadoria é
  pergunta frequente)
- **Dossiê do cliente** — CNPJ, atividade, data de abertura, senhas de acesso **não**
  (isso não entra no sistema)
- **Relatório de fechamento anual** — o consolidado que vira conversa de planejamento

---

## 5. Identidade

**Decidido:** usa a **linguagem visual do ContLife** — preto, ouro, marfim, esmeralda/bordô,
ar de papel de convite. Passa luxo, seriedade e dinheiro, e os dois são "primos".

**Não usa:** os mascotes (Folgado/Razão/Arca), o Caduceu Vivo, as vozes, o léxico por plano.
São identidade fechada do ContLife, e aqui não há usuário leigo para acolher — o usuário é
o Luan.

**Consequência prática:** copiar o bloco `THEMES` e a convenção de variáveis CSS **sem
alterar os tons**, e **não** copiar nada da pasta `marca/`.

⚠️ **Isto mudou em 17/ago/2026.** A versão anterior mandava "ajustar a paleta o suficiente
para o sistema ter cara própria" — e foi o que se fez entre 12 e 17/ago, com o Contadoria em
COBRE e o ContLife em ouro. O dono reverteu: **uma identidade só, o ouro nos dois**, porque
uma casa com duas caras enfraquece as duas. Saber qual sistema está aberto é papel do nome na
tela, não da cor. Os hexadecimais são copiados sem mexer também por um motivo prático: os do
ContLife já passaram por auditoria de contraste WCAG (ver `src/ui/tema.mjs`), e inventar um
tom novo obrigaria a refazer a medição.

---

## 6. Decisões técnicas que saem daqui

| # | Decisão | Motivo |
|---|---|---|
| 1 | **Web, com login** | vários clientes, acesso de qualquer lugar, e o portal da v2 exige. O caminho do ContLife é conhecido e barato |
| 2 | **Supabase novo, projeto separado** | ⚠️ o plano gratuito permite 2 projetos ativos e o ContLife já ocupa 1 — este é o último slot grátis |
| 3 | **Tabela de membros desde o dia 1** | §3.1 |
| 4 | **Lançamento com N linhas desde o dia 1** | `01` §4.1 — e agora com motivo extra: separar receita de comércio × serviço no mesmo fato |
| 5 | **Sem estoque na v1** | MEI e informal são majoritariamente serviço e comércio miúdo. Entra depois sem migração, graças à decisão 4 |
| 6 | **Sem planos, trial, Stripe, Porta, mascotes** | uso próprio |
| 7 | **Parâmetros fiscais em tabela com vigência** | §2 — lei muda |
| 8 | **Modular desde o início** | `01` §3.3 |

⚠️ **LGPD, uma linha:** ele passa a guardar dado financeiro de terceiros. Guardar o mínimo
(sem CPF onde não for necessário, sem senha de cliente em lugar nenhum) e nunca expor o
dado de um cliente na tela de outro — o que a tabela de membros já garante pelo banco.

---

## 7. O que ainda falta decidir

1. **Nome.** Sugestões apresentadas em 11/ago; nenhuma escolhida. Marca é território do
   **Fable**, não do Opus.
2. **De onde vêm os dados na prática** (pergunta 5) — WhatsApp é o canal real, mas falta
   saber se haverá extrato bancário e em que formato.
3. **Quantos clientes ele espera atender no primeiro ano** — muda o quanto vale investir na
   Caixa de Entrada.
