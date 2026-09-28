import type { ListDoc } from "@/core/types"
import { ListItem } from "./list-item"
import { spinVars } from "./spin"
import "./list.css"

type Props = {
  doc: ListDoc
  /** Where favicons are fetched from. Defaults to this site's caching proxy. */
  faviconBase?: string
  /** Rendered under the subtitle: author, count, date. Pass `null` to hide. */
  byline?: React.ReactNode | null
  className?: string
}

function defaultByline(doc: ListDoc) {
  const n = doc.items.length
  const updated = new Date(doc.updatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
  return (
    <>
      <span>{doc.author.name ?? `@${doc.author.handle}`}</span>
      <span aria-hidden="true"> · </span>
      <span>
        {n} {n === 1 ? "item" : "items"}
      </span>
      <span aria-hidden="true"> · </span>
      <time dateTime={doc.updatedAt}>{updated}</time>
    </>
  )
}

/**
 * The renderer. A server component: emits semantic HTML and CSS custom properties.
 * Three modes, same item underneath. Spins are applied as variables, never as computed styles.
 */
export function List({ doc, faviconBase, byline, className }: Props) {
  const Tag = doc.mode === "ranked" ? "ol" : "ul"
  const cls = ["list", `list--${doc.mode}`, className].filter(Boolean).join(" ")
  return (
    <article className={cls} style={spinVars(doc.spin)} data-list-id={doc.id}>
      <header className="list-header">
        <h1 className="list-title">{doc.title}</h1>
        {doc.subtitle && <p className="list-subtitle">{doc.subtitle}</p>}
        {byline !== null && <p className="list-byline">{byline ?? defaultByline(doc)}</p>}
      </header>
      <Tag className="list-items">
        {doc.items.map((item) => (
          <ListItem key={item.id} item={item} mode={doc.mode} listId={doc.id} faviconBase={faviconBase} />
        ))}
      </Tag>
    </article>
  )
}
