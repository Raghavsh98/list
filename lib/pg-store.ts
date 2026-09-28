import { neon } from "@neondatabase/serverless"
import type { ListDoc } from "@/core/types"
import { rank, searchText, type Profile, type Store, type StoredList } from "./store"

type Row = { handle: string; slug: string; visibility: string; doc: ListDoc }

const toList = (r: Row): StoredList => ({
  handle: r.handle,
  slug: r.slug,
  visibility: r.visibility === "unlisted" ? "unlisted" : "public",
  doc: typeof r.doc === "string" ? (JSON.parse(r.doc) as ListDoc) : r.doc,
})

/**
 * Postgres (Neon) over HTTP: one round trip per query, no connection pool to keep warm,
 * which is what serverless functions want. The document is stored whole as JSONB — the
 * portable file is the source of truth, and the columns beside it exist only to find it.
 */
export class PgStore implements Store {
  private sql: ReturnType<typeof neon>

  constructor(url: string) {
    this.sql = neon(url)
  }

  async getProfile(handle: string): Promise<Profile | null> {
    const rows = (await this.sql`
      select handle, name, bio, link from profiles where handle = ${handle} limit 1
    `) as { handle: string; name: string; bio: string | null; link: string | null }[]
    const r = rows[0]
    if (!r) return null
    return { handle: r.handle, name: r.name, bio: r.bio ?? undefined, link: r.link ?? undefined }
  }

  async getList(handle: string, slug: string) {
    const rows = (await this.sql`
      select handle, slug, visibility, doc from lists where handle = ${handle} and slug = ${slug} limit 1
    `) as Row[]
    return rows[0] ? toList(rows[0]) : null
  }

  async listsByHandle(handle: string, includeUnlisted = false) {
    const rows = (await this.sql`
      select handle, slug, visibility, doc from lists
      where handle = ${handle} and (${includeUnlisted} or visibility = 'public')
      order by updated_at desc
    `) as Row[]
    return rows.map(toList)
  }

  async feed(limit = 50) {
    const rows = (await this.sql`
      select handle, slug, visibility, doc from lists
      where visibility = 'public' order by updated_at desc limit ${limit}
    `) as Row[]
    return rows.map(toList)
  }

  async search(query: string, limit = 25) {
    const q = query.trim()
    if (!q) return []
    // Postgres narrows the field; the shared scorer decides the order, so memory and
    // database search rank identically.
    const rows = (await this.sql`
      select handle, slug, visibility, doc from lists
      where visibility = 'public' and search_text ilike ${"%" + q.replace(/[%_\\]/g, "\\$&") + "%"}
      order by updated_at desc limit 200
    `) as Row[]
    return rank(rows.map(toList), q, limit)
  }

  async save(list: StoredList) {
    const { handle, slug, visibility, doc } = list
    await this.sql`
      insert into profiles (handle, name) values (${handle}, ${doc.author.name ?? "@" + handle})
      on conflict (handle) do nothing
    `
    await this.sql`
      insert into lists (id, handle, slug, visibility, doc, search_text, created_at, updated_at)
      values (${doc.id}, ${handle}, ${slug}, ${visibility}, ${JSON.stringify(doc)}::jsonb,
              ${searchText(list)}, ${doc.createdAt}, ${doc.updatedAt})
      on conflict (handle, slug) do update set
        id = excluded.id,
        visibility = excluded.visibility,
        doc = excluded.doc,
        search_text = excluded.search_text,
        updated_at = excluded.updated_at
    `
    return list
  }

  async remove(handle: string, slug: string) {
    await this.sql`delete from lists where handle = ${handle} and slug = ${slug}`
  }

  async allPaths() {
    const rows = (await this.sql`
      select handle, slug from lists where visibility = 'public'
    `) as { handle: string; slug: string }[]
    return rows
  }
}
