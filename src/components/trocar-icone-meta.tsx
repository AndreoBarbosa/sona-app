"use client";

import { useState } from "react";
import { META_ICONES, type MetaIconeId } from "@/lib/mock-data";
import { MetaIconePicker } from "@/components/ui/meta-icone-picker";

/**
 * Badge do ícone atual + link "Trocar", que abre o seletor (nó "Ícones de
 * metas") num bottom sheet. Escolher SÓ atualiza o estado local via
 * `onTrocar` — nada persiste até o formulário chamador salvar. Componente
 * único, reusado em Editar meta e na Etapa 1 de Criar meta (regra travada:
 * nunca dois seletores paralelos).
 */
export function TrocarIconeMeta({
  icone,
  onTrocar,
}: {
  icone: MetaIconeId;
  onTrocar: (id: MetaIconeId) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const { src, label } = META_ICONES[icone];

  return (
    <>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden="true" className="h-14 w-14 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-normal leading-[1.4] text-ink-secondary">{label}</span>
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="w-fit text-[13px] font-medium leading-[1.4] text-coral-400"
          >
            Trocar
          </button>
        </div>
      </div>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-petroleo-700/40 px-4 pb-8"
          onClick={() => setAberto(false)}
        >
          <div
            className="flex w-full max-w-mobile flex-col gap-4 rounded-card-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Ícone da meta
              </span>
              <p className="text-h3 text-ink-primary">Escolher ícone.</p>
            </div>
            <MetaIconePicker
              selecionado={icone}
              onSelecionar={(id) => {
                onTrocar(id);
                setAberto(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
