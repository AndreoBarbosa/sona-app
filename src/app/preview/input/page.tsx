import { Input } from "@/components/ui/input";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar visualmente
 * o componente Input (component set 428:1238 do Figma) antes de compor telas
 * reais. "Padrão" e "Preenchido" não são props — o preenchido usa
 * `defaultValue` pra disparar o mesmo `:not(:placeholder-shown)` que reage
 * a digitação de verdade.
 */

export default function InputPreview() {
  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Input</h1>
        <p className="text-body-sm text-ink-secondary">
          Email + password, 3 estados, component set 428:1238 do Figma.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Email · Padrão</p>
          <Input type="email" />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Email · Preenchido</p>
          <Input type="email" defaultValue="fernanda_torres@gmail.com" />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Email · Erro</p>
          <Input type="email" defaultValue="fernandatorres@gmail.com" error />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Password · Padrão</p>
          <Input type="password" />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Password · Preenchido</p>
          <Input type="password" defaultValue="Fernand@Torre$" />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Password · Erro</p>
          <Input type="password" defaultValue="FernaTorre" error />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Disabled</p>
          <Input type="email" defaultValue="fernanda_torres@gmail.com" disabled />
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Interação real</p>
          <Input type="email" />
          <p className="text-caption text-ink-muted">
            Digite pra ver a borda mudar de base-300 pra petroleo-600 sozinha, e clique no
            olho no campo de senha abaixo pra alternar a visibilidade.
          </p>
          <Input type="password" />
        </section>
      </div>
    </main>
  );
}
