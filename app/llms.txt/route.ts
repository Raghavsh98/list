import { store } from "@/lib/db"
import { siteUrl } from "@/lib/site"

const MAX_LISTS = 500

/**
 * https://llmstxt.org — the site explained to a machine in one page, with links to the
 * plain-text twins so an agent never has to scrape HTML. Reading is welcome; writing is human-only.
 */
export async function GET() {
  const paths = (await store.allPaths()).slice(0, MAX_LISTS)
  const lines = [
    "# List",
    "",
    "> A place where people make and share lists. One list, one link. Every list is a small portable document, readable as HTML, Markdown or JSON.",
    "",
    "Reading is open to anyone and anything; only signed-in humans can write. There is no write API.",
    "",
    "## Format",
    "",
    `- [JSON Schema for a list](${siteUrl}/schema/list-v1.json): title, optional subtitle, mode (plain, ranked, checkable), items with text, optional url, credit, aside and image.`,
    `- Twins: append \`.md\` or \`.json\` to any list URL, e.g. ${siteUrl}/raghav/films.md and ${siteUrl}/raghav/films.json.`,
    `- oEmbed: ${siteUrl}/api/oembed?url=<list url> (discovery link on every list page).`,
    `- Short links: ${siteUrl}/l/<code> redirects to the canonical list.`,
    "",
    "## Lists",
    "",
    ...paths.map((p) => `- [${p.title.replace(/[\[\]]/g, "")}](${siteUrl}/${p.handle}/${p.slug}.md): by @${p.handle}, updated ${p.updatedAt.slice(0, 10)}`),
    "",
    "## Optional",
    "",
    `- [Sitemap](${siteUrl}/sitemap.xml)`,
    `- [Feed of recent public lists](${siteUrl}/)`,
    "",
  ]
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
