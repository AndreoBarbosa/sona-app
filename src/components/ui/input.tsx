"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import { IconEye, IconEyeOff } from "./icons/eye-icons";

/**
 * Input — reproduzido do component set 428:1238 do Figma (Style Guide →
 * Componentes → "Login / Input- E-mail/ Senha"). 2 tipos: email (texto
 * simples) e password (com toggle de visibilidade via ícone de olho).
 *
 * Os 3 estados visuais do nó (Padrão/Preenchido/Erro) não viram uma prop
 * manual de estado: "preenchido" é derivado via `:not(:placeholder-shown)`
 * — a borda muda de `border` (base-300) pra petroleo-600 assim que o campo
 * tem valor, sem precisar de state controlado pra isso. `error` é a única
 * prop que representa validação vinda de fora.
 *
 * Cores de erro reaproveitam a rampa `coral` (coral.50 == error-50 do Figma,
 * coral.400 == error-400) — a mesma rampa já serve tanto de CTA terciário
 * quanto de semântica de erro, então nenhum token novo foi necessário.
 *
 * Tipografia: o nó usa "body/extra small - regular" (12px/150%/400) — não
 * bate com o token `input` da Etapa 1 (14px/100%), então uso o valor
 * literal aqui (mesma lógica do Button: preservar fidelidade ao nó de
 * origem em vez de forçar um token que não bate).
 */

export type InputFieldType = "email" | "password";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> {
  type?: InputFieldType;
  error?: boolean;
  containerClassName?: string;
}

const SHAPE =
  "w-full rounded-card border bg-white px-4 py-3 text-[12px] font-normal leading-[1.5] text-ink-primary outline-none transition-colors placeholder:text-ink-disabled";

const IDLE = "border-border focus:border-petroleo-600 [&:not(:placeholder-shown)]:border-petroleo-600";

const ERROR = "border-coral-400 bg-coral-50 focus:border-coral-400 [&:not(:placeholder-shown)]:border-coral-400";

export function Input({ type = "email", error = false, containerClassName, disabled, ...rest }: InputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cx("relative", containerClassName)}>
      <input
        type={isPassword && !visible ? "password" : "text"}
        disabled={disabled}
        placeholder={isPassword ? "••••••••" : "seu@email.com"}
        className={cx(SHAPE, error ? ERROR : IDLE, isPassword && "pr-11", disabled && "cursor-not-allowed opacity-60")}
        {...rest}
      />
      {isPassword && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted disabled:cursor-not-allowed"
        >
          {visible ? <IconEyeOff className="h-full w-full" /> : <IconEye className="h-full w-full" />}
        </button>
      )}
    </div>
  );
}
