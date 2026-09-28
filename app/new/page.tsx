import type { Metadata } from "next"
import { Editor } from "@/components/editor/editor"
import { emptyDraft } from "@/components/editor/draft"
import { SiteHeader } from "@/components/site/site-header"
import { CURRENT_AUTHOR } from "@/lib/author"

export const metadata: Metadata = {
  title: "New list",
  description: "Make a list, give it a link, pass it on.",
  robots: { index: false },
}

export default function NewListPage() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6">
        <h1 className="sr-only">New list</h1>
        <Editor draftKey="new" initial={emptyDraft(CURRENT_AUTHOR.handle, CURRENT_AUTHOR.name)} />
      </main>
    </div>
  )
}
