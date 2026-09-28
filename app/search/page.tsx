import type { Metadata } from "next"
import Link from "next/link"
import { ListCard } from "@/components/site/list-card"
import { SiteHeader } from "@/components/site/site-header"
import { store } from "@/lib/db"

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams
  const query = typeof q === "string" ? q.trim() : ""
  return {
    title: query ? `Search: ${query}` : "Search",
    description: "Search public lists.",
    robots: { index: false },
  }
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams
  const query = (typeof q === "string" ? q : "").trim().slice(0, 200)
  const hits = query ? await store.search(query) : []

  return (
    <div className="page">
      <SiteHeader query={query} />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
        {!query ? (
          <>
            <h1 className="text-[1.0625rem]">Search</h1>
            <p className="mt-2 text-(--muted)">
              Type above to search public lists by title, author, or anything inside them.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-[0.9375rem] text-(--muted)" aria-live="polite">
              {hits.length === 0
                ? `No lists match “${query}”`
                : `${hits.length} ${hits.length === 1 ? "list" : "lists"} matching “${query}”`}
            </h1>
            {hits.length === 0 ? (
              <p className="mt-6 text-(--muted)">
                Try a shorter word, or{" "}
                <Link href="/new" className="underline underline-offset-4">
                  make the list yourself
                </Link>
                .
              </p>
            ) : (
              <div className="mt-4">
                {hits.map((hit) => (
                  <ListCard key={`${hit.handle}/${hit.slug}`} list={hit} matchedItem={hit.matchedItem} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
