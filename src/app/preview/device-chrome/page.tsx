import { StatusBar } from "@/components/ui/status-bar";
import { HomeIndicator } from "@/components/ui/home-indicator";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar
 * visualmente o chrome do frame: Status bar (nó 122:16) + Home indicator
 * (mock, sem nó), 393px de largura, isolados e compostos ao redor de uma
 * tela vazia.
 */

export default function DeviceChromePreview() {
  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Status bar + Home indicator</h1>
        <p className="text-body-sm text-ink-secondary">Chrome do frame, nó 122:16 (status bar) do Figma.</p>
      </div>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Status bar · isolada</p>
        <div className="rounded-card border border-border bg-white">
          <StatusBar />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Status bar · time customizado</p>
        <div className="rounded-card border border-border bg-white">
          <StatusBar time="14:07" />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Home indicator · isolado</p>
        <div className="rounded-card border border-border bg-white">
          <HomeIndicator />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Frame completo (393px)</p>
        <div className="mx-auto flex w-[393px] flex-col overflow-hidden rounded-card-lg border border-border bg-white">
          <StatusBar />
          <div className="flex flex-1 items-center justify-center py-16 text-body-sm text-ink-muted">
            conteúdo da tela
          </div>
          <HomeIndicator />
        </div>
      </section>
    </main>
  );
}
