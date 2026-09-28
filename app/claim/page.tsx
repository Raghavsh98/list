import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/site-header"
import { SignOut } from "@/components/site/sign-in"
import { claimHandle } from "@/lib/actions"
import { getViewer, safeNext } from "@/lib/author"
import { suggestHandle } from "@/lib/handles"

export const metadata: Metadata = { title: "Choose your handle", robots: { index: false } }

const ERRORS: Record<string, string> = {
  handle: "Handles are lowercase letters, digits and hyphens, up to 32 characters, and can’t be a page name.",
  taken: "Someone already has that handle. Choose another.",
  invite: "That invite code didn’t match.",
  name: "Keep your name under 80 characters.",
}

export default async function ClaimPage({ searchParams }: PageProps<"/claim">) {
  const sp = await searchParams
  const next = safeNext(typeof sp.next === "string" ? sp.next : undefined, "/new")
  const viewer = await getViewer()
  if (!viewer) redirect(`/signin?next=${encodeURIComponent(next)}`)
  if (viewer.profile) redirect(next)

  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined
  const handle = typeof sp.handle === "string" ? sp.handle : suggestHandle(viewer.name, viewer.email)
  const name = typeof sp.name === "string" ? sp.name : viewer.name
  const needsInvite = Boolean(process.env.INVITE_CODE)

  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
        <h1 className="text-[1.0625rem]">Choose your handle</h1>
        <p className="mt-2 max-w-[30rem] text-(--muted)">
          It becomes the first half of every link you make, so pick one you can say out loud. It can’t
          be changed later.
        </p>

        <form action={claimHandle} className="mt-8 flex max-w-[26rem] flex-col gap-6">
          <input type="hidden" name="next" value={next} />

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] text-(--muted)">Handle</span>
            <span className="flex items-baseline gap-1 text-[1.0625rem]">
              <span className="text-(--muted)">list/</span>
              <input
                name="handle"
                defaultValue={handle}
                required
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={32}
                pattern="[a-z0-9]([a-z0-9-]{0,30}[a-z0-9])?"
                aria-invalid={sp.error === "handle" || sp.error === "taken" || undefined}
                aria-describedby={error ? "claim-error" : undefined}
                className="w-full bg-transparent py-1 outline-none"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] text-(--muted)">Name, as shown on your lists</span>
            <input
              name="name"
              defaultValue={name}
              maxLength={80}
              className="w-full bg-transparent py-1 text-[1.0625rem] outline-none"
            />
          </label>

          {needsInvite && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.8125rem] text-(--muted)">Invite code</span>
              <input
                name="invite"
                required
                autoComplete="off"
                aria-invalid={sp.error === "invite" || undefined}
                className="w-full bg-transparent py-1 text-[1.0625rem] outline-none"
              />
            </label>
          )}

          {error && (
            <p id="claim-error" role="alert" className="text-[0.9375rem]">
              {error}
            </p>
          )}

          <div className="flex items-center gap-6">
            <button
              type="submit"
              className="rounded-sm bg-(--fg) px-4 py-2 text-[0.9375rem] text-(--bg) hover:opacity-90"
            >
              Claim it
            </button>
            <span className="text-[0.8125rem] text-(--muted)">
              Signed in as {viewer.email} · <SignOut />
            </span>
          </div>
        </form>
      </main>
    </div>
  )
}
