"use client";

import { cx } from "@/lib/cx";
import { META_ICONES, type MetaIconeId } from "@/lib/mock-data";

/**
 * Seletor de ícone de meta — nó 617:1867 ("Ícones de metas", 9 badges reais:
 * Investir, Dívidas, Reserva, Aposentadoria, Viagem, Intercâmbio, Imóvel,
 * Carro, Personalizar). Um componente SÓ, reusado em dois lugares: "Trocar"
 * em Editar meta e a Etapa 1 de Criar meta — nunca dois seletores paralelos.
 *
 * Cada badge já vem com seu próprio círculo de fundo embutido no asset
 * (diferente dos ícones de categoria do Diagnóstico, que precisam de um
 * wrapper) — por isso não há nenhum círculo/tint aplicado aqui por fora.
 */

export function MetaIconePicker({
  selecionado,
  onSelecionar,
}: {
  selecionado: MetaIconeId;
  onSelecionar: (id: MetaIconeId) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(META_ICONES) as MetaIconeId[]).map((id) => {
        const { src, label } = META_ICONES[id];
        const ativo = id === selecionado;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelecionar(id)}
            aria-label={label}
            aria-pressed={ativo}
            className={cx(
              "flex flex-col items-center gap-1.5 rounded-card border p-2 transition-colors duration-rapido ease-padrao",
              ativo ? "border-petroleo-700 bg-petroleo-50" : "border-border bg-white",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" aria-hidden="true" className="h-10 w-10" />
            <span className="text-center text-[10px] font-normal leading-[1.3] text-ink-secondary">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
