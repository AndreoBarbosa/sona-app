# Sona

**Plataforma de clareza financeira. Diagnóstico antes de metas.**

### [→ ver o app ao vivo](https://sona-app-two.vercel.app)

<img src="docs/screenshot-home.jpg" alt="Home do Sona: score de saúde financeira, patrimônio consolidado, capacidade mensal e a Próxima Ação sugerida" width="360" />

---

## O problema

Apps financeiros dependem de alimentação manual constante — categorizar, lançar,
revisar — e as pessoas abandonam depois de duas semanas. O padrão mais comum,
porém, é outro: o app pede pra criar uma meta ("Junte R$ 30.000 pra reserva")
antes da pessoa entender se aquele número é sequer factível pra ela. A meta
nasce desconectada da capacidade real de quem vai persegui-la.

## A descoberta

Trabalhando o produto, a pergunta que guiava tudo mudou. Não era "como faço a
pessoa criar mais metas", era "a pessoa sabe, hoje, quanto pode guardar por
mês?". A maioria não sabe — não por falta de disciplina, por falta de clareza.
Isso redefiniu o produto inteiro: metas deixaram de ser o ponto de partida e
viraram uma consequência de um diagnóstico honesto.

## A tese

**Complexidade → Clareza → Plano → Meta → Progresso.**

Jornada do produto: **Open Finance → Diagnóstico → Plano → Meta →
Acompanhamento**. O usuário conecta contas (leitura), o Sona lê o
comportamento real de gasto, devolve um diagnóstico em linguagem humana antes
de qualquer número bruto, e só depois propõe pra onde a sobra do mês pode ir.

## Decisões de produto

Cinco escolhas que sustentam o resto do produto — o porquê, não a
implementação.

**"Sobra sem destino" como motor de alocação.** Excluir ou pausar uma meta não
apaga dinheiro nem "perde progresso" — devolve o aporte mensal pra sobra sem
destino, que por sua vez reativa a Próxima Ação (a Home volta a sugerir o que
fazer com aquele valor). O sistema se retroalimenta: toda saída de uma meta é
automaticamente uma nova entrada de decisão, nunca um beco sem saída.

**Alocação é virtual — nada sai da conta.** O Sona é somente leitura sobre as
contas reais; "guardar pra reserva" é uma organização de intenção, não uma
transferência. Isso também é o motivo pelo qual excluir uma meta nunca pode
ser bloqueado por regra de produto (uma trava de exclusão faria sentido se
dinheiro real estivesse preso — não faz, porque não está).

**Regra master: toda meta tem a mesma estrutura.** Mesmas ações no swipe do
card (Editar + Excluir, mesma largura, sempre), mesma tela de detalhe, mesmo
"Excluir meta" disponível — inclusive pra Reserva de Emergência. A tentação de
tornar a Reserva "protegida" (sem exclusão) apareceu duas vezes no
desenvolvimento e foi revertida as duas vezes: a diferença entre metas vive só
no conteúdo (valor, prazo, ícone), nunca em quais ações a pessoa pode tomar.
Regra travada, documentada em `DECISOES.md`.

**Ajuste de Rota como evento diagnóstico, sem culpa.** Quando o saldo real
diverge do que o plano previa, o Sona não interrompe o fluxo nem trata isso
como erro do usuário — é uma reconciliação neutra, oferecida como informação,
nunca como bloqueio.

**Peso visual inversamente proporcional à irreversibilidade.** Ações que
custam caro pra desfazer (excluir, confirmar um valor sensível) usam a cor de
maior compromisso (petróleo); ações de conversão leve usam coral; progresso
dentro de um fluxo já iniciado usa sage. A cor do botão não é estética — é a
resposta a "o que essa ação realmente compromete".

## Sistema de design

Fonte de verdade: Figma ("SONA — Planejador Financeiro"), reproduzido 1:1 e
versionado como tokens em `tailwind.config.ts`.

- **Paleta** — petroleo / sage / coral / base, cada uma com rampa 50–900;
  camada semântica por cima (`ink`, `surface`, `cta`, `commit`, `action`) pra
  que o código nomeie por função, nunca por cor.
- **Tipografia** — [Outfit](https://fonts.google.com/specimen/Outfit), escala
  de display (200/ExtraLight) a caption, com o peso Light reservado pra
  headlines e valores grandes, Medium só em botão/eyebrow/título de linha.
- **CTA em 3 níveis** — coral (conversão leve) · petróleo (compromisso de
  dado sensível) · sage (progresso em fluxo já iniciado). Nenhum botão do
  produto escolhe cor por preferência estética.
- **Tokens de movimento** — rápido (150ms, micro-interação) · base (240ms,
  aparecer/desaparecer) · lento (400ms, transição de tela). A Splash e o
  loading do diagnóstico são as únicas exceções documentadas ao teto de
  400ms — movimento existe pra explicar mudança, nunca pra chamar atenção.
- Sem iconografia financeira clichê (moeda, cifrão, cofrinho, gráfico com
  seta) e sem ícones genéricos de alarme/erro — inclusive nas ilustrações
  (uma tela de falha de conexão teve exatamente esse ícone removido na
  auditoria final deste case).

Todas as regras de produto e de design ficam travadas e versionadas em
[`DECISOES.md`](./DECISOES.md) — é o documento que qualquer sessão de
trabalho neste repo lê antes de tocar em código.

## Stack e como rodar localmente

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v3, tokens em `tailwind.config.ts`
- Estado 100% client-side (React Context) — sem banco de dados

```bash
npm install
npm run dev
# http://localhost:3000
```

```bash
npm run lint    # ESLint
npm run build   # build de produção (Next + TypeScript)
```

## Nota de escopo

Case conceitual de produto e design. Todos os dados são mockados
(`src/lib/mock-data.ts`); não há backend, banco de dados ou persistência além
do `localStorage` do onboarding. A autenticação (`/cadastro`, `/login`) é
funcional na interface — validação de formulário real, estados de erro reais
— mas sem servidor: qualquer credencial em formato válido entra, e a sessão
vive só na memória da aba. A conexão Open Finance é simulada: uma integração
real exigiria credenciamento junto ao Banco Central do Brasil.
