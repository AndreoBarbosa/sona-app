"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { AuthHeader } from "@/components/ui/auth-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { useAuth, emailValido } from "@/lib/auth-context";

/**
 * Cadastro — nó 807:3908 (preenchido: 819:3947), rota /cadastro. Sem
 * backend: qualquer nome + e-mail em formato válido + senha com confirmação
 * batendo cria a conta. O botão "Criar conta" fica desabilitado (mesmo
 * tratamento visual do nó — coral a 32%) até o formulário ser válido; é a
 * validação silenciosa, sem alarme, pedida no briefing — não existe estado
 * de erro pra Cadastro no arquivo Figma, então nenhuma copy foi inventada
 * pra isso.
 *
 * O nó de origem tem 2 inputs de senha sob o rótulo "Senha" (repetido, sem
 * um segundo rótulo "Confirmar senha") — mesma classe de bug de cópia já
 * corrigida antes neste projeto (ver DECISOES.md). Corrigido aqui: segundo
 * rótulo "Confirmar senha" adicionado.
 */
export default function CadastroPage() {
  const router = useRouter();
  const { cadastrar } = useAuth();
  const { showToast } = useToast();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const valido = useMemo(
    () => nome.trim().length > 0 && emailValido(email) && senha.length >= 6 && senha === confirmarSenha,
    [nome, email, senha, confirmarSenha],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valido) return;
    cadastrar(nome.trim(), email.trim());
    router.push(`/cadastro/verificacao?email=${encodeURIComponent(email.trim())}`);
  }

  function loginSocial(provedor: string) {
    showToast(`Login com ${provedor} não faz parte deste case.`);
  }

  return (
    <div className="min-h-screen bg-petroleo-700">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar escuro />

        <div className="px-4 pt-1">
          <BackButton href="/login" />
        </div>

        <AuthHeader
          headline={
            <>
              Cria <span className="text-sage-400">conta</span> ?
            </>
          }
        />

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-8 rounded-t-[24px] bg-base-50 px-4 pb-9 pt-6"
        >
          <div className="flex flex-col gap-6">
            <p className="text-[24px] font-normal leading-[1.2] tracking-[-0.48px] text-ink-primary">Cadastro</p>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-medium leading-[1.4] text-black">Nome</span>
                <Input
                  placeholder="digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="name"
                  aria-label="Nome"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-medium leading-[1.4] text-black">Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-label="Email"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-medium leading-[1.4] text-black">Senha</span>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="new-password"
                  aria-label="Senha"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-medium leading-[1.4] text-black">Confirmar senha</span>
                <Input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  aria-label="Confirmar senha"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Button type="submit" variant="tertiary" label="Criar conta" fullWidth disabled={!valido} />

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
          </div>
        </form>
      </div>
    </div>
  );
}
