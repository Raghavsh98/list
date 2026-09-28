import { FORMAT_VERSION, type Item, type ListDoc, type Mode } from "./types"
import { parseListDoc, type ParseResult } from "./validate"

/**
 * The Markdown twin. Defined as a grammar, not just pretty output, so a .md file *is* a list:
 *
 *   ---
 *   id: k3j9x2m1qa
 *   mode: checkable
 *   author: raghav
 *   name: Raghav
 *   color: "#b3261e"
 *   font: serif
 *   mark: 📚
 *   created: 2026-09-28T07:00:00.000Z
 *   updated: 2026-09-28T07:00:00.000Z
 *   ---
 *
 *   # Title
 *
 *   Subtitle paragraph.
 *
 *   - [ ] [The thing](https://…) — Credit · *Aside*
 *
 * Item line = marker, then thing (linked or plain), then optional ` — credit`, then optional ` · *aside*`.
 * Known limitation: text containing ` — ` or ` · ` or `*` is not escaped in v1.
 */

const MARKER: Record<Mode, (i: number) => string> = {
  plain: () => "- ",
  ranked: (i) => `${i + 1}. `,
  checkable: () => "- [ ] ",
}

function itemLine(item: Item, mode: Mode, index: number): string {
  let line = MARKER[mode](index)
  line += item.url ? `[${item.text}](${item.url})` : item.text
  if (item.credit) line += ` — ${item.credit}`
  if (item.aside) line += ` · *${item.aside}*`
  return line
}

function yamlValue(v: string): string {
  return /^[A-Za-z0-9][A-Za-z0-9 ._:@-]*$/.test(v) && !/^\d/.test(v) ? v : JSON.stringify(v)
}

export function toMarkdown(doc: ListDoc): string {
  const fm: [string, string][] = [
    ["id", doc.id],
    ["mode", doc.mode],
    ["author", doc.author.handle],
  ]
  if (doc.author.name) fm.push(["name", doc.author.name])
  if (doc.spin) {
    fm.push(["color", doc.spin.color], ["font", doc.spin.font])
    if (doc.spin.mark) fm.push(["mark", doc.spin.mark])
  }
  fm.push(["created", doc.createdAt], ["updated", doc.updatedAt])

  const out: string[] = ["---"]
  for (const [k, v] of fm) out.push(`${k}: ${yamlValue(v)}`)
  out.push("---", "", `# ${doc.title}`, "")
  if (doc.subtitle) out.push(doc.subtitle, "")
  doc.items.forEach((item, i) => out.push(itemLine(item, doc.mode, i)))
  out.push("")
  return out.join("\n")
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const ITEM_LINE = /^(?:- \[[ xX]\] |- |\d+\. )(.*)$/
const LINK = /^\[([^\]]*)\]\(([^)\s]+)\)(.*)$/
const ASIDE = /\s+·\s+\*(.+)\*\s*$/

function parseFrontMatter(block: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const raw of block.split(/\r?\n/)) {
    const m = /^([A-Za-z_]+):\s*(.*)$/.exec(raw)
    if (!m) continue
    let v = m[2].trim()
    if (v.startsWith('"')) {
      try {
        v = JSON.parse(v)
      } catch {
        /* keep raw */
      }
    }
    out[m[1]] = v
  }
  return out
}

function parseItemLine(body: string, fallbackId: string): Item {
  let rest = body.trim()
  const item: Item = { id: fallbackId, text: "" }

  const aside = ASIDE.exec(rest)
  if (aside) {
    item.aside = aside[1].trim()
    rest = rest.slice(0, aside.index)
  }

  const link = LINK.exec(rest)
  let tail: string
  if (link) {
    item.text = link[1].trim()
    item.url = link[2]
    tail = link[3]
  } else {
    const dash = rest.indexOf(" — ")
    item.text = (dash === -1 ? rest : rest.slice(0, dash)).trim()
    tail = dash === -1 ? "" : rest.slice(dash)
  }
  const credit = /^\s*—\s*(.+)$/.exec(tail)
  if (credit) item.credit = credit[1].trim()
  return item
}

export function fromMarkdown(md: string, fallbacks: { newId: () => string; now?: () => string }): ParseResult {
  const fmMatch = FRONT_MATTER.exec(md)
  const fm = fmMatch ? parseFrontMatter(fmMatch[1]) : {}
  const body = fmMatch ? md.slice(fmMatch[0].length) : md

  let title = fm.title
  let subtitle: string | undefined
  const items: Item[] = []
  let mode: Mode | undefined = fm.mode as Mode | undefined
  const paragraph: string[] = []

  for (const line of body.split(/\r?\n/)) {
    if (!title && line.startsWith("# ")) {
      title = line.slice(2).trim()
      continue
    }
    const im = ITEM_LINE.exec(line)
    if (im) {
      if (!mode) mode = line.startsWith("- [") ? "checkable" : /^\d/.test(line) ? "ranked" : "plain"
      items.push(parseItemLine(im[1], fallbacks.newId()))
      continue
    }
    if (line.trim() === "") {
      if (paragraph.length && !subtitle && items.length === 0) subtitle = paragraph.join(" ")
      paragraph.length = 0
      continue
    }
    paragraph.push(line.trim())
  }
  if (paragraph.length && !subtitle && items.length === 0) subtitle = paragraph.join(" ")

  const now = fallbacks.now ?? (() => new Date().toISOString())
  const raw: Record<string, unknown> = {
    formatVersion: FORMAT_VERSION,
    id: fm.id ?? fallbacks.newId(),
    title,
    subtitle,
    mode: mode ?? "plain",
    items,
    author: { handle: fm.author, name: fm.name },
    createdAt: fm.created ?? now(),
    updatedAt: fm.updated ?? now(),
  }
  if (fm.color || fm.font) raw.spin = { color: fm.color, font: fm.font, mark: fm.mark }
  return parseListDoc(raw)
}
