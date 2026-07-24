"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { SonaLogoAnimado } from "@/components/sona-logo-animado";
import { onboardingJaConcluido } from "@/lib/onboarding";
import { useResetDemo } from "@/lib/use-reset-demo";

const DURACAO_SPLASH_MS = 2100;

/**
 * Splash — nó 608:2015, rota / (raiz). Conceito "Acende": a logo do Sona é
 * um interruptor, a animação em si é a clareza acendendo (ver
 * `SonaLogoAnimado`). Não bloqueia — resolve o estado (onboarding visto ou
 * não) e navega sozinha, sem esperar clique.
 *
 * `?reset=1` — link de demonstração pra recomeçar do zero sem precisar
 * achar "Recomeçar demo" dentro do Perfil: limpa tudo (`useResetDemo`,
 * mesma composição usada lá e em /qa) e deixa o efeito rodar de novo — a
 * URL vira "/" limpa (o próprio reset já troca via `router.replace`), então
 * na 2ª passada `querReset` é falso e a splash segue o caminho normal
 * (onboarding nunca concluído → /onboarding), depois do mesmo delay de
 * sempre. "Reinicia do splash" é literal: ainda mostra a splash, não pula
 * direto pro destino.
 *
 * prefers-reduced-motion: a regra global em globals.css já zera toda
 * `animation-duration`, então a logo pula direto pro estado final sem
 * precisar de um branch visual separado aqui — só a ESPERA antes de navegar
 * também precisa encurtar (senão a tela ficaria "parada" 2.1s sem motivo
 * pra quem já está vendo o resultado final). Cálculo direto no corpo do
 * effect (nunca um setState síncrono só pra guardar isso em state).
 */
export default function SplashPage() {
  return (
    <Suspense fallback={null}>
      <SplashConteudo />
    </Suspense>
  );
}

function SplashConteudo() {
  const router = useRouter();
  const querReset = useSearchParams().get("reset") === "1";
  const resetarTudo = useResetDemo();

  useEffect(() => {
    if (querReset) {
      resetarTudo();
      return;
    }

    const reduzMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duracao = reduzMovimento ? 0 : DURACAO_SPLASH_MS;
    const destino = onboardingJaConcluido() ? "/home" : "/onboarding";
    const timer = setTimeout(() => router.replace(destino), duracao);
    return () => clearTimeout(timer);
  }, [router, querReset, resetarTudo]);

  return (
    <div className="flex h-screen flex-col bg-surface-app">
      <StatusBar />
      <div className="flex flex-1 items-center justify-center">
        <SonaLogoAnimado corFinal="petroleo" />
      </div>
    </div>
  );
}
