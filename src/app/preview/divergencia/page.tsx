"use client";

import { useState } from "react";
import Link from "next/link";
import { useMetas } from "@/lib/metas-context";
import { getMetasAtivas, isMetaDivergente, isMetaConcluivel, formatBRL } from "@/lib/mock-data";

/**
 * Preview de QA — não é uma tela do produto. Gatilhos de teste pra estados
 * que dependem de dado que não existe no mock (saldo bancário real) ou de
 * tempo passando (meses de aporte até bater o valor alvo):
 *   - `simularDivergencia` — Ajuste de rota (`/metas/[id]/ajuste-de-rota`)
 *   - `forcarValorAtual` — Meta concluída (estado em `/metas/[id]`)
 * Sem eles, nenhuma meta jamais diverge nem conclui neste app.
 */
export default function DivergenciaPreview() {
  const { metas, simularDivergencia, forcarValorAtual } = useMetas();
  const [valor, setValor] = useState("400");
  const metasAtivas = getMetasAtivas(metas);

  const diferenca = Number(valor.replace(/\D/g, "")) || 0;

  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col gap-8 overflow-y-auto bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Forçar estados de meta</h1>
        <p className="text-body-sm text-ink-secondary">
          Simula divergência de saldo (Ajuste de rota) ou força a conclusão de uma meta (Meta
          concluída) — nenhum dos dois acontece sozinho neste mock.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
          Diferença a simular (R$)
        </span>
        <div className="flex items-center gap-1.5 rounded-card border border-border bg-white px-4 py-3">
          <span className="text-[14px] font-normal text-ink-muted">R$</span>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            inputMode="numeric"
            className="w-full bg-transparent text-[14px] font-normal leading-[1.4] text-ink-primary outline-none"
          />
        </div>
      </label>

      <div className="flex flex-col gap-3">
        {metasAtivas.map((meta) => {
          const divergente = isMetaDivergente(meta);
          const concluivel = isMetaConcluivel(meta);
          return (
            <div key={meta.id} className="flex flex-col gap-2 rounded-card border border-border bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px] font-medium text-ink-primary">{meta.titulo}</span>
                <span className="text-[12px] text-ink-muted">
                  {formatBRL(meta.valorAtual)} de {formatBRL(meta.valorAlvo)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {divergente ? (
                  <span className="text-[12px] font-medium text-coral-500">
                    Já divergente — saldo real {formatBRL(meta.saldoReal!)}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={diferenca <= 0 || diferenca >= meta.valorAtual}
                    onClick={() => simularDivergencia(meta.id, meta.valorAtual - diferenca)}
                    className="w-fit rounded-button border border-coral-400 px-4 py-2 text-[13px] font-medium text-coral-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Simular −{formatBRL(diferenca)}
                  </button>
                )}
                {concluivel ? (
                  <span className="text-[12px] font-medium text-sage-600">Valor alvo batido — abra o detalhe</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => forcarValorAtual(meta.id, meta.valorAlvo)}
                    className="w-fit rounded-button border border-sage-500 px-4 py-2 text-[13px] font-medium text-sage-600"
                  >
                    Forçar conclusão
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <Link href={`/metas/${meta.id}`} className="text-[12px] font-medium text-petroleo-400">
                  Ver detalhe →
                </Link>
                {divergente && (
                  <Link href={`/metas/${meta.id}/ajuste-de-rota`} className="text-[12px] font-medium text-coral-500">
                    Ver ajuste de rota →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/home" className="text-[12px] font-medium text-ink-muted">
        ← Voltar pra Home
      </Link>
    </main>
  );
}
