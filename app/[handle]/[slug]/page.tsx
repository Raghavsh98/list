import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { List } from "@/components/list"
import { spinVars } from "@/components/list/spin"
import { SiteHeader } from "@/components/site/site-header"
import { getAuthor } from "@/lib/author"
import { store } from "@/lib/db"
import { embedHtml } from "@/lib/embed"
import { siteHost, siteUrl } from "@/lib/site"

export async function generateMetadata({ params }: PageProps<"/[handle]/[slug]">): Promise<Metadata> {
  const { handle, slug } = await params
  const list = await store.getList(handle, slug)
  if (!list) return { title: "Not found" }
  const { doc } = list
  const description = doc.subtitle ?? `A list by ${doc.author.name ?? handle}`
  const url = `/${handle}/${slug}`
  return {
    title: doc.title,
    description,
    alternates: {
      canonical: url,
      types: {
        "application/json": `${url}.json`,
        "text/markdown": `${url}.md`,
        "application/json+oembed": `/api/oembed?url=${encodeURIComponent(`${siteUrl}${url}`)}`,
      },
    },
    robots: list.visibility === "unlisted" ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url,
      title: doc.title,
      description,
      siteName: "List",
      authors: [doc.author.name ?? `@${handle}`],
      publishedTime: doc.createdAt,
      modifiedTime: doc.updatedAt,
    },
    twitter: { card: "summary_large_image", title: doc.title, description },
  }
}

export default async function ListPage({ params }: PageProps<"/[handle]/[slug]">) {
  const { handle, slug } = await params
  const list = await store.getList(handle, slug)
  if (!list) notFound()
  const { doc } = list
  const author = await getAuthor()
  const mine = author?.handle === handle

  return (
    <div className="page" style={spinVars(doc.spin)}>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-16">
        <List doc={doc} />
      </main>
      <footer className="mx-auto max-w-[52rem] px-6 pb-16 text-[0.8125rem] text-(--muted)">
        {list.short && (
          <p className="mb-3">
            Short link{" "}
            <a href={`/l/${list.short}`} className="select-all text-(--fg)">
              {siteHost}/l/{list.short}
            </a>
          </p>
        )}
        <Link href={`/${handle}`} className="hover:text-(--fg)">
          More lists by {doc.author.name ?? `@${handle}`}
        </Link>
        {mine && (
          <>
            <span aria-hidden="true"> · </span>
            <Link href={`/${handle}/${slug}/edit`} className="hover:text-(--fg)">
              Edit
            </Link>
          </>
        )}
        <span aria-hidden="true"> · </span>
        <a href={`/${handle}/${slug}.md`} className="hover:text-(--fg)">
          .md
        </a>
        <span aria-hidden="true"> · </span>
        <a href={`/${handle}/${slug}.json`} className="hover:text-(--fg)">
          .json
        </a>
        <details className="mt-3">
          <summary className="inline cursor-pointer hover:text-(--fg)">Embed</summary>
          <p className="mt-2">Paste this where HTML goes. Pasting the plain link works too where oEmbed is understood.</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap [overflow-wrap:anywhere] font-mono text-[0.75rem] text-(--fg) select-all">
            {embedHtml(handle, slug, doc)}
          </pre>
        </details>
      </footer>
    </div>
  )
}
