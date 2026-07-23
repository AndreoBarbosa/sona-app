"use client";

import { cx } from "@/lib/cx";
import { Toggle } from "./toggle";

/**
 * ListRow — reproduzido do padrão "linha" que se repete nas telas de
 * Perfil (nós 1079:2469, 1079:2479, 1079:2519 — Dados pessoais / Contato /
 * Notificações). Layout: `padding 14px 16px`, `justify-content:
 * space-between`, `align-items: center`, largura total.
 *
 * As 3 variações de fim de linha viram uma union discriminada em `end`
 * (o mesmo padrão de `variant` do Button) em vez de 3 props booleanas soltas
 * que poderiam ser combinadas de forma inválida:
 *   - `{ kind: "value" }`          → só o valor à direita
 *   - `{ kind: "value", chevron }` → valor + seta "→" (navegação)
 *   - `{ kind: "toggle" }`         → Toggle (reaproveita o componente já
 *                                    construído — nunca solto)
 *
 * Cor do label muda por variação, fiel aos nós de origem: nas linhas de
 * "value" o label vem em `ink-muted` (é a legenda de um dado), no toggle o
 * label vem em `ink-primary` (é o nome de uma ação/config) — não é uma
 * escolha estética, é o que os dois nós mostram.
 *
 * `onClick` torna a linha inteira um `<button>` (linha navegável/tocável);
 * sem `onClick` ela é só um `<div>` (linha de leitura/config).
 *
 * Tipografia 14px/140%/500 (label/valor) e 12px/140%/400 (description) não
 * batem com nenhum token de fontSize da Etapa 1 — segue o valor literal do
 * nó, mesma lógica do Button/Input.
 *
 * A divisória entre linhas (#E4E0D8) não é desenhada aqui: cada ListRow
 * ganha `border-b` via `:not(:last-child)`, então compor várias dentro de
 * `<Card padding="none">` já reproduz o Card com divisórias do Figma sem
 * precisar de um wrapper novo.
 */

export type ListRowEnd =
  | { kind: "value"; value: string; chevron?: boolean }
  | { kind: "toggle"; checked: boolean; onCheckedChange?: (checked: boolean) => void }
  | { kind: "chevron" };

export interface ListRowProps {
  label: string;
  description?: string;
  end: ListRowEnd;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const ROW =
  "flex w-full items-center justify-between gap-4 px-4 py-[14px] text-left [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border";

export function ListRow({ label, description, end, onClick, disabled, className }: ListRowProps) {
  const labelIsPrimary = end.kind === "toggle" || end.kind === "chevron";

  const content = (
    <>
      <div className="flex flex-col gap-[2px]">
        <span
          className={cx(
            "text-[14px] font-medium leading-[1.4]",
            labelIsPrimary ? "text-ink-primary" : "text-ink-muted",
          )}
        >
          {label}
        </span>
        {description && <span className="text-[12px] font-normal leading-[1.4] text-ink-muted">{description}</span>}
      </div>

      {end.kind === "value" && (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[14px] font-medium leading-[1.4] text-ink-primary">{end.value}</span>
          {end.chevron && <span className="text-[14px] leading-[1.4] text-ink-muted">→</span>}
        </div>
      )}

      {end.kind === "chevron" && <span className="shrink-0 text-[14px] leading-[1.4] text-ink-muted">→</span>}

      {end.kind === "toggle" && <Toggle checked={end.checked} onCheckedChange={end.onCheckedChange} disabled={disabled} />}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={cx(ROW, disabled && "cursor-not-allowed opacity-60", className)}>
        {content}
      </button>
    );
  }

  return <div className={cx(ROW, disabled && "opacity-60", className)}>{content}</div>;
}
