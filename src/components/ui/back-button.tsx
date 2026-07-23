import Link from "next/link";
import { cx } from "@/lib/cx";
import { ChevronIcon } from "@/components/ui/icons/chevron-icon";

/**
 * BackButton — componente real "Voltar" do Figma (component set 1097:3656,
 * variante "Propriedade 1=Default" / 704:2642): círculo 24×24, bg base-50,
 * borda base-300, com um chevron 6×3 (stroke base-500) dentro. O asset
 * original aponta pra BAIXO — giramos 90° pra virar chevron-esquerda (seta
 * de voltar). Só a seta, sem texto — não existe "← Voltar" no Sona.
 *
 * Regra de uso no sistema de navegação:
 *   - Telas COM nav bar (Home, Metas, Diagnóstico, Histórico, Perfil) → sem BackButton
 *   - Telas de detalhe SEM nav bar (Capacidade, Patrimônio, Categoria,
 *     Dados pessoais, Notificações...) → com BackButton
 *   - Detalhe da meta → exceção: sai por ação (excluir/confirmar) ou pelo
 *     gesto de swipe-back, nunca por botão
 */

const SHAPE = "flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border border-border bg-base-50";

const CHEVRON = <ChevronIcon className="h-[10px] w-[10px] rotate-90 text-[#B8B4AC]" />;

/**
 * `onClick` é pra telas que precisam INTERCEPTAR o voltar (ex.: Editar meta,
 * que avisa antes de descartar alterações não salvas) — nesses casos o
 * componente vira um `<button>` e quem chama decide se/quando navega. Sem
 * `onClick`, continua sendo o `Link` de sempre.
 */
export type BackButtonProps =
  | { href: string; onClick?: undefined; className?: string }
  | { href?: undefined; onClick: () => void; className?: string };

export function BackButton({ href, onClick, className }: BackButtonProps) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label="Voltar" className={cx(SHAPE, className)}>
        {CHEVRON}
      </button>
    );
  }

  return (
    <Link href={href} aria-label="Voltar" className={cx(SHAPE, className)}>
      {CHEVRON}
    </Link>
  );
}
