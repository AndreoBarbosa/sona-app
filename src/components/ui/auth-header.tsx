import type { ReactNode } from "react";
import { LogoCompacta } from "./logo-compacta";

/**
 * Cabeçalho escuro comum às 3 telas de autenticação (Cadastro 807:3908,
 * Login 415:924, Verificação de e-mail 416:1044) — logo compacta + wordmark
 * claro + headline Outfit ExtraLight 32px com o destaque em sage.
 */
export function AuthHeader({ headline, compacto = false }: { headline: ReactNode; compacto?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 pb-6 pt-8">
      <div className="flex items-center gap-2.5">
        <LogoCompacta />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decor/sona-wordmark-claro.svg" alt="sona" className="h-5 w-[76px]" />
      </div>
      {!compacto && (
        <p className="text-[32px] font-extralight leading-[1.1] tracking-[-0.025em] text-base-50">{headline}</p>
      )}
    </div>
  );
}
