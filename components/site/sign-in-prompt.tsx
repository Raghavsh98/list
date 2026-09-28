import { SiteHeader } from "@/components/site/site-header"
import { SignIn } from "@/components/site/sign-in"

/** Shown in place of a page that needs an author. The URL stays shareable; only the body changes. */
export function SignInPrompt({ next, title, body }: { next: string; title: string; body: string }) {
  return (
    <div className="page">
      <SiteHeader />
      <main id="content" className="mx-auto max-w-[52rem] px-6 pb-24">
        <h1 className="text-[1.0625rem]">{title}</h1>
        <p className="mt-2 max-w-[30rem] text-(--muted)">{body}</p>
        <div className="mt-6">
          <SignIn next={next} />
        </div>
        <p className="mt-6 max-w-[30rem] text-[0.8125rem] text-(--muted)">
          Reading is open to everyone and every machine. Writing is for people, which is why we ask
          for a Google account and nothing else.
        </p>
      </main>
    </div>
  )
}
