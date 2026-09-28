import { signInWithGoogle, signOut } from "@/lib/auth-actions"

/** One button, one provider. Works without JavaScript. */
export function SignIn({ next, label = "Continue with Google" }: { next?: string; label?: string }) {
  return (
    <form action={signInWithGoogle}>
      {next && <input type="hidden" name="next" value={next} />}
      <button
        type="submit"
        className="rounded-sm bg-(--fg) px-4 py-2 text-[0.9375rem] text-(--bg) hover:opacity-90"
      >
        {label}
      </button>
    </form>
  )
}

export function SignOut() {
  return (
    <form action={signOut} className="inline">
      <button type="submit" className="text-(--muted) hover:text-(--fg)">
        Sign out
      </button>
    </form>
  )
}
