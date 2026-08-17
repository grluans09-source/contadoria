-- ============================================================
-- CONTADORIA — A meta volta a alimentar o retrato de entrada
-- SUBSTITUI a decisão da 0016 (F6), que estava errada.
--
-- O QUE ACONTECEU (achado testando ao vivo, 17/ago)
-- A 0016 trocou o destino da pergunta da meta de `retrato.meta`
-- (posto pela 0015) para `carta.meta`, para a Carta de recomendações
-- poder lê-la. Efeito colateral não previsto: `montarRetratoDeEntrada`
-- procura por `destino LIKE 'retrato.%'` — então a meta parou de ser
-- capturada no retrato de entrada.
--
-- POR QUE ISSO É GRAVE E NÃO SÓ CHATO
-- O retrato é **write-once** (gatilho da 0014). Um cliente cadastrado
-- entre a 0016 e esta migração teve a meta gravada como `null` para
-- sempre, sem conserto — exatamente o modo de falha que a 0015 existia
-- para evitar, reintroduzido por outro caminho.
--
-- A LIÇÃO: `destino` é chave ÚNICA, não lista de assinantes
-- Duas features quiseram a mesma resposta e a segunda roubou a
-- primeira, em silêncio. A regra passa a ser: **quem congela ganha o
-- destino** (o retrato é write-once e irrecuperável; a Carta é
-- reeditável a qualquer momento). Quem só lê se adapta — a Carta agora
-- procura `retrato.meta`, e de quebra passa a mostrar a meta **como ela
-- foi declarada no dia 1**, que é mais fiel ao propósito dela.
-- ============================================================

update roteiro_perguntas set destino = 'retrato.meta' where bloco = 5 and ordem = 3;

comment on column roteiro_perguntas.destino is
  'Para onde a resposta vai — chave ÚNICA por pergunta, nunca lista. `negocios.*` grava no cadastro; `retrato.*` alimenta a linha de base (write-once, 0014); `roteiro_respostas` só arquiva. Se duas telas quiserem a mesma resposta, QUEM CONGELA GANHA o destino e quem só lê se adapta (0018) — senão a segunda feature rouba a primeira em silêncio. O código procura por ESTE campo, nunca pelo texto da pergunta.';
