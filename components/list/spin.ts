import type { CSSProperties } from "react"
import type { Font, Spin } from "@/core/types"

const FONT_STACK: Record<Font, string> = {
  serif: "var(--font-serif, Georgia, 'Times New Roman', serif)",
  sans: "var(--font-sans, system-ui, sans-serif)",
  mono: "var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace)",
}

/**
 * Spin → CSS custom properties. No spin means no variables: the stylesheet's
 * monochrome defaults stand. Nothing is computed at runtime.
 */
export function spinVars(spin?: Spin): CSSProperties | undefined {
  if (!spin) return undefined
  return {
    "--list-accent": spin.color,
    "--list-font": FONT_STACK[spin.font],
  } as CSSProperties
}
