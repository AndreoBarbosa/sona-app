/**
 * Ícones do chrome de status bar iOS — reproduzidos do nó 122:16 do Figma
 * (Status bar - iPhone → grupo "Levels": Cellular Connection, Wifi, Battery).
 * Cor via `currentColor` (preto no nó original, #000000).
 */

export interface StatusIconProps {
  className?: string;
}

export function IconCellular({ className }: StatusIconProps) {
  return (
    <svg viewBox="0 0 19 12" fill="none" className={className} aria-hidden="true">
      <rect x="0" y="7" width="3.2" height="5" rx="0.8" fill="currentColor" />
      <rect x="5.3" y="4.7" width="3.2" height="7.3" rx="0.8" fill="currentColor" />
      <rect x="10.6" y="2.3" width="3.2" height="9.7" rx="0.8" fill="currentColor" />
      <rect x="15.9" y="0" width="3.2" height="12" rx="0.8" fill="currentColor" />
    </svg>
  );
}

export function IconWifi({ className }: StatusIconProps) {
  // Arcos calculados à mão (raio 12 num chord de 17) estouravam o topo do
  // viewBox — sagitta negativa, cortada pelo overflow:hidden padrão de SVG.
  // Troquei pro path do tabler-icon-wifi (24×24), testado e sem esse bug.
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 18l.01 0" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
      <path
        d="M9.172 15.172a4 4 0 0 1 5.656 0M6.343 12.343a8 8 0 0 1 11.314 0M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function IconBatteryStatus({ className }: StatusIconProps) {
  return (
    <svg viewBox="0 0 27 13" fill="none" className={className} aria-hidden="true">
      <rect x="0.75" y="0.75" width="22.5" height="11.5" rx="3.25" stroke="currentColor" strokeOpacity={0.4} strokeWidth={1} />
      <rect x="2.3" y="2.3" width="19.4" height="8.4" rx="1.9" fill="currentColor" />
      <path d="M24.5 4.3v4.4c0.83-0.37 1.35-1.2 1.35-2.2s-0.52-1.83-1.35-2.2Z" fill="currentColor" fillOpacity={0.4} />
    </svg>
  );
}
