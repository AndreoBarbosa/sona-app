"use client";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { formatBRL, type Meta } from "@/lib/mock-data";

/**
 * Modal de exclusão — construído sobre `ConfirmationModal` (nó 1052:2492,
 * "Excluir a Viagem?", variante própria com ilustração círculo coral + X
 * branco). `perigo` liga essa ilustração E a borda coral-50 do nó.
 *
 * Um único destaque em sage no corpo, na consequência principal (o aporte
 * mensal — não o valor já guardado — é o que "volta pra sua sobra").
 * Vocabulário travado: "sem destino" / "sua sobra", nunca "sobra livre".
 * Cita os DOIS efeitos (valor guardado perde destino + aporte mensal volta),
 * copy mantida como está — mais completa que a copy literal do nó do Figma.
 *
 * Sem exceção pra Reserva (ver DECISOES.md, "Consistência estrutural das
 * metas" — revoga a proteção que existiu aqui antes). A única diferença é de
 * CONTEÚDO: SÓ pra Reserva de emergência (id, não `categoria`), uma segunda
 * linha informa — nunca impede — que o valor já guardado continua intacto
 * na conta real, já que a exclusão só tira a meta do plano (alocação
 * virtual). É id e não categoria de propósito: desde que Criar meta deriva
 * `categoria` do ÍCONE escolhido (`categoriaPorIcone`), qualquer meta nova
 * com ícone reserva/aposentadoria também cai em `categoria === "reserva"` —
 * usar categoria aqui vazaria essa copy pra metas que não são A Reserva.
 */

export interface ExcluirMetaModalProps {
  meta: Meta;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ExcluirMetaModal({ meta, onConfirmar, onCancelar }: ExcluirMetaModalProps) {
  const isReserva = meta.id === "meta-reserva";

  return (
    <ConfirmationModal
      perigo
      title={`Excluir ${meta.titulo}?`}
      description={
        <>
          <p>
            Os <span className="font-medium text-ink-primary">{formatBRL(meta.valorAtual)}</span> já reservados
            deixam de ter destino, e os{" "}
            <span className="font-medium text-ink-primary">{formatBRL(meta.aporteMensal)}/mês</span>{" "}
            <span className="font-medium text-sage-600">voltam para a sua sobra</span>. A meta e o histórico serão
            removidos.
          </p>
          {isReserva && (
            <p className="text-ink-muted">
              Sua reserva de proteção sai do plano. Os {formatBRL(meta.valorAtual)} já guardados continuam na sua
              conta.
            </p>
          )}
        </>
      }
      confirmLabel="Excluir meta"
      onConfirm={onConfirmar}
      dismissLabel="Cancelar"
      onDismiss={onCancelar}
    />
  );
}
