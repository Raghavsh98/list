import Link from "next/link"
import { SignOut } from "@/components/site/sign-in"
import { deleteList } from "@/lib/actions"

/** The quiet footer under an editor: who is writing, the way out, and — when editing — the way to delete. */
export function AuthorLine({ handle, deleteSlug }: { handle: string; deleteSlug?: string }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1 pt-12 pb-16 text-[0.8125rem] text-(--muted)">
      <span>
        Writing as{" "}
        <Link href={`/${handle}`} className="hover:text-(--fg)">
          @{handle}
        </Link>
      </span>
      <span aria-hidden="true"> · </span>
      <SignOut />
      {deleteSlug && (
        <>
          <span aria-hidden="true"> · </span>
          <form action={deleteList} className="inline">
            <input type="hidden" name="slug" value={deleteSlug} />
            <button type="submit" className="text-(--muted) hover:text-(--fg)">
              Delete this list
            </button>
          </form>
        </>
      )}
    </p>
  )
}
