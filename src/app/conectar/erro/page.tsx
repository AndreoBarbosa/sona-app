"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";

/**
 * Falha na Conexão — nó 693:2324, rota /conectar/erro. Caminho de falha REAL
 * do fluxo (o banco em `BANCO_COM_FALHA_ID`, ver src/lib/bancos.ts, falha
 * de forma determinística — nunca aleatório, pra ser testável). "Tentar
 * novamente" reencena a mesma tentativa (mesmo banco falha de novo, por
 * design); "Continuar sem conectar" segue pra Home em modo com dados de
 * exemplo, sem travar o usuário aqui.
 *
 * `ilustracao-falha.svg` teve o badge circular coral + "!" removido
 * (auditoria final) — era, na prática, o ícone genérico de erro de sistema
 * banido em DECISOES.md ("Regras visuais"), só que embutido dentro da
 * ilustração em vez de solto no layout. Os dois dispositivos com a conexão
 * tracejada rompida já comunicam "falha de conexão" sem precisar do símbolo
 * de alarme.
 */
export default function ConectarErroPage() {
  const router = useRouter();
  const [tentando, setTentando] = useState(false);
  const [tentativas, setTentativas] = useState(0);

  function tentarNovamente() {
    if (tentando) return;
    setTentando(true);
    setTimeout(() => {
      setTentando(false);
      setTentativas((n) => n + 1);
    }, 1100);
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-8 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-6">
            <BackButton href="/conectar" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Falha na conexão
              </span>
              <p className="text-h2 text-ink-primary">Não conseguimos conectar agora.</p>
            </div>
          </div>

          <div className="mx-auto aspect-[342/299] w-full max-w-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/decor/ilustracao-falha.svg" alt="" aria-hidden="true" className="h-full w-full" />
          </div>

          <div className="mt-auto flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">
                Pode ser uma instabilidade do seu banco ou do Open Finance. Não é algo que você fez.
              </p>
              <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">
                Nenhum dado seu foi acessado ou armazenado.
              </p>
            </div>

            <div className="rounded-card-lg bg-base-200 px-[10px] py-3">
              <p className="text-center text-[10px] font-medium leading-[1.5] text-ink-secondary">
                No modo limitado você explora o Sona com dados de exemplo e conecta seu banco quando quiser.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                label={tentando ? "Tentando..." : "Tentar novamente"}
                fullWidth
                disabled={tentando}
                onClick={tentarNovamente}
              />
              <Button
                variant="ghost"
                label="Continuar sem conectar"
                fullWidth
                disabled={tentando}
                onClick={() => router.push("/home")}
              />
            </div>
            {!tentando && tentativas > 0 && (
              <p className="text-center text-[12px] font-light leading-[1.5] text-ink-muted">
                Tentamos de novo, mas o problema persiste. Pode tentar outro banco por enquanto.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
