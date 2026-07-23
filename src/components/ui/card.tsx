import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";

/**
 * Card — base reutilizável. Nenhum nó específico foi indicado originalmente
 * pra ela, então segue os tokens da Etapa 1 (`surface.card` branco, `border`
 * #E4E0D8, `rounded-card` 16).
 *
 * `padding` reflete os paddings observados em cards reais do Style Guide:
 * "md" (24/20, ex. Diagnóstico / Card Finance Health, Metas / Card metas —
 * ambos "20px 24px") e "sm" (16 uniforme, ex. Home / Card Patrimônio).
 * Paddings assimétricos (ex. "12px 20px" do Card Capacidade Mensal) não
 * viram preset — usam `padding="none"` + `className` no local de uso, é o
 * padrão já demonstrado no preview do Card.
 *
 * `tone` e `radius` foram adicionados na Etapa 4 (tela Home), que precisa de
 * fundo sage/escuro/coral em cards diferentes (Saúde financeira, Patrimônio,
 * Próxima Ação). Importante: isso é uma prop tipada, não `className` solto —
 * sobrescrever `bg-surface-card`/`rounded-card` via className concatenado
 * não é confiável (a ordem das regras no CSS gerado pelo Tailwind não seque
 * a ordem das classes no JSX), então qualquer fundo/radius alternativo precisa
 * nascer aqui dentro, nunca em `className` no call site.
 */

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardTone = "default" | "sage" | "dark" | "coral" | "info";
export type CardRadius = "card" | "card-lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  tone?: CardTone;
  radius?: CardRadius;
}

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4", // 16px uniforme
  md: "px-6 py-5", // 24/20 — padrão observado no Style Guide
  lg: "p-6", // 24px uniforme
};

const TONE: Record<CardTone, string> = {
  default: "border border-border bg-surface-card",
  sage: "border-0 bg-sage-50",
  dark: "border-0 bg-petroleo-700",
  coral: "border-0 bg-coral-50",
  info: "border-0 bg-petroleo-50",
};

const RADIUS: Record<CardRadius, string> = {
  card: "rounded-card",
  "card-lg": "rounded-card-lg",
};

export function Card({ padding = "md", tone = "default", radius = "card", className, children, ...rest }: CardProps) {
  return (
    <div className={cx(RADIUS[radius], TONE[tone], PADDING[padding], className)} {...rest}>
      {children}
    </div>
  );
}
