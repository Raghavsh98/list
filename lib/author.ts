/**
 * The one author, until sign-in exists. Everything that will later come from a session
 * comes from here instead, so wiring Google auth is a single swap rather than a rewrite.
 */
export const CURRENT_AUTHOR = { handle: "raghav", name: "Raghav" } as const

export function canEdit(handle: string): boolean {
  return handle === CURRENT_AUTHOR.handle
}
