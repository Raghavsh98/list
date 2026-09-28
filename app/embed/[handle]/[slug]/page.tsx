import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { List } from "@/components/list"
import { spinVars } from "@/components/list/spin"
import { store } from "@/lib/db"

/**
 * The list alone, for iframes. Same renderer, same zero-JavaScript reading; no header,
 * no search, one quiet way back to the canonical page. Never indexed on its own.
 */
export async function generateMetadata({ params }: PageProps<"/embed/[handle]/[slug]">): Promise<Metadata> {
  const { handle, slug } = await params
  const list = await store.getList(handle, slug)
  if (!list) return { title: "Not found" }
  return {
    title: list.doc.title,
    robots: { index: false, follow: true },
    alternates: { canonical: `/${handle}/${slug}` },
  }
}

export default async function EmbedPage({ params }: PageProps<"/embed/[handle]/[slug]">) {
  const { handle, slug } = await params
  const list = await store.getList(handle, slug)
  if (!list) notFound()
  const { doc } = list

  return (
    <div className="page" style={spinVars(doc.spin)}>
      <main id="content" className="px-6 pt-6 pb-4">
        <List doc={doc} />
      </main>
      <footer className="px-6 pb-6 text-[0.8125rem] text-(--muted)">
        <a href={`/${handle}/${slug}`} target="_top" className="hover:text-(--fg)">
          {doc.author.name ?? `@${handle}`} on List
        </a>
      </footer>
    </div>
  )
}
