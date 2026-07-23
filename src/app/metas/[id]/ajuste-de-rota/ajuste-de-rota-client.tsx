"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";
import { Button } from "@/components/ui/button";
import { useMetas } from "@/lib/metas-context";
import { cx } from "@/lib/cx";
import {
  getMetaPorId,
  isMetaDivergente,
  calcularOpcoesAjusteDeRota,
  formatBRL,
  formatMesAnoExtenso,
  META_ICONES,
  type Meta,
  type OpcaoAjusteDeRota,
} from "@/lib/mock-data";

/**
 * Metas / Ajuste de rota — reconciliação — nó 734:2808, rota
 * /metas/[id]/ajuste-de-rota. Sem nav bar → BackButton.
 *
 * Evento DIAGNÓSTICO, não erro: o saldo real da conta divergiu do
 * reservado. Sem culpa, sem iconografia de alarme — "dinheiro na conta é
 * dinheiro vivo" é o coração do tom desta tela (ver DECISOES.md).
 *
 * Os três resultados (repor/estender/aceitar) são CALCULADOS por
 * `calcularOpcoesAjusteDeRota` (mock-data.ts) — nunca escritos aqui.
 *
 * Forma LONGA de data ("dezembro de 2029") — divergência deliberada do
 * formato curto travado pro resto do app (`formatMesAno`, "dez 2029"): o
 * Figma deste nó usa forma longa explicitamente nas duas telas do fluxo, e
 * o Figma é fonte de verdade visual. Ver `formatMesAnoExtenso` em
 * mock-data.ts.
 */

const COR_NOTA: Record<OpcaoAjusteDeRota, string> = {
  repor: "text-[#3A6A48]",
  estender: "text-[#672413]",
  aceitar: "text-[#1A3A50]",
};

export function AjusteDeRotaClient({ id }: { id: string }) {
  const { metas } = useMetas();
  const meta = getMetaPorId(id, metas);

  if (!meta || !isMetaDivergente(meta)) {
    return (
      <div className="min-h-screen bg-surface-app">
        <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
          <StatusBar />
          <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
            <BackButton href={meta ? `/metas/${meta.id}` : "/metas"} />
            <EyebrowHeadline eyebrow="Ajuste de rota" headline="Nada pra ajustar aqui." />
            <p className="text-body-sm text-ink-secondary">
              {meta
                ? `${meta.titulo} não tem nenhuma divergência pendente entre o reservado e o saldo real.`
                : "Essa meta não existe (mais)."}
            </p>
          </main>
        </div>
      </div>
    );
  }

  return <AjusteDeRotaConteudo meta={meta} />;
}

function AjusteDeRotaConteudo({ meta }: { meta: Meta }) {
  const router = useRouter();
  const { resolverAjusteDeRota } = useMetas();
  const [selecao, setSelecao] = useState<OpcaoAjusteDeRota>("repor");

  const saldoReal = meta.saldoReal ?? meta.valorAtual;
  const opcoes = calcularOpcoesAjusteDeRota(meta);
  const headline = `${formatBRL(opcoes.diferenca)} saíram da meta ${meta.titulo}.`;

  function confirmar() {
    resolverAjusteDeRota(meta.id, selecao);
    router.push(`/metas/${meta.id}/ajuste-de-rota/confirmacao?opcao=${selecao}`);
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-8 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href={`/metas/${meta.id}`} />
            <EyebrowHeadline
              eyebrow="Ajuste de rota"
              headline={headline}
              highlight={{ word: formatBRL(opcoes.diferenca), tone: "coral" }}
            />
            <p className="text-body-sm text-ink-secondary">
              Sem culpa: dinheiro na conta é dinheiro vivo. O que importa é o seu plano refletir a realidade.
            </p>
          </div>

          {/* Metas / Card reconciliação — nó 734:3038 */}
          <div className="flex items-start gap-3 rounded-card border border-border bg-white px-4 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={META_ICONES[meta.icone].src} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                    Reservado
                  </span>
                  <span className="text-[14px] font-normal leading-[1.5] text-ink-muted">
                    {formatBRL(meta.valorAtual)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                    Na conta
                  </span>
                  <span className="text-[14px] font-normal leading-[1.5] text-ink-primary">{formatBRL(saldoReal)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                    Diferença
                  </span>
                  <span className="text-[14px] font-normal leading-[1.5] text-coral-500">
                    − {formatBRL(opcoes.diferenca)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-light leading-none text-ink-muted">
                Detectado hoje na leitura do seu saldo consolidado
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Como você quer ajustar?
            </span>

            <div className="flex flex-col gap-2">
              <OpcaoCard
                selecionado={selecao === "repor"}
                onSelecionar={() => setSelecao("repor")}
                titulo="Repor nos próximos meses"
                detalhe={
                  <>
                    <span className="font-medium text-[#3A6A48]">+{formatBRL(opcoes.repor.valorExtra)}/mês</span> por{" "}
                    {opcoes.repor.meses} meses
                  </>
                }
                nota={`Chegada mantida em ${opcoes.repor.dataResultante ? formatMesAnoExtenso(opcoes.repor.dataResultante) : "—"}`}
                notaClass={COR_NOTA.repor}
              />
              <OpcaoCard
                selecionado={selecao === "estender"}
                onSelecionar={() => setSelecao("estender")}
                titulo="Estender o prazo"
                detalhe={
                  <>
                    Mensal segue em <span className="font-medium text-ink-primary">{formatBRL(meta.aporteMensal)}</span>
                  </>
                }
                nota={`Nova chegada em ${opcoes.estender.dataResultante ? formatMesAnoExtenso(opcoes.estender.dataResultante) : "—"}`}
                notaClass={COR_NOTA.estender}
              />
              <OpcaoCard
                selecionado={selecao === "aceitar"}
                onSelecionar={() => setSelecao("aceitar")}
                titulo="Aceitar o novo valor"
                detalhe={
                  <>
                    {meta.titulo} parte de{" "}
                    <span className="font-medium text-[#467A90]">{formatBRL(saldoReal)}</span>
                  </>
                }
                nota="O gasto foi uma decisão, não um desvio"
                notaClass={COR_NOTA.aceitar}
              />
            </div>
          </div>

          <p className="text-center text-[10px] font-light leading-none text-ink-muted">
            Enquanto você decide, o Sona mostra o valor real, nunca o planejado.
          </p>

          <div className="mt-auto flex flex-col gap-2">
            <Button variant="secondary" label="Atualizar meu plano" fullWidth onClick={confirmar} />
            <Button
              variant="ghost"
              label="Fazer isso depois"
              fullWidth
              onClick={() => router.push(`/metas/${meta.id}`)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function OpcaoCard({
  selecionado,
  onSelecionar,
  titulo,
  detalhe,
  nota,
  notaClass,
}: {
  selecionado: boolean;
  onSelecionar: () => void;
  titulo: string;
  detalhe: ReactNode;
  nota: string;
  notaClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelecionar}
      aria-pressed={selecionado}
      className={cx(
        "flex flex-col items-start gap-1.5 rounded-card border px-5 py-3 text-left transition-colors duration-rapido ease-padrao",
        selecionado ? "border-petroleo-700 bg-petroleo-50" : "border-border bg-white",
      )}
    >
      <span className="text-[14px] font-medium leading-[1.4] text-ink-primary">{titulo}</span>
      <span className="text-[12px] font-light leading-[1.5] text-ink-secondary">{detalhe}</span>
      <span className={cx("text-[10px] font-light leading-none", notaClass)}>{nota}</span>
    </button>
  );
}
