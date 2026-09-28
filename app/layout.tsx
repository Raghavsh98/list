import type { Metadata } from "next"
import { Geist, Geist_Mono, Newsreader } from "next/font/google"
import "./globals.css"

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
})

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "List", template: "%s — List" },
  description: "Make a list. Mean it. Pass it on.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
