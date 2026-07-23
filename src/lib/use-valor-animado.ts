"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anima a transição de um número em `duracaoMs` (default 400ms, o token
 * "lento" do sistema de movimento) — é o que faz o usuário PERCEBER a
 * consequência de uma ação (sobra recalculando, previsão de chegada, %
 * mudando), central na tese do produto, não decoração.
 *
 * Respeita `prefers-reduced-motion`: pula direto pro valor final, sem
 * contagem. Easing aproxima o "padrão" do sistema (saída rápida, chegada
 * suave) via `1 - (1-t)^3`, já que CSS não anima `textContent`.
 */
export function useValorAnimado(valorAlvo: number, duracaoMs = 400): number {
  const [valorExibido, setValorExibido] = useState(valorAlvo);
  const valorAnterior = useRef(valorAlvo);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (valorAnterior.current === valorAlvo) return;

    const reduzMovimento =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduzMovimento) {
      // Assíncrono via rAF, nunca síncrono no corpo do effect — mesmo padrão
      // usado em toast-context.tsx.
      frameRef.current = requestAnimationFrame(() => setValorExibido(valorAlvo));
      valorAnterior.current = valorAlvo;
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }

    const inicio = valorAnterior.current;
    const diferenca = valorAlvo - inicio;
    const tempoInicio = performance.now();

    function passo(agora: number) {
      const progresso = Math.min(1, (agora - tempoInicio) / duracaoMs);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setValorExibido(Math.round(inicio + diferenca * suavizado));
      if (progresso < 1) {
        frameRef.current = requestAnimationFrame(passo);
      } else {
        valorAnterior.current = valorAlvo;
      }
    }

    frameRef.current = requestAnimationFrame(passo);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [valorAlvo, duracaoMs]);

  return valorExibido;
}
