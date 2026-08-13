import React, { useEffect, useState } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { carregarPainelDoMes } from "../dados/painelDoMes.mjs";
import { montarPainelDoMes, mensagemCobranca, nomeDoMes } from "../dominio/painelDoMes.mjs";
import { Card } from "../ui/primitivas.jsx";

const STATUS_INFO = {
  nada: { texto: "falta: TUDO — nada chegou este mês", cor: "var(--debit)" },
  faltando: { texto: null, cor: "var(--debit)" }, // texto vem de `pendentes`, montado abaixo
  pronto: { texto: "falta: NADA — pronto pra fechar", cor: "var(--credit)" },
  fechado: { texto: "mês fechado", cor: "var(--muted)" },
};

function BotaoCopiar({ texto }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };
  return (
    <button onClick={copiar} className="text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70 shrink-0" style={{ color: "var(--accent)" }}>
      {copiado ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar mensagem</>}
    </button>
  );
}

/* Painel do Mês — docs/04_MAPA_DO_APP.md §3: "quem mandou e quem não
   mandou", de todos os clientes ao mesmo tempo, dia 5 de cada mês. */
export function PainelDoMes({ onVoltar }) {
  const [dados, setDados] = useState(null); // null = carregando
  const [erro, setErro] = useState("");

  useEffect(() => {
    let vivo = true;
    carregarPainelDoMes()
      .then((d) => { if (vivo) setDados(d); })
      .catch((e) => { if (vivo) setErro(e.message); });
    return () => { vivo = false; };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <button onClick={onVoltar} className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={14} /> Voltar
        </button>

        <div className="mb-1 text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>Painel do Mês</div>
        {dados && <div className="text-xs mb-6" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{nomeDoMes(dados.mes)} — quem mandou, quem falta</div>}

        {erro && <div className="text-xs rounded-md px-3 py-2 mb-4" style={{ background: "var(--debit-soft)", color: "var(--debit)" }}>{erro}</div>}

        {!dados && !erro && <div className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>}

        {dados && (() => {
          const painel = montarPainelDoMes(dados.negocios, dados.itensPorNegocio, dados.negociosComMesFechado);
          if (!painel.length) {
            return (
              <Card className="text-center py-12">
                <div className="text-sm" style={{ color: "var(--ink)" }}>Nenhum negócio ativo com onboarding concluído ainda.</div>
              </Card>
            );
          }
          return (
            <div className="space-y-2">
              {painel.map((linha) => {
                const info = STATUS_INFO[linha.status];
                const texto = linha.status === "faltando"
                  ? `falta: ${linha.pendentes} ${linha.pendentes === 1 ? "item" : "itens"} por classificar`
                  : info.texto;
                const mensagem = mensagemCobranca(linha, dados.mes);
                return (
                  <Card key={linha.negocioId} pad="apertado">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <span className="text-sm font-medium mr-2" style={{ color: "var(--ink)" }}>{linha.apelido || linha.nome}</span>
                        <span className="text-xs" style={{ color: info.cor }}>{texto}</span>
                      </div>
                      {mensagem && <BotaoCopiar texto={mensagem} />}
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
