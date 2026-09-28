import type { CSSProperties } from "react"
import type { Font, Spin } from "@/core/types"

const FONT_STACK: Record<Font, string> = {
  serif: "var(--font-serif, Georgia, 'Times New Roman', serif)",
  sans: "var(--font-sans, system-ui, sans-serif)",
  mono: "var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace)",
}

export const DEFAULT_SPIN: Spin = { color: "#1a1a1a", font: "sans" }

/** Spin → CSS custom properties. The stylesheet does the rest; nothing is computed at runtime. */
export function spinVars(spin: Spin | undefined = DEFAULT_SPIN): CSSProperties {
  return {
    "--list-accent": spin.color,
    "--list-font": FONT_STACK[spin.font],
  } as CSSProperties
}
