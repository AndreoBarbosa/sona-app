"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { EyebrowHeadline } from "@/components/ui/eyebrow-headline";
import { TrocarIconeMeta } from "@/components/trocar-icone-meta";
import { MetaChegadaCard } from "@/components/meta-chegada-card";
import { useMetas } from "@/lib/metas-context";
import { useToast } from "@/lib/toast-context";
import { dataParaInputMonth, inputMonthParaData } from "@/lib/mes-input";
import {
  getMetaPorId,
  getTetoAporte,
  getDataPrevista,
  calcularChegada,
  formatBRL,
  type Meta,
  type MetaIconeId,
} from "@/lib/mock-data";

/**
 * Metas / Editar meta — nó 1055:2282, clonado de "Nova meta — configurar"
 * (693:2211) no Figma.
 *
 * Campos editáveis: nome, ícone (via "Trocar", `TrocarIconeMeta`), valor
 * alvo e QUANDO quer chegar lá. O aporte mensal é DERIVADO desses dois
 * últimos (modelo INVERTIDO do que existia antes — usuário não digita mais
 * aporte direto) via `calcularChegada`, a mesma conta que Criar meta usa.
 * NÃO editável: valor já guardado (vem do histórico de alocação, só
 * informativo).
 *
 * Fonte única de verdade pro aporte: `useMetas().ajustarAporte`, a MESMA
 * ação que /metas/divisao usa — nunca uma lógica paralela aqui, senão as
 * duas telas divergem (regra travada em DECISOES.md). Nome/valor-alvo/ícone
 * usam `editarMeta`, que não mexe em aporte.
 */

export function EditarMetaClient({ id }: { id: string }) {
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
          </main>
        </div>
      </div>
    );
  }

  return <EditarMetaConteudo meta={meta} />;
}

function Campo({
  label,
  value,
  onChange,
  prefixo,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefixo?: string;
  type?: "text" | "month";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">{label}</span>
      <div className="flex items-center gap-1.5 rounded-card border border-border bg-white px-4 py-3">
        {prefixo && <span className="text-[14px] font-normal text-ink-muted">{prefixo}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type ?? "text"}
          inputMode={prefixo ? "numeric" : "text"}
          className="w-full bg-transparent text-[14px] font-normal leading-[1.4] text-ink-primary outline-none"
        />
      </div>
    </div>
  );
}

function EditarMetaConteudo({ meta }: { meta: Meta }) {
  const { metas, ajustarAporte, editarMeta } = useMetas();
  const { showToast } = useToast();
  const router = useRouter();

  const dataPrevistaAtual = getDataPrevista(meta) ?? new Date();

  const [nome, setNome] = useState(meta.titulo);
  const [icone, setIcone] = useState<MetaIconeId>(meta.icone);
  const [valorAlvoTexto, setValorAlvoTexto] = useState(String(meta.valorAlvo));
  const [dataAlvoTexto, setDataAlvoTexto] = useState(dataParaInputMonth(dataPrevistaAtual));
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const valorAlvo = Number(valorAlvoTexto.replace(/\D/g, "")) || 0;
  const dataAlvo = inputMonthParaData(dataAlvoTexto);

  const teto = getTetoAporte(metas, meta.id);
  const resultado = calcularChegada(meta.valorAtual, valorAlvo, dataAlvo, teto);

  const hoje = new Date();
  const dataNoFuturo =
    !!dataAlvo && (dataAlvo.getFullYear() > hoje.getFullYear() ||
      (dataAlvo.getFullYear() === hoje.getFullYear() && dataAlvo.getMonth() > hoje.getMonth()));

  const nomeValido = nome.trim().length > 0;
  const valorAlvoValido = valorAlvo > meta.valorAtual;
  const podeSalvar = nomeValido && valorAlvoValido && dataNoFuturo;

  const sujo =
    nome.trim() !== meta.titulo ||
    icone !== meta.icone ||
    valorAlvo !== meta.valorAlvo ||
    dataAlvoTexto !== dataParaInputMonth(dataPrevistaAtual);

  function sairSemSalvar() {
    router.push(`/metas/${meta.id}`);
  }

  function pedirSaida() {
    if (sujo) {
      setConfirmandoSaida(true);
    } else {
      sairSemSalvar();
    }
  }

  function salvar() {
    if (!podeSalvar) return;
    editarMeta(meta.id, { titulo: nome.trim(), valorAlvo, icone });
    ajustarAporte(meta.id, resultado.aporteFinal);
    showToast("Meta atualizada.");
    router.push(`/metas/${meta.id}`);
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton onClick={pedirSaida} />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Editar meta
              </span>
              <p className="text-h2 text-ink-primary">Ajustar {meta.titulo}.</p>
            </div>
          </div>

          <TrocarIconeMeta icone={icone} onTrocar={setIcone} />

          <div className="flex flex-col gap-3">
            <Campo label="Nome da meta" value={nome} onChange={setNome} />
            {!nomeValido && <p className="text-[12px] font-normal leading-[1.5] text-coral-500">Dê um nome pra essa meta.</p>}

            <Campo label="Valor alvo" value={valorAlvoTexto} onChange={setValorAlvoTexto} prefixo="R$" />
            {!valorAlvoValido && (
              <p className="text-[12px] font-normal leading-[1.5] text-coral-500">
                O valor alvo precisa ser maior que o que você já guardou ({formatBRL(meta.valorAtual)}).
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Já guardado
              </span>
              <div className="rounded-card border border-border bg-base-100 px-4 py-3">
                <span className="text-[14px] font-normal leading-[1.4] text-ink-secondary">
                  {formatBRL(meta.valorAtual)} · vem do histórico, não é editável aqui
                </span>
              </div>
            </div>

            <Campo label="Quando quer chegar lá" value={dataAlvoTexto} onChange={setDataAlvoTexto} type="month" />
            {!dataNoFuturo && <p className="text-[12px] font-normal leading-[1.5] text-coral-500">Escolha uma data no futuro.</p>}
          </div>

          <MetaChegadaCard resultado={resultado} sobraDisponivel={teto} />

          <div className="flex flex-col gap-2">
            <Button variant="secondary" label="Salvar alterações" fullWidth disabled={!podeSalvar} onClick={salvar} />
            <button
              type="button"
              onClick={pedirSaida}
              className="text-center text-[14px] font-medium leading-[1.4] text-ink-muted"
            >
              Cancelar
            </button>
          </div>
        </main>
      </div>

      {confirmandoSaida && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-petroleo-700/40 px-4 pb-8"
          onClick={() => setConfirmandoSaida(false)}
        >
          <div
            className="flex w-full max-w-mobile flex-col gap-4 rounded-card-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Alterações não salvas
              </span>
              <p className="text-h3 text-ink-primary">Descartar as mudanças?</p>
            </div>
            <p className="text-body-sm text-ink-secondary">
              Você ajustou algo nesta meta e ainda não salvou. Se sair agora, essas mudanças se perdem.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setConfirmandoSaida(false)}
                className="h-14 w-full rounded-button border border-border bg-transparent text-button text-ink-primary transition-colors hover:bg-base-100 active:bg-base-200"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={sairSemSalvar}
                className="text-center text-[14px] font-medium leading-[1.4] text-coral-500"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
