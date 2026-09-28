import { neon } from "@neondatabase/serverless"
import { shortCode } from "@/core/ids"
import type { ListDoc } from "@/core/types"
import { rank, searchText, type Profile, type Store, type StoredList } from "./store"

type Row = { handle: string; slug: string; visibility: string; short: string | null; doc: ListDoc }
type ProfileRow = {
  handle: string
  name: string
  bio: string | null
  link: string | null
  user_id: string | null
}

const toProfile = (r: ProfileRow): Profile => ({
  handle: r.handle,
  name: r.name,
  bio: r.bio ?? undefined,
  link: r.link ?? undefined,
  userId: r.user_id ?? undefined,
})

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === "23505"

const toList = (r: Row): StoredList => ({
  handle: r.handle,
  slug: r.slug,
  visibility: r.visibility === "unlisted" ? "unlisted" : "public",
  short: r.short ?? undefined,
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
      select handle, name, bio, link, user_id from profiles where handle = ${handle} limit 1
    `) as ProfileRow[]
    return rows[0] ? toProfile(rows[0]) : null
  }

  async getProfileByUser(userId: string): Promise<Profile | null> {
    const rows = (await this.sql`
      select handle, name, bio, link, user_id from profiles where user_id = ${userId} limit 1
    `) as ProfileRow[]
    return rows[0] ? toProfile(rows[0]) : null
  }

  async saveProfile(profile: Profile): Promise<Profile> {
    await this.sql`
      insert into profiles (handle, name, bio, link, user_id)
      values (${profile.handle}, ${profile.name}, ${profile.bio ?? null}, ${profile.link ?? null},
              ${profile.userId ?? null})
      on conflict (handle) do update set
        name = excluded.name,
        bio = excluded.bio,
        link = excluded.link,
        user_id = coalesce(excluded.user_id, profiles.user_id)
    `
    return profile
  }

  async getList(handle: string, slug: string) {
    const rows = (await this.sql`
      select handle, slug, visibility, short, doc from lists where handle = ${handle} and slug = ${slug} limit 1
    `) as Row[]
    if (!rows[0]) return null
    const list = toList(rows[0])
    return list.short ? list : { ...list, short: await this.assignShort(handle, slug) }
  }

  async getListByShort(code: string) {
    const rows = (await this.sql`
      select handle, slug, visibility, short, doc from lists where short = ${code} limit 1
    `) as Row[]
    return rows[0] ? toList(rows[0]) : null
  }

  /** Lists written before short links existed get one the first time they are read. */
  private async assignShort(handle: string, slug: string): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = shortCode()
      try {
        const rows = (await this.sql`
          update lists set short = coalesce(short, ${code})
          where handle = ${handle} and slug = ${slug} returning short
        `) as { short: string }[]
        if (rows[0]?.short) return rows[0].short
      } catch (error) {
        if (!isUniqueViolation(error)) throw error
      }
    }
    throw new Error("Could not assign a short code")
  }

  async listsByHandle(handle: string, includeUnlisted = false) {
    const rows = (await this.sql`
      select handle, slug, visibility, short, doc from lists
      where handle = ${handle} and (${includeUnlisted} or visibility = 'public')
      order by updated_at desc
    `) as Row[]
    return rows.map(toList)
  }

  async feed(limit = 50) {
    const rows = (await this.sql`
      select handle, slug, visibility, short, doc from lists
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
      select handle, slug, visibility, short, doc from lists
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
    for (let attempt = 0; attempt < 5; attempt++) {
      const short = list.short ?? shortCode()
      try {
        const rows = (await this.sql`
          insert into lists (id, handle, slug, visibility, short, doc, search_text, created_at, updated_at)
          values (${doc.id}, ${handle}, ${slug}, ${visibility}, ${short}, ${JSON.stringify(doc)}::jsonb,
                  ${searchText(list)}, ${doc.createdAt}, ${doc.updatedAt})
          on conflict (handle, slug) do update set
            id = excluded.id,
            visibility = excluded.visibility,
            short = coalesce(lists.short, excluded.short),
            doc = excluded.doc,
            search_text = excluded.search_text,
            updated_at = excluded.updated_at
          returning short
        `) as { short: string }[]
        return { ...list, short: rows[0]?.short ?? short }
      } catch (error) {
        if (!isUniqueViolation(error) || list.short) throw error
      }
    }
    throw new Error("Could not assign a short code")
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
