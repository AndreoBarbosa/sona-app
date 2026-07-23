"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar
 * visualmente o componente Toggle antes de compor telas reais.
 */
export default function TogglePreview() {
  const [live, setLive] = useState(false);

  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Toggle</h1>
        <p className="text-body-sm text-ink-secondary">
          Pill 44×26 — ligado sage-500, desligado base-400 (#D4D0C8).
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Toggle checked={false} />
          <span className="text-body-sm text-ink-secondary">Desligado (estático)</span>
        </div>

        <div className="flex items-center gap-3">
          <Toggle checked={true} />
          <span className="text-body-sm text-ink-secondary">Ligado (estático)</span>
        </div>

        <div className="flex items-center gap-3">
          <Toggle checked={false} disabled />
          <span className="text-body-sm text-ink-secondary">Desligado + disabled</span>
        </div>

        <div className="flex items-center gap-3">
          <Toggle checked={true} disabled />
          <span className="text-body-sm text-ink-secondary">Ligado + disabled</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Toggle checked={live} onCheckedChange={setLive} aria-label="Notificações" />
          <span className="text-body-sm text-ink-secondary">
            Interativo de verdade — clique: está {live ? "ligado" : "desligado"}
          </span>
        </div>
      </section>
    </main>
  );
}
