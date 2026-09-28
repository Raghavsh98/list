import { describe, expect, it } from "vitest"
import type { Item } from "./types"
import { defineList } from "./define"
import { faviconPath, hostnameOf } from "./favicon"
import { fromJSON, toJSON } from "./json"
import { fromMarkdown, toMarkdown } from "./markdown"
import { slugify } from "./slug"
import { parseListDoc } from "./validate"

const sample = defineList({
  id: "abc123",
  title: "Aesthetics & Beauty",
  subtitle: "A reading list on taste.",
  mode: "checkable",
  author: { handle: "raghav", name: "Raghav" },
  spin: { color: "#b3261e", font: "serif" },
  createdAt: "2026-09-28T07:00:00.000Z",
  items: [
    { id: "i1", text: "Of the Standard of Taste", url: "https://davidhume.org/texts/empl1/st", credit: "David Hume, 1757" },
    { id: "i2", text: "The Shape of Time", url: "https://yalebooks.yale.edu/book/9780300100617/", credit: "George Kubler, 1962", aside: "One of my favourites." },
    { id: "i3", text: "A thing with no link", aside: "Still counts." },
    "Just a string",
  ],
})

describe("parseListDoc", () => {
  it("accepts a valid doc and strips nothing", () => {
    const r = parseListDoc(sample)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.doc).toEqual(sample)
  })
  it("rejects unknown item fields, bad urls, bad colours, duplicate ids", () => {
    const r = parseListDoc({
      ...sample,
      spin: { color: "red", font: "comic" },
      items: [
        { id: "x", text: "a", image: "nope" },
        { id: "x", text: "b", url: "javascript:alert(1)" },
      ],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors.join("\n")).toMatch(/unknown fields: image/)
      expect(r.errors.join("\n")).toMatch(/http\(s\) URL/)
      expect(r.errors.join("\n")).toMatch(/#rrggbb/)
      expect(r.errors.join("\n")).toMatch(/duplicate/)
    }
  })
  it("allows empty items (drafts)", () => {
    expect(parseListDoc({ ...sample, items: [] }).ok).toBe(true)
  })
  it("drops unknown spin fields", () => {
    const r = parseListDoc({ ...sample, spin: { color: "#b3261e", font: "serif", mark: "📚" } })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.doc.spin).toEqual({ color: "#b3261e", font: "serif" })
  })
})

describe("json twin", () => {
  it("round-trips", () => {
    const text = toJSON(sample, { url: "https://example.com/raghav/aesthetics", schema: "https://example.com/schema/list-v1.json" })
    expect(text.startsWith('{\n  "$schema"')).toBe(true)
    const back = fromJSON(text)
    expect(back.ok).toBe(true)
    if (back.ok) expect(back.doc).toEqual(sample)
  })
})

describe("markdown twin", () => {
  it("renders the grammar", () => {
    const md = toMarkdown(sample)
    expect(md).toContain("- [ ] [Of the Standard of Taste](https://davidhume.org/texts/empl1/st) — David Hume, 1757")
    expect(md).toContain("— George Kubler, 1962 · *One of my favourites.*")
    expect(md).toContain("- [ ] A thing with no link · *Still counts.*")
    expect(md).toContain("# Aesthetics & Beauty")
    expect(md).toContain('color: "#b3261e"')
  })
  it("round-trips", () => {
    const md = toMarkdown(sample)
    let n = 0
    const back = fromMarkdown(md, { newId: () => `f${n++}` })
    expect(back.ok).toBe(true)
    if (back.ok) {
      const { items, ...rest } = back.doc
      const { items: origItems, ...origRest } = sample
      expect(rest).toEqual(origRest)
      const strip = (i: Item) => ({ text: i.text, url: i.url, credit: i.credit, aside: i.aside })
      expect(items.map(strip)).toEqual(origItems.map(strip))
    }
  })
  it("ranked uses numbers and infers mode", () => {
    const md = toMarkdown({ ...sample, mode: "ranked" })
    expect(md).toContain("1. [Of the Standard")
    let n = 0
    const back = fromMarkdown(md.replace("mode: ranked\n", ""), { newId: () => `f${n++}` })
    if (back.ok) expect(back.doc.mode).toBe("ranked")
    expect(back.ok).toBe(true)
  })
})

describe("helpers", () => {
  it("slugify", () => {
    expect(slugify("What I’d Save From a Fire!")).toBe("what-id-save-from-a-fire")
    expect(slugify("  Émigré — 2026 ")).toBe("emigre-2026")
  })
  it("favicon", () => {
    expect(hostnameOf("https://www.floguo.com/notes/x")).toBe("floguo.com")
    expect(hostnameOf("javascript:alert(1)")).toBeNull()
    expect(faviconPath("https://fx.sh/docs")).toBe("/api/favicon?domain=fx.sh")
  })
})
