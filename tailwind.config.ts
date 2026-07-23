import type { Config } from "tailwindcss";

/**
 * Sona — Design tokens
 * Fonte de verdade: Figma "SONA - Planejador Financeiro" → página 🎨 Style Guide
 * (file key JH7ZB20Ofzt3cgdFnxGrPW, node 65:135)
 *
 * Duas camadas:
 * 1) Paleta primitiva (petroleo/sage/coral/base) — os nomes vêm do próprio
 *    Style Guide do Figma (identidade de marca), com as rampas 50–900 completas.
 * 2) Tokens semânticos (ink, surface, action, cta, commit, tone) — é essa
 *    camada que os componentes devem consumir no dia a dia, para nomear por
 *    FUNÇÃO em vez de cor (ver README "Convenção de nomes").
 */

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- Paleta primitiva (rampas do Figma) ----
        petroleo: {
          50: "#E8EEF2",
          100: "#C8D8E4",
          200: "#A0BECE",
          300: "#6E9BB0",
          400: "#467A90",
          500: "#2A5A70",
          600: "#1A3A50",
          700: "#0C1A22", // ★ referência de marca (primária-700)
          800: "#081218",
          900: "#040A0E",
          DEFAULT: "#0C1A22",
        },
        sage: {
          50: "#EAF3EC",
          100: "#CBE4D0",
          200: "#A8D0B0",
          300: "#8ABE96",
          400: "#7EA88A",
          500: "#628E70", // ★ referência de marca (secundária-500)
          600: "#4A7258",
          700: "#345640",
          800: "#203A2C",
          900: "#0E1E16",
          DEFAULT: "#628E70",
        },
        coral: {
          50: "#FAE8E2",
          100: "#F5C8B5",
          200: "#ECA888",
          300: "#E0865E",
          400: "#C96040", // ★ referência de marca (terciária-400)
          500: "#A84830",
          600: "#843420",
          700: "#672413",
          800: "#43170C",
          900: "#200A04",
          DEFAULT: "#C96040",
        },
        base: {
          50: "#FAFAF8", // off-white · fundo geral
          100: "#F5F2EB",
          200: "#F0EDE6",
          300: "#E4E0D8",
          400: "#D4D0C8",
          500: "#B8B4AC",
          600: "#8A8880",
          700: "#605E58",
          800: "#3A3830",
          900: "#1A1814",
        },
        white: "#FFFFFF", // fundo · cards (fora da rampa base)

        // ---- Tokens semânticos (usar estes nos componentes) ----
        ink: {
          primary: "#0C1A22",              // petroleo.700 — texto principal
          secondary: "#605E58",            // base.700 — texto de apoio
          muted: "#8A8880",                // base.600 — texto terciário/legendas
          disabled: "#D4D0C8",             // base.400 — texto desativado
          inverse: "#FAFAF8",              // texto sobre fundos escuros
        },
        surface: {
          app: "#FAFAF8",                  // base.50 — fundo geral do app
          card: "#FFFFFF",                 // fundo padrão de cards
          raised: "#F0EDE6",               // base.200 — cards/seções elevadas sutis
          sunken: "#E4E0D8",               // base.300 — divisores, inputs desativados
        },
        action: "#628E70",                 // sage.500 — links, progresso em fluxo iniciado
        cta: "#C96040",                    // coral.400 — conversão leve
        commit: "#0C1A22",                 // petroleo.700 — commitment de dado sensível
        border: {
          DEFAULT: "#E4E0D8",              // base.300
          strong: "#D4D0C8",               // base.400
        },
        tone: {
          // usados em cards de diagnóstico/insight (tom=positivo|atencao|info|neutro)
          positive: "#628E70",             // sage.500
          attention: "#843420",             // coral.600
          info: "#467A90",                  // petroleo.400
          neutral: "#8A8880",               // base.600
        },
      },

      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },

      // Escala tipográfica real do Style Guide (Outfit).
      // fontWeight aqui é apenas o peso PADRÃO do estilo — pode ser
      // sobrescrito por utilitário (font-light/font-normal/font-medium etc).
      fontSize: {
        display: ["40px", { lineHeight: "110%", letterSpacing: "-0.03em", fontWeight: "200" }],
        h1: ["32px", { lineHeight: "110%", letterSpacing: "-0.025em", fontWeight: "200" }],
        h2: ["24px", { lineHeight: "120%", letterSpacing: "-0.02em", fontWeight: "300" }],
        h3: ["20px", { lineHeight: "125%", letterSpacing: "-0.015em", fontWeight: "300" }],
        h4: ["16px", { lineHeight: "130%", letterSpacing: "-0.005em", fontWeight: "500" }],
        h5: ["14px", { lineHeight: "110%", letterSpacing: "0em", fontWeight: "500" }],
        h6: ["12px", { lineHeight: "110%", letterSpacing: "0.04em", fontWeight: "500" }], // uppercase

        "body-lg": ["18px", { lineHeight: "160%", letterSpacing: "0em", fontWeight: "300" }],
        body: ["16px", { lineHeight: "160%", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "150%", letterSpacing: "0em", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "110%", letterSpacing: "0.04em", fontWeight: "300" }],

        button: ["14px", { lineHeight: "100%", letterSpacing: "0.01em", fontWeight: "500" }],
        input: ["14px", { lineHeight: "100%", letterSpacing: "0em", fontWeight: "400" }],
        eyebrow: ["10px", { lineHeight: "100%", letterSpacing: "0.18em", fontWeight: "500" }], // ui/micro label
        tag: ["10px", { lineHeight: "100%", letterSpacing: "0.08em", fontWeight: "400" }],
      },

      // Radius: cards 16 (variante destaque 20), botões 12, pill p/ badges e barras.
      borderRadius: {
        button: "12px",
        card: "16px",
        "card-lg": "20px",
        pill: "9999px",
      },

      // Container de referência para o frame mobile (~393px, iPhone base do Figma).
      maxWidth: {
        mobile: "430px",
      },

      // ---- Sistema de movimento ----
      // Nenhuma duração/easing solta em componente — tudo nasce aqui. O
      // princípio é "calma": o movimento existe pra explicar mudança, nunca
      // pra chamar atenção. rapido = micro-interação (hover/press/toggle);
      // base = aparecer/desaparecer (modal, feedback); lento = transição de
      // tela e barra de progresso. A splash (2.2s) e o loading do
      // diagnóstico são as únicas exceções documentadas ao teto de 400ms.
      transitionDuration: {
        rapido: "150ms",
        base: "240ms",
        lento: "400ms",
      },
      transitionTimingFunction: {
        // padrão: saída rápida, chegada suave — usar sempre que algo só
        // aparece/some/move.
        padrao: "cubic-bezier(0.2, 0, 0, 1)",
        // encaixe: leve overshoot — só onde algo literalmente "assenta"
        // (ex. swipe do card ao soltar).
        encaixe: "cubic-bezier(0.2, 1.1, 0.35, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
