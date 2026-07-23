"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMetas } from "@/lib/metas-context";
import { useDemoStore } from "@/lib/demo-context";
import { useResetDemo } from "@/lib/use-reset-demo";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  getMetasAtivas,
  getSobraTotal,
  getComprometidoEmMetas,
  getSobraSemDestino,
  getPercentualMeta,
  isMetaDivergente,
  formatBRL,
} from "@/lib/mock-data";

/** Fora do componente de propósito — impureza (`Math.random`) só é segura
 *  em código que o React não tenta re-executar durante render; um helper de
 *  módulo garante isso sem depender de heurística de "isto é um handler". */
function calcularSaldoDivergente(valorAtual: number): number {
  const diferenca = 50 + Math.round(Math.random() * 400);
  const paraMenos = Math.random() < 0.5;
  return paraMenos ? Math.max(0, valorAtual - diferenca) : valorAtual + diferenca;
}

/**
 * Painel de QA — rota /qa, fora da navegação (nenhuma tela do produto linka
 * pra cá, igual `/preview/*`), mas dentro do build/deploy de propósito: dá
 * pra testar em produção pelo celular sem precisar de DevTools.
 *
 * Existe porque as duas frentes do "modo demo" (persistência + reconciliação
 * probabilística) tornam alguns estados difíceis de alcançar sob demanda —
 * `/preview/divergencia` já cobria "forçar divergência"/"forçar conclusão"
 * por meta; este painel cobre o resto (empty states, sobra zerada, reset
 * canônico, reduced motion) NUM SÓ lugar, com o estado atual visível ao
 * lado de cada botão, pra conferir a matemática sem abrir o DevTools.
 */
export default function QaPage() {
  const { metas, excluirMeta, simularDivergencia, forcarValorAtual, ajustarAporte } = useMetas();
  const demo = useDemoStore();
  const resetarTudo = useResetDemo();
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const [motionReduzido, setMotionReduzido] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("forcar-motion-reduzido", motionReduzido);
    return () => document.documentElement.classList.remove("forcar-motion-reduzido");
  }, [motionReduzido]);

  const metasAtivas = getMetasAtivas(metas);
  const sobraTotal = getSobraTotal();
  const comprometido = getComprometidoEmMetas(metas);
  const semDestino = getSobraSemDestino(metas);

  function zerarTodasAsMetas() {
    for (const m of metasAtivas) excluirMeta(m.id);
  }

  return (
    <main className="app-scroll mx-auto flex h-screen max-w-mobile flex-col gap-8 overflow-y-auto bg-surface-app px-6 py-8">
      <div className="flex flex-col gap-1">
        <p className="text-eyebrow uppercase text-ink-muted">qa · fora da navegação</p>
        <h1 className="text-h2 text-ink-primary">Painel de QA</h1>
        <p className="text-body-sm text-ink-secondary">
          Força cada estado do modo demo sob demanda. Não está linkado em nenhuma tela do produto,
          mas está no build — acessível direto pela URL, inclusive em produção.
        </p>
      </div>

      {/* Estado atual em tempo real */}
      <section className="flex flex-col gap-3 rounded-card border border-border bg-white px-4 py-4">
        <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
          Estado atual
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted">Sobra total</span>
            <span className="text-[14px] font-medium text-ink-primary">{formatBRL(sobraTotal)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted">Comprometido</span>
            <span className="text-[14px] font-medium text-ink-primary">{formatBRL(comprometido)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted">Sem destino</span>
            <span className={`text-[14px] font-medium ${semDestino > 0 ? "text-coral-500" : "text-sage-600"}`}>
              {formatBRL(semDestino)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted">Metas ativas</span>
            <span className="text-[14px] font-medium text-ink-primary">{metasAtivas.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {metasAtivas.length === 0 && <span className="text-[12px] text-ink-muted">Nenhuma meta ativa.</span>}
          {metasAtivas.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 border-t border-border pt-2 text-[12px]">
              <span className="text-ink-primary">{m.titulo}</span>
              <span className="text-ink-muted">
                {formatBRL(m.valorAtual)}/{formatBRL(m.valorAlvo)} · {Math.round(getPercentualMeta(m))}% ·{" "}
                {formatBRL(m.aporteMensal)}/mês
                {isMetaDivergente(m) && <span className="text-coral-500"> · divergente</span>}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Por meta */}
      <section className="flex flex-col gap-3">
        <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
          Forçar por meta
        </span>
        <div className="flex flex-col gap-2">
          {metasAtivas.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border bg-white px-4 py-3">
              <span className="text-[13px] font-medium text-ink-primary">{m.titulo}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isMetaDivergente(m)}
                  onClick={() => simularDivergencia(m.id, calcularSaldoDivergente(m.valorAtual))}
                  className="rounded-button border border-coral-400 px-3 py-1.5 text-[12px] font-medium text-coral-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Disparar divergência
                </button>
                <button
                  type="button"
                  disabled={m.valorAtual >= m.valorAlvo}
                  onClick={() => forcarValorAtual(m.id, m.valorAlvo)}
                  className="rounded-button border border-sage-500 px-3 py-1.5 text-[12px] font-medium text-sage-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Concluir agora
                </button>
                <Link href={`/metas/${m.id}`} className="px-1 py-1.5 text-[12px] font-medium text-petroleo-400">
                  Ver →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Estados globais */}
      <section className="flex flex-col gap-3">
        <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
          Estados globais
        </span>
        <div className="flex flex-col gap-2">
          <QaBotao label="Zerar todas as metas (empty state de Metas)" onClick={zerarTodasAsMetas} disabled={metasAtivas.length === 0} />
          {demo.historicoForcadoVazio ? (
            <QaBotao label="Restaurar histórico" onClick={demo.restaurarHistorico} tone="sage" />
          ) : (
            <QaBotao label="Zerar histórico (empty state de Histórico)" onClick={demo.zerarHistorico} />
          )}
          {demo.sobraZerada ? (
            <QaBotao
              label="Restaurar sobra sem destino"
              onClick={() => demo.restaurarSobraSemDestino(metas, ajustarAporte)}
              tone="sage"
            />
          ) : (
            <QaBotao
              label="Zerar sobra sem destino (some a Próxima Ação)"
              onClick={() => demo.zerarSobraSemDestino(metas, ajustarAporte)}
              disabled={semDestino <= 0}
            />
          )}
        </div>
      </section>

      {/* Acessibilidade */}
      <section className="flex flex-col gap-3">
        <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
          Acessibilidade
        </span>
        <button
          type="button"
          onClick={() => setMotionReduzido((v) => !v)}
          className="w-fit rounded-button border border-border px-4 py-2 text-[13px] font-medium text-ink-primary"
        >
          {motionReduzido ? "✓ " : ""}Forçar prefers-reduced-motion
        </button>
        <p className="text-[11px] text-ink-muted">
          Zera duração de toda animação/transição CSS do app. Não afeta a Splash (ela lê a
          preferência real do sistema, não este botão) — pra testar a Splash sem movimento, mude a
          configuração do SO/navegador mesmo.
        </p>
      </section>

      {/* Reset */}
      <section className="flex flex-col gap-2 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setConfirmandoReset(true)}
          className="w-fit text-[13px] font-medium text-coral-600"
        >
          Resetar tudo pro estado canônico da Fernanda
        </button>
        <Link href="/home" className="text-[12px] font-medium text-ink-muted">
          ← Voltar pra Home
        </Link>
      </section>

      {confirmandoReset && (
        <ConfirmationModal
          title="Resetar tudo?"
          description={<p>Metas, nome, e todos os estados forçados aqui voltam ao ponto de partida da Fernanda.</p>}
          confirmLabel="Resetar"
          onConfirm={resetarTudo}
          dismissLabel="Cancelar"
          onDismiss={() => setConfirmandoReset(false)}
          perigo
        />
      )}
    </main>
  );
}

function QaBotao({
  label,
  onClick,
  disabled = false,
  tone = "coral",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "coral" | "sage";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-fit rounded-button border px-4 py-2 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
        tone === "coral" ? "border-coral-400 text-coral-500" : "border-sage-500 text-sage-600"
      }`}
    >
      {label}
    </button>
  );
}
