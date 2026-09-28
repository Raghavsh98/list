import { newId } from "@/core/ids"
import type { Mode, Visibility } from "@/core/types"

export type DraftItem = {
  id: string
  text: string
  url?: string
  credit?: string
  aside?: string
  image?: string
}

export type Draft = {
  id?: string
  handle: string
  name?: string
  slug: string
  /** True until the author edits the link by hand; then we stop deriving it from the title. */
  slugTouched: boolean
  title: string
  subtitle: string
  mode: Mode
  visibility: Visibility
  items: DraftItem[]
  createdAt?: string
}

export function emptyDraft(handle: string, name?: string): Draft {
  return {
    handle,
    name,
    slug: "",
    slugTouched: false,
    title: "",
    subtitle: "",
    mode: "plain",
    visibility: "public",
    items: [{ id: newId(), text: "" }],
  }
}
