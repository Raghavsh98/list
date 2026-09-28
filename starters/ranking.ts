import { defineList } from "@/core/define"

/** Ranking starter — numbered; order means something. */
export const ranking = defineList({
  id: "films",
  title: "Ten films, ranked",
  subtitle: "Argue with me.",
  mode: "ranked",
  author: { handle: "raghav", name: "Raghav" },
  createdAt: "2026-09-12T20:00:00.000Z",
  updatedAt: "2026-09-25T21:10:00.000Z",
  items: [
    { id: "mood", text: "In the Mood for Love", url: "https://letterboxd.com/film/in-the-mood-for-love/", credit: "Wong Kar-wai, 2000", aside: "Every frame is a colour study." },
    { id: "paris", text: "Paris, Texas", url: "https://letterboxd.com/film/paris-texas/", credit: "Wim Wenders, 1984" },
    { id: "columbus", text: "Columbus", url: "https://letterboxd.com/film/columbus-2017/", credit: "Kogonada, 2017", aside: "A film about looking at buildings. Also about everything else." },
    { id: "yiyi", text: "Yi Yi", url: "https://letterboxd.com/film/yi-yi/", credit: "Edward Yang, 2000" },
    { id: "ratatouille", text: "Ratatouille", url: "https://letterboxd.com/film/ratatouille/", credit: "Brad Bird, 2007", aside: "Anton Ego’s review is the best writing on criticism I know." },
    { id: "perfect-days", text: "Perfect Days", url: "https://letterboxd.com/film/perfect-days-2023/", credit: "Wim Wenders, 2023" },
    { id: "past-lives", text: "Past Lives", url: "https://letterboxd.com/film/past-lives/", credit: "Celine Song, 2023" },
    { id: "spirited", text: "Spirited Away", url: "https://letterboxd.com/film/spirited-away/", credit: "Hayao Miyazaki, 2001" },
    { id: "her", text: "Her", url: "https://letterboxd.com/film/her/", credit: "Spike Jonze, 2013", aside: "The high-waisted trousers were the real prediction." },
    { id: "drive", text: "Drive My Car", url: "https://letterboxd.com/film/drive-my-car/", credit: "Ryusuke Hamaguchi, 2021" },
  ],
})
