import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { List } from "@/components/list"
import { spinVars } from "@/components/list/spin"
import { getAllListPaths, getList } from "@/lib/lists"

export async function generateStaticParams() {
  return getAllListPaths()
}

export async function generateMetadata({ params }: PageProps<"/[handle]/[slug]">): Promise<Metadata> {
  const { handle, slug } = await params
  const doc = await getList(handle, slug)
  if (!doc) return {}
  const description = doc.subtitle ?? `A list by ${doc.author.name ?? handle}`
  const url = `/${handle}/${slug}`
  return {
    title: doc.title,
    description,
    alternates: { canonical: url },
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
  const doc = await getList(handle, slug)
  if (!doc) notFound()

  return (
    <div className="page" style={spinVars(doc.spin)}>
      <main id="content" className="mx-auto max-w-[40rem] px-6 pt-20 pb-24 sm:pt-28">
        <List doc={doc} />
      </main>
      <footer className="mx-auto max-w-[40rem] px-6 pb-12 text-[0.8125rem] text-(--muted)">
        <Link href={`/${handle}`} className="hover:text-(--fg)">
          More lists by {doc.author.name ?? `@${handle}`}
        </Link>
        <span aria-hidden="true"> · </span>
        <Link href="/" className="hover:text-(--fg)">
          Made with List
        </Link>
      </footer>
    </div>
  )
}
