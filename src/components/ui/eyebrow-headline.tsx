import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * EyebrowHeadline — o par "eyebrow Container" que abre quase toda tela do
 * Perfil/Diagnóstico (nós 1079:2513, 1079:2463 e headline 1079:2515).
 *
 * Eyebrow: 10px Outfit Medium, uppercase, tracking 0.08em, `ink-muted`
 * (#8A8880) — medido do nó real (textStyle "eyebrow Container": fontSize 10,
 * lineHeight 1em, letterSpacing 0.08em). Não bate com o token `eyebrow` da
 * Etapa 1 (tracking 0.18em, de outro nó do Style Guide) — segue o valor
 * literal medido aqui, mesma lógica de fidelidade do Button/Input/ListRow.
 *
 * Headline: 24px Outfit Light, 120%, tracking -0.02em, `ink-primary` — esse
 * já bate 1:1 com o token `h2` da Etapa 1, então usa `text-h2` direto.
 * `size="h1"` (32px ExtraLight, nó 704:2660 "Uma sobra, dois destinos.")
 * usa `text-h1`, que também já bate 1:1 com o token da Etapa 1.
 *
 * `highlight` decompõe a headline pra destacar UMA palavra/trecho em
 * sage (positivo) ou coral (atenção) — reforça a regra de "frase-resposta
 * antes do dado" (ver README): a cor carrega o tom da frase, nunca decora.
 * `headline` aceita `\n` pra quebra de linha explícita (vira `<br/>`).
 */

export interface EyebrowHeadlineProps {
  eyebrow: string;
  headline: string;
  size?: "h1" | "h2";
  highlight?: { word: string; tone: "sage" | "coral" };
  className?: string;
}

const TONE_CLASS = {
  sage: "text-sage-500",
  coral: "text-coral-400",
};

const SIZE_CLASS = {
  h1: "text-h1",
  h2: "text-h2",
};

function renderComQuebras(texto: string): ReactNode {
  const linhas = texto.split("\n");
  return linhas.map((linha, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {linha}
    </span>
  ));
}

function renderHeadline(headline: string, highlight?: EyebrowHeadlineProps["highlight"]): ReactNode {
  if (!highlight) return renderComQuebras(headline);

  const index = headline.indexOf(highlight.word);
  if (index === -1) return renderComQuebras(headline);

  const before = headline.slice(0, index);
  const after = headline.slice(index + highlight.word.length);

  return (
    <>
      {renderComQuebras(before)}
      <span className={TONE_CLASS[highlight.tone]}>{renderComQuebras(highlight.word)}</span>
      {renderComQuebras(after)}
    </>
  );
}

export function EyebrowHeadline({ eyebrow, headline, size = "h2", highlight, className }: EyebrowHeadlineProps) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <p className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">{eyebrow}</p>
      <p className={cx(SIZE_CLASS[size], "text-ink-primary")}>{renderHeadline(headline, highlight)}</p>
    </div>
  );
}
