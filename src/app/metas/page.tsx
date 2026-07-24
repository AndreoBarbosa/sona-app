"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";
import { Button } from "@/components/ui/button";
import { AppNavBar } from "@/components/app-nav-bar";
import { MetaCard } from "@/components/meta-card";
import { ExcluirMetaModal } from "@/components/excluir-meta-modal";
import { useMetas } from "@/lib/metas-context";
import { useToast } from "@/lib/toast-context";
import { useValorAnimado } from "@/lib/use-valor-animado";
import { cx } from "@/lib/cx";
import { getCorMetaPorIndice, CorMetaSemDestino } from "@/lib/cor-meta";
import { getMetasAtivas, getSobraTotal, getSobraSemDestino, formatBRL, type Meta } from "@/lib/mock-data";

/**
 * Metas — nó 704:2660 ("Metas / Visão geral — duas metas"), rota /metas.
 * Aba da nav bar → sem BackButton (regra do sistema de navegação).
 *
 * Headline dinâmica: conta METAS ATIVAS, não a fatia sem destino. Hoje 2
 * metas ativas → "Uma sobra, dois destinos." — muda sozinha se uma meta for
 * concluída/excluída/pausada ou uma nova for criada (via `useMetas()`).
 *
 * Barra "Seu plano" (nó 708:2748): uma faixa por meta ativa + uma faixa
 * neutra pro que ainda não tem destino (só quando `sobraSemDestino > 0`). Sem
 * `gap` entre as faixas de propósito — um gap em pixels quebra a soma das
 * larguras em % (o total passa de 100% do container), o que foi exatamente
 * o bug daqui antes.
 *
 * DOIS SISTEMAS DE % que não podem se confundir:
 *   - Este card: % = fatia da SOBRA MENSAL. O eyebrow já diz "SEU PLANO ·
 *     R$949/MÊS", então a legenda não repete "da sua sobra" em cada linha
 *     (três vezes pesava) — só "{meta} {pct}% · R$X".
 *   - MetaCard (linha da lista) e Card do plano de meta (detalhe): % =
 *     PROGRESSO ACUMULADO rumo ao alvo → texto "do caminho"
 * Tratamento visual também é distinto: aqui é uma barra ÚNICA empilhada
 * (N faixas coloridas dividindo o mesmo espaço); no MetaCard é uma barra de
 * progresso simples (1 faixa preenchendo proporcionalmente ao alvo).
 *
 * A faixa "sem destino" não é uma terceira meta — por isso a legenda diz
 * "Sem destino" (nunca "Livre") em cor subordinada (`ink-muted`), enquanto
 * as metas usam `base-800`. Larguras sempre somam 100%, sempre calculadas
 * dos selectors — nunca fixas.
 *
 * Meta com `aporteMensal` 0 (não deveria acontecer numa meta recém-criada —
 * ver regra em `criarMeta`/Divisão da Sobra — mas pode acontecer numa já
 * existente ajustada manualmente pro chão) NÃO entra na barra nem na
 * legenda: não é um destino de verdade da sobra. O headline dinâmico
 * (`destinoTexto`) conta a mesma coisa — só metas com aporte ativo.
 *
 * Cor de cada faixa/bolinha vem de `getCorMetaPorIndice(i)` (ver
 * `lib/cor-meta.ts`) — série determinística por ORDEM DA CASCATA
 * (`metasAtivas` já vem ordenada assim), não por categoria. É a MESMA cor
 * usada no `MetaCard` da lista logo abaixo — uma meta, uma cor, em todo o
 * app.
 */

const NUMERO_EXTENSO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];

export default function MetasPage() {
  const { metas, excluirMeta } = useMetas();
  const { showToast } = useToast();
  const router = useRouter();
  const [metaParaExcluir, setMetaParaExcluir] = useState<Meta | null>(null);

  const metasAtivas = getMetasAtivas(metas);
  const sobraTotal = getSobraTotal();
  const sobraSemDestino = getSobraSemDestino(metas);
  // Sistema de movimento: o valor exibido de "Sem destino" conta em 400ms —
  // é o mesmo momento (excluir/editar uma meta) que muda esse número na
  // Home e na Capacidade, as 3 telas precisam contar juntas.
  const sobraSemDestinoAnimada = useValorAnimado(sobraSemDestino);

  const metasComAporte = metasAtivas.filter((m) => m.aporteMensal > 0);
  const qtdDestinos = metasComAporte.length;
  const destinoTexto = `${NUMERO_EXTENSO[qtdDestinos] ?? qtdDestinos} destino${qtdDestinos === 1 ? "" : "s"}.`;

  const segmentosMetas = metasAtivas
    .map((m, i) => ({
      key: m.id,
      label: m.titulo,
      valor: m.aporteMensal,
      pct: sobraTotal > 0 ? (m.aporteMensal / sobraTotal) * 100 : 0,
      cor: getCorMetaPorIndice(i),
      textoLegenda: "text-base-800",
    }))
    .filter((s) => s.valor > 0);

  const segmentoSemDestino =
    sobraSemDestino > 0
      ? {
          key: "sem-destino",
          label: "Sem destino",
          valor: sobraSemDestinoAnimada,
          pct: (sobraSemDestino / sobraTotal) * 100,
          cor: CorMetaSemDestino,
          textoLegenda: "text-ink-muted",
        }
      : null;

  const segmentos = segmentoSemDestino ? [...segmentosMetas, segmentoSemDestino] : segmentosMetas;

  if (metasAtivas.length === 0) {
    return (
      <div className="min-h-screen bg-surface-app">
        <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
          <StatusBar />

          <main className="flex flex-1 flex-col gap-16 px-4 pb-28 pt-3">
            <EyebrowHeadline eyebrow="Suas metas" headline="Suas metas começam aqui." size="h1" highlight={{ word: "começam aqui.", tone: "sage" }} />

            {/* Empty - sem metas — nó 1070:2455. Headline do nó ("Uma meta
                no seu plano.") não bate com o estado que ilustra (zero
                metas) — usa a copy correta em vez da literal do nó, mesmo
                tratamento de "R$ 949 livres" → "sem destino" (vocabulário
                travado, DECISOES.md). */}
            <div className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-9">
              {/* Ilustração ~20% menor que o restante do bloco (era
                  max-w-[320px], igual ao container) — grande demais na
                  proporção original, competindo com a headline. */}
              <div className="aspect-[320/280] w-[80%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/decor/ilustracao-clareza.svg" alt="" aria-hidden="true" className="h-full w-full" />
              </div>
              <p className="text-center text-[16px] font-normal leading-[1.5] text-ink-muted">
                Você tem {formatBRL(sobraSemDestino)} sem destino por mês. Quando quiser, transforme isso numa meta.
              </p>
              <Button
                variant="tertiary"
                label="Criar primeira meta"
                fullWidth
                onClick={() => router.push("/metas/nova")}
              />
            </div>
          </main>
        </div>

        <AppNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-10 px-4 pb-28 pt-3">
          <EyebrowHeadline
            eyebrow="Suas metas"
            headline={`Uma sobra,\n${destinoTexto}`}
            size="h1"
            highlight={{ word: destinoTexto, tone: "sage" }}
          />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 rounded-card border border-border bg-white px-5 py-6">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                Seu plano · {formatBRL(sobraTotal)}/mês
              </span>

              <div className="flex h-[10px] w-full overflow-hidden rounded-[5px]">
                {segmentos.map((s) => (
                  <div
                    key={s.key}
                    className={cx(s.cor.fill, "transition-[width] duration-lento ease-padrao")}
                    style={{ width: `${s.pct}%` }}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {segmentos.map((s) => (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <span className={cx("h-2 w-2 shrink-0 rounded-pill", s.cor.fill)} />
                    <span className={cx("text-[12px] font-normal leading-[1.5]", s.textoLegenda)}>
                      {s.label} {Math.round(s.pct)}% · {formatBRL(s.valor)}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/metas/divisao"
                className="w-fit text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400"
              >
                Ajustar divisão →
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {metasAtivas.map((meta, i) => (
                <MetaCard
                  key={meta.id}
                  meta={meta}
                  cor={getCorMetaPorIndice(i)}
                  onEditar={(m) => router.push(`/metas/${m.id}/editar`)}
                  onExcluir={(m) => setMetaParaExcluir(m)}
                />
              ))}
            </div>

            <Link
              href="/metas/nova"
              className="flex items-center justify-center rounded-card border-[1.5px] border-dashed border-base-400 px-6 py-5"
            >
              <span className="text-button text-coral-400">+ Adicionar meta</span>
            </Link>
          </div>
        </main>
      </div>

      <AppNavBar />

      {metaParaExcluir && (
        <ExcluirMetaModal
          meta={metaParaExcluir}
          onCancelar={() => setMetaParaExcluir(null)}
          onConfirmar={() => {
            excluirMeta(metaParaExcluir.id);
            setMetaParaExcluir(null);
            showToast(
              `${metaParaExcluir.titulo} excluída. ${formatBRL(metaParaExcluir.aporteMensal)}/mês voltaram para a sua sobra.`,
            );
          }}
        />
      )}
    </div>
  );
}
