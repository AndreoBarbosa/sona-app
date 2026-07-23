/**
 * Ícones de categoria pro badge HERO de Diagnóstico / Categoria — mesmo
 * glifo dos assets `/icons/cat-*.svg` (nós 611:19xx), mas sem o retângulo de
 * fundo embutido no asset (o wrapper do badge já fornece o fundo) e com as
 * duas cores parametrizadas: `corPrincipal` (o glifo) e `corFundo` (os
 * "recortes" internos — janela do carro, miolo do dado — que no asset
 * original usam a MESMA cor do fundo pra simular vazado; aqui precisam
 * acompanhar o fundo de quem usa, senão o recorte vira uma mancha sólida).
 *
 * Uso ÚNICO: o badge hero (petróleo #0C1A22 sólido, glifo off-white
 * #FAFAF8) — DECISOES.md trava isso como destaque exclusivo, nunca repetido
 * em lista. As listas (Diagnóstico, Histórico) continuam usando os
 * `<img src="/icons/cat-*.svg">` originais, tonais, sem relação com este
 * arquivo.
 */

export interface CategoriaHeroIconProps {
  className?: string;
  corPrincipal?: string;
  corFundo?: string;
}

export function IconCategoriaAlimentacaoHero({
  className,
  corPrincipal = "#FAFAF8",
}: CategoriaHeroIconProps) {
  return (
    <svg viewBox="0 0 74 74" fill="none" className={className} aria-hidden="true">
      <path d="M32.7803 19.4721C32.7803 18.5143 32.0038 17.7377 31.046 17.7377C30.0881 17.7377 29.3116 18.5143 29.3116 19.4721V29.8784C29.3116 30.8362 30.0881 31.6127 31.046 31.6127C32.0038 31.6127 32.7803 30.8362 32.7803 29.8784V19.4721Z" fill={corPrincipal} />
      <path d="M39.1398 19.4721C39.1398 18.5143 38.3633 17.7377 37.4054 17.7377C36.4476 17.7377 35.6711 18.5143 35.6711 19.4721V29.8784C35.6711 30.8362 36.4476 31.6127 37.4054 31.6127C38.3633 31.6127 39.1398 30.8362 39.1398 29.8784V19.4721Z" fill={corPrincipal} />
      <path d="M45.4993 19.4721C45.4993 18.5143 44.7228 17.7377 43.7649 17.7377C42.807 17.7377 42.0305 18.5143 42.0305 19.4721V29.8784C42.0305 30.8362 42.807 31.6127 43.7649 31.6127C44.7228 31.6127 45.4993 30.8362 45.4993 29.8784V19.4721Z" fill={corPrincipal} />
      <path d="M42.6085 29.3002H32.2022C30.6058 29.3002 29.3116 30.5944 29.3116 32.1909C29.3116 33.7873 30.6058 35.0815 32.2022 35.0815H42.6085C44.2049 35.0815 45.4991 33.7873 45.4991 32.1909C45.4991 30.5944 44.2049 29.3002 42.6085 29.3002Z" fill={corPrincipal} />
      <path d="M39.487 34.8503C39.487 33.7009 38.5552 32.7691 37.4057 32.7691C36.2563 32.7691 35.3245 33.7009 35.3245 34.8503V54.9691C35.3245 56.1185 36.2563 57.0503 37.4057 57.0503C38.5552 57.0503 39.487 56.1185 39.487 54.9691V34.8503Z" fill={corPrincipal} />
    </svg>
  );
}

export function IconCategoriaTransporteHero({
  className,
  corPrincipal = "#FAFAF8",
  corFundo = "#0C1A22",
}: CategoriaHeroIconProps) {
  return (
    <svg viewBox="0 0 74 74" fill="none" className={className} aria-hidden="true">
      <path d="M42.7812 24.2812H31.2187C27.3872 24.2812 24.2812 27.3872 24.2812 31.2187V33.5312C24.2812 37.3627 27.3872 40.4687 31.2187 40.4687H42.7812C46.6127 40.4687 49.7187 37.3627 49.7187 33.5312V31.2187C49.7187 27.3872 46.6127 24.2812 42.7812 24.2812Z" fill={corPrincipal} />
      <path d="M48.5626 34.6875H25.4376C21.6061 34.6875 18.5001 37.7935 18.5001 41.625V42.7812C18.5001 46.6127 21.6061 49.7187 25.4376 49.7187H48.5626C52.3941 49.7187 55.5001 46.6127 55.5001 42.7812V41.625C55.5001 37.7935 52.3941 34.6875 48.5626 34.6875Z" fill={corPrincipal} />
      <path d="M41.625 28.9062H32.375C30.4593 28.9062 28.9063 30.4592 28.9063 32.375C28.9063 34.2907 30.4593 35.8437 32.375 35.8437H41.625C43.5408 35.8437 45.0938 34.2907 45.0938 32.375C45.0938 30.4592 43.5408 28.9062 41.625 28.9062Z" fill={corFundo} />
      <path d="M27.7499 57.2344C30.6235 57.2344 32.9531 54.9048 32.9531 52.0312C32.9531 49.1576 30.6235 46.8281 27.7499 46.8281C24.8763 46.8281 22.5468 49.1576 22.5468 52.0312C22.5468 54.9048 24.8763 57.2344 27.7499 57.2344Z" fill={corPrincipal} />
      <path d="M46.2501 57.2344C49.1237 57.2344 51.4532 54.9048 51.4532 52.0312C51.4532 49.1576 49.1237 46.8281 46.2501 46.8281C43.3764 46.8281 41.0469 49.1576 41.0469 52.0312C41.0469 54.9048 43.3764 57.2344 46.2501 57.2344Z" fill={corPrincipal} />
      <path d="M27.7503 53.8814C28.772 53.8814 29.6003 53.0531 29.6003 52.0314C29.6003 51.0097 28.772 50.1814 27.7503 50.1814C26.7286 50.1814 25.9003 51.0097 25.9003 52.0314C25.9003 53.0531 26.7286 53.8814 27.7503 53.8814Z" fill={corFundo} />
      <path d="M46.2501 53.8814C47.2718 53.8814 48.1001 53.0531 48.1001 52.0314C48.1001 51.0097 47.2718 50.1814 46.2501 50.1814C45.2283 50.1814 44.4001 51.0097 44.4001 52.0314C44.4001 53.0531 45.2283 53.8814 46.2501 53.8814Z" fill={corFundo} />
    </svg>
  );
}

export function IconCategoriaComprasHero({
  className,
  corPrincipal = "#FAFAF8",
}: CategoriaHeroIconProps) {
  return (
    <svg viewBox="0 0 74 74" fill="none" className={className} aria-hidden="true">
      <path
        d="M30.0624 30.0625V26.5938C30.0624 24.7538 30.7933 22.9893 32.0943 21.6882C33.3953 20.3872 35.1599 19.6563 36.9999 19.6563C38.8398 19.6563 40.6044 20.3872 41.9054 21.6882C43.2065 22.9893 43.9374 24.7538 43.9374 26.5938V30.0625"
        stroke={corPrincipal}
        strokeWidth={4.4558}
        strokeLinecap="round"
      />
      <path d="M45.0936 30.0625H28.9061C25.7132 30.0625 23.1248 32.6508 23.1248 35.8437V49.7187C23.1248 52.9116 25.7132 55.5 28.9061 55.5H45.0936C48.2865 55.5 50.8748 52.9116 50.8748 49.7187V35.8437C50.8748 32.6508 48.2865 30.0625 45.0936 30.0625Z" fill={corPrincipal} />
    </svg>
  );
}

export function IconCategoriaJogosHero({
  className,
  corPrincipal = "#FAFAF8",
  corFundo = "#0C1A22",
}: CategoriaHeroIconProps) {
  return (
    <svg viewBox="0 0 74 74" fill="none" className={className} aria-hidden="true">
      <path d="M45.6718 27.75H28.328C22.2615 27.75 17.3437 32.6679 17.3437 38.7344C17.3437 44.8009 22.2615 49.7188 28.328 49.7188H45.6718C51.7383 49.7188 56.6562 44.8009 56.6562 38.7344C56.6562 32.6679 51.7383 27.75 45.6718 27.75Z" fill={corPrincipal} />
      <path d="M33.8783 36.4219H27.4033C26.3177 36.4219 25.4376 37.3019 25.4376 38.3875C25.4376 39.4731 26.3177 40.3531 27.4033 40.3531H33.8783C34.9638 40.3531 35.8439 39.4731 35.8439 38.3875C35.8439 37.3019 34.9638 36.4219 33.8783 36.4219Z" fill={corFundo} />
      <path d="M32.6061 35.15C32.6061 34.0645 31.726 33.1844 30.6404 33.1844C29.5549 33.1844 28.6748 34.0645 28.6748 35.15V41.625C28.6748 42.7106 29.5549 43.5907 30.6404 43.5907C31.726 43.5907 32.6061 42.7106 32.6061 41.625V35.15Z" fill={corFundo} />
      <path d="M47.4064 37C48.6835 37 49.7189 35.9647 49.7189 34.6875C49.7189 33.4104 48.6835 32.375 47.4064 32.375C46.1292 32.375 45.0939 33.4104 45.0939 34.6875C45.0939 35.9647 46.1292 37 47.4064 37Z" fill={corFundo} />
      <path d="M43.3595 42.7812C44.6367 42.7812 45.672 41.7459 45.672 40.4687C45.672 39.1916 44.6367 38.1562 43.3595 38.1562C42.0824 38.1562 41.047 39.1916 41.047 40.4687C41.047 41.7459 42.0824 42.7812 43.3595 42.7812Z" fill={corFundo} />
    </svg>
  );
}

export function IconCategoriaFallbackHero({
  className,
  corPrincipal = "#FAFAF8",
  corFundo = "#0C1A22",
}: CategoriaHeroIconProps) {
  return (
    <svg viewBox="0 0 74 74" fill="none" className={className} aria-hidden="true">
      <circle cx="37" cy="30" r="13" fill={corPrincipal} />
      <path d="M27 38L37 58L47 38Z" fill={corPrincipal} />
      <circle cx="37" cy="30" r="5" fill={corFundo} />
    </svg>
  );
}
