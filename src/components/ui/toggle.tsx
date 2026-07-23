"use client";

import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

/**
 * Toggle — sem nó específico no Figma; segue a especificação de tokens:
 * pill 44×26, ligado = sage-500 com knob à direita, desligado = base-400
 * (#D4D0C8) com knob à esquerda. Knob 22px com 2px de respiro em cada lado
 * (proporção padrão de switch), branco.
 *
 * `role="switch"` + `aria-checked` seguem o padrão ARIA de toggle. Teclado
 * (Enter/Espaço) já funciona de graça por ser um <button> nativo.
 */

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

// Sistema de movimento: "rapido" (150ms) — mesmo token de toda micro-interação.
const TRACK = "relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-pill transition-colors duration-rapido ease-padrao";
const KNOB = "absolute left-[2px] h-[22px] w-[22px] rounded-pill bg-white transition-transform duration-rapido ease-padrao";

export function Toggle({
  checked,
  onCheckedChange,
  disabled,
  className,
  onClick,
  ...rest
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        onCheckedChange?.(!checked);
      }}
      className={cx(
        TRACK,
        checked ? "bg-sage-500" : "bg-base-400",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
      {...rest}
    >
      <span className={cx(KNOB, checked && "translate-x-[18px]")} />
    </button>
  );
}
