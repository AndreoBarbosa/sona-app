"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cx } from "@/lib/cx";
import { marcarOnboardingConcluido } from "@/lib/onboarding";
import { useDemoStore } from "@/lib/demo-context";

/**
 * Onboarding — nós 606:1694 (boas-vindas), 608:1822 (como funciona),
 * 608:1902 (conectar banco). Sem nav bar, sem BackButton próprio — a barra
 * de progresso + "Voltar" das etapas internas já cobrem a navegação; só
 * aparece no primeiro acesso (`onboardingJaConcluido`, checado pela Splash
 * antes de chegar aqui).
 *
 * A pergunta "Como podemos te chamar?" NÃO é uma etapa fixa no início do
 * fluxo — Cadastro já tem campo Nome, e login social simulado
 * (`NomeSocialModal`, em /login e /cadastro) já pergunta na hora do clique;
 * repetir a pergunta aqui pra quem vai por qualquer um desses dois caminhos
 * seria redundante. Ela só aparece como uma 4ª etapa CONDICIONAL, entre
 * "Conectar banco" e a conclusão de fato — e só pra quem chega até lá sem
 * ter passado por nenhum dos dois (`demoStore.nomeConhecido` ainda falso,
 * ver lib/demo-context.tsx). "Já tenho conta" sai do onboarding direto pra
 * /login (nunca alcança essa etapa 4, então nunca a vê). A barra de
 * progresso reflete isso: 3 segmentos quando o nome já é conhecido, 4
 * quando ainda vai ser perguntado — nunca mostra um segmento que o caminho
 * atual não vai visitar.
 *
 * "Pulável": todas as saídas antecipadas já existem nos próprios botões —
 * "Já tenho conta" (Boas-vindas) leva a /login (autenticação real, ver
 * lib/auth-context.tsx), "Fazer isso depois" (Conectar banco) completa o
 * onboarding sem exigir passar pelas telas seguintes, "Pular por agora"
 * (Nome, quando aparece) mantém "Fernanda" como padrão.
 * "Conectar meu banco agora" aparece em DUAS etapas com o mesmo texto de
 * propósito: em Boas-vindas é "sim, quero conectar" (avança pra explicação
 * em "Como funciona" — sem isso essa etapa fica inalcançável, já que "Já
 * tenho conta" pula tudo); em Conectar banco é o commit de fato.
 */

type Etapa = 1 | 2 | 3 | 4;

function OnboardingProgressBar({ etapa, totalEtapas }: { etapa: Etapa; totalEtapas: number }) {
  return (
    <div className="flex h-[3px] w-full items-center gap-1">
      {Array.from({ length: totalEtapas }, (_, i) => i + 1).map((passo) => (
        <div key={passo} className={cx("h-[3px] flex-1 rounded-pill", passo <= etapa ? "bg-petroleo-700" : "bg-base-400")} />
      ))}
    </div>
  );
}

type AcaoPendente = "conectar" | "home" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const { renomear, nomeConhecido } = useDemoStore();
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [acaoPendente, setAcaoPendente] = useState<AcaoPendente>(null);

  const totalEtapas = nomeConhecido ? 3 : 4;

  function concluirEIrParaHome() {
    marcarOnboardingConcluido();
    router.replace("/home");
  }

  function irParaConectar() {
    marcarOnboardingConcluido();
    router.push("/conectar");
  }

  function executarAcaoPendente() {
    if (acaoPendente === "conectar") irParaConectar();
    else concluirEIrParaHome();
  }

  function irApósConectarBanco(acao: "conectar" | "home") {
    if (nomeConhecido) {
      if (acao === "conectar") irParaConectar();
      else concluirEIrParaHome();
      return;
    }
    setAcaoPendente(acao);
    setEtapa(4);
  }

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <OnboardingProgressBar etapa={etapa} totalEtapas={totalEtapas} />

          {etapa === 1 && (
            <EtapaBoasVindas
              onConectarAgora={() => setEtapa(2)}
              onJaTenhoConta={() => router.push("/login")}
            />
          )}
          {etapa === 2 && <EtapaComoFunciona onContinuar={() => setEtapa(3)} onVoltar={() => setEtapa(1)} />}
          {etapa === 3 && (
            <EtapaConectarBanco
              onConectar={() => irApósConectarBanco("conectar")}
              onFazerDepois={() => irApósConectarBanco("home")}
            />
          )}
          {etapa === 4 && (
            <EtapaNome
              onContinuar={(nome) => {
                renomear(nome);
                executarAcaoPendente();
              }}
              onPular={executarAcaoPendente}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function EtapaNome({ onContinuar, onPular }: { onContinuar: (nome: string) => void; onPular: () => void }) {
  const [nome, setNome] = useState("");

  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
            Antes de começar
          </span>
          <p className="text-h2 text-ink-primary">Como podemos te chamar?</p>
          <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">
            Usamos seu nome nas saudações e no seu diagnóstico — nada além disso.
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-medium leading-[1.4] text-black">Nome</span>
          <Input placeholder="digite seu nome" value={nome} onChange={(e) => setNome(e.target.value)} aria-label="Nome" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="tertiary"
          label="Continuar"
          fullWidth
          disabled={nome.trim().length === 0}
          onClick={() => onContinuar(nome.trim())}
        />
        <Button variant="ghost" label="Pular por agora" fullWidth onClick={onPular} />
      </div>
    </div>
  );
}

function EtapaBoasVindas({
  onConectarAgora,
  onJaTenhoConta,
}: {
  onConectarAgora: () => void;
  onJaTenhoConta: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
            Bem-vindo ao sona
          </span>
          <p className="text-h2 text-ink-primary">
            Você sabe quanto ganha. Mas sabe pra onde <span className="text-sage-400">vai?</span>
          </p>
        </div>

        <div className="mx-auto aspect-[342/299] w-full max-w-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/decor/ilustracao-clareza.svg" alt="" aria-hidden="true" className="h-full w-full" />
        </div>

        <p className="text-[14px] font-normal leading-[1.5] text-ink-muted">
          A maioria das pessoas não tem problema com disciplina. Tem problema com clareza. O sona
          transforma suas finanças espalhadas em uma imagem honesta do que você pode fazer.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="primary" label="Conectar meu banco agora" fullWidth onClick={onConectarAgora} />
        <Button variant="ghost" label="Já tenho conta" fullWidth onClick={onJaTenhoConta} />
      </div>
    </div>
  );
}

const PASSOS_COMO_FUNCIONA = [
  { numero: "01", titulo: "Conecte", corpo: "Você conecta o acesso somente leitura ao seu banco. Sem senhas, sem papelada." },
  { numero: "02", titulo: "Análise", corpo: "O sona organiza seus gastos e mapeia padrões reais do seu comportamento." },
  { numero: "03", titulo: "Diagnóstico", corpo: "Você recebe uma imagem honesta do que pode fazer com o que tem." },
];

function EtapaComoFunciona({ onContinuar, onVoltar }: { onContinuar: () => void; onVoltar: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
            Como funciona
          </span>
          <p className="text-h2 text-ink-primary">
            <span className="text-sage-400">Três</span> passos. Clareza real sobre seu dinheiro.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {PASSOS_COMO_FUNCIONA.map((passo) => (
            <div key={passo.numero} className="flex gap-4 rounded-card-lg border border-border bg-white py-[22px] pl-5 pr-6">
              <span className="flex h-[26px] w-11 shrink-0 items-center justify-center rounded-pill bg-petroleo-50 text-[12px] font-medium tracking-[0.01em] text-ink-primary">
                {passo.numero}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-medium leading-[1.4] text-ink-primary">{passo.titulo}</span>
                <p className="text-[12px] font-light leading-[1.5] text-ink-secondary">{passo.corpo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="tertiary" label="Entendi, vamos começar" fullWidth onClick={onContinuar} />
        <Button variant="ghost" label="Voltar" fullWidth onClick={onVoltar} />
      </div>
    </div>
  );
}

const CHECKLIST_CONEXAO = [
  "Conexão segura via Open Finance",
  "Você pode revogar o acesso a qualquer momento",
  "Seus dados não são vendidos a terceiros",
];

function EtapaConectarBanco({ onConectar, onFazerDepois }: { onConectar: () => void; onFazerDepois: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
            Último passo
          </span>
          <p className="text-h2 text-ink-primary">
            Conecte seu banco com <span className="text-sage-400">segurança</span>.
          </p>
        </div>

        <div className="mx-auto aspect-[342/299] w-full max-w-[280px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/decor/ilustracao-conexao.svg" alt="" aria-hidden="true" className="h-full w-full" />
        </div>

        <div className="flex flex-col gap-3">
          {CHECKLIST_CONEXAO.map((item) => (
            <div key={item} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-check-sage.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="text-[12px] font-normal leading-[1.5] text-ink-secondary">{item}</span>
            </div>
          ))}
        </div>

        <div className="rounded-card-lg bg-petroleo-50 px-4 py-4">
          <p className="text-center text-[10px] font-medium leading-[1.5] text-ink-primary">
            Regulado pelo Banco Central do Brasil · Resolução Conjunta nº 1/2020
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="primary" label="Conectar meu banco agora" fullWidth onClick={onConectar} />
        <Button variant="ghost" label="Fazer isso depois" fullWidth onClick={onFazerDepois} />
      </div>
    </div>
  );
}
