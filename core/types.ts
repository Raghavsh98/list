/**
 * The format. A list is a small, plain, portable document.
 * This file has no dependencies and must never import from React, Next, or the database.
 */

export const FORMAT_VERSION = 1 as const

export type Mode = "plain" | "ranked" | "checkable"
export const MODES: readonly Mode[] = ["plain", "ranked", "checkable"]

export type Font = "serif" | "sans" | "mono"
export const FONTS: readonly Font[] = ["serif", "sans", "mono"]

export type Item = {
  id: string
  /** The thing. */
  text: string
  /** Favicon is derived from the hostname. */
  url?: string
  /** Muted attribution: "David Hume, 1757", "dir. Kubrick", "via @flo". */
  credit?: string
  /** The author's voice. Italic. First-class. */
  aside?: string
  /** One http(s) image. Optional, never required, never decorative chrome. */
  image?: string
}

export type Spin = {
  /** One accent colour, #rrggbb. */
  color: string
  font: Font
}

export type Author = {
  handle: string
  name?: string
}

/** What survives if the platform dies. */
export type ListDoc = {
  formatVersion: typeof FORMAT_VERSION
  id: string
  title: string
  subtitle?: string
  mode: Mode
  items: Item[]
  spin?: Spin
  author: Author
  createdAt: string
  updatedAt: string
}

export type Visibility = "public" | "unlisted"

/** Platform-only fields. Never part of the portable document. */
export type ListRecord = ListDoc & {
  userId: string
  slug: string
  visibility: Visibility
}

export const LIMITS = {
  title: 200,
  subtitle: 500,
  items: 500,
  itemText: 500,
  credit: 200,
  aside: 1000,
  url: 2048,
  id: 64,
  handle: 32,
} as const
