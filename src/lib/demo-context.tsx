"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { perfil as perfilCanonico, getSobraSemDestino, getMetasAtivas, type Meta, type Perfil } from "@/lib/mock-data";
import { limpar, usePersistedState, CHAVES } from "@/lib/persist";

/**
 * Modo demo — tudo que NÃO é `metas` (que já tem seu próprio Provider em
 * `metas-context.tsx`) mas ainda precisa sobreviver a um refresh: nome da
 * pessoa, os dois estados forçáveis do painel de QA (`/qa`) que não têm
 * mutação "real" em nenhuma tela (histórico vazio, sobra zerada), e a
 * reconciliação automática (ver `useReconciliacaoAutomatica`).
 *
 * "Resetar tudo" é composto de fora (ver `resetarDemoCompleto` em
 * `lib/reset-demo.ts`) — este Provider só sabe resetar o que É dele; juntar
 * com `useMetas().resetarMetas()` é responsabilidade de quem chama os dois.
 */

interface SobraAjusteQA {
  metaId: string;
  delta: number;
}

interface ReconciliacaoState {
  semente: number;
  primeiraMetaCriada: boolean;
  navegacoesDesdePrimeiraMeta: number;
  disparada: boolean;
}

const RECONCILIACAO_INICIAL: ReconciliacaoState = {
  semente: 0,
  primeiraMetaCriada: false,
  navegacoesDesdePrimeiraMeta: 0,
  disparada: false,
};

/** Nº de telas navegadas após a primeira meta antes de a reconciliação
 *  poder disparar — "algumas telas" do briefing, não a primeira seguinte
 *  (senão pareceria reagir diretamente à criação, não um evento espontâneo). */
const TELAS_ATE_ELEGIVEL = 3;
/** Probabilidade de disparo por sessão, uma vez elegível. */
const PROBABILIDADE_DISPARO = 0.4;

interface DemoContextValue {
  perfil: Perfil;
  renomear: (nome: string) => void;
  /** Ids de banco (`lib/bancos.ts`) que a pessoa efetivamente conectou em
   *  /conectar — não existe "conta pré-conectada": começa vazio, só cresce
   *  por uma ação real da pessoa (ou pelo preset de QA). Patrimônio, score
   *  de proteção e a pilha de selos da Home leem daqui, nunca de "todas as
   *  contas do mock". */
  bancosConectados: string[];
  conectarBancos: (ids: string[]) => void;
  historicoForcadoVazio: boolean;
  zerarHistorico: () => void;
  restaurarHistorico: () => void;
  sobraZerada: boolean;
  zerarSobraSemDestino: (metas: Meta[], ajustarAporte: (id: string, novoAporte: number) => void) => void;
  restaurarSobraSemDestino: (metas: Meta[], ajustarAporte: (id: string, novoAporte: number) => void) => void;
  marcarPrimeiraMetaCriada: () => void;
  registrarNavegacao: (metasAtivas: Meta[], simularDivergencia: (id: string, saldoReal: number) => void) => void;
  resetarDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  // `usePersistedState` resolve hidratação + gravação sem a race que existia
  // aqui antes (4 efeitos de leitura + 4 de gravação disputando a mesma
  // montagem) — ver comentário na definição, em lib/persist.ts.
  const [perfil, setPerfil] = usePersistedState<Perfil>(CHAVES.perfil, perfilCanonico);
  const [bancosConectados, setBancosConectados] = usePersistedState<string[]>(CHAVES.bancosConectados, []);
  const [historicoForcadoVazio, setHistoricoForcadoVazio] = usePersistedState(CHAVES.historicoForcadoVazio, false);
  const [sobraAjusteQA, setSobraAjusteQA] = usePersistedState<SobraAjusteQA | null>(CHAVES.sobraAjusteQA, null);
  const [reconciliacao, setReconciliacao] = usePersistedState<ReconciliacaoState>(
    CHAVES.reconciliacao,
    RECONCILIACAO_INICIAL,
  );

  const renomear = useCallback(
    (nome: string) => {
      const limpo = nome.trim();
      if (!limpo) return;
      setPerfil((atual) => ({ ...atual, nome: limpo }));
    },
    [setPerfil],
  );

  const conectarBancos = useCallback(
    (ids: string[]) => setBancosConectados(ids),
    [setBancosConectados],
  );

  const zerarHistorico = useCallback(() => setHistoricoForcadoVazio(true), [setHistoricoForcadoVazio]);
  const restaurarHistorico = useCallback(() => setHistoricoForcadoVazio(false), [setHistoricoForcadoVazio]);

  const zerarSobraSemDestino = useCallback(
    (metas: Meta[], ajustarAporte: (id: string, novoAporte: number) => void) => {
      if (sobraAjusteQA) return; // já zerada
      const sobra = getSobraSemDestino(metas);
      if (sobra <= 0) return;
      const alvo = getMetasAtivas(metas)[0];
      if (!alvo) return;
      ajustarAporte(alvo.id, alvo.aporteMensal + sobra);
      setSobraAjusteQA({ metaId: alvo.id, delta: sobra });
    },
    [sobraAjusteQA, setSobraAjusteQA],
  );

  const restaurarSobraSemDestino = useCallback(
    (metas: Meta[], ajustarAporte: (id: string, novoAporte: number) => void) => {
      if (!sobraAjusteQA) return;
      // `ajustarAporte` recebe o valor ABSOLUTO novo, não um delta — por
      // isso precisa do `aporteMensal` ATUAL da meta pra subtrair o que foi
      // somado no zerar (setar direto pra `-delta` foi o bug real encontrado
      // ao testar isto ao vivo: zerava a meta em vez de devolver o valor
      // original). Se a meta não existe mais (excluída entre zerar/restaurar
      // — é QA, não precisa ser à prova de todo caminho), só limpa o estado.
      const meta = metas.find((m) => m.id === sobraAjusteQA.metaId);
      if (meta) ajustarAporte(meta.id, Math.max(0, meta.aporteMensal - sobraAjusteQA.delta));
      setSobraAjusteQA(null);
    },
    [sobraAjusteQA, setSobraAjusteQA],
  );

  const marcarPrimeiraMetaCriada = useCallback(() => {
    setReconciliacao((atual) =>
      atual.primeiraMetaCriada
        ? atual
        : { ...atual, primeiraMetaCriada: true, semente: Math.random(), navegacoesDesdePrimeiraMeta: 0 },
    );
  }, [setReconciliacao]);

  const registrarNavegacao = useCallback(
    (metasAtivas: Meta[], simularDivergencia: (id: string, saldoReal: number) => void) => {
      // Decisão calculada FORA do updater de setState — `simularDivergencia`
      // é uma chamada com efeito colateral (mexe noutro Context), e um
      // updater funcional pode rodar mais de uma vez (Strict Mode); chamando
      // aqui fora, roda exatamente uma vez por navegação real.
      if (!reconciliacao.primeiraMetaCriada || reconciliacao.disparada) return;

      const navegacoes = reconciliacao.navegacoesDesdePrimeiraMeta + 1;
      if (navegacoes < TELAS_ATE_ELEGIVEL) {
        setReconciliacao((atual) => ({ ...atual, navegacoesDesdePrimeiraMeta: navegacoes }));
        return;
      }

      if (reconciliacao.semente < PROBABILIDADE_DISPARO) {
        const semDivergenciaAinda = metasAtivas.filter((m) => m.saldoReal === undefined);
        const alvo = semDivergenciaAinda[Math.floor(reconciliacao.semente * semDivergenciaAinda.length)];
        if (alvo) {
          // Mismatch pra menos OU pra mais que o reservado — reconciliação
          // não é sempre má notícia. Direção também vem da semente, não de
          // Math.random() de novo, pra continuar determinística na sessão.
          const paraMenos = reconciliacao.semente < PROBABILIDADE_DISPARO / 2;
          const diferenca = Math.round(50 + reconciliacao.semente * 400);
          const saldoReal = paraMenos ? Math.max(0, alvo.valorAtual - diferenca) : alvo.valorAtual + diferenca;
          simularDivergencia(alvo.id, saldoReal);
        }
      }

      setReconciliacao((atual) => ({ ...atual, navegacoesDesdePrimeiraMeta: navegacoes, disparada: true }));
    },
    [reconciliacao, setReconciliacao],
  );

  const resetarDemo = useCallback(() => {
    limpar(CHAVES.perfil);
    limpar(CHAVES.bancosConectados);
    limpar(CHAVES.historicoForcadoVazio);
    limpar(CHAVES.sobraAjusteQA);
    limpar(CHAVES.reconciliacao);
    setPerfil(perfilCanonico);
    setBancosConectados([]);
    setHistoricoForcadoVazio(false);
    setSobraAjusteQA(null);
    setReconciliacao(RECONCILIACAO_INICIAL);
  }, [setPerfil, setBancosConectados, setHistoricoForcadoVazio, setSobraAjusteQA, setReconciliacao]);

  return (
    <DemoContext.Provider
      value={{
        perfil,
        renomear,
        bancosConectados,
        conectarBancos,
        historicoForcadoVazio,
        zerarHistorico,
        restaurarHistorico,
        sobraZerada: sobraAjusteQA !== null,
        zerarSobraSemDestino,
        restaurarSobraSemDestino,
        marcarPrimeiraMetaCriada,
        registrarNavegacao,
        resetarDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoStore() precisa estar dentro de <DemoProvider>");
  return ctx;
}
