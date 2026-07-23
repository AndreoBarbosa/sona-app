"use client";

import { useState } from "react";
import { useMetas } from "@/lib/metas-context";
import { useToast } from "@/lib/toast-context";
import { formatBRL, type Meta } from "@/lib/mock-data";

/**
 * Botão + modal de "Pausar meta". A mecânica é a mesma do excluir (o aporte
 * mensal para de ser reservado e volta pra sobra sem destino), mas a meta
 * continua existindo e `valorAtual` não muda — só o aporte futuro é
 * liberado.
 *
 * Botão de confirmação NÃO é sage (`variant="secondary"`): sage no Sona
 * significa "progresso positivo dentro de um fluxo iniciado" — pausar é
 * interrupção, o oposto disso, um sage sólido encorajaria a própria ação que
 * o produto quer tratar com neutralidade. Usa a mesma caixa neutra do botão-
 * gatilho (borda #E4E0D8, fundo transparente, texto petroleo, 56px, radius
 * 12) — não o `Button variant="ghost"` compartilhado (esse é cinza claro/
 * discreto, pensado pra ações de baixíssima ênfase como "cancelar", não pra
 * um botão de confirmação de verdade). "Cancelar" é só um link de texto.
 *
 * Usa `useMetas()` (Context) — a mutação propaga pro app inteiro na hora,
 * sem precisar de Server Action nem `router.refresh()`.
 */
export function PausarMetaButton({ meta }: { meta: Meta }) {
  const { pausarMeta, retomarMeta } = useMetas();
  const { showToast } = useToast();
  const [aberto, setAberto] = useState(false);

  if (meta.status === "pausada") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-white px-4 py-3 text-center">
        <span className="text-body-sm text-ink-secondary">Meta pausada — o aporte está na sua sobra sem destino.</span>
        <button
          type="button"
          onClick={() => {
            retomarMeta(meta.id);
            showToast(`${meta.titulo} retomada. ${formatBRL(meta.aporteMensal)}/mês voltaram para o plano.`);
          }}
          className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400"
        >
          Retomar meta
        </button>
      </div>
    );
  }

  function confirmar() {
    pausarMeta(meta.id);
    setAberto(false);
    showToast(`${meta.titulo} pausada. ${formatBRL(meta.aporteMensal)}/mês voltaram para a sua sobra.`);
  }

  return (
    <>
      {/* Não usa o Button variant="ghost" compartilhado de propósito — aquele
          é cinza/discreto (pra ações de baixa ênfase tipo "cancelar"). Essa
          caixa precisa ler como AÇÃO REAL (borda #E4E0D8, texto petroleo,
          não cinza claro), só que sem o peso de um botão sólido — é
          reversível (dá pra "Retomar"), então fica abaixo de primary/
          secondary/tertiary na hierarquia, mas acima de um link de texto. */}
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="h-14 w-full rounded-button border border-border bg-transparent text-button text-ink-primary transition-colors hover:bg-base-100 active:bg-base-200"
      >
        Pausar meta
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-petroleo-700/40 px-4 pb-8"
          onClick={() => setAberto(false)}
        >
          <div
            className="flex w-full max-w-mobile flex-col gap-4 rounded-card-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Pausar meta
              </span>
              <p className="text-h3 text-ink-primary">Pausar {meta.titulo}?</p>
            </div>

            <p className="text-body-sm text-ink-secondary">
              Os <span className="font-medium text-ink-primary">{formatBRL(meta.aporteMensal)}/mês</span> voltam
              para a sua sobra sem destino. O que você já guardou (
              <span className="font-medium text-ink-primary">{formatBRL(meta.valorAtual)}</span>) continua como
              está.
            </p>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={confirmar}
                className="h-14 w-full rounded-button border border-border bg-transparent text-button text-ink-primary transition-colors hover:bg-base-100 active:bg-base-200"
              >
                Pausar meta
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-ink-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
