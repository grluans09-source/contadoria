-- ============================================================
-- CONTADORIA — O texto que o CLIENTE lê, e o enxugamento da porta pública
--
-- Dois achados testando a função `formulario_abrir` com a chave anon
-- (14/ago/2026):
--
-- 1. Ela devolvia a linha inteira de `roteiro_perguntas`, incluindo
--    `destino` ("negocios.dinheiro_misturado", "lancamento_abertura"),
--    `tipos` e `arquetipos`. Não é dado sensível, mas é encanamento
--    interno numa página pública — porta aberta entrega só o necessário.
--
-- 2. Mais sério para o produto: `porque_importa` foi escrito PARA O
--    LUAN, e fala do cliente em terceira pessoa — "é o que trava o
--    crescimento do informal: sem CNPJ ELE não emite nota". Mostrar isso
--    ao próprio cliente soa como ler a ficha dele em voz alta.
--
-- Solução: coluna separada com a voz do cliente. Onde ela existe, o
-- formulário público mostra; onde não existe, não mostra nada — melhor
-- silêncio que texto na voz errada.
-- ============================================================

alter table roteiro_perguntas add column if not exists explicacao_cliente text;

comment on column roteiro_perguntas.explicacao_cliente is
  'O "por que estou perguntando isso" na voz do CLIENTE (2ª pessoa, sem jargão). `porque_importa` continua sendo a nota interna do Luan. Sem isto, o formulário público não mostra explicação.';

-- ── A voz do cliente, onde ela ajuda a responder ──────────────
update roteiro_perguntas set explicacao_cliente =
  'Se você vende para empresa, a nota fiscal costuma ser exigida — e isso muda o que vale a pena para você.'
  where bloco = 1 and ordem = 4;

update roteiro_perguntas set explicacao_cliente =
  'Sem julgamento nenhum: é muito comum. Saber disso me deixa organizar as suas contas do jeito certo desde o começo.'
  where bloco = 2 and ordem = 1;

update roteiro_perguntas set explicacao_cliente =
  'Essa é a pergunta mais importante. Se o dinheiro é o mesmo, eu registro os seus gastos pessoais como retirada — e no fim do mês você vê exatamente quanto tirou. Quase ninguém sabe esse número.'
  where bloco = 2 and ordem = 2;

update roteiro_perguntas set explicacao_cliente =
  'Se der para exportar o extrato, eu consigo organizar quase tudo sozinho e você quase não precisa fazer nada.'
  where bloco = 2 and ordem = 3;

update roteiro_perguntas set explicacao_cliente =
  'Cada forma de receber tem um detalhe. Maquininha, por exemplo, cobra taxa e o dinheiro cai dias depois — é fácil isso passar despercebido.'
  where bloco = 2 and ordem = 4;

update roteiro_perguntas set explicacao_cliente =
  'Valor aproximado está ótimo. Ninguém sabe de cabeça, e dá para acertar depois.'
  where bloco = 3;

update roteiro_perguntas set explicacao_cliente =
  'Se alguém te deve, isso é dinheiro seu que ainda não chegou. Anotar a data ajuda a prever seu caixa.'
  where bloco = 3 and ordem = 3;

update roteiro_perguntas set explicacao_cliente =
  'Anote tudo que você deve, mesmo o que for pessoal — eu separo depois o que é do negócio e o que não é.'
  where bloco = 3 and ordem = 4;

update roteiro_perguntas set explicacao_cliente =
  'Um número aproximado do que costuma entrar por mês. Serve de ponto de partida.'
  where bloco = 4 and ordem = 1;

update roteiro_perguntas set explicacao_cliente =
  'O quanto você tira para viver. É normal não saber direito — é uma das primeiras coisas que eu vou descobrir para você.'
  where bloco = 4 and ordem = 2;

update roteiro_perguntas set explicacao_cliente =
  'Com isso eu calculo quanto vale a sua hora de trabalho. Costuma ser uma surpresa.'
  where bloco = 4 and ordem = 3;

update roteiro_perguntas set explicacao_cliente =
  'Saber os meses fracos permite guardar dinheiro nos meses bons, em vez de ser pego de surpresa.'
  where bloco = 4 and ordem = 4;

update roteiro_perguntas set explicacao_cliente =
  'Isso vira o foco do que eu vou te ajudar a resolver primeiro.'
  where bloco = 5 and ordem = 1;

update roteiro_perguntas set explicacao_cliente =
  'Pode responder pelo sentimento mesmo. Daqui a alguns meses a gente compara com o número real — costuma ser bem diferente.'
  where bloco = 5 and ordem = 2;

update roteiro_perguntas set explicacao_cliente =
  'Se você tem uma meta, eu consigo te dizer se e quando ela cabe no seu caixa.'
  where bloco = 5 and ordem = 3;

update roteiro_perguntas set explicacao_cliente =
  'Se você não cobra o deslocamento, ele sai do seu bolso — e quanto mais longe o serviço, menos sobra.'
  where bloco = 4 and ordem = 14;

update roteiro_perguntas set explicacao_cliente =
  'Isso muda a conta: material por sua conta precisa entrar no preço, senão o serviço rende menos do que parece.'
  where bloco = 4 and ordem = 15;

update roteiro_perguntas set explicacao_cliente =
  'Enquanto a mercadoria está com outra pessoa, é dinheiro seu parado fora da sua mão. Vale acompanhar.'
  where bloco = 4 and ordem = 22;

update roteiro_perguntas set explicacao_cliente =
  'Isso decide o que é receita sua de verdade. Se você recebe o valor cheio e repassa, só a comissão é sua.'
  where bloco = 4 and ordem = 24;

update roteiro_perguntas set explicacao_cliente =
  'A taxa da plataforma já vem descontada, então quase ninguém percebe o quanto ela pesa no ano.'
  where bloco = 4 and ordem = 19;

-- ─────────────────────────────────────────────────────────────
-- PORTA PÚBLICA ENXUTA — só o que o formulário precisa desenhar.
-- `destino`, `tipos`, `arquetipos` e `porque_importa` (nota interna)
-- ficam de fora.
-- ─────────────────────────────────────────────────────────────
create or replace function formulario_abrir(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form      formularios%rowtype;
  v_negocio   negocios%rowtype;
  v_perguntas jsonb;
  v_respostas jsonb;
begin
  select * into v_form from formularios where token = p_token;

  if not found or v_form.revogado or v_form.expira_em < now() then
    return jsonb_build_object('ok', false, 'motivo', 'indisponivel');
  end if;

  select * into v_negocio from negocios where id = v_form.negocio_id;

  if v_form.aberto_em is null then
    update formularios set aberto_em = now() where id = v_form.id;
  end if;

  select coalesce(jsonb_agg(
           jsonb_build_object(
             'id', p.id,
             'bloco', p.bloco,
             'ordem', p.ordem,
             'pergunta', p.pergunta,
             'tipo_resposta', p.tipo_resposta,
             'explicacao', p.explicacao_cliente
           ) order by p.bloco, p.ordem), '[]'::jsonb)
    into v_perguntas
    from roteiro_perguntas p
   where p.ativo
     and p.bloco between 1 and 5
     and (p.tipos is null or v_negocio.tipo = any(p.tipos))
     and (p.arquetipos is null or (v_negocio.arquetipo is not null and v_negocio.arquetipo = any(p.arquetipos)));

  select coalesce(jsonb_object_agg(r.pergunta_id, r.resposta), '{}'::jsonb)
    into v_respostas
    from roteiro_respostas r
   where r.negocio_id = v_form.negocio_id and r.resposta is not null;

  return jsonb_build_object(
    'ok', true,
    'tipo', v_form.tipo,
    'concluido', v_form.concluido_em is not null,
    'negocio', coalesce(v_negocio.apelido, split_part(v_negocio.nome, ' ', 1)),
    'perguntas', v_perguntas,
    'respostas', v_respostas
  );
end $$;
