"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { AuthHeader } from "@/components/ui/auth-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { marcarOnboardingConcluido } from "@/lib/onboarding";
import { useAuth, emailValido, SENHA_DEMO_INCORRETA } from "@/lib/auth-context";

/**
 * Login — nó 415:924 (preenchido 807:3782 · erro de senha 807:3845 · erro
 * de e-mail 819:3856), rota /login. Sem backend: qualquer e-mail em formato
 * válido com qualquer senha entra — a ÚNICA senha que falha de propósito é
 * `SENHA_DEMO_INCORRETA` (ver lib/auth-context.tsx), pra deixar o estado de
 * erro do Figma alcançável de verdade, mesmo mecanismo do banco Santander em
 * /conectar.
 *
 * Botão "Entrar" troca de variante (não só disabled) porque o nó desabilitado
 * usa a paleta Ghost (cinza), não petróleo translúcido: `ghost` enquanto
 * inválido, `primary` quando o formulário está pronto pra enviar.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);

  const preenchido = email.trim().length > 0 && senha.length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!preenchido) return;

    const emailInvalido = !emailValido(email);
    const senhaIncorreta = senha === SENHA_DEMO_INCORRETA;

    setErroEmail(emailInvalido);
    setErroSenha(!emailInvalido && senhaIncorreta);

    if (emailInvalido || senhaIncorreta) return;

    login(email.trim());
    marcarOnboardingConcluido();
    router.replace("/home");
  }

  function loginSocial(provedor: string) {
    showToast(`Login com ${provedor} não faz parte deste case.`);
  }

  return (
    <div className="min-h-screen bg-petroleo-700">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar escuro />

        <div className="px-4 pt-1">
          <BackButton href="/onboarding" />
        </div>

        <AuthHeader
          headline={
            <>
              <span className="text-base-50">Bem-vindo de</span> volta.
            </>
          }
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-10 rounded-t-[24px] bg-base-50 px-4 pb-9 pt-6"
        >
          <div className="flex flex-col gap-6">
            <p className="text-[24px] font-normal leading-[1.2] tracking-[-0.48px] text-ink-primary">Login</p>

            <div className="flex flex-col items-end gap-3">
              <div className="flex w-full flex-col gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium leading-[1.4] text-black">Email</span>
                  <Input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (erroEmail) setErroEmail(false);
                    }}
                    error={erroEmail}
                    autoComplete="email"
                    aria-label="Email"
                  />
                </label>
                {erroEmail && (
                  <p className="w-full text-center text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400">
                    E-mail inválido. Verifique o formato e tente novamente.
                  </p>
                )}

                <label className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium leading-[1.4] text-black">Senha</span>
                  <Input
                    type="password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      if (erroSenha) setErroSenha(false);
                    }}
                    error={erroSenha}
                    autoComplete="current-password"
                    aria-label="Senha"
                  />
                </label>
                {erroSenha && (
                  <p className="w-full text-center text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400">
                    Senha incorreta. Tente novamente ou redefina sua senha.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => showToast("Recuperação de senha não faz parte deste case.")}
                className="text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-sage-600"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[16px] font-normal leading-[1.6] text-ink-muted">Continuar com</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => loginSocial("Google")}
                  className="flex h-14 flex-1 items-center justify-center gap-3 rounded-button border border-border text-[16px] tracking-[-0.02em] text-ink-primary"
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => loginSocial("Apple")}
                  className="flex h-14 flex-1 items-center justify-center gap-3 rounded-button border border-border text-[16px] tracking-[-0.02em] text-ink-primary"
                >
                  Apple
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pb-3">
              <Button
                type="submit"
                variant={preenchido ? "primary" : "ghost"}
                label="Entrar"
                fullWidth
                disabled={!preenchido}
              />
              <p className="text-center text-[12px] font-normal leading-[1.5] text-ink-muted">
                Ainda não tem conta?{" "}
                <Link href="/cadastro" className="text-coral-400">
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
