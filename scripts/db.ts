import { readFileSync } from "node:fs"
import { join } from "node:path"
import { neon } from "@neondatabase/serverless"
import { seedData } from "../lib/memory-store"
import { searchText } from "../lib/store"

/**
 * Creates the schema and, with `--seed`, writes the starter lists in.
 * Run: DATABASE_URL=… pnpm db:setup [--seed]
 */
async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const sql = neon(url)

  const schema = readFileSync(join(process.cwd(), "lib/schema.sql"), "utf8").replace(/^\s*--.*$/gm, "")
  for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await sql.query(statement)
  }
  console.log("schema ready")

  if (!process.argv.includes("--seed")) return

  for (const p of seedData.profiles) {
    await sql.query(
      `insert into profiles (handle, name, bio, links) values ($1, $2, $3, $4)
       on conflict (handle) do update set name = excluded.name, bio = excluded.bio, links = excluded.links`,
      [p.handle, p.name, p.bio ?? null, p.links ?? []],
    )
  }

  for (const list of seedData.lists) {
    await sql.query(
      `insert into lists (id, handle, slug, visibility, doc, search_text, created_at, updated_at)
       values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
       on conflict (handle, slug) do update set
         doc = excluded.doc, search_text = excluded.search_text, updated_at = excluded.updated_at`,
      [
        list.doc.id,
        list.handle,
        list.slug,
        list.visibility,
        JSON.stringify(list.doc),
        searchText(list),
        list.doc.createdAt,
        list.doc.updatedAt,
      ],
    )
  }
  console.log(`seeded ${seedData.profiles.length} profiles, ${seedData.lists.length} lists`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
