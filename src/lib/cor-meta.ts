import type { Meta } from "@/lib/mock-data";

/**
 * Cor por meta — série DETERMINÍSTICA por ORDEM DA CASCATA (posição em
 * `getMetasAtivas()`), nunca por identidade/categoria da meta: a 3ª meta
 * ativa nunca repete a cor da 2ª só porque as duas são "prazo".
 *
 * A série PRECISA de tons genuinamente distintos, não só classes Tailwind
 * distintas — a versão anterior alternava só DUAS matizes (sage/coral) em
 * tons claro/escuro (sage-500 · coral-400 · sage-400 · coral-500), então a
 * 1ª e a 3ª meta liam como "a mesma cor verde" pra quem olha os pontinhos
 * da legenda, mesmo sendo classes CSS diferentes — bug real reportado ao
 * vivo. Com 3 matizes de verdade (sage · coral · petróleo) ciclando, duas
 * metas adjacentes nunca colidem em matiz, só a 4ª repete uma matiz (coral,
 * num tom mais escuro) e mesmo assim nunca fica ao lado da 2ª.
 *
 * Uma meta = uma cor em TODO o app: faixa do plano, bolinha da legenda,
 * barra de progresso do card e tint do badge devem ler daqui, nunca cada
 * tela com seu próprio par sage/coral por categoria.
 */
export interface CorMeta {
  fill: string;
  track: string;
  text: string;
  /** Cor de borda p/ o thumb de slider — classe literal, nunca construída via
   * string (ex. `fill.replace("bg-","border-")`): o scanner do Tailwind só
   * enxerga classes escritas por extenso no código-fonte. */
  border: string;
}

const SERIE: CorMeta[] = [
  { fill: "bg-sage-500", track: "bg-sage-50", text: "text-sage-600", border: "border-sage-500" }, // 1ª — sage
  { fill: "bg-coral-400", track: "bg-coral-50", text: "text-coral-500", border: "border-coral-400" }, // 2ª — coral
  { fill: "bg-petroleo-400", track: "bg-petroleo-50", text: "text-petroleo-600", border: "border-petroleo-400" }, // 3ª — petróleo
  { fill: "bg-coral-600", track: "bg-coral-50", text: "text-coral-700", border: "border-coral-600" }, // 4ª — coral escuro (repete matiz, mas nunca ao lado da 2ª)
];

export const CorMetaSemDestino: CorMeta = {
  fill: "bg-base-400",
  track: "bg-base-100",
  text: "text-ink-muted",
  border: "border-base-400",
};

export function getCorMetaPorIndice(index: number): CorMeta {
  return SERIE[index % SERIE.length];
}

/** `metasAtivas` precisa já vir ordenada por cascata (`getMetasAtivas()`). */
export function getCorMeta(metaId: string, metasAtivas: Pick<Meta, "id">[]): CorMeta {
  const index = metasAtivas.findIndex((m) => m.id === metaId);
  return index === -1 ? CorMetaSemDestino : getCorMetaPorIndice(index);
}
