import Link from "next/link"

/**
 * One row: the wordmark, a search field that works without JavaScript (GET form),
 * and the way in to making a list. No borders — spacing holds it.
 */
export function SiteHeader({ query }: { query?: string }) {
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
      <Link href="/new" className="ml-auto text-(--muted) hover:text-(--fg)">
        Make a list
      </Link>
    </header>
  )
}
