import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "./auth"
import { store } from "./db"
import type { Profile } from "./store"

/** Whoever is signed in. `profile` is null until they have claimed a handle. */
export type Viewer = {
  userId: string
  name: string
  email: string
  profile: Profile | null
}

export type Author = { userId: string; handle: string; name: string }

/**
 * Session lookup, once per request. Public reading never calls this; it only runs on the
 * pages and actions that write, or that show an author their own controls.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  let session: Awaited<ReturnType<typeof auth.api.getSession>>
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch (error) {
    // Reading must never fail because sign-in did; treat as signed out and say so in the log.
    console.error("[auth] getSession failed", error)
    return null
  }
  if (!session) return null
  const { user } = session
  const profile = await store.getProfileByUser(user.id)
  return { userId: user.id, name: user.name, email: user.email, profile }
})

/** A signed-in viewer who has claimed a handle. Every write requires one. */
export async function getAuthor(): Promise<Author | null> {
  const viewer = await getViewer()
  if (!viewer?.profile) return null
  return { userId: viewer.userId, handle: viewer.profile.handle, name: viewer.profile.name }
}

/** Only relative paths on this site; never a bounce to somewhere else. */
export function safeNext(next: string | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback
  return next
}
