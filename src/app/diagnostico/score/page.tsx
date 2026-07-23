import Link from "next/link";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { IconPulse } from "@/components/ui/icons/home-icons";
import { diagnostico, getScoreSaudeFinanceira } from "@/lib/mock-data";

/**
 * Diagnóstico / Como calculamos seu score — nó 734:2763, rota
 * /diagnostico/score. Alcançada pelo card de Saúde Financeira (Home e
 * Diagnóstico), nunca uma aba — por isso BackButton, sem nav bar.
 *
 * Divergências flagueadas:
 *   - O nó em si TEM uma "Nav bar" (aba Diagnóstico ativa) na árvore — mas
 *     isso contradiz o padrão do resto do app (toda tela alcançada por
 *     drill-down, nunca por aba, usa BackButton e não tem nav bar; as 4
 *     abas reais são só Início/Metas/Diagnóstico/Histórico) e a instrução
 *     escrita desta tarefa, que pede BackButton explicitamente. Trato como
 *     resíduo de template no arquivo do Figma, não como intenção — segue
 *     BackButton.
 *   - Os 3 cards de peso do nó mostram valores de exemplo (70/82/?) que não
 *     batem com `diagnostico.scores` real (folga 75, estabilidade 70,
 *     proteção 80) — usa os valores reais.
 *   - O botão "Continuar" (desabilitado) no rodapé do nó parece resíduo de
 *     um fluxo de onboarding em etapas que não existe aqui — omitido; um
 *     botão permanentemente desabilitado sem destino não tem função nesta
 *     tela standalone.
 *   - As duas caixas de insight do nó não têm um link de ação nos filhos
 *     capturados (só título + mensagem) — reproduzidas sem link.
 *
 * Score é SEMPRE `getScoreSaudeFinanceira()` — média ponderada 40/30/30 dos
 * três fatores — nunca escrito à mão; muda sozinho se os dados mudarem.
 */

function PesoCard({
  titulo,
  subtitulo,
  peso,
  valor,
}: {
  titulo: string;
  subtitulo: string;
  peso: number;
  valor: number;
}) {
  return (
    <div className="flex items-center gap-5 rounded-card border border-border bg-white px-5 py-4">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-h5 text-ink-primary">{titulo}</span>
          <span className="text-[12px] font-light leading-[1.5] text-ink-muted">{subtitulo}</span>
        </div>
        <div className="h-[4px] w-full overflow-hidden rounded-pill bg-base-200">
          <div
          className="h-full rounded-pill bg-sage-500 transition-[width] duration-lento ease-padrao"
          style={{ width: `${valor}%` }}
        />
        </div>
      </div>
      <div className="flex w-14 flex-col items-center gap-2">
        <span className="rounded-pill bg-base-200 px-2.5 py-1 text-[10px] font-medium leading-[1.5] text-ink-secondary">
          Peso {peso}
        </span>
        <span className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-sage-600">{valor}</span>
      </div>
    </div>
  );
}

export default function ScorePage() {
  const { folga, estabilidade, protecao } = diagnostico.scores;
  const score = Math.round(getScoreSaudeFinanceira());

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/diagnostico" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Saúde financeira
              </span>
              <p className="text-[26px] font-light leading-[1.2] tracking-[-0.02em] text-ink-primary">
                Como calculamos seu score.
              </p>
            </div>
          </div>

          <Card tone="sage" padding="none" className="flex items-center gap-4 px-6 py-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-sage-500 text-white">
              <IconPulse className="h-4 w-4" />
            </span>
            <div className="flex items-end gap-1">
              <span className="text-h1 text-ink-primary">{score}</span>
              <span className="pb-1 text-body-sm text-ink-muted">/100</span>
            </div>
            <p className="flex-1 text-[12px] font-light leading-[1.5] text-sage-800">
              Três fatores, pesos claros, nada escondido.
            </p>
          </Card>

          <div className="flex flex-col gap-2">
            <PesoCard
              titulo="Capacidade de sobra"
              subtitulo="Quanto da sua renda sobra todo mês"
              peso={40}
              valor={folga}
            />
            <PesoCard
              titulo="Estabilidade dos gastos"
              subtitulo="O quanto seus gastos variam mês a mês"
              peso={30}
              valor={estabilidade}
            />
            <PesoCard
              titulo="Reserva de proteção"
              subtitulo="Quantos meses de gastos você tem coberto"
              peso={30}
              valor={protecao}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-card bg-base-200 px-[18px] py-4">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-secondary">
              Isso não é uma nota de comportamento
            </span>
            <p className="text-[12px] font-normal leading-[1.5] text-ink-primary">
              É uma leitura da sua situação. Quando sua realidade muda, o número muda junto. Sem julgamento.
            </p>
          </div>

          <Card tone="coral" padding="none" className="relative flex flex-col gap-1.5 py-4 pl-6 pr-4">
            <span aria-hidden="true" className="absolute left-2 top-4 h-[calc(100%-32px)] w-1 rounded-pill bg-coral-400" />
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-coral-600">
              O que mais move seu score hoje
            </span>
            <p className="text-body-sm text-ink-primary">
              Aumentar sua sobra mensal. Pequenas mudanças em gastos recorrentes têm o maior efeito.
            </p>
          </Card>

          <Link href="/diagnostico" className="w-fit text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400">
            Ver diagnóstico completo →
          </Link>
        </main>
      </div>
    </div>
  );
}
