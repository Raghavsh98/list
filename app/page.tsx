import type { Metadata } from "next"
import Link from "next/link"
import { ListCard } from "@/components/site/list-card"
import { SiteHeader } from "@/components/site/site-header"
import { store } from "@/lib/db"

export const metadata: Metadata = {
  title: { absolute: "List — a list is the atom" },
  description: "Make a list, give it a link, pass it on. Public lists are free to read, always.",
  alternates: { canonical: "/" },
}

export default async function FeedPage() {
  const lists = await store.feed()

  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
        <h1 className="sr-only">Recent lists</h1>
        <p className="max-w-[34rem] text-[1.0625rem] text-balance">
          A list is the atom. What you read, what you love, what you’d save from a fire — each one
          gets a link.
        </p>
        {lists.length === 0 ? (
          <p className="mt-10 text-(--muted)">
            Nothing published yet.{" "}
            <Link href="/new" className="underline underline-offset-4">
              Make the first list
            </Link>
            .
          </p>
        ) : (
          <div className="mt-8">
            {lists.map((list) => (
              <ListCard key={`${list.handle}/${list.slug}`} list={list} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
