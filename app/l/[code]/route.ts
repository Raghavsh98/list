import { NextResponse } from "next/server"
import { SHORT_PATTERN } from "@/core/ids"
import { store } from "@/lib/db"

/**
 * /l/<code> → /handle/slug. A temporary redirect on purpose: if a list is ever re-slugged,
 * a browser that cached a permanent one would keep sending people to the old address.
 */
export async function GET(request: Request, { params }: RouteContext<"/l/[code]">) {
  const code = (await params).code.toLowerCase()
  const list = SHORT_PATTERN.test(code) ? await store.getListByShort(code) : null
  if (!list) return new NextResponse("No list here.", { status: 404, headers: { "content-type": "text/plain" } })
  const url = new URL(request.url)
  return NextResponse.redirect(new URL(`/${list.handle}/${list.slug}${url.search}`, request.url), 307)
}
