import { cx } from "@/lib/cx";

/**
 * Home indicator — reproduzido do component set 122:49 do Figma ("Home
 * Indicator" → "Device=iPhone, Orientation=Portrait", usado como instância
 * em toda tela do frame, ex. nó 1079:2452, 393×34). O nó exporta como
 * IMAGE-SVG achatado (sem children legíveis via API), mas a caixa 393×34
 * bate com a medida padrão iOS: pill 134×5 ancorada nos 8px inferiores da
 * área de 34px. Cor `ink-primary` — mesma cor do texto/ícones da Status bar,
 * pra manter o par topo/base do frame consistente.
 */

export interface HomeIndicatorProps {
  className?: string;
}

export function HomeIndicator({ className }: HomeIndicatorProps) {
  return (
    <div className={cx("flex h-[34px] w-full items-end justify-center pb-2", className)}>
      <div className="h-[5px] w-[134px] rounded-pill bg-ink-primary" />
    </div>
  );
}
