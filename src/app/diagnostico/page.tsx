"use client";

import Link from "next/link";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { AppNavBar } from "@/components/app-nav-bar";
import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";
import { FinanceHealthCard } from "@/components/finance-health-card";
import { useDemoStore } from "@/lib/demo-context";
import {
  categorias,
  diagnostico,
  formatBRL,
  getScoreSaudeFinanceira,
  getProtecaoScore,
  getPatrimonioTotal,
  getGastoTotal,
  getPercentualCategoria,
  type Categoria,
  type CategoriaId,
} from "@/lib/mock-data";

/**
 * Diagnóstico — nó 734:2625 do Figma, rota /diagnostico.
 *
 * Composição só com componentes-base (Card, FinanceHealthCard — "o mesmo
 * componente da Home" — EyebrowHeadline, StatusBar, NavBar). Todo número
 * vem de selectors de mock-data.ts.
 *
 * Headline "Olá, Fernanda." não existe no nó 734:2625 em si (só o eyebrow
 * "Diagnóstico"), mas foi pedida explicitamente — usa o par EyebrowHeadline
 * já construído na Etapa 3.
 *
 * Ícones de categoria: assets reais baixados do nó "Icon / Categoria"
 * (743:3430 → instâncias 611:1988/1987/1986/1984). Já vêm com o fundo
 * tonal embutido (tint claro + glifo `#0C1A22`) — é o MESMO sistema de
 * badge do card Saúde Financeira (tint claro + ícone sólido), não um
 * segundo sistema. O petróleo sólido fica reservado pra um badge hero
 * único (ex. futura tela de Detalhe de Categoria), nunca repetido em lista.
 */

const CATEGORIA_ICON_SRC: Partial<Record<CategoriaId, string>> = {
  alimentacao: "/icons/cat-alimentacao.svg",
  transporte: "/icons/cat-transporte.svg",
  compras: "/icons/cat-compras.svg",
  jogos: "/icons/cat-jogos.svg",
};

export default function DiagnosticoPage() {
  const { perfil, bancosConectados } = useDemoStore();
  const primeiroNome = perfil.nome.split(" ")[0];
  const gastoTotal = getGastoTotal();
  const patrimonio = getPatrimonioTotal(bancosConectados);
  const score = getScoreSaudeFinanceira({ ...diagnostico.scores, protecao: getProtecaoScore(patrimonio, gastoTotal) });

  // "outros" não é específica o bastante pra rankear/ter uma tela de detalhe —
  // mesmo corte que o nó 734:2625 usa (só 4 categorias, somando ~90%).
  const categoriasRankeadas: { categoria: Categoria; percentual: number }[] = categorias
    .filter((c) => c.id !== "outros")
    .map((c) => ({ categoria: c, percentual: getPercentualCategoria(c) }))
    .sort((a, b) => b.percentual - a.percentual);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-28 pt-3">
          <EyebrowHeadline eyebrow="Diagnóstico" headline={`Olá, ${primeiroNome}.`} />

          <div className="flex flex-col gap-4">
            <FinanceHealthCard score={score} />

            <div className="flex gap-4">
              {/*
                Ícones reais do par "Semântico - Receita/Gastos" (nós
                611:1982/611:1981, `/icons/receita.svg` e `/icons/despesa.svg`):
                bandeja de entrada/saída (seta + tray), não seta de gráfico —
                não violam a proibição de iconografia financeira, que mira
                setas/linhas de tendência de mercado.
              */}
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
                <Link
                  key={categoria.id}
                  href={`/diagnostico/categoria/${categoria.id}`}
                  className="flex items-center gap-2 rounded-[14px] border border-border bg-white p-3"
                >
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
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>

      <AppNavBar />
    </div>
  );
}
