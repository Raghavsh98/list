/**
 * Reader-side progress for checkable lists. Lives in the reader's browser, never on a server.
 * Key: list:<listId> → JSON array of checked item ids.
 */
const listeners = new Map<string, Set<() => void>>()
const cache = new Map<string, Set<string>>()

function key(listId: string) {
  return `list:${listId}`
}

function load(listId: string): Set<string> {
  let set = cache.get(listId)
  if (set) return set
  set = new Set<string>()
  try {
    const raw = localStorage.getItem(key(listId))
    if (raw) for (const id of JSON.parse(raw) as unknown[]) if (typeof id === "string") set.add(id)
  } catch {
    /* private mode, quota, or malformed — start empty */
  }
  cache.set(listId, set)
  return set
}

function persist(listId: string, set: Set<string>) {
  try {
    localStorage.setItem(key(listId), JSON.stringify([...set]))
  } catch {
    /* ignore */
  }
}

export function isChecked(listId: string, itemId: string): boolean {
  return load(listId).has(itemId)
}

export function toggle(listId: string, itemId: string, next?: boolean) {
  const set = load(listId)
  const on = next ?? !set.has(itemId)
  if (on) set.add(itemId)
  else set.delete(itemId)
  persist(listId, set)
  listeners.get(listId)?.forEach((fn) => fn())
}

export function subscribe(listId: string, fn: () => void): () => void {
  let set = listeners.get(listId)
  if (!set) listeners.set(listId, (set = new Set()))
  set.add(fn)
  const onStorage = (e: StorageEvent) => {
    if (e.key === key(listId)) {
      cache.delete(listId)
      fn()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    set!.delete(fn)
    window.removeEventListener("storage", onStorage)
  }
}
