import { ImageResponse } from "next/og"
import { store } from "@/lib/db"

export const alt = "A list"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG = "#fbfbfa"
const FG = "#1a1a1a"
const MUTED = "#6f6f6f"
const SHOWN = 5

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

/**
 * The card a list wears when its link is pasted somewhere. Monochrome, the first few items
 * as they read on the page, the author at the bottom. Drawn with the default font (Geist).
 */
export default async function Image({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params
  const list = await store.getList(handle, slug)
  const doc = list?.doc
  const items = doc?.items.slice(0, SHOWN) ?? []
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
        <div style={{ display: "flex", flexDirection: "column" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
          <div>{doc ? doc.author.name ?? `@${handle}` : ""}</div>
          <div>List</div>
        </div>
      </div>
    ),
    size,
  )
}
