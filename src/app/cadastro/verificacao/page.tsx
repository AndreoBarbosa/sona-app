"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { marcarOnboardingConcluido } from "@/lib/onboarding";

/**
 * Verificação de e-mail — nó 416:1044, rota /cadastro/verificacao. Sem
 * backend: não existe e-mail de verdade sendo enviado — "Já verifiquei meu
 * e-mail" confirma a conta na hora e entra na Home, "Reenviar e-mail" só dá
 * o retorno visual (toast) que a regra de navegação exige pra toda ação do
 * usuário.
 */
export default function VerificacaoEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificacaoEmailConteudo />
    </Suspense>
  );
}

function VerificacaoEmailConteudo() {
  const router = useRouter();
  const { showToast } = useToast();
  const email = useSearchParams().get("email") || "seu e-mail";

  function confirmar() {
    marcarOnboardingConcluido();
    router.replace("/home");
  }

  return (
    <div className="min-h-screen bg-petroleo-700">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar escuro />

        <div className="px-4 pt-1">
          <BackButton href="/cadastro" />
        </div>

        {/* Logo discreta + ilustração como protagonista (nó 416:1044) —
            inverso da hierarquia de Cadastro/Login: aqui o envelope é o
            destaque, a logo só assina o topo. */}
        <div className="flex flex-col items-center gap-8 px-4 pb-6 pt-4">
          <div className="flex items-center gap-1.5">
            {/* Versão pequena da Logo/simbolo isolado (nó 771:3630) — igual
                a `LogoCompacta`, mas com as próprias medidas desde o início:
                sobrepor className num componente com h-10/w-16 fixos de
                base é instável (a especificidade do Tailwind decide por
                propriedade, não por ordem no atributo — testado ao vivo:
                a altura sobrescrevia, a largura não). */}
            <div
              className="inline-flex h-6 w-10 shrink-0 items-center rounded-pill border-2 border-base-50 p-0.5"
              aria-hidden="true"
            >
              <span className="aspect-square h-full rounded-pill bg-base-50" />
            </div>
            {/* Proporção real do wordmark (viewBox 103.755×26.532 ≈ 3,91:1)
                fixada nas duas dimensões — `w-auto` não resolveu a partir
                da altura sozinha neste SVG específico (o `<img>` esticou
                pra 300px de largura), então as duas ficam explícitas aqui. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/decor/sona-wordmark-claro.svg" alt="sona" className="h-3 w-[47px]" />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/decor/ilustracao-verificar-email.svg"
            alt=""
            aria-hidden="true"
            className="w-[92%] h-auto"
          />
        </div>

        <div className="flex flex-1 flex-col gap-9 rounded-t-[24px] bg-base-50 px-4 pb-9 pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                quase lá
              </span>
              <p className="text-[32px] font-extralight leading-[1.1] tracking-[-0.025em] text-ink-primary">
                Verifique seu <span className="text-sage-400">e-mail?</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 text-[12px] leading-[1.5] text-ink-muted">
              <p>
                Enviamos um link de confirmação para
                <br />
                {email}
              </p>
              <p>Verifique sua caixa de entrada e clique no link para ativar sua conta.</p>
            </div>

            <button
              type="button"
              onClick={() => showToast("E-mail reenviado.")}
              className="text-left text-[12px] font-normal leading-[1.5] text-sage-600"
            >
              Reenviar e-mail
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Button variant="tertiary" label="Já verifiquei meu e-mail" fullWidth onClick={confirmar} />
            <p className="text-center text-[14px] font-normal leading-[1.5] text-ink-muted">
              Não recebeu?{" "}
              <button
                type="button"
                onClick={() => showToast("E-mail reenviado.")}
                className="text-sage-600"
              >
                Verifique o spam ou reenvie
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
