import { ImageResponse } from "next/og"
import type { ListDoc } from "@/core/types"
import { store } from "@/lib/db"

export const alt = "A list"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG = "#fbfbfa"
const FG = "#1a1a1a"
const MUTED = "#6f6f6f"
const SHOWN = 5

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

/** Roughly how many items fit under the heading without pushing the footer off the canvas. */
function fits(doc: ListDoc): number {
  const titleLines = Math.ceil(clip(doc.title, 70).length / 34)
  const subLines = doc.subtitle ? Math.ceil(clip(doc.subtitle, 100).length / 62) : 0
  let room = 630 - 120 - 32 - 24 - titleLines * 62 - (subLines ? 14 + subLines * 39 : 0) - 40
  let n = 0
  for (const item of doc.items.slice(0, SHOWN)) {
    const cost = 36 + (item.aside ? 31 : 0) + 12
    const tail = doc.items.length > n + 1 ? 31 : 0
    if (room - cost < tail) break
    room -= cost
    n++
  }
  return Math.max(1, n)
}

/**
 * The card a list wears when its link is pasted somewhere. Monochrome, the first few items
 * as they read on the page, the author at the bottom. Drawn with the default font (Geist).
 */
export default async function Image({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params
  const list = await store.getList(handle, slug)
  const doc = list?.doc
  const items = doc ? doc.items.slice(0, fits(doc)) : []
  const more = (doc?.items.length ?? 0) - items.length

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px 56px",
          background: BG,
          color: FG,
          fontSize: 28,
          lineHeight: 1.3,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontSize: 56, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {doc ? clip(doc.title, 70) : "Nothing here"}
          </div>
          {doc?.subtitle && (
            <div style={{ marginTop: 14, fontSize: 30, color: MUTED }}>{clip(doc.subtitle, 100)}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, gap: 12 }}>
            {items.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "baseline" }}>
                <div style={{ width: 56, color: MUTED, fontSize: 24, flexShrink: 0, display: "flex" }}>
                  {doc?.mode === "checkable" ? (
                    <div style={{ width: 20, height: 20, border: `2px solid ${MUTED}`, borderRadius: 4, marginTop: 4 }} />
                  ) : (
                    <div>{doc?.mode === "ranked" ? `${i + 1}.` : "–"}</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div>{clip(item.text, 64)}</div>
                  {item.aside && <div style={{ fontSize: 24, color: MUTED, fontStyle: "italic" }}>{clip(item.aside, 80)}</div>}
                </div>
              </div>
            ))}
            {more > 0 && <div style={{ marginLeft: 56, color: MUTED, fontSize: 24 }}>{`and ${more} more`}</div>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED, flexShrink: 0, paddingTop: 24 }}>
          <div>{doc ? doc.author.name ?? `@${handle}` : ""}</div>
          <div>List</div>
        </div>
      </div>
    ),
    size,
  )
}
