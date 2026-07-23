import { MetaDetalheClient } from "./meta-detalhe-client";

/**
 * Só desembrulha `params` (a Promise assíncrona é uma exigência do App
 * Router pra rotas dinâmicas) — todo o resto mora no client component, que
 * precisa de `useMetas()` (Context) pra reagir a excluir/pausar/retomar.
 */
export default async function MetaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MetaDetalheClient id={id} />;
}
