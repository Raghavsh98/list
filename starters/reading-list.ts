import { defineList } from "@/core/define"

/**
 * Reading-list starter — checkable. Readers tick things off; progress stays in their browser.
 * Swap the items for your own. Keep `id`s stable once published: they key each reader's progress.
 */
export const readingList = defineList({
  id: "design-reading",
  title: "Design books worth finishing",
  subtitle: "The shelf I keep coming back to. Tick them off as you go; this browser remembers.",
  mode: "checkable",
  author: { handle: "raghav", name: "Raghav" },
  createdAt: "2026-09-20T09:00:00.000Z",
  updatedAt: "2026-09-27T18:30:00.000Z",
  items: [
    {
      id: "norman",
      text: "The Design of Everyday Things",
      url: "https://www.nngroup.com/books/design-everyday-things-revised/",
      credit: "Don Norman, 1988",
      aside: "Read the revised edition. The original’s examples have aged; the argument hasn’t.",
    },
    {
      id: "lupton",
      text: "Thinking with Type",
      url: "https://thinkingwithtype.com",
      credit: "Ellen Lupton, 2004",
      aside: "The book I hand to every new designer.",
    },
    {
      id: "bringhurst",
      text: "The Elements of Typographic Style",
      url: "https://en.wikipedia.org/wiki/The_Elements_of_Typographic_Style",
      credit: "Robert Bringhurst, 1992",
      aside: "Haven’t finished it. Nobody has.",
    },
    {
      id: "chimero",
      text: "The Shape of Design",
      url: "https://shapeofdesignbook.com",
      credit: "Frank Chimero, 2012",
      aside: "Free to read online. Start here if you’re new.",
    },
    {
      id: "albers",
      text: "Interaction of Color",
      url: "https://yalebooks.yale.edu/book/9780300179354/interaction-of-color/",
      credit: "Josef Albers, 1963",
    },
    {
      id: "hara",
      text: "Designing Design",
      url: "https://www.lars-mueller-publishers.com/designing-design",
      credit: "Kenya Hara, 2007",
      aside: "The one about emptiness.",
    },
    {
      id: "brockmann",
      text: "Grid Systems in Graphic Design",
      credit: "Josef Müller-Brockmann, 1981",
      aside: "Dry, Swiss, correct.",
    },
    {
      id: "alexander",
      text: "Notes on the Synthesis of Form",
      url: "https://www.hup.harvard.edu/books/9780674627512",
      credit: "Christopher Alexander, 1964",
      aside: "Canon. Haven’t read it.",
    },
    {
      id: "tufte",
      text: "Envisioning Information",
      url: "https://www.edwardtufte.com/book/envisioning-information/",
      credit: "Edward Tufte, 1990",
    },
    {
      id: "rams",
      text: "Less and More: The Design Ethos of Dieter Rams",
      credit: "Klaus Klemp & Keiko Ueki-Polet, 2009",
      aside: "A picture book, honestly. That’s fine.",
    },
  ],
})
