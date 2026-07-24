"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import {
  metas as metasIniciais,
  pausarMeta as pausarMetaPura,
  retomarMeta as retomarMetaPura,
  excluirMeta as excluirMetaPura,
  concluirMeta as concluirMetaPura,
  ajustarAporteMeta as ajustarAporteMetaPura,
  confirmarPrimeiroAporte as confirmarPrimeiroAportePura,
  editarMeta as editarMetaPura,
  criarMeta as criarMetaPura,
  simularDivergencia as simularDivergenciaPura,
  resolverAjusteDeRota as resolverAjusteDeRotaPura,
  forcarValorAtual as forcarValorAtualPura,
  type Meta,
  type MetaIconeId,
  type OpcaoAjusteDeRota,
} from "@/lib/mock-data";
import { limpar, usePersistedState, CHAVES } from "@/lib/persist";

/**
 * Camada de estado mutável por cima do mock-data. Os selectors de
 * mock-data.ts continuam sendo a única fonte de derivação (getSobraSemDestino,
 * getComprometidoEmMetas, getMetasAtivas, getPatrimonioTotal, etc.) — o que
 * muda aqui é só QUAL array de metas entra neles: em vez do array estático
 * do módulo, é o estado do Context, então toda tela que ler `metas` daqui
 * reage a excluir/pausar/retomar automaticamente.
 *
 * As funções de mutação em mock-data.ts (`excluirMeta`, `pausarMeta`,
 * `retomarMeta`) continuam puras (recebem uma lista, devolvem uma lista
 * nova) — é esse Provider que guarda o resultado em `useState` e propaga.
 * Isso substitui a tentativa anterior de persistir via Server Action +
 * `globalThis` (que só resolvia a Home, não o app inteiro, e escondia a
 * mutação numa borda estranha) por estado de verdade, reativo, client-side.
 */

interface MetasContextValue {
  metas: Meta[];
  excluirMeta: (id: string) => void;
  pausarMeta: (id: string) => void;
  retomarMeta: (id: string) => void;
  ajustarAporte: (id: string, novoAporte: number) => void;
  /** Confirma o primeiro aporte de uma meta recém-criada (`valorAtual` passa
   *  a bater com `aporteMensal`) — chamada uma única vez, no momento em que
   *  o aporte final é decidido de verdade (ver `confirmarPrimeiroAporte`,
   *  mock-data.ts). Nunca usada fora do fluxo de Criar meta. */
  confirmarPrimeiroAporte: (id: string) => void;
  editarMeta: (id: string, patch: { titulo?: string; valorAlvo?: number; icone?: MetaIconeId }) => void;
  criarMeta: (input: {
    titulo: string;
    icone: MetaIconeId;
    categoria: Meta["categoria"];
    valorAlvo: number;
    aporteMensal: number;
  }) => string;
  simularDivergencia: (id: string, saldoReal: number) => void;
  resolverAjusteDeRota: (id: string, opcao: OpcaoAjusteDeRota) => void;
  concluirMeta: (id: string) => void;
  /** QA — força `valorAtual` a um valor (ex.: o próprio `valorAlvo`), pra
   *  testar a tela de Meta concluída sem esperar meses de aporte reais. */
  forcarValorAtual: (id: string, valor: number) => void;
  /** QA/reset do modo demo — volta pro estado inicial real do produto
   *  (`[]`, ninguém começa com metas pré-carregadas) e limpa a chave
   *  persistida, sem esperar um reload. */
  resetarMetas: () => void;
  /** QA — substitui a lista inteira por um preset (ex.: `METAS_CENARIO_FERNANDA`,
   *  ver `/qa`) — nunca chamada por um fluxo de produto real. */
  carregarMetas: (novasMetas: Meta[]) => void;
}

const MetasContext = createContext<MetasContextValue | null>(null);

export function MetasProvider({ children }: { children: ReactNode }) {
  // Começa com o array canônico (bate com o HTML renderizado no servidor);
  // o valor persistido, se existir, só entra depois de montado — ver efeito
  // abaixo. Isso evita hydration mismatch (SSR nunca vê localStorage).
  // `usePersistedState` já resolve hidratação (SSR-safe) + gravação sem a
  // race entre os dois efeitos — ver comentário na definição.
  const [metas, setMetas] = usePersistedState<Meta[]>(CHAVES.metas, metasIniciais);

  const excluirMeta = useCallback((id: string) => {
    setMetas((atual) => excluirMetaPura(atual, id));
  }, [setMetas]);

  const pausarMeta = useCallback((id: string) => {
    setMetas((atual) => pausarMetaPura(atual, id));
  }, [setMetas]);

  const retomarMeta = useCallback((id: string) => {
    setMetas((atual) => retomarMetaPura(atual, id));
  }, [setMetas]);

  const ajustarAporte = useCallback((id: string, novoAporte: number) => {
    setMetas((atual) => ajustarAporteMetaPura(atual, id, novoAporte));
  }, [setMetas]);

  const confirmarPrimeiroAporte = useCallback((id: string) => {
    setMetas((atual) => confirmarPrimeiroAportePura(atual, id));
  }, [setMetas]);

  const editarMeta = useCallback(
    (id: string, patch: { titulo?: string; valorAlvo?: number; icone?: MetaIconeId }) => {
      setMetas((atual) => editarMetaPura(atual, id, patch));
    },
    [setMetas],
  );

  const criarMeta = useCallback(
    (input: {
      titulo: string;
      icone: MetaIconeId;
      categoria: Meta["categoria"];
      valorAlvo: number;
      aporteMensal: number;
    }) => {
      const id = `meta-${Date.now()}`;
      setMetas((atual) => criarMetaPura(atual, id, input));
      return id;
    },
    [setMetas],
  );

  const simularDivergencia = useCallback((id: string, saldoReal: number) => {
    setMetas((atual) => simularDivergenciaPura(atual, id, saldoReal));
  }, [setMetas]);

  const resolverAjusteDeRota = useCallback((id: string, opcao: OpcaoAjusteDeRota) => {
    setMetas((atual) => resolverAjusteDeRotaPura(atual, id, opcao));
  }, [setMetas]);

  const concluirMeta = useCallback((id: string) => {
    setMetas((atual) => concluirMetaPura(atual, id));
  }, [setMetas]);

  const forcarValorAtual = useCallback((id: string, valor: number) => {
    setMetas((atual) => forcarValorAtualPura(atual, id, valor));
  }, [setMetas]);

  const resetarMetas = useCallback(() => {
    limpar(CHAVES.metas);
    setMetas(metasIniciais);
  }, [setMetas]);

  const carregarMetas = useCallback((novasMetas: Meta[]) => setMetas(novasMetas), [setMetas]);

  return (
    <MetasContext.Provider
      value={{
        metas,
        excluirMeta,
        pausarMeta,
        retomarMeta,
        ajustarAporte,
        confirmarPrimeiroAporte,
        editarMeta,
        criarMeta,
        simularDivergencia,
        resolverAjusteDeRota,
        concluirMeta,
        forcarValorAtual,
        resetarMetas,
        carregarMetas,
      }}
    >
      {children}
    </MetasContext.Provider>
  );
}

export function useMetas() {
  const ctx = useContext(MetasContext);
  if (!ctx) throw new Error("useMetas() precisa estar dentro de <MetasProvider>");
  return ctx;
}
