import Link from "next/link"
import type { StoredList } from "@/lib/store"

function preview(list: StoredList, matched?: string) {
  const texts = list.doc.items.map((i) => i.text)
  if (matched) {
    const rest = texts.filter((t) => t !== matched).slice(0, 2)
    return [matched, ...rest]
  }
  return texts.slice(0, 3)
}

/** A list in a feed: title, who, a few items. Enough to decide, not enough to replace the page. */
export function ListCard({ list, matchedItem }: { list: StoredList; matchedItem?: string }) {
  const { handle, slug, doc } = list
  const n = doc.items.length
  const lines = preview(list, matchedItem)

  return (
    <article className="py-5">
      <h2 className="text-[1.0625rem] font-medium tracking-tight">
        <Link href={`/${handle}/${slug}`} className="hover:underline underline-offset-4">
          {doc.title}
        </Link>
      </h2>
      {doc.subtitle && <p className="mt-1 text-[0.9375rem] text-(--muted)">{doc.subtitle}</p>}
      <p className="mt-2 text-[0.8125rem] text-(--muted)">
        <Link href={`/${handle}`} className="hover:text-(--fg)">
          {doc.author.name ?? `@${handle}`}
        </Link>
        <span aria-hidden="true"> · </span>
        <span>
          {n} {n === 1 ? "item" : "items"}
        </span>
      </p>
      {lines.length > 0 && (
        <ul className="mt-3 m-0 list-none p-0 text-[0.9375rem] text-(--muted)">
          {lines.map((text, i) => (
            <li key={i} className="truncate">
              {text}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
