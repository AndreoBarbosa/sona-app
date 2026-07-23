/**
 * Ícones da Home — sem iconografia financeira clichê (sem cifrão/moeda/
 * cofrinho/gráfico-com-seta como identidade), conforme README. Cor via
 * `currentColor`, mesmo padrão de nav-icons.tsx / eye-icons.tsx.
 */

export interface HomeIconProps {
  className?: string;
}

/**
 * Selo do badge "Saúde financeira" — path real baixado do nó 498:1394
 * (tabler-icon-heartbeat), com `stroke="black"` trocado por `currentColor`
 * pra herdar a cor de quem usa (branco sobre o círculo sage-500).
 */
export function IconPulse({ className }: HomeIconProps) {
  return (
    <svg viewBox="0 0 24 23" fill="none" className={className} aria-hidden="true">
      <path
        d="M19.5045 11.5791L12.0084 19.0032L9.11393 16.1367M3.00016 8.03697C2.9918 6.98288 3.31698 5.95315 3.92919 5.09503C4.54139 4.2369 5.40927 3.59435 6.4087 3.25924C7.40814 2.92414 8.48795 2.91365 9.4937 3.22928C10.4995 3.54491 11.3797 4.17049 12.0084 5.01656C12.4217 4.46687 12.9441 4.00841 13.5427 3.66988C14.1413 3.33134 14.8034 3.12001 15.4875 3.04912C16.1716 2.97823 16.8629 3.0493 17.5183 3.25788C18.1736 3.46646 18.7789 3.80807 19.2961 4.26132C19.8134 4.71457 20.2315 5.26971 20.5243 5.89199C20.8172 6.51427 20.9784 7.1903 20.998 7.87776C21.0175 8.56522 20.895 9.24932 20.638 9.88724C20.381 10.5252 19.9951 11.1032 19.5045 11.5851M3.01318 11.0075H5.01212L7.01107 14.0059L9.01002 8.00908L10.0095 11.0075H13.0079"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Selo abstrato do card de meta — brotinho, sem apelo financeiro. */
export function IconSprout({ className }: HomeIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 21V11" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path
        d="M12 12c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6Z"
        fill="currentColor"
      />
      <path
        d="M12 14c0-2.5-2-4.5-4.5-4.5C7.5 12 9.5 14 12 14Z"
        fill="currentColor"
        fillOpacity={0.55}
      />
    </svg>
  );
}
