import { MemoryStore } from "./memory-store"
import { PgStore } from "./pg-store"
import type { Store } from "./store"

/**
 * One store for the whole app. Postgres when DATABASE_URL is set, seeded memory otherwise,
 * so the app runs (and tests run) with no database at all.
 *
 * The global cache survives development hot reloads; without it every edit to a route file
 * would wipe anything published into the in-memory store.
 */
const globalForStore = globalThis as unknown as { __listStore?: Store }

function create(): Store {
  const url = process.env.DATABASE_URL
  return url ? new PgStore(url) : new MemoryStore()
}

export const store: Store = (globalForStore.__listStore ??= create())
