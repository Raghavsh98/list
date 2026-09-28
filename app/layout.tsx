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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "List", template: "%s — List" },
  description: "Make a list. Mean it. Pass it on.",
  openGraph: { type: "website", siteName: "List", title: "List", description: "Make a list. Mean it. Pass it on." },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
