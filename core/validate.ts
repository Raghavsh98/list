import { FONTS, FORMAT_VERSION, LIMITS, MODES, type Font, type Item, type ListDoc, type Mode, type Spin } from "./types"
import { ID_PATTERN } from "./ids"
import { HANDLE_PATTERN } from "./slug"

export type ParseResult =
  | { ok: true; doc: ListDoc }
  | { ok: false; errors: string[] }

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function str(v: unknown, path: string, max: number, errors: string[], required: boolean): string | undefined {
  if (v === undefined || v === null) {
    if (required) errors.push(`${path} is required`)
    return undefined
  }
  if (typeof v !== "string") {
    errors.push(`${path} must be a string`)
    return undefined
  }
  const t = v.trim()
  if (required && t.length === 0) errors.push(`${path} must not be empty`)
  if (t.length > max) errors.push(`${path} must be at most ${max} characters`)
  return t.length === 0 && !required ? undefined : t
}

function isoDate(v: unknown, path: string, errors: string[]): string | undefined {
  if (typeof v !== "string" || Number.isNaN(Date.parse(v))) {
    errors.push(`${path} must be an ISO 8601 date string`)
    return undefined
  }
  return v
}

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function parseItem(v: unknown, path: string, errors: string[]): Item | undefined {
  if (!isRecord(v)) {
    errors.push(`${path} must be an object`)
    return undefined
  }
  const id = str(v.id, `${path}.id`, LIMITS.id, errors, true)
  if (id && !ID_PATTERN.test(id)) errors.push(`${path}.id has invalid characters`)
  const text = str(v.text, `${path}.text`, LIMITS.itemText, errors, true)
  const url = str(v.url, `${path}.url`, 2048, errors, false)
  if (url && !isHttpUrl(url)) errors.push(`${path}.url must be an http(s) URL`)
  const credit = str(v.credit, `${path}.credit`, LIMITS.credit, errors, false)
  const aside = str(v.aside, `${path}.aside`, LIMITS.aside, errors, false)
  const extra = Object.keys(v).filter((k) => !["id", "text", "url", "credit", "aside"].includes(k))
  if (extra.length) errors.push(`${path} has unknown fields: ${extra.join(", ")}`)
  if (!id || !text) return undefined
  const item: Item = { id, text }
  if (url) item.url = url
  if (credit) item.credit = credit
  if (aside) item.aside = aside
  return item
}

function parseSpin(v: unknown, errors: string[]): Spin | undefined {
  if (v === undefined || v === null) return undefined
  if (!isRecord(v)) {
    errors.push("spin must be an object")
    return undefined
  }
  const color = str(v.color, "spin.color", 7, errors, true)
  if (color && !HEX_COLOR.test(color)) errors.push("spin.color must be #rrggbb")
  const font = str(v.font, "spin.font", 8, errors, true)
  if (font && !FONTS.includes(font as Font)) errors.push(`spin.font must be one of ${FONTS.join(", ")}`)
  if (!color || !font) return undefined
  return { color: color.toLowerCase(), font: font as Font }
}

/** Accepts anything, returns a clean ListDoc or a list of human-readable errors. */
export function parseListDoc(input: unknown): ParseResult {
  const errors: string[] = []
  if (!isRecord(input)) return { ok: false, errors: ["document must be an object"] }

  if (input.formatVersion !== FORMAT_VERSION) errors.push(`formatVersion must be ${FORMAT_VERSION}`)
  const id = str(input.id, "id", LIMITS.id, errors, true)
  if (id && !ID_PATTERN.test(id)) errors.push("id has invalid characters")
  const title = str(input.title, "title", LIMITS.title, errors, true)
  const subtitle = str(input.subtitle, "subtitle", LIMITS.subtitle, errors, false)
  const mode = str(input.mode, "mode", 16, errors, true)
  if (mode && !MODES.includes(mode as Mode)) errors.push(`mode must be one of ${MODES.join(", ")}`)

  const items: Item[] = []
  if (!Array.isArray(input.items)) errors.push("items must be an array")
  else {
    if (input.items.length > LIMITS.items) errors.push(`items must have at most ${LIMITS.items} entries`)
    const seen = new Set<string>()
    input.items.forEach((raw, i) => {
      const item = parseItem(raw, `items[${i}]`, errors)
      if (item) {
        if (seen.has(item.id)) errors.push(`items[${i}].id is a duplicate`)
        seen.add(item.id)
        items.push(item)
      }
    })
  }

  const spin = parseSpin(input.spin, errors)

  let author: ListDoc["author"] | undefined
  if (!isRecord(input.author)) errors.push("author must be an object")
  else {
    const handle = str(input.author.handle, "author.handle", LIMITS.handle, errors, true)
    if (handle && !HANDLE_PATTERN.test(handle)) errors.push("author.handle must be lowercase letters, digits, hyphens")
    const name = str(input.author.name, "author.name", 100, errors, false)
    if (handle) author = name ? { handle, name } : { handle }
  }

  const createdAt = isoDate(input.createdAt, "createdAt", errors)
  const updatedAt = isoDate(input.updatedAt, "updatedAt", errors)

  if (errors.length || !id || !title || !mode || !author || !createdAt || !updatedAt) {
    return { ok: false, errors }
  }
  const doc: ListDoc = { formatVersion: FORMAT_VERSION, id, title, mode: mode as Mode, items, author, createdAt, updatedAt }
  if (subtitle) doc.subtitle = subtitle
  if (spin) doc.spin = spin
  return { ok: true, doc }
}
