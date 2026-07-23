"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { getBancoPorId } from "@/lib/bancos";

/**
 * Conexão Sucessida — nó 778:4643, rota /conectar/sucesso. Badge com o nome
 * do banco escolhido (dinâmico, via `?banco=`) — nunca hardcoded "Nubank"
 * como no Figma de origem. Único caminho a partir daqui é "Ver meu
 * diagnóstico" → /diagnostico/analise (regra da jornada: Open Finance →
 * Diagnóstico, nunca pulado).
 *
 * Avança sozinho depois de ~1.5s — agora que existe um loading de verdade
 * antes desta tela (`/conectar/conectando`), dois carregamentos separados
 * por uma tela de sucesso "pesada" viram espera demais. O botão continua
 * funcionando pra quem quiser ir na hora.
 */
const AVANCO_AUTOMATICO_MS = 1500;

export default function ConectarSucessoPage() {
  return (
    <Suspense fallback={null}>
      <ConectarSucessoConteudo />
    </Suspense>
  );
}

function ConectarSucessoConteudo() {
  const router = useRouter();
  const bancoId = useSearchParams().get("banco");
  const banco = getBancoPorId(bancoId);

  useEffect(() => {
    const timeout = setTimeout(() => router.replace("/diagnostico/analise"), AVANCO_AUTOMATICO_MS);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col px-4 pb-10 pt-3">
          <BackButton href="/conectar" />

          <div className="mx-auto mt-4 aspect-[342/299] w-full max-w-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/decor/ilustracao-sucesso-conectar.svg" alt="" aria-hidden="true" className="h-full w-full" />
          </div>

          {banco && (
            <div className="mx-auto -mt-2 flex items-center gap-2 rounded-pill border border-border bg-white px-3 py-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banco.logo} alt="" aria-hidden="true" className="h-4 w-4 shrink-0 rounded-pill" />
              <span className="text-[10px] font-medium leading-[1.5] text-ink-secondary">{banco.nome} conectado</span>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Conexão concluída
              </span>
              <p className="text-h2 text-ink-primary">
                Seu banco está conectado com <span className="text-sage-400">sucesso</span>.
              </p>
            </div>
            <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">
              Seus dados já estão sendo processados pelo sona.
            </p>
          </div>

          <div className="mt-auto pt-8">
            <Button
              variant="tertiary"
              label="Ver meu diagnóstico"
              fullWidth
              onClick={() => router.push("/diagnostico/analise")}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
