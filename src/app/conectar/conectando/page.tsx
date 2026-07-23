"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { cx } from "@/lib/cx";
import { BANCO_COM_FALHA_ID } from "@/lib/bancos";

/**
 * Conectando — estado que faltava entre Permissões e Sucesso/Erro (previsto
 * na Arquitetura da Informação como "Conectando · Loading", nunca
 * implementado). Sem isso, autorizar as permissões produzia sucesso
 * instantâneo — nenhum trabalho visível, parecia falso.
 *
 * Reaproveita o PADRÃO visual do loading de análise (`/diagnostico/analise`,
 * nó 778:4628) — labels sequenciais sobre fundo escuro — mas deliberadamente
 * mais simples e mais curto: sem porcentagem grande (a análise é "sobre os
 * SEUS DADOS", é o carregamento importante dos dois; conectar é só
 * mecânico, "sobre o BANCO"), ~2s no total. É daqui — não mais do clique em
 * "Autorizar compartilhamento" — que sai o caminho de erro
 * (`BANCO_COM_FALHA_ID`, mesma falha determinística de sempre): a falha
 * acontece DURANTE a conexão, nunca depois dela.
 */

const PASSOS = ["Autenticando com seu banco", "Estabelecendo conexão segura", "Conexão estabelecida"];

const DURACAO_POR_PASSO_MS = 650;

export default function ConectandoPage() {
  return (
    <Suspense fallback={null}>
      <ConectandoConteudo />
    </Suspense>
  );
}

function ConectandoConteudo() {
  const router = useRouter();
  const bancoId = useSearchParams().get("banco");
  const [passoAtual, setPassoAtual] = useState(0);

  useEffect(() => {
    if (passoAtual >= PASSOS.length - 1) {
      const destino = bancoId === BANCO_COM_FALHA_ID ? "/conectar/erro" : "/conectar/sucesso";
      const timeout = setTimeout(() => {
        router.replace(bancoId ? `${destino}?banco=${bancoId}` : destino);
      }, DURACAO_POR_PASSO_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setPassoAtual((p) => p + 1), DURACAO_POR_PASSO_MS);
    return () => clearTimeout(timeout);
  }, [passoAtual, bancoId, router]);

  return (
    <div className="min-h-screen bg-petroleo-700">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar escuro />

        <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-10">
          <span className="flex h-7 items-center justify-center rounded-pill border border-sage-400 px-4 text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-sage-600">
            Conectando
          </span>

          <div className="flex w-full flex-col items-center gap-6 px-6">
            {PASSOS.map((passo, idx) => {
              const concluido = idx < passoAtual || (idx === passoAtual && idx === PASSOS.length - 1);
              const ativo = idx === passoAtual && idx < PASSOS.length - 1;
              return (
                <div key={passo} className="flex w-full items-center gap-2">
                  <span
                    className={cx(
                      "h-2.5 w-2.5 shrink-0 rounded-pill",
                      concluido || ativo ? "bg-sage-400" : "bg-white/20",
                      ativo && "animate-pulse",
                    )}
                  />
                  <span
                    className={cx(
                      "text-[12px] font-normal leading-[1.5]",
                      concluido || ativo ? "text-[#E8EEF2]" : "text-[rgba(232,238,242,0.2)]",
                    )}
                  >
                    {passo}
                  </span>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
