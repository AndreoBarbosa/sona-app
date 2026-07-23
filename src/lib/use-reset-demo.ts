"use client";

import { useRouter } from "next/navigation";
import { useMetas } from "@/lib/metas-context";
import { useDemoStore } from "@/lib/demo-context";
import { useAuth } from "@/lib/auth-context";
import { resetarOnboarding } from "@/lib/onboarding";

/**
 * Composição do reset completo do modo demo — cada Provider só sabe
 * resetar a própria fatia (`resetarMetas`, `resetarDemo`), então esse hook
 * é o único lugar que os junta. Usado em "Recomeçar demo" (Perfil) e no
 * botão de reset canônico do painel de QA (`/qa`) — os dois precisam do
 * MESMO reset completo, só o destino da navegação depois muda.
 */
export function useResetDemo() {
  const router = useRouter();
  const { resetarMetas } = useMetas();
  const { resetarDemo } = useDemoStore();
  const { sair } = useAuth();

  return function resetarTudo() {
    resetarMetas();
    resetarDemo();
    resetarOnboarding();
    sair();
    router.replace("/");
  };
}
