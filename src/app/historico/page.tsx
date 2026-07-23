"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBar } from "@/components/ui/status-bar";
import { AppNavBar } from "@/components/app-nav-bar";
import { cx } from "@/lib/cx";
import {
  categorias,
  diagnostico,
  formatBRL,
  formatBRLCents,
  getTodosLancamentos,
  type CategoriaId,
  type LancamentoComCategoria,
} from "@/lib/mock-data";

/**
 * Histórico — nó 757:3240 ("Histórico / Julho 2027", texto interno já usa
 * "Julho de 2026" — o nome do nó ficou desatualizado, o conteúdo bate com
 * nosso mock) + empty state 1070:2472 ("Histórico / sem histórico"), rota
 * /historico, aba ativa na nav bar.
 *
 * Fonte: `getTodosLancamentos()` — achata as MESMAS categorias do
 * Diagnóstico num feed cronológico, filtrado pelo mês selecionado. Não
 * existe uma "entrada" datada no mock (só `diagnostico.rendaMensal`, um
 * escalar do mês) — o nó do Figma mostra um lançamento de exemplo
 * "+R$5.800,00" que não tem lastro em dado real, então não é reproduzido
 * aqui (seria inventar uma transação de receita que os dados não têm).
 *
 * Cores de categoria são uma paleta PRÓPRIA deste nó (5 cores fixas, não é
 * o par sage/coral usado no resto do app): Alimentação=coral-400,
 * Transporte=sage-400, Compras=petroleo-700, Jogos=base-500, Outros=base-200
 * — medido dos retângulos da barra segmentada e da legenda do nó original.
 *
 * Seletor de mês: navega de verdade entre meses (só julho/2026 tem dados no
 * mock — qualquer outro mês cai no empty state, real, não simulado). Mantive
 * o seletor visível mesmo no empty state — o nó original omite o seletor
 * nesse estado, mas sem ele o usuário ficaria preso sem como voltar pra um
 * mês com dados; comportamento que o Figma não cobre, então documento aqui.
 */

const MESES_EXTENSO = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CATEGORIA_COR: Record<CategoriaId, string> = {
  alimentacao: "bg-coral-400",
  transporte: "bg-sage-400",
  compras: "bg-petroleo-700",
  jogos: "bg-base-500",
  outros: "bg-base-200",
};

const CATEGORIA_ICON: Partial<Record<CategoriaId, string>> = {
  alimentacao: "/icons/cat-alimentacao.svg",
  transporte: "/icons/cat-transporte.svg",
  compras: "/icons/cat-compras.svg",
  jogos: "/icons/cat-jogos.svg",
};

/**
 * Sem asset próprio pra "Outros" (nem pros lançamentos "Diversos"/"Não
 * classificado" dentro dela) — antes isso renderizava um círculo vazio
 * (`bg-base-200` sem ícone), quase invisível sobre o card branco e lido como
 * bug. Um marcador neutro, no mesmo estilo (badge #EDEAE3 + glifo sólido
 * petroleo) dos ícones reais, garante que nenhum badge fica em branco.
 */
const CATEGORIA_ICON_FALLBACK = "/icons/cat-fallback.svg";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 6 10" className={cx("h-[10px] w-[6px]", direction === "right" && "rotate-180")} aria-hidden="true">
      <path d="M5 1 1 5 5 9" stroke="#8A8880" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function formatDataGrupo(dataIso: string): string {
  const data = new Date(`${dataIso}T00:00:00`);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }).toUpperCase();
}

function CategoriaIcone({ categoriaId }: { categoriaId: CategoriaId }) {
  const src = CATEGORIA_ICON[categoriaId] ?? CATEGORIA_ICON_FALLBACK;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />;
}

function LinhaLancamento({ lancamento, categoriaNome }: { lancamento: LancamentoComCategoria; categoriaNome: string }) {
  return (
    <Link
      href={`/diagnostico/categoria/${lancamento.categoriaId}`}
      className="flex items-center gap-3 rounded-[14px] border border-border bg-white px-4 py-3"
    >
      <CategoriaIcone categoriaId={lancamento.categoriaId} />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-ink-primary">
          {lancamento.estabelecimento}
        </span>
        <span className="text-[10px] font-light leading-none text-ink-muted">
          {categoriaNome} · {lancamento.descricao}
        </span>
      </div>
      <span className="shrink-0 text-[12px] font-normal leading-[1.5] text-coral-500">
        − {formatBRLCents(lancamento.valor)}
      </span>
    </Link>
  );
}

export default function HistoricoPage() {
  const [mesAtual, setMesAtual] = useState(() => new Date(2026, 6, 1));

  const lancamentos = getTodosLancamentos();
  const lancamentosDoMes = lancamentos.filter((l) => {
    const d = new Date(`${l.data}T00:00:00`);
    return d.getFullYear() === mesAtual.getFullYear() && d.getMonth() === mesAtual.getMonth();
  });
  const temHistorico = lancamentosDoMes.length > 0;

  const gastoDoMes = lancamentosDoMes.reduce((soma, l) => soma + l.valor, 0);

  const categoriaNomePorId = Object.fromEntries(categorias.map((c) => [c.id, c.nome])) as Record<CategoriaId, string>;

  const segmentos = categorias
    .map((c) => {
      const valor = lancamentosDoMes.filter((l) => l.categoriaId === c.id).reduce((soma, l) => soma + l.valor, 0);
      return { id: c.id, nome: c.nome, valor, pct: gastoDoMes > 0 ? (valor / gastoDoMes) * 100 : 0 };
    })
    .filter((s) => s.valor > 0);

  const grupos = new Map<string, LancamentoComCategoria[]>();
  for (const l of [...lancamentosDoMes].sort((a, b) => b.data.localeCompare(a.data))) {
    const grupo = grupos.get(l.data) ?? [];
    grupo.push(l);
    grupos.set(l.data, grupo);
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-9 px-4 pb-28 pt-3">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">HISTÓRICO</p>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}
                aria-label="Mês anterior"
                className="flex h-9 w-9 items-center justify-center"
              >
                <ChevronIcon direction="left" />
              </button>
              <span className="text-h4 text-ink-primary">
                {MESES_EXTENSO[mesAtual.getMonth()]} de {mesAtual.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}
                aria-label="Próximo mês"
                className="flex h-9 w-9 items-center justify-center"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>

            {temHistorico && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between px-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-coral-500">
                      Saiu no mês
                    </span>
                    <span className="text-h3 text-ink-primary">{formatBRL(gastoDoMes)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-sage-600">
                      Entrou
                    </span>
                    <span className="text-body text-sage-600">{formatBRL(diagnostico.rendaMensal)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex h-[10px] w-full overflow-hidden rounded-[5px] bg-[#EFECE3]">
                    {segmentos.map((s) => (
                      <div
                        key={s.id}
                        className={cx(CATEGORIA_COR[s.id], "transition-[width] duration-lento ease-padrao")}
                        style={{ width: `${s.pct}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {categorias.map((c) => (
                      <div key={c.id} className="flex items-center gap-1">
                        <span className={cx("h-2 w-2 shrink-0 rounded-pill", CATEGORIA_COR[c.id])} />
                        <span className="text-[10px] font-light leading-none text-ink-muted">{c.nome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {temHistorico ? (
            <div className="flex flex-col gap-4">
              {Array.from(grupos.entries()).map(([dataIso, itens]) => (
                <div key={dataIso} className="flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.06em] text-ink-muted">
                    {formatDataGrupo(dataIso)}
                  </span>
                  <div className="flex flex-col gap-2">
                    {itens.map((l) => (
                      <LinhaLancamento key={l.id} lancamento={l} categoriaNome={categoriaNomePorId[l.categoriaId]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty - sem histórico — nó 1070:2687. Ilustração real
            // (`ilustracao-conexao`, baixada do Figma) no lugar do decor
            // antigo. Link "Conectar outra conta" aponta pro Perfil — é lá
            // que "Contas conectadas" mora (não existe fluxo de conexão
            // bancária real neste mock, então não inventa uma rota nova).
            <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-20 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/decor/ilustracao-conexao.svg" alt="" aria-hidden="true" className="h-[152px] w-[174px]" />
              <div className="flex flex-col items-center gap-4">
                <p className="text-h3 text-ink-primary">Ainda não há histórico.</p>
                <p className="max-w-[240px] text-body-sm text-ink-muted">
                  Assim que o Sona ler seus últimos meses, suas entradas e saídas aparecem aqui.
                </p>
              </div>
              <Link href="/perfil" className="text-[14px] font-medium leading-[1.5] text-sage-500">
                Conectar outra conta →
              </Link>
            </div>
          )}
        </main>
      </div>

      <AppNavBar />
    </div>
  );
}
