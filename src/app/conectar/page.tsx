"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { BANCOS } from "@/lib/bancos";

/**
 * Conexão com o Banco — nó 778:4585, rota /conectar. Primeira tela do fluxo
 * de Open Finance (Open Finance → Diagnóstico → Plano → Meta →
 * Acompanhamento — NUNCA invertida). Chega aqui a partir do "Conectar meu
 * banco agora" da Etapa 3 do onboarding.
 *
 * "Ver todos os +200 bancos suportados" vira texto informativo, não link —
 * não existe uma tela de lista completa de bancos pra apontar (regra: nenhum
 * link morto).
 */
export default function ConectarPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [bancoSelecionado, setBancoSelecionado] = useState<string | null>(null);

  const bancosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return BANCOS;
    return BANCOS.filter((b) => b.nome.toLowerCase().includes(termo));
  }, [busca]);

  function continuar() {
    if (!bancoSelecionado) return;
    router.push(`/conectar/permissoes?banco=${bancoSelecionado}`);
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-8 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-6">
            <BackButton href="/home" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                Conecte seu banco
              </span>
              <p className="text-h2 text-ink-primary">
                Com qual banco você quer <span className="text-sage-400">começar</span>?
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex h-12 items-center gap-3 rounded-card border border-border bg-white pl-4 pr-4">
              <svg viewBox="0 0 18 18" className="h-[18px] w-[18px] shrink-0 text-ink-muted" aria-hidden="true">
                <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12.7" y1="12.7" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar banco ou fintech..."
                className="w-full bg-transparent text-[12px] font-light leading-[1.5] text-ink-primary outline-none placeholder:text-ink-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {bancosFiltrados.map((banco) => {
                const ativo = banco.id === bancoSelecionado;
                return (
                  <button
                    key={banco.id}
                    type="button"
                    onClick={() => setBancoSelecionado(banco.id)}
                    aria-pressed={ativo}
                    className={cx(
                      "flex h-[53px] items-center gap-2 rounded-card border bg-white px-3 transition-colors duration-rapido ease-padrao",
                      ativo ? "border-petroleo-700" : "border-border",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banco.logo} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
                    <span className="text-[12px] font-normal leading-[1.5] text-ink-primary">{banco.nome}</span>
                  </button>
                );
              })}
            </div>

            {bancosFiltrados.length === 0 && (
              <p className="text-[12px] font-light leading-[1.5] text-ink-muted">Nenhum banco encontrado com esse nome.</p>
            )}

            <p className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400">
              Também suportamos mais de 200 bancos e fintechs.
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <div className="rounded-card-lg bg-base-200 px-4 py-4">
              <p className="text-center text-[10px] font-medium leading-[1.5] text-ink-secondary">
                Conexão regulada pelo Open Finance · Banco Central do Brasil
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="primary" label="Continuar" fullWidth disabled={!bancoSelecionado} onClick={continuar} />
              <Button variant="ghost" label="Fazer isso depois" fullWidth onClick={() => router.push("/home")} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
