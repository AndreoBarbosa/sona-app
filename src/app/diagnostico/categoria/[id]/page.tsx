import { BackButton } from "@/components/ui/back-button";
import { StatusBar } from "@/components/ui/status-bar";
import {
  IconCategoriaAlimentacaoHero,
  IconCategoriaTransporteHero,
  IconCategoriaComprasHero,
  IconCategoriaJogosHero,
  IconCategoriaFallbackHero,
} from "@/components/ui/icons/categoria-hero-icons";
import { cx } from "@/lib/cx";
import {
  categorias,
  getCategoriaComLancamentos,
  getTotalCategoria,
  getPercentualCategoria,
  getGastoTotal,
  formatBRL,
  formatBRLCents,
  type CategoriaId,
} from "@/lib/mock-data";

/**
 * Diagnóstico / Categoria — nó 1064:2617 ("Diagnóstico / Categoria —
 * Alimentação"), rota dinâmica /diagnostico/categoria/[id]. Sem nav bar →
 * BackButton. Funciona pra qualquer categoria — nada hardcoded, tudo vem de
 * `getCategoriaComLancamentos(id)` + selectors.
 *
 * Divergências flagueadas:
 *   - O nó mostra descrições fabricadas por lançamento ("12 pedidos", "8
 *     visitas") que não existem no modelo de dados (`Lancamento.descricao` é
 *     um texto livre tipo "Delivery"/"Mercado", não uma contagem) — usa o
 *     campo real, não inventa metadado.
 *   - "Seu maior gasto." só faz sentido pra Alimentação porque ela É a
 *     categoria de maior gasto nos dados reais — calculado por ranking
 *     (`getTotalCategoria` desc), não fixo. Categorias fora do 1º lugar não
 *     ganham uma frase-qualificadora inventada, só o valor.
 *   - Badge do topo é o "badge hero" (petróleo #0C1A22 sólido, glifo
 *     off-white #FAFAF8) que o comentário de diagnostico/page.tsx já
 *     reservava pra uma tela de detalhe futura — uso ÚNICO e em destaque,
 *     nunca repetido em lista (listas continuam tonais, ver
 *     `categoria-hero-icons.tsx`).
 */

const CATEGORIA_ICON_HERO: Partial<Record<CategoriaId, (props: { className?: string }) => React.JSX.Element>> = {
  alimentacao: IconCategoriaAlimentacaoHero,
  transporte: IconCategoriaTransporteHero,
  compras: IconCategoriaComprasHero,
  jogos: IconCategoriaJogosHero,
};

export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoria = getCategoriaComLancamentos(id as CategoriaId);

  if (!categoria) {
    return (
      <div className="min-h-screen bg-surface-app">
        <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
          <StatusBar />
          <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
            <BackButton href="/diagnostico" />
            <p className="text-h3 text-ink-primary">Essa categoria não existe.</p>
          </main>
        </div>
      </div>
    );
  }

  const totalCategoria = getTotalCategoria(categoria);
  const percentual = Math.round(getPercentualCategoria(categoria));
  const gastoTotal = getGastoTotal();

  const rankeadas = [...categorias].sort((a, b) => getTotalCategoria(b) - getTotalCategoria(a));
  const ehMaiorGasto = rankeadas[0]?.id === categoria.id && totalCategoria > 0;

  const lancamentosOrdenados = [...categoria.lancamentos].sort((a, b) => b.valor - a.valor);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/diagnostico" />

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-petroleo-700">
                {(() => {
                  const IconeHero = CATEGORIA_ICON_HERO[categoria.id] ?? IconCategoriaFallbackHero;
                  return <IconeHero className="h-7 w-7" />;
                })()}
              </span>
              <span className="text-[14px] font-medium uppercase leading-[1.4] tracking-[0.02em] text-ink-primary">
                {categoria.nome}
              </span>
            </div>

            <p className="text-h2 text-ink-primary">
              {formatBRL(totalCategoria)} este mês.
              {ehMaiorGasto && <span className="text-coral-400"> Seu maior gasto.</span>}
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-card border border-border bg-white px-6 py-5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Participação nos gastos
              </span>
              <span className="text-h3 text-ink-primary">{percentual}% de tudo que saiu</span>
            </div>
            <span className="text-body-sm text-ink-muted">
              {formatBRL(totalCategoria)} de {formatBRL(gastoTotal)} que saíram este mês
            </span>
            <div className="h-[8px] w-full overflow-hidden rounded-pill bg-base-200">
              <div
                className="h-full rounded-pill bg-coral-400 transition-[width] duration-lento ease-padrao"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Lançamentos
            </span>

            {lancamentosOrdenados.length === 0 ? (
              <p className="text-body-sm text-ink-muted">Sem lançamentos em {categoria.nome} este mês.</p>
            ) : (
              <div className="flex flex-col rounded-card border border-border bg-white">
                {lancamentosOrdenados.map((l, i) => (
                  <div
                    key={l.id}
                    className={cx(
                      "flex items-center justify-between gap-4 px-4 py-[14px]",
                      i < lancamentosOrdenados.length - 1 && "border-b border-border",
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-medium leading-[1.4] text-ink-primary">
                        {l.estabelecimento}
                      </span>
                      <span className="text-[12px] font-normal leading-[1.4] text-ink-muted">{l.descricao}</span>
                    </div>
                    <span className="shrink-0 text-[14px] font-medium leading-[1.4] text-coral-500">
                      {formatBRLCents(l.valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
