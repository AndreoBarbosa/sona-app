import type { Meta } from "@/lib/mock-data";

/**
 * Cor por meta — série DETERMINÍSTICA por ORDEM DA CASCATA (posição em
 * `getMetasAtivas()`), nunca por identidade/categoria da meta: a 3ª meta
 * ativa nunca repete a cor da 2ª só porque as duas são "prazo". Com 4 tons
 * ciclando, duas metas adjacentes nunca colidem (a repetição só volta na
 * 5ª posição, nunca na seguinte).
 *
 * Uma meta = uma cor em TODO o app: faixa do plano, bolinha da legenda,
 * barra de progresso do card e tint do badge devem ler daqui, nunca cada
 * tela com seu próprio par sage/coral por categoria (isso é o que causava a
 * 3ª meta repetir a cor da 2ª).
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
  { fill: "bg-sage-400", track: "bg-sage-50", text: "text-sage-500", border: "border-sage-400" }, // 3ª — sage claro
  { fill: "bg-coral-500", track: "bg-coral-50", text: "text-coral-600", border: "border-coral-500" }, // 4ª — coral escuro
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
