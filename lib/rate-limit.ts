type Window = number[]

const windows = new Map<string, Window>()

/**
 * Sliding-window limiter, per process. Writes are rare and human-paced, so a hard
 * per-user ceiling is enough to blunt scripts and stuck loops; it is not a billing meter.
 * Each serverless instance keeps its own window, so the effective ceiling is a small
 * multiple of `max` — still tight enough to matter.
 */
export function allow(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const since = now - windowMs
  const hits = (windows.get(key) ?? []).filter((t) => t > since)
  if (hits.length >= max) {
    windows.set(key, hits)
    return false
  }
  hits.push(now)
  windows.set(key, hits)
  if (windows.size > 10_000) {
    for (const [k, v] of windows) if (v.every((t) => t <= since)) windows.delete(k)
  }
  return true
}

export const WRITE_LIMITS = {
  publish: { max: 30, windowMs: 10 * 60_000 },
  claim: { max: 5, windowMs: 60 * 60_000 },
} as const
