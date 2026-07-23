/**
 * Estado de Onboarding — sem backend/auth neste mock, "primeiro acesso" só
 * existe via localStorage. Fonte única: a Splash lê pra decidir pra onde
 * navegar, o Onboarding escreve ao sair (pular OU concluir) — nenhum outro
 * lugar deve tocar essa chave.
 */
const ONBOARDING_KEY = "sona:onboarding-concluido";

export function onboardingJaConcluido(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_KEY) !== null;
}

export function marcarOnboardingConcluido(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "1");
}

/** "Recomeçar demo" (Perfil) / reset canônico (/qa) — volta ao estado de
 *  primeiro acesso, pra a Splash mandar de novo pro onboarding. */
export function resetarOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_KEY);
}
