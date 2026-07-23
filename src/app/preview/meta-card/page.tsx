"use client";

import { useState } from "react";
import { MetaCard } from "@/components/meta-card";
import { getCorMetaPorIndice } from "@/lib/cor-meta";
import { getMetasAtivas } from "@/lib/mock-data";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar o
 * MetaCard com swipe (nós 701:2365/717:2828 + comportamento do nó
 * 1064:2516) antes de montar a tela /metas.
 *
 * Arraste o card pra esquerda (mouse ou touch) — funciona nos dois, é a
 * mesma implementação via Pointer Events. Editar + Excluir sempre, pra toda
 * meta sem exceção — ver DECISOES.md, "Consistência estrutural das metas".
 */
export default function MetaCardPreview() {
  const [log, setLog] = useState<string[]>([]);

  function registrar(mensagem: string) {
    setLog((atual) => [mensagem, ...atual].slice(0, 5));
  }

  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">MetaCard · swipe</h1>
        <p className="text-body-sm text-ink-secondary">
          Arraste pra esquerda (mouse ou touch). Toque fora fecha. Toque no card (fechado) navega pra
          /metas/[id].
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {getMetasAtivas().map((meta, i) => (
          <MetaCard
            key={meta.id}
            meta={meta}
            cor={getCorMetaPorIndice(i)}
            onEditar={(m) => registrar(`Editar → ${m.titulo}`)}
            onExcluir={(m) => registrar(`Excluir → ${m.titulo}`)}
          />
        ))}
      </div>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Ações disparadas</p>
        {log.length === 0 ? (
          <p className="text-body-sm text-ink-muted">Nada ainda — arraste um card e toque em Editar/Excluir.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {log.map((linha, i) => (
              <li key={i} className="text-body-sm text-ink-primary">
                {linha}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Notas de fidelidade</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-body-sm text-ink-secondary">
          <li>Reserva de emergência: só Editar — `protegida: true`, nunca excluível, nem no dado.</li>
          <li>Viagem pra Europa: Editar + Excluir, cor coral (aspiracional) vs sage (proteção).</li>
          <li>Valor mostrado é sempre `valorAtual`/`valorAlvo` — nunca a sobra mensal.</li>
        </ul>
      </section>
    </main>
  );
}
