import type { ListDoc } from "@/core/types"
import { siteUrl } from "./site"

export const EMBED_WIDTH = 640

/** A guess at the rendered height so the iframe arrives roughly the right size, no script needed. */
export function embedHeight(doc: ListDoc): number {
  const header = 120 + (doc.subtitle ? 44 : 0)
  const rows = doc.items.reduce((h, i) => h + 40 + (i.aside ? 26 : 0) + (i.credit ? 22 : 0) + (i.image ? 200 : 0), 0)
  return Math.min(1400, Math.max(220, header + rows + 72))
}

export function embedUrl(handle: string, slug: string): string {
  return `${siteUrl}/embed/${handle}/${slug}`
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

export function embedHtml(handle: string, slug: string, doc: ListDoc): string {
  return `<iframe src="${embedUrl(handle, slug)}" title="${escapeAttr(doc.title)}" width="100%" height="${embedHeight(doc)}" style="border:0;max-width:${EMBED_WIDTH}px;color-scheme:light dark" loading="lazy"></iframe>`
}
