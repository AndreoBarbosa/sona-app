import { Button, type ButtonState, type ButtonVariant } from "@/components/ui/button";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar visualmente
 * o componente Button (nó 122:115 do Figma) antes de compor telas reais.
 */

const VARIANTS: { key: ButtonVariant; label: string }[] = [
  { key: "primary", label: "Primary · petróleo · commitment" },
  { key: "secondary", label: "Secondary · sage · progresso" },
  { key: "tertiary", label: "Tertiary · coral · conversão leve" },
  { key: "ghost", label: "Ghost" },
];

const ESTADOS: { key: ButtonState; label: string }[] = [
  { key: "padrao", label: "Padrão" },
  { key: "pressed", label: "Pressed" },
  { key: "disabled", label: "Disabled" },
];

export default function ButtonPreview() {
  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Button</h1>
        <p className="text-body-sm text-ink-secondary">
          4 variantes × 3 estados, nó 122:115 do Figma.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {VARIANTS.map(({ key, label }) => (
          <section key={key} className="flex flex-col gap-2">
            <p className="text-caption uppercase text-ink-muted">{label}</p>
            <div className="flex flex-col gap-2">
              {ESTADOS.map(({ key: estado, label: estadoLabel }) => (
                <div key={estado} className="flex items-center gap-3">
                  <Button variant={key} estado={estado} label="Confirmar meta" />
                  <span className="text-caption text-ink-muted">{estadoLabel}</span>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="flex flex-col gap-2">
          <p className="text-caption uppercase text-ink-muted">Full width + interação real</p>
          <Button variant="primary" label="Conectar minha conta" fullWidth />
          <p className="text-caption text-ink-muted">
            Sem `estado` forçado — clique/toque pra ver o :active de verdade.
          </p>
        </section>
      </div>
    </main>
  );
}
