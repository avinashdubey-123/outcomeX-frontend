// src/data/footerData.ts
// Edit this file to add, remove, or change footer links.
// The Footer component reads from here — no component changes needed.

export interface FooterLink {
  label: string
  slug?: string // → navigates to /page/:slug
  path?: string // → navigates to exact path (for special pages like /terms)
  external?: string // → opens in new tab
}

export interface FooterGroup {
  heading: string
  links: FooterLink[]
}

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    heading: "Platform",
    links: [
      { label: "How it works", slug: "how-it-works" },
      { label: "Market Rules", slug: "market-rules" },
      { label: "Rewards Program", slug: "rewards-program" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Discord Community", external: "https://discord.gg/jayKoranga" },
      { label: "Help Center", slug: "help" },
      { label: "Terms of Service", path: "/terms" },
    ],
  },
]
