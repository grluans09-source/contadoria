import React, { useState, useMemo, useEffect } from "react";
import { Card, Select, Button, Input } from "../ui/primitivas.jsx";
import { resultadoDoMes } from "../dominio/razao.mjs";
import { quantoPodeTirar } from "../dominio/disponivel.mjs";
import { cartaPendenteDeAvaliacao } from "../dominio/cartas.mjs";
import { fluxoProjetado, aviseSobreOCaixa } from "../dominio/fluxoProjetado.mjs";
import { totalEvitado, evitadosDoMes } from "../dominio/evitados.mjs";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtMes = (m) => {
  const [ano, mes] = m.split("-");
  return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};
const hojeISO = () => new Date().toISOString().slice(0, 10);

/* ── O QUE VEM POR AÍ — a virada de retrospectivo para preditivo ──
   O resto desta tela conta o que já aconteceu, e isso é commodity: todo
   contador entrega. Esta seção responde a pergunta que ninguém responde
   ao MEI — "o que vem por aí?" — e é a única aqui que muda o desfecho
   em vez de explicá-lo (docs/09 §1.2).

   Micronegócio não morre de prejuízo; morre de ficar sem dinheiro num
   dia específico. */
function OQueVemPorAi({ lancamentos, lancamentoLinhas, recorrentes, recorrenteLinhas }) {
  const fluxo = useMemo(
    () => fluxoProjetado({
      lancamentos, lancamentoLinhas,
      recorrentes: recorrentes || [], recorrenteLinhas: recorrenteLinhas || [],
      hoje: hojeISO(), dias: 60,
    }),
    [lancamentos, lancamentoLinhas, recorrentes, recorrenteLinhas]
  );
  const aviso = useMemo(() => aviseSobreOCaixa(fluxo), [fluxo]);

  /* Sem nada a vencer, não há projeção honesta a mostrar — e silêncio é
     resposta válida (docs/09, P3). */
  if (!fluxo.eventos.length) return null;

  const corAviso = aviso?.gravidade === "aperto" ? "var(--debit)" : "var(--accent)";

  return (
    <Card className="mb-4">
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
        O que vem por aí · próximos 60 dias
      </div>

      {aviso ? (
        <>
          <div className="text-sm font-medium mb-1" style={{ color: corAviso, lineHeight: 1.5 }}>
            {aviso.frase}
          </div>
          <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>{aviso.oQueFazer}</div>
        </>
      ) : (
        <div className="text-sm mb-3" style={{ color: "var(--ink)" }}>
          O caixa se mantém positivo no período — o menor ponto é {fmt(fluxo.menorSaldo.saldo)}.
        </div>
      )}

      <div className="text-xs space-y-0.5" style={{ color: "var(--muted)" }}>
        <div>{fmt(fluxo.saldoHoje)} em caixa e banco hoje</div>
        {fluxo.entram > 0 && <div>+ {fmt(fluxo.entram)} a receber com vencimento no período</div>}
        {fluxo.saem > 0 && <div>− {fmt(fluxo.saem)} a pagar e contas fixas no período</div>}
      </div>

      <div className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>
        Só entra o que já está prometido — venda futura não registrada não é contada, de
        propósito.
      </div>
    </Card>
  );
}

/* Carta de recomendações (docs/04 §9, docs/08 §4) — texto livre por
   mês + a pergunta "foi seguida?" sobre a carta anterior. Estado local
   de digitação (mesmo padrão de ConfigNegocio/PlanoContas: só entra no
   loop reativo do Livro no "Salvar"), recarregado sempre que o mês
   escolhido muda. */
function CartaDeRecomendacoes({ mes, cartas, onSalvar, onAvaliarSeguida, metaDoCliente }) {
  const cartaDoMes = cartas.find((c) => c.mes === mes);
  const [texto, setTexto] = useState(cartaDoMes?.texto || "");
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => { setTexto(cartaDoMes?.texto || ""); }, [mes]); // eslint-disable-line

  const pendente = useMemo(() => cartaPendenteDeAvaliacao(cartas, mes), [cartas, mes]);

  const salvar = () => {
    onSalvar(mes, texto.trim());
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2000);
  };

  return (
    <Card className="mb-4">
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
        Carta de recomendações
      </div>

      {pendente && (
        <div className="text-xs rounded-md px-3 py-2 mb-3" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <div className="mb-2">A recomendação de {fmtMes(pendente.mes)} foi seguida? <em>"{pendente.texto}"</em></div>
          <div className="flex gap-2">
            <button onClick={() => onAvaliarSeguida(pendente.mes, true)} className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70" style={{ background: "var(--credit-soft)", color: "var(--credit)" }}>Sim</button>
            <button onClick={() => onAvaliarSeguida(pendente.mes, false)} className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>Não</button>
          </div>
        </div>
      )}

      {metaDoCliente && (
        <div className="text-xs rounded-md px-3 py-2 mb-3" style={{ background: "var(--rule-faint)", color: "var(--muted)", lineHeight: 1.6 }}>
          A meta que ele contou lá no início: <em>"{metaDoCliente}"</em> — vale olhar se a
          recomendação deste mês aproxima ou afasta disso.
        </div>
      )}

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="O que você viu este mês, e o que ele deveria fazer…"
        rows={3}
        className="w-full rounded-md border px-3 py-2 text-sm mb-2"
        style={{ borderColor: "var(--rule-faint)", background: "var(--paper)", color: "var(--ink)" }}
      />
      <div className="flex items-center gap-3">
        <Button small onClick={salvar}>Salvar carta</Button>
        {confirmado && <span className="text-xs" style={{ color: "var(--credit)" }}>Salvo.</span>}
      </div>
    </Card>
  );
}

/* O que foi EVITADO, não recomendado para o futuro (F7, docs/DECISOES.md).
   "A transformação mais valiosa não deixa rastro sozinha" — este card
   é o rastro. Fato datado e opcionalmente com valor, não texto livre
   de mês (por isso lista, não campo a mais na Carta). */
function OQueEvitamos({ mes, evitados, onAdicionar }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  const doMes = useMemo(() => evitadosDoMes(evitados, mes), [evitados, mes]);
  const total = useMemo(() => totalEvitado(evitados), [evitados]);

  const adicionar = () => {
    if (!descricao.trim()) return;
    const v = parseFloat(String(valor).replace(",", "."));
    onAdicionar(mes, descricao.trim(), Number.isFinite(v) && v > 0 ? v : null);
    setDescricao(""); setValor("");
    setConfirmado(true);
    setTimeout(() => setConfirmado(false), 2000);
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <div className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          O que evitamos
        </div>
        {total > 0 && <div className="text-xs" style={{ color: "var(--credit)" }}>{fmt(total)} evitado desde o início</div>}
      </div>

      {doMes.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {doMes.map((e) => (
            <div key={e.id} className="text-sm flex items-start justify-between gap-2" style={{ color: "var(--ink)" }}>
              <span>{e.descricao}</span>
              {e.valorEstimado > 0 && <span className="shrink-0" style={{ color: "var(--credit)" }}>{fmt(e.valorEstimado)}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input placeholder="ex.: evitou comprar equipamento sem precisar" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="flex-[2]" />
        <Input money placeholder="valor (opcional)" value={valor} onChange={(e) => setValor(e.target.value)} className="flex-1" />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Button small onClick={adicionar} disabled={!descricao.trim()}>Registrar</Button>
        {confirmado && <span className="text-xs" style={{ color: "var(--credit)" }}>Registrado.</span>}
      </div>
      <div className="text-[11px] mt-2" style={{ color: "var(--muted)" }}>
        A transformação que impede um erro não deixa rastro sozinha — registrar aqui é o que
        permite mostrar isso daqui a um ano.
      </div>
    </Card>
  );
}

/* Aviso de aprofundamento pendente (Fase 6, 14/ago) — antes da conversa
   do mês é a hora certa de lembrar, não durante ou depois dela. Some
   sozinho quando não há pendência: silêncio é resposta válida (P3). */
function AvisoAprofundamento({ quantidade, onAbrir }) {
  if (!quantidade) return null;
  return (
    <button onClick={onAbrir}
      className="w-full text-left text-xs rounded-md px-3 py-2 mb-4 transition-opacity hover:opacity-80"
      style={{ background: "var(--accent-soft)", color: "var(--ink)" }}>
      Faltam {quantidade} pergunta{quantidade > 1 ? "s" : ""} de aprofundamento — vale perguntar
      nesta conversa. <span style={{ color: "var(--accent)" }}>Ver no Roteiro →</span>
    </button>
  );
}

/* O Retrato do Mês — UMA página, não um relatório (docs/08 §3). O
   artefato é parte do produto: número grande, poucas frases, a
   pergunta que ninguém mais responde ("quanto você pode tirar",
   docs/08 §2), e o rodapé que protege o limite profissional (docs/02
   §4.3). Nada de tabela de 30 linhas — o Balancete existe pra isso. */
export function RetratoDoMes({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, cartas, recorrentes, recorrenteLinhas, evitados, onSalvarCarta, onAvaliarCartaSeguida, onAdicionarEvitado, metaDoCliente, pendentesDeAprofundamento, onAbrirRoteiro }) {
  const mesesComMovimento = useMemo(() => {
    const meses = new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean));
    return [...meses].sort().reverse();
  }, [lancamentos]);

  const mesesFechados = useMemo(
    () => new Set((periodosFechados || []).filter((p) => p.startsWith("mes:")).map((p) => p.slice(4))),
    [periodosFechados]
  );

  const mesPadrao = [...mesesFechados].sort().reverse()[0] || mesesComMovimento[0] || hojeISO().slice(0, 7);
  const [mes, setMes] = useState(mesPadrao);

  const opcoesMes = useMemo(() => {
    const todos = new Set([...mesesComMovimento, ...mesesFechados, mes]);
    return [...todos].sort().reverse().map((m) => ({ value: m, label: `${fmtMes(m)}${mesesFechados.has(m) ? " · fechado" : ""}` }));
  }, [mesesComMovimento, mesesFechados, mes]);

  const r = useMemo(() => resultadoDoMes(contas, lancamentos, lancamentoLinhas, mes), [contas, lancamentos, lancamentoLinhas, mes]);
  const disp = useMemo(
    () => quantoPodeTirar({ contas, lancamentos, lancamentoLinhas, periodosFechados, hoje: hojeISO() }),
    [contas, lancamentos, lancamentoLinhas, periodosFechados]
  );

  const diferenca = Math.round((r.resultado - r.variacaoCaixaBanco) * 100) / 100;
  const sobrouPositivo = r.resultado >= 0;

  return (
    <div className="max-w-lg">
      <div className="mb-4 max-w-xs">
        <Select value={mes} onChange={setMes} options={opcoesMes} />
      </div>

      <AvisoAprofundamento quantidade={pendentesDeAprofundamento} onAbrir={onAbrirRoteiro} />

      <Card className="mb-4" style={{ background: "linear-gradient(160deg, var(--surface), var(--paper))" }}>
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          {negocio.apelido || negocio.nome} · {fmtMes(mes)}
        </div>
        <div className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: sobrouPositivo ? "var(--credit)" : "var(--debit)" }}>
          {fmt(r.resultado)}
        </div>
        <div className="text-sm mb-1" style={{ color: "var(--ink)" }}>
          Entrou {fmt(r.receita)}, saiu {fmt(r.despesa)}, {sobrouPositivo ? "sobrou" : "faltou"} {fmt(Math.abs(r.resultado))}.
        </div>
        {Math.abs(diferenca) >= 0.01 && (
          <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
            O caixa e o banco se mexeram {fmt(r.variacaoCaixaBanco)} — a diferença de {fmt(Math.abs(diferenca))}{" "}
            virou estoque, conta a receber, pagamento de dívida ou retirada. É o Balanço que mostra onde exatamente.
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          Quanto você pode tirar
        </div>
        <div className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
          {fmt(disp.podeTirar)}
        </div>
        <div className="text-xs space-y-0.5" style={{ color: "var(--muted)" }}>
          <div>{fmt(disp.disponivelHoje)} disponível hoje em caixa e banco</div>
          {disp.aReceber > 0 && <div>+ {fmt(disp.aReceber)} a receber nos próximos 30 dias</div>}
          {disp.compromissos > 0 && <div>− {fmt(disp.compromissos)} em compromissos que vencem nos próximos 30 dias</div>}
          {disp.reserva > 0 && <div>− {fmt(disp.reserva)} de reserva mínima</div>}
        </div>
        <div className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>
          É uma recomendação com base no que foi lançado, não uma garantia.
        </div>
      </Card>

      <OQueVemPorAi
        lancamentos={lancamentos} lancamentoLinhas={lancamentoLinhas}
        recorrentes={recorrentes} recorrenteLinhas={recorrenteLinhas} />

      <CartaDeRecomendacoes mes={mes} cartas={cartas} onSalvar={onSalvarCarta} onAvaliarSeguida={onAvaliarCartaSeguida} metaDoCliente={metaDoCliente} />

      <OQueEvitamos mes={mes} evitados={evitados} onAdicionar={onAdicionarEvitado} />

      <div className="text-[10px] text-center" style={{ color: "var(--muted)" }}>
        Relatório gerencial — não é peça contábil oficial assinada.
      </div>
    </div>
  );
}
