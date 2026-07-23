"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";
import { BackButton } from "@/components/ui/back-button";
import { IconPencil, IconCheckBadge } from "@/components/ui/icons/meta-detail-icons";
import { ChevronIcon } from "@/components/ui/icons/chevron-icon";
import { PausarMetaButton } from "@/components/pausar-meta-button";
import { ExcluirMetaModal } from "@/components/excluir-meta-modal";
import { Button } from "@/components/ui/button";
import { useMetas } from "@/lib/metas-context";
import { useToast } from "@/lib/toast-context";
import { getCorMeta } from "@/lib/cor-meta";
import {
  getMetaPorId,
  getMetasAtivas,
  getPercentualMeta,
  getDataPrevista,
  getSobraTotal,
  isMetaDivergente,
  isMetaConcluivel,
  calcularOpcoesAjusteDeRota,
  formatBRL,
  formatMesAno,
  formatMesAnoExtenso,
  META_ICONES,
  perfil,
  type Meta,
} from "@/lib/mock-data";

/**
 * Detalhe da meta — nó 1053:2269 ("Metas / Viagem — detalhe (editável)").
 *
 * Sem AppNavBar de propósito: o nó não tem nav bar (é uma tela de
 * drill-down, alcançada a partir do MetaCard, não uma aba). TEM BackButton:
 * essa tela não é mais exceção — o swipe-back é atalho, nunca o único
 * caminho (não existe edge-swipe em desktop), então toda tela sem nav bar
 * precisa de um botão de voltar visível, sem exceção.
 *
 * Números do Figma (R$ 1.080 guardados, R$ 380/mês, "9% do caminho") são o
 * mesmo tipo de dado de exemplo desalinhado que já vimos no mockup do swipe
 * (nó 1064:2519, "R$ 949") — usa `meta.valorAtual`/`aporteMensal` reais, não
 * os números do nó.
 *
 * Sem campo de data-limite (deadline) no modelo de dados, então a
 * comparação "um mês antes do prazo" do nó não é reproduzida — seria um
 * número inventado. Idem pro card "Atividade": não existe histórico mês a
 * mês por meta, só o aporte mensal atual — os 3 meses mostrados usam esse
 * mesmo valor (`meta.aporteMensal`), não números variados fabricados.
 */

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function MetaDetalheClient({ id }: { id: string }) {
  const { metas } = useMetas();
  const meta = getMetaPorId(id, metas);

  if (!meta) {
    return (
      <div className="min-h-screen bg-surface-app">
        <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
          <StatusBar />
          <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
            <BackButton href="/metas" />
            <EyebrowHeadline eyebrow="Meta não encontrada" headline="Essa meta não existe (mais)." />
            <p className="text-body-sm text-ink-secondary">
              Ela pode ter sido excluída, concluída, ou o link que você seguiu está incorreto.
            </p>
            <Link
              href="/metas"
              className="inline-flex h-14 w-fit items-center justify-center rounded-button bg-petroleo-700 px-4 text-button text-base-50"
            >
              Ver todas as metas
            </Link>
          </main>
        </div>
      </div>
    );
  }

  if (isMetaConcluivel(meta)) {
    return <MetaConcluidaCelebracao meta={meta} />;
  }

  return <MetaDetalheConteudo meta={meta} />;
}

/**
 * Meta concluída — nó 1043:2031, ESTADO derivado (valorAtual >= valorAlvo
 * numa meta ainda "ativa"), não uma rota isolada: substitui o detalhe
 * normal enquanto isso for verdade. Ilustração DEDICADA de celebração
 * (`ilustracao-celebracao.svg`) — diferente do check de sucesso reusado em
 * outros fluxos (Ajuste de rota, Criar meta), são coisas diferentes.
 *
 * `concluirMeta` (o que de fato libera o aporte pra sobra sem destino) só
 * roda ao SAIR desta tela ("Começar uma nova meta") — é aí que o feedback
 * ("Meta concluída. R$X/mês voltaram para a sua sobra.") dispara também.
 */
function MetaConcluidaCelebracao({ meta }: { meta: Meta }) {
  const router = useRouter();
  const { concluirMeta } = useMetas();
  const { showToast } = useToast();
  const primeiroNome = perfil.nome.split(" ")[0];

  function comecarNovaMeta() {
    concluirMeta(meta.id);
    showToast(`Meta concluída. ${formatBRL(meta.aporteMensal)}/mês voltaram para a sua sobra.`);
    router.push("/metas/nova");
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-10 px-4 pb-10 pt-3">
          <BackButton href="/metas" />

          <div className="mx-auto aspect-[400/351] w-full max-w-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/decor/ilustracao-celebracao.svg" alt="" aria-hidden="true" className="h-full w-full" />
          </div>

          <div className="flex flex-1 flex-col justify-between gap-8">
            <div className="flex flex-col gap-3">
              <EyebrowHeadline
                eyebrow="Meta concluída"
                headline={`Você chegou lá, ${primeiroNome}.`}
                highlight={{ word: "chegou lá", tone: "sage" }}
              />
              <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">
                {meta.titulo} saiu do papel. {formatBRL(meta.valorAlvo)} guardados, no seu ritmo.
              </p>
            </div>

            <Button variant="tertiary" label="Começar uma nova meta" fullWidth onClick={comecarNovaMeta} />
          </div>
        </main>
      </div>
    </div>
  );
}

function MetaDetalheConteudo({ meta }: { meta: Meta }) {
  const { metas, excluirMeta } = useMetas();
  const { showToast } = useToast();
  const router = useRouter();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  // Cor por ORDEM DA CASCATA, não por categoria (ver lib/cor-meta.ts) — a
  // MESMA cor que essa meta usa no MetaCard da lista e na faixa do plano.
  const cor = getCorMeta(meta.id, getMetasAtivas(metas));

  const percentual = Math.min(getPercentualMeta(meta), 100);
  const sobraTotal = getSobraTotal();
  const pctDaSobra = sobraTotal > 0 ? Math.round((meta.aporteMensal / sobraTotal) * 100) : 0;

  const dataPrevista = getDataPrevista(meta);
  const previsaoAbreviada = dataPrevista ? formatMesAno(dataPrevista) : "—";

  const criacao = new Date(`${meta.criadoEm}T00:00:00`);
  const criadoEmLabel = formatMesAnoExtenso(criacao);

  // Nunca mostra atividade de antes da meta existir — no máximo os últimos 3
  // meses, mas cortado pra quantos meses realmente já se passaram desde `criadoEm`.
  const hoje = new Date();
  const mesesDesdeCriacao = (hoje.getFullYear() - criacao.getFullYear()) * 12 + (hoje.getMonth() - criacao.getMonth()) + 1;
  const qtdMesesAtividade = Math.max(1, Math.min(3, mesesDesdeCriacao));

  const atividade = Array.from({ length: qtdMesesAtividade }, (_, i) => {
    const data = new Date();
    data.setDate(1);
    data.setMonth(data.getMonth() - i);
    return { label: capitalizar(data.toLocaleDateString("pt-BR", { month: "long" })), valor: meta.aporteMensal };
  });

  const tone = { track: cor.track, fill: cor.fill, pct: cor.text };

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-3">
            <BackButton href="/metas" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={META_ICONES[meta.icone].src} alt="" aria-hidden="true" className="h-12 w-12 shrink-0" />
                <div className="flex flex-col gap-[5px]">
                  <span className="text-h3 text-ink-primary">{meta.titulo}</span>
                  <span className="text-[10px] font-light leading-none text-ink-muted">Criado em {criadoEmLabel}</span>
                </div>
              </div>
              <Link
                href={`/metas/${meta.id}/editar`}
                aria-label="Editar meta"
                className="shrink-0 text-ink-primary opacity-60"
              >
                <IconPencil className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Card padding="none" className="flex flex-col gap-3 px-5 py-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                  Guardado até agora
                </span>
                <div className="flex items-end gap-1">
                  <span className="text-h2 text-ink-primary">{formatBRL(meta.valorAtual)}</span>
                  <span className="pb-0.5 text-[12px] font-light leading-[1.5] text-ink-muted">
                    de {formatBRL(meta.valorAlvo)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className={`h-[6px] w-full overflow-hidden rounded-[5px] ${tone.track}`}>
                  <div
                    className={`h-full rounded-[5px] transition-[width] duration-lento ease-padrao ${tone.fill}`}
                    style={{ width: `${percentual}%` }}
                  />
                </div>
                <span className={`text-[12px] font-medium leading-[1.5] tracking-[0.01em] ${tone.pct}`}>
                  {Math.round(percentual)}% do caminho
                </span>
              </div>
            </Card>

            <div className="flex gap-6">
              <div className="flex flex-1 flex-col gap-[5px] rounded-card border border-border px-[18px] py-3">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                  Por mês
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-lg text-ink-primary">{formatBRL(meta.aporteMensal)}</span>
                  <span className="text-[10px] font-light leading-none text-ink-muted">{pctDaSobra}% da sua sobra</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-[5px] rounded-card border border-border px-[18px] py-3">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                  Previsão de chegada
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-lg text-ink-primary">{previsaoAbreviada}</span>
                </div>
              </div>
            </div>

            {isMetaDivergente(meta) ? (
              // Card de estado ELEVADO — divergência pendente. Passivo (link,
              // nunca modal): reconciliação é evento diagnóstico, não
              // interrupção. Sem ícone de alarme/erro — só cor coral discreta
              // e um chevron, o mesmo vocabulário de "algo pra ver" usado em
              // outros lugares do app.
              <Link
                href={`/metas/${meta.id}/ajuste-de-rota`}
                className="flex items-center justify-between gap-3 rounded-card border border-coral-200 bg-coral-50 px-4 py-3 transition-colors duration-rapido ease-padrao active:bg-coral-100"
              >
                <span className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-600">
                  Ajuste de rota disponível · {formatBRL(Math.abs(calcularOpcoesAjusteDeRota(meta).diferenca))} de
                  diferença
                </span>
                <ChevronIcon className="h-3 w-3 shrink-0 -rotate-90 text-coral-500" />
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-3 rounded-card border border-petroleo-600 bg-sage-50 px-4 py-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sage-400">
                  <IconCheckBadge className="h-5 w-5" />
                </span>
                <span className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-sage-700">
                  Confere com seu saldo real · atualizado hoje
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
              Atividade
            </span>
            <div className="flex flex-col gap-2">
              {atividade.map(({ label, valor }, i) => (
                <div key={i} className="flex items-center gap-3 rounded-card border border-border bg-white px-[18px] py-3">
                  <span className="h-[10px] w-[10px] shrink-0 rounded-pill bg-sage-400" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-ink-primary">{label}</span>
                    <span className="text-[10px] font-light leading-none text-ink-muted">{formatBRL(valor)} reservados</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/metas/divisao" className="w-fit text-[12px] font-medium leading-[1.4] text-coral-400">
            Ajustar divisão da sobra →
          </Link>

          <PausarMetaButton meta={meta} />

          <button
            type="button"
            onClick={() => setConfirmandoExclusao(true)}
            className="text-center text-[14px] font-medium leading-[1.4] text-coral-500"
          >
            Excluir meta
          </button>
        </main>
      </div>

      {confirmandoExclusao && (
        <ExcluirMetaModal
          meta={meta}
          onCancelar={() => setConfirmandoExclusao(false)}
          onConfirmar={() => {
            excluirMeta(meta.id);
            router.push("/metas");
            showToast(`${meta.titulo} excluída. ${formatBRL(meta.aporteMensal)}/mês voltaram para a sua sobra.`);
          }}
        />
      )}
    </div>
  );
}
