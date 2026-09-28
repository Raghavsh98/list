import type { Item, Mode } from "@/core/types"
import { faviconPath } from "@/core/favicon"
import { ListCheck } from "./list-check"

type Props = { item: Item; mode: Mode; listId: string; faviconBase?: string }

export function ListItem({ item, mode, listId, faviconBase }: Props) {
  const favicon = item.url ? faviconPath(item.url, faviconBase) : null

  const thing = item.url ? (
    <a href={item.url} rel="noopener noreferrer" target="_blank">
      {favicon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="list-favicon" src={favicon} alt="" width={14} height={14} loading="lazy" decoding="async" />
      )}
      {item.text}
    </a>
  ) : (
    item.text
  )

  return (
    <li className="list-item">
      {mode === "checkable" ? (
        <ListCheck listId={listId} itemId={item.id} label={`Mark “${item.text}” as done`} />
      ) : (
        <span className="list-marker" aria-hidden="true" />
      )}
      <div className="list-body">
        <p className="list-thing">
          {thing}
          {item.credit && <span className="list-credit"> — {item.credit}</span>}
        </p>
        {item.aside && <p className="list-aside">{item.aside}</p>}
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="list-image"
            src={item.image}
            alt={item.text}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </li>
  )
}
