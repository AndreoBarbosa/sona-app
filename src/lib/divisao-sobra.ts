import { getDataPrevista, metas as metasSugestao, type Meta } from "@/lib/mock-data";

/**
 * Ajusta o aporte de UMA meta dentro do teto dinâmico (o que sobra depois do
 * que as OUTRAS já ocupam) — única fonte de verdade pro clamp de slider,
 * usada tanto por `/metas/divisao` quanto pela Etapa 3 de Criar meta.
 */
export function aplicarAjusteLocal(
  atual: Record<string, number>,
  metaId: string,
  novoValor: number,
  sobraTotal: number,
): Record<string, number> {
  const somaOutras = Object.entries(atual).reduce((soma, [id, v]) => (id === metaId ? soma : soma + v), 0);
  const teto = Math.max(0, sobraTotal - somaOutras);
  const valor = Math.min(Math.max(0, Math.round(novoValor)), teto);
  return { ...atual, [metaId]: valor };
}

export interface Mudanca {
  titulo: string;
  deltaMeses: number;
  novaData: Date;
}

/**
 * Compara os aportes editados contra a sugestão ORIGINAL do Sona
 * (`metasSugestao`, o array pristine do módulo) pra flagar metas cuja
 * chegada muda de mês. Uma meta recém-criada (ainda não existe em
 * `metasSugestao`) nunca aparece aqui — o card serve pra mostrar o IMPACTO
 * em metas JÁ existentes, não a própria meta sendo criada/ajustada.
 */
export function calcularMudancas(metasAtivas: Meta[], aportesEditados: Record<string, number>): Mudanca[] {
  const mudancas: Mudanca[] = [];
  for (const m of metasAtivas) {
    const valorEditado = aportesEditados[m.id] ?? m.aporteMensal;
    const sugestao = metasSugestao.find((s) => s.id === m.id);
    if (!sugestao || valorEditado === sugestao.aporteMensal) continue;

    const dataEditada = getDataPrevista({ ...m, aporteMensal: valorEditado });
    const dataSugerida = getDataPrevista({ ...m, aporteMensal: sugestao.aporteMensal });
    if (!dataEditada || !dataSugerida) continue;

    const deltaMeses =
      (dataEditada.getFullYear() - dataSugerida.getFullYear()) * 12 + (dataEditada.getMonth() - dataSugerida.getMonth());
    if (deltaMeses === 0) continue;

    mudancas.push({ titulo: m.titulo, deltaMeses, novaData: dataEditada });
  }
  return mudancas.sort((a, b) => Math.abs(b.deltaMeses) - Math.abs(a.deltaMeses));
}
