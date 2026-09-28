import type { ListDoc, Visibility } from "@/core/types"

export type Profile = {
  handle: string
  name: string
  bio?: string
  /** Where the author sends people: one link, no link farm. */
  link?: string
  /** The signed-in account that owns this handle. Absent for seeded authors. */
  userId?: string
}

export type StoredList = {
  handle: string
  slug: string
  visibility: Visibility
  /** The short code behind /l/<code>. Assigned once by the store, never by the author. */
  short?: string
  doc: ListDoc
}

export type SearchHit = StoredList & {
  /** Why this matched: the item line, if the hit came from one. */
  matchedItem?: string
}

/**
 * The data layer. Everything above it (pages, actions, search) talks to this interface only,
 * so swapping implementations is one file, not a refactor.
 */
export interface Store {
  getProfile(handle: string): Promise<Profile | null>
  /** The handle a signed-in account has claimed, if any. */
  getProfileByUser(userId: string): Promise<Profile | null>
  saveProfile(profile: Profile): Promise<Profile>
  getList(handle: string, slug: string): Promise<StoredList | null>
  getListByShort(code: string): Promise<StoredList | null>
  /** Unlisted lists are included only for the author's own view. */
  listsByHandle(handle: string, includeUnlisted?: boolean): Promise<StoredList[]>
  /** Public lists, newest edit first. */
  feed(limit?: number): Promise<StoredList[]>
  search(query: string, limit?: number): Promise<SearchHit[]>
  save(list: StoredList): Promise<StoredList>
  remove(handle: string, slug: string): Promise<void>
  allPaths(): Promise<{ handle: string; slug: string }[]>
}

export function norm(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
}

/** Everything a list can be searched by, flattened once so both stores match the same way. */
export function searchText(list: StoredList): string {
  const { doc } = list
  const parts = [doc.title, doc.subtitle, doc.author.name, list.handle, list.slug]
  for (const item of doc.items) parts.push(item.text, item.credit, item.aside)
  return parts.filter(Boolean).join(" ")
}

/** Scores a list against a normalised query. Title beats author beats subtitle beats items. */
export function score(list: StoredList, q: string): { score: number; matchedItem?: string } {
  const title = norm(list.doc.title)
  let s = 0
  if (title === q) s += 100
  else if (title.startsWith(q)) s += 60
  else if (title.includes(q)) s += 40
  if (list.doc.subtitle && norm(list.doc.subtitle).includes(q)) s += 15
  if (norm(list.handle).includes(q) || norm(list.doc.author.name ?? "").includes(q)) s += 25

  let matchedItem: string | undefined
  for (const item of list.doc.items) {
    const hay = norm([item.text, item.credit, item.aside].filter(Boolean).join(" "))
    if (hay.includes(q)) {
      s += 8
      matchedItem ??= item.text
    }
  }
  return { score: s, matchedItem }
}

export function rank(lists: StoredList[], query: string, limit: number): SearchHit[] {
  const q = norm(query.trim())
  if (!q) return []
  return lists
    .map((l) => ({ list: l, ...score(l, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.list.doc.updatedAt.localeCompare(a.list.doc.updatedAt))
    .slice(0, limit)
    .map(({ list, matchedItem }) => ({ ...list, matchedItem }))
}
