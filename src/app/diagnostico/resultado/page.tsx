"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinanceHealthCard } from "@/components/finance-health-card";
import { useDemoStore } from "@/lib/demo-context";
import {
  categorias,
  diagnostico,
  formatBRL,
  getSobraTotal,
  getScoreSaudeFinanceira,
  getGastoTotal,
  getPercentualCategoria,
  type Categoria,
  type CategoriaId,
} from "@/lib/mock-data";

/**
 * Diagnóstico / Resultado do Diagnóstico — nó 611:1855, rota
 * /diagnostico/resultado. É o PRIMEIRO diagnóstico (chega só depois de
 * /conectar/sucesso → /diagnostico/analise) — mesma composição do
 * /diagnostico "de rotina", mas com uma frase-resposta NOVA antes de
 * qualquer número: a primeira vez que a pessoa vê sua própria realidade em
 * linguagem humana, não em dado cru. Termina com a oferta da primeira meta
 * — nunca antes do diagnóstico (regra da jornada).
 */

const CATEGORIA_ICON_SRC: Partial<Record<CategoriaId, string>> = {
  alimentacao: "/icons/cat-alimentacao.svg",
  transporte: "/icons/cat-transporte.svg",
  compras: "/icons/cat-compras.svg",
  jogos: "/icons/cat-jogos.svg",
};

export default function DiagnosticoResultadoPage() {
  const router = useRouter();
  const { perfil } = useDemoStore();
  const primeiroNome = perfil.nome.split(" ")[0];
  const score = getScoreSaudeFinanceira();
  const gastoTotal = getGastoTotal();
  const sobra = getSobraTotal();

  const categoriasRankeadas: { categoria: Categoria; percentual: number }[] = categorias
    .filter((c) => c.id !== "outros")
    .map((c) => ({ categoria: c, percentual: getPercentualCategoria(c) }))
    .sort((a, b) => b.percentual - a.percentual);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-5">
            <BackButton href="/conectar/sucesso" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Seu diagnóstico
              </span>
              <p className="text-h2 text-ink-primary">Olá, {primeiroNome}.</p>
            </div>
          </div>

          <p className="text-[20px] font-light leading-[1.35] text-ink-primary">
            Você tem <span className="text-sage-500">{formatBRL(sobra)}</span> de sobra todo mês — só não tinha um
            lugar pra ver isso.
          </p>

          <div className="flex flex-col gap-4">
            <FinanceHealthCard score={score} />

            <div className="flex gap-4">
              <Card padding="none" className="flex flex-1 flex-col items-center gap-3 px-4 py-3">
                <div className="flex items-center gap-1.5 self-stretch">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/receita.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-sage-600">
                    Receita mensal
                  </span>
                </div>
                <span className="text-h3 self-stretch text-ink-primary">{formatBRL(diagnostico.rendaMensal)}</span>
              </Card>

              <Card padding="none" className="flex flex-1 flex-col items-center gap-3 px-4 py-3">
                <div className="flex items-center gap-1.5 self-stretch">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/despesa.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-coral-400">
                    Gastos do mês
                  </span>
                </div>
                <span className="text-h3 self-stretch text-ink-primary">{formatBRL(gastoTotal)}</span>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Onde mais gasta
            </p>

            <div className="flex flex-col gap-2">
              {categoriasRankeadas.map(({ categoria, percentual }) => (
                <div key={categoria.id} className="flex items-center gap-2 rounded-[14px] border border-border bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={CATEGORIA_ICON_SRC[categoria.id]} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span className="text-body-sm text-ink-primary">{categoria.nome}</span>
                    <div className="h-[3px] w-full overflow-hidden rounded-[2px] bg-base-300">
                      <div
                        className="h-full rounded-[2px] bg-coral-400 transition-[width] duration-lento ease-padrao"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-light leading-[1.5] text-ink-muted">
                    {Math.round(percentual)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-4">
            <Button
              variant="tertiary"
              label="Definir sua primeira meta"
              fullWidth
              onClick={() => router.push("/metas/nova?primeiraMeta=1")}
            />
            <Link
              href="/diagnostico"
              className="flex h-14 w-full items-center justify-center rounded-button border border-base-400 text-body-sm text-ink-muted"
            >
              Ver diagnóstico completo
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
