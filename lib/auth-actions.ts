"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import { safeNext } from "./author"

/**
 * Plain forms, no client JavaScript: the browser posts here, we ask Better Auth for
 * Google's authorisation URL, and send the browser there. After Google, Better Auth
 * lands the browser on /claim, which forwards to `next` once a handle exists.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(String(formData.get("next") ?? ""), "/new")
  const callbackURL = `/claim?next=${encodeURIComponent(next)}`
  const res = await auth.api.signInSocial({
    headers: await headers(),
    body: { provider: "google", callbackURL, errorCallbackURL: "/signin?error=google" },
  })
  if (!res.url) redirect("/signin?error=google")
  redirect(res.url)
}

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() })
  redirect("/")
}
