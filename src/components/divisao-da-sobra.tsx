"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCheckBadge } from "@/components/ui/icons/meta-detail-icons";
import { cx } from "@/lib/cx";
import { useValorAnimado } from "@/lib/use-valor-animado";
import { aplicarAjusteLocal, calcularMudancas } from "@/lib/divisao-sobra";
import { getCorMetaPorIndice, type CorMeta } from "@/lib/cor-meta";
import { getDataPrevista, formatBRL, formatMesAno, META_ICONES, type Meta } from "@/lib/mock-data";

export interface DivisaoDaSobraEditorProps {
  metasAtivas: Meta[];
  sobraTotal: number;
  onAceitar: () => void;
  onSalvar: (aportesEditados: Record<string, number>) => void;
}

/**
 * Editor de "Seu plano" — nós 725:2778 ("proposta") e 725:2830 ("ajuste
 * manual") do Figma. Componente único reusado por `/metas/divisao` e pela
 * Etapa 3 de Criar meta (regra travada: nunca duas implementações paralelas
 * da mesma tela — ver DECISOES.md, "Consistência estrutural das metas").
 *
 * Edição é OTIMISTA-LOCAL: arrastar um slider só muda `aportesEditados`
 * (state deste componente) — nada persiste até `onSalvar` ser chamado. O
 * teto de cada slider é dinâmico (`valorAtual + semDestino`, recalculado a
 * cada render a partir do que as OUTRAS metas já ocupam) — mover uma sempre
 * libera espaço pras outras. "Sem destino" nunca é digitado: é sempre
 * `sobraTotal - soma(aportes)`.
 */
export function DivisaoDaSobraEditor({ metasAtivas, sobraTotal, onAceitar, onSalvar }: DivisaoDaSobraEditorProps) {
  const [modo, setModo] = useState<"proposta" | "ajuste">("proposta");
  const [aportesEditados, setAportesEditados] = useState<Record<string, number>>(() =>
    Object.fromEntries(metasAtivas.map((m) => [m.id, m.aporteMensal])),
  );

  const somaEditada = Object.values(aportesEditados).reduce((a, b) => a + b, 0);
  const semDestinoEditado = Math.max(0, sobraTotal - somaEditada);
  const pctDistribuido = sobraTotal > 0 ? Math.round((somaEditada / sobraTotal) * 100) : 0;
  const semDestinoAnimado = useValorAnimado(semDestinoEditado);
  const pctDistribuidoAnimado = useValorAnimado(pctDistribuido);

  const mudancas = calcularMudancas(metasAtivas, aportesEditados);
  const mudancaPrincipal = mudancas[0];
  const atrasada = mudancaPrincipal ? mudancaPrincipal.deltaMeses > 0 : false;

  function handleAjustar(metaId: string, novoValor: number) {
    setAportesEditados((atual) => aplicarAjusteLocal(atual, metaId, novoValor, sobraTotal));
  }

  function voltarASugestao() {
    setAportesEditados(Object.fromEntries(metasAtivas.map((m) => [m.id, m.aporteMensal])));
  }

  if (modo === "proposta") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-card border border-border bg-white px-5 py-6">
          <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
            Seu plano · {formatBRL(sobraTotal)}/mês
          </span>

          <div className="flex h-[10px] w-full overflow-hidden rounded-[5px]">
            {metasAtivas.map((m, i) => (
              <div
                key={m.id}
                className={cx(getCorMetaPorIndice(i).fill, "transition-[width] duration-lento ease-padrao")}
                style={{ width: `${sobraTotal > 0 ? (m.aporteMensal / sobraTotal) * 100 : 0}%` }}
              />
            ))}
            {semDestinoEditado > 0 && (
              <div
                className="bg-base-400 transition-[width] duration-lento ease-padrao"
                style={{ width: `${(semDestinoEditado / sobraTotal) * 100}%` }}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            {metasAtivas.map((m, i) => {
              const pct = sobraTotal > 0 ? Math.round((m.aporteMensal / sobraTotal) * 100) : 0;
              return (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span className={cx("h-2 w-2 shrink-0 rounded-pill", getCorMetaPorIndice(i).fill)} />
                  <span className="text-[12px] font-normal leading-[1.5] text-base-800">
                    {m.titulo} {pct}% · {formatBRL(m.aporteMensal)}
                  </span>
                </div>
              );
            })}
            {semDestinoEditado > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-pill bg-base-400" />
                <span className="text-[12px] font-normal leading-[1.5] text-ink-muted">
                  Sem destino {Math.round((semDestinoEditado / sobraTotal) * 100)}% · {formatBRL(semDestinoEditado)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {metasAtivas.map((m, i) => (
            <MetaAporteCard key={m.id} meta={m} cor={getCorMetaPorIndice(i)} valor={m.aporteMensal} sobraTotal={sobraTotal} interativo={false} />
          ))}
        </div>

        <Card tone="info" padding="none" className="relative flex items-start gap-3 py-[10px] pl-6 pr-4">
          <span className="absolute left-2 top-3 h-[calc(100%-24px)] w-1 rounded-pill bg-petroleo-400" />
          <div className="flex flex-1 flex-col gap-1 py-2">
            <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-petroleo-600">
              Por que essa divisão
            </span>
            <p className="text-body-sm text-ink-primary">
              O Sona sugere uma divisão com base no seu diagnóstico. Você pode ajustar quando quiser.
            </p>
          </div>
        </Card>

        <p className="text-center text-[12px] font-light leading-[1.5] text-ink-muted">
          Nada sai da sua conta. O Sona apenas organiza o destino da sua sobra.
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="tertiary" label="Aceitar divisão sugerida" fullWidth onClick={onAceitar} />
          <Button variant="ghost" label="Ajustar manualmente" fullWidth onClick={() => setModo("ajuste")} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-card border border-border px-4 py-4">
        <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-primary">
          Capacidade mensal
        </span>
        <span className="text-[10px] text-ink-muted">·</span>
        <span className="text-[20px] font-light leading-[1.25] tracking-[-0.015em] text-ink-primary">
          {formatBRL(sobraTotal)}/mês
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {metasAtivas.map((m, i) => {
          const somaOutras = metasAtivas
            .filter((outra) => outra.id !== m.id)
            .reduce((soma, outra) => soma + (aportesEditados[outra.id] ?? outra.aporteMensal), 0);
          const max = Math.max(0, sobraTotal - somaOutras);
          return (
            <MetaAporteCard
              key={m.id}
              meta={m}
              cor={getCorMetaPorIndice(i)}
              valor={aportesEditados[m.id] ?? m.aporteMensal}
              sobraTotal={sobraTotal}
              interativo
              max={max}
              onChange={handleAjustar}
            />
          );
        })}
      </div>

      <div
        className={cx(
          "flex items-center justify-center gap-3 rounded-card px-4 py-3",
          pctDistribuido >= 100 ? "bg-sage-50" : "border border-border bg-white",
        )}
      >
        {pctDistribuido >= 100 && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sage-400">
            <IconCheckBadge className="h-5 w-5" />
          </span>
        )}
        <span
          className={cx(
            "text-[12px] font-medium leading-[1.5] tracking-[0.01em]",
            pctDistribuido >= 100 ? "text-sage-700" : "text-ink-secondary",
          )}
        >
          Total distribuído: {pctDistribuidoAnimado}% da sua sobra
          {pctDistribuido < 100 && ` · ${formatBRL(semDestinoAnimado)} sem destino`}
        </span>
      </div>

      {mudancaPrincipal && (
        <Card tone={atrasada ? "coral" : "sage"} padding="none" className="relative flex items-start gap-3 py-[10px] pl-6 pr-4">
          <span
            className={cx(
              "absolute left-2 top-3 h-[calc(100%-24px)] w-1 rounded-pill",
              atrasada ? "bg-coral-400" : "bg-sage-400",
            )}
          />
          <div className="flex flex-1 flex-col gap-1 py-2">
            <span
              className={cx(
                "text-[10px] font-medium uppercase leading-none tracking-[0.04em]",
                atrasada ? "text-coral-600" : "text-sage-800",
              )}
            >
              O que muda com esse ajuste
            </span>
            <p className="text-body-sm text-ink-primary">
              {mudancaPrincipal.titulo} {atrasada ? "completa" : "chega"} em{" "}
              <span className="font-medium">{formatMesAno(mudancaPrincipal.novaData)}</span>,{" "}
              {Math.abs(mudancaPrincipal.deltaMeses)} {Math.abs(mudancaPrincipal.deltaMeses) === 1 ? "mês" : "meses"}{" "}
              {atrasada ? "depois" : "antes"} do sugerido.
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="secondary" label="Salvar divisão" fullWidth onClick={() => onSalvar(aportesEditados)} />
        <Button variant="ghost" label="Voltar à sugestão do Sona" fullWidth onClick={voltarASugestao} />
      </div>
    </div>
  );
}

function MetaAporteCard({
  meta,
  cor,
  valor,
  sobraTotal,
  interativo,
  max,
  onChange,
}: {
  meta: Meta;
  cor: CorMeta;
  valor: number;
  sobraTotal: number;
  interativo: boolean;
  max?: number;
  onChange?: (id: string, novoValor: number) => void;
}) {
  const pct = sobraTotal > 0 ? (valor / sobraTotal) * 100 : 0;
  const dataPrevista = getDataPrevista({ ...meta, aporteMensal: valor });
  const previsao = dataPrevista ? formatMesAno(dataPrevista) : "—";

  // Sem transição ENQUANTO arrasta — o preenchimento acompanha o dedo em
  // tempo real (mesma regra do swipe do MetaCard); a transição só entra
  // pra mudanças que não vêm do próprio arrasto (soltar, "voltar à
  // sugestão", ajuste de uma meta irmã).
  const [arrastando, setArrastando] = useState(false);

  const tone = { track: cor.track, fill: cor.fill, text: cor.text, thumb: cor.border };

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={META_ICONES[meta.icone].src} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-button text-ink-primary">{meta.titulo}</span>
          <span className="text-[12px] font-light leading-[1.5] text-ink-muted">{formatBRL(valor)} por mês</span>
        </div>
        <span className={cx("text-body-sm shrink-0", tone.text)}>{Math.round(pct)}%</span>
      </div>

      <div className="relative flex h-5 items-center">
        <div className={cx("h-[5px] w-full overflow-hidden rounded-[3px]", tone.track)}>
          <div
            className={cx("h-full rounded-[3px]", !arrastando && "transition-[width] duration-lento ease-padrao", tone.fill)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        {interativo && (
          <>
            <span
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute h-3 w-3 rounded-pill border-2 bg-white",
                tone.thumb,
              )}
              style={{ left: `calc(${Math.min(Math.max(pct, 0), 100)}% - 6px)` }}
            />
            <input
              type="range"
              min={0}
              max={Math.max(max ?? valor, valor)}
              step={1}
              value={valor}
              onChange={(e) => onChange?.(meta.id, Number(e.target.value))}
              onPointerDown={() => setArrastando(true)}
              onPointerUp={() => setArrastando(false)}
              aria-label={`Ajustar aporte mensal de ${meta.titulo}`}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
          </>
        )}
      </div>

      <span className="text-[10px] font-light leading-none text-ink-muted">Chegada em {previsao}</span>
    </div>
  );
}
