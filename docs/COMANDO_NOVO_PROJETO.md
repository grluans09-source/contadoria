---
titulo: Comando para o projeto novo
subtitulo: Como abrir o projeto do zero e o texto exato para colar na IA que vai construí-lo
versao: 1.0 — 08/nov/2026
---

> ## ⚠️ Atualização de 08/nov/2026 — o projeto novo foi para a NUVEM
>
> Por decisão do dono, o projeto novo **não tem pasta neste computador**. Ele vive no
> repositório privado **`grluans09-source/contadoria-oficial`**, que já nasceu com tudo: o
> legado (`docs/00_LEGADO.md`), o comando da fase 0 adaptado para a nuvem
> (`docs/01_COMANDO_FASE_0.md`), um `CLAUDE.md` que leva a IA direto até ele, e uma cópia só de
> consulta do código antigo (`legado/contadoria/`).
>
> **Para começar:** abra uma sessão do Claude Code **na nuvem** com esse repositório, escolha o
> **Opus** e escreva *"começa"*. Os passos abaixo (pasta local) ficaram só como registro.

# 1 · Antes de colar o comando — 4 passos

**Passo 1 — Crie a pasta do projeto novo FORA do OneDrive.**
O OneDrive deste computador é da empresa (regra E10 do legado). Use a pasta `Projetos`, ao
lado da do Contadoria antigo. No PowerShell, trocando `NOME-DO-PROJETO` pelo nome que você
quiser (sem espaço, sem acento):

```
mkdir "C:\Users\LUAN S\Projetos\NOME-DO-PROJETO"
```

**Passo 2 — Abra o Claude Code nessa pasta nova.**
No app do Claude, aba Code: nova sessão, escolhendo a pasta `NOME-DO-PROJETO`. Não abra na
pasta do Contadoria antigo — o projeto novo precisa nascer na casa dele.

**Passo 3 — Escolha o Opus.**
Esta primeira etapa é desenho e julgamento, não programação. Escolha o modelo **Opus** no
seletor de modelo do app antes de colar.

**Passo 4 — Cole o comando da seção 2, inteiro.**
Se a IA pedir permissão para **ler** a pasta `C:\Users\LUAN S\Projetos\contadoria`, autorize:
é de lá que ela lê o legado. Ela **não** deve escrever nada lá.

---

# 2 · O comando para colar

Copie tudo o que está dentro da caixa abaixo:

```
Vou começar um projeto NOVO, do zero. Ele tem o mesmo propósito de um projeto
que eu já construí, o Contadoria, mas quero uma cara nova, mais refinada, e um
desenho mais bem pensado. Não é continuação: é refundação.

QUEM SOU EU
Sou o Luan, estudante de Contabilidade, ainda sem CRC. Vendo um SERVIÇO de
organização financeira e consultoria para MEIs e trabalhadores informais. O
sistema é ferramenta interna minha: o cliente nunca usa nem vê o sistema. Eu
uso no celular e no notebook. Não sou programador: eu decido produto, marca e
prioridade; você decide a parte técnica e me explica em português simples.
Escrevo rápido, às vezes em maiúsculas e sem acento - entenda a intenção.

O QUE VOCÊ PRECISA LER PRIMEIRO (OBRIGATÓRIO, ANTES DE QUALQUER COISA)
1. C:\Users\LUAN S\Projetos\contadoria\docs\LEGADO_CONTADORIA.md
   Leia INTEIRO. É a memória completa do projeto antigo: o produto, o mercado,
   o preço, o ofício, as regras contábeis exatas, o modelo de dados, a
   arquitetura, a identidade visual, o que deu errado e o mapa do que manter,
   melhorar, refazer, descartar e inovar. Atenção à legenda de estado:
   [NO AR], [SÓ NO MOTOR], [SÓ NO PAPEL], [DESCARTADO].
2. Depois, só como CONSULTA quando precisar de detalhe, o código antigo em
   C:\Users\LUAN S\Projetos\contadoria — principalmente src/dominio/ (as
   regras contábeis puras), supabase/migrations/ (o banco, em ordem), tests/
   (os testes) e docs/DECISOES.md (as decisões com o porquê).

REGRAS INVIOLÁVEIS
- A pasta e o repositório do Contadoria antigo são SÓ LEITURA. Nunca altere
  nada lá. O mesmo vale para o ContLife e para qualquer outro sistema meu.
- Reaproveitar é COPIAR para o projeto novo, nunca importar de lá. Todo arquivo
  copiado ganha, no topo, um comentário dizendo de onde veio e em que data.
- Nada é reconstruído só porque existiu. Cada peça passa de novo pela pergunta
  de sete degraus do legado (seção 5.4).
- Segredo (token, senha, chave) vive em arquivo ignorado pelo git. Nunca no
  código, nunca no chat, nunca em log. Se EU colar um segredo no chat, me avise
  na hora que ele ficou exposto e precisa ser trocado.
- Nada do projeto, nenhum segredo e nenhum dado de cliente em pasta
  sincronizada por conta de terceiro (OneDrive da empresa, Drive compartilhado).
- Limite profissional: só relatório GERENCIAL. Nunca documento que se apresente
  como peça contábil oficial assinada. Vocabulário regulado ("auditoria")
  nunca no que vai para o cliente.
- Fale português comigo: conversa, código, comentários, telas e commits.

COMO EU QUERO QUE VOCÊ TRABALHE
- Você é ARQUITETO, não executor: entenda o objetivo por trás do pedido,
  critique, aponte custo escondido, discorde quando enxergar melhor, pergunte
  o que for ambíguo - e só depois construa.
- Pode salvar (commitar) sem me pedir. Publicar (deploy) só com minha
  autorização, e juntando várias mudanças numa publicação só.
- "Pronto" significa: roda, foi testado no caso que funciona E no que deve
  recusar, EU consigo ver e usar na tela, está documentado e commitado. Função
  que só existe no motor NÃO está pronta (foi o erro da vigia do limite).
- Prove rodando, não por leitura. Teste o que eu vou usar como eu vou usar.
- Um passo por vez, validado antes do próximo. Corrija a classe do problema,
  não só a ocorrência.
- Documentação enxuta e viva: o CLAUDE.md deste projeto sempre atualizado
  (no antigo ele ficou dizendo "nada construído" até o fim), um arquivo de
  decisões com o porquê, um arquivo curto de estado atual. Sem diário de mil
  linhas.
- Me avise, numa linha, quando valer trocar de modelo: Opus para desenho e
  julgamento, Sonnet para implementação, Fable para marca e identidade.

O QUE EU QUERO AGORA - FASE 0, SEM ESCREVER CÓDIGO DO SISTEMA
Depois de ler o legado, me entregue, nesta ordem:

1. ENTENDIMENTO EM UMA PÁGINA: o que é o produto, para quem, o que ele vende
   e o que o torna diferente - com suas palavras, para eu conferir se você
   entendeu.
2. CRÍTICA DO LEGADO: onde você discorda do que foi decidido ou construído,
   o que acha que estava errado e por quê. Concordar com tudo não me ajuda.
3. O MAPA: o que MANTER, MELHORAR, REFAZER, DESCARTAR e as ideias para
   INOVAR - cada item com uma linha de justificativa. Use a seção 16 do
   legado como ponto de partida, não como resposta pronta. Inclua as três
   melhorias que eu já decidi (seção 16.2): exemplos nos campos do
   formulário, checklist de conferência das respostas com "pendente de
   análise", e painel inicial rico em abas - e me traga mais ideias para o
   painel de controle e gestão do meu escritório.
4. AS PERGUNTAS: as da seção 17 do legado e as que você mesmo achar
   necessárias. Explique por que cada uma muda o desenho.
5. A PROPOSTA DE ARQUITETURA: a pilha técnica e o porquê de cada escolha,
   respondendo aos pontos da seção 16.4 (CSS no build, dependências
   empacotadas, tipos no domínio contábil, deploy automático, banco sem morrer
   em silêncio, backup desde o dia 1, mecanismo de salvamento que nunca perde
   dado calado).
6. A PRIMEIRA VERSÃO MÍNIMA E A ORDEM DE CONSTRUÇÃO: o menor sistema que me
   deixa atender o primeiro cliente real ou fazer o primeiro Diagnóstico
   Gratuito real - e o que fica para depois. A gaveta de Obrigação (DAS,
   relatório mensal, limite do MEI) e uma entrega que chegue ao cliente (PDF
   ou imagem) precisam aparecer no plano, porque estão no preço e nunca foram
   feitas.
7. A ESTRUTURA DE DOCUMENTOS do projeto novo.

Nesta fase você PODE: copiar o LEGADO_CONTADORIA.md para docs/00_LEGADO.md
deste projeto novo, criar o CLAUDE.md inicial (deixando claro que estamos na
fase 0, de desenho), iniciar o git local e commitar. Você NÃO PODE: escrever o
código do sistema, criar repositório no GitHub (me pergunte antes qual conta
usar - eu tenho três), criar banco, publicar nada.

Depois de me entregar os 7 itens, PARE e espere minhas respostas. Só
começamos a construir quando eu aprovar o desenho.
```

---

# 3 · O que esperar da primeira resposta

A IA deve voltar com **os 7 itens, nessa ordem**, e **sem ter escrito código do sistema**.
Se ela pular direto para programar, lembre: *"pare — primeiro os 7 itens da fase 0"*.

O que você vai precisar decidir depois dela (a lista completa está no legado, §17):

- **O nome** e se a cara nova mantém o ouro do ContLife ou ganha identidade própria.
- **Se vai pagar** banco e hospedagem para não depender de plano gratuito (foi o plano
  gratuito que deixou o banco antigo morrer em silêncio).
- **Qual conta do GitHub** é a dona do projeto novo.
- **O que entra na primeira versão.**

# 4 · Três cuidados que valem para o projeto inteiro

1. **Nunca cole senha, token ou chave no chat.** Cole direto no arquivo que a IA indicar.
2. **Publicar gasta crédito.** Peça para juntar mudanças e publicar de uma vez.
3. **Depois de cada push, a IA deve confirmar que chegou no GitHub** — com três contas no
   mesmo computador, já aconteceu de o commit ficar só na máquina sem ninguém perceber.
