import { bucketList } from "@/starters/bucket-list"
import { ranking } from "@/starters/ranking"
import { readingList } from "@/starters/reading-list"
import { seedLists, seedProfiles } from "./seed"
import { rank, type Profile, type Store, type StoredList } from "./store"

const PROFILES: Profile[] = [
  { handle: "raghav", name: "Raghav", bio: "Product designer. Making a home for lists.", link: "https://read.cv" },
  ...seedProfiles,
]

const LISTS: StoredList[] = [
  { handle: "raghav", slug: "design-reading", visibility: "public", doc: readingList },
  { handle: "raghav", slug: "films", visibility: "public", doc: ranking },
  { handle: "raghav", slug: "fire", visibility: "public", doc: bucketList },
  ...seedLists,
]

export const seedData = { profiles: PROFILES, lists: LISTS }

/**
 * In-memory implementation. Reads are seeded; writes last as long as the server process does,
 * which is enough for local use and honest about itself when no database is configured.
 */
export class MemoryStore implements Store {
  private lists = [...LISTS]
  private profiles = [...PROFILES]

  async getProfile(handle: string) {
    return this.profiles.find((p) => p.handle === handle) ?? null
  }

  async getProfileByUser(userId: string) {
    return this.profiles.find((p) => p.userId === userId) ?? null
  }

  async saveProfile(profile: Profile) {
    const i = this.profiles.findIndex((p) => p.handle === profile.handle)
    if (i === -1) this.profiles.push(profile)
    else this.profiles[i] = { ...this.profiles[i], ...profile }
    return profile
  }

  async getList(handle: string, slug: string) {
    return this.lists.find((l) => l.handle === handle && l.slug === slug) ?? null
  }

  async listsByHandle(handle: string, includeUnlisted = false) {
    return this.lists
      .filter((l) => l.handle === handle && (includeUnlisted || l.visibility === "public"))
      .sort((a, b) => b.doc.updatedAt.localeCompare(a.doc.updatedAt))
  }

  async feed(limit = 50) {
    return this.lists
      .filter((l) => l.visibility === "public")
      .sort((a, b) => b.doc.updatedAt.localeCompare(a.doc.updatedAt))
      .slice(0, limit)
  }

  async search(query: string, limit = 25) {
    return rank(
      this.lists.filter((l) => l.visibility === "public"),
      query,
      limit,
    )
  }

  async save(list: StoredList) {
    const i = this.lists.findIndex((l) => l.handle === list.handle && l.slug === list.slug)
    if (i === -1) this.lists.unshift(list)
    else this.lists[i] = list
    if (!this.profiles.some((p) => p.handle === list.handle)) {
      this.profiles.push({ handle: list.handle, name: list.doc.author.name ?? `@${list.handle}` })
    }
    return list
  }

  async remove(handle: string, slug: string) {
    this.lists = this.lists.filter((l) => !(l.handle === handle && l.slug === slug))
  }

  async allPaths() {
    return this.lists.map(({ handle, slug }) => ({ handle, slug }))
  }
}
