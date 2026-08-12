-- ============================================================
-- SEED DO ROTEIRO — as perguntas da entrevista de cliente novo
--
-- Conteúdo transcrito de docs/05_ROTEIRO_DO_SERVICO.md §4. Vive AQUI,
-- como dado no banco, e não como texto no código — é o que faz o
-- roteiro poder EVOLUIR depois de 10 clientes sem precisar mexer em
-- JavaScript (docs/05 §1: "o roteiro aprende").
--
-- O Bloco 3 (a foto de hoje / balanço de abertura) também está aqui —
-- para referência e para a explicação "por que importa" — mas a TELA
-- dele é especializada (src/telas/ClienteNovo.jsx), não o formulário
-- genérico dos outros blocos: são listas de itens (equipamentos, quem
-- deve, quanto deve), não uma resposta por pergunta.
--
-- `destino` documenta para onde a resposta vai, mas o Contadoria NÃO
-- tem um interpretador genérico desse campo (decisão registrada em
-- docs/SESSION_STATE.md, 12/ago): cada bloco tem código explícito que
-- lê a resposta e grava no lugar certo. Um interpretador genérico de
-- "destino" seria abstração para um problema que hoje tem exatamente
-- UM formulário — CLAUDE.md: "três linhas parecidas é melhor que
-- abstração prematura".
-- ============================================================

insert into roteiro_perguntas (bloco, ordem, pergunta, porque_importa, tipo_resposta, destino) values

-- ── Bloco 1 · Quem é ──────────────────────────────────────────
(1, 1, 'Tem CNPJ de MEI, ou é informal?',
 'Informal não tem obrigação nenhuma com o fisco — o serviço vira 100% gerencial. MEI tem quatro obrigações simples (docs/07_MEI_O_QUE_SABER.md §2).',
 'opcoes', 'negocios.tipo'),
(1, 2, 'Quando você abriu o MEI?',
 'No primeiro ano o limite de faturamento é PROPORCIONAL aos meses de atividade — quem abriu em julho tem cerca de metade do teto. Sem essa data, o alerta de limite avisa tarde demais.',
 'data', 'negocios.data_abertura'),
(1, 3, 'Qual é a atividade principal?',
 'Define se o DAS leva ICMS (comércio/indústria), ISS (serviço) ou os dois — e em qual coluna a receita entra no relatório mensal obrigatório.',
 'texto', 'negocios.atividade'),
(1, 4, 'Tem funcionário?',
 'MEI pode ter até 1. Se tem, aparecem folha e FGTS — o serviço é bem maior, e o preço deveria refletir.',
 'sim_nao', 'negocios.tem_funcionario'),
(1, 5, 'WhatsApp',
 'É o canal real de troca de informação com o cliente. Anotar como registro, não guardar na cabeça.',
 'texto', 'negocios.whatsapp'),

-- ── Bloco 2 · Como o dinheiro anda ────────────────────────────
(2, 1, 'Tem conta separada da pessoal?',
 'Decide qual dos três cenários de dado é o dele. Conta misturada custa cerca de 50% mais tempo por mês — e é onde mora a maior entrega de consultoria (separar as duas vidas).',
 'sim_nao', 'roteiro_respostas'),
(2, 2, 'Qual banco? Consegue exportar o extrato?',
 'Se sim, a conciliação fica quase automática e a maior parte do trabalho mensal encolhe.',
 'texto', 'roteiro_respostas'),
(2, 3, 'Recebe como — dinheiro, Pix, maquininha, boleto?',
 'Maquininha tem duas pegadinhas: a taxa é despesa que quase ninguém contabiliza, e o dinheiro cai dias depois — a venda e o recebimento são datas diferentes.',
 'texto', 'roteiro_respostas'),
(2, 4, 'Vende fiado / a prazo?',
 'Decide se "contas a receber" existe de verdade no livro dele. Se não vende a prazo, essa parte do balanço nem aparece.',
 'sim_nao', 'roteiro_respostas'),
(2, 5, 'Compra a prazo de fornecedor?',
 'Mesma lógica do fiado, do outro lado: decide se existem contas a pagar de fornecedor.',
 'sim_nao', 'roteiro_respostas'),
(2, 6, 'Emite nota? Para empresa?',
 'Nota para PJ é obrigatória; para pessoa física, só se pedirem.',
 'sim_nao', 'roteiro_respostas'),

-- ── Bloco 3 · A foto de hoje (balanço de abertura) ────────────
-- Tela especializada (src/telas/ClienteNovo.jsx) — ver comentário acima.
(3, 1, 'Quanto você tem hoje, em dinheiro e na conta?',
 'Vira as linhas de Caixa e Banco do lançamento de abertura.',
 'lista_valores', 'lancamento_abertura'),
(3, 2, 'O que o negócio tem que vale dinheiro? (forno, moto, máquina, computador)',
 'Vira linhas de Equipamentos — o que o negócio POSSUI, não o que ele gasta.',
 'lista_valores', 'lancamento_abertura'),
(3, 3, 'Se tiver mercadoria parada, quanto vale mais ou menos?',
 'Vira a linha de Estoque. Só o valor total por enquanto — detalhe por item fica para quando estoque entrar de verdade no sistema.',
 'lista_valores', 'lancamento_abertura'),
(3, 4, 'Quem te deve, quanto, e para quando?',
 'Vira linhas de Clientes a receber. Só existe se ele vende a prazo (Bloco 2).',
 'lista_valores', 'lancamento_abertura'),
(3, 5, 'Quanto você deve, para quem, e quando vence?',
 'Vira linhas de Fornecedores a pagar.',
 'lista_valores', 'lancamento_abertura'),
(3, 6, 'Tem empréstimo ou financiamento? Saldo e parcela',
 'Vira linhas de Empréstimos.',
 'lista_valores', 'lancamento_abertura'),

-- ── Bloco 4 · O ritmo do negócio ───────────────────────────────
(4, 1, 'Quais contas você paga todo mês, e quanto?',
 'Viram recorrentes — lançadas sozinhas todo mês. É o que faz o segundo mês em diante ser rápido. (Ainda registrado como texto — a automação de recorrentes é peça futura, ver docs/SESSION_STATE.md.)',
 'texto_longo', 'roteiro_respostas'),
(4, 2, 'Quanto costuma faturar por mês?',
 'Referência inicial e base do ponto de equilíbrio.',
 'moeda', 'roteiro_respostas'),
(4, 3, 'Tem mês forte e mês fraco?',
 'Sazonalidade. Sem saber disso, um mês bom vira elogio indevido — era só o Natal.',
 'texto', 'roteiro_respostas'),
(4, 4, 'Quanto você tira por mês pra viver?',
 'Quase ninguém sabe responder isso direito. É a primeira coisa que o sistema vai descobrir para ele — e costuma ser o momento em que ele entende para que serve o serviço.',
 'moeda', 'roteiro_respostas'),
(4, 5, 'Quais os principais produtos/serviços e o preço',
 'Base da margem por item, quando o sistema chegar lá.',
 'texto_longo', 'roteiro_respostas'),

-- ── Bloco 5 · O que ele quer ───────────────────────────────────
(5, 1, 'O que mais te incomoda hoje na parte do dinheiro?',
 'Vira o foco da Carta de recomendações todo mês. Sem isso, a consultoria vira relatório genérico.',
 'texto_longo', 'roteiro_respostas'),
(5, 2, 'Você sabe se está ganhando dinheiro?',
 'A resposta quase sempre é "acho que sim" — vale registrar essa resposta inicial para comparar com o que os números vão mostrar depois.',
 'texto', 'roteiro_respostas'),
(5, 3, 'Tem alguma meta? (comprar equipamento, contratar, abrir outro ponto)',
 'Dá direção para a consultoria do ano inteiro.',
 'texto_longo', 'roteiro_respostas'),

-- ── Bloco 6 · O combinado ──────────────────────────────────────
(6, 1, 'Como e até quando ele manda a informação',
 'Sem prazo combinado, o contador vira o chato. Combinar isso na primeira conversa evita o desgaste.',
 'texto', 'roteiro_respostas'),
(6, 2, 'O que você entrega, e quando',
 'Expectativa clara evita mal-entendido no terceiro mês.',
 'texto', 'roteiro_respostas'),
(6, 3, 'Quanto, e como ele paga',
 'Óbvio, e todo iniciante esquece de combinar por escrito.',
 'texto', 'roteiro_respostas'),
(6, 4, 'O que você NÃO faz — dito em voz alta',
 'Não emite nota fiscal, não acessa a conta bancária do cliente, não assina peça contábil oficial (é estudante, sem CRC — entrega relatório gerencial), não fala com a Receita pelo cliente. Isso delimita o serviço e protege o limite profissional sem precisar de explicação depois.',
 'texto_longo', 'roteiro_respostas');

comment on table roteiro_perguntas is
  'O roteiro do cliente novo — docs/05_ROTEIRO_DO_SERVICO.md §4. Editável: acrescente perguntas conforme o ofício ensinar (docs/05 §1).';
