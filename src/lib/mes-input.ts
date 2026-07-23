/**
 * Conversão entre `Date` e o formato de `<input type="month">` ("AAAA-MM").
 * Usado por Criar/Editar meta pro campo "Quando quer chegar lá" — isolado
 * aqui porque é formato de INPUT, não um selector de dado (mock-data.ts).
 */
export function dataParaInputMonth(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function inputMonthParaData(valor: string): Date | null {
  if (!valor) return null;
  const [ano, mes] = valor.split("-").map(Number);
  if (!ano || !mes) return null;
  return new Date(ano, mes - 1, 1);
}
