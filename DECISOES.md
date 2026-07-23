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

- Renda 5.800 · Gastos 4.851 · Sobra 949 · Score 75
- Patrimônio 24.500 (Nubank 15.800 · C6 7.200 · Bradesco 1.500 · MP 0 · PicPay 0)
- Reserva 19.500/30.000 · R$ 500/mês (53%) · abr 2028
- Viagem 3.800/12.000 · R$ 200/mês (21%) · dez 2029
- Sem destino: R$ 249 (26%)
- Datas de chegada sempre CALCULADAS, nunca hardcoded — as datas acima (abr 2028, dez 2029) são
  a leitura de hoje; elas se movem sozinhas conforme os meses passam, porque nascem de
  `getDataPrevista()` a partir de `new Date()`. Isso é o comportamento correto, não drift a corrigir.

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
