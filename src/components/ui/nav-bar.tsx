"use client";

import { cx } from "@/lib/cx";
import { IconInicio, IconMetas, IconDiagnostico, IconHistorico, type NavIconProps } from "./icons/nav-icons";

/**
 * Nav bar — reproduzida do nó 692:121 do Figma (Style Guide → App → Nav bar).
 * 4 abas reais do nó: Início, Metas, Diagnóstico, Histórico (não há uma
 * quinta aba "Perfil" nesse componente — se o produto precisar dela, é uma
 * decisão de IA separada da fidelidade a este nó específico).
 *
 * Medidas do nó: largura 393 (viewport base), padding pt-16/pb-24/px-24
 * (o pb-24 é a folga de home indicator), radius 16 (`rounded-card`), fundo
 * `surface.app`, borda superior `border` (#E4E0D8). Cada aba: 54×38, ícone
 * 24×24, label 10px Medium — essa combinação de tamanho/peso não existe
 * como token da Etapa 1 (os tokens de 10px existentes têm tracking largo,
 * pensados pra uppercase), então uso utilitário direto aqui em vez de forçar
 * um token que não bate.
 */

export type NavTab = "inicio" | "metas" | "diagnostico" | "historico";

export interface NavBarProps {
  active: NavTab;
  onTabChange?: (tab: NavTab) => void;
  className?: string;
}

const TABS: { key: NavTab; label: string; Icon: (props: NavIconProps) => React.JSX.Element }[] = [
  { key: "inicio", label: "Início", Icon: IconInicio },
  { key: "metas", label: "Metas", Icon: IconMetas },
  { key: "diagnostico", label: "Diagnóstico", Icon: IconDiagnostico },
  { key: "historico", label: "Histórico", Icon: IconHistorico },
];

export function NavBar({ active, onTabChange, className }: NavBarProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className={cx(
        "flex w-full max-w-mobile items-center justify-between rounded-card border-t border-border bg-surface-app px-6 pb-6 pt-4",
        className,
      )}
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange?.(key)}
            className={cx(
              "flex h-[38px] w-[54px] flex-col items-center gap-1",
              isActive ? "text-ink-primary" : "text-ink-muted",
            )}
          >
            <Icon active={isActive} className="h-6 w-6" />
            <span className="text-[10px] font-medium leading-[1.5]">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
