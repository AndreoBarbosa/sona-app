/**
 * Sona — camada de dados mockados
 * Fonte única de verdade para TODAS as telas. Sem backend, sem API real.
 *
 * Tese que os dados precisam encarnar:
 * - O Sona consolida a vida financeira via Open Finance (contas → patrimônio).
 * - A "sobra" mensal (renda - gastos) é alocada em metas de forma VIRTUAL:
 *   nada sai fisicamente da conta, o Sona só organiza o destino da sobra.
 * - Cascata de prioridade: reserva de emergência primeiro, depois metas com prazo.
 * - Excluir ou concluir uma meta devolve o valor comprometido para a sobra sem destino.
 *   Isso acontece "de graça" aqui: sobra sem destino é sempre DERIVADA da soma dos
 *   aportes das metas com status "ativa" — remover uma meta da lista ativa já
 *   libera o valor, sem precisar reescrever nenhum outro número à mão.
 *
 * Persona: Fernanda Souza.
 */

// ============================================================================
// TIPOS
// ============================================================================

export type BancoId = "nubank" | "c6" | "bradesco" | "mercado-pago" | "picpay";

export interface Conta {
  id: string;
  bancoId: BancoId;
  bancoNome: string;
  apelido: string;
  saldo: number;
}

export type CategoriaId =
  | "alimentacao"
  | "transporte"
  | "compras"
  | "jogos"
  | "outros";

export interface Lancamento {
  id: string;
  estabelecimento: string;
  descricao: string;
  valor: number;
  data: string; // ISO (YYYY-MM-DD)
}

export interface Categoria {
  id: CategoriaId;
  nome: string;
  lancamentos: Lancamento[];
  // valorTotal NÃO existe aqui de propósito — é sempre derivado via
  // getTotalCategoria(categoria), somando os lançamentos. Ver seção Selectors.
}

export type MetaStatus = "ativa" | "pausada" | "concluida" | "excluida";

/**
 * "Ícones de metas" — nó 617:1867 (badges reais, 9 opções, cada um já com
 * seu próprio círculo de fundo embutido no asset). Independente de
 * `categoria` de propósito: o ícone é ESCOLHA do usuário (ver "Trocar" em
 * Editar meta), a categoria é o par sage/proteção vs coral/aspiração que
 * dirige cor de barra/badge — as duas coisas não precisam bater.
 */
export type MetaIconeId =
  | "investir"
  | "dividas"
  | "reserva"
  | "aposentadoria"
  | "viagem"
  | "intercambio"
  | "imovel"
  | "carro"
  | "personalizado";

export const META_ICONES: Record<MetaIconeId, { src: string; label: string }> = {
  investir: { src: "/icons/meta-investir.svg", label: "Investir para o futuro" },
  dividas: { src: "/icons/meta-dividas.svg", label: "Quitar dívidas" },
  reserva: { src: "/icons/meta-reserva.svg", label: "Reserva de emergência" },
  aposentadoria: { src: "/icons/meta-aposentadoria.svg", label: "Aposentadoria" },
  viagem: { src: "/icons/meta-viagem.svg", label: "Fazer uma viagem" },
  intercambio: { src: "/icons/meta-intercambio.svg", label: "Intercâmbio" },
  imovel: { src: "/icons/meta-imovel.svg", label: "Comprar imóvel" },
  carro: { src: "/icons/meta-carro.svg", label: "Comprar carro" },
  personalizado: { src: "/icons/meta-personalizado.svg", label: "Personalizar meta" },
};

/**
 * Deriva a `categoria` (sage/proteção vs coral/aspiração — ver comentário em
 * `MetaIconeId`) a partir do ícone escolhido em Criar meta: reserva e
 * aposentadoria são proteção, o resto é aspiração/prazo. Só usado na
 * CRIAÇÃO — depois disso `categoria` é conteúdo da meta, não recalculada.
 */
export function categoriaPorIcone(icone: MetaIconeId): Meta["categoria"] {
  return icone === "reserva" || icone === "aposentadoria" ? "reserva" : "prazo";
}

export interface Meta {
  id: string;
  titulo: string;
  categoria: "reserva" | "prazo";
  icone: MetaIconeId;
  valorAtual: number;
  valorAlvo: number;
  aporteMensal: number;
  status: MetaStatus;
  /**
   * Prioridade na cascata de alocação da sobra: menor número = prioridade
   * maior. Reserva de emergência é sempre 0. Usado por uma futura função
   * de alocação automática (ver `alocarSobraDisponivel` no fim do arquivo).
   */
  prioridadeCascata: number;
  /** ISO (YYYY-MM-DD). Usado na tela de detalhe ("Criado em ..."). */
  criadoEm: string;
  /**
   * Saldo real da conta pra essa meta, quando DIVERGE de `valorAtual`
   * (reservado) — a "leitura do saldo consolidado" que motiva o Ajuste de
   * rota (`/metas/[id]/ajuste-de-rota`). `undefined` = sem divergência, o
   * normal. Nunca setado por um fluxo real (não há integração bancária) —
   * só por `simularDivergencia`, chamada do gatilho de QA em
   * `/preview/divergencia`. Ver `isMetaDivergente`.
   */
  saldoReal?: number;
  /**
   * Reposição temporária ATIVA (opção "Repor nos próximos meses" do Ajuste
   * de rota): soma `valorExtra` ao `aporteMensal` normal pelos próximos
   * `mesesRestantes` meses — só afeta `getMesesRestantes`/`getDataPrevista`
   * (a previsão de chegada), nunca a alocação da sobra (`aporteMensal` em
   * si não muda, `getSobraSemDestino`/`getTetoAporte` continuam lendo só
   * ele). `undefined` = nenhuma reposição ativa.
   */
  reposicao?: { valorExtra: number; mesesRestantes: number };
  // `dataChegadaEstimada` também não é um campo armazenado — é derivada de
  // valorAtual/valorAlvo/aporteMensal via getDataPrevista(meta). Guardar uma
  // data fixa aqui quebraria assim que o aporte ou o valor atual mudassem.
  //
  // NÃO existe (nem deve voltar a existir) um campo `protegida` aqui. A
  // Reserva de emergência já foi protegida contra exclusão duas vezes nesta
  // sessão e a regra foi REVOGADA (ver DECISOES.md, "Consistência estrutural
  // das metas"): a alocação é virtual e o app é somente leitura — excluir
  // uma meta não destrói patrimônio, só a remove do plano. Toda meta tem as
  // MESMAS ações disponíveis (swipe Editar+Excluir, "Excluir meta" no
  // detalhe); metas só diferem em CONTEÚDO, nunca em estrutura/ações.
}

export interface ScoreSaudeFinanceira {
  /** 0–100. Peso 40%: o quanto a sobra folga em relação à renda. */
  folga: number;
  /** 0–100. Peso 30%: regularidade de renda e gastos ao longo do tempo. */
  estabilidade: number;
  /** 0–100. Peso 30%: cobertura da reserva de emergência e afins. */
  protecao: number;
}

export interface Diagnostico {
  rendaMensal: number;
  scores: ScoreSaudeFinanceira;
}

export interface Perfil {
  nome: string;
  email: string;
  telefoneMascarado: string;
  cpfMascarado: string;
}

// ============================================================================
// DADOS MOCKADOS — Fernanda Souza
// ============================================================================

export const perfil: Perfil = {
  nome: "Fernanda Souza",
  email: "fernanda@email.com",
  telefoneMascarado: "(11) 9****-2231",
  cpfMascarado: "123.***.**9-00",
};

export const diagnostico: Diagnostico = {
  rendaMensal: 5800,
  scores: {
    folga: 75,
    estabilidade: 70,
    // Valor de repouso deste objeto estático — quem lê o score de verdade
    // (Home, Diagnóstico) substitui por `getProtecaoScore(patrimonio,
    // gastoTotal)` a cada render, nunca este literal. Fica 80 aqui só
    // porque é o que os 5 bancos canônicos somados produzem (patrimônio
    // 24.500 → ~84, arredondado pro valor histórico deste case).
    protecao: 80,
  },
};

export const contas: Conta[] = [
  { id: "conta-nubank", bancoId: "nubank", bancoNome: "Nubank", apelido: "Conta principal", saldo: 15800 },
  { id: "conta-c6", bancoId: "c6", bancoNome: "C6 Bank", apelido: "Conta corrente", saldo: 7200 },
  { id: "conta-bradesco", bancoId: "bradesco", bancoNome: "Bradesco", apelido: "Poupança", saldo: 1500 },
  { id: "conta-mp", bancoId: "mercado-pago", bancoNome: "Mercado Pago", apelido: "Carteira digital", saldo: 0 },
  { id: "conta-picpay", bancoId: "picpay", bancoNome: "PicPay", apelido: "Carteira digital", saldo: 0 },
];

export const categorias: Categoria[] = [
  {
    id: "alimentacao",
    nome: "Alimentação",
    lancamentos: [
      { id: "alim-1", estabelecimento: "iFood", descricao: "Delivery", valor: 620, data: "2026-07-03" },
      { id: "alim-2", estabelecimento: "Pão de Açúcar", descricao: "Mercado", valor: 540, data: "2026-07-06" },
      { id: "alim-3", estabelecimento: "Restaurantes", descricao: "Almoços fora", valor: 390, data: "2026-07-10" },
      { id: "alim-4", estabelecimento: "Zé Delivery", descricao: "Bebidas", valor: 210, data: "2026-07-12" },
      { id: "alim-5", estabelecimento: "Padaria", descricao: "Café da manhã", valor: 180, data: "2026-07-14" },
    ],
  },
  {
    id: "transporte",
    nome: "Transporte",
    lancamentos: [
      { id: "transp-1", estabelecimento: "Uber", descricao: "Corridas", valor: 380, data: "2026-07-02" },
      { id: "transp-2", estabelecimento: "Posto Ipiranga", descricao: "Combustível", valor: 320, data: "2026-07-05" },
      { id: "transp-3", estabelecimento: "99", descricao: "Corridas", valor: 150, data: "2026-07-09" },
      { id: "transp-4", estabelecimento: "Estapar", descricao: "Estacionamento", valor: 70, data: "2026-07-11" },
      { id: "transp-5", estabelecimento: "Sem Parar", descricao: "Pedágio", valor: 50, data: "2026-07-13" },
    ],
  },
  {
    id: "compras",
    nome: "Compras",
    lancamentos: [
      { id: "compr-1", estabelecimento: "Amazon", descricao: "Diversos", valor: 320, data: "2026-07-04" },
      { id: "compr-2", estabelecimento: "Shopping Iguatemi", descricao: "Vestuário", valor: 280, data: "2026-07-07" },
      { id: "compr-3", estabelecimento: "Drogasil", descricao: "Farmácia", valor: 150, data: "2026-07-08" },
      { id: "compr-4", estabelecimento: "Livraria Cultura", descricao: "Livros", valor: 90, data: "2026-07-10" },
      { id: "compr-5", estabelecimento: "Mercado Livre", descricao: "Diversos", valor: 130, data: "2026-07-15" },
    ],
  },
  {
    id: "jogos",
    nome: "Jogos",
    lancamentos: [
      { id: "jogo-1", estabelecimento: "Steam", descricao: "Jogo novo", valor: 180, data: "2026-07-01" },
      { id: "jogo-2", estabelecimento: "PlayStation Store", descricao: "DLC", valor: 150, data: "2026-07-06" },
      { id: "jogo-3", estabelecimento: "Xbox Game Pass", descricao: "Assinatura", valor: 60, data: "2026-07-09" },
      { id: "jogo-4", estabelecimento: "Loot box mobile", descricao: "Compra no app", valor: 45, data: "2026-07-12" },
      { id: "jogo-5", estabelecimento: "Ingresso e-sports", descricao: "Evento", valor: 50, data: "2026-07-16" },
    ],
  },
  {
    id: "outros",
    nome: "Outros",
    lancamentos: [
      { id: "outro-1", estabelecimento: "Streaming", descricao: "Assinaturas", valor: 120, data: "2026-07-01" },
      { id: "outro-2", estabelecimento: "Academia", descricao: "Mensalidade", valor: 130, data: "2026-07-05" },
      { id: "outro-3", estabelecimento: "Presente", descricao: "Aniversário", valor: 96, data: "2026-07-08" },
      { id: "outro-4", estabelecimento: "Doação", descricao: "Instituto local", valor: 40, data: "2026-07-11" },
      { id: "outro-5", estabelecimento: "Diversos", descricao: "Não classificado", valor: 100, data: "2026-07-14" },
    ],
  },
];

/**
 * Metas são o que a PESSOA cria, nunca dado pré-carregado — a interface
 * representa exatamente o estado que ela mesma gerou. Estado inicial real
 * do produto é sempre `[]`; as duas metas "maduras" que existiam aqui antes
 * (Reserva + Viagem) viraram só um preset de demonstração — ver
 * `METAS_CENARIO_FERNANDA` — carregável pelo painel de QA (`/qa`), nunca
 * o estado padrão de quem abre o app pela primeira vez.
 */
export const metas: Meta[] = [];

/**
 * Preset "Cenário Fernanda" — duas metas maduras com histórico fictício,
 * carregável em `/qa` pra demonstrar estados que uma conta nova não tem
 * ainda (atividade de vários meses, sobra parcialmente distribuída). São os
 * MESMOS números que já eram canônicos neste projeto antes da mudança pra
 * "conta nova começa zerada" — preservados aqui como o cenário de demo, não
 * mais como o estado inicial.
 */
export const METAS_CENARIO_FERNANDA: Meta[] = [
  {
    id: "meta-reserva",
    titulo: "Reserva de emergência",
    categoria: "reserva",
    icone: "reserva",
    valorAtual: 19500,
    valorAlvo: 30000,
    aporteMensal: 500,
    status: "ativa",
    prioridadeCascata: 0,
    criadoEm: "2025-01-15",
  },
  {
    id: "meta-europa",
    titulo: "Viagem pra Europa",
    categoria: "prazo",
    icone: "viagem",
    valorAtual: 3800,
    valorAlvo: 12000,
    aporteMensal: 200,
    status: "ativa",
    prioridadeCascata: 1,
    criadoEm: "2026-07-01",
  },
];

// ============================================================================
// HELPER DE FORMATAÇÃO
// ============================================================================

const MES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Formato curto travado pra previsão de chegada em toda a UI (ex. "dez
 * 2029"), nunca `toLocaleDateString({ month: "long" })` ("dezembro de
 * 2029") — esse formato longo já existiu solto em mais de um componente
 * (cada um com seu próprio array de meses abreviados, um deles até com
 * separador diferente) até virar um único helper aqui.
 */
export function formatMesAno(data: Date): string {
  return `${MES_ABREV[data.getMonth()]} ${data.getFullYear()}`;
}

/**
 * Forma longa ("dezembro de 2029"), minúscula (encaixa embutida numa frase,
 * ex. "Criado em julho de 2026" ou "Chegada mantida em dezembro de 2029") —
 * exceção deliberada à regra acima. O Figma do Ajuste de rota (nós
 * 734:2808/1043:1991) usa forma longa explicitamente nas duas telas; como
 * ele é fonte de verdade visual, segue o nó aqui, mesmo contrariando o
 * formato curto travado pro resto do app. Pra rótulo solo capitalizado
 * (ex. "Julho" num cabeçalho de lista), capitalize o retorno por fora —
 * este helper nunca capitaliza sozinho.
 */
export function formatMesAnoExtenso(data: Date): string {
  return data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

/** Sem centavos — valores de resumo/headline (ex. "R$ 24.500"). */
export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Com centavos — só para listas de lançamentos (ex. "R$ 620,00"). */
export function formatBRLCents(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ============================================================================
// SELECTORS — todo valor derivado nasce aqui, nunca é escrito à mão
// ============================================================================

/** Soma os lançamentos de uma categoria. Nunca lido de um campo estático. */
export function getTotalCategoria(categoria: Categoria): number {
  return categoria.lancamentos.reduce((soma, l) => soma + l.valor, 0);
}

/** % que uma categoria representa do total gasto no mês. */
export function getPercentualCategoria(categoria: Categoria): number {
  const total = getGastoTotal();
  if (total === 0) return 0;
  return (getTotalCategoria(categoria) / total) * 100;
}

export function getCategoriaComLancamentos(id: CategoriaId): Categoria | undefined {
  return categorias.find((c) => c.id === id);
}

export interface LancamentoComCategoria extends Lancamento {
  categoriaId: CategoriaId;
}

/**
 * Achata os lançamentos de TODAS as categorias numa lista só, com a
 * categoria de origem anexada — é a fonte do Histórico (nó 757:3240), que
 * mistura lançamentos de categorias diferentes num mesmo feed cronológico.
 * Mesma fonte do Diagnóstico (`categorias`), nada duplicado nem inventado:
 * não existe uma entrada de RECEITA aqui porque `diagnostico.rendaMensal`
 * é um escalar do mês, não um lançamento datado.
 */
export function getTodosLancamentos(): LancamentoComCategoria[] {
  return categorias.flatMap((c) => c.lancamentos.map((l) => ({ ...l, categoriaId: c.id })));
}

/** Soma de todas as categorias — é o "Gastos" do diagnóstico. */
export function getGastoTotal(): number {
  return categorias.reduce((soma, c) => soma + getTotalCategoria(c), 0);
}

/** Renda menos gastos. O coração do diagnóstico. */
export function getSobraTotal(): number {
  return diagnostico.rendaMensal - getGastoTotal();
}

/**
 * Contas efetivamente conectadas — `contas` é o catálogo de TODAS as contas
 * que existem no mock (com saldo definido); `bancosConectados` (estado real,
 * escolhido em `/conectar`) é o filtro. Um banco escolhido em `/conectar`
 * que não tem conta correspondente aqui (ex.: Santander, Inter — existem só
 * na grade de seleção, `lib/bancos.ts`, pra variedade/pro caminho de erro)
 * simplesmente não contribui saldo — não é um bug, é um banco sem dado
 * mockado. Ordenada por saldo desc (mais relevante primeiro).
 */
export function getContasConectadas(bancosConectados: string[]): Conta[] {
  return contas.filter((c) => bancosConectados.includes(c.bancoId)).sort((a, b) => b.saldo - a.saldo);
}

/** Soma dos saldos das contas que a pessoa efetivamente conectou — nunca
 *  "todas as contas do mock", senão conectar 1 banco já mostraria o
 *  patrimônio inteiro. */
export function getPatrimonioTotal(bancosConectados: string[]): number {
  return getContasConectadas(bancosConectados).reduce((soma, c) => soma + c.saldo, 0);
}

/**
 * Quanto da sobra mensal já está comprometido em metas ATIVAS.
 * Metas concluídas ou excluídas não entram aqui — é assim que o valor
 * "volta" pra sobra sem destino automaticamente quando uma meta sai da lista ativa.
 */
export function getComprometidoEmMetas(metasList: Meta[] = metas): number {
  return metasList
    .filter((m) => m.status === "ativa")
    .reduce((soma, m) => soma + m.aporteMensal, 0);
}

/** Sobra total menos o que já está comprometido em metas ativas. */
export function getSobraSemDestino(metasList: Meta[] = metas): number {
  return getSobraTotal() - getComprometidoEmMetas(metasList);
}

/** % de progresso de uma meta em relação ao valor alvo. */
export function getPercentualMeta(meta: Meta): number {
  if (meta.valorAlvo === 0) return 0;
  return (meta.valorAtual / meta.valorAlvo) * 100;
}

/**
 * Quantos meses faltam pra meta bater o valor alvo, no aporte atual. Quando
 * há reposição ativa (`meta.reposicao`, ver Ajuste de rota), simula os
 * primeiros `mesesRestantes` meses no aporte reforçado
 * (`aporteMensal + valorExtra`) e só depois volta pro aporte normal — é
 * essa simulação que garante "chegada mantida" quando a reposição
 * recompõe exatamente a diferença detectada, sem precisar escrever a data
 * na mão.
 */
export function getMesesRestantes(meta: Meta): number {
  const restante = meta.valorAlvo - meta.valorAtual;
  if (restante <= 0) return 0;
  if (meta.aporteMensal <= 0) return Infinity;

  if (meta.reposicao && meta.reposicao.mesesRestantes > 0) {
    const { valorExtra, mesesRestantes } = meta.reposicao;
    const aporteReforcado = meta.aporteMensal + valorExtra;
    const acumuladoNaReposicao = aporteReforcado * mesesRestantes;
    if (acumuladoNaReposicao >= restante) {
      return Math.ceil(restante / aporteReforcado);
    }
    const restanteDepois = restante - acumuladoNaReposicao;
    return mesesRestantes + Math.ceil(restanteDepois / meta.aporteMensal);
  }

  return Math.ceil(restante / meta.aporteMensal);
}

/** Aporte efetivamente entrando na meta este mês — inclui a reposição
 *  temporária quando ativa. Usado só em DISPLAY (ex. "por mês" no detalhe
 *  durante uma reposição); `aporteMensal` sozinho continua sendo a fonte
 *  pra sobra sem destino/teto — a reposição não vem da sobra. */
export function getAporteEfetivo(meta: Meta): number {
  return meta.aporteMensal + (meta.reposicao?.valorExtra ?? 0);
}

/** Data prevista de chegada, projetada a partir de hoje. */
export function getDataPrevista(meta: Meta, hoje: Date = new Date()): Date | null {
  const meses = getMesesRestantes(meta);
  if (!Number.isFinite(meses)) return null;
  const data = new Date(hoje);
  data.setMonth(data.getMonth() + meses);
  return data;
}

/**
 * Meses entre hoje e uma data-alvo escolhida pelo usuário (mínimo 1, pra
 * nunca dividir por zero quando a data cai no mês corrente). Base do modelo
 * de cálculo INVERTIDO de Criar/Editar meta: o usuário informa valor total +
 * quando quer chegar lá, o app deriva o aporte — nunca o contrário.
 */
export function getMesesAte(dataAlvo: Date, hoje: Date = new Date()): number {
  const meses = (dataAlvo.getFullYear() - hoje.getFullYear()) * 12 + (dataAlvo.getMonth() - hoje.getMonth());
  return Math.max(1, meses);
}

/**
 * Aporte mensal NECESSÁRIO pra sair de valorAtual e chegar em valorAlvo até
 * dataAlvo. Única fonte desse cálculo — Editar meta e Criar meta leem daqui,
 * nunca cada tela com sua própria conta.
 */
export function getAporteNecessario(valorAtual: number, valorAlvo: number, dataAlvo: Date, hoje: Date = new Date()): number {
  const restante = Math.max(0, valorAlvo - valorAtual);
  return Math.ceil(restante / getMesesAte(dataAlvo, hoje));
}

/**
 * Data prevista de chegada dado um aporte hipotético (ainda não salvo) — a
 * mesma conta de `getDataPrevista`, mas sem precisar de um objeto `Meta`
 * completo. Usada pelo card de insight pra mostrar a chegada REALISTA quando
 * o aporte necessário passa da sobra sem destino disponível.
 */
export function getDataPrevistaComAporte(
  valorAtual: number,
  valorAlvo: number,
  aporteMensal: number,
  hoje: Date = new Date(),
): Date | null {
  const restante = valorAlvo - valorAtual;
  if (restante <= 0) return hoje;
  if (aporteMensal <= 0) return null;
  const meses = Math.ceil(restante / aporteMensal);
  const data = new Date(hoje);
  data.setMonth(data.getMonth() + meses);
  return data;
}

/** Teto de sanidade pro valor alvo de uma meta — nada no produto justifica
 *  uma meta de 8 dígitos; acima disso é sempre erro de entrada (dedo no
 *  campo errado, colagem duplicada), nunca um valor real a aceitar. */
export const VALOR_ALVO_MAXIMO = 10_000_000;
/** Teto de sanidade pra chegada projetada — acima disso o resultado não é
 *  "uma meta de longuíssimo prazo", é sintoma de entrada inválida rio
 *  acima (valor alvo ou data corrompidos). */
export const ANOS_MAXIMO_CHEGADA = 50;

export interface ResultadoChegada {
  /** false enquanto valor/data ainda não formam uma meta válida (ex.: campos vazios). */
  dataValida: boolean;
  /** A data que o usuário escolheu, sem ajuste. */
  dataEscolhida: Date | null;
  /** Aporte que SERIA necessário pra chegar em dataEscolhida — pode passar do teto. */
  aporteNecessario: number;
  /** true quando aporteNecessario cabe na sobra sem destino disponível pra essa meta. */
  cabeNoPlano: boolean;
  /** O aporte que de fato seria salvo (clampado ao teto — mesma regra de `ajustarAporteMeta`). */
  aporteFinal: number;
  /** Quando cabe: igual a dataEscolhida. Quando não cabe: a chegada REAL no ritmo possível (aporteFinal). */
  dataRealista: Date | null;
  /** true quando valorAlvo passa de `VALOR_ALVO_MAXIMO` OU a chegada projetada passa de
   *  `ANOS_MAXIMO_CHEGADA` — a UI trata isso como erro de entrada, nunca exibe o resultado
   *  bruto (nenhuma meta real produz uma chegada em duzentos anos). */
  entradaInsana: boolean;
}

/**
 * O card de insight de Criar/Editar meta PRECISA dizer a verdade: nunca
 * afirma que um aporte "cabe" quando na verdade passa da sobra sem destino
 * disponível. Única fonte dessa decisão — Editar meta e Criar meta chamam
 * esta função, nunca cada tela com sua própria conta (senão elas divergem,
 * como já aconteceu antes com `getTetoAporte`).
 */
export function calcularChegada(
  valorAtual: number,
  valorAlvo: number,
  dataAlvo: Date | null,
  teto: number,
  hoje: Date = new Date(),
): ResultadoChegada {
  if (!dataAlvo || valorAlvo <= valorAtual || valorAlvo > VALOR_ALVO_MAXIMO) {
    return {
      dataValida: false,
      dataEscolhida: null,
      aporteNecessario: 0,
      cabeNoPlano: true,
      aporteFinal: 0,
      dataRealista: null,
      entradaInsana: valorAlvo > VALOR_ALVO_MAXIMO,
    };
  }

  const aporteNecessario = getAporteNecessario(valorAtual, valorAlvo, dataAlvo, hoje);
  const cabeNoPlano = aporteNecessario <= teto;
  const aporteFinal = Math.min(aporteNecessario, teto);
  const dataRealista = cabeNoPlano ? dataAlvo : getDataPrevistaComAporte(valorAtual, valorAlvo, teto, hoje);
  const anosAteChegada = dataRealista ? (dataRealista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;
  const entradaInsana = anosAteChegada > ANOS_MAXIMO_CHEGADA;

  return {
    dataValida: true,
    dataEscolhida: dataAlvo,
    aporteNecessario,
    cabeNoPlano,
    aporteFinal,
    dataRealista,
    entradaInsana,
  };
}

/**
 * Score de proteção — DERIVADO do patrimônio conectado, nunca um número
 * fixo (conectar mais banco tem que mudar o score de verdade, prova de que
 * o cálculo é real, não decoração). Heurística: meses de gasto que o
 * patrimônio cobre, contra a meta clássica de reserva de emergência de 6
 * meses — 100% de proteção = patrimônio cobre 6 meses de gasto ou mais.
 * `folga` e `estabilidade` continuam fixos (renda/gastos são canônicos
 * independente de qual banco foi conectado — só o patrimônio varia).
 */
export function getProtecaoScore(patrimonio: number, gastoTotal: number): number {
  if (gastoTotal <= 0) return 0;
  const mesesCobertos = patrimonio / gastoTotal;
  return Math.max(0, Math.min(100, Math.round((mesesCobertos / 6) * 100)));
}

/** Média ponderada: folga 40%, estabilidade 30%, proteção 30%. */
export function getScoreSaudeFinanceira(scores: ScoreSaudeFinanceira = diagnostico.scores): number {
  return scores.folga * 0.4 + scores.estabilidade * 0.3 + scores.protecao * 0.3;
}

export function getMetasAtivas(metasList: Meta[] = metas): Meta[] {
  return metasList
    .filter((m) => m.status === "ativa")
    .sort((a, b) => a.prioridadeCascata - b.prioridadeCascata);
}

/** Busca por id em todas as metas, independente do status. */
export function getMetaPorId(id: string, metasList: Meta[] = metas): Meta | undefined {
  return metasList.find((m) => m.id === id);
}

// ============================================================================
// AJUSTE DE ROTA — reconciliação entre o reservado (valorAtual) e o saldo
// real da conta (saldoReal). Evento diagnóstico, não erro: "dinheiro na
// conta é dinheiro vivo" (DECISOES.md-adjacent, ver tela). Sem integração
// bancária real — `saldoReal` só é setado pelo gatilho de QA
// (`simularDivergencia`, usado em /preview/divergencia).
// ============================================================================

/** true quando o saldo real diverge do reservado — dispara o card de estado
 *  no detalhe da meta e na Home, nunca um modal (reconciliação não
 *  interrompe). */
export function isMetaDivergente(meta: Meta): boolean {
  return meta.saldoReal !== undefined && meta.saldoReal !== meta.valorAtual;
}

/** Metas ATIVAS com divergência pendente — usada pro card de estado da Home
 *  (pode haver mais de uma; a Home aponta pra primeira, cada detalhe de
 *  meta resolve a sua). */
export function getMetasDivergentes(metasList: Meta[] = metas): Meta[] {
  return getMetasAtivas(metasList).filter(isMetaDivergente);
}

/** QA — simula uma divergência de saldo pra exercitar o Ajuste de rota sem
 *  integração bancária real. Nunca chamada por um fluxo de produto. */
export function simularDivergencia(metasList: Meta[], metaId: string, saldoReal: number): Meta[] {
  return metasList.map((m) => (m.id === metaId ? { ...m, saldoReal } : m));
}

/** QA — força `valorAtual`, pra exercitar a tela de Meta concluída sem
 *  esperar meses de aporte reais (não existe avanço automático de tempo
 *  neste mock). Nunca chamada por um fluxo de produto. */
export function forcarValorAtual(metasList: Meta[], metaId: string, valor: number): Meta[] {
  return metasList.map((m) => (m.id === metaId ? { ...m, valorAtual: valor } : m));
}

// ============================================================================
// META CONCLUÍDA — ESTADO derivado (valorAtual >= valorAlvo numa meta ainda
// "ativa"), não uma rota isolada: `/metas/[id]` mostra a celebração no lugar
// do detalhe normal enquanto isso for verdade. Sair da celebração
// ("Começar uma nova meta") é o gatilho real de `concluirMeta` — só aí o
// aporte volta pra sobra sem destino de fato (`concluirMeta`, já existente,
// abaixo).
// ============================================================================

/** true quando a meta bateu o valor alvo mas ainda não foi formalmente
 *  concluída (status ainda "ativa") — dispara a tela de celebração. */
export function isMetaConcluivel(meta: Meta): boolean {
  return meta.status === "ativa" && meta.valorAtual >= meta.valorAlvo;
}

/** Meses padrão da opção "Repor nos próximos meses" — reparte a diferença
 *  detectada em parcelas iguais somadas ao aporte normal. */
const MESES_REPOSICAO_PADRAO = 4;

export type OpcaoAjusteDeRota = "repor" | "estender" | "aceitar";

export interface OpcoesAjusteDeRota {
  /** Positivo = saiu dinheiro da conta (o caso comum); negativo = sobrou mais do que o reservado. */
  diferenca: number;
  repor: { valorExtra: number; meses: number; dataResultante: Date | null };
  estender: { dataResultante: Date | null };
}

/**
 * Os três resultados são CALCULADOS a partir do saldo real e do plano atual
 * — nunca escritos. Única fonte dessa conta: a tela de reconciliação e a de
 * confirmação leem daqui, nunca cada uma com sua própria conta (mesmo
 * motivo de `calcularChegada`/`getTetoAporte`).
 *
 * "Repor" simula `meta.reposicao` (ver `getMesesRestantes`) — é essa
 * simulação que garante a "chegada mantida" quando a reposição recompõe
 * exatamente a diferença, sem precisar hardcodar a data.
 */
export function calcularOpcoesAjusteDeRota(meta: Meta, hoje: Date = new Date()): OpcoesAjusteDeRota {
  const saldoReal = meta.saldoReal ?? meta.valorAtual;
  const diferenca = meta.valorAtual - saldoReal;
  const metaComSaldoReal = { ...meta, valorAtual: saldoReal };

  const valorExtra = Math.max(0, Math.ceil(diferenca / MESES_REPOSICAO_PADRAO));
  const metaRepor: Meta = {
    ...metaComSaldoReal,
    reposicao: { valorExtra, mesesRestantes: MESES_REPOSICAO_PADRAO },
  };

  return {
    diferenca,
    repor: { valorExtra, meses: MESES_REPOSICAO_PADRAO, dataResultante: getDataPrevista(metaRepor, hoje) },
    estender: { dataResultante: getDataPrevista(metaComSaldoReal, hoje) },
  };
}

/**
 * Aplica a opção escolhida no Ajuste de rota. Nas três, `valorAtual` passa a
 * ser o saldo real (o plano PRECISA refletir a realidade, nunca continuar
 * mostrando o valor antigo) e a divergência é limpa (`saldoReal` volta a
 * `undefined`). `aporteMensal` nunca muda aqui em nenhuma das três — a
 * reposição é um reforço à parte (`reposicao`), não uma alocação nova da
 * sobra; "estender" e "aceitar" resultam no mesmo estado de dados (só a
 * narrativa na confirmação muda), por design: as duas só re-basear o
 * progresso no valor real, sem prometer nada além disso.
 */
export function resolverAjusteDeRota(metasList: Meta[], metaId: string, opcao: OpcaoAjusteDeRota): Meta[] {
  return metasList.map((m) => {
    if (m.id !== metaId) return m;
    const saldoReal = m.saldoReal ?? m.valorAtual;
    if (opcao === "repor") {
      const { diferenca } = calcularOpcoesAjusteDeRota(m);
      const valorExtra = Math.max(0, Math.ceil(diferenca / MESES_REPOSICAO_PADRAO));
      return {
        ...m,
        valorAtual: saldoReal,
        saldoReal: undefined,
        reposicao: { valorExtra, mesesRestantes: MESES_REPOSICAO_PADRAO },
      };
    }
    return { ...m, valorAtual: saldoReal, saldoReal: undefined, reposicao: undefined };
  });
}

// ============================================================================
// MUTAÇÕES (imutáveis — retornam uma nova lista, não alteram `metas` direto)
//
// Hoje `metas` é uma const em módulo; quando o app ganhar estado real (Etapa
// futura, provavelmente Context/Zustand por cima disso), essas funções viram
// os reducers/actions. Nada aqui precisa mudar de forma — só o lugar que
// guarda o array e chama essas funções.
// ============================================================================

/** Marca uma meta como concluída. A sobra comprometida nela é liberada
 *  automaticamente, porque getComprometidoEmMetas só soma metas "ativa". */
export function concluirMeta(metasList: Meta[], metaId: string): Meta[] {
  return metasList.map((m) => (m.id === metaId ? { ...m, status: "concluida" as const } : m));
}

/**
 * Exclui (soft-delete) uma meta. Mesma lógica de liberação automática da
 * concluída — mantemos o registro com status "excluida" em vez de remover
 * do array, pra preservar histórico.
 *
 * Sem exceção por meta: toda meta, Reserva incluída, pode ser excluída — a
 * alocação da sobra é virtual (o app é somente leitura sobre as contas
 * reais), então excluir uma meta nunca destrói patrimônio, só a tira do
 * plano. Ver DECISOES.md, "Consistência estrutural das metas".
 */
export function excluirMeta(metasList: Meta[], metaId: string): Meta[] {
  return metasList.map((m) => (m.id === metaId ? { ...m, status: "excluida" as const } : m));
}

/**
 * Pausa uma meta: mesma mecânica de liberação da sobra que excluir/concluir
 * (getComprometidoEmMetas só soma "ativa"), mas a meta CONTINUA existindo e
 * `valorAtual` (o progresso já guardado) não muda — só o aporte mensal para
 * de ser reservado pra ela e volta pra sobra sem destino.
 */
export function pausarMeta(metasList: Meta[], metaId: string): Meta[] {
  return metasList.map((m) => (m.id === metaId ? { ...m, status: "pausada" as const } : m));
}

/** Retoma uma meta pausada — volta pra "ativa", o aporte volta a ser
 *  comprometido (sai da sobra sem destino de novo). Sem UI ainda (fora do
 *  escopo pedido), mas a contraparte de `pausarMeta` precisa existir pro
 *  ciclo fazer sentido. */
export function retomarMeta(metasList: Meta[], metaId: string): Meta[] {
  return metasList.map((m) => (m.id === metaId ? { ...m, status: "ativa" as const } : m));
}

/**
 * Teto de aporte pra uma meta: o que sobra depois de descontar o que as
 * OUTRAS metas ativas já ocupam. Única fonte de verdade tanto pra clampar
 * `ajustarAporteMeta` quanto pra UI explicar em linguagem humana por que um
 * valor foi recusado (ex. tela de Editar meta) — os dois lêem esta mesma
 * conta, nunca cada um com sua própria soma.
 */
export function getTetoAporte(metasList: Meta[], metaId: string): number {
  const somaOutras = metasList
    .filter((m) => m.status === "ativa" && m.id !== metaId)
    .reduce((soma, m) => soma + m.aporteMensal, 0);
  return Math.max(0, getSobraTotal() - somaOutras);
}

/**
 * Ajusta o aporte mensal de uma meta ATIVA — a ÚNICA função que escreve
 * `aporteMensal`. Usada tanto por /metas/divisao quanto por /metas/[id]/editar
 * (via `useMetas().ajustarAporte`) — nunca cada tela com sua própria lógica,
 * senão elas divergem. Sempre clampa ao teto de `getTetoAporte`, nunca fica
 * negativo.
 */
export function ajustarAporteMeta(metasList: Meta[], metaId: string, novoAporte: number): Meta[] {
  const teto = getTetoAporte(metasList, metaId);
  const valor = Math.min(Math.max(0, Math.round(novoAporte)), teto);
  return metasList.map((m) => (m.id === metaId ? { ...m, aporteMensal: valor } : m));
}

/**
 * Edita nome/valor-alvo de uma meta — campos que não têm relação com a
 * "fonte única de verdade" do aporte (`ajustarAporteMeta`), por isso vivem
 * numa mutação separada. `valorAlvo` nunca fica menor que o que já foi
 * guardado (a UI também valida isso antes de chamar, mas a trava real é
 * aqui, no dado).
 */
export function editarMeta(
  metasList: Meta[],
  metaId: string,
  patch: { titulo?: string; valorAlvo?: number; icone?: MetaIconeId },
): Meta[] {
  return metasList.map((m) => {
    if (m.id !== metaId) return m;
    const titulo = patch.titulo?.trim() ? patch.titulo.trim() : m.titulo;
    const valorAlvo = patch.valorAlvo !== undefined ? Math.max(m.valorAtual, patch.valorAlvo) : m.valorAlvo;
    const icone = patch.icone ?? m.icone;
    return { ...m, titulo, valorAlvo, icone };
  });
}

/**
 * Cria uma meta nova, ATIVA, com `valorAtual` 0 (nada guardado ainda) e
 * prioridade de cascata no fim da fila. `id` vem de fora (o Provider gera e
 * usa o mesmo id pra navegar pro detalhe assim que criar). O aporte inicial
 * passa por `ajustarAporteMeta` — não é escrito direto — pra nunca duplicar o
 * clamp ao teto de sobra sem destino: mesma fonte única de verdade que
 * Editar meta e /metas/divisao usam.
 */
export function criarMeta(
  metasList: Meta[],
  id: string,
  input: { titulo: string; icone: MetaIconeId; categoria: Meta["categoria"]; valorAlvo: number; aporteMensal: number },
): Meta[] {
  const prioridadeCascata =
    metasList.length > 0 ? Math.max(...metasList.map((m) => m.prioridadeCascata)) + 1 : 1;

  const novaMeta: Meta = {
    id,
    titulo: input.titulo.trim(),
    categoria: input.categoria,
    icone: input.icone,
    valorAtual: 0,
    valorAlvo: input.valorAlvo,
    aporteMensal: 0,
    status: "ativa",
    prioridadeCascata,
    criadoEm: new Date().toISOString().slice(0, 10),
  };

  return ajustarAporteMeta([...metasList, novaMeta], id, input.aporteMensal);
}

/**
 * PLACEHOLDER — ainda não implementado.
 *
 * Quando o usuário aumenta a sobra sem destino (ex.: reduz gasto em uma categoria)
 * ou pede pra alocar manualmente, a lógica de cascata entra aqui:
 *   1. Ordenar metas ativas por `prioridadeCascata` (reserva sempre primeiro).
 *   2. Preencher a reserva até `valorAlvo` antes de tocar em qualquer meta
 *      com prazo.
 *   3. Distribuir o restante da sobra sem destino pelas metas seguintes, respeitando
 *      a ordem.
 * Por enquanto só a assinatura existe, pra deixar claro onde isso entra:
 */
export function alocarSobraDisponivel(
  _metasList: Meta[],
  _valorDisponivel: number
): Meta[] {
  throw new Error("alocarSobraDisponivel ainda não implementado — ver comentário acima.");
}

// ============================================================================
// AGREGADO — conveniência para import único, sem substituir os exports nomeados
// ============================================================================

export const mockData = {
  perfil,
  diagnostico,
  contas,
  categorias,
  metas,
};
