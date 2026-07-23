"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/cx";

/**
 * Modal de login social SIMULADO — Google/Apple em `/login` e `/cadastro`.
 * Sem OAuth real (não tem sentido lidar com dado pessoal de verdade num case
 * com dados mockados): o clique só pede o nome e segue o mesmo fluxo de
 * login/cadastro comum a partir daí. Mesma linguagem de movimento do
 * `ConfirmationModal` (scrim + card em fade/escala), mas com um campo em vez
 * de ilustração — não reaproveita o componente porque a estrutura interna
 * (input, validação, teclado) é bem diferente de um modal só de leitura.
 */
export interface NomeSocialModalProps {
  provedor: "Google" | "Apple";
  onConfirm: (nome: string) => void;
  onDismiss: () => void;
}

export function NomeSocialModal({ provedor, onConfirm, onDismiss }: NomeSocialModalProps) {
  const [nome, setNome] = useState("");
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
  const valido = nome.trim().length > 0;

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
          "flex w-full max-w-[320px] flex-col gap-6 rounded-card bg-base-50 p-6 transition-all ease-padrao",
          saindo ? "duration-rapido" : "duration-base",
          mostrar ? "scale-100 opacity-100" : "scale-[0.96] opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 text-center">
          <p className="text-h3 text-ink-primary">Continuar com {provedor}</p>
          <p className="text-[12px] font-light leading-[1.5] text-base-800">
            Simulado pra este case — sem login real. Só precisamos de como te chamar.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-left">
          <span className="text-[14px] font-medium leading-[1.4] text-black">Nome</span>
          <Input
            placeholder="digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
            aria-label="Nome"
          />
        </label>

        <div className="flex flex-col items-center gap-3">
          <Button
            variant="tertiary"
            label="Continuar"
            fullWidth
            disabled={!valido}
            onClick={() => fecharComAnimacao(() => onConfirm(nome.trim()))}
          />
          <button
            type="button"
            onClick={() => fecharComAnimacao(onDismiss)}
            className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-ink-muted"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
