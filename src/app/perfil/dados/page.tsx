import { BackButton } from "@/components/ui/back-button";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { perfil } from "@/lib/mock-data";

/**
 * Perfil / Dados pessoais — nó 1079:2441, rota /perfil/dados. Sem nav bar →
 * BackButton (volta pra /perfil).
 *
 * IDENTIDADE (Nome, CPF) é só leitura — nem o nó nem a tarefa preveem seta
 * nessas linhas, então `ListRow` sem `chevron`.
 *
 * CONTATO (E-mail, Telefone) o nó mostra COM seta ("editáveis, com seta"),
 * mas não existe nenhuma tela/fluxo de edição real construído ainda — por
 * "toda linha clicável precisa de destino real", a seta fica só como
 * indicação visual (fiel ao nó), sem `onClick`: `ListRow` sem handler já
 * renderiza como `<div>`, não `<button>`, então não parece clicável ao
 * toque nem entra na ordem de tab como link morto.
 */
export default function DadosPessoaisPage() {
  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/perfil" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Dados pessoais
              </span>
              <p className="text-h2 text-ink-primary">Seus dados.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Identidade
            </span>
            <Card padding="none">
              <ListRow label="Nome completo" end={{ kind: "value", value: perfil.nome }} />
              <ListRow label="CPF" end={{ kind: "value", value: perfil.cpfMascarado }} />
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Contato
            </span>
            <Card padding="none">
              <ListRow label="E-mail" end={{ kind: "value", value: perfil.email, chevron: true }} />
              <ListRow label="Telefone" end={{ kind: "value", value: perfil.telefoneMascarado, chevron: true }} />
            </Card>
          </div>

          <p className="text-body-sm text-ink-muted">Nome e CPF vêm do seu cadastro e não podem ser alterados aqui.</p>
        </main>
      </div>
    </div>
  );
}
