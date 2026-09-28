/** The canonical origin, set per deployment. Local development falls back to the dev server. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
export const siteHost = siteUrl.replace(/^https?:\/\//, "")
