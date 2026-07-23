"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { cx } from "@/lib/cx";

/**
 * Diagnóstico — Loading — nó 778:4628, rota /diagnostico/analise. Aqui o
 * movimento É o conteúdo, não decoração: a % e os 5 rótulos avançam juntos
 * numa sequência real de ~5s (não CSS solto), e a navegação pra
 * /diagnostico/resultado só acontece quando ela de fato termina.
 *
 * O Figma só exporta o frame em 0% (todo rótulo no estado "disabled") — o
 * tratamento de "em andamento"/"concluído" por rótulo (pulso sage vs. ponto
 * apagado) não vem do arquivo, é a variação real ao vivo pedida no briefing.
 *
 * Sem BackButton por design: é uma sequência automática, sem controle do
 * usuário — mesmo princípio da Splash/Onboarding (progresso não pausa nem
 * volta no meio).
 */

const PASSOS = [
  "Estabelecer conexão",
  "Ler transações bancárias",
  "Categorizar gastos",
  "Estabelecer padrão de gastos",
  "Gerar diagnóstico",
];

const DURACAO_MS = 5200;
const INTERVALO_MS = 100;
const INCREMENTO = (100 * INTERVALO_MS) / DURACAO_MS;

export default function DiagnosticoAnalisePage() {
  const router = useRouter();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPct((atual) => Math.min(100, atual + INCREMENTO));
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (pct < 100) return;
    const timeout = setTimeout(() => router.replace("/diagnostico/resultado"), 500);
    return () => clearTimeout(timeout);
  }, [pct, router]);

  const percentualExibido = Math.round(pct);
  const passoAtual = Math.min(PASSOS.length - 1, Math.floor(pct / (100 / PASSOS.length)));

  return (
    <div className="min-h-screen bg-petroleo-700">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar escuro />

        <main className="flex flex-1 flex-col items-center justify-between px-4 pb-6 pt-10">
          <div className="flex w-full flex-col items-center gap-10">
            <span className="flex h-7 items-center justify-center rounded-pill border border-sage-400 px-4 text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-sage-600">
              Analisando
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
