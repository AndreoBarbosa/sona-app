"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { useDemoStore } from "@/lib/demo-context";
import { cx } from "@/lib/cx";
import { BANCO_COM_FALHA_ID } from "@/lib/bancos";

/**
 * Loading ÚNICO — nó 778:4628 adaptado, rota /conectar/carregando. Cobre
 * conexão + leitura + processamento num só carregamento (~5s) em vez dos
 * dois separados que existiam antes (`/conectar/conectando` mecânico +
 * `/diagnostico/analise` sobre os dados): dois carregamentos em sequência,
 * mesmo curtos, competem por atenção e fazem a espera parecer duplicada.
 * As labels avançam JUNTO da porcentagem, não soltas.
 *
 * Ao terminar: SUCESSO marca os bancos escolhidos como conectados
 * (`demoStore.conectarBancos`) e segue pra /conectar/sucesso; FALHA (algum
 * banco escolhido é `BANCO_COM_FALHA_ID`, determinístico) segue pra
 * /conectar/erro SEM marcar nada como conectado.
 *
 * Sem BackButton por design (mesma exceção documentada na Splash/Onboarding/
 * antigo `/diagnostico/analise`): é uma sequência automática sem controle do
 * usuário, progresso não pausa nem volta no meio.
 */

const PASSOS = ["Conectando com seu banco", "Lendo suas contas", "Organizando seus gastos", "Montando seu diagnóstico"];

const DURACAO_MS = 5000;
const INTERVALO_MS = 100;
const INCREMENTO = (100 * INTERVALO_MS) / DURACAO_MS;

export default function ConectarCarregandoPage() {
  return (
    <Suspense fallback={null}>
      <ConectarCarregandoConteudo />
    </Suspense>
  );
}

function ConectarCarregandoConteudo() {
  const router = useRouter();
  const { conectarBancos } = useDemoStore();
  const bancosParam = useSearchParams().get("bancos");
  const bancos = bancosParam ? bancosParam.split(",") : [];
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPct((atual) => Math.min(100, atual + INCREMENTO));
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (pct < 100) return;
    const falhou = bancos.includes(BANCO_COM_FALHA_ID);
    const timeout = setTimeout(() => {
      if (falhou) {
        router.replace(bancosParam ? `/conectar/erro?bancos=${bancosParam}` : "/conectar/erro");
      } else {
        conectarBancos(bancos);
        router.replace(bancosParam ? `/conectar/sucesso?bancos=${bancosParam}` : "/conectar/sucesso");
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `bancos` é derivado de `bancosParam` a cada render; disparar só quando `pct` cruza 100 evita reagendar o timeout a cada tick
  }, [pct, bancosParam, router, conectarBancos]);

  const percentualExibido = Math.round(pct);
  const passoAtual = Math.min(PASSOS.length - 1, Math.floor(pct / (100 / PASSOS.length)));

  return (
    <div className="min-h-screen bg-petroleo-700">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar escuro />

        <main className="flex flex-1 flex-col items-center justify-between px-4 pb-6 pt-10">
          <div className="flex w-full flex-col items-center gap-10">
            <span className="flex h-7 items-center justify-center rounded-pill border border-sage-400 px-4 text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-sage-600">
              Conectando
            </span>

            <div className="flex w-full flex-col items-center gap-[60px]">
              <div className="flex w-full flex-col items-center gap-8 px-10">
                <p className="text-[64px] font-extralight leading-[1.1] tracking-[-0.03em] text-[#E8EEF2]">
                  {percentualExibido}%
                </p>
                <div className="h-1 w-full overflow-hidden rounded-pill bg-white/10">
                  <div
                    className="h-full rounded-pill bg-sage-600 transition-[width] duration-150 ease-linear"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col items-center gap-8 px-6">
                {PASSOS.map((passo, idx) => {
                  const concluido = idx < passoAtual || pct >= 100;
                  const ativo = idx === passoAtual && pct < 100;
                  return (
                    <div key={passo} className="flex w-full items-center gap-2">
                      <span
                        className={cx(
                          "h-2.5 w-2.5 shrink-0 rounded-pill",
                          concluido || ativo ? "bg-sage-400" : "bg-white/20",
                          ativo && "animate-pulse",
                        )}
                      />
                      <span
                        className={cx(
                          "text-[12px] font-normal leading-[1.5]",
                          concluido || ativo ? "text-[#E8EEF2]" : "text-[rgba(232,238,242,0.2)]",
                        )}
                      >
                        {passo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-center text-[12px] font-light leading-[1.5] tracking-[0.01em] text-white/35">
            Isso leva alguns segundos.
            <br />
            Pode deixar o app aberto.
          </p>
        </main>
      </div>
    </div>
  );
}
