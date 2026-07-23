"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavBar, type NavTab } from "@/components/ui/nav-bar";
import { useMetas } from "@/lib/metas-context";
import { useDemoStore } from "@/lib/demo-context";
import { getMetasAtivas } from "@/lib/mock-data";

/**
 * AppNavBar — wrapper de roteamento em cima do NavBar da Etapa 3. O NavBar
 * em si fica agnóstico de framework (recebe `active` + `onTabChange`); é
 * aqui que isso vira navegação real do App Router. Fica fixo no rodapé,
 * "flutuando" sobre o conteúdo que rola por baixo (ver Home).
 *
 * Também é o ponto de contagem da reconciliação automática (modo demo):
 * está montado exatamente nas 4 telas principais (Início/Metas/Diagnóstico/
 * Histórico), então cada troca de rota entre elas já É "navegar por algumas
 * telas" — sem precisar de um watcher/effect solto em outro lugar.
 */

const ROUTE_BY_TAB: Record<NavTab, string> = {
  inicio: "/home",
  metas: "/metas",
  diagnostico: "/diagnostico",
  historico: "/historico",
};

function tabFromPathname(pathname: string): NavTab {
  if (pathname.startsWith("/metas")) return "metas";
  if (pathname.startsWith("/diagnostico")) return "diagnostico";
  if (pathname.startsWith("/historico")) return "historico";
  return "inicio";
}

export function AppNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { metas, simularDivergencia } = useMetas();
  const { registrarNavegacao } = useDemoStore();

  useEffect(() => {
    registrarNavegacao(getMetasAtivas(metas), simularDivergencia);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só a troca de pathname deve contar como "nova tela navegada", não toda vez que `metas` muda por outro motivo
  }, [pathname]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-mobile justify-center">
      <NavBar active={tabFromPathname(pathname)} onTabChange={(tab) => router.push(ROUTE_BY_TAB[tab])} />
    </div>
  );
}
