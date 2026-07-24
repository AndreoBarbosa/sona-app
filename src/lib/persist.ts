"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

/**
 * Persistência local — modo demo. Cada domínio de estado (metas, perfil,
 * reconciliação...) grava sob sua própria chave, sempre prefixada `sona:v1:`
 * — versionada de propósito: se o formato de algum desses blobs mudar no
 * futuro, basta subir pra `sona:v2:` que sessões antigas somem sozinhas em
 * vez de quebrar tentando reidratar um formato que não existe mais.
 *
 * SSR-safe: `typeof window === "undefined"` vira no-op (mesma guarda já
 * usada em `lib/onboarding.ts`) — cada Provider ainda começa com o estado
 * canônico no render do servidor e só troca pro valor persistido depois de
 * montado (useEffect), pra nunca divergir do HTML que o servidor mandou.
 */

/**
 * v2: o modelo de dados mudou de fundo (metas começam vazias, bancos
 * conectados viram estado, score passa a derivar do patrimônio) — sessões
 * v1 (inclusive qualquer uma corrompida por bugs já corrigidos) precisam
 * sumir sozinhas em vez de serem reidratadas com um formato que não bate
 * mais com o código atual.
 */
const PREFIXO = "sona:v2:";

export function carregar<T>(chave: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = localStorage.getItem(PREFIXO + chave);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

export function salvar<T>(chave: string, valor: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    // localStorage indisponível (modo privado, cota) — modo demo degrada
    // pra memória, sem quebrar a tela.
  }
}

export function limpar(chave: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIXO + chave);
}

export const CHAVES = {
  metas: "metas",
  perfil: "perfil",
  bancosConectados: "bancos-conectados",
  historicoForcadoVazio: "historico-forcado-vazio",
  sobraAjusteQA: "sobra-ajuste-qa",
  reconciliacao: "reconciliacao",
} as const;

/**
 * `useState` que sobrevive a um refresh, sob a chave dada. Substitui o par
 * manual "efeito de hidratar + efeito de gravar" que cada Provider do modo
 * demo precisaria escrever — e, junto, fecha uma race real que apareceu
 * testando o painel de QA ao vivo: os dois efeitos rodam na MESMA
 * montagem; se o efeito de GRAVAR disparasse com o valor ainda canônico
 * (antes do `setState` do efeito de HIDRATAR ter sido aplicado), ele
 * sobrescrevia o que acabara de ser lido do localStorage — uma divergência
 * simulada sumia sozinha ao trocar de tela. A guarda `primeiraExecucao`
 * pula a gravação na primeira vez que o efeito roda (é sempre a hidratação
 * decidindo, nunca uma gravação); só grava de fato a partir da 2ª vez que
 * `valor` muda — ou seja, numa mudança real, depois da hidratação já ter
 * acontecido.
 */
export function usePersistedState<T>(chave: string, valorInicial: T): [T, Dispatch<SetStateAction<T>>] {
  const [valor, setValor] = useState<T>(valorInicial);
  const primeiraExecucao = useRef(true);

  useEffect(() => {
    const persistido = carregar<T>(chave);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação pós-montagem de um valor que o SSR nunca viu, não sync de sistema externo
    if (persistido !== null) setValor(persistido);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve rodar 1x no mount, `chave` é estável por Provider
  }, []);

  useEffect(() => {
    if (primeiraExecucao.current) {
      primeiraExecucao.current = false;
      return;
    }
    salvar(chave, valor);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `chave` é estável por Provider, incluir geraria um segundo "primeiro efeito" desnecessário
  }, [valor]);

  return [valor, setValor];
}
