"use client"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#fbfbfa",
          color: "#1a1a1a",
          fontFamily: "system-ui, sans-serif",
          padding: "6rem 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.0625rem", fontWeight: 500 }}>Something broke on our side</h1>
        <p style={{ color: "#6f6f6f" }}>Try again in a moment.</p>
        <button type="button" onClick={reset} style={{ marginTop: "1.5rem", padding: "0.5rem 1rem" }}>
          Try again
        </button>
        {error.digest ? <p style={{ color: "#9b9b9b", fontSize: "0.75rem" }}>Reference: {error.digest}</p> : null}
      </body>
    </html>
  )
}
