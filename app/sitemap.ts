import type { MetadataRoute } from "next"
import { store } from "@/lib/db"
import { siteUrl } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await store.allPaths()
  const authors = new Map<string, string>()
  for (const p of paths) if (!authors.has(p.handle)) authors.set(p.handle, p.updatedAt)

  return [
    { url: siteUrl, lastModified: paths[0]?.updatedAt, changeFrequency: "daily", priority: 0.5 },
    ...[...authors].map(([handle, updatedAt]) => ({ url: `${siteUrl}/${handle}`, lastModified: updatedAt, priority: 0.6 })),
    ...paths.map((p) => ({ url: `${siteUrl}/${p.handle}/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
  ]
}
