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

### E7 · `destino` é chave única, e QUEM CONGELA GANHA — **REGRA** (17/ago) 🆕
Duas features quiseram a mesma resposta do roteiro (a meta): a Carta (F6, migração 0016)
tomou o destino `retrato.meta` para si como `carta.meta`, e o retrato de entrada — que é
**write-once** — passou a gravar `meta: null` em silêncio.
**Regra:** `destino` é chave ÚNICA por pergunta, nunca lista de assinantes. Quando houver
disputa, **quem congela ganha** (retrato é irrecuperável; Carta é reeditável a qualquer
momento), e quem só lê se adapta. Desfeito pela migração 0018.
**Guardado por teste:** `tests/destinos.test.mjs` lê as migrações na ordem e recalcula o
estado final de cada `destino`, como o Postgres faria — provado com teste negativo (sem a
0018, ele falha apontando o bug). Existe porque a lógica estava certa dos DOIS lados: o que
quebrou foi um dado escrito por migração, terreno que nenhum teste cobria.

### E10 · O projeto NÃO mora em pasta de terceiro — **REGRA** (17/ago) 🆕
Até 17/ago o projeto morava em `OneDrive\Documentos\...` — e o OneDrive é **da empresa onde
o dono trabalha**. Movido para `C:\Users\LUAN S\Projetos\contadoria`.
**O que estava exposto, em ordem de gravidade:** a chave de administração do Supabase (quem a
tem lê e apaga o banco inteiro), os backups em JSON — que passarão a conter **dado financeiro
de cliente real**, com o sigilo respondendo por ele —, e a estratégia comercial
(`11_GO_TO_MARKET.md`). Soma-se o risco de continuidade: sair da empresa é perder o acesso.
**A divisão que vale:** o GitHub privado é o cofre (código, docs e PDFs — 121 arquivos); o
computador é a bancada (cópia do repo + as duas chaves, que por D3 nunca entram no git).
Perder a pasta local custa um `git clone` e recriar dois `.access-token`.
**Regra derivada:** backup, token e dado de cliente **nunca** em pasta sincronizada por conta
de terceiro — nem OneDrive corporativo, nem Drive compartilhado, nem pasta de rede da empresa.

### E8 · Identidade visual ÚNICA com o ContLife — **DECIDIDO** (17/ago) 🆕
**Substitui** a variação em cobre que vigorou de 12 a 17/ago (registrada em `02_ESCOPO.md` §5,
já corrigido lá).
**Era:** ouro no ContLife, cobre no Contadoria — para distinguir num relance qual sistema
estava aberto.
**Agora:** o **ouro do ContLife nos dois** (`#D4AF37` escuro, `#7A5C10` claro).
**Por quê:** os dois sistemas são do mesmo dono, para o mesmo tipo de trabalho; uma casa com
duas caras enfraquece as duas. Distinguir qual sistema está aberto é papel do NOME na tela.
**Regra derivada:** os hexadecimais são copiados do ContLife **sem alteração** — lá já
passaram por auditoria de contraste WCAG (notas A16 e D1). Mexer em qualquer tom refaz a
auditoria. Vale para app, tela de boot e PDF (este usa os tons do tema CLARO, porque imprime
sobre papel branco).
**Continua fora:** mascotes, Caduceu Vivo, vozes, léxico — identidade fechada do ContLife.

### E9 · Duas classes para a escala miúda — **REGRA** (17/ago) 🆕
`.etiqueta` (10px) é moldura — rótulo, selo, metadado, sempre em maiúsculas ou mono.
`.nota` (11px) é leitura — explicação, ressalva; entrelinha folgada.
**Por quê:** a auditoria de 17/ago achou TRÊS tamanhos abaixo de `text-xs` (9/10/11px) fazendo
o mesmo papel, escolhidos a esmo em 14 arquivos. Não use tamanho arbitrário novo; se precisar
de um terceiro, o problema provavelmente é outro.
**Mesma lógica** criou `<TituloCard>` e `<Selo>` em `primitivas.jsx`: o cabeçalho de card
estava copiado em 10 arquivos e o selo em 4. Repetição literal é como a inconsistência nasce —
a próxima mudança de régua deixa uma tela para trás.

### E6 · Créditos do Netlify são da conta, não do site — **REGRA** (15/ago) 🆕
A conta `grluans09-source` é plano gratuito (300 créditos/mês, ~15 por deploy de produção),
e o teto é **compartilhado** entre `contadoria-luan`, `contlife-beta` e qualquer outro site
da conta — inclusive um já apagado (o crédito gasto por ele no ciclo não volta).
**Sintoma:** `netlify deploy` devolve `JSONHTTPError: Forbidden` /
`Account credit usage exceeded`. **Não é token expirado** — confira antes em
`app.netlify.com/teams/grluans09-source/billing`. Ciclo reseta uma vez por mês (~dia 27-28).
**Consequência prática:** publicar depois de cada correção pequena esgota o mês rápido —
juntar várias mudanças num só `npm run publicar` estica o orçamento de deploys entre os
projetos que dividem a conta. Documentado também em `scripts/publicar.mjs`.

### E11 · Publicado no endereço definitivo (27/set) — e a causa real do "Git preso na conta errada" 🆕
**Publicado:** `contadoria-luan.netlify.app`, build v35, com tudo que faltava (identidade
dourada, 5 correções de bugs, Roteiro, Memória). Confirmado ao vivo, não só pelo log do
deploy: bundle certo carregado (`contadoria.js?v=35`), sem erro no console, e as variáveis
de CSS `--accent`/`--gold` batendo com `#D4AF37` direto na página em produção.

**O Git também estava preso na conta errada — mas a causa não era a óbvia.** A primeira
suspeita (Gerenciador de Credenciais do Windows guardando a senha da conta de trabalho,
`nba99926`) foi limpa com `cmdkey /delete` e **não resolveu** — o `git push` continuou
falhando com "Repository not found", sem nem abrir tela de login. **Causa real:** o
`~/.gitconfig` global tinha uma regra específica —
`credential.https://github.com.helper = !gh auth git-credential` — dizendo pro Git usar o
login do **GitHub CLI** (`gh`) para `github.com`, em vez do fluxo normal. E o `gh` só tinha a
conta de trabalho logada, usada **silenciosamente**, sem nunca perguntar nada. Corrigido
removendo essa linha (`git config --global --unset-all credential.https://github.com.helper`);
o próximo `git push`, rodado pelo dono na própria tela, abriu o login de verdade.
**Regra derivada de E10:** duas contas Google/GitHub no mesmo Windows não é só uma questão de
"qual senha está salva" — pode haver uma segunda camada (um credential helper customizado)
decidindo por conta própria qual conta usar, sem avisar. Confira `git config --list
--show-origin | grep helper` antes de assumir que apagar uma credencial resolve.

**`contadoria-site` (GitHub Pages, temporário) apagado** — confirmado via `gh repo view`
(não resolve mais o nome). Apagar um repositório exige, à parte do login normal, o escopo
`delete_repo` (`gh auth refresh -h github.com -s delete_repo`) — o GitHub separa essa
permissão do resto por segurança, mesmo com o usuário certo já logado.

**Token colado no chat (27/set):** o token novo do Netlify foi colado direto na conversa em
vez de só no arquivo, quebrando a regra de D3/E10. Foi usado para não travar a publicação do
dia, mas fica marcado como **exposto** — revogar em `app.netlify.com/user/applications` e
gerar outro só pelo arquivo.

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

### F10 · Achados que revelam a dor invisível — **IMPLEMENTADO** (14/ago) ✅
`src/dominio/achados.mjs`: `retiradaAcimaDoResultado` (universal, roda desde o dia 1, sem
depender de mês fechado — é o mesmo achado da retirada de F0/F1, agora também na Revisão, não
só no Retrato), `mercadoriaParadaComTerceiro`, `taxaEngolindoMargem`, `semReceitaNoPeriodo`.
Os três últimos só rodam se o arquétipo do negócio os declarar (`achadosDe`) — 13 testes.
**Cobre parcialmente F4** (valor em R$, sim; evidência anexada e hipótese inocente como texto
explícito ao lado do achado, ainda não — F4 continua PROPOSTA para essa parte).

### F11 · Docs 05/06/10/11 substituídos, PDFs regenerados (Fase 8) — **IMPLEMENTADO** (14/ago) ✅
`docs/05_ROTEIRO_DO_SERVICO.md`, `docs/06_MODELO_DE_DADOS.md`, `docs/10_MANUAL_DE_OPERACAO.md`,
`docs/11_GO_TO_MARKET.md` reescritos nas partes desatualizadas pelos arquétipos, dinheiro
misturado, roteiro adaptativo, formulário público, retrato de entrada e recorrentes reais —
substituindo, não acrescentando ao lado. `pdf/10` e `pdf/11` regenerados (`npm run pdf`).
**Achado no meio do trabalho:** duas referências ficaram desatualizadas porque a Fase 6 (aba
Roteiro) foi concluída depois que a reescrita começou em segundo plano — corrigidas antes do
commit. Lição: doc gerado por agente em paralelo precisa de uma segunda passada contra o
estado mais recente antes de publicar, não só contra o estado de quando começou.

### F12 · Memória do cliente — a linha do tempo (Fase 11) — **IMPLEMENTADO** (14/ago) ✅
`src/dominio/memoria.mjs` (`linhaDoTempo`, `medidoAgora`) · `src/telas/Memoria.jsx` · 8 testes.
Prometida em `08_DIFERENCIAL.md` §4 desde 11/ago e nunca construída — o próprio doc já dizia
"custo quase zero: a trilha, as respostas do roteiro e o histórico das cartas já estão no
modelo, falta só juntar numa tela". Foi exatamente isso: nada novo gravado, só junção.
**O que a aba mostra:** o retrato de entrada (F3) como primeiro evento, depois um evento por
**mês fechado** (mês aberto fica de fora — ainda é presente, não história, P3) com o
resultado do mês e a carta daquele mês com o selo seguida/não seguida/pendente. No topo, se
existir retrato de entrada, reaproveita `compararComAEntrada` (já existia para o Retrato do
Mês) contra o `medidoAgora` — a mesma frase forte ("você disse que tirava X, hoje é Y") agora
também aparece aqui, com o "agora" ancorado no último mês fechado, não no mês em aberto.
Tela **só leitura** — nada aqui grava nada.
**Não verificado ao vivo no navegador** (mesma limitação de sessão/login de F3/F8/F9) — build
limpo, 210 testes, bundle carregado sem erro de render.

### F13 · Registrar o que foi EVITADO (F7) — **IMPLEMENTADO** (14/ago) ✅
Migração `0017_evitados.sql` (tabela `evitados`, mesmo desenho de `recorrentes`: lista, não
célula de texto) · `src/dominio/evitados.mjs` · card "O que evitamos" nas Entregas · aparece
também na Memória, por mês. 6 testes novos.
**Por quê:** "a transformação mais valiosa (impedir a compra errada, evitar o
desenquadramento) não deixa rastro. Sem registro, o valor não é percebido nem cobrado."
**Deliberadamente manual, não detectado pelo sistema** — diferente dos achados (F10), que são
inferidos das contas, "o que evitei" só o Luan sabe (é uma conversa que não deixou lançamento).
Valor estimado é opcional: nem toda transformação evitada tem número claro, e inventar um
seria pior que não somar (P3).
Migração aplicada e conferida contra o banco real.

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

### F4 · Achados com valor em R$, evidência e hipótese inocente — **IMPLEMENTADO** (14/ago) ✅
Ver F10 abaixo (implementação) e F11 acima (evidência + hipótese inocente, feito depois).

### F5 · Recomendação como hipótese testável — **PROPOSTA, ainda não implementada**
Carta ganha *efeito esperado* e *efeito medido*. Mostra coincidência temporal; **nunca afirma
causalidade**. Não entrou nesta rodada porque "efeito medido" exige comparar o mês da carta
com meses seguintes — só fica honesto com pelo menos 2-3 meses de histórico depois da
recomendação, e o dono ainda tem zero clientes (mesmo raciocínio de F0). Revisitar quando
houver o primeiro cliente com 3 meses fechados.

### F6 · Meta do cliente alimentando a Carta — **IMPLEMENTADO** (14/ago) ✅
Ver F13 abaixo.

### F7 · Registrar o que foi EVITADO, não só o recomendado — **IMPLEMENTADO** (14/ago) ✅
Ver F13 abaixo.

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

**Todo o plano original (Fases 1-11) está implementado.** O que resta agora é o que só o uso
com cliente real vai revelar — não dá para planejar às cegas o que a prática vai ensinar
(G1, G2 e o resto da seção G abaixo registram o que já se sabe estar fora do escopo atual).

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
