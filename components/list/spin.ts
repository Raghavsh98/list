import type { CSSProperties } from "react"
import type { Font, Spin } from "@/core/types"

const FONT_STACK: Record<Font, string> = {
  serif: "var(--font-serif, Georgia, 'Times New Roman', serif)",
  sans: "var(--font-sans, system-ui, sans-serif)",
  mono: "var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace)",
}

/** No spin means the list wears the page's own ink. */
export const DEFAULT_ACCENT = "currentColor"
export const DEFAULT_FONT: Font = "sans"

/** Spin → CSS custom properties. The stylesheet does the rest; nothing is computed at runtime. */
export function spinVars(spin?: Spin): CSSProperties {
  return {
    "--list-accent": spin?.color ?? DEFAULT_ACCENT,
    "--list-font": FONT_STACK[spin?.font ?? DEFAULT_FONT],
  } as CSSProperties
}
