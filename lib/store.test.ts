import { describe, expect, it } from "vitest"
import { defineList } from "@/core/define"
import { MemoryStore } from "./memory-store"
import { rank, searchText, type StoredList } from "./store"

function list(handle: string, slug: string, title: string, items: string[], subtitle?: string): StoredList {
  return {
    handle,
    slug,
    visibility: "public",
    doc: defineList({ title, subtitle, mode: "plain", author: handle, items }),
  }
}

const lists = [
  list("mira", "headphones", "Headphones", ["Sennheiser HD 600", "AirPods Max"], "Worth the money"),
  list("tomas", "walks", "Walks in Lisbon", ["Graça to Alfama", "Headphones optional"]),
]

describe("search ranking", () => {
  it("puts a title match above an item match", () => {
    const hits = rank(lists, "headphones", 10)
    expect(hits.map((h) => h.slug)).toEqual(["headphones", "walks"])
    expect(hits[1].matchedItem).toBe("Headphones optional")
  })

  it("ignores case and accents, and returns nothing for an empty query", () => {
    expect(rank(lists, "  LISBOA ", 10)).toHaveLength(0)
    expect(rank(lists, "lisbon", 10)).toHaveLength(1)
    expect(rank(lists, "   ", 10)).toHaveLength(0)
  })

  it("matches the author as well as the list", () => {
    expect(rank(lists, "mira", 10).map((h) => h.handle)).toEqual(["mira"])
  })

  it("flattens every searchable field into one string", () => {
    expect(searchText(lists[0])).toContain("AirPods Max")
    expect(searchText(lists[0])).toContain("Worth the money")
  })
})

describe("memory store", () => {
  it("hides unlisted lists from the feed, search and public profiles", async () => {
    const store = new MemoryStore()
    const unlisted: StoredList = { ...list("mira", "secret", "Secret plans", ["Move"]), visibility: "unlisted" }
    await store.save(unlisted)

    expect((await store.feed()).some((l) => l.slug === "secret")).toBe(false)
    expect(await store.search("secret plans")).toHaveLength(0)
    expect((await store.listsByHandle("mira")).some((l) => l.slug === "secret")).toBe(false)
    expect((await store.listsByHandle("mira", true)).some((l) => l.slug === "secret")).toBe(true)
    expect(await store.getList("mira", "secret")).not.toBeNull()
  })

  it("replaces a list saved at the same path, and removes it", async () => {
    const store = new MemoryStore()
    await store.save(list("mira", "headphones", "Headphones, again", ["One"]))
    expect((await store.getList("mira", "headphones"))?.doc.title).toBe("Headphones, again")
    await store.remove("mira", "headphones")
    expect(await store.getList("mira", "headphones")).toBeNull()
  })
})
