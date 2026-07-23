"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";
import { Button } from "@/components/ui/button";
import { useMetas } from "@/lib/metas-context";
import { getMetaPorId, getDataPrevista, formatBRL, formatMesAnoExtenso, type Meta, type OpcaoAjusteDeRota } from "@/lib/mock-data";

/**
 * Metas / Ajuste de rota — confirmação — nó 1043:1991, rota
 * /metas/[id]/ajuste-de-rota/confirmacao?opcao=repor|estender|aceitar. Sem
 * nav bar → BackButton. O `opcao` só decide qual FRASE mostrar — a mutação
 * em si já aconteceu (`resolverAjusteDeRota`, chamada na tela anterior,
 * antes de navegar pra cá); esta tela só lê o estado já resolvido da meta.
 *
 * Ilustração de sucesso em tela cheia (nó 1043:1995) é um asset DIFERENTE
 * do check compacto do `ConfirmationModal` (mais decorativo, "confete" ao
 * redor) — baixado do Figma, não recriado em CSS.
 */
export function AjusteDeRotaConfirmacaoClient({ id }: { id: string }) {
  const { metas } = useMetas();
  const meta = getMetaPorId(id, metas);
  const router = useRouter();
  const opcao = (useSearchParams().get("opcao") as OpcaoAjusteDeRota | null) ?? "aceitar";

  if (!meta) {
    return (
      <div className="min-h-screen bg-surface-app">
        <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
          <StatusBar />
          <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
            <BackButton href="/metas" />
            <EyebrowHeadline eyebrow="Ajuste de rota" headline="Essa meta não existe (mais)." />
          </main>
        </div>
      </div>
    );
  }

  const corpo = getCorpoConfirmacao(meta, opcao);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-10 px-4 pb-10 pt-3">
          <BackButton href={`/metas/${meta.id}`} />

          <div className="mx-auto aspect-[320/280] w-full max-w-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/decor/ilustracao-sucesso-tela-cheia.svg"
              alt=""
              aria-hidden="true"
              className="h-full w-full"
            />
          </div>

          <div className="flex flex-1 flex-col justify-between gap-8">
            <div className="flex flex-col gap-3">
              <EyebrowHeadline
                eyebrow="Plano atualizado"
                headline="Pronto. Seu plano reflete a realidade."
                highlight={{ word: "realidade", tone: "sage" }}
              />
              <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">{corpo}</p>
            </div>

            <Button
              variant="secondary"
              label="Ver meu plano"
              fullWidth
              onClick={() => router.push(`/metas/${meta.id}`)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function getCorpoConfirmacao(meta: Meta, opcao: OpcaoAjusteDeRota): string {
  const dataPrevista = getDataPrevista(meta);
  const chegada = dataPrevista ? formatMesAnoExtenso(dataPrevista) : "—";

  if (opcao === "repor" && meta.reposicao) {
    return `${meta.titulo} segue com ${formatBRL(meta.reposicao.valorExtra)}/mês a mais pelos próximos ${meta.reposicao.mesesRestantes} meses. Chegada mantida em ${chegada}.`;
  }

  if (opcao === "estender") {
    return `${meta.titulo} segue com o mensal em ${formatBRL(meta.aporteMensal)}. Nova chegada em ${chegada}.`;
  }

  return `${meta.titulo} segue com ${formatBRL(meta.valorAtual)} guardados e ${formatBRL(meta.aporteMensal)}/mês. O gasto foi uma decisão, não um desvio.`;
}
