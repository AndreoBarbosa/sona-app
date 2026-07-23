"use client";

import Link from "next/link";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { AppNavBar } from "@/components/app-nav-bar";
import { FinanceHealthCard } from "@/components/finance-health-card";
import { ChevronIcon } from "@/components/ui/icons/chevron-icon";
import { useMetas } from "@/lib/metas-context";
import { useValorAnimado } from "@/lib/use-valor-animado";
import { cx } from "@/lib/cx";
import { getCorMetaPorIndice } from "@/lib/cor-meta";
import {
  perfil,
  contas,
  categorias,
  diagnostico,
  formatBRL,
  getScoreSaudeFinanceira,
  getPatrimonioTotal,
  getSobraTotal,
  getSobraSemDestino,
  getGastoTotal,
  getMetasAtivas,
  getMetasDivergentes,
  getPercentualMeta,
  getTotalCategoria,
  getPercentualCategoria,
  META_ICONES,
  type BancoId,
} from "@/lib/mock-data";

/** bancoId → logo real baixado do Figma (nós 180:4xx, "Logo dos bancos"). */
const BANK_LOGO: Record<BancoId, string> = {
  nubank: "/logos/nubank.svg",
  c6: "/logos/c6.svg",
  bradesco: "/logos/bradesco.svg",
  "mercado-pago": "/logos/mercadopago.svg",
  picpay: "/logos/picpay.svg",
};

/** Máximo de selos de banco visíveis na pilha do Card Patrimônio (nó 652:2248)
 *  antes do selo "+N" de overflow — `contas` já vem ordenada por saldo
 *  desc, então os primeiros são sempre os mais relevantes. */
const LOGOS_VISIVEIS_PATRIMONIO = 4;

/** Selo circular do chevron nos cards clicáveis da Home — 16px, chevron do
 *  MESMO asset do BackButton (aponta pra baixo por padrão, -rotate-90 vira
 *  direita). Fica FORA do flex de conteúdo do card (`position: absolute`,
 *  passado via `className` por quem usa) — colocá-lo dentro do mesmo
 *  container que o conteúdo, dividindo espaço via `justify-between`, foi o
 *  que apertava/descentralizava tudo antes. Cor por card: petróleo usa
 *  base-50 a 50% (discreto sobre fundo escuro), Capacidade usa base-400
 *  sólido — nunca a mesma cor nos dois, o card inteiro já é o alvo de
 *  toque, o círculo é só a dica. */
function CardChevronBadge({
  borderClass,
  iconClass,
  className,
}: {
  borderClass: string;
  iconClass: string;
  className?: string;
}) {
  return (
    <span className={cx("flex h-4 w-4 shrink-0 items-center justify-center rounded-pill border", borderClass, className)}>
      <ChevronIcon className={cx("h-[7px] w-[7px] -rotate-90", iconClass)} />
    </span>
  );
}

/** Selo "+N" de overflow da pilha de bancos — nó 652:2189, ícone real (não
 *  existia no app antes); some quando `contas.length <= LOGOS_VISIVEIS_PATRIMONIO`. */
function IconPlusMini({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className} aria-hidden="true">
      <path d="M4 1v6M1 4h6" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}

/**
 * Home — nó 652:2037 do Figma (+ Card Próxima Ação do nó irmão 1049:2097,
 * que só aparece quando há sobra sem destino). Hierarquia SAÚDE-primeiro: o score
 * de saúde financeira é o primeiro bloco, antes de qualquer saldo.
 *
 * Composição só com os componentes-base da Etapa 3 (Card/Button/StatusBar/
 * NavBar) + tokens da Etapa 1. Todo número vem de selectors de
 * src/lib/mock-data.ts — nada digitado à mão.
 */

export default function HomePage() {
  const { metas } = useMetas();

  const primeiroNome = perfil.nome.split(" ")[0];
  const score = getScoreSaudeFinanceira();
  const metaDivergente = getMetasDivergentes(metas)[0];

  const patrimonio = getPatrimonioTotal();
  // `contas` já vem ordenada por saldo desc (ver mock-data.ts) — as MAIS
  // relevantes primeiro. Antes este selo só mostrava contas com saldo > 0
  // (excluindo MP/PicPay zeradas); o Figma real (652:2248) tem um 5º selo
  // de overflow "+N", que só faz sentido existir se a pilha representar
  // TODAS as contas conectadas, zeradas ou não — restaurado aqui.
  const contasVisiveis = contas.slice(0, LOGOS_VISIVEIS_PATRIMONIO);
  const contasExtras = Math.max(0, contas.length - LOGOS_VISIVEIS_PATRIMONIO);

  const sobraTotal = getSobraTotal();
  const sobraSemDestino = getSobraSemDestino(metas);
  const sobraSemDestinoAnimada = useValorAnimado(sobraSemDestino);
  const gastoTotal = getGastoTotal();

  const metaPrincipal = getMetasAtivas(metas)[0];
  const progressoMeta = metaPrincipal ? getPercentualMeta(metaPrincipal) : 0;
  // metaPrincipal é sempre metasAtivas[0] — 1ª posição na cascata, então
  // sempre a mesma cor do índice 0 (ver lib/cor-meta.ts).
  const corMetaPrincipal = getCorMetaPorIndice(0);

  const categoriaTopo = [...categorias].sort((a, b) => getTotalCategoria(b) - getTotalCategoria(a))[0];
  const percentualCategoriaTopo = Math.round(getPercentualCategoria(categoriaTopo));

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-28 pt-3">
          {/* Saudação + perfil */}
          <div className="flex items-center justify-between">
            <p className="text-h3 text-ink-primary">Bom dia, {primeiroNome}</p>
            <Link href="/perfil" aria-label="Abrir perfil" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/decor/avatar-fernanda.png"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 rounded-pill object-cover"
              />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {/* Card Saúde Financeira — PRIMEIRO bloco, é a tese */}
            <FinanceHealthCard score={score} />

            {/* Card Patrimônio consolidado — nó 652:2248, cartão inteiro
                tocável (regra travada: nunca link de texto "Detalhes →" num
                card). Valor SEM centavos (canônico, DECISOES.md) — o nó
                ainda mostra "R$ 12.450,00", é o Figma que está desatualizado. */}
            <Link href="/patrimonio" className="block transition-[filter] duration-rapido active:brightness-95">
              <Card tone="dark" radius="card-lg" padding="none" className="relative overflow-hidden p-5">
                {/* Chevron FORA do flex de conteúdo — de propósito (causa
                    raiz do aperto de antes: ele dividia espaço com o
                    conteúdo via justify-between). Absolute, canto inferior
                    direito, 20px das bordas — não compete com mais nada. */}
                <CardChevronBadge
                  borderClass="border-base-50/50"
                  iconClass="text-base-50/50"
                  className="absolute bottom-5 right-5 z-10"
                />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-action">
                        Patrimônio consolidado
                      </span>
                      <span className="text-h2 text-ink-inverse">{formatBRL(patrimonio)}</span>
                    </div>
                    <span className="text-[12px] font-normal leading-[1.5] text-action">+R$ 840 este mês</span>
                  </div>

                  {/* Pilha de selos no TOPO à direita — livre agora que o
                      chevron não divide mais essa coluna com ela. */}
                  <div className="flex items-center">
                    {contasVisiveis.map((conta, i) => (
                      // Selos de 11px (nó 652:2248) — o problema nunca foi
                      // o overlap (-2px), era o tamanho (chegava a 20px).
                      // Anel petroleo-700 sobre fundo base-100, nunca
                      // branco puro (vira halo duro sobre o card escuro).
                      <span
                        key={conta.id}
                        style={{ marginLeft: i === 0 ? 0 : -2 }}
                        className="flex h-[11px] w-[11px] shrink-0 items-center justify-center overflow-hidden rounded-pill border border-petroleo-700 bg-base-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={BANK_LOGO[conta.bancoId]} alt={conta.bancoNome} className="h-full w-full" />
                      </span>
                    ))}
                    {contasExtras > 0 && (
                      <span
                        style={{ marginLeft: -2 }}
                        aria-label={`+${contasExtras} conta${contasExtras === 1 ? "" : "s"}`}
                        className="flex h-[11px] w-[11px] shrink-0 items-center justify-center rounded-pill border border-petroleo-700 bg-petroleo-500 text-petroleo-50"
                      >
                        <IconPlusMini className="h-[6px] w-[6px]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* BG Card - Colinas suaves — nó 652:2242, decorativo,
                    atrás do conteúdo (z-0 vs z-10 do conteúdo acima). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/decor/bg-card-colinas-suaves.svg"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[27px] w-full"
                />
              </Card>
            </Link>

            {/* Card Capacidade Mensal — mesma regra: cartão inteiro tocável +
                chevron, sem link de texto. */}
            <Link href="/capacidade" className="block transition-[filter] duration-rapido active:brightness-95">
              <Card padding="none" className="relative p-5">
                {/* Chevron FORA do flex de conteúdo, mesma razão do card
                    Patrimônio — absolute, canto inferior direito, 20px das
                    bordas. */}
                <CardChevronBadge borderClass="border-base-400" iconClass="text-base-400" className="absolute bottom-5 right-5" />

                <div className="flex items-center justify-between gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                      Capacidade mensal
                    </span>
                    <span className="text-h2 text-ink-primary">{formatBRL(sobraTotal)}</span>
                    <span className="text-[12px] font-light leading-[1.5] text-ink-muted">disponíveis este mês</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-[6px] w-[6px] rounded-pill bg-sage-400" />
                      <span className="text-[12px] font-normal leading-[1.5] text-sage-700">
                        Entra&nbsp;&nbsp;{formatBRL(diagnostico.rendaMensal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-[6px] w-[6px] rounded-pill bg-coral-400" />
                      <span className="text-[12px] font-normal leading-[1.5] text-coral-500">
                        Sai&nbsp;&nbsp;{formatBRL(gastoTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Card Próxima Ação — condicional: só quando há sobra sem destino */}
            {sobraSemDestino > 0 && (
              <Card tone="coral" padding="none" className="px-5 py-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-coral-500">
                    Próxima ação
                  </span>
                  <p className="text-[16px] font-normal leading-[1.5] text-ink-primary">
                    Você tem <span className="font-medium text-coral-500">{formatBRL(sobraSemDestinoAnimada)}</span> sem
                    destino no seu plano este mês.
                  </p>
                  <Link
                    href="/metas/divisao"
                    className="w-fit text-[13px] font-medium leading-[1.5] tracking-[0.01em] text-coral-500"
                  >
                    Distribuir sobra →
                  </Link>
                </div>
              </Card>
            )}

            {/* Card de estado — divergência de saldo pendente (Ajuste de
                rota, nó 734:2808). Passivo, nunca um modal: reconciliação é
                evento diagnóstico, não interrupção. */}
            {metaDivergente && (
              <Link
                href={`/metas/${metaDivergente.id}/ajuste-de-rota`}
                className="block transition-[filter] duration-rapido active:brightness-95"
              >
                <Card tone="coral" padding="none" className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-coral-500">
                      Ajuste de rota
                    </span>
                    <p className="text-[16px] font-normal leading-[1.5] text-ink-primary">
                      O saldo de <span className="font-medium text-coral-500">{metaDivergente.titulo}</span> mudou.
                      Vamos reconciliar seu plano?
                    </p>
                    <span className="w-fit text-[13px] font-medium leading-[1.5] tracking-[0.01em] text-coral-500">
                      Ver ajuste de rota →
                    </span>
                  </div>
                </Card>
              </Link>
            )}
          </div>

          {/* Meta principal */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-end justify-between">
                <p className="text-h5 text-ink-primary">Meta principal</p>
                <Link href="/metas" className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400">
                  Ver todas →
                </Link>
              </div>

              {metaPrincipal && (
                <Card padding="md">
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={META_ICONES[metaPrincipal.icone].src}
                        alt=""
                        aria-hidden="true"
                        className="h-9 w-9 shrink-0"
                      />
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-button text-ink-primary">{metaPrincipal.titulo}</span>
                          <span className="text-[10px] font-normal leading-none text-ink-muted">
                            {formatBRL(metaPrincipal.valorAtual)} de {formatBRL(metaPrincipal.valorAlvo)}
                          </span>
                        </div>
                        <div className={cx("h-[2.5px] w-[126px] overflow-hidden rounded-pill", corMetaPrincipal.track)}>
                          <div
                            className={cx("h-full rounded-pill transition-[width] duration-lento ease-padrao", corMetaPrincipal.fill)}
                            style={{ width: `${Math.min(progressoMeta, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span
                      className={cx(
                        "text-[10px] font-medium uppercase leading-none tracking-[0.08em]",
                        corMetaPrincipal.text,
                      )}
                    >
                      {Math.round(progressoMeta)}%
                    </span>
                  </div>
                </Card>
              )}
            </div>

            {/* Insight de diagnóstico — nó 610:16 ("tom=positivo"). Acento é
                absolute no Figma (x:8 y:20 w:4 h:64), não um item de flex —
                era isso que empurrava o ícone/texto e causava a colisão. */}
            <Card tone="sage" padding="none" className="relative flex items-start gap-3 py-[10px] pl-6 pr-4">
              <span className="absolute left-2 top-5 h-16 w-1 rounded-pill bg-sage-400" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/insight-bulb.svg" alt="" aria-hidden="true" className="h-7 w-7 shrink-0" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-sage-800">
                  Diagnóstico semanal
                </span>
                <p className="text-body-sm text-ink-primary">
                  {categoriaTopo.nome} foi a maior fatia do seu mês:{" "}
                  <span className="font-medium text-sage-600">{percentualCategoriaTopo}%</span> de tudo que você
                  gastou.
                </p>
                <Link
                  href="/diagnostico"
                  className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-sage-600"
                >
                  Ver diagnóstico →
                </Link>
              </div>
            </Card>
          </div>
        </main>
      </div>

      <AppNavBar />
    </div>
  );
}
