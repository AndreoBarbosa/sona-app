import { AjusteDeRotaConfirmacaoClient } from "./confirmacao-client";

export default async function AjusteDeRotaConfirmacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AjusteDeRotaConfirmacaoClient id={id} />;
}
