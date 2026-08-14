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

# F · Propostas aguardando decisão do dono (14/ago)

### F1 · Linha de base no onboarding — **PROPOSTA** ⭐ urgente
Retrato imutável de como o cliente chegou. **Irrecuperável se adiado** — mesma lógica do campo
"recomendação seguida?".

### F2 · Achados com valor em R$, evidência e hipótese inocente — **PROPOSTA**
Hoje o achado aponta e para. Falta quanto custou, quais lançamentos geraram, e a explicação
legítima alternativa.

### F3 · Recomendação como hipótese testável — **PROPOSTA**
Carta ganha *efeito esperado* e *efeito medido*. Mostra coincidência temporal; **nunca afirma
causalidade**.

### F4 · Meta do cliente alimentando a Carta — **PROPOSTA**
Hoje o Bloco 5 é coletado e nunca usado. Desperdício de dado que já existe.

### F5 · Registrar o que foi EVITADO, não só o recomendado — **PROPOSTA**
A transformação mais valiosa (impedir a compra errada, evitar o desenquadramento) não deixa
rastro. Sem registro, o valor não é percebido nem cobrado.

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
| Recorrentes como texto livre no Bloco 4 | Vira cadastro real *(a implementar)* | Dado era coletado e jogado fora |
