"use server"

import { revalidatePath } from "next/cache"
import { newId } from "@/core/ids"
import { HANDLE_PATTERN, SLUG_PATTERN, slugify } from "@/core/slug"
import { FORMAT_VERSION, type Visibility } from "@/core/types"
import { parseListDoc } from "@/core/validate"
import { store } from "./db"

export type PublishInput = {
  id?: string
  handle: string
  name?: string
  slug?: string
  title: string
  subtitle?: string
  mode: string
  visibility: Visibility
  items: { id?: string; text: string; url?: string; credit?: string; aside?: string; image?: string }[]
  createdAt?: string
}

export type PublishResult = { ok: true; url: string } | { ok: false; errors: string[] }

const clean = (v?: string) => {
  const t = v?.trim()
  return t ? t : undefined
}

/**
 * The single write path. Everything the editor produces goes through core validation first,
 * so a malformed document can never reach storage and the editor only ever sees clean errors.
 *
 * TODO(auth): once Google sign-in lands, take the handle from the session instead of the payload
 * and reject writes to a handle the signed-in author does not own.
 */
export async function publishList(input: PublishInput): Promise<PublishResult> {
  const errors: string[] = []

  const handle = (clean(input.handle) ?? "").toLowerCase()
  if (!HANDLE_PATTERN.test(handle)) errors.push("Handle must be lowercase letters, digits or hyphens.")

  const title = clean(input.title)
  if (!title) errors.push("A list needs a title.")

  const slug = (clean(input.slug) ?? slugify(title ?? "")).toLowerCase()
  if (!SLUG_PATTERN.test(slug)) errors.push("The link can only use lowercase letters, digits and hyphens.")

  const items = input.items
    .filter((i) => clean(i.text))
    .map((i) => ({
      id: i.id && i.id.length <= 64 ? i.id : newId(),
      text: clean(i.text)!,
      url: clean(i.url),
      credit: clean(i.credit),
      aside: clean(i.aside),
      image: clean(i.image),
    }))

  if (items.length === 0) errors.push("A list needs at least one item.")

  const now = new Date().toISOString()
  const parsed = parseListDoc({
    formatVersion: FORMAT_VERSION,
    id: clean(input.id) ?? newId(),
    title,
    subtitle: clean(input.subtitle),
    mode: input.mode,
    items,
    author: { handle, name: clean(input.name) },
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  })

  if (!parsed.ok) errors.push(...parsed.errors)
  if (errors.length || !parsed.ok) return { ok: false, errors }

  const existing = await store.getList(handle, slug)
  if (existing && existing.doc.id !== parsed.doc.id) {
    return { ok: false, errors: [`There is already a list at /${handle}/${slug}. Choose another link.`] }
  }

  await store.save({ handle, slug, visibility: input.visibility, doc: parsed.doc })

  revalidatePath("/")
  revalidatePath(`/${handle}`)
  revalidatePath(`/${handle}/${slug}`)
  return { ok: true, url: `/${handle}/${slug}` }
}

export async function deleteList(handle: string, slug: string): Promise<void> {
  await store.remove(handle, slug)
  revalidatePath("/")
  revalidatePath(`/${handle}`)
}
