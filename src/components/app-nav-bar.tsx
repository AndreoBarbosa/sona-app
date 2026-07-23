"use client";

import { usePathname, useRouter } from "next/navigation";
import { NavBar, type NavTab } from "@/components/ui/nav-bar";

/**
 * AppNavBar — wrapper de roteamento em cima do NavBar da Etapa 3. O NavBar
 * em si fica agnóstico de framework (recebe `active` + `onTabChange`); é
 * aqui que isso vira navegação real do App Router. Fica fixo no rodapé,
 * "flutuando" sobre o conteúdo que rola por baixo (ver Home).
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-mobile justify-center">
      <NavBar active={tabFromPathname(pathname)} onTabChange={(tab) => router.push(ROUTE_BY_TAB[tab])} />
    </div>
  );
}
