import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getListsByHandle } from "@/lib/lists"

export async function generateMetadata({ params }: PageProps<"/[handle]">): Promise<Metadata> {
  const { handle } = await params
  const lists = await getListsByHandle(handle)
  const name = lists[0]?.doc.author.name ?? `@${handle}`
  const description = `Lists by ${name}`
  return {
    title: name,
    description,
    alternates: { canonical: `/${handle}` },
    openGraph: { type: "profile", url: `/${handle}`, title: name, description, siteName: "List" },
    twitter: { card: "summary", title: name, description },
  }
}

export default async function ProfilePage({ params }: PageProps<"/[handle]">) {
  const { handle } = await params
  const lists = await getListsByHandle(handle)
  if (lists.length === 0) notFound()
  const name = lists[0].doc.author.name ?? `@${handle}`

  return (
    <main className="mx-auto max-w-[40rem] px-6 pt-20 pb-24 sm:pt-28">
      <header className="mb-10">
        <h1 className="text-2xl font-medium tracking-tight">{name}</h1>
        <p className="mt-1 text-(--muted)">@{handle}</p>
      </header>
      <ul className="m-0 list-none p-0">
        {lists.map(({ slug, doc }) => (
          <li key={slug}>
            <Link href={`/${handle}/${slug}`} className="group flex items-baseline gap-3 py-2">
              <span className="grow">
                <span className="group-hover:underline underline-offset-3">{doc.title}</span>
                {doc.subtitle && <span className="block text-[0.9375rem] text-(--muted)">{doc.subtitle}</span>}
              </span>
              <span className="shrink-0 text-[0.8125rem] text-(--muted) tabular-nums">{doc.items.length}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
