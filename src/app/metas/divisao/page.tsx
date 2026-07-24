"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DivisaoDaSobraEditor } from "@/components/divisao-da-sobra";
import { useMetas } from "@/lib/metas-context";
import { getMetasAtivas, getSobraTotal, formatBRL } from "@/lib/mock-data";

/**
 * Metas / Divisão da sobra — nós 725:2778 ("proposta") e 725:2830 ("ajuste
 * manual"), rota /metas/divisao. O editor em si (as duas etapas de UI local)
 * vive em `DivisaoDaSobraEditor` — reusado pela Etapa 3 de Criar meta
 * (regra travada: nunca duas implementações paralelas da mesma tela).
 *
 * Divergências do Figma flagueadas (não reproduzidas literalmente):
 *   - Eyebrow "SEGUNDA META" nos dois nós não faz sentido fora de um fluxo
 *     numerado de onboarding que não existe aqui — omitido.
 *   - Os cards de meta dos dois nós usam títulos/valores de exemplo
 *     ("Investir para o futuro" R$522, "Viagem Ilha Grande" R$427, e até as
 *     legendas de % trocadas entre os dois cards) que não batem com
 *     `mock-data.ts` nem entre si — usa `meta.titulo`/`aporteMensal` reais.
 *   - Barra do plano no nó "proposta" tem larguras em pixel fixo — aqui usa
 *     % real (mesmo tratamento da barra "Seu plano" de /metas).
 *
 * Modal de conclusão (Nível 1, nós 732:2724/848:3544 "Meta criada."): apesar
 * do nome do componente, o texto real dos dois nós fala da DIVISÃO entrando
 * em vigor ("Viagem pra Europa entra no seu plano..."), não da criação de
 * uma meta nova do zero — mapeiam pros dois caminhos desta tela (aceitar
 * sugestão / salvar ajuste manual), não pra um fluxo de "+ Adicionar meta".
 * Copy computada da meta com `categoria === "prazo"` real, nunca hardcoded
 * "Viagem". As duas variantes compartilham o mesmo título ("Meta criada.")
 * no próprio Figma — a diferença entre "aceitou"/"ajustou" vive só no corpo.
 *
 * Headline DINÂMICA (mesma conta de `/metas`, nunca duas fontes pro mesmo
 * texto) — "dois destinos" era hardcoded aqui, sobrevivência de quando o
 * app sempre tinha exatamente 2 metas canônicas; com metas começando
 * zeradas isso podia mentir (ex. dizer "dois destinos" com zero metas).
 * Conta só metas com aporte ATIVO (`aporteMensal > 0`) — uma meta a R$0
 * (ex. ajustada manualmente pro chão) não é um destino de verdade da sobra.
 */
const NUMERO_EXTENSO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];

export default function DivisaoDaSobraPage() {
  const { metas, ajustarAporte } = useMetas();
  const router = useRouter();

  const metasAtivas = getMetasAtivas(metas);
  const sobraTotal = getSobraTotal();
  const qtdDestinos = metasAtivas.filter((m) => m.aporteMensal > 0).length;
  const destinoTexto = `${NUMERO_EXTENSO[qtdDestinos] ?? qtdDestinos} destino${qtdDestinos === 1 ? "" : "s"}.`;

  const [confirmacao, setConfirmacao] = useState<"aceitar" | "salvar" | null>(null);
  const [aportesFinais, setAportesFinais] = useState<Record<string, number>>({});

  const metasPrazo = metasAtivas.filter((m) => m.categoria === "prazo");
  const metaPrazoPrincipal = metasPrazo.length === 1 ? metasPrazo[0] : null;

  function salvarDivisao(aportesEditados: Record<string, number>) {
    for (const m of metasAtivas) {
      const novoValor = aportesEditados[m.id];
      if (novoValor !== undefined && novoValor !== m.aporteMensal) {
        ajustarAporte(m.id, novoValor);
      }
    }
    setAportesFinais(aportesEditados);
    setConfirmacao("salvar");
  }

  function aceitarSugestao(propostaFinal: Record<string, number>) {
    for (const m of metasAtivas) {
      const novoValor = propostaFinal[m.id];
      if (novoValor !== undefined && novoValor !== m.aporteMensal) {
        ajustarAporte(m.id, novoValor);
      }
    }
    setConfirmacao("aceitar");
  }

  function fecharConfirmacao(destino: "meta" | "home") {
    setConfirmacao(null);
    if (destino === "home") {
      router.push("/home");
    } else {
      router.push(metaPrazoPrincipal ? `/metas/${metaPrazoPrincipal.id}` : "/metas");
    }
  }

  const somaEditada = confirmacao === "salvar" ? Object.values(aportesFinais).reduce((a, b) => a + b, 0) : 0;
  const semDestinoEditado = Math.max(0, sobraTotal - somaEditada);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/metas" />
            <EyebrowHeadline
              eyebrow="Suas metas"
              headline={`Uma sobra,\n${destinoTexto}`}
              size="h1"
              highlight={{ word: destinoTexto, tone: "sage" }}
            />
          </div>

          <DivisaoDaSobraEditor
            metasAtivas={metasAtivas}
            sobraTotal={sobraTotal}
            onAceitar={aceitarSugestao}
            onSalvar={salvarDivisao}
          />
        </main>
      </div>

      {confirmacao && (
        <ConfirmationModal
          title="Meta criada."
          description={
            confirmacao === "aceitar"
              ? metaPrazoPrincipal
                ? `${metaPrazoPrincipal.titulo} entra no seu plano a partir deste mês: ${formatBRL(metaPrazoPrincipal.aporteMensal)}/mês da sua sobra.`
                : `Sua divisão está confirmada: ${formatBRL(sobraTotal - semDestinoEditado)}/mês do seu plano já tem destino.`
              : metaPrazoPrincipal
                ? `Você definiu a divisão. ${metaPrazoPrincipal.titulo} entra com ${formatBRL(
                    aportesFinais[metaPrazoPrincipal.id] ?? metaPrazoPrincipal.aporteMensal,
                  )}/mês${semDestinoEditado > 0 ? `, e ${formatBRL(semDestinoEditado)} seguem sem destino.` : "."}`
                : `Você definiu a divisão: ${formatBRL(somaEditada)}/mês do seu plano já tem destino.`
          }
          confirmLabel="Ver minha meta"
          onConfirm={() => fecharConfirmacao("meta")}
          dismissLabel="Voltar pra Home"
          onDismiss={() => fecharConfirmacao("home")}
        />
      )}
    </div>
  );
}
