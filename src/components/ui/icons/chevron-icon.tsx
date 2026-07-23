export interface ChevronIconProps {
  className?: string;
}

/**
 * Chevron — mesmo asset do `BackButton` (nó 1097:3656): aponta pra BAIXO por
 * padrão, sem cor própria (`currentColor`, quem usa define via `text-*`).
 * Rotação é responsabilidade de quem usa (`BackButton` gira 90° pra virar
 * seta-esquerda; o disclosure indicator de card gira -90° pra virar
 * seta-direita) — nunca duplicar este path em outro componente.
 */
export function ChevronIcon({ className }: ChevronIconProps) {
  return (
    <svg viewBox="0 0 6 3" className={className} aria-hidden="true">
      <path d="M1 0.5 3 2.5 5 0.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
