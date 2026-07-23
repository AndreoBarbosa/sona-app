"use client";

import type { CSSProperties } from "react";

/**
 * Logo animada da splash ("Acende") — nós 608:2015 (splash) / 793:3438
 * (logo real). Conceito: a logo do Sona é um interruptor; "ligar" acontece
 * por COR e LUZ, nunca por movimento — o pino fica sempre na posição
 * canônica (à esquerda); NÃO desliza pra direita ao "ligar" (seria
 * semanticamente invertido). Sequência (~2.1s), cada trecho com sua própria
 * `@keyframes` em globals.css:
 *   0.0–0.8s  contorno do pill se desenha (stroke-dashoffset), coral, opacidade baixa
 *   0.8–1.1s  pino aparece com leve overshoot de escala, ainda coral
 *   1.1–1.3s  anel de luz expande do centro do pino (r 14→56, opacidade .9→0), traço sage
 *   1.1–1.4s  contorno + pino transicionam de coral pra `corFinal`
 *   1.4–1.8s  wordmark sobe 6px e aparece
 *   1.8–2.1s  tagline aparece
 *
 * `corFinal` parametriza a cor de chegada (petróleo é a versão real; sage é
 * a variação pedida só pra comparação, nunca usada na splash de produção).
 * `animado=false` pula direto pro estado final (usado só em contexto
 * estático, ex. preview lado a lado) — a splash de verdade não usa essa
 * prop: prefers-reduced-motion já é tratado globalmente (globals.css zera
 * toda `animation-duration`, então cada trecho pula pro seu 100% sozinho).
 */

const PILL_W = 200;
const PILL_H = 100;
const BORDER = 9;
const PIN_R = 36;
const PIN_CX = PILL_H / 2 + 4;
const PIN_CY = PILL_H / 2;

const COR_FINAL_HEX = {
  petroleo: "#0C1A22",
  sage: "#4A7258",
} as const;

export interface SonaLogoAnimadoProps {
  corFinal?: keyof typeof COR_FINAL_HEX;
  className?: string;
}

export function SonaLogoAnimado({ corFinal = "petroleo", className }: SonaLogoAnimadoProps) {
  const corFinalHex = COR_FINAL_HEX[corFinal];
  const wrapperStyle = { "--splash-cor-final": corFinalHex } as CSSProperties;

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex items-center gap-3">
        <svg viewBox={`0 0 ${PILL_W} ${PILL_H}`} className="h-14 w-28 shrink-0" aria-hidden="true">
          <rect
            x={BORDER / 2}
            y={BORDER / 2}
            width={PILL_W - BORDER}
            height={PILL_H - BORDER}
            rx={(PILL_H - BORDER) / 2}
            fill="none"
            stroke="#C96040"
            strokeWidth={BORDER}
            pathLength={1}
            style={{
              strokeDasharray: 1,
              animation: "splash-pill-draw 800ms ease-out both, splash-pill-color 300ms ease-out 1100ms both",
            }}
          />
          <circle
            cx={PIN_CX}
            cy={PIN_CY}
            r={PIN_R}
            fill="#C96040"
            style={{
              transformOrigin: `${PIN_CX}px ${PIN_CY}px`,
              animation:
                "splash-pin-appear 300ms cubic-bezier(0.34,1.56,0.64,1) 800ms both, splash-pin-color 300ms ease-out 1100ms both",
            }}
          />
          <circle
            cx={PIN_CX}
            cy={PIN_CY}
            r={14}
            fill="none"
            stroke="#7EA88A"
            strokeWidth={2}
            style={{ opacity: 0, animation: "splash-ring-expand 200ms ease-out 1100ms forwards" }}
          />
        </svg>
        {/* h-7 + aspect-ratio (não `w-auto`): o asset tem width/height "100%"
            no próprio SVG (viewBox só define proporção pra quem já sabe o
            tamanho do container) — `w-auto` deixa o navegador sem base pra
            calcular a largura intrínseca e ele cai num fallback errado,
            cortando o "a" de "sona". */}
        <div className="h-7 shrink-0" style={{ aspectRatio: "103.755 / 26.532" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/decor/sona-wordmark.svg"
            alt="sona"
            className="h-full w-full"
            style={{ animation: "splash-wordmark-in 400ms ease-out 1400ms both" }}
          />
        </div>
      </div>
      <p
        className="mt-1 text-[20px] font-light leading-none text-[#6A8E7A]"
        style={{ animation: "splash-tagline-in 300ms ease-out 1800ms both" }}
      >
        clareza financeira
      </p>
    </div>
  );
}
