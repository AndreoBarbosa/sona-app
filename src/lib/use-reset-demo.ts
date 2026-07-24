"use client";

import { useCallback } from "react";
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
 *
 * `useCallback` aqui não é só estilo: a Splash (`?reset=1`) chama
 * `resetarTudo` dentro de um `useEffect` que a tem como dependência — sem
 * memoização, cada render devolvia uma função NOVA, o efeito reagia a ela
 * como uma dependência mudada, disparava de novo, resetava de novo, re-
 * renderizava de novo... "Maximum update depth exceeded" (loop infinito
 * real, encontrado testando o TESTE OBRIGATÓRIO deste lote). As próprias
 * peças (`resetarMetas`, `resetarDemo`, `sair`) já eram estáveis — só faltava
 * esta função também ser.
 */
export function useResetDemo() {
  const router = useRouter();
  const { resetarMetas } = useMetas();
  const { resetarDemo } = useDemoStore();
  const { sair } = useAuth();

  return useCallback(() => {
    resetarMetas();
    resetarDemo();
    resetarOnboarding();
    sair();
    router.replace("/");
  }, [router, resetarMetas, resetarDemo, sair]);
}
