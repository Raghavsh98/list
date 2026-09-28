import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Editor } from "@/components/editor/editor"
import { emptyDraft } from "@/components/editor/draft"
import { AuthorLine } from "@/components/site/author-line"
import { SignInPrompt } from "@/components/site/sign-in-prompt"
import { SiteHeader } from "@/components/site/site-header"
import { getViewer } from "@/lib/author"

export const metadata: Metadata = {
  title: "New list",
  description: "Make a list, give it a link, pass it on.",
  robots: { index: false },
}

export default async function NewListPage() {
  const viewer = await getViewer()
  if (!viewer) {
    return (
      <SignInPrompt
        next="/new"
        title="Make a list"
        body="A title, a subtitle, and a list. Sign in once and you can start typing."
      />
    )
  }
  if (!viewer.profile) redirect("/claim?next=%2Fnew")
  const { handle, name } = viewer.profile

  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6">
        <h1 className="sr-only">New list</h1>
        <Editor draftKey="new" initial={emptyDraft(handle, name)} />
        <AuthorLine handle={handle} />
      </main>
    </div>
  )
}
