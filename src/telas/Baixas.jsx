import React, { useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Card, Select, Input, Button } from "../ui/primitivas.jsx";
import { recebiveisEmAberto, pagaveisEmAberto } from "../dominio/baixas.mjs";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtData = (d) => (d ? d.split("-").reverse().join("/") : "sem vencimento");
const hojeISO = () => new Date().toISOString().slice(0, 10);

const OPCOES_TRANSITO = [{ value: "caixa", label: "Caixa" }, { value: "banco", label: "Banco" }];

function LinhaItem({ item, nomeConta, onDarBaixa }) {
  const [abrindo, setAbrindo] = useState(false);
  const [data, setData] = useState(hojeISO());
  const [contaTransito, setContaTransito] = useState("caixa");

  const confirmar = () => {
    onDarBaixa(item, contaTransito, data);
    setAbrindo(false);
  };

  return (
    <div className="py-2" style={{ borderBottom: "1px solid var(--rule-faint)" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm truncate" style={{ color: "var(--ink)" }}>{item.descricao || nomeConta(item.contaId)}</div>
          <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{fmtData(item.vencimento)}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm tabular-nums" style={{ color: "var(--ink)" }}>{fmt(item.valor)}</span>
          {!abrindo && (
            <button onClick={() => setAbrindo(true)} className="text-xs inline-flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
              <CheckCircle2 size={13} /> Dar baixa
            </button>
          )}
        </div>
      </div>
      {abrindo && (
        <div className="flex items-end gap-2 mt-2 flex-wrap">
          <div>
            <div className="etiqueta uppercase mb-1" style={{ color: "var(--muted)" }}>Data</div>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="w-28">
            <div className="etiqueta uppercase mb-1" style={{ color: "var(--muted)" }}>Onde</div>
            <Select value={contaTransito} onChange={setContaTransito} options={OPCOES_TRANSITO} />
          </div>
          <Button small onClick={confirmar}>Confirmar</Button>
          <button onClick={() => setAbrindo(false)} className="transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }} aria-label="Cancelar"><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

/* Baixas — docs/08_DIFERENCIAL.md §2, o ganho de precisão do "quanto
   você pode tirar": ligar um recebimento/pagamento à fatura específica
   que ele quita, em vez de só confiar no saldo agregado da conta. */
export function Baixas({ contas, lancamentoLinhas, onDarBaixa }) {
  const nomeConta = useMemo(() => {
    const mapa = new Map(contas.map((c) => [c.id, c.nome]));
    return (id) => mapa.get(id) || id;
  }, [contas]);

  const recebiveis = useMemo(() => recebiveisEmAberto(lancamentoLinhas), [lancamentoLinhas]);
  const pagaveis = useMemo(() => pagaveisEmAberto(lancamentoLinhas), [lancamentoLinhas]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="font-medium mb-2" style={{ color: "var(--ink)" }}>A receber em aberto</div>
        {recebiveis.length === 0 ? (
          <div className="text-sm" style={{ color: "var(--muted)" }}>Nada em aberto — nenhuma venda a prazo esperando pagamento.</div>
        ) : (
          recebiveis.map((item) => <LinhaItem key={item.id} item={item} nomeConta={nomeConta} onDarBaixa={onDarBaixa} />)
        )}
      </Card>

      <Card>
        <div className="font-medium mb-2" style={{ color: "var(--ink)" }}>A pagar em aberto</div>
        {pagaveis.length === 0 ? (
          <div className="text-sm" style={{ color: "var(--muted)" }}>Nada em aberto — nenhum compromisso esperando pagamento.</div>
        ) : (
          pagaveis.map((item) => <LinhaItem key={item.id} item={item} nomeConta={nomeConta} onDarBaixa={onDarBaixa} />)
        )}
      </Card>

      <div className="nota" style={{ color: "var(--muted)" }}>
        Dar baixa aqui liga o recebimento/pagamento a este item específico — é o que deixa
        "quanto você pode tirar" mais preciso (docs/08 §2). Baixa é sempre do valor cheio;
        pagamento parcial ainda não tem uma tela própria.
      </div>
    </div>
  );
}
