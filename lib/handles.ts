import { HANDLE_PATTERN, slugify } from "@/core/slug"

/** Top-level routes and words a handle may not shadow. */
export const RESERVED_HANDLES = new Set([
  "new", "search", "signin", "signout", "claim", "api", "l", "s", "about", "admin", "app",
  "auth", "embed", "feed", "help", "home", "list", "lists", "login", "logout", "me", "oembed",
  "privacy", "profile", "root", "settings", "static", "support", "terms", "www", "you", "llms",
])

export function handleError(handle: string): string | null {
  if (!handle) return "Choose a handle."
  if (!HANDLE_PATTERN.test(handle)) return "Handles are lowercase letters, digits and hyphens, up to 32 characters."
  if (RESERVED_HANDLES.has(handle)) return "That one is taken by the site itself. Choose another."
  return null
}

/** A starting suggestion from what Google told us; the author may change it. */
export function suggestHandle(name: string, email: string): string {
  const fromName = slugify(name).replace(/-/g, "")
  const fromEmail = slugify(email.split("@")[0] ?? "").replace(/-/g, "")
  const pick = [fromName, fromEmail].find((h) => h.length >= 3 && !RESERVED_HANDLES.has(h)) ?? ""
  return pick.slice(0, 32)
}
