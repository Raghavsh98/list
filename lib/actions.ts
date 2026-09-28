"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { newId } from "@/core/ids"
import { SLUG_PATTERN, slugify } from "@/core/slug"
import { FORMAT_VERSION, type Visibility } from "@/core/types"
import { parseListDoc } from "@/core/validate"
import { getAuthor, getViewer, safeNext } from "./author"
import { store } from "./db"
import { handleError } from "./handles"
import { WRITE_LIMITS, allow } from "./rate-limit"

export type PublishInput = {
  id?: string
  slug?: string
  title: string
  subtitle?: string
  mode: string
  visibility: Visibility
  items: { id?: string; text: string; url?: string; credit?: string; aside?: string; image?: string }[]
  createdAt?: string
}

export type PublishResult = { ok: true; url: string } | { ok: false; errors: string[] }

const clean = (v?: string | null) => {
  const t = v?.trim()
  return t ? t : undefined
}

/**
 * The single write path. The author comes from the session, never from the payload, and
 * everything the editor produces goes through core validation before it can reach storage.
 */
export async function publishList(input: PublishInput): Promise<PublishResult> {
  const author = await getAuthor()
  if (!author) return { ok: false, errors: ["Sign in to publish."] }
  const { handle } = author
  if (!allow(`publish:${author.userId}`, WRITE_LIMITS.publish.max, WRITE_LIMITS.publish.windowMs)) {
    return { ok: false, errors: ["That’s a lot of publishing. Take a breath and try again in a few minutes."] }
  }

  const errors: string[] = []
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
    author: { handle, name: author.name },
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  })

  if (!parsed.ok) errors.push(...parsed.errors)
  if (errors.length || !parsed.ok) return { ok: false, errors }

  const existing = await store.getList(handle, slug)
  if (existing && existing.doc.id !== parsed.doc.id) {
    return { ok: false, errors: [`You already have a list at /${handle}/${slug}. Choose another link.`] }
  }

  await store.save({ handle, slug, visibility: input.visibility, doc: parsed.doc })

  revalidatePath("/")
  revalidatePath(`/${handle}`)
  revalidatePath(`/${handle}/${slug}`)
  return { ok: true, url: `/${handle}/${slug}` }
}

/** Native form post from the edit page; the author is the session, the slug is the field. */
export async function deleteList(formData: FormData): Promise<void> {
  const author = await getAuthor()
  const slug = String(formData.get("slug") ?? "")
  if (!author || !SLUG_PATTERN.test(slug)) redirect("/")
  await store.remove(author.handle, slug)
  revalidatePath("/")
  revalidatePath(`/${author.handle}`)
  redirect(`/${author.handle}`)
}

/**
 * Handles are chosen once. Unowned handles (the seeded ones) can be claimed by the first
 * account to ask, which is how the first author takes their own name.
 */
export async function claimHandle(formData: FormData): Promise<void> {
  const viewer = await getViewer()
  const next = safeNext(String(formData.get("next") ?? ""), "/new")
  if (!viewer) redirect(`/signin?next=${encodeURIComponent(next)}`)
  if (viewer.profile) redirect(next)

  const handle = String(formData.get("handle") ?? "").trim().toLowerCase()
  const name = clean(String(formData.get("name") ?? "")) ?? viewer.name
  const invite = String(formData.get("invite") ?? "").trim()

  const back = (error: string) =>
    `/claim?next=${encodeURIComponent(next)}&handle=${encodeURIComponent(handle)}&name=${encodeURIComponent(name)}&error=${error}`

  if (!allow(`claim:${viewer.userId}`, WRITE_LIMITS.claim.max, WRITE_LIMITS.claim.windowMs)) redirect(back("slow"))
  const required = process.env.INVITE_CODE
  if (required && invite !== required) redirect(back("invite"))
  if (handleError(handle)) redirect(back("handle"))
  if (name.length > 80) redirect(back("name"))

  const taken = await store.getProfile(handle)
  if (taken?.userId) redirect(back("taken"))

  await store.saveProfile({ handle, name: name.slice(0, 80), bio: taken?.bio, link: taken?.link, userId: viewer.userId })
  revalidatePath(`/${handle}`)
  redirect(next)
}
