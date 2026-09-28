import { SiteHeader } from "@/components/site/site-header"

/** A quiet placeholder: the shape of the page, no spinner, no jumping. */
export default function Loading() {
  return (
    <div className="page">
      <SiteHeader />
      <main className="mx-auto max-w-[52rem] px-6 pb-24" aria-busy="true">
        <p className="sr-only">Loading</p>
        <div className="max-w-[30rem] space-y-3" aria-hidden="true">
          <div className="h-4 w-2/3 bg-(--fg) opacity-[0.06]" />
          <div className="h-4 w-1/2 bg-(--fg) opacity-[0.06]" />
          <div className="h-4 w-3/5 bg-(--fg) opacity-[0.06]" />
        </div>
      </main>
    </div>
  )
}
