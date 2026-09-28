import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Editor } from "@/components/editor/editor"
import type { Draft } from "@/components/editor/draft"
import { AuthorLine } from "@/components/site/author-line"
import { SignInPrompt } from "@/components/site/sign-in-prompt"
import { SiteHeader } from "@/components/site/site-header"
import { getAuthor } from "@/lib/author"
import { store } from "@/lib/db"

export const metadata: Metadata = { title: "Edit", robots: { index: false } }

export default async function EditListPage({ params }: PageProps<"/[handle]/[slug]/edit">) {
  const { handle, slug } = await params
  const list = await store.getList(handle, slug)
  if (!list) notFound()

  const author = await getAuthor()
  if (!author) {
    return (
      <SignInPrompt
        next={`/${handle}/${slug}/edit`}
        title="Sign in to edit"
        body="Only the person who made a list can change it."
      />
    )
  }

  if (author.handle !== handle) {
    return (
      <div className="page">
        <SiteHeader />
        <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
          <h1 className="text-[1.0625rem]">This list isn’t yours to edit</h1>
          <p className="mt-2 text-(--muted)">
            You can read it at{" "}
            <Link href={`/${handle}/${slug}`} className="underline underline-offset-4">
              /{handle}/{slug}
            </Link>
            , or{" "}
            <Link href="/new" className="underline underline-offset-4">
              make one of your own
            </Link>
            .
          </p>
        </main>
      </div>
    )
  }

  const { doc } = list
  const initial: Draft = {
    id: doc.id,
    handle,
    name: author.name,
    slug,
    slugTouched: true,
    title: doc.title,
    subtitle: doc.subtitle ?? "",
    mode: doc.mode,
    visibility: list.visibility,
    items: doc.items.map((item) => ({ ...item })),
    createdAt: doc.createdAt,
  }

  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6">
        <h1 className="sr-only">Editing {doc.title}</h1>
        <Editor draftKey={`${handle}/${slug}`} initial={initial} editing />
        <AuthorLine handle={handle} deleteSlug={slug} />
      </main>
    </div>
  )
}
