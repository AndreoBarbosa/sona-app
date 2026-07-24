"use client";

import { BackButton } from "@/components/ui/back-button";
import { StatusBar } from "@/components/ui/status-bar";
import { cx } from "@/lib/cx";
import { useDemoStore } from "@/lib/demo-context";
import { getContasConectadas, getPatrimonioTotal, formatBRL, type BancoId } from "@/lib/mock-data";

/**
 * Home / Patrimônio — por conta — nó 1053:2198, rota /patrimonio. Sem nav
 * bar → BackButton. Alcançada pelo card Patrimônio da Home.
 *
 * Lista só as contas que a pessoa efetivamente conectou em /conectar
 * (`bancosConectados`, modo demo) — nunca "todas as contas do mock". A soma
 * exibida aqui é a MESMA fonte (`getPatrimonioTotal`) que o card da Home lê,
 * então os dois números batem sempre, por construção.
 *
 * Frase-resposta DERIVADA: "A maior parte está no {banco}" identifica
 * sozinha a conta de maior saldo entre as conectadas, nunca hardcoded
 * "Nubank" — muda sozinho se os bancos conectados mudarem.
 */

const BANK_LOGO: Record<BancoId, string> = {
  nubank: "/logos/nubank.svg",
  c6: "/logos/c6.svg",
  bradesco: "/logos/bradesco.svg",
  "mercado-pago": "/logos/mercadopago.svg",
  picpay: "/logos/picpay.svg",
};

export default function PatrimonioPage() {
  const { bancosConectados } = useDemoStore();
  const contasConectadas = getContasConectadas(bancosConectados);
  const total = getPatrimonioTotal(bancosConectados);
  const contaPrincipal = contasConectadas[0];

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/home" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Patrimônio consolidado
              </span>
              <p className="text-h2 text-ink-primary">
                {formatBRL(total)}.{contaPrincipal && ` A maior parte está no ${contaPrincipal.bancoNome}.`}
              </p>
            </div>
          </div>

          {contasConectadas.length > 0 ? (
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                Por conta
              </span>
              <div className="flex flex-col rounded-card border border-border bg-white">
                {contasConectadas.map((conta, i) => {
                  const zerada = conta.saldo === 0;
                  return (
                    <div
                      key={conta.id}
                      className={cx(
                        "flex items-center justify-between gap-4 px-4 py-[14px]",
                        i < contasConectadas.length - 1 && "border-b border-border",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-pill">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={BANK_LOGO[conta.bancoId]} alt="" aria-hidden="true" className="h-full w-full" />
                        </span>
                        <span className="text-h5 text-ink-primary">{conta.bancoNome}</span>
                      </div>
                      <span className={cx("text-h5", zerada ? "text-ink-muted" : "text-ink-primary")}>
                        {formatBRL(conta.saldo)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-body-sm text-ink-muted">Nenhuma conta conectada ainda.</p>
          )}

          <p className="text-[12px] font-normal leading-[1.5] text-ink-muted">Somente leitura · atualizado hoje</p>
        </main>
      </div>
    </div>
  );
}
