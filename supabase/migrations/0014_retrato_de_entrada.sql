-- ============================================================
-- CONTADORIA — O retrato de entrada (docs/09, P6)
--
-- POR QUE ISTO É URGENTE E NÃO PODE ESPERAR
-- Transformação exige um ANTES. Se a foto de como o cliente chegou não
-- for tirada no onboarding, ela não é recuperável: os lançamentos vão
-- sendo corrigidos, o balanço evolui, e daqui a seis meses ninguém
-- reconstrói o que ele ACREDITAVA no dia 1.
--
-- E é justamente a metade "acreditava" que carrega o valor. O número da
-- abertura já está no livro. O que some para sempre é: ele disse que
-- tirava R$ 2.000 por mês. Quando a medição mostrar R$ 4.100, essa
-- distância é a entrega mais forte do serviço inteiro — e só existe se
-- o "ele disse" tiver sido congelado antes de existir medição.
--
-- IMUTÁVEL POR CONSTRUÇÃO
-- Grava uma vez, na conclusão do Roteiro do Cliente Novo, e nunca mais.
-- A trava está no gatilho abaixo, não só na tela: se ficasse só no
-- código do app, qualquer caminho novo (importação, correção, script)
-- poderia sobrescrever sem querer — e aí deixaria de ser linha de base.
-- ============================================================

alter table negocios add column if not exists retrato_de_entrada jsonb;

comment on column negocios.retrato_de_entrada is
  'Como o cliente chegou: o que ele DECLAROU (crença) e o que o balanço MEDIU (fato), congelados na conclusão do onboarding. Write-once — ver gatilho retrato_de_entrada_imutavel.';

-- ─────────────────────────────────────────────────────────────
-- A trava: depois de preenchido, não muda mais.
-- Permitir sobrescrever tornaria o campo "o estado atual de novo", e a
-- comparação perderia o sentido.
-- ─────────────────────────────────────────────────────────────
create or replace function impedir_reescrita_do_retrato()
returns trigger
language plpgsql
as $$
begin
  if old.retrato_de_entrada is not null
     and new.retrato_de_entrada is distinct from old.retrato_de_entrada then
    raise exception
      'retrato_de_entrada é a linha de base do cliente e não pode ser alterado depois de gravado (docs/09, P6)';
  end if;
  return new;
end $$;

drop trigger if exists retrato_de_entrada_imutavel on negocios;
create trigger retrato_de_entrada_imutavel
  before update on negocios
  for each row
  execute function impedir_reescrita_do_retrato();
