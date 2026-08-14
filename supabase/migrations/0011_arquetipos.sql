-- ============================================================
-- CONTADORIA — Arquétipos de negócio, dinheiro misturado e roteiro
-- adaptativo (13/ago/2026).
--
-- POR QUE ESTA MIGRAÇÃO EXISTE
-- Até aqui o sistema tratava todo cliente igual: as mesmas 29 perguntas
-- para MEI e informal (o informal era perguntado quando "abriu o MEI"),
-- e um único plano de contas de COMÉRCIO para todo mundo. Eletricista
-- recebia "Estoque" e não recebia "Material aplicado".
--
-- Três mudanças estruturais:
--   1. `negocios.arquetipo`  — o que o negócio FAZ (decide plano de
--      contas, campos de abertura e quais perguntas aparecem)
--   2. `negocios.dinheiro_misturado` — coluna real, e não uma chave
--      dentro de `configuracao`, porque MUDA COMPORTAMENTO: quando é
--      true, gasto pessoal vira lançamento de retirada em vez de sumir
--      (ver src/telas/Livro.jsx). Precisa ser consultável e tipada.
--   3. `roteiro_perguntas` ganha `tipos`, `arquetipos` e `essencial` —
--      a mesma tabela passa a servir roteiros diferentes por cliente.
--
-- O ROTEIRO É RE-SEMEADO POR INTEIRO
-- O dono pediu evolução sem trilha de coisa velha. Como `negocios` está
-- em zero (backup de 13/ago), não há `roteiro_respostas` apontando para
-- pergunta nenhuma — apagar e reinserir é seguro. O DELETE de respostas
-- vem antes por causa da FK, e é no-op hoje.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. NEGÓCIOS — arquétipo e dinheiro misturado
-- ─────────────────────────────────────────────────────────────
alter table negocios add column if not exists arquetipo text;
alter table negocios add column if not exists dinheiro_misturado boolean not null default false;

do $$ begin
  alter table negocios add constraint negocios_arquetipo_valido
    check (arquetipo is null or arquetipo in (
      'revenda', 'producao', 'servico_mao_obra', 'servico_recorrente',
      'digital', 'beneficiamento', 'intermediacao', 'locacao'));
exception when duplicate_object then null; end $$;

comment on column negocios.arquetipo is
  'O que o negócio faz para ganhar dinheiro. Decide plano de contas, campos do balanço de abertura e quais perguntas do roteiro aparecem. Ver src/dominio/arquetipos.mjs.';

comment on column negocios.dinheiro_misturado is
  'true = usa a mesma conta/carteira para negócio e vida pessoal. Muda comportamento: gasto pessoal vira Retirada do titular (lançamento real), não "ignorar" — senão o saldo do livro descola da realidade.';

-- ─────────────────────────────────────────────────────────────
-- 2. ROTEIRO — a mesma tabela servindo roteiros diferentes
--    NULL em `tipos`/`arquetipos` = vale para todos (o caso comum).
-- ─────────────────────────────────────────────────────────────
alter table roteiro_perguntas add column if not exists tipos text[];
alter table roteiro_perguntas add column if not exists arquetipos text[];
alter table roteiro_perguntas add column if not exists essencial boolean not null default true;

comment on column roteiro_perguntas.tipos is
  'Para quais tipos de negócio a pergunta vale (mei, informal). NULL = todos.';
comment on column roteiro_perguntas.arquetipos is
  'Para quais arquétipos a pergunta vale. NULL = todos.';
comment on column roteiro_perguntas.essencial is
  'true = perguntada na primeira conversa (o livro não nasce certo sem). false = aprofundamento, cobrado nos meses seguintes (docs/10).';

-- ─────────────────────────────────────────────────────────────
-- 3. RE-SEED COMPLETO DO ROTEIRO
-- ─────────────────────────────────────────────────────────────
delete from roteiro_respostas;
delete from roteiro_perguntas;

insert into roteiro_perguntas (bloco, ordem, pergunta, porque_importa, tipo_resposta, destino, tipos, arquetipos, essencial) values

-- ══ Bloco 1 · Quem é ═════════════════════════════════════════
(1, 1, 'Quando você abriu o MEI?',
 'No primeiro ano o limite de faturamento é PROPORCIONAL aos meses de atividade — quem abriu em julho tem cerca de metade do teto. Sem essa data, o alerta de limite avisa tarde demais.',
 'data', 'negocios.data_abertura', '{mei}', null, true),
(1, 2, 'Qual é a atividade principal?',
 'Define se o DAS leva ICMS (comércio/indústria), ISS (serviço) ou os dois — e em qual coluna a receita entra no relatório mensal obrigatório.',
 'texto', 'negocios.atividade', '{mei}', null, true),
(1, 3, 'Tem funcionário?',
 'MEI pode ter até 1. Se tem, aparecem folha, FGTS e eSocial — o serviço fica bem maior, e o preço precisa acompanhar. Trate como outro produto.',
 'sim_nao', 'negocios.tem_funcionario', '{mei}', null, true),
(1, 4, 'Você vende para empresa, ou só para pessoa física?',
 'É o que trava o crescimento do informal: sem CNPJ ele não emite nota, e sem nota não vende para empresa. Saber se ele já perde venda por isso é o gancho da conversa sobre formalizar.',
 'texto', 'roteiro_respostas', '{informal}', null, true),
(1, 5, 'Já pensou em abrir CNPJ? O que te segura?',
 'Guarda a objeção real dele agora, para a conversa do 2º ou 3º mês — quando você já tiver mostrado o faturamento de verdade e o argumento se sustentar sozinho, com número em vez de opinião.',
 'texto_longo', 'roteiro_respostas', '{informal}', null, false),
(1, 6, 'WhatsApp',
 'É o canal real de troca de informação com o cliente. Anotar como registro, não guardar na cabeça.',
 'texto', 'negocios.whatsapp', null, null, true),

-- ══ Bloco 2 · Como o dinheiro anda ═══════════════════════════
(2, 1, 'Tem conta separada da pessoal?',
 'Decide qual dos três cenários de dado é o dele. Conta misturada custa cerca de 50%% mais tempo por mês — e é onde mora a maior entrega de consultoria: separar as duas vidas.',
 'sim_nao', 'roteiro_respostas', null, null, true),
(2, 2, 'Você usa o mesmo dinheiro para o negócio e para as suas coisas?',
 'A pergunta mais importante do roteiro. Se sim, o sistema trata TODO o dinheiro como sendo do negócio, e cada gasto pessoal vira uma RETIRADA registrada — não some do livro. É isso que faz o saldo bater com a realidade e revela, no fim do mês, quanto ele realmente tirou. Sem isso, o livro descola e a conciliação nunca fecha.',
 'sim_nao', 'negocios.dinheiro_misturado', null, null, true),
(2, 3, 'Qual banco? Consegue exportar o extrato?',
 'Se sim, a conciliação fica quase automática e a maior parte do trabalho mensal encolhe.',
 'texto', 'roteiro_respostas', null, null, true),
(2, 4, 'Recebe como — dinheiro, Pix, maquininha, boleto?',
 'Maquininha tem duas pegadinhas: a taxa é despesa que quase ninguém contabiliza, e o dinheiro cai dias depois — a venda e o recebimento são datas diferentes.',
 'texto', 'roteiro_respostas', null, null, true),
(2, 5, 'Vende fiado / a prazo?',
 'Decide se "contas a receber" existe de verdade no livro dele — e é o que alimenta o aviso de quanto ele tem para receber nos próximos 30 dias.',
 'sim_nao', 'roteiro_respostas', null, null, true),
(2, 6, 'Compra a prazo de fornecedor?',
 'Mesma lógica do fiado, do outro lado: é o que entra na projeção de caixa como compromisso a vencer.',
 'sim_nao', 'roteiro_respostas', null, null, true),
(2, 7, 'Emite nota? Para empresa?',
 'Nota para PJ é obrigatória; para pessoa física, só se pedirem.',
 'sim_nao', 'roteiro_respostas', '{mei}', null, false),

-- ══ Bloco 3 · A foto de hoje ═════════════════════════════════
-- Tela especializada (src/telas/ClienteNovo.jsx): os campos vêm do
-- arquétipo, não desta tabela. As linhas abaixo existem para o texto do
-- "por que importa" ao lado de cada campo comum a todos.
(3, 1, 'Quanto você tem hoje, em dinheiro e na conta?',
 'Vira as linhas de Caixa e Banco da abertura. Se ele usa o mesmo dinheiro para tudo, informe o total mesmo — o sistema trata como capital do negócio, e cada gasto pessoal daqui em diante aparece como retirada.',
 'lista_valores', 'lancamento_abertura', null, null, true),
(3, 2, 'O que o negócio tem que vale dinheiro? (forno, moto, máquina, computador)',
 'Vira linhas de Equipamentos — o que o negócio POSSUI, não o que ele gasta.',
 'lista_valores', 'lancamento_abertura', null, null, true),
(3, 3, 'Quem te deve, quanto, e para quando?',
 'Vira linhas de Clientes a receber. O vencimento não é detalhe: é o que permite projetar o caixa dos próximos 30 dias.',
 'lista_valores', 'lancamento_abertura', null, null, true),
(3, 4, 'Quanto você deve, para quem, e quando vence?',
 'Cada dívida precisa ser classificada: do negócio, sua pessoal, ou pessoal cujo dinheiro entrou no negócio. A terceira é comum (empréstimo no nome dele para comprar a moto de entrega) e É passivo do negócio — o caixa dele vai ter que pagar.',
 'lista_valores', 'lancamento_abertura', null, null, true),

-- ══ Bloco 4 · O ritmo do negócio ═════════════════════════════
-- "Quais contas você paga todo mês" saiu daqui: virou tela de cadastro
-- de RECORRENTES de verdade, não mais texto livre jogado fora.
(4, 1, 'Quanto costuma faturar por mês?',
 'Referência inicial e base do ponto de equilíbrio. Serve também para comparar com o que os números vão mostrar — a diferença entre o que ele acha e o que é costuma ser grande.',
 'moeda', 'roteiro_respostas', null, null, true),
(4, 2, 'Quanto você tira por mês para viver?',
 'Quase ninguém sabe responder direito. É a primeira coisa que o sistema descobre para ele, e costuma ser o momento em que entende para que serve o serviço.',
 'moeda', 'roteiro_respostas', null, null, true),
(4, 3, 'Quantas horas por semana você trabalha nisso?',
 'Com isso e a retirada, o sistema calcula quanto vale a HORA dele — e compara com o salário mínimo por hora. É um dos números mais duros que ele vai ver: muita gente descobre que trabalha 60 horas para ganhar menos por hora que um empregado.',
 'texto', 'roteiro_respostas', null, null, true),
(4, 4, 'Tem mês forte e mês fraco?',
 'Sazonalidade. Sem saber disso, um mês bom vira elogio indevido — era só o Natal. E é o que permite avisar em janeiro para guardar dinheiro para fevereiro.',
 'texto', 'roteiro_respostas', null, null, false),
(4, 5, 'Quais os principais produtos/serviços e o preço',
 'Base da margem por item, e da conversa sobre preço que não cobre o custo.',
 'texto_longo', 'roteiro_respostas', null, null, false),

-- ── Bloco 4 · perguntas próprias de cada arquétipo ────────────
(4, 10, 'Quanto você paga pelo que revende, em relação ao preço de venda?',
 'É a margem bruta. Sem ela não dá para dizer se o preço cobre o custo depois da taxa da maquininha e do frete.',
 'texto', 'roteiro_respostas', null, '{revenda}', false),
(4, 11, 'Tem mercadoria parada há muito tempo?',
 'Mercadoria parada é dinheiro preso na prateleira. Costuma ser a maior reserva escondida do negócio — e ninguém enxerga porque não parece dinheiro.',
 'texto', 'roteiro_respostas', null, '{revenda,beneficiamento}', false),

(4, 12, 'Quanto de insumo entra em cada produto, mais ou menos?',
 'É a base do custo por unidade. Sem isso não dá para saber se o preço cobre o que ele gasta para fazer — e produção própria é onde mais se vende no prejuízo sem perceber.',
 'texto_longo', 'roteiro_respostas', null, '{producao}', false),
(4, 13, 'Quanto você perde por mês com quebra, sobra ou produto que estragou?',
 'Perda quase nunca é contabilizada e come a margem em silêncio. Vira "sumiço".',
 'texto', 'roteiro_respostas', null, '{producao}', false),

(4, 14, 'Você cobra o deslocamento até o cliente?',
 'Quase ninguém cobra, e é uma das despesas que mais aparece no extrato. Se não cobra, está pagando para trabalhar — e quanto mais longe o serviço, pior o negócio.',
 'sim_nao', 'roteiro_respostas', null, '{servico_mao_obra}', true),
(4, 15, 'O material é por sua conta ou o cliente compra?',
 'Muda tudo: se é por conta dele, o material precisa entrar como custo E como valor cobrado, senão a margem sai errada e o serviço parece mais lucrativo do que é.',
 'texto', 'roteiro_respostas', null, '{servico_mao_obra}', true),
(4, 16, 'Quantos dias por mês você fica sem serviço nenhum?',
 'Dia parado é custo fixo correndo sem receita. É o número que explica o "trabalhei muito e não sobrou".',
 'texto', 'roteiro_respostas', null, '{servico_mao_obra}', false),

(4, 17, 'Quantos clientes fixos você tem hoje, e quanto cada um paga?',
 'É a receita previsível do negócio. E revela dependência: se um cliente sozinho é grande demais, a saída dele quebra o mês — e ele precisa saber disso antes de acontecer.',
 'texto_longo', 'roteiro_respostas', null, '{servico_recorrente}', true),
(4, 18, 'Costuma ter cliente atrasando a mensalidade?',
 'Inadimplência em carteira recorrente é silenciosa: o faturamento parece igual, mas o dinheiro não entra.',
 'sim_nao', 'roteiro_respostas', null, '{servico_recorrente}', false),

(4, 19, 'Vende por qual plataforma, e qual a taxa dela?',
 'A taxa é a despesa mais fácil de esquecer no digital, porque já vem descontada do valor que cai na conta — ele nunca a vê sair.',
 'texto', 'roteiro_respostas', null, '{digital}', true),
(4, 20, 'Quanto do faturamento é recorrente (assinatura) e quanto é venda avulsa?',
 'Recorrente é previsível; avulso não. A mistura dos dois define o risco do mês seguinte.',
 'texto', 'roteiro_respostas', null, '{digital}', false),
(4, 21, 'Gasta com anúncio? Quanto por mês?',
 'Anúncio é a despesa que mais cresce sem ninguém perceber — e só faz sentido comparada com a receita que traz.',
 'texto', 'roteiro_respostas', null, '{digital}', false),

(4, 22, 'Quanto tempo a mercadoria costuma ficar com o terceiro?',
 'É o prazo em que o dinheiro dele fica parado fora da mão. Quanto maior, mais capital de giro o negócio precisa — e maior o risco se algo acontecer lá.',
 'texto', 'roteiro_respostas', null, '{beneficiamento}', true),
(4, 23, 'Costuma ter perda ou peça que volta com defeito?',
 'A perda no processo é custo real e quase nunca é medida.',
 'texto', 'roteiro_respostas', null, '{beneficiamento}', false),

(4, 24, 'Você recebe o valor cheio e repassa, ou só recebe a sua comissão?',
 'Decide o que é receita SUA. Se recebe o cheio, só a comissão é receita — o resto é obrigação com o fornecedor, e passa pela conta sem ser dele. Lançar o bruto como receita infla o faturamento e pode disparar alarme falso do teto do MEI. ATENÇÃO: confirmar o enquadramento na legislação antes de orientar o cliente.',
 'texto', 'roteiro_respostas', null, '{intermediacao}', true),
(4, 25, 'Qual o percentual da sua comissão?',
 'É a receita real do negócio. Todo o resto passa pela conta mas não fica.',
 'texto', 'roteiro_respostas', null, '{intermediacao}', true),

(4, 26, 'Quantos dias por mês cada equipamento fica alugado, em média?',
 'É a taxa de ocupação. Equipamento parado é capital investido sem retorno — e o aluguel precisa cobrir a depreciação dele.',
 'texto', 'roteiro_respostas', null, '{locacao}', false),
(4, 27, 'Quanto gasta de manutenção por mês?',
 'Manutenção costuma comer boa parte da receita de locação, e raramente é medida contra ela.',
 'texto', 'roteiro_respostas', null, '{locacao}', false),

-- ══ Bloco 5 · O que ele quer ═════════════════════════════════
(5, 1, 'O que mais te incomoda hoje na parte do dinheiro?',
 'Vira o foco da Carta de recomendações todo mês. Sem isso, a consultoria vira relatório genérico e o cliente não vê valor.',
 'texto_longo', 'roteiro_respostas', null, null, true),
(5, 2, 'Você sabe se está ganhando dinheiro?',
 'A resposta quase sempre é "acho que sim". Registrar essa resposta AGORA é o que permite, daqui a três meses, mostrar a diferença entre o que ele achava e o que era.',
 'texto', 'roteiro_respostas', null, null, false),
(5, 3, 'Tem alguma meta? (comprar equipamento, contratar, abrir outro ponto)',
 'Dá direção para a consultoria do ano inteiro — e vira a pergunta "dá para comprar isso?" respondida com a projeção de caixa.',
 'texto_longo', 'roteiro_respostas', null, null, false),

-- ══ Bloco 6 · O combinado ════════════════════════════════════
(6, 1, 'Como e até quando ele manda a informação',
 'Sem prazo combinado, você vira o chato. Combinar na primeira conversa evita o desgaste depois.',
 'texto', 'roteiro_respostas', null, null, true),
(6, 2, 'O que você entrega, e quando',
 'Expectativa clara evita mal-entendido no terceiro mês.',
 'texto', 'roteiro_respostas', null, null, true),
(6, 3, 'Quanto, e como ele paga',
 'Óbvio, e todo iniciante esquece de combinar por escrito. Inclua o reajuste anual agora — é muito mais fácil que abrir a conversa do zero ano que vem.',
 'texto', 'roteiro_respostas', null, null, true),
(6, 4, 'O que você NÃO faz — dito em voz alta',
 'Não emite nota fiscal, não acessa a conta bancária do cliente, não assina peça contábil oficial (estudante, sem CRC — entrega relatório gerencial), não fala com a Receita pelo cliente. Isso não te diminui: delimita. Cliente com expectativa errada vira problema no terceiro mês.',
 'texto_longo', 'roteiro_respostas', null, null, true);

comment on table roteiro_perguntas is
  'O roteiro do cliente novo. Adaptativo: `tipos` filtra por MEI/informal, `arquetipos` por tipo de negócio, `essencial` separa a primeira conversa do aprofundamento. Editável — acrescente perguntas conforme o ofício ensinar (docs/05 §1).';
