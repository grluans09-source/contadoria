# Contadoria

Ferramenta de escrituração, revisão e consultoria para **MEIs e trabalhadores informais**.

**Uso interno do dono.** Ele vende o *serviço* de cuidar da contabilidade desses negócios —
não vende o sistema. O cliente nunca instala nem compra nada; recebe o relatório e a
conversa.

**Status: não iniciado.** Escopo fechado, nenhuma linha de código escrita.

## Comece por aqui

| Ordem | Documento | O que é |
|---|---|---|
| 1 | **[docs/SESSION_STATE.md](docs/SESSION_STATE.md)** | onde o trabalho parou. **Sempre primeiro** |
| 2 | [docs/02_ESCOPO.md](docs/02_ESCOPO.md) | o que o sistema é, decidido com o dono. Manda mais que o NORTE |
| 3 | [docs/04_MAPA_DO_APP.md](docs/04_MAPA_DO_APP.md) | o sistema por dentro, em linguagem natural |
| 4 | [docs/03_CENARIOS_E_CAPACIDADE.md](docs/03_CENARIOS_E_CAPACIDADE.md) | cenários de dado, quantos clientes cabem, ordem dos gargalos |
| 5 | [docs/01_ANALISE_REAPROVEITAMENTO.md](docs/01_ANALISE_REAPROVEITAMENTO.md) | o que vem do ContLife, conferido no código |
| 6 | [docs/00_NORTE.md](docs/00_NORTE.md) | o documento de partida, histórico |

## Relação com o ContLife

Projeto **independente** — pasta própria, git próprio, banco próprio. O
[ContLife](../sistema%20financeio) (finanças pessoais, já no ar em beta) é **fonte de
reaproveitamento**: motor de sincronização, transação do banco, autenticação e a linguagem
visual saem de lá. **Copiados para cá, não importados** — este sistema não pode quebrar se o
ContLife mudar.

⚠️ **Não alterar a pasta do ContLife.** Ele está em produção.

## O limite profissional

O dono é estudante de contabilidade, **sem CRC**. O Contadoria é ferramenta de organização e
**relatório gerencial**. Não emite peça contábil oficial assinada, e todo documento entregue
diz isso no rodapé.
