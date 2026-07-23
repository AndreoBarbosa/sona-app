import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar o par
 * Eyebrow + Headline (nós 1079:2513/2463 eyebrow, 1079:2515 headline)
 * nas 3 combinações: sem destaque, destaque sage, destaque coral.
 */

export default function EyebrowHeadlinePreview() {
  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-10 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">Eyebrow + Headline</h1>
        <p className="text-body-sm text-ink-secondary">Nós 1079:2513/2463 (eyebrow) e 1079:2515 (headline).</p>
      </div>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Sem destaque</p>
        <EyebrowHeadline eyebrow="Preferências" headline="Notificações e preferências." />
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Destaque sage · tom positivo</p>
        <EyebrowHeadline
          eyebrow="Diagnóstico"
          headline="Suas finanças têm base, mas há espaço real para melhorar."
          highlight={{ word: "espaço real", tone: "sage" }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Destaque coral · tom de atenção</p>
        <EyebrowHeadline
          eyebrow="Categoria"
          headline="Alimentação já passou do previsto este mês."
          highlight={{ word: "passou do previsto", tone: "coral" }}
        />
      </section>
    </main>
  );
}
