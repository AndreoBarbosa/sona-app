import { cx } from "@/lib/cx";

/**
 * Logo / simbolo isolado — versão estática (sem animação) do interruptor
 * usado em `SonaLogoAnimado`, monocromática branca — reservada pro topo
 * escuro das telas de autenticação (nó "Logo / compacta", ex. 807:3912).
 * Nunca reusa a versão animada/colorida da Splash: contexto diferente
 * (cabeçalho de formulário, não a tela de abertura).
 */
export function LogoCompacta({ className }: { className?: string }) {
  return (
    <div
      className={cx("inline-flex h-10 w-16 shrink-0 items-center rounded-pill border-[3px] border-base-50 p-1", className)}
      aria-hidden="true"
    >
      <span className="aspect-square h-full rounded-pill bg-base-50" />
    </div>
  );
}
