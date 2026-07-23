export interface MetaDetailIconProps {
  className?: string;
}

/** Lápis do header — nó 1053:2349, opacidade 0.6 aplicada por quem usa. */
export function IconPencil({ className }: MetaDetailIconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.33 16.67h3.34l8.75-8.75a2.36 2.36 0 0 0-3.34-3.34l-8.75 8.75v3.34Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11.25 5.42 14.58 8.75" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Selo do card "Status de verificação" — nó 725:2629 ("Icon / check"). */
export function IconCheckBadge({ className }: MetaDetailIconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M6 10.2 8.7 13 14 7.5" stroke="#FAFAF8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
