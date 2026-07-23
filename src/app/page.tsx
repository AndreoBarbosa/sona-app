"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { SonaLogoAnimado } from "@/components/sona-logo-animado";
import { onboardingJaConcluido } from "@/lib/onboarding";

const DURACAO_SPLASH_MS = 2100;

/**
 * Splash — nó 608:2015, rota / (raiz). Conceito "Acende": a logo do Sona é
 * um interruptor, a animação em si é a clareza acendendo (ver
 * `SonaLogoAnimado`). Não bloqueia — resolve o estado (onboarding visto ou
 * não) e navega sozinha, sem esperar clique.
 *
 * prefers-reduced-motion: a regra global em globals.css já zera toda
 * `animation-duration`, então a logo pula direto pro estado final sem
 * precisar de um branch visual separado aqui — só a ESPERA antes de navegar
 * também precisa encurtar (senão a tela ficaria "parada" 2.1s sem motivo
 * pra quem já está vendo o resultado final). Cálculo direto no corpo do
 * effect (nunca um setState síncrono só pra guardar isso em state).
 */
export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const reduzMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duracao = reduzMovimento ? 0 : DURACAO_SPLASH_MS;
    const destino = onboardingJaConcluido() ? "/home" : "/onboarding";
    const timer = setTimeout(() => router.replace(destino), duracao);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen flex-col bg-surface-app">
      <StatusBar />
      <div className="flex flex-1 items-center justify-center">
        <SonaLogoAnimado corFinal="petroleo" />
      </div>
    </div>
  );
}
