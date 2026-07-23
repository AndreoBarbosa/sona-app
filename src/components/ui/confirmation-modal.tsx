"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

/**
 * ConfirmationModal — component set "Metas / modal de confirmação"
 * (componentSetId 842:3527, 4 variantes: "Meta criada.", "Meta criada."
 * (ajuste manual), "Plano atualizado" — todas com o check verde de sucesso
 * — e "Excluir a Viagem?", com ilustração PRÓPRIA: círculo coral + X branco.
 * Nível 1 de feedback: encerra um fluxo, pede reconhecimento.
 *
 * `perigo` seleciona a ilustração (X coral vs check sage) E a borda
 * coral-50 1px da variante de exclusão — as duas coisas vêm do mesmo dado
 * de variante no Figma, não são independentes. Historicamente essa tela já
 * oscilou duas vezes (ilustração trocada por "check" achando que o X era
 * iconografia de alarme genérica, depois removida de vez) — ambas eram
 * engano: o X É a ilustração real da variante de exclusão no Figma, travado
 * em DECISOES.md agora pra não regredir de novo.
 *
 * O corpo dos nós reais usa pesos diferentes (Regular na exclusão, Light na
 * criação) — segue Light 12px uniforme pros dois casos, por especificação
 * escrita explícita do produto.
 *
 * Botão de confirmação usa o `Button` compartilhado (`variant="tertiary"`),
 * mas o nó pede largura FIXA 205px, não a largura total do card — como
 * `Button` não aceita `className` (de propósito, ver comentário lá), a
 * largura é imposta por um wrapper `w-[205px]` com `fullWidth` por dentro,
 * em vez de alterar o componente base.
 *
 * Movimento (sistema de tokens, tailwind.config.ts): scrim em fade
 * `duration-base`; card entra com fade + escala 0.96→1, `duration-base`.
 * Fechar (confirmar OU descartar) é `duration-rapido` — sair precisa
 * parecer imediato. Como o componente só existe enquanto o pai o renderiza
 * (`{aberto && <ConfirmationModal .../>}`), a saída anima ANTES de chamar
 * o callback real (`fecharComAnimacao`), senão o pai desmontaria o modal no
 * mesmo frame do clique e a transição nunca apareceria.
 */

const ILUSTRACAO_SUCESSO = "/decor/modal-sucesso-decor.svg";
const ILUSTRACAO_EXCLUSAO = "/decor/modal-exclusao-decor.svg";

export interface ConfirmationModalProps {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  dismissLabel: string;
  onDismiss: () => void;
  perigo?: boolean;
}

export function ConfirmationModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  dismissLabel,
  onDismiss,
  perigo = false,
}: ConfirmationModalProps) {
  const [visivel, setVisivel] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisivel(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function fecharComAnimacao(callback: () => void) {
    setSaindo(true);
    setTimeout(callback, 150);
  }

  const mostrar = visivel && !saindo;

  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center bg-petroleo-700/50 px-6 transition-opacity ease-padrao",
        saindo ? "duration-rapido" : "duration-base",
        mostrar ? "opacity-100" : "opacity-0",
      )}
      onClick={() => fecharComAnimacao(onDismiss)}
    >
      <div
        className={cx(
          "flex w-full max-w-[295px] flex-col items-center gap-9 rounded-card bg-base-50 p-6 transition-all ease-padrao",
          saindo ? "duration-rapido" : "duration-base",
          mostrar ? "scale-100 opacity-100" : "scale-[0.96] opacity-0",
          perigo && "border border-coral-50",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={perigo ? ILUSTRACAO_EXCLUSAO : ILUSTRACAO_SUCESSO}
            alt=""
            aria-hidden="true"
            className="h-[120px] w-[120px]"
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-h3 text-ink-primary">{title}</p>
            {/* div, não p: `description` pode trazer mais de um parágrafo (ex.
                a linha de contexto extra da Reserva no modal de exclusão) —
                um <p> dentro de <p> seria HTML inválido. */}
            <div className="flex flex-col gap-2 text-[12px] font-light leading-[1.5] text-base-800">{description}</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-[205px]">
            <Button variant="tertiary" label={confirmLabel} fullWidth onClick={() => fecharComAnimacao(onConfirm)} />
          </div>
          <button
            type="button"
            onClick={() => fecharComAnimacao(onDismiss)}
            className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-ink-muted"
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
