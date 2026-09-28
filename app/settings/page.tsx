import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/site-header"
import { SignOut } from "@/components/site/sign-in"
import { updateProfile } from "@/lib/actions"
import { PROFILE_LIMITS } from "@/lib/profile"
import { getViewer } from "@/lib/author"

export const metadata: Metadata = { title: "Edit profile", robots: { index: false } }

const ERRORS: Record<string, string> = {
  name: `Your name needs to be there, and under ${PROFILE_LIMITS.name} characters.`,
  bio: `Keep the line about you under ${PROFILE_LIMITS.bio} characters.`,
  links: "Links need to be full web addresses, like example.com or https://example.com.",
  slow: "That’s a lot of edits. Take a breath and try again in a few minutes.",
}

const field = "w-full bg-transparent py-1 text-[1.0625rem] outline-none placeholder:text-(--muted)"

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const sp = await searchParams
  const viewer = await getViewer()
  if (!viewer) redirect("/signin?next=%2Fsettings")
  if (!viewer.profile) redirect("/claim?next=%2Fsettings")
  const { handle, name, bio, links = [] } = viewer.profile
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined

  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
        <h1 className="text-[1.0625rem]">Edit profile</h1>
        <p className="mt-2 max-w-[30rem] text-(--muted)">
          What people see at{" "}
          <Link href={`/${handle}`} className="underline underline-offset-4 hover:text-(--fg)">
            list/{handle}
          </Link>
          . The handle itself stays.
        </p>

        <form action={updateProfile} className="mt-8 flex max-w-[26rem] flex-col gap-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] text-(--muted)">Name</span>
            <input
              name="name"
              defaultValue={name}
              required
              maxLength={PROFILE_LIMITS.name}
              aria-invalid={sp.error === "name" || undefined}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] text-(--muted)">One line about you</span>
            <input
              name="bio"
              defaultValue={bio}
              maxLength={PROFILE_LIMITS.bio}
              placeholder="What you do, what you keep lists of"
              aria-invalid={sp.error === "bio" || undefined}
              className={field}
            />
          </label>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-[0.8125rem] text-(--muted)">Links, up to two</legend>
            {Array.from({ length: PROFILE_LIMITS.links }, (_, i) => (
              <input
                key={i}
                name="links"
                type="url"
                inputMode="url"
                defaultValue={links[i]}
                placeholder={i === 0 ? "https://your.site" : "https://"}
                maxLength={PROFILE_LIMITS.link}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label={`Link ${i + 1}`}
                aria-invalid={sp.error === "links" || undefined}
                className={field}
              />
            ))}
          </fieldset>

          {error && (
            <p role="alert" className="text-[0.9375rem]">
              {error}
            </p>
          )}

          <div className="flex items-center gap-6">
            <button
              type="submit"
              className="rounded-sm bg-(--fg) px-4 py-2 text-[0.9375rem] text-(--bg) hover:opacity-90"
            >
              Save
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
