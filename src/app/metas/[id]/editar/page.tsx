import { EditarMetaClient } from "./editar-meta-client";

export default async function EditarMetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditarMetaClient id={id} />;
}
