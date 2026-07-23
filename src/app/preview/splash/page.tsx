"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBar } from "@/components/ui/status-bar";
import { SonaLogoAnimado } from "@/components/sona-logo-animado";

/**
 * Preview de QA — não é uma tela do produto. Compara as duas variações da
 * splash "Acende" lado a lado: petróleo (a real, usada em `/`) e sage
 * (pedida só pra comparação). "Reproduzir" remonta o componente (`key`
 * muda) pra rodar a animação de novo sem precisar recarregar a página.
 */
export default function SplashPreview() {
  const [run, setRun] = useState(0);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Splash — comparar variações</h1>
        <p className="text-body-sm text-ink-secondary">
          Esquerda: petróleo (a real, usada em <code>/</code>). Direita: sage, gerada só pra
          comparação.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="w-fit rounded-button border border-petroleo-700 px-4 py-2 text-[13px] font-medium text-ink-primary"
      >
        Reproduzir de novo
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col overflow-hidden rounded-card border border-border">
          <div className="flex h-[600px] flex-col bg-surface-app">
            <StatusBar />
            <div className="flex flex-1 items-center justify-center">
              <SonaLogoAnimado key={`petroleo-${run}`} corFinal="petroleo" />
            </div>
          </div>
          <p className="border-t border-border bg-white px-3 py-2 text-center text-[12px] font-medium text-ink-primary">
            Petróleo (produção)
          </p>
        </div>

        <div className="flex flex-col overflow-hidden rounded-card border border-border">
          <div className="flex h-[600px] flex-col bg-surface-app">
            <StatusBar />
            <div className="flex flex-1 items-center justify-center">
              <SonaLogoAnimado key={`sage-${run}`} corFinal="sage" />
            </div>
          </div>
          <p className="border-t border-border bg-white px-3 py-2 text-center text-[12px] font-medium text-ink-primary">
            Sage (comparação)
          </p>
        </div>
      </div>

      <Link href="/home" className="text-[12px] font-medium text-ink-muted">
        ← Voltar pra Home
      </Link>
    </main>
  );
}
