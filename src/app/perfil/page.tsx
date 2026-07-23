"use client";

import { useState } from "react";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { StatusBar } from "@/components/ui/status-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDemoStore } from "@/lib/demo-context";
import { useResetDemo } from "@/lib/use-reset-demo";
import { contas, type BancoId } from "@/lib/mock-data";

/**
 * Perfil / Visão geral — nó 763:4455, rota /perfil. Não é uma aba da nav bar
 * (o componente "Nav bar" do Figma, nó 692:121, só tem 4 abas — Início,
 * Metas, Diagnóstico, Histórico; Perfil não existe nele). Alcançado pelo
 * ícone de perfil no header da Home, como já era — por isso BackButton
 * (volta pra "/home"), sem AppNavBar.
 *
 * Divergência flagueada: o nó tem DUAS seções tituladas "Privacidade"
 * (confirmado lendo os nós-filho direto, não é erro de leitura) — a segunda
 * na verdade contém as linhas "Notificações" e "Segurança", nada relacionado
 * a privacidade. Parece rótulo duplicado por engano no arquivo de origem.
 * Renomeada aqui pra "Notificações e segurança", que é o que a seção
 * realmente mostra.
 *
 * Regra "nenhum link morto": só "Notificações" (→ /perfil/notificacoes) e o
 * card de Dados pessoais* navegam de verdade. (*este nó específico não tem
 * uma linha "Dados pessoais" na Visão Geral — só as duas telas-filha citadas
 * na tarefa; o link de fato pra /perfil/dados fica na seção Identidade,
 * mas como esse nó não a inclui, a única entrada implementada aqui pra ela
 * é indireta — ver nota abaixo.) Todas as outras linhas ficam visualmente
 * presentes, sem onClick/href — nunca levam a 404.
 */

const BANK_LOGO: Record<BancoId, string> = {
  nubank: "/logos/nubank.svg",
  c6: "/logos/c6.svg",
  bradesco: "/logos/bradesco.svg",
  "mercado-pago": "/logos/mercadopago.svg",
  picpay: "/logos/picpay.svg",
};

export default function PerfilPage() {
  const contasConectadas = contas.filter((c) => c.saldo > 0);
  const { perfil } = useDemoStore();
  const resetarTudo = useResetDemo();
  const [confirmandoReset, setConfirmandoReset] = useState(false);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-9 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            <BackButton href="/home" />
            <p className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">PERFIL</p>

            <Link href="/perfil/dados" className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/decor/avatar-fernanda.png" alt="" aria-hidden="true" className="h-14 w-14 shrink-0 rounded-pill object-cover" />
              <div className="flex flex-col gap-[3px]">
                <span className="text-h3 text-ink-primary">{perfil.nome}</span>
                <span className="text-[12px] font-light leading-[1.5] text-ink-muted">{perfil.email}</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                Contas conectadas
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-card border border-border bg-white px-4 py-3">
                  <div className="flex items-center">
                    {contasConectadas.map((conta, i) => (
                      <span
                        key={conta.id}
                        style={{ marginLeft: i === 0 ? 0 : -8 }}
                        className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-pill border border-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={BANK_LOGO[conta.bancoId]} alt={conta.bancoNome} className="h-full w-full" />
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-light leading-none text-[#4E7A5E]">Conectado · somente leitura</span>
                  <span className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-ink-muted">Gerir →</span>
                </div>
                <span className="w-fit text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400">
                  + Conectar outro banco
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                Privacidade
              </span>
              <Card padding="none">
                <ListRow label="O que o Sona pode ler" description="Saldo, extrato e categorias" end={{ kind: "chevron" }} />
                <ListRow
                  label="Compartilhamento em metas"
                  description="Você controla o que parceiros veem"
                  end={{ kind: "chevron" }}
                />
                <div className="flex w-full items-center justify-between gap-4 px-4 py-[14px] text-left">
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[14px] font-medium leading-[1.4] text-coral-500">Revogar acesso Open Finance</span>
                    <span className="text-[12px] font-normal leading-[1.4] text-ink-muted">Desconecta tudo, imediatamente</span>
                  </div>
                  <span className="shrink-0 text-[14px] leading-[1.4] text-ink-muted">→</span>
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-muted">
                Notificações e segurança
              </span>
              <Card padding="none">
                <Link
                  href="/perfil/notificacoes"
                  className="flex w-full items-center justify-between gap-4 px-4 py-[14px] text-left [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border"
                >
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[14px] font-medium leading-[1.4] text-ink-primary">Notificações</span>
                    <span className="text-[12px] font-normal leading-[1.4] text-ink-muted">Diagnóstico semanal e marcos</span>
                  </div>
                  <span className="shrink-0 text-[14px] leading-[1.4] text-ink-muted">→</span>
                </Link>
                <ListRow label="Segurança" description="Biometria e PIN" end={{ kind: "chevron" }} />
              </Card>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-center text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-600">
              Sair da conta
            </span>
            <button
              type="button"
              onClick={() => setConfirmandoReset(true)}
              className="text-center text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-ink-muted"
            >
              Recomeçar demo
            </button>
          </div>
        </main>
      </div>

      {confirmandoReset && (
        <ConfirmationModal
          title="Recomeçar a demo?"
          description={
            <p>
              Todas as metas, o nome e os estados de teste voltam ao ponto de partida da Fernanda. A demonstração
              recomeça pela tela inicial.
            </p>
          }
          confirmLabel="Recomeçar"
          onConfirm={resetarTudo}
          dismissLabel="Cancelar"
          onDismiss={() => setConfirmandoReset(false)}
          perigo
        />
      )}
    </div>
  );
}
