import { Card } from "@/components/ui/card";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar
 * visualmente o componente Card antes de compor telas reais.
 */
export default function CardPreview() {
  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Card</h1>
        <p className="text-body-sm text-ink-secondary">
          Base reutilizável — branco, borda #E4E0D8, radius 16.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <p className="text-caption uppercase text-ink-muted">padding: md (padrão, 24/20)</p>
        <Card>
          <p className="text-h4 text-ink-primary">Saúde financeira</p>
          <p className="text-body-sm text-ink-secondary">
            Conteúdo de exemplo dentro do padding padrão.
          </p>
        </Card>

        <p className="text-caption uppercase text-ink-muted">padding: sm (16 uniforme)</p>
        <Card padding="sm">
          <p className="text-body-sm text-ink-secondary">Card compacto.</p>
        </Card>

        <p className="text-caption uppercase text-ink-muted">padding: lg (24 uniforme)</p>
        <Card padding="lg">
          <p className="text-body-sm text-ink-secondary">Card com padding generoso.</p>
        </Card>

        <p className="text-caption uppercase text-ink-muted">padding: none + className extra</p>
        <Card padding="none" className="overflow-hidden">
          <div className="bg-base-200 px-6 py-5">
            <p className="text-body-sm text-ink-secondary">
              Sem padding da base — quem compõe controla o espaçamento interno.
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
