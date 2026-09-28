import Link from "next/link"
import { getViewer } from "@/lib/author"

/**
 * One row: the wordmark, a search field that works without JavaScript (GET form),
 * and the way in to making a list. Signed-in authors also get the way back to
 * their own lists. No borders — spacing holds it.
 */
export async function SiteHeader({ query }: { query?: string }) {
  const viewer = await getViewer()
  const handle = viewer?.profile?.handle

  return (
    <header className="mx-auto flex max-w-[52rem] flex-wrap items-center gap-x-6 gap-y-3 px-6 pt-8 pb-10 text-[0.9375rem]">
      <Link href="/" className="font-medium tracking-tight hover:underline underline-offset-4">
        List
      </Link>
      <form action="/search" role="search" className="order-last w-full sm:order-none sm:w-auto sm:grow">
        <label htmlFor="q" className="sr-only">
          Search lists
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search lists, people, things"
          autoComplete="off"
          className="w-full max-w-sm bg-transparent py-1.5 text-[0.9375rem] outline-none placeholder:text-(--muted)"
        />
      </form>
      <nav aria-label="Account" className="ml-auto flex items-center gap-x-5">
        {handle && (
          <Link href={`/${handle}`} className="text-(--muted) hover:text-(--fg)">
            Your lists
          </Link>
        )}
        {viewer && !handle ? (
          <Link href="/claim" className="text-(--muted) hover:text-(--fg)">
            Claim a handle
          </Link>
        ) : (
          <Link href="/new" className="text-(--muted) hover:text-(--fg)">
            Make a list
          </Link>
        )}
      </nav>
    </header>
  )
}
