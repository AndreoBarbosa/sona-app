"use client";

import Link from "next/link";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { AppNavBar } from "@/components/app-nav-bar";
import { FinanceHealthCard } from "@/components/finance-health-card";
import { ChevronIcon } from "@/components/ui/icons/chevron-icon";
import { useMetas } from "@/lib/metas-context";
import { useDemoStore } from "@/lib/demo-context";
import { useValorAnimado } from "@/lib/use-valor-animado";
import { cx } from "@/lib/cx";
import { getCorMetaPorIndice } from "@/lib/cor-meta";
import {
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
  const { perfil } = useDemoStore();

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
              <Card tone="dark" radius="card-lg" padding="none" className="relative flex flex-col overflow-hidden p-4">
                <div className="relative z-10 flex flex-col gap-4 border-b border-[rgba(232,238,242,0.1)] pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-action">
                        Patrimônio consolidado
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-h2 text-ink-inverse">{formatBRL(patrimonio)}</span>
                        {/* Pill "+R$ 840 este mês" ao lado do valor — o nó
                            usa fonte 5px (erro de escala do arquivo, mesma
                            classe de bug já documentada alhures neste
                            projeto); 10px é o tamanho que a hierarquia do
                            resto do card sugere, com padding proporcional. */}
                        <span className="flex h-5 items-center rounded-pill bg-[rgba(234,243,236,0.2)] px-2 text-[10px] font-medium leading-none text-action">
                          +R$ 840 este mês
                        </span>
                      </div>
                    </div>

                    {/* Pilha de selos no TOPO à direita. */}
                    <div className="flex items-center">
                      {contasVisiveis.map((conta, i) => (
                        // Selos de 12px (nó 652:2248) — bg base-200 (não
                        // base-100, ajustado pra bater com o nó), borda
                        // petroleo-700 0.75px. O nó pede logo interno 18px
                        // — maior que o próprio selo, o que só faz sentido
                        // como "sangria" contida pelo overflow-hidden do
                        // selo; mantido preenchendo o selo inteiro
                        // (h-full/w-full) em vez do valor literal, que
                        // rebentaria a moldura.
                        <span
                          key={conta.id}
                          style={{ marginLeft: i === 0 ? 0 : -2.25 }}
                          className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-pill border-[0.75px] border-petroleo-700 bg-base-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={BANK_LOGO[conta.bancoId]} alt={conta.bancoNome} className="h-full w-full" />
                        </span>
                      ))}
                      {contasExtras > 0 && (
                        <span
                          style={{ marginLeft: -2.25 }}
                          aria-label={`+${contasExtras} conta${contasExtras === 1 ? "" : "s"}`}
                          className="flex h-3 w-3 shrink-0 items-center justify-center rounded-pill border-[0.75px] border-petroleo-700 bg-petroleo-500 text-petroleo-50"
                        >
                          <IconPlusMini className="h-[6px] w-[6px]" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex justify-end pt-4">
                  <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-pill border border-base-50/50">
                    <ChevronIcon className="h-[6px] w-[6px] -rotate-90 text-base-50/50" />
                  </span>
                </div>

                {/* BG Card - Colinas suaves — nó 652:2242, decorativo,
                    atrás do conteúdo (z-0 vs z-10 do conteúdo acima).
                    Ancorado no rodapé do card (`bottom-0`) em vez do offset
                    absoluto do nó (top: 89) — o card agora tem uma linha a
                    mais (chevron em fluxo), então a altura mudou; grudar no
                    rodapé é o que preserva a intenção visual ("colinas na
                    base do card") independente da altura final. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/decor/bg-card-colinas-suaves.svg"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[27px] w-full"
                />
              </Card>
            </Link>

            {/* Card Capacidade Mensal — nó 655:2349 (releitura). Divisória +
                chevron EM FLUXO abaixo dela (não mais absolute sobreposto
                ao conteúdo) — cartão inteiro tocável, mesma regra dos
                outros cards da Home. */}
            <Link href="/capacidade" className="block transition-[filter] duration-rapido active:brightness-95">
              <Card padding="none" className="flex flex-col px-5 py-3">
                <div className="flex items-center justify-between gap-6 border-b border-[rgba(228,224,216,0.5)] pb-4">
                  <div className="flex w-[117px] flex-col gap-2">
                    <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                      Capacidade mensal
                    </span>
                    <span className="text-h2 text-ink-primary">{formatBRL(sobraTotal)}</span>
                    <span className="text-[12px] font-normal leading-[1.5] text-ink-muted">disponíveis este mês</span>
                  </div>

                  <div className="flex w-[119px] flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-[6px] w-[6px] shrink-0 rounded-pill bg-sage-400" />
                      <span className="text-[12px] font-normal leading-[1.5] text-sage-700">
                        Entra&nbsp;&nbsp;{formatBRL(diagnostico.rendaMensal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-[6px] w-[6px] shrink-0 rounded-pill bg-coral-400" />
                      <span className="text-[12px] font-normal leading-[1.5] text-coral-500">
                        Sai&nbsp;&nbsp;{formatBRL(gastoTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-pill border border-base-600/60">
                    <ChevronIcon className="h-[6px] w-[6px] -rotate-90 text-base-600" />
                  </span>
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
                <Link
                  href={`/metas/${metaPrincipal.id}`}
                  className="block transition-[filter] duration-rapido active:brightness-95"
                >
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
                </Link>
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
