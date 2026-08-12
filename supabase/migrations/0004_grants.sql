-- ============================================================
-- CONCESSÕES EXPLÍCITAS — necessário porque "Automatically expose new
-- tables" fica DESLIGADO no projeto (decisão de 12/ago/2026, registrada
-- em docs/SESSION_STATE.md).
--
-- Sem isto, mesmo com RLS e políticas corretas, o papel `authenticated`
-- não consegue nem TENTAR uma operação — GRANT é a camada ANTES da RLS:
-- decide se o papel pode tentar; a RLS decide quais linhas ele alcança
-- depois de tentar. As duas trancas, o mesmo espírito da trilha de
-- auditoria (docs/06 §10).
--
-- `anon` não recebe nada aqui de propósito: todo REST/RPC deste sistema
-- roda só depois de login — antes disso, a única coisa que existe é a
-- tela de autenticação, que fala com o GoTrue (auth.*), não com estas
-- tabelas.
-- ============================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  negocios, membros, contas, lancamentos, lancamento_linhas, periodos_fechados,
  entrada_itens, regras_classificacao, roteiro_perguntas, roteiro_respostas,
  trilha, lixeira, conciliacoes, parametros_fiscais
to authenticated;

-- `trilha.id` é bigserial: inserir sem informar o id precisa de USAGE na
-- sequência por trás da coluna, não só do GRANT na tabela.
grant usage, select on all sequences in schema public to authenticated;

-- As três funções chamadas diretamente pelo cliente via RPC. `meu_papel`
-- também é chamada por dentro das políticas de RLS, mas isso roda com o
-- privilégio do POSTGRES (dono da política), não precisa de grant à
-- parte por esse caminho — só precisa aqui porque o app também a chama
-- direto em telas de diagnóstico.
grant execute on function meu_papel(uuid) to authenticated;
grant execute on function criar_negocio(text, text, text) to authenticated;
grant execute on function aplicar_lote(uuid, jsonb) to authenticated;
