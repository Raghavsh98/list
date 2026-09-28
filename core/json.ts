import type { Item, ListDoc } from "./types"
import { parseListDoc, type ParseResult } from "./validate"

export const SCHEMA_URL = "/schema/list-v1.json"

/** Stable key order so diffs of exported files are readable. */
function orderItem(item: Item): Item {
  const out: Item = { id: item.id, text: item.text }
  if (item.url) out.url = item.url
  if (item.credit) out.credit = item.credit
  if (item.aside) out.aside = item.aside
  return out
}

export function toJSON(doc: ListDoc, opts: { url?: string; schema?: string } = {}): string {
  const ordered: Record<string, unknown> = {}
  if (opts.schema) ordered.$schema = opts.schema
  ordered.formatVersion = doc.formatVersion
  ordered.id = doc.id
  if (opts.url) ordered.url = opts.url
  ordered.title = doc.title
  if (doc.subtitle) ordered.subtitle = doc.subtitle
  ordered.mode = doc.mode
  ordered.author = doc.author
  if (doc.spin) ordered.spin = doc.spin
  ordered.createdAt = doc.createdAt
  ordered.updatedAt = doc.updatedAt
  ordered.items = doc.items.map(orderItem)
  return JSON.stringify(ordered, null, 2) + "\n"
}

export function fromJSON(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (e) {
    return { ok: false, errors: [`invalid JSON: ${(e as Error).message}`] }
  }
  if (typeof raw === "object" && raw !== null && "$schema" in raw) {
    const { $schema: _schema, url: _url, ...rest } = raw as Record<string, unknown>
    void _schema
    void _url
    raw = rest
  }
  return parseListDoc(raw)
}
