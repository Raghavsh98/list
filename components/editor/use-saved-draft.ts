"use client"

import { useMemo, useSyncExternalStore } from "react"
import type { Draft } from "./draft"

const PREFIX = "list:draft:"

/**
 * Drafts live in the author's browser until there is a database and a session to own them.
 *
 * The draft is read once, as it was when the editor opened. Reading it through
 * useSyncExternalStore keeps hydration honest — the server renders nothing and the client
 * fills it in after mount — and the snapshot deliberately ignores later autosaves, so the
 * author is offered their old draft rather than chased by their own typing.
 */
const snapshots = new Map<string, string | null>()
const noSubscribe = () => () => {}

export function useSavedDraft(key: string): Draft | null {
  const raw = useSyncExternalStore(
    noSubscribe,
    () => {
      if (!snapshots.has(key)) {
        try {
          snapshots.set(key, window.localStorage.getItem(PREFIX + key))
        } catch {
          snapshots.set(key, null)
        }
      }
      return snapshots.get(key) ?? null
    },
    () => null,
  )

  return useMemo(() => {
    if (!raw) return null
    try {
      return JSON.parse(raw) as Draft
    } catch {
      return null
    }
  }, [raw])
}

export function saveDraft(key: string, draft: Draft): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(draft))
  } catch {
    /* private mode or a full quota: the editor keeps working, it just won't remember */
  }
}

export function clearDraft(key: string): void {
  snapshots.set(key, null)
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* nothing to do */
  }
}
