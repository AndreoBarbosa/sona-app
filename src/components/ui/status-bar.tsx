import { cx } from "@/lib/cx";
import { IconCellular, IconWifi, IconBatteryStatus } from "./icons/status-bar-icons";

/**
 * Status bar — reproduzido do nó 122:16 do Figma ("Status bar - iPhone"),
 * usado como instância no topo de todas as telas do frame (ex. Home 652:2069).
 * Medidas do nó: padding 21px topo / 24px laterais / 19px base, largura
 * contextual (preenche os 393px do frame). "Time" é a única prop real do
 * componente no Figma (componentProperty "Time", default "9:41").
 *
 * O grupo de ícones à direita (sinal/wifi/bateria) usa `gap-[7px]` — o nó
 * mostra `gap: 154px` entre "Time" e "Levels", mas isso é só o efeito de um
 * layout com os dois grupos em largura fixa 100px dentro de um container de
 * 393px; aqui uso `justify-between` (mesmo resultado visual, responsivo).
 *
 * Mock estático — não reflete hora/sinal real, é só o chrome do frame.
 */

export interface StatusBarProps {
  time?: string;
  /** Fundo escuro (ex. loading do diagnóstico, nó 778:4628) — texto/ícones viram claros. */
  escuro?: boolean;
  className?: string;
}

export function StatusBar({ time = "9:41", escuro = false, className }: StatusBarProps) {
  return (
    <div
      className={cx(
        "flex w-full items-center justify-between px-6 pb-[19px] pt-[21px]",
        escuro ? "text-[#E8EEF2]" : "text-ink-primary",
        className,
      )}
    >
      <span className="text-[17px] font-semibold leading-[22px]">{time}</span>
      <div className="flex items-center gap-[7px]">
        <IconCellular className="h-3 w-[19px]" />
        <IconWifi className="h-[15px] w-[15px]" />
        <IconBatteryStatus className="h-[13px] w-[27px]" />
      </div>
    </div>
  );
}
