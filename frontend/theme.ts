import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-newsreader), serif" },
        body: { value: "var(--font-public-sans), system-ui, sans-serif" },
        mono: { value: "var(--font-ibm-plex-mono), monospace" },
      },
      shadows: {
        overlay: { value: "0 8px 24px oklch(0.22 0.025 262 / 0.12)" },
      },
    },
    semanticTokens: {
      colors: {
        ink: {
          DEFAULT: { value: "oklch(0.22 0.025 262)" },
          soft: { value: "oklch(0.52 0.02 262)" },
          muted: { value: "oklch(0.60 0.02 262)" },
          faint: { value: "oklch(0.68 0.015 262)" },
          fainter: { value: "oklch(0.70 0.015 262)" },
        },
        line: {
          DEFAULT: { value: "oklch(0.87 0.012 80)" },
          soft: { value: "oklch(0.90 0.01 80)" },
          faint: { value: "oklch(0.92 0.008 80)" },
        },
        accent: {
          DEFAULT: { value: "oklch(0.40 0.11 262)" },
          hover: { value: "oklch(0.30 0.10 262)" },
          soft: { value: "oklch(0.55 0.05 262)" },
          bg: { value: "oklch(0.93 0.025 262)" },
          border: { value: "oklch(0.70 0.05 262)" },
        },
        gold: {
          DEFAULT: { value: "oklch(0.62 0.135 78)" },
          text: { value: "oklch(0.55 0.11 80)" },
          bg: { value: "oklch(0.95 0.045 85)" },
        },
        maroon: { value: "oklch(0.413 0.166 20)" },
        canvas: { value: "oklch(0.975 0.008 85)" },
        panel: { value: "oklch(0.99 0.004 85)" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
