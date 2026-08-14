-- ============================================================
-- CONTADORIA — `destino` explícito nas perguntas que alimentam o
-- retrato de entrada.
--
-- POR QUE (achado logo depois de escrever a 0014)
-- A primeira versão do código localizava essas perguntas por FRAGMENTO
-- DE TEXTO ("tira por mês", "horas por semana"). Isso conflita com uma
-- decisão estrutural do projeto: as perguntas vivem no banco justamente
-- para serem EDITÁVEIS (C8). Reescrever o texto de uma pergunta faria o
-- código parar de encontrá-la — e a linha de base sairia vazia EM
-- SILÊNCIO, sem erro, sem aviso.
--
-- Pior: a linha de base é write-once (0014). Uma captura vazia não
-- seria corrigível depois.
--
-- Solução: mesmo mecanismo que já existe para `negocios.data_abertura`
-- e afins — `destino` nomeia para onde a resposta vai, e o código
-- procura por ele, não pelo texto.
-- ============================================================

update roteiro_perguntas set destino = 'retrato.faturamentoMensal'   where bloco = 4 and ordem = 1;
update roteiro_perguntas set destino = 'retrato.retiradaMensal'      where bloco = 4 and ordem = 2;
update roteiro_perguntas set destino = 'retrato.horasPorSemana'      where bloco = 4 and ordem = 3;
update roteiro_perguntas set destino = 'retrato.temContaSeparada'    where bloco = 2 and ordem = 1;
update roteiro_perguntas set destino = 'retrato.oQueIncomoda'        where bloco = 5 and ordem = 1;
update roteiro_perguntas set destino = 'retrato.achaQueGanhaDinheiro' where bloco = 5 and ordem = 2;
update roteiro_perguntas set destino = 'retrato.meta'                where bloco = 5 and ordem = 3;

comment on column roteiro_perguntas.destino is
  'Para onde a resposta vai. `negocios.*` grava no cadastro; `retrato.*` alimenta a linha de base (write-once, 0014); `roteiro_respostas` só arquiva. O código procura por ESTE campo, nunca pelo texto da pergunta — texto é editável, destino é contrato.';
