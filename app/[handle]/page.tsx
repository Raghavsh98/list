import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SignOut } from "@/components/site/sign-in"
import { SiteHeader } from "@/components/site/site-header"
import { getViewer } from "@/lib/author"
import { store } from "@/lib/db"

export async function generateMetadata({ params }: PageProps<"/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const profile = await store.getProfile(handle)
  if (!profile) return { title: "Not found" }
  const description = profile.bio ?? `Lists by ${profile.name}`
  return {
    title: profile.name,
    description,
    alternates: { canonical: `/${handle}` },
    openGraph: { type: "profile", url: `/${handle}`, title: profile.name, description, siteName: "List" },
    twitter: { card: "summary", title: profile.name, description },
  }
}

export default async function ProfilePage({ params }: PageProps<"/[handle]">) {
  const { handle } = await params
  const viewer = await getViewer()
  const own = viewer?.profile?.handle === handle
  const [profile, lists] = await Promise.all([
    store.getProfile(handle),
    store.listsByHandle(handle, own),
  ])
  if (!profile) notFound()

  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
        <header className="max-w-[34rem]">
          <h1 className="text-2xl font-medium tracking-tight">{profile.name}</h1>
          <p className="mt-1 text-(--muted)">@{profile.handle}</p>
          {profile.bio && <p className="mt-3 text-balance">{profile.bio}</p>}
          {profile.links?.length ? (
            <p className="mt-2 flex flex-wrap gap-x-4 text-[0.9375rem]">
              {profile.links.map((link) => (
                <a
                  key={link}
                  href={link}
                  rel="noopener noreferrer nofollow me"
                  target="_blank"
                  className="text-(--muted) underline underline-offset-4 hover:text-(--fg)"
                >
                  {link.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              ))}
            </p>
          ) : null}
        </header>

        {own && (
          <p className="mt-6 flex flex-wrap items-baseline gap-x-1 text-[0.8125rem] text-(--muted)">
            <span>This is you</span>
            <span aria-hidden="true"> · </span>
            <Link href="/settings" className="hover:text-(--fg)">
              Edit profile
            </Link>
            <span aria-hidden="true"> · </span>
            <Link href="/new" className="hover:text-(--fg)">
              Make a list
            </Link>
            <span aria-hidden="true"> · </span>
            <SignOut />
          </p>
        )}

        {lists.length === 0 ? (
          <p className="mt-12 text-(--muted)">
            No lists yet.{own && (
              <>
                {" "}
                <Link href="/new" className="underline underline-offset-4">
                  Make the first one
                </Link>
                .
              </>
            )}
          </p>
        ) : (
          <ul className="mt-10 m-0 list-none p-0">
            {lists.map(({ slug, visibility, doc }) => (
              <li key={slug}>
                <Link href={`/${handle}/${slug}`} className="group flex items-baseline gap-4 py-2.5">
                  <span className="grow">
                    <span className="group-hover:underline underline-offset-4">{doc.title}</span>
                    {doc.subtitle && (
                      <span className="block text-[0.9375rem] text-(--muted)">{doc.subtitle}</span>
                    )}
                  </span>
                  {own && visibility === "unlisted" && (
                    <span className="shrink-0 text-[0.8125rem] text-(--muted)">Unlisted</span>
                  )}
                  <span className="shrink-0 text-[0.8125rem] text-(--muted) tabular-nums">
                    {doc.items.length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
