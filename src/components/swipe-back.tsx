"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * SwipeBack — gesto global de voltar por borda (edge swipe), como no iOS.
 * Monta uma vez no layout raiz e escuta a página inteira.
 *
 * Só ativa quando o toque COMEÇA nos ~24px da borda esquerda da tela
 * (`EDGE_ZONE`) — de propósito, pra não brigar com o MetaCard, que também
 * usa arrasto horizontal (mas pra esquerda, revelando ações, começando de
 * qualquer ponto do card). Fora da faixa de borda, o gesto pertence ao card:
 * como o MetaCard só reage a arrasto pra ESQUERDA (`clamp` trava em 0), um
 * arrasto pra direita nele simplesmente não faz nada — não compete com o
 * back.
 */

const EDGE_ZONE = 24;
const THRESHOLD = 80;

export function SwipeBack() {
  const router = useRouter();
  const pathname = usePathname();
  const drag = useRef({ active: false, startX: 0, startY: 0, triggered: false });

  useEffect(() => {
    // Splash (/) e Onboarding não têm "voltar" que faça sentido; Home (/home)
    // idem — era a mesma exceção de antes, só mudou de rota.
    if (pathname === "/" || pathname === "/home" || pathname.startsWith("/onboarding")) return;

    function onPointerDown(e: PointerEvent) {
      if (e.clientX > EDGE_ZONE) return;
      drag.current = { active: true, startX: e.clientX, startY: e.clientY, triggered: false };
    }

    function onPointerMove(e: PointerEvent) {
      if (!drag.current.active || drag.current.triggered) return;
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      if (dx > THRESHOLD && dx > Math.abs(dy) * 1.5) {
        drag.current.triggered = true;
        drag.current.active = false;
        router.back();
      }
    }

    function onPointerEnd() {
      drag.current.active = false;
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerEnd);
    document.addEventListener("pointercancel", onPointerEnd);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerEnd);
      document.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [pathname, router]);

  return null;
}
