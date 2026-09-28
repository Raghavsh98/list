import Link from "next/link"

export default function Home() {
  return (
    <main id="content" className="mx-auto flex min-h-dvh max-w-[40rem] flex-col justify-center px-6 py-24">
      <h1 className="text-2xl font-medium tracking-tight">List</h1>
      <p className="mt-2 max-w-md text-(--muted)">
        A list is the atom. Make one, give it a link, pass it on.
      </p>
      <p className="mt-8 text-[0.9375rem]">
        <Link href="/raghav" className="underline underline-offset-3 decoration-black/30 hover:decoration-current dark:decoration-white/30">
          See Raghav’s lists →
        </Link>
      </p>
    </main>
  )
}
