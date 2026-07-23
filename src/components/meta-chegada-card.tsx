"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useValorAnimado } from "@/lib/use-valor-animado";
import { formatBRL, formatMesAno, type ResultadoChegada } from "@/lib/mock-data";

/**
 * Card de insight de Criar/Editar meta — modelo de cálculo INVERTIDO: o
 * usuário informa valor alvo + quando quer chegar lá, o app DERIVA o
 * aporte. Único componente pros dois fluxos, pra nunca divergirem na conta
 * nem na mensagem (mesmo motivo do seletor de ícone ser um componente só).
 *
 * PRECISA dizer a verdade: nunca afirma que um aporte "cabe" quando na
 * verdade passa da sobra disponível — recalcula ao vivo (`ResultadoChegada`
 * vem de `calcularChegada`, chamado a cada tecla) e mostra a chegada REAL
 * possível nesse ritmo, sem culpa e sem alarme (por isso sempre tone="sage",
 * nunca coral/alerta — só a mensagem muda, nunca o tom visual).
 */
export function MetaChegadaCard({
  resultado,
  sobraDisponivel,
}: {
  resultado: ResultadoChegada;
  sobraDisponivel: number;
}) {
  const aporteAnimado = useValorAnimado(resultado.aporteFinal);

  return (
    <Card tone="sage" padding="none" className="relative flex flex-col gap-1.5 py-4 pl-6 pr-4">
      <span aria-hidden="true" className="absolute left-2 top-4 h-[calc(100%-32px)] w-1 rounded-pill bg-sage-400" />
      <span className="text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-sage-800">
        Chegada estimada
      </span>

      {!resultado.dataValida ? (
        <p className="text-body-sm text-ink-primary">Escolha um valor alvo e quando quer chegar lá.</p>
      ) : resultado.cabeNoPlano ? (
        <p className="text-body-sm text-ink-primary">
          Com <span className="font-medium">{formatBRL(aporteAnimado)}/mês</span>, a chegada é em{" "}
          <span className="font-medium">{resultado.dataRealista ? formatMesAno(resultado.dataRealista) : "—"}</span>.
        </p>
      ) : (
        <>
          <p className="text-body-sm text-ink-primary">
            Para chegar em{" "}
            <span className="font-medium">
              {resultado.dataEscolhida ? formatMesAno(resultado.dataEscolhida) : "—"}
            </span>{" "}
            seriam <span className="font-medium">{formatBRL(resultado.aporteNecessario)}/mês</span>. Sua sobra sem
            destino é de <span className="font-medium">{formatBRL(sobraDisponivel)}</span> — nesse ritmo, a chegada
            seria em{" "}
            <span className="font-medium">{resultado.dataRealista ? formatMesAno(resultado.dataRealista) : "—"}</span>.
          </p>
          <Link
            href="/metas/divisao"
            className="w-fit text-[12px] font-medium leading-[1.5] tracking-[0.01em] text-coral-400"
          >
            Ajustar divisão da sobra →
          </Link>
        </>
      )}
    </Card>
  );
}
