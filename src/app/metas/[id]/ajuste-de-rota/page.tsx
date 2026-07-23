import { AjusteDeRotaClient } from "./ajuste-de-rota-client";

export default async function AjusteDeRotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AjusteDeRotaClient id={id} />;
}
