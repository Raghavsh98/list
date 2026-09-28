"use client"

import { useSyncExternalStore } from "react"
import { isChecked, subscribe, toggle } from "./check-store"

type Props = { listId: string; itemId: string; label: string }

/**
 * The only JavaScript a list page needs, and only in checkable mode.
 * Without JS the native checkbox still toggles; it just forgets on reload.
 */
export function ListCheck({ listId, itemId, label }: Props) {
  const checked = useSyncExternalStore(
    (fn) => subscribe(listId, fn),
    () => isChecked(listId, itemId),
    () => false,
  )
  return (
    <label className="list-check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => toggle(listId, itemId, e.target.checked)}
        aria-label={label}
      />
      <span className="list-checkbox" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5 10 18 19 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  )
}
