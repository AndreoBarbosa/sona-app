"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Sistema / Feedback — Nível 2 (leve, dentro da tela, some sozinho). Mesmo
 * padrão Provider/hook de `metas-context.tsx`: estado vive aqui, qualquer
 * tela chama `useToast().showToast(mensagem)`.
 *
 * Uma barra por vez: uma nova chamada cancela os timers da anterior e a
 * substitui na hora (não empilha). O ciclo de vida tem 2 fases pra não
 * desmontar abruptamente: 4s visível (fica), depois `leaving=true` por
 * `duration-rapido` (150ms, o tempo real da transição de saída definido no
 * sistema de movimento) antes de zerar o estado de verdade — sem isso o
 * fade/slide de saída nunca apareceria, o toast só sumiria. Entrada: sobe
 * 12px com fade em `duration-base` (240ms).
 *
 * Usado em: pausar/retomar meta, salvar edição de meta. NÃO em toggles (o
 * próprio toggle já é o retorno visual) nem em nada que já abra um modal de
 * conclusão (Nível 1) — as duas camadas não se sobrepõem pra mesma ação.
 */

interface ToastState {
  id: number;
  mensagem: string;
  leaving: boolean;
}

interface ToastContextValue {
  showToast: (mensagem: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURACAO_VISIVEL_MS = 4000;
const DURACAO_SAIDA_MS = 150; // token "rapido"

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((mensagem: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (clearTimer.current) clearTimeout(clearTimer.current);

    const id = Date.now();
    setToast({ id, mensagem, leaving: false });

    hideTimer.current = setTimeout(() => {
      setToast((atual) => (atual?.id === id ? { ...atual, leaving: true } : atual));
      clearTimer.current = setTimeout(() => {
        setToast((atual) => (atual?.id === id ? null : atual));
      }, DURACAO_SAIDA_MS);
    }, DURACAO_VISIVEL_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport toast={toast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toast }: { toast: ToastState | null }) {
  // `idVisivel` só é setado de forma assíncrona (via rAF) — nunca síncrona no
  // corpo do effect. Enquanto ele não bate com `toast.id`, a barra renderiza
  // no estado "escondido", o que já produz a transição de entrada sozinho
  // (sem precisar de um `setEntrada(false)` síncrono antes do rAF).
  const [idVisivel, setIdVisivel] = useState<number | null>(null);

  useEffect(() => {
    if (!toast) return;
    const raf = requestAnimationFrame(() => setIdVisivel(toast.id));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depende só do id, não do objeto inteiro (que muda de novo em `leaving`)
  }, [toast?.id]);

  if (!toast) return null;

  const visivel = idVisivel === toast.id && !toast.leaving;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] mx-auto flex w-full max-w-mobile justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={cx(
          "w-full rounded-[12px] bg-petroleo-700 p-4 transition-all ease-padrao",
          toast.leaving ? "duration-rapido" : "duration-base",
          visivel ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <p className="text-[14px] font-normal leading-[1.5] text-base-50">{toast.mensagem}</p>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() precisa estar dentro de <ToastProvider>");
  return ctx;
}
