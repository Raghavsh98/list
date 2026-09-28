import { newId } from "./ids"
import { FORMAT_VERSION, type Author, type Item, type ListDoc, type Mode, type Spin } from "./types"

export type ItemInput = string | (Omit<Item, "id"> & { id?: string })

export type DefineListInput = {
  id?: string
  title: string
  subtitle?: string
  mode?: Mode
  items: ItemInput[]
  spin?: Spin
  author: Author | string
  createdAt?: string
  updatedAt?: string
}

/**
 * The ergonomic way to write a list by hand (starters, tests, seeds).
 * Strings become items; ids and timestamps are filled in.
 */
export function defineList(input: DefineListInput): ListDoc {
  const now = new Date().toISOString()
  const doc: ListDoc = {
    formatVersion: FORMAT_VERSION,
    id: input.id ?? newId(),
    title: input.title,
    mode: input.mode ?? "plain",
    items: input.items.map((it) =>
      typeof it === "string" ? { id: newId(), text: it } : { ...it, id: it.id ?? newId() },
    ),
    author: typeof input.author === "string" ? { handle: input.author } : input.author,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? input.createdAt ?? now,
  }
  if (input.subtitle) doc.subtitle = input.subtitle
  if (input.spin) doc.spin = input.spin
  return doc
}
