"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { StatusBar } from "@/components/ui/status-bar";
import { Button } from "@/components/ui/button";
import { useMetas } from "@/lib/metas-context";
import { useValorAnimado } from "@/lib/use-valor-animado";
import { getSobraTotal, getSobraSemDestino, getMetasAtivas, formatBRL } from "@/lib/mock-data";

/**
 * Capacidade — sobra sem destino — nó 1049:2049, rota /capacidade. Sem nav bar →
 * BackButton. Alcançada pelo "Detalhes →" do card Capacidade mensal da Home.
 *
 * Divergência flagueada: o nó usa "livres" como rótulo ("R$ 249 ainda estão
 * livres", legenda "Livre · R$ 249") — contradiz o vocabulário travado em
 * DECISOES.md ("sem destino", nunca "livre"). Segue o termo travado, não o
 * texto literal do nó.
 *
 * Tudo client-side (`useMetas()`): comprometido/sem-destino são DERIVADOS
 * do estado ativo de metas, não estáticos — se o usuário editar/excluir uma
 * meta em outra tela, esta tela reflete na hora. Quando `sobraSemDestino` chega a
 * 0, a faixa coral e a linha de legenda somem, e a frase-resposta se adapta
 * (comportamento pedido, não existe no nó — que só mostra o caso parcial).
 */

export default function CapacidadePage() {
  const { metas } = useMetas();
  const router = useRouter();

  const sobraTotal = getSobraTotal();
  const sobraSemDestino = getSobraSemDestino(metas);
  const comprometido = sobraTotal - sobraSemDestino;
  const metasAtivas = getMetasAtivas(metas);

  const pctComprometido = sobraTotal > 0 ? (comprometido / sobraTotal) * 100 : 0;
  const pctSemDestino = sobraTotal > 0 ? (sobraSemDestino / sobraTotal) * 100 : 0;

  const nomesMetas = metasAtivas.map((m) => m.titulo).join(" + ");

  // Sistema de movimento: valores que mudam por ação do usuário (editar
  // meta, excluir, ajustar divisão) animam a contagem em 400ms — é o que
  // faz a consequência da ação ser PERCEBIDA, não só recalculada.
  const sobraSemDestinoAnimada = useValorAnimado(sobraSemDestino);
  const comprometidoAnimado = useValorAnimado(comprometido);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/home" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Capacidade mensal
              </span>
              <p className="w-[345px] max-w-full text-h2 text-ink-primary">
                {sobraSemDestino > 0 ? (
                  <>
                    Dos {formatBRL(sobraTotal)} que sobram,{" "}
                    <span className="text-coral-400">{formatBRL(sobraSemDestinoAnimada)} ainda estão sem destino</span>.
                  </>
                ) : (
                  <>
                    Dos {formatBRL(sobraTotal)} que sobram, <span className="text-sage-600">tudo já tem destino</span>.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-card border border-border bg-white px-6 py-5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Sua sobra deste mês
              </span>
              <span className="text-h2 text-ink-primary">{formatBRL(sobraTotal)}</span>
            </div>

            <div className="flex h-[10px] w-full overflow-hidden rounded-pill bg-sage-50">
              <div
                className="h-full bg-sage-500 transition-[width] duration-lento ease-padrao"
                style={{ width: `${pctComprometido}%` }}
              />
              {sobraSemDestino > 0 && (
                <div
                  className="h-full bg-coral-400 transition-[width] duration-lento ease-padrao"
                  style={{ width: `${pctSemDestino}%` }}
                />
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <span className="mt-[7px] h-2 w-2 shrink-0 rounded-pill bg-sage-500" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-h5 text-ink-primary">Comprometido · {formatBRL(comprometidoAnimado)}</span>
                  {nomesMetas && (
                    <span className="text-[12px] font-normal leading-[1.5] text-ink-muted">{nomesMetas}</span>
                  )}
                </div>
              </div>

              {sobraSemDestino > 0 && (
                <div className="flex items-start gap-2">
                  <span className="mt-[7px] h-2 w-2 shrink-0 rounded-pill bg-coral-400" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-h5 text-ink-primary">Sem destino · {formatBRL(sobraSemDestinoAnimada)}</span>
                    <span className="text-[12px] font-normal leading-[1.5] text-coral-500">
                      Pronto para você destinar
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="w-[345px] max-w-full text-body-sm text-ink-muted">
            Nada é movido de fato. O Sona só organiza o destino da sua sobra.
          </p>

          <Button variant="tertiary" label="Distribuir sobra" fullWidth onClick={() => router.push("/metas/divisao")} />
        </main>
      </div>
    </div>
  );
}
