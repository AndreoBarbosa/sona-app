"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { BANCO_COM_FALHA_ID } from "@/lib/bancos";

/**
 * Compartilhamento Open Finance — nó 778:4610, rota /conectar/permissoes.
 * O que é lido, sempre com o par "somente leitura + revogável a qualquer
 * momento" bem explícito. A frase "Sua senha bancária nunca é acessada ou
 * armazenada pelo sona." é OBRIGATÓRIA (regra do produto, não só do Figma).
 *
 * "Autorizar compartilhamento" simula uma autorização real (~1s) antes de
 * decidir sucesso/erro — `BANCO_COM_FALHA_ID` é o único banco com falha
 * DETERMINÍSTICA, pra o caminho de erro ser testável de verdade, nunca por
 * sorte.
 */

const DADOS_COMPARTILHADOS = [
  { titulo: "Saldo e extrato", detalhe: "Últimos 12 meses de transações" },
  { titulo: "Categorias de gasto", detalhe: "Classificação automática dos seus gastos" },
  { titulo: "Capacidade mensal", detalhe: "Valor disponível para investir ou poupar" },
];

export default function ConectarPermissoesPage() {
  return (
    <Suspense fallback={null}>
      <ConectarPermissoesConteudo />
    </Suspense>
  );
}

function ConectarPermissoesConteudo() {
  const router = useRouter();
  const bancoId = useSearchParams().get("banco");
  const [autorizando, setAutorizando] = useState(false);

  function autorizar() {
    if (autorizando) return;
    setAutorizando(true);
    setTimeout(() => {
      const destino = bancoId === BANCO_COM_FALHA_ID ? "/conectar/erro" : "/conectar/sucesso";
      router.push(bancoId ? `${destino}?banco=${bancoId}` : destino);
    }, 1100);
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-8 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-6">
            <BackButton href="/conectar" />
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Open Finance
              </span>
              <p className="text-h2 text-ink-primary">
                O que será compartilhado com o <span className="text-sage-400">sona</span>.
              </p>
              <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">
                Acesso somente leitura. Você pode revogar a qualquer momento.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {DADOS_COMPARTILHADOS.map((item) => (
              <div key={item.titulo} className="flex items-center gap-3 rounded-card border border-border bg-white px-5 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-check-sage.svg" alt="" aria-hidden="true" className="h-[22px] w-[22px] shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-medium leading-[1.4] text-ink-primary">{item.titulo}</span>
                  <span className="text-[12px] font-light leading-[1.5] text-ink-muted">{item.detalhe}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-6">
            <div className="rounded-card-lg bg-petroleo-50 px-4 py-4">
              <p className="text-center text-[10px] font-medium leading-[1.5] text-ink-primary">
                Regulado pelo Banco Central do Brasil · Resolução Conjunta nº 1/2020
              </p>
            </div>

            <p className="text-center text-[12px] font-light leading-[1.5] text-ink-muted">
              Sua senha bancária nunca é acessada ou armazenada pelo sona.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                label={autorizando ? "Autorizando..." : "Autorizar compartilhamento"}
                fullWidth
                disabled={autorizando}
                onClick={autorizar}
              />
              <Button variant="ghost" label="Cancelar" fullWidth disabled={autorizando} onClick={() => router.push("/conectar")} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
