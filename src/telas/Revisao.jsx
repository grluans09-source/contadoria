import React, { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Lock, Unlock, Search } from "lucide-react";
import { Card, Select, Button } from "../ui/primitivas.jsx";
import { mesaDeRevisao, podeFecharPeriodo } from "../dominio/revisao.mjs";
import { encontrarAchados } from "../dominio/achados.mjs";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const fmtMes = (m) => {
  const [ano, mes] = m.split("-");
  return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "—");
const hojeISO = () => new Date().toISOString().slice(0, 10);

function textoAchado(a) {
  if (a.tipo === "mes_sem_movimento") return `${fmtMes(a.mes)} não tem nenhum lançamento — mês pulado no meio da história`;
  if (a.tipo === "despesa_fora_padrao") return `${a.contaNome} em ${fmtMes(a.mes)}: ${fmt(a.valor)} — bem acima da média de meses fechados (${fmt(a.media)})`;
  if (a.tipo === "receita_sem_dinheiro") return `"${a.descricao}" (${fmtData(a.data)}) — receita registrada sem dinheiro nem a receber em lugar nenhum`;
  if (a.tipo === "retirada_acima_do_resultado") return `Em ${fmtMes(a.mes)}, a retirada (${fmt(a.retirada)}) já passou o que o negócio gerou (${fmt(a.resultado)}) em ${fmt(a.diferenca)}`;
  if (a.tipo === "mercadoria_parada_com_terceiro") return `${fmt(a.valor)} em mercadoria parada com terceiro há ${a.dias} dias (desde ${fmtData(a.desde)})`;
  if (a.tipo === "taxa_engolindo_margem") return `A taxa comeu ${fmt(a.valor)} em ${fmtMes(a.mes)} — ${a.percentual}% da receita (${fmt(a.receita)})`;
  if (a.tipo === "sem_receita_no_periodo") return `${a.diasSemReceita} de ${a.diaHoje} dias de ${fmtMes(a.mes)} sem nenhuma receita lançada (${a.fracaoPercentual}%)`;
  return "";
}

function Achados({ achados }) {
  return (
    <Card className="mb-6">
      <div className="font-medium mb-3 flex items-center gap-2" style={{ color: "var(--ink)" }}>
        <Search size={15} /> Achados
      </div>
      {achados.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--muted)" }}>Nada fora do padrão encontrado.</div>
      ) : (
        <div className="space-y-2">
          {achados.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle size={15} style={{ color: "var(--debit)", marginTop: 2, flexShrink: 0 }} />
              <span style={{ color: "var(--ink)" }}>{textoAchado(a)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function MesaChecks({ checks }) {
  return (
    <Card className="mb-6">
      <div className="font-medium mb-3" style={{ color: "var(--ink)" }}>Mesa de Revisão</div>
      <div className="space-y-2">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            {c.ok ? <CheckCircle2 size={15} style={{ color: "var(--credit)", marginTop: 2, flexShrink: 0 }} /> : <AlertTriangle size={15} style={{ color: "var(--debit)", marginTop: 2, flexShrink: 0 }} />}
            <div>
              <span style={{ color: "var(--ink)" }}>{c.nome}</span>
              <span className="text-xs ml-2" style={{ color: c.ok ? "var(--muted)" : "var(--debit)" }}>{c.detalhe}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Fechamento({ lancamentos, periodosFechados, mesaPassa, onFechar, onReabrir }) {
  const mesesComMovimento = useMemo(() => {
    const meses = new Set(lancamentos.map((l) => (l.data || "").slice(0, 7)).filter(Boolean));
    return [...meses].sort();
  }, [lancamentos]);

  const fechados = useMemo(() => new Set(periodosFechados.filter((p) => p.startsWith("mes:")).map((p) => p.slice(4))), [periodosFechados]);
  const abertos = mesesComMovimento.filter((m) => !fechados.has(m));

  const [mesEscolhido, setMesEscolhido] = useState(abertos[0] || "");

  return (
    <Card>
      <div className="font-medium mb-3" style={{ color: "var(--ink)" }}>Fechamento de mês</div>

      {abertos.length === 0 ? (
        <div className="text-sm mb-4" style={{ color: "var(--muted)" }}>Nenhum mês em aberto com movimento para fechar.</div>
      ) : (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-48"><Select value={mesEscolhido} onChange={setMesEscolhido} options={abertos.map((m) => ({ value: m, label: fmtMes(m) }))} /></div>
          <Button onClick={() => onFechar(mesEscolhido)} disabled={!mesaPassa || !mesEscolhido}>
            <Lock size={13} /> Fechar {mesEscolhido ? fmtMes(mesEscolhido) : ""}
          </Button>
        </div>
      )}
      {!mesaPassa && abertos.length > 0 && (
        <div className="text-xs mb-4" style={{ color: "var(--debit)" }}>A Mesa de Revisão precisa passar em tudo antes de fechar.</div>
      )}

      {fechados.size > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Meses fechados</div>
          {[...fechados].sort().reverse().map((m) => (
            <div key={m} className="flex items-center justify-between py-1.5 text-sm" style={{ borderBottom: "1px solid var(--rule-faint)" }}>
              <span style={{ color: "var(--ink)" }}>{fmtMes(m)}</span>
              <button onClick={() => onReabrir(m)} className="text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
                <Unlock size={12} /> Reabrir
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Trilha({ trilha }) {
  const recentes = [...trilha].slice(-15).reverse();
  if (recentes.length === 0) return null;
  return (
    <Card className="mt-6">
      <div className="font-medium mb-3" style={{ color: "var(--ink)" }}>Trilha — o que aconteceu por último</div>
      <div className="space-y-1.5 text-xs">
        {recentes.map((t, i) => (
          <div key={i} style={{ color: "var(--muted)" }}>
            <span className="font-mono uppercase" style={{ color: "var(--accent)" }}>{t.tipo}</span> — {t.descricao}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* A Revisão — o papel de auditor e o selo do mês (docs/04 §7-8). */
export function Revisao({ negocio, contas, lancamentos, lancamentoLinhas, periodosFechados, trilha, onFechar, onReabrir }) {
  const checks = useMemo(() => mesaDeRevisao(contas, lancamentos, lancamentoLinhas), [contas, lancamentos, lancamentoLinhas]);
  const mesaPassa = podeFecharPeriodo(checks);
  const achados = useMemo(
    () => encontrarAchados(contas, lancamentos, lancamentoLinhas, periodosFechados, { arquetipo: negocio?.arquetipo, hoje: hojeISO() }),
    [contas, lancamentos, lancamentoLinhas, periodosFechados, negocio?.arquetipo]
  );

  return (
    <div>
      <MesaChecks checks={checks} />
      <Achados achados={achados} />
      <Fechamento lancamentos={lancamentos} periodosFechados={periodosFechados} mesaPassa={mesaPassa} onFechar={onFechar} onReabrir={onReabrir} />
      <Trilha trilha={trilha} />
    </div>
  );
}
