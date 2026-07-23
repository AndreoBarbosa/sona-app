"use client";

import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";

/**
 * Perfil / Notificações e preferências — nó 1079:2491, rota
 * /perfil/notificacoes. Sem nav bar → BackButton (volta pra /perfil).
 *
 * AVISOS: 4 toggles interativos, estado em memória (`useState` — a tarefa
 * pede "mesmo que só em memória", não pede persistência real). Valores
 * iniciais batem com o nó: Diagnóstico semanal / Marcos das metas / Ajuste
 * de rota ligados, Novidades do Sona desligado.
 *
 * GERAL (Aparência, Idioma): o nó mostra valor + seta, mas não existe tela
 * de seleção real — mesma regra aplicada em Dados pessoais/Contato: a seta
 * fica só visual, `ListRow` sem `onClick` não navega a lugar nenhum.
 */
export default function NotificacoesPage() {
  const [diagnosticoSemanal, setDiagnosticoSemanal] = useState(true);
  const [marcosDasMetas, setMarcosDasMetas] = useState(true);
  const [ajusteDeRota, setAjusteDeRota] = useState(true);
  const [novidadesDoSona, setNovidadesDoSona] = useState(false);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/perfil" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Preferências
              </span>
              <p className="text-h2 text-ink-primary">Notificações e preferências.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Avisos
            </span>
            <Card padding="none">
              <ListRow
                label="Diagnóstico semanal"
                description="Um resumo gentil, uma vez por semana"
                end={{ kind: "toggle", checked: diagnosticoSemanal, onCheckedChange: setDiagnosticoSemanal }}
              />
              <ListRow
                label="Marcos das metas"
                description="Quando você chega perto ou conclui uma meta"
                end={{ kind: "toggle", checked: marcosDasMetas, onCheckedChange: setMarcosDasMetas }}
              />
              <ListRow
                label="Ajuste de rota"
                description="Quando a realidade diverge do seu plano"
                end={{ kind: "toggle", checked: ajusteDeRota, onCheckedChange: setAjusteDeRota }}
              />
              <ListRow
                label="Novidades do Sona"
                description="Novos recursos e melhorias"
                end={{ kind: "toggle", checked: novidadesDoSona, onCheckedChange: setNovidadesDoSona }}
              />
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Geral
            </span>
            <Card padding="none">
              <ListRow label="Aparência" end={{ kind: "value", value: "Sistema", chevron: true }} />
              <ListRow label="Idioma" end={{ kind: "value", value: "Português (BR)", chevron: true }} />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
