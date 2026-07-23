/**
 * Ícones da Nav bar — paths extraídos 1:1 dos assets reais do nó 692:121
 * (Figma → nav/inicio, nav/metas - ativo|inativo, nav/diagnostico - inativo,
 * nav/historico - inativo). Nenhum ícone financeiro (sem cifrão/moeda/
 * cofrinho/gráfico-com-seta) — casa, bandeira, linha de pulso e relógio.
 *
 * Só "Metas" tinha um asset "ativo" de verdade no arquivo (o resto só
 * existia no estado inativo, já que só uma aba fica ativa por vez na
 * instância capturada). Pra Início/Diagnóstico/Histórico, o estado ativo
 * reaproveita o mesmo traço (outline) só engrossando o stroke — mesma razão
 * observada no par ativo/inativo do Metas (1.8 → 2.2) — em vez de inventar
 * uma versão "preenchida" que não existe no arquivo. Se o Figma ganhar
 * assets ativos reais para essas três, é só trocar aqui.
 *
 * Cor sempre via `currentColor`: quem usa o ícone controla ativo/inativo
 * setando a cor do texto no elemento pai (ver NavBar).
 */

export interface NavIconProps {
  active?: boolean;
  className?: string;
}

export function IconInicio({ active, className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 22" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3L4 10.2289V17.747C4 18.5823 4.43333 19 5.3 19H18.7C19.5667 19 20 18.5823 20 17.747V10.2289L12 3Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinejoin="round"
      />
      <path
        d="M13 13.0167H11C10.4477 13.0167 10 13.4271 10 13.9333V17.4167C10 17.9229 10.4477 18.3333 11 18.3333H13C13.5523 18.3333 14 17.9229 14 17.4167V13.9333C14 13.4271 13.5523 13.0167 13 13.0167Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
    </svg>
  );
}

export function IconMetas({ active, className }: NavIconProps) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M6.5 3.5V20.5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M6.5 4.5H17.5L14.8 8.5L17.5 12.5H6.5V4.5Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6.5 3.8V20.2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M6.5 4.8H17.2L14.6 8.5L17.2 12.2H6.5V4.8Z" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
    </svg>
  );
}

export function IconDiagnostico({ active, className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 12H8L10.5 6.5L13.5 17.5L16 12H21"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHistorico({ active, className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 20.2C16.5288 20.2 20.2001 16.5287 20.2001 12C20.2001 7.47127 16.5288 3.8 12 3.8C7.47131 3.8 3.80005 7.47127 3.80005 12C3.80005 16.5287 7.47131 20.2 12 20.2Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
      />
      <path
        d="M12 7.8V12L15.2 13.6"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
