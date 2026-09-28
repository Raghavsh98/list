import type { NextRequest } from "next/server"
import { SHORT_PATTERN } from "@/core/ids"
import { store } from "@/lib/db"
import { EMBED_WIDTH, embedHeight, embedHtml } from "@/lib/embed"
import { siteUrl } from "@/lib/site"

const notFound = () => new Response("not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } })
const badRequest = (msg: string) =>
  new Response(`${msg}\n`, { status: 400, headers: { "content-type": "text/plain; charset=utf-8" } })

/**
 * oEmbed provider (https://oembed.com). Consumers find it through the discovery link on
 * every list page; given a list URL (canonical or short) it answers with the iframe.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const format = params.get("format") ?? "json"
  if (format !== "json") return new Response("only json\n", { status: 501, headers: { "content-type": "text/plain; charset=utf-8" } })

  const raw = params.get("url")
  if (!raw) return badRequest("url is required")
  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return badRequest("url is not a URL")
  }
  if (target.origin !== siteUrl && target.origin !== req.nextUrl.origin) return notFound()

  const segments = target.pathname.split("/").filter(Boolean)
  const list =
    segments.length === 2 && segments[0] === "l" && SHORT_PATTERN.test(segments[1].toLowerCase())
      ? await store.getListByShort(segments[1].toLowerCase())
      : segments.length === 2 || (segments.length === 3 && segments[0] === "embed")
        ? await store.getList(segments.at(-2)!, segments.at(-1)!.replace(/\.(md|json)$/, ""))
        : null
  if (!list) return notFound()

  const { handle, slug, doc } = list
  const maxwidth = Number(params.get("maxwidth")) || EMBED_WIDTH
  const body = {
    version: "1.0",
    type: "rich",
    provider_name: "List",
    provider_url: siteUrl,
    title: doc.title,
    author_name: doc.author.name ?? `@${handle}`,
    author_url: `${siteUrl}/${handle}`,
    width: Math.min(EMBED_WIDTH, maxwidth),
    height: embedHeight(doc),
    html: embedHtml(handle, slug, doc),
    cache_age: 3600,
  }
  return Response.json(body, {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
