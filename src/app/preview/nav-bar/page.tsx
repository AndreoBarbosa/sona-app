"use client";

import { useState } from "react";
import { NavBar, type NavTab } from "@/components/ui/nav-bar";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar
 * visualmente a NavBar antes de compor telas reais.
 */
export default function NavBarPreview() {
  const [active, setActive] = useState<NavTab>("inicio");

  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Nav bar</h1>
        <p className="text-body-sm text-ink-secondary">
          Nó 692:121 — aba ativa: <strong>{active}</strong>
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <p className="text-caption uppercase text-ink-muted">Interativa (clique nas abas)</p>
        <NavBar active={active} onTabChange={setActive} className="mx-0 max-w-none" />
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-caption uppercase text-ink-muted">Estático — cada aba ativa</p>
        <div className="flex flex-col gap-3">
          <NavBar active="inicio" className="mx-0 max-w-none" />
          <NavBar active="metas" className="mx-0 max-w-none" />
          <NavBar active="diagnostico" className="mx-0 max-w-none" />
          <NavBar active="historico" className="mx-0 max-w-none" />
        </div>
      </section>
    </main>
  );
}
