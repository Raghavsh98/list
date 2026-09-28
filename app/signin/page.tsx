import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SignInPrompt } from "@/components/site/sign-in-prompt"
import { getViewer, safeNext } from "@/lib/author"

export const metadata: Metadata = { title: "Sign in", robots: { index: false } }

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const sp = await searchParams
  const next = safeNext(typeof sp.next === "string" ? sp.next : undefined, "/new")
  const viewer = await getViewer()
  if (viewer) redirect(viewer.profile ? next : `/claim?next=${encodeURIComponent(next)}`)

  const failed = sp.error === "google"
  return (
    <SignInPrompt
      next={next}
      title={failed ? "Google didn’t let us in" : "Sign in to make lists"}
      body={
        failed
          ? "The sign-in was cancelled or something went wrong on Google’s side. Nothing was saved; try again whenever you like."
          : "One account, one handle, then you write. Your lists are yours: plain documents you can take with you."
      }
    />
  )
}
