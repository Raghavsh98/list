import { ImageResponse } from "next/og"
import { store } from "@/lib/db"

export const alt = "Lists by an author"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG = "#fbfbfa"
const FG = "#1a1a1a"
const MUTED = "#6f6f6f"

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const [profile, lists] = await Promise.all([store.getProfile(handle), store.listsByHandle(handle)])
  const titles = lists.slice(0, 5).map((l) => l.doc.title)

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
          <div style={{ fontSize: 56, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{profile?.name ?? "Nothing here"}</div>
          <div style={{ marginTop: 10, fontSize: 30, color: MUTED }}>{`@${handle}`}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, gap: 12 }}>
            {titles.map((t) => (
              <div key={t} style={{ display: "flex" }}>
                <div style={{ width: 56, color: MUTED, flexShrink: 0 }}>–</div>
                <div>{t.length > 64 ? `${t.slice(0, 63).trimEnd()}…` : t}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
          <div>{`${lists.length} ${lists.length === 1 ? "list" : "lists"}`}</div>
          <div>List</div>
        </div>
      </div>
    ),
    size,
  )
}
