# Registro de Decisões — a fonte de verdade do Contadoria

> **O que está aqui é o que vale hoje.** Se o código, um doc antigo ou uma conversa
> discordarem deste arquivo, **este arquivo ganha** — ou o arquivo está desatualizado e
> precisa ser corrigido aqui, não contornado lá.
>
> `SESSION_STATE.md` é o **diário** (o que aconteceu, em ordem). Este é o **estado atual**
> (o que vale, agora). Os dois não se substituem.

## Como ler os estados

| Estado | Significa |
|---|---|
| **DECIDIDO** | confirmado pelo dono, vale, está ou será implementado |
| **PRINCÍPIO** | regra de julgamento permanente, não uma feature |
| **REGRA** | restrição técnica ou operacional obrigatória |
| **PROPOSTA** | recomendação da IA, **aguardando o dono** |
| **HIPÓTESE** | ideia plausível, sem evidência ainda; não implementar |
| **EM ABERTO** | pergunta sem resposta |
| **SUBSTITUÍDA** | valia, foi trocada — registra o que era e por que mudou |
| **DESCARTADA** | avaliada e recusada, com o motivo |

**Regra de manutenção:** toda decisão importante entra aqui. Quando uma decisão antiga muda,
ela vira SUBSTITUÍDA com ponteiro para a nova — **nunca se apaga**, para não se voltar por
acidente a uma lógica já descartada.

---

# A · Identidade e modelo de negócio

### A1 · O Luan vende serviço, não software — **DECIDIDO** (11/ago)
**Por quê:** o diferencial é ele destrinchar, não a tela. Vender licença para MEI é mercado
ruim e criaria expectativa de peça oficial que ele não pode assinar sem CRC.
**Impacto:** sem planos, sem cobrança, sem trial, sem onboarding de estranho no sistema.

### A2 · Limite profissional: relatório gerencial, nunca peça oficial — **REGRA** (11/ago)
Não emite nota, não acessa conta bancária, não assina ECD/ECF/SPED/balanço, não fala com a
Receita. Dito em voz alta na primeira conversa (Bloco 6).
**Impacto:** vocabulário das entregas ("Revisão de Consistência", nunca "auditoria"); rodapé
obrigatório em toda peça.

### A3 · Construir para 10 clientes bem feitos, não para escala — **PRINCÍPIO** (11/ago)
**Impacto:** nada de fila, cache elaborado, multiusuário real. Consulta N+1 por card é
aceitável (`resumoNegocio.mjs`). Revisitar só quando doer.

### A4 · O produto é a transformação, não a entrega — **PRINCÍPIO** (14/ago) 🆕
**Por quê:** ver `09_PRINCIPIOS_DE_VALOR.md`. O sistema se mede por "o cliente decidiu
diferente", não por "o mês fechou".
**Modifica:** não invalida nada anterior; passa a ser o critério de desempate em toda decisão
de produto.
**Depende de:** A2 (transformação não pode escorregar para conselho fora da licença).

---

# B · Princípios de valor (14/ago) 🆕

Todos **PRINCÍPIO**, detalhados em `09_PRINCIPIOS_DE_VALOR.md`.

| # | Princípio | Consequência prática |
|---|---|---|
| **P1** | A entrega é a decisão, não o relatório | toda tela responde "que decisão isto melhora?" |
| **P2** | O sistema fala com o Luan; o Luan fala com o cliente | achados vivem na Revisão, nunca no Retrato; Carta escrita por ele |
| **P3** | Silêncio é resposta válida | sem evidência suficiente, devolve vazio |
| **P4** | Achado traz evidência, valor em R$ e hipótese inocente | observação vira decisão |
| **P5** | Recomendação é hipótese testável | mostra coincidência temporal, **nunca afirma causalidade** |
| **P6** | Medir o antes, ou não haverá depois | linha de base no onboarding, imutável |
| **P7** | Complexidade no motor, nunca na tela | — |
| **P8** | Nem tudo vira transformação | Diário/Razão/Balancete/Conciliação/Trilha continuam "chatos" — são a base de confiança |

### B9 · A metáfora da furadeira não se aplica direto — **PRINCÍPIO** (14/ago) 🆕
O cliente da furadeira **sabe** que quer o furo. O MEI **não sabe que tem problema**.
**Impacto:** não há demanda a atender, há **consciência a criar**. Sustenta o Diagnóstico
Gratuito como peça central de venda e o roteiro da conversa como parte do produto.

---

# C · Contabilidade e modelo de dados

### C1 · Lançamento com N linhas desde o dia 1 — **DECIDIDO** (11/ago)
Venda com baixa de estoque tem 4 pernas num fato só; binário não serve.

### C2 · Integridade é do banco, não da tela — **REGRA** (11/ago)
Gatilho adiado exige D=C; FKs reais; trilha append-only. **Não existe lançamento torto** —
não porque a tela impede, mas porque o banco recusa.

### C3 · Retirada é conta de PATRIMÔNIO, não despesa — **REGRA** (11/ago)
Erro conceitual nº 1 do dono de negócio pequeno. Lançar como despesa quebra o lucro e destrói
o "quanto pode tirar".

### C4 · Valores fiscais nunca no código — **REGRA** (11/ago)
Vivem em `parametros_fiscais` com fonte e data. Populados em 13/ago (ano 2026).
⚠️ Reconferir todo janeiro; e o teto do MEI tem PLPs em tramitação, nenhum aprovado.

### C5 · Dinheiro misturado: gasto pessoal é RETIRADA, não "ignorar" — **DECIDIDO** (13/ago)
**Substitui:** o comportamento anterior, em que "é pessoal" apenas marcava o item.
**Problema que resolvia mal:** o dinheiro saía de verdade e o livro achava que continuava lá;
a conciliação nunca fecharia.
**Também:** dinheiro pessoal **entrando** vira **aporte**, não receita — senão infla o
faturamento e pode disparar alarme falso do teto do MEI.
**Afeta:** `classificacao.mjs`, `Livro.jsx`, `CaixaEntrada.jsx`, `negocios.dinheiro_misturado`.
**Provado:** saldo 1000 − 200 + 300 = 1100, balancete em zero.

### C6 · Dívida tem três classificações — **DECIDIDO** (14/ago)
`do negócio` · `pessoal mas o dinheiro entrou no negócio` · `só pessoal`.
**Por quê:** o caso do meio (empréstimo no nome dele para comprar a moto de entrega) é o mais
comum e o mais errado. Juridicamente é dele; quem paga é o caixa do negócio. Fora do livro, o
"quanto pode tirar" **mente para cima** — justamente o número que não pode.
**Só pessoal fica FORA do livro**, registrado como nota (muda quanto ele precisa tirar).

### C7 · Arquétipo de negócio decide plano de contas e roteiro — **DECIDIDO** (13/ago)
**Substitui:** o plano de contas único de comércio para todo cliente.
**Problema:** eletricista recebia "Estoque" e não recebia "Material aplicado"; informal era
perguntado quando "abriu o MEI".
**Os 8:** revenda · produção · serviço com mão de obra · serviço recorrente · digital ·
beneficiamento · intermediação · locação.
**Regra:** os 8 são **dados** (`arquetipos.mjs`), não 8 caminhos de código.

### C8 · Perguntas do roteiro vivem no banco, nunca em código — **REGRA** (12/ago, reforçada 14/ago)
Fonte única. Metade em código e metade no banco divergiria.

---

# D · Segurança

### D1 · RLS por `membros`, escrita só para `contador` — **REGRA** (11/ago)

### D2 · O `anon` não alcança tabela nenhuma — **REGRA** (14/ago)
A única porta sem login são três funções `security definer` do formulário público.
**Testado com a chave anon:** 401 em todas as tabelas; token inválido/revogado/vencido
respondem igual (não entrega que o token existiu); pergunta fora dos blocos 1-5 e
`pergunta_id` inventado recusados; resposta acima de 4000 chars recusada.

### D3 · Segredo vive em arquivo gitignored — **REGRA** (12/ago)
Nunca colado no chat, nunca em log, nunca no código.

### D4 · Token de gerenciamento mantido por ora — **DECIDIDO** (13/ago)
Sustenta migrar/conferir/backup. Reavaliar quando o schema estabilizar.

---

# E · Operação

### E1 · Deploy é MANUAL — **REGRA** (13/ago)
`npm run build && npm run bump && npm run publicar`. `git push` **não** republica.

### E2 · Backup semanal — **REGRA** (13/ago) · `npm run backup`, mantém 12 cópias

### E3 · Onboarding em duas camadas — **DECIDIDO** (14/ago)
Essencial na 1ª conversa; aprofundamento cobrado nos meses seguintes.
**Por quê:** entrevista longa faz cliente desistir antes de fechar.

### E4 · Formulário público para o cliente responder sozinho — **DECIDIDO** (14/ago)
Link com token, 30 dias, uma pergunta por vez, salva a cada resposta, retomável.
**Fora dele de propósito:** balanço de abertura (exige julgamento) e o combinado (é
negociação, não coleta).
**Abre caminho para:** coleta mensal pelo mesmo mecanismo; Diagnóstico Gratuito escalável.

### E5 · Fonte de verdade + memória evolutiva — **REGRA** (14/ago) 🆕
Ciclo permanente: **ANALISAR → DECIDIR → IMPLEMENTAR → REGISTRAR → ATUALIZAR CONTEXTO**.
Toda decisão importante entra neste arquivo, com estado. Decisão trocada vira SUBSTITUÍDA,
nunca some.

---

# F · Decisões tomadas sob a lente (14/ago)

### F0 · Prioridade por "valor no dia 1", não por profundidade — **DECIDIDO** (14/ago) 🆕
**Decisão:** entre duas análises igualmente boas, constrói primeiro a que **funciona no
primeiro mês de cliente**.
**Por quê:** o dono tem **zero clientes**. Toda análise que exige 3 meses fechados (despesa
fora do padrão, sazonalidade, comparativo) é inútil por um trimestre inteiro. Fluxo projetado,
hora do dono e projeção do limite funcionam com o dado que a própria abertura captura.
**Sinergia que decidiu o desempate:** essas três peças são também o que torna o **Diagnóstico
Gratuito** devastador — mesmo trabalho resolvendo transformação do cliente E máquina de venda,
que é o gargalo nº 1 (docs/09 §6).
**Substitui:** a ordem original do plano, que colocava achados históricos antes da projeção.

### F1 · Fluxo de caixa projetado — **IMPLEMENTADO** (14/ago) ✅
`src/dominio/fluxoProjetado.mjs` · 13 testes · visível em Entregas.
**Problema que resolve:** todo o resto do sistema é retrospectivo. Micronegócio não morre de
prejuízo, morre de **ficar sem dinheiro num dia específico**.
**Regra de honestidade:** **não projeta receita futura não registrada.** Chutar venda
transformaria o aviso em ficção otimista, e este é o número que não pode mentir para cima.
**Provado:** com R$1.000 em caixa, R$1.800 vencendo dia 20 e R$1.500 entrando dia 25, o
"quanto pode tirar" diz **+R$700** e a projeção diz **negativo em R$800 no dia 20**. Não é
contradição — é a diferença entre **saldo** e **sequência**. É assim que negócio quebra com
lucro no papel.

### F8 · Recorrentes reais no onboarding — **IMPLEMENTADO** (14/ago) ✅
`src/telas/ClienteNovo.jsx` (`BlocoContasFixas`) · reaproveita `recorrentes` +
`recorrente_linhas` já provados pela aba Recorrentes (docs/05 §7).
**Problema que resolvia mal:** "quais contas você paga todo mês" era coletado no Bloco 4 e
virava texto solto em `roteiro_respostas` — nunca gerava lançamento nenhum. O segundo mês do
cliente repetia trabalho que a primeira conversa já tinha feito.
**Item sem conta, valor ou descrição é ignorado, não bloqueia** — onboarding é rápido; o que
faltar dá para completar depois na própria aba Recorrentes.
**Não verificado ao vivo no navegador** (mesma limitação de sessão/login do F3) — build limpo,
189 testes, bundle carregado e conferido sem erro de render.

### F9 · Aba Roteiro para completar o aprofundamento depois — **IMPLEMENTADO** (14/ago) ✅
`src/telas/Roteiro.jsx` · aviso em `RetratoDoMes.jsx`.
**Problema que resolvia mal:** as perguntas `essencial = false` (E3) não tinham nenhuma tela
que as mostrasse depois da primeira conversa — ficavam órfãs para sempre assim que
`onboarded = true`. A decisão de duas camadas só funcionava pela metade sem isto.
**Fora da aba, de propósito:** Bloco 3 (balanço, tela própria), perguntas `negocios.*` (já
editáveis em `ConfigNegocio.jsx` — duplicar criaria duas telas gravando o mesmo campo) e
`retrato.*` (write-once — editar aqui divergiria do que foi congelado, em silêncio).
**Não verificado ao vivo no navegador** (mesma limitação de sessão/login do F3/F8) — build
limpo, 189 testes, bundle carregado sem erro de render.

### F2 · Hora do dono e projeção do limite — **IMPLEMENTADO** (14/ago) ✅
`src/dominio/valorDoTempo.mjs` · 14 testes.
**Calibração medida, não suposta:** a intuição de que "R$2.000 tirando 60h/semana fica abaixo
do mínimo por hora" está **ERRADA** — dá R$7,67/h contra R$7,37/h. A fronteira real com
60h/semana fica por volta de **R$1.920** de retirada. Registrado em teste porque significa
que o alerta dispara **menos** do que a intuição sugere — o que é bom (menos alarme falso).
**A projeção do limite separa as duas faixas** porque acima de 20% o desenquadramento é
retroativo a janeiro (docs/07 §4).

---

# F-bis · Propostas ainda aguardando decisão

### F3 · Retrato de entrada (linha de base) — **IMPLEMENTADO** (14/ago) ✅
`src/dominio/linhaDeBase.mjs` · migrações 0014 e 0015 · 14 testes.

**O que se descobriu construindo:** o instinto era guardar números — mas o número da abertura
**já está no livro**. O que some para sempre é a outra metade: **o que ele ACREDITAVA**. Por
isso o retrato tem dois lados, `declarado` e `medido`.

**A frase que justifica a peça**, gerada de ponta a ponta no teste:
> *"Quando começamos, você me disse que tirava R$ 2.000,00 por mês. O que os números mostram
> é R$ 4.100,00 — R$ 2.100,00 a mais do que você imaginava."*

Ela **só existe** porque o "ele disse" foi congelado antes de haver medição.

**Imutável no BANCO, não só na tela** (gatilho `retrato_de_entrada_imutavel`, migração 0014):
se a trava vivesse só no app, qualquer caminho novo — importação, correção, script — poderia
sobrescrever, e a linha de base deixaria de ser linha de base. Testado ao vivo: 1ª gravação
passa, 2ª é recusada, demais campos seguem editáveis.

**Achado corrigido antes de publicar:** a primeira versão localizava as perguntas por
**fragmento de texto**. Conflitava com C8 (perguntas são editáveis no banco de propósito):
reescrever o texto de uma pergunta faria a captura falhar **em silêncio**, num campo
write-once que não teria conserto depois. Trocado por `destino = 'retrato.*'` (migração 0015)
— **texto é editável, destino é contrato**. As 7 perguntas foram conferidas contra o banco:
sem duplicata, sem chave faltando.

**Bug de sinal pego por teste:** o patrimônio estava sendo invertido no código.
`saldoDeConta` já devolve o sinal correto para conta de PL — patrimônio negativo tem que sair
negativo (docs/06 §4).

### F4 · Achados com valor em R$, evidência e hipótese inocente — **PROPOSTA**
Hoje o achado aponta e para. Falta quanto custou, quais lançamentos geraram, e a explicação
legítima alternativa.

### F5 · Recomendação como hipótese testável — **PROPOSTA**
Carta ganha *efeito esperado* e *efeito medido*. Mostra coincidência temporal; **nunca afirma
causalidade**.

### F6 · Meta do cliente alimentando a Carta — **PROPOSTA**
Hoje o Bloco 5 é coletado e nunca usado. Desperdício de dado que já existe.

### F7 · Registrar o que foi EVITADO, não só o recomendado — **PROPOSTA**
A transformação mais valiosa (impedir a compra errada, evitar o desenquadramento) não deixa
rastro. Sem registro, o valor não é percebido nem cobrado.

---

# I · O que falta até estar pronto para uso com cliente real (14/ago) 🆕

> Esta seção é o checklist de prontidão. **Reescrever ao concluir cada item — nunca deixar
> desatualizada.** Separado em BLOQUEIA (o produto mente ou quebra sem isso) e MELHORA (o
> produto funciona sem, mas entrega menos).

**Hoje dá para receber o primeiro cliente de verdade E fazer a segunda conversa fazer
sentido:** cadastro por arquétipo, roteiro adaptativo, formulário público, balanço de
abertura com dívidas classificadas, dinheiro misturado tratado como retirada, recorrentes
reais, fluxo de caixa projetado, hora do dono, retrato de entrada, e agora (F9) o
aprofundamento tem onde ser respondido depois da primeira conversa. O ciclo de escrituração
mensal (Livro, Caixa de Entrada, Revisão, Entregas) já estava prático desde 13/ago.

### Nada bloqueia usar o sistema com cliente real hoje

O que resta é MELHORA, não bloqueio — o sistema funciona sem, entrega menos:

- **Fase 7 · Achados que revelam a dor invisível** — **PENDENTE** (retirada acima do
  resultado, mercadoria parada com terceiro, taxa engolindo margem, sem receita no período).
  Prioridade menor por design (F0): a maior parte exige meses fechados, e o dono tem zero
  clientes hoje — fluxo projetado e hora do dono (F1, F2) já cobrem o "funciona no dia 1".
- **Fase 8 · Docs e PDF atualizados, substituindo o que mudou** — **EM ANDAMENTO** (14/ago).
  `docs/10_MANUAL_DE_OPERACAO.md`, `docs/11_GO_TO_MARKET.md`, `docs/05_ROTEIRO_DO_SERVICO.md`
  §4 e `docs/06_MODELO_DE_DADOS.md` ainda descrevem o sistema de antes dos arquétipos.
  Materiais de venda e operação desatualizados não travam o uso interno, mas travam
  qualquer conversa com cliente ou pedido de ajuda que dependa do PDF.
- **Fase 11 · Memória do cliente (linha do tempo)** — **PENDENTE**. Valor cresce com o
  tempo — não faz falta no mês 1, faz falta na conversa do ano 2 (docs/08 §4).

---

# G · Em aberto e descartado

### G1 · Concentração de faturamento por cliente — **EM ABERTO**
"62% vem de um cliente só" exige dimensão de cliente nos lançamentos. Mudança de schema maior,
não avaliada.

### G2 · Margem por produto, ficha técnica, orçamento × realizado — **EM ABERTO**
Exigem dado por item que o sistema não coleta. Registrado, não prometido.

### G3 · Análise automática de causalidade — **DESCARTADA por ora** (14/ago)
Precisa de histórico longo e erra feio. **Substituída por:** mostrar coincidência temporal com
aviso explícito (P5).

### G4 · Comparação entre clientes / benchmark — **DESCARTADA por ora** (14/ago)
Sem massa de dados, e o risco de privacidade não compensa o ganho.

### G5 · "Plano do Mês" gerado automaticamente — **HIPÓTESE**
Só faz sentido depois que os achados forem confiáveis (F2). Prescrição sobre ruído é pior que
nenhuma prescrição.

### G6 · Portal do cliente com leitura do livro — **DESCARTADA** (11/ago, mantida)
Cliente entrega fato e documento; o contador classifica. **Nunca** acesso ao razão.
O formulário público (E4) é escrita-apenas e não contradiz isto.

---

# H · Contradições resolvidas

| Havia | Agora | Motivo |
|---|---|---|
| "É pessoal, ignorar" para todos | Com dinheiro misturado, vira retirada/aporte (C5) | O saldo mentia |
| Plano de contas único | Por arquétipo (C7) | Eletricista recebia CMV |
| Roteiro igual para MEI e informal | Adaptativo por tipo e arquétipo (C7, C8) | Informal era perguntado sobre MEI |
| Beneficiamento sem CMV | Com CMV | Vende mercadoria; sem CMV a margem infla |
| Recorrentes como texto livre no Bloco 4 | Vira cadastro real (F8) | Dado era coletado e jogado fora |
