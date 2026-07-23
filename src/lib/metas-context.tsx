"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  metas as metasIniciais,
  pausarMeta as pausarMetaPura,
  retomarMeta as retomarMetaPura,
  excluirMeta as excluirMetaPura,
  concluirMeta as concluirMetaPura,
  ajustarAporteMeta as ajustarAporteMetaPura,
  editarMeta as editarMetaPura,
  criarMeta as criarMetaPura,
  simularDivergencia as simularDivergenciaPura,
  resolverAjusteDeRota as resolverAjusteDeRotaPura,
  forcarValorAtual as forcarValorAtualPura,
  type Meta,
  type MetaIconeId,
  type OpcaoAjusteDeRota,
} from "@/lib/mock-data";

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
}

const MetasContext = createContext<MetasContextValue | null>(null);

export function MetasProvider({ children }: { children: ReactNode }) {
  const [metas, setMetas] = useState<Meta[]>(metasIniciais);

  const excluirMeta = useCallback((id: string) => {
    setMetas((atual) => excluirMetaPura(atual, id));
  }, []);

  const pausarMeta = useCallback((id: string) => {
    setMetas((atual) => pausarMetaPura(atual, id));
  }, []);

  const retomarMeta = useCallback((id: string) => {
    setMetas((atual) => retomarMetaPura(atual, id));
  }, []);

  const ajustarAporte = useCallback((id: string, novoAporte: number) => {
    setMetas((atual) => ajustarAporteMetaPura(atual, id, novoAporte));
  }, []);

  const editarMeta = useCallback(
    (id: string, patch: { titulo?: string; valorAlvo?: number; icone?: MetaIconeId }) => {
      setMetas((atual) => editarMetaPura(atual, id, patch));
    },
    [],
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
    [],
  );

  const simularDivergencia = useCallback((id: string, saldoReal: number) => {
    setMetas((atual) => simularDivergenciaPura(atual, id, saldoReal));
  }, []);

  const resolverAjusteDeRota = useCallback((id: string, opcao: OpcaoAjusteDeRota) => {
    setMetas((atual) => resolverAjusteDeRotaPura(atual, id, opcao));
  }, []);

  const concluirMeta = useCallback((id: string) => {
    setMetas((atual) => concluirMetaPura(atual, id));
  }, []);

  const forcarValorAtual = useCallback((id: string, valor: number) => {
    setMetas((atual) => forcarValorAtualPura(atual, id, valor));
  }, []);

  return (
    <MetasContext.Provider
      value={{
        metas,
        excluirMeta,
        pausarMeta,
        retomarMeta,
        ajustarAporte,
        editarMeta,
        criarMeta,
        simularDivergencia,
        resolverAjusteDeRota,
        concluirMeta,
        forcarValorAtual,
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
