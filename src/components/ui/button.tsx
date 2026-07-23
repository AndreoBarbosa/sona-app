"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Button — reproduzido do nó 122:115 do Figma (Style Guide → Componentes → Button).
 *
 * 4 variantes = os 3 níveis de CTA da Etapa 1 + Ghost:
 *   primary   → petróleo → commitment de dado sensível
 *   secondary → sage     → progresso em fluxo já iniciado
 *   tertiary  → coral    → conversão leve
 *   ghost     → sem preenchimento → ação de baixa ênfase (cancelar, "ver mais")
 *
 * `estado` é opcional e serve pra FORÇAR um estado visual (usado no preview
 * de design em src/app/preview/button). Sem ele, o botão já reage sozinho:
 * hover/active via CSS (`active:`), disabled via atributo nativo do <button>.
 *
 * Nota técnica: as classes `active:*` abaixo são escritas por extenso (nunca
 * montadas via template string) de propósito — o scanner do Tailwind lê o
 * texto-fonte de forma estática, então uma classe montada em runtime
 * (`` `active:${cor}` ``) nunca seria gerada no CSS final.
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
export type ButtonState = "padrao" | "pressed" | "disabled";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  variant?: ButtonVariant;
  label: ReactNode;
  estado?: ButtonState;
  fullWidth?: boolean;
}

// Sistema de movimento: press recua pra 0.98 (nunca bounce/rotação), token
// "rapido" (150ms) — a MESMA duração de toda micro-interação do sistema.
const SHAPE =
  "inline-flex h-14 w-fit items-center justify-center rounded-button px-4 transition-all duration-rapido ease-padrao active:scale-[0.98]";

/**
 * Cores reproduzidas 1:1 do Figma. Quando o valor bate exatamente com um
 * step da rampa da Etapa 1 (tailwind.config.ts), uso o token — ex.
 * `bg-petroleo-700`. Quando o Figma usa um tom sob medida que não existe em
 * nenhuma rampa (a maioria dos estados "pressed"/"disabled"), mantenho o hex
 * literal: não é um token de marca, é um ajuste pontual só deste componente.
 *
 * Nos estados "disabled" a opacidade vem pré-calculada dentro do próprio hex
 * (8 dígitos, ex. `bg-[#0C1A2252]` = petroleo-700 a 32%), em vez do
 * modificador `bg-petroleo-700/32`. O modificador `/NN` se mostrou não-
 * confiável neste pipeline Tailwind v3 + Turbopack — em alguns casos o
 * Tailwind não gerava a regra no CSS final (confirmado inspecionando o CSS
 * compilado), então precalcular o alpha no próprio hex evita depender desse
 * mecanismo.
 *
 * `idle` já inclui o par `active:*` correspondente ao estado "Pressed" do
 * Figma, pra interação real por toque/clique funcionar sem precisar do prop
 * `estado`. `pressed`/`disabled` full são usados só quando `estado` força
 * a exibição (preview/QA).
 */
const VARIANT: Record<ButtonVariant, { idle: string; pressed: string; disabled: string }> = {
  primary: {
    idle: "bg-petroleo-700 text-base-50 active:bg-[#133244] active:text-base-200 text-button",
    pressed: "bg-[#133244] text-base-200 text-button",
    disabled: "bg-[#0C1A2252] text-[#F0EDE652] text-button",
  },
  secondary: {
    idle: "bg-sage-500 text-base-50 active:bg-[#639270] active:text-sage-900 text-button",
    pressed: "bg-[#639270] text-sage-900 text-button",
    disabled: "bg-[#628E7052] text-[#35473A52] text-button",
  },
  tertiary: {
    idle: "bg-coral-400 text-base-200 active:bg-[#a74b2f] active:text-coral-700 text-button",
    pressed: "bg-[#a74b2f] text-coral-700 text-button",
    disabled: "bg-[#C9604052] text-[#F0EDE652] text-button",
  },
  ghost: {
    // O "padrão" do Ghost usa Outfit Regular 14/150% (token body-sm) — é o
    // único variant/estado que não usa a tipografia `button`. Pressed e
    // disabled já voltam a usar Medium/tracking (token button), igual aos
    // outros três variants. Preservado assim de propósito (nó de origem).
    idle: "border border-base-400 bg-transparent text-ink-muted active:border-[#c4c1ba] active:bg-[#e5e4e1] active:text-[#6a6762] active:text-button text-body-sm",
    pressed: "border-[#c4c1ba] bg-[#e5e4e1] text-[#6a6762] text-button",
    disabled: "border-[#D5D2CD33] bg-base-400 text-base-500 text-button",
  },
};

export function Button({
  variant = "primary",
  label,
  estado,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const styles = VARIANT[variant];
  const isDisabled = estado === "disabled" || disabled === true;
  const isForcedPressed = estado === "pressed";

  const stateClasses = isDisabled ? styles.disabled : isForcedPressed ? styles.pressed : styles.idle;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cx(SHAPE, stateClasses, fullWidth && "w-full", isDisabled && "cursor-not-allowed")}
      {...rest}
    >
      {label}
    </button>
  );
}
