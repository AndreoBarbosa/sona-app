"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/**
 * Auth — Cadastro/Login (807:3908, 415:924, file JH7ZB20Ofzt3cgdFnxGrPW).
 * Sem backend: estado vive só na memória da aba (nenhuma chave de
 * localStorage) — recarregar a página desloga, por design deste case.
 *
 * "Qualquer credencial válida entra" (briefing) — validação é só de
 * FORMATO, nunca de identidade real. A única exceção é `SENHA_DEMO_INCORRETA`,
 * um valor reservado que dispara de propósito o estado de erro "Senha
 * incorreta" do nó 807:3845 (mesmo mecanismo de `BANCO_COM_FALHA_ID` em
 * `lib/bancos.ts`: sem esse gatilho, ninguém veria esse estado do Figma
 * rodando de verdade).
 */

export const SENHA_DEMO_INCORRETA = "senha-errada";

export interface AuthUser {
  nome: string;
  email: string;
}

interface AuthContextValue {
  usuario: AuthUser | null;
  login: (email: string) => void;
  cadastrar: (nome: string, email: string) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<AuthUser | null>(null);

  const login = useCallback((email: string) => {
    setUsuario({ nome: email.split("@")[0], email });
  }, []);

  const cadastrar = useCallback((nome: string, email: string) => {
    setUsuario({ nome, email });
  }, []);

  const sair = useCallback(() => setUsuario(null), []);

  return <AuthContext.Provider value={{ usuario, login, cadastrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() precisa estar dentro de <AuthProvider>");
  return ctx;
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * E-mail fabricado pro login social SIMULADO (Google/Apple) — não existe
 * OAuth de verdade, só o nome que a pessoa digitou no modal
 * (`NomeSocialModal`). Vira o "e-mail" da sessão só pra manter a mesma
 * forma de dado (`AuthUser.email`) usada pelo login/cadastro normal.
 */
export function emailSocialSimulado(nome: string, provedor: "Google" | "Apple"): string {
  const slug = nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug || "convidado"}@${provedor === "Google" ? "gmail.com" : "icloud.com"}`;
}
