export function hostnameOf(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.protocol !== "http:" && u.protocol !== "https:") return null
    return u.hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

/**
 * Favicons are served from our own origin so a reader's IP never reaches a third party
 * just for opening a list. The route caches aggressively.
 */
export function faviconPath(url: string, base = "/api/favicon"): string | null {
  const host = hostnameOf(url)
  return host ? `${base}?domain=${encodeURIComponent(host)}` : null
}
