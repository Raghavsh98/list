import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/site"

/** Reading is open to everyone, machines included. Only the writing and plumbing routes are kept out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/new", "/claim", "/signin",
      "/settings", "/embed/", "/search?"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
