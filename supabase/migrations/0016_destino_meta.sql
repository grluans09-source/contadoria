-- ============================================================
-- CONTADORIA — `destino` explícito na pergunta da meta (F6, 14/ago)
--
-- POR QUE
-- "Tem alguma meta? (comprar equipamento, contratar, abrir outro
-- ponto)" (Bloco 5, ordem 3) era coletada e arquivada em
-- `roteiro_respostas` sem `destino` próprio — igual a toda pergunta
-- genérica. Mas essa resposta específica tem um consumidor concreto:
-- a Carta de recomendações, que hoje escreve o mês sem lembrar da
-- meta que o próprio cliente já contou (docs/DECISOES.md F6).
--
-- Mesma lição da 0015: encontrar a pergunta por FRAGMENTO DE TEXTO
-- quebraria em silêncio se alguém reescrevesse a pergunta (ela é
-- editável de propósito, C8). `destino` é contrato; texto é dele.
-- ============================================================

update roteiro_perguntas set destino = 'carta.meta' where bloco = 5 and ordem = 3;

comment on column roteiro_perguntas.destino is
  'Para onde a resposta vai. `negocios.*` grava no cadastro; `retrato.*` alimenta a linha de base (write-once, 0014); `carta.*` alimenta a tela de Carta de recomendações; `roteiro_respostas` só arquiva. O código procura por ESTE campo, nunca pelo texto da pergunta — texto é editável, destino é contrato.';
