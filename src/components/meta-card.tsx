"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { formatBRL, formatMesAno, getPercentualMeta, getDataPrevista, META_ICONES, type Meta } from "@/lib/mock-data";
import type { CorMeta } from "@/lib/cor-meta";

/**
 * MetaCard — nó 701:2365 ("Meta", reserva) / 717:2828 ("Meta 2", prazo), com
 * o comportamento de swipe documentado no nó 1064:2516 ("Metas / Card —
 * swipe (Editar · Excluir)"). O swipe é COMPORTAMENTO do card, não uma tela
 * separada — um único componente cobre a lista inteira de /metas.
 *
 * Cor por ORDEM DA CASCATA, não por categoria (ver `lib/cor-meta.ts`) —
 * `cor` vem de quem renderiza a lista (`getCorMeta`), nunca calculada aqui:
 * dirige a barra de progresso e o %, nunca o ícone — o ícone é ESCOLHA do
 * usuário (`meta.icone`, ver "Trocar" em Editar meta), as duas coisas não
 * precisam bater. Badge Editar do swipe continua sage fixo (ação, não meta).
 *
 * Bug real encontrado no PRÓPRIO mockup do Figma (nó 1064:2519): a instância
 * de demonstração mostra "R$ 949 de R$ 30.000" pra reserva — 949 é a sobra
 * mensal (getSobraTotal), não o valor acumulado. Esse componente usa
 * `meta.valorAtual`/`meta.valorAlvo` direto, então esse erro não se repete
 * aqui.
 *
 * Ações de swipe: SEMPRE Editar + Excluir, painel de 2 ações (140px), pra
 * TODA meta sem exceção — inclusive a Reserva de emergência (ver
 * DECISOES.md, "Consistência estrutural das metas": a alocação da sobra é
 * virtual, excluir uma meta não destrói patrimônio, só a tira do plano; a
 * Reserva já foi protegida contra exclusão duas vezes nesta sessão e a
 * regra foi revogada de vez — não reintroduzir uma condicional aqui).
 * "Pausar" NÃO é ação de swipe (foi tentado e revertido): ação diferente por
 * card torna o gesto imprevisível, pausar tem consequência financeira que
 * pede contexto (é por isso que só existe atrás do botão "Pausar meta" na
 * tela de detalhe, nunca num swipe rápido).
 *
 * Acessibilidade: as ações do swipe ficam fora da ordem de tab quando o
 * painel está fechado (`tabIndex={-1}`) — não são a única forma de agir
 * sobre a meta. O caminho sem gesto é tocar o card (fecha o swipe se estiver
 * aberto, ou navega pra /metas/[id]), de onde Editar/Excluir também vão
 * estar disponíveis como botões normais.
 */

export interface MetaCardProps {
  meta: Meta;
  cor: CorMeta;
  onEditar?: (meta: Meta) => void;
  onExcluir?: (meta: Meta) => void;
  className?: string;
}

const ACTION_WIDTH = 70;

function formatPrevisao(meta: Meta): string | null {
  const data = getDataPrevista(meta);
  if (!data) return null;
  return `Chegada em ${formatMesAno(data)}`;
}

export function MetaCard({ meta, cor, onEditar, onExcluir, className }: MetaCardProps) {
  const actionsWidth = ACTION_WIDTH * 2;

  const percentual = Math.min(getPercentualMeta(meta), 100);
  // Mesmo micro-label pra toda meta — "Sua proteção vem primeiro" só fazia
  // sentido enquanto a Reserva tinha um tratamento de prioridade que não
  // existe mais (ver DECISOES.md). Chegada calculada, igual pra todas.
  const microLabel = formatPrevisao(meta);

  const tone = { track: cor.track, fill: cor.fill, pct: cor.text };

  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startTranslate: 0, moved: false, active: false });

  const isOpen = translateX < -1;
  const clamp = (v: number) => Math.min(0, Math.max(-actionsWidth, v));

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { startX: e.clientX, startTranslate: translateX, moved: false, active: true };
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Alguns navegadores lançam se o pointer já não está mais ativo
      // (gesto cancelado rápido demais) — captura é best-effort.
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    setTranslateX(clamp(drag.current.startTranslate + dx));
  }

  function endDrag() {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    setTranslateX((current) => (current < -actionsWidth / 2 ? -actionsWidth : 0));
  }

  // Toque fora fecha o swipe.
  useEffect(() => {
    if (!isOpen) return;
    function onDocPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTranslateX(0);
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [isOpen]);

  function handleCardClick(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      return;
    }
    if (isOpen) {
      e.preventDefault();
      setTranslateX(0);
    }
  }

  return (
    <div ref={containerRef} className={cx("relative overflow-hidden rounded-card border border-border", className)}>
      <div className="absolute inset-y-0 right-0 flex" style={{ width: actionsWidth }}>
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onClick={() => {
            setTranslateX(0);
            onEditar?.(meta);
          }}
          className="flex w-[70px] flex-col items-center justify-center gap-1.5 bg-sage-100 text-sage-700"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-editar.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          <span className="text-[12px] font-medium leading-none">Editar</span>
        </button>

        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          onClick={() => {
            setTranslateX(0);
            onExcluir?.(meta);
          }}
          className="flex w-[70px] flex-col items-center justify-center gap-1.5 bg-coral-400 text-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-excluir.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          <span className="text-[12px] font-medium leading-none">Excluir</span>
        </button>
      </div>

      <Link
        href={`/metas/${meta.id}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={handleCardClick}
        aria-label={`${meta.titulo}, ${Math.round(percentual)}% concluído. Deslize pra editar ou excluir.`}
        className={cx(
          // Sem rounded-card nem border aqui de propósito: os dois vivem só
          // no wrapper externo. Um radius próprio faria a borda direita ficar
          // arredondada mesmo deslizada pro meio da linha (ver comentário lá
          // em cima); uma borda própria criaria um contorno duplo — o do
          // wrapper e o do card, levemente desalinhados ao arrastar.
          "relative z-10 flex touch-pan-y items-center justify-between gap-4 bg-white px-6 py-5 select-none",
          // Acompanha o dedo em tempo real (sem transição enquanto `dragging`);
          // ao soltar, "encaixa" com leve overshoot — token `duration-base` +
          // `ease-encaixe`, os únicos dois lugares do sistema que usam esse
          // easing (é pra onde algo literalmente assenta, não pra tudo).
          !dragging && "transition-transform duration-base ease-encaixe",
        )}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <div className="flex gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={META_ICONES[meta.icone].src} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-button text-ink-primary">{meta.titulo}</span>
              <span className="text-[12px] font-light leading-[1.5] text-ink-muted">
                {formatBRL(meta.valorAtual)} de {formatBRL(meta.valorAlvo)}
              </span>
            </div>
            <div className={cx("h-[2px] w-[126px] overflow-hidden rounded-pill", tone.track)}>
              <div
                className={cx("h-full rounded-pill transition-[width] duration-lento ease-padrao", tone.fill)}
                style={{ width: `${percentual}%` }}
              />
            </div>
            {microLabel && <span className="text-[10px] font-light leading-none text-ink-muted">{microLabel}</span>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className={cx("text-body-sm", tone.pct)}>{Math.round(percentual)}%</span>
          <span className="text-[9px] font-light leading-none text-ink-muted">do caminho</span>
        </div>
      </Link>
    </div>
  );
}
