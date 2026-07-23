"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";

/**
 * Preview de QA — não é uma tela do produto. Serve só pra validar
 * visualmente o ListRow (nós 1079:2469 "Nome completo", 1079:2479 "E-mail",
 * 1079:2519 "Diagnóstico semanal") nas 3 variações, compostos dentro de
 * `<Card padding="none">` pra reproduzir o Card-com-divisórias do Figma.
 */

export default function ListRowPreview() {
  const [semanal, setSemanal] = useState(true);
  const [alertas, setAlertas] = useState(false);

  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto gap-8 bg-surface-app px-6 py-8">
      <div>
        <p className="text-eyebrow uppercase text-ink-muted">preview · qa</p>
        <h1 className="text-h2 text-ink-primary">ListRow</h1>
        <p className="text-body-sm text-ink-secondary">
          Valor simples, valor + seta, toggle — nós 1079:2469 / 2479 / 2519.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Identidade · valor simples</p>
        <Card padding="none">
          <ListRow label="Nome completo" end={{ kind: "value", value: "Fernanda Souza" }} />
          <ListRow label="CPF" end={{ kind: "value", value: "•••.•••.•••-00" }} />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Contato · valor + seta (navegável)</p>
        <Card padding="none">
          <ListRow
            label="E-mail"
            end={{ kind: "value", value: "fernanda@email.com", chevron: true }}
            onClick={() => console.log("abrir edição de e-mail")}
          />
          <ListRow
            label="Telefone"
            end={{ kind: "value", value: "(11) 9 8888-0000", chevron: true }}
            onClick={() => console.log("abrir edição de telefone")}
          />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-caption uppercase text-ink-muted">Preferências · toggle (interação real)</p>
        <Card padding="none">
          <ListRow
            label="Diagnóstico semanal"
            description="Um resumo gentil, uma vez por semana"
            end={{ kind: "toggle", checked: semanal, onCheckedChange: setSemanal }}
          />
          <ListRow
            label="Alertas de gasto"
            description="Avisar quando uma categoria sair do previsto"
            end={{ kind: "toggle", checked: alertas, onCheckedChange: setAlertas }}
          />
          <ListRow label="Notificações desativadas" description="Linha de exemplo desabilitada" end={{ kind: "toggle", checked: false }} disabled />
        </Card>
      </section>
    </main>
  );
}
