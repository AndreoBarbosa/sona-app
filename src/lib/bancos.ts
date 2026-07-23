/**
 * Bancos suportados no fluxo de Open Finance (`/conectar`) — nó 778:4585.
 * Logos reais (baixados do Figma/Simple Icons), nunca placeholder.
 *
 * `BANCO_COM_FALHA_ID` é o único banco com falha DETERMINÍSTICA de conexão
 * — existe só pra exercitar `/conectar/erro` de forma confiável em teste,
 * nunca aleatório (senão o caminho de falha vira sorte, não um cenário
 * reproduzível).
 */
export interface Banco {
  id: string;
  nome: string;
  logo: string;
}

export const BANCOS: Banco[] = [
  { id: "bradesco", nome: "Bradesco", logo: "/logos/bradesco.svg" },
  { id: "nubank", nome: "Nubank", logo: "/logos/nubank.svg" },
  { id: "mercado-pago", nome: "Mercado Pago", logo: "/logos/mercadopago.svg" },
  { id: "santander", nome: "Santander", logo: "/logos/santander.svg" },
  { id: "picpay", nome: "PicPay", logo: "/logos/picpay.svg" },
  { id: "inter", nome: "Inter", logo: "/logos/inter.svg" },
  { id: "banco-do-brasil", nome: "Banco do Brasil", logo: "/logos/banco-do-brasil.svg" },
  { id: "c6", nome: "C6 Bank", logo: "/logos/c6.svg" },
];

export const BANCO_COM_FALHA_ID = "santander";

export function getBancoPorId(id: string | null): Banco | undefined {
  return BANCOS.find((b) => b.id === id);
}
