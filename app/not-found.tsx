import Link from "next/link"
import { SiteHeader } from "@/components/site/site-header"

export default function NotFound() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
        <h1 className="text-[1.0625rem]">Nothing here</h1>
        <p className="mt-2 max-w-[30rem] text-(--muted)">
          This list may have been renamed, unpublished, or never existed.{" "}
          <Link href="/" className="underline underline-offset-4">
            Read what is here
          </Link>
          .
        </p>
      </main>
    </div>
  )
}
