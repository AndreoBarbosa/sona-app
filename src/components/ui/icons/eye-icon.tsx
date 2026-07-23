export interface EyeIconProps {
  className?: string;
  aberto?: boolean;
}

/**
 * Alterna entre olho aberto (senha oculta, "mostrar") e olho riscado (senha
 * visível, "ocultar") — o par "Password view" dos inputs de senha do
 * Cadastro/Login (ex. 818:3776). `currentColor`, mesmo padrão dos outros
 * ícones de UI do sistema (nunca cor própria embutida).
 */
export function EyeIcon({ className, aberto = true }: EyeIconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="none" aria-hidden="true">
      <path
        d="M1.5 9C1.5 9 4.09 3.75 9 3.75C13.91 3.75 16.5 9 16.5 9C16.5 9 13.91 14.25 9 14.25C4.09 14.25 1.5 9 1.5 9Z"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth={1.3} />
      {!aberto && <path d="M2.5 2.5L15.5 15.5" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />}
    </svg>
  );
}
