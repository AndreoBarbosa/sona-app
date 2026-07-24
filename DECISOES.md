# Decisões travadas — Sona

Regras de produto fixadas. Leia este arquivo no início de toda tarefa. Se algo no código, no
Figma ou num pedido novo contradisser o que está aqui, pare e avise antes de seguir — não decida
sozinho por cima de uma regra travada.

## Terminologia

- "meta" (nunca "objetivo") · "sem destino" (nunca "livre")

## REGRA MASTER — Consistência estrutural das metas

**Maior prioridade deste documento.** Revoga por completo a regra anterior "Reserva de
emergência é PROTEGIDA" (existiu nesta seção, foi implementada duas vezes, regrediu duas vezes,
e foi decidida errada: a alocação da sobra é virtual e o app é somente leitura sobre as contas
reais — excluir uma meta nunca destrói patrimônio, só a tira do plano. Bloquear contradizia
"o Sona propõe, o usuário ajusta livremente"). Se qualquer código, comentário ou instrução futura
tentar reintroduzir um campo tipo `protegida`/`podeExcluir` ou uma condicional de exclusão por
categoria, isso contradiz esta regra — pare e avise antes de implementar.

TODA e QUALQUER meta, sem exceção:

1. Swipe idêntico em todos os cards: Editar + Excluir. Mesmas ações, mesmas cores, mesma
   largura (140px), sempre. Nenhum card tem conjunto diferente de ações.
2. Tela de detalhe com a MESMA estrutura para todas as metas: BackButton · badge + título + data
   de criação · lápis de edição no topo direito · card de progresso · cards Por mês / Previsão de
   chegada · status de verificação · Atividade · "Ajustar divisão da sobra →" · botão Ghost
   "Pausar meta" · link "Excluir meta" no rodapé.
3. A diferença entre metas vive APENAS no conteúdo (valores, datas, ícone, textos), nunca na
   estrutura nem nas ações disponíveis.
4. Exceção de CONTEÚDO permitida: no modal de exclusão da Reserva, uma segunda linha informa —
   nunca impede — que o valor já guardado continua na conta real: "Sua reserva de proteção sai
   do plano. Os R$ X já guardados continuam na sua conta." Isso é texto, não trava.

## Regras de produto

- Excluir ou pausar uma meta devolve o aporte para a sobra sem destino
- Toda meta ativa exibe "Excluir meta" na tela de detalhe (ver regra master acima)

## Valores canônicos

**REGRA MAIOR (revisão): a interface representa exatamente o estado que a pessoa gerou —
nada pré-carregado que ela não criou.** Isso reclassificou os valores abaixo em dois grupos:

- **Vêm da conexão bancária** (premissa do Open Finance, sempre presentes assim que qualquer
  banco é conectado, fictícios por definição): Renda 5.800 · Gastos 4.851 · Sobra 949 ·
  categorias de gasto · lançamentos · histórico. Fixos independente de QUAL banco foi conectado.
- **A pessoa cria, começa ZERADO, sem exceção**: metas e alocação da sobra. `metas` (mock-data.ts)
  é `[]` por padrão — as duas metas "maduras" que já foram canônicas aqui (Reserva 19.500/30.000 ·
  R$ 500/mês (53%) · abr 2028 — Viagem 3.800/12.000 · R$ 200/mês (21%) · dez 2029 — sem destino
  R$ 249 (26%)) viraram **preset de demonstração** (`METAS_CENARIO_FERNANDA`,
  carregável em `/qa`), nunca o estado inicial de quem abre o app pela primeira vez.
- **Patrimônio é a soma dos bancos que a pessoa efetivamente conectou em `/conectar`**
  (seleção múltipla, `getPatrimonioTotal(bancosConectados)`) — nunca um total fixo. Os 5 saldos
  possíveis continuam canônicos (Nubank 15.800 · C6 7.200 · Bradesco 1.500 · MP 0 · PicPay 0);
  conectar os cinco soma R$ 24.500 (o antigo "Patrimônio 24.500"), mas é a SOMA que deve bater,
  não um número fixo — conectar só Nubank + C6, por exemplo, tem que dar exatamente R$ 23.000.
- **Score de proteção (peso 30% do score geral) deriva do patrimônio conectado**
  (`getProtecaoScore`, mock-data.ts — meses de gasto que o patrimônio cobre, sobre a meta
  clássica de 6 meses) — varia com quantos bancos foram conectados, de propósito: prova que o
  cálculo é real. Score ~75 (canônico) só reaparece com todos os 5 bancos conectados. Folga e
  estabilidade continuam fixos (derivam de renda/gastos, que são canônicos independente do banco).
- Datas de chegada sempre CALCULADAS, nunca hardcoded — as datas do preset (abr 2028, dez 2029) são
  a leitura de hoje; elas se movem sozinhas conforme os meses passam, porque nascem de
  `getDataPrevista()` a partir de `new Date()`. Isso é o comportamento correto, não drift a corrigir.
- Teto de sanidade pro motor de alocação: alvo de meta acima de R$ 10.000.000 ou chegada
  projetada além de 50 anos é sempre erro de entrada — a UI bloqueia e explica, nunca exibe
  (`VALOR_ALVO_MAXIMO`/`ANOS_MAXIMO_CHEGADA`, mock-data.ts).

## Regras visuais

- Outfit Light 300 em headline e valores grandes; Medium 500 só em botão, eyebrow e título de linha
- Valores de resumo sem centavos; centavos só em lançamentos
- CTA: coral = conversão leve · petróleo = dado sensível · sage = progresso positivo
  (pausar NÃO é sage — é Ghost: borda #E4E0D8, fundo transparente, texto petróleo)
- Proibido: iconografia financeira e ícones genéricos de alarme/erro (ex.: triângulo de aviso,
  sirene, ícone de erro de sistema)
- Bordas #E4E0D8 1px; sem ring/outline residual
- Tela sem nav bar SEMPRE tem BackButton

## Navegação

- Nenhum link pode levar a 404 ou tela em branco
- Toda ação do usuário devolve feedback visual

## Modais de confirmação (Nível 1)

Component set "Metas / modal de confirmação" (Figma, componentSetId 842:3527, 4 variantes) —
implementado em `ConfirmationModal` (`src/components/ui/confirmation-modal.tsx`). Padrão: fundo
#FAFAF8, radius 16, padding 24, conteúdo centralizado, ilustração 120px no topo, título Outfit
Light 20, corpo Outfit Light 12 centralizado, botão coral 205px, link cinza abaixo.

- **Ilustração é OBRIGATÓRIA nas 4 variantes** — nunca remover. Duas ilustrações existem:
  - Check verde (sucesso): "Meta criada.", "Meta criada." (ajuste manual), "Plano atualizado"
  - Círculo coral + X branco (exclusão): "Excluir a Viagem?" — é a ilustração PRÓPRIA e correta
    dessa variante no Figma, não é iconografia de alarme genérica proibida acima. Essa distinção
    já foi decidida errado duas vezes nesta sessão (trocada pelo check, depois removida de vez) —
    não repetir. `ConfirmationModal` seleciona a ilustração certa via a prop `perigo`.
- Botão de confirmação: `Button variant="tertiary"`, largura fixa 205px (não full-width).
- Link de dismiss: texto simples cinza (`text-ink-muted`), nunca um botão com borda/fundo.
- Copy do modal de exclusão é a do CÓDIGO, não a do nó do Figma (o nó ainda diz "sobra livre" e
  cita só um dos dois efeitos): "Os R$ X já reservados deixam de ter destino, e os R$ Y/mês voltam
  para a sua sobra. A meta e o histórico serão removidos." — um único destaque em sage na
  consequência principal. Pra Reserva especificamente, uma segunda linha (ver regra master) —
  informa, não bloqueia.
- Usado em: excluir meta, "aceitar divisão sugerida" / "salvar divisão" em `/metas/divisao`.
- **Pausar meta NÃO usa este componente.** Tem modal próprio (`pausar-meta-button.tsx`), sem
  ilustração, botão Ghost (não sage, não tertiary) — pausar não tem variante própria no component
  set do Figma e não deve reusar nem o check nem o X.

## Feedback leve (Nível 2 — toast)

`src/lib/toast-context.tsx`. Usado em: excluir meta (pós-ação), pausar meta, retomar meta. NÃO
usado em toggles (o próprio toggle já é o retorno visual).

## Modo demo / persistência

- localStorage sob chave versionada `sona:v2:*` (`src/lib/persist.ts`) — subir a versão é a forma
  correta de invalidar sessões antigas quando o formato de dado muda, nunca tentar migrar.
- `?reset=1` na raiz (`/`) limpa tudo e reinicia a partir da própria Splash — link de demonstração,
  não remover.
- Sem estado salvo → app começa zerado (splash → onboarding → conectar, sem nenhuma meta/banco
  pré-existente). Com estado → retoma de onde parou.
- **Onboarding NÃO tem etapa de nome.** Removida por completo — o nome vem só de Cadastro (campo
  Nome) ou do login social simulado (pergunta no clique do botão, nunca num passo à parte). Quem
  entra por "Conectar meu banco agora" sem passar por nenhum dos dois fica com "Fernanda" (padrão),
  sem ser perguntado. Onboarding é sempre 3 etapas fixas (Boas-vindas · Como funciona · Conectar
  banco) — nunca voltar a fazer esse total variar.
- `/qa` (fora da navegação, dentro do build) é o painel de controle de demonstração: carrega o
  preset `METAS_CENARIO_FERNANDA`, força divergência/conclusão por meta, zera metas/histórico/sobra,
  alterna reduced-motion, e reseta tudo (mesmo efeito de `?reset=1`). Mostra sobra/comprometido/sem
  destino e cada meta ao vivo, pra conferir a matemática sem DevTools.
