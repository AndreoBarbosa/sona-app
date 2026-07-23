import Link from "next/link";
import { Card } from "@/components/ui/card";
import { IconPulse } from "@/components/ui/icons/home-icons";

/**
 * FinanceHealthCard — o card de Saúde Financeira (nó 509:1439, variante
 * "Saudável"), reproduzido uma vez e reutilizado na Home e no Diagnóstico
 * ("o mesmo componente da Home"). Clicável: aponta pra /diagnostico/score
 * (placeholder até essa tela existir), fechando o loop score → detalhe.
 */

export interface FinanceHealthCardProps {
  score: number;
}

export function FinanceHealthCard({ score }: FinanceHealthCardProps) {
  const scoreArredondado = Math.round(score);

  return (
    <Link href="/diagnostico/score">
      <Card tone="sage" padding="md" className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/decor/saude-financeira-decor.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-[128px] w-[95px]"
        />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-pill bg-sage-500 text-white">
              <IconPulse className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-sage-600">
              Saúde financeira
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex items-end gap-1">
              <span className="text-[46px] font-extralight leading-[1.1] tracking-[-0.025em] text-ink-primary">
                {scoreArredondado}
              </span>
              <span className="pb-1 text-body-sm text-ink-muted">/100</span>
            </div>

            <div className="flex w-[185px] flex-col gap-2">
              <div className="h-[6px] w-full overflow-hidden rounded-pill bg-white">
                <div
                  className="h-full rounded-pill bg-sage-500 transition-[width] duration-lento ease-padrao"
                  style={{ width: `${scoreArredondado}%` }}
                />
              </div>
              <p className="text-[12px] font-light leading-[1.5] text-sage-800">
                Suas finanças têm base, mas há espaço real para melhorar.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
