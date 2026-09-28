import type { ListDoc } from "@/core/types"
import { bucketList } from "@/starters/bucket-list"
import { ranking } from "@/starters/ranking"
import { readingList } from "@/starters/reading-list"

/**
 * Slice 1: hardcoded. Slice 4 swaps this for Postgres; the rest of the app never notices.
 */
const LISTS: { handle: string; slug: string; doc: ListDoc }[] = [
  { handle: "raghav", slug: "design-reading", doc: readingList },
  { handle: "raghav", slug: "films", doc: ranking },
  { handle: "raghav", slug: "fire", doc: bucketList },
]

export async function getList(handle: string, slug: string): Promise<ListDoc | null> {
  return LISTS.find((l) => l.handle === handle && l.slug === slug)?.doc ?? null
}

export async function getListsByHandle(handle: string): Promise<{ slug: string; doc: ListDoc }[]> {
  return LISTS.filter((l) => l.handle === handle).map(({ slug, doc }) => ({ slug, doc }))
}

export async function getAllListPaths(): Promise<{ handle: string; slug: string }[]> {
  return LISTS.map(({ handle, slug }) => ({ handle, slug }))
}
