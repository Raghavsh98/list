import { toJSON } from "@/core/json"
import { toMarkdown } from "@/core/markdown"
import { store } from "@/lib/db"

/**
 * The agent-readable twins, reached as /:handle/:slug.json and .md (see next.config.ts).
 * The format rides in the path: a query string added by a rewrite is not visible to the handler.
 * Same document, no HTML, no JavaScript, CORS open because reading is public.
 */
export async function GET(req: Request, ctx: RouteContext<"/api/twin/[format]/[handle]/[slug]">) {
  const { format, handle, slug } = await ctx.params
  if (format !== "md" && format !== "json") return new Response("not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } })
  const list = await store.getList(handle, slug)
  if (!list) return new Response("not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } })

  const origin = new URL(req.url).origin
  const body =
    format === "md"
      ? toMarkdown(list.doc)
      : toJSON(list.doc, { url: `${origin}/${handle}/${slug}`, schema: `${origin}/schema/list-v1.json` })

  return new Response(body, {
    headers: {
      "content-type": format === "md" ? "text/markdown; charset=utf-8" : "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
    },
  })
}
