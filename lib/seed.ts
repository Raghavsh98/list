import { defineList } from "@/core/define"
import type { Profile, StoredList } from "./store"

/**
 * Seed authors. Here so the feed, search and profiles have something honest to show
 * before the database exists. Delete this file once real accounts land.
 */
export const seedProfiles: Profile[] = [
  { handle: "mira", name: "Mira Chandra", bio: "Sound engineer. Keeps lists instead of a diary." },
  { handle: "tomas", name: "Tomás Ruiz", bio: "Cooks, walks, reads late.", link: "https://example.com" },
]

export const seedLists: StoredList[] = [
  {
    handle: "mira",
    slug: "headphones",
    visibility: "public",
    doc: defineList({
      id: "seed-headphones",
      title: "Headphones I have actually owned",
      subtitle: "Ranked by how long they lasted, not by how they measure.",
      mode: "ranked",
      author: { handle: "mira", name: "Mira Chandra" },
      createdAt: "2026-08-02T10:00:00.000Z",
      updatedAt: "2026-09-24T11:20:00.000Z",
      items: [
        { id: "hd600", text: "Sennheiser HD 600", credit: "1997", aside: "Nine years. Two cable replacements. Still the reference." },
        { id: "sr80", text: "Grado SR80", credit: "bought used, 2014", aside: "Sounds like a live take. Comfortable for about forty minutes." },
        { id: "m50", text: "Audio-Technica M50x", credit: "2016", aside: "Every studio has a pair. Nobody chose them." },
        { id: "airpods", text: "AirPods Pro", credit: "2021", aside: "Not for mixing. For the bus." },
      ],
    }),
  },
  {
    handle: "mira",
    slug: "quiet-records",
    visibility: "public",
    doc: defineList({
      id: "seed-quiet",
      title: "Records for working in silence",
      subtitle: "No words, or words in a language I don’t speak.",
      mode: "plain",
      author: { handle: "mira", name: "Mira Chandra" },
      createdAt: "2026-06-11T08:00:00.000Z",
      updatedAt: "2026-09-12T09:00:00.000Z",
      items: [
        { id: "eno", text: "Music for Airports", url: "https://en.wikipedia.org/wiki/Ambient_1:_Music_for_Airports", credit: "Brian Eno, 1978" },
        { id: "sakamoto", text: "async", credit: "Ryuichi Sakamoto, 2017", aside: "Put it on and the room gets taller." },
        { id: "hania", text: "Similes", credit: "Hania Rani, 2024" },
        { id: "gas", text: "Pop", credit: "Gas, 2000", aside: "A forest with a kick drum in it." },
      ],
    }),
  },
  {
    handle: "tomas",
    slug: "sunday-cooking",
    visibility: "public",
    doc: defineList({
      id: "seed-sunday",
      title: "Things worth cooking on a Sunday",
      subtitle: "Long, forgiving, mostly one pot.",
      mode: "checkable",
      author: { handle: "tomas", name: "Tomás Ruiz" },
      createdAt: "2026-07-19T12:00:00.000Z",
      updatedAt: "2026-09-26T17:45:00.000Z",
      items: [
        { id: "lentils", text: "Lentils with anything green", aside: "The first thing I learned to cook without a recipe." },
        { id: "ragu", text: "Ragù, six hours", credit: "Marcella Hazan", aside: "Milk first. Trust her." },
        { id: "bread", text: "No-knead bread", url: "https://cooking.nytimes.com/recipes/11376-no-knead-bread", credit: "Jim Lahey, 2006" },
        { id: "arroz", text: "Arroz con pollo, my mother’s way", aside: "She measures in handfuls. I have written nothing down." },
        { id: "tarte", text: "Tarte tatin", aside: "Burn the caramel a little more than feels wise." },
      ],
    }),
  },
  {
    handle: "tomas",
    slug: "walks",
    visibility: "public",
    doc: defineList({
      id: "seed-walks",
      title: "Walks I take when something is wrong",
      mode: "plain",
      author: { handle: "tomas", name: "Tomás Ruiz" },
      createdAt: "2026-05-04T07:00:00.000Z",
      updatedAt: "2026-08-30T19:10:00.000Z",
      items: [
        { id: "river", text: "The river, north, until the second bridge" },
        { id: "market", text: "Through the market at closing time", aside: "Everyone is generous at six." },
        { id: "hill", text: "Up the hill, no music" },
      ],
    }),
  },
]
