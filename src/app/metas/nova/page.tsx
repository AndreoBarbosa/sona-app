"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBar } from "@/components/ui/status-bar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MetaIconePicker } from "@/components/ui/meta-icone-picker";
import { MetaChegadaCard } from "@/components/meta-chegada-card";
import { DivisaoDaSobraEditor } from "@/components/divisao-da-sobra";
import { useMetas } from "@/lib/metas-context";
import { dataParaInputMonth, inputMonthParaData } from "@/lib/mes-input";
import { cx } from "@/lib/cx";
import {
  calcularChegada,
  categoriaPorIcone,
  getMetasAtivas,
  getSobraTotal,
  getSobraSemDestino,
  getMetaPorId,
  formatBRL,
  META_ICONES,
  type MetaIconeId,
} from "@/lib/mock-data";

/**
 * Etapa 0 (template picker) — nó 617:1867 ("Seleção de primeira meta"). Só
 * aparece quando chega via `?primeiraMeta=1` (a partir de
 * /diagnostico/resultado, primeiro diagnóstico — nunca oferecida antes
 * disso, regra da jornada). Reusa os MESMOS 9 badges/labels de
 * `META_ICONES` — nunca uma segunda fonte pros mesmos ícones — corrigindo
 * dois bugs de copy do Figma de origem: "Personalizar objetivo" usava o
 * termo banido "objetivo" (META_ICONES já resolve isso: "Personalizar
 * meta"), e o card "Financiar imóvel" descrevia "comprar um carro"
 * (copy-colado do card de carro).
 */
const DESCRICAO_TEMPLATE: Record<MetaIconeId, string> = {
  investir: "Fazer seu dinheiro render a longo prazo.",
  dividas: "Sair do vermelho de uma vez.",
  reserva: "Guardar o equivalente a alguns meses de gastos.",
  aposentadoria: "Reserva pra uma vida tranquila lá na frente.",
  viagem: "Guardar dinheiro pra viajar.",
  intercambio: "Guardar dinheiro pra estudar fora do país.",
  imovel: "Guardar dinheiro pra dar entrada num imóvel.",
  carro: "Guardar dinheiro pra comprar um carro.",
  personalizado: "Nomeie sua meta do jeito que quiser.",
};

/**
 * Metas / Nova meta — nó 693:2211 ("Nova meta — configurar"), rota
 * /metas/nova. Quatro etapas (mais a Etapa 0 opcional, ver acima):
 *   1) Nome + ícone — reusa `MetaIconePicker`, o MESMO componente do
 *      "Trocar" em Editar meta (regra travada: nunca dois seletores
 *      paralelos pro mesmo dado).
 *   2) Valor alvo + quando quer chegar lá, com `MetaChegadaCard` — modelo de
 *      cálculo INVERTIDO (`calcularChegada`): o usuário informa valor + data,
 *      o app deriva o aporte, nunca o contrário. O botão "Criar meta" NUNCA
 *      fica bloqueado por falta de capacidade — o card de insight já avisa
 *      sem culpa nem alarme (ver `MetaChegadaCard`), o app nunca impede a
 *      criação por causa disso.
 *   3) Divisão da sobra — SÓ aparece se já existe outra meta ativa (a sobra
 *      precisa ser repartida entre elas); reusa `DivisaoDaSobraEditor`, o
 *      MESMO editor de `/metas/divisao` (regra travada: nunca duas
 *      implementações da mesma tela). Se esta é a PRIMEIRA meta do usuário,
 *      pula direto pra etapa 4 — não há com o que repartir. É também aqui
 *      que o caso "aporte necessário > sobra sem destino" se resolve: em vez
 *      de bloquear a criação, o fluxo LEVA pra esta etapa, onde o
 *      trade-off entre metas pode ser resolvido nos sliders.
 *   4) Modal de conclusão (Nível 1, nós 732:2724 "aceitou a proposta" /
 *      848:3544 "ajustou manualmente" — as duas variantes compartilham o
 *      mesmo título "Meta criada." no Figma; a diferença vive só no corpo).
 *      Sem etapa 3 (primeira meta), o corpo é o mais simples dos três.
 *      Botões sempre: "Ver minha meta" → /metas/[id] · "Voltar pra Home" → /.
 */
export default function NovaMetaPage() {
  return (
    <Suspense fallback={null}>
      <NovaMetaConteudo />
    </Suspense>
  );
}

function NovaMetaConteudo() {
  const router = useRouter();
  const { metas, criarMeta, ajustarAporte } = useMetas();
  const primeiraMeta = useSearchParams().get("primeiraMeta") === "1";

  const [etapa, setEtapa] = useState<0 | 1 | 2 | 3>(primeiraMeta ? 0 : 1);
  const [templateSelecionado, setTemplateSelecionado] = useState<MetaIconeId | null>(null);
  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState<MetaIconeId>("investir");
  const [valorAlvoTexto, setValorAlvoTexto] = useState("");
  const [dataAlvoTexto, setDataAlvoTexto] = useState(() => {
    const daquiUmAno = new Date();
    daquiUmAno.setMonth(daquiUmAno.getMonth() + 12);
    return dataParaInputMonth(daquiUmAno);
  });
  const [novaMetaId, setNovaMetaId] = useState<string | null>(null);
  const [conclusao, setConclusao] = useState<"simples" | "aceitar" | "salvar" | null>(null);
  const [aportesFinais, setAportesFinais] = useState<Record<string, number>>({});

  const nomeValido = nome.trim().length > 0;

  const valorAlvo = Number(valorAlvoTexto.replace(/\D/g, "")) || 0;
  const dataAlvo = inputMonthParaData(dataAlvoTexto);
  const sobraDisponivel = getSobraSemDestino(metas);
  const resultado = calcularChegada(0, valorAlvo, dataAlvo, sobraDisponivel);

  const hoje = new Date();
  const dataNoFuturo =
    !!dataAlvo &&
    (dataAlvo.getFullYear() > hoje.getFullYear() ||
      (dataAlvo.getFullYear() === hoje.getFullYear() && dataAlvo.getMonth() > hoje.getMonth()));

  const valorAlvoValido = valorAlvo > 0;
  const podeCriar = valorAlvoValido && dataNoFuturo;

  const novaMeta = novaMetaId ? getMetaPorId(novaMetaId, metas) : undefined;
  const metasAtivasParaDivisao = getMetasAtivas(metas);
  const sobraTotal = getSobraTotal();

  function voltar() {
    if (etapa === 2) {
      // Veio da Etapa 0 direto (todo template exceto "Personalizar meta"
      // pula a Etapa 1) — voltar tem que desfazer esse pulo também, senão
      // cai numa Etapa 1 que a pessoa nunca viu.
      setEtapa(primeiraMeta && icone !== "personalizado" ? 0 : 1);
    } else if (etapa === 1) {
      if (primeiraMeta) {
        setEtapa(0);
      } else {
        router.push("/metas");
      }
    } else if (etapa === 0) {
      router.push("/diagnostico/resultado");
    }
    // Etapa 3 (divisão) não tem volta — a meta já foi criada nesse ponto.
  }

  function irParaEtapa2() {
    if (!nomeValido) return;
    setEtapa(2);
  }

  function confirmarTemplate() {
    if (!templateSelecionado) return;
    setIcone(templateSelecionado);
    if (templateSelecionado === "personalizado") {
      // "Nomeie sua meta do jeito que quiser" — precisa da Etapa 1 de
      // verdade pra digitar o nome, não faz sentido pré-preencher.
      setNome("");
      setEtapa(1);
    } else {
      setNome(META_ICONES[templateSelecionado].label);
      setEtapa(2);
    }
  }

  function criar() {
    if (!podeCriar) return;

    const outrasAtivas = getMetasAtivas(metas);
    const id = criarMeta({
      titulo: nome.trim(),
      icone,
      categoria: categoriaPorIcone(icone),
      valorAlvo,
      aporteMensal: resultado.aporteFinal,
    });
    setNovaMetaId(id);

    if (outrasAtivas.length > 0) {
      // Já existe outra meta ativa: a sobra precisa ser repartida entre
      // elas — inclusive quando o aporte necessário não coube no teto
      // (resultado.cabeNoPlano === false), é aqui que esse trade-off se
      // resolve, nunca bloqueando a criação em si.
      setEtapa(3);
    } else {
      // Primeira meta do usuário: não há com o que repartir, pula direto
      // pra conclusão.
      setConclusao("simples");
    }
  }

  function aceitarSugestao() {
    setConclusao("aceitar");
  }

  function salvarDivisao(aportesEditados: Record<string, number>) {
    for (const m of metasAtivasParaDivisao) {
      const novoValor = aportesEditados[m.id];
      if (novoValor !== undefined && novoValor !== m.aporteMensal) {
        ajustarAporte(m.id, novoValor);
      }
    }
    setAportesFinais(aportesEditados);
    setConclusao("salvar");
  }

  function fecharConclusao(destino: "meta" | "home") {
    setConclusao(null);
    if (destino === "home") {
      router.push("/home");
    } else {
      router.push(novaMetaId ? `/metas/${novaMetaId}` : "/metas");
    }
  }

  const somaEditada = Object.values(aportesFinais).reduce((a, b) => a + b, 0);
  const semDestinoAposSalvar = Math.max(0, sobraTotal - somaEditada);

  return (
    <div className="min-h-screen bg-surface-app">
      <div className="app-scroll mx-auto flex h-screen max-w-mobile flex-col overflow-y-auto">
        <StatusBar />

        <main className="flex flex-1 flex-col gap-6 px-4 pb-10 pt-3">
          <div className="flex flex-col gap-4">
            {etapa !== 3 && <BackButton onClick={voltar} />}
            {etapa === 0 ? (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                  Seu diagnóstico
                </span>
                <p className="text-h1 text-ink-primary">
                  O que você quer <span className="text-sage-400">conquistar</span> primeiro?
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                  Nova meta · Etapa {etapa} de {etapa === 3 ? 3 : "2"}
                </span>
                <p className="text-h2 text-ink-primary">
                  {etapa === 1 ? "Como vamos chamar essa meta?" : etapa === 2 ? "Quanto e quando?" : "Como fica sua sobra?"}
                </p>
              </div>
            )}
          </div>

          {etapa === 0 ? (
            <div className="flex flex-1 flex-col gap-6">
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(META_ICONES) as MetaIconeId[]).map((id) => {
                  const { src, label } = META_ICONES[id];
                  const ativo = id === templateSelecionado;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTemplateSelecionado(id)}
                      aria-pressed={ativo}
                      className={cx(
                        "flex flex-col items-center gap-3 rounded-card border bg-white px-3 py-4 text-center transition-colors duration-rapido ease-padrao",
                        ativo ? "border-petroleo-700 bg-petroleo-50" : "border-border",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" aria-hidden="true" className="h-12 w-12" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-medium leading-none tracking-[0.01em] text-ink-primary">
                          {label}
                        </span>
                        <span className="text-[12px] font-light leading-[1.5] text-ink-muted">
                          {DESCRICAO_TEMPLATE[id]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <Button
                  variant="secondary"
                  label="Confirmar meta"
                  fullWidth
                  disabled={!templateSelecionado}
                  onClick={confirmarTemplate}
                />
                <Button variant="ghost" label="Decidir depois" fullWidth onClick={() => router.push("/home")} />
              </div>
            </div>
          ) : etapa === 1 ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                  Nome da meta
                </span>
                <div className="flex items-center gap-1.5 rounded-card border border-border bg-white px-4 py-3">
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex.: Viagem pra praia"
                    className="w-full bg-transparent text-[14px] font-normal leading-[1.4] text-ink-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                  Ícone
                </span>
                <MetaIconePicker selecionado={icone} onSelecionar={setIcone} />
              </div>

              <Button variant="secondary" label="Continuar" fullWidth disabled={!nomeValido} onClick={irParaEtapa2} />
            </div>
          ) : etapa === 2 ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                    Valor alvo
                  </span>
                  <div className="flex items-center gap-1.5 rounded-card border border-border bg-white px-4 py-3">
                    <span className="text-[14px] font-normal text-ink-muted">R$</span>
                    <input
                      value={valorAlvoTexto}
                      onChange={(e) => setValorAlvoTexto(e.target.value)}
                      inputMode="numeric"
                      className="w-full bg-transparent text-[14px] font-normal leading-[1.4] text-ink-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-medium uppercase leading-none tracking-[0.08em] text-ink-muted">
                    Quando quer chegar lá
                  </span>
                  <div className="flex items-center gap-1.5 rounded-card border border-border bg-white px-4 py-3">
                    <input
                      type="month"
                      value={dataAlvoTexto}
                      onChange={(e) => setDataAlvoTexto(e.target.value)}
                      className="w-full bg-transparent text-[14px] font-normal leading-[1.4] text-ink-primary outline-none"
                    />
                  </div>
                </div>
                {!dataNoFuturo && (
                  <p className="text-[12px] font-normal leading-[1.5] text-coral-500">Escolha uma data no futuro.</p>
                )}
              </div>

              <MetaChegadaCard resultado={resultado} sobraDisponivel={sobraDisponivel} />

              <Button variant="secondary" label="Criar meta" fullWidth disabled={!podeCriar} onClick={criar} />
            </div>
          ) : (
            <DivisaoDaSobraEditor
              metasAtivas={metasAtivasParaDivisao}
              sobraTotal={sobraTotal}
              onAceitar={aceitarSugestao}
              onSalvar={salvarDivisao}
            />
          )}
        </main>
      </div>

      {conclusao && (
        <ConfirmationModal
          title="Meta criada."
          description={
            conclusao === "simples" ? (
              <p>{nome.trim()} já faz parte do seu plano.</p>
            ) : conclusao === "aceitar" ? (
              <p>
                {nome.trim()} entra no seu plano a partir deste mês:{" "}
                {formatBRL(novaMeta?.aporteMensal ?? resultado.aporteFinal)}/mês da sua sobra.
              </p>
            ) : (
              <p>
                Você definiu a divisão. {nome.trim()} entra com{" "}
                {formatBRL(aportesFinais[novaMetaId ?? ""] ?? novaMeta?.aporteMensal ?? resultado.aporteFinal)}/mês
                {semDestinoAposSalvar > 0 ? `, e ${formatBRL(semDestinoAposSalvar)} seguem sem destino.` : "."}
              </p>
            )
          }
          confirmLabel="Ver minha meta"
          onConfirm={() => fecharConclusao("meta")}
          dismissLabel="Voltar pra Home"
          onDismiss={() => fecharConclusao("home")}
        />
      )}
    </div>
  );
}
