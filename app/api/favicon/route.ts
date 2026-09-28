import type { NextRequest } from "next/server"

const DOMAIN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i

const FALLBACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#d4d4d4"/></svg>`

const SOURCES = (domain: string) => [
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
]

/**
 * Favicon proxy. Readers only ever talk to us; upstream lookups happen server-side and are cached
 * at the edge for a week. A missing icon returns a neutral square instead of a broken image.
 */
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.toLowerCase() ?? ""
  if (!DOMAIN.test(domain) || domain.length > 253) {
    return new Response("bad domain", { status: 400 })
  }

  for (const url of SOURCES(domain)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000), next: { revalidate: 60 * 60 * 24 * 7 } })
      const type = res.headers.get("content-type") ?? ""
      if (!res.ok || !type.startsWith("image/")) continue
      const body = await res.arrayBuffer()
      if (body.byteLength === 0 || body.byteLength > 200_000) continue
      return new Response(body, {
        headers: {
          "content-type": type,
          "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        },
      })
    } catch {
      /* try next source */
    }
  }

  return new Response(FALLBACK, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
