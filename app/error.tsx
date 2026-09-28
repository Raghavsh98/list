"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="page">
      <main className="mx-auto max-w-[52rem] px-6 pt-24">
        <h1 className="text-[1.0625rem]">Something broke on our side</h1>
        <p className="mt-2 max-w-[30rem] text-(--muted)">
          Nothing you did. Try again, and if it keeps happening the list itself is safe — lists are
          plain documents and nothing was lost.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 bg-(--fg) px-4 py-2 text-[0.875rem] text-(--bg)"
        >
          Try again
        </button>
        {error.digest && <p className="mt-6 text-[0.75rem] text-(--faint)">Reference: {error.digest}</p>}
      </main>
    </div>
  )
}
