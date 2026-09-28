import { defineList } from "@/core/define"

/** Plain starter — bullets, no links needed. The aside does the work. */
export const bucketList = defineList({
  id: "fire",
  title: "What I’d save from a fire",
  subtitle: "In no particular order, which is a lie.",
  mode: "plain",
  author: { handle: "raghav", name: "Raghav" },
  createdAt: "2026-09-01T08:00:00.000Z",
  updatedAt: "2026-09-01T08:00:00.000Z",
  items: [
    { id: "watch", text: "My grandfather’s watch", aside: "It doesn’t work. That’s not the point." },
    { id: "sketchbook", text: "The 2019 sketchbook", aside: "The year I decided to be a designer." },
    { id: "miso", text: "Miso", credit: "the cat", aside: "Would save herself, honestly." },
    { id: "pen", text: "A Muji 0.38 gel pen, black", aside: "Replaceable, technically." },
    { id: "laptop", text: "The laptop", aside: "Reluctantly." },
    { id: "passport", text: "Passport" },
    { id: "stub", text: "A ticket stub from the Barbican, 2022" },
  ],
})
