// src/components/layout/Footer.tsx
// Links come from src/data/footerData.ts — edit that file to change links.

import { useNavigate } from "react-router"

import { FOOTER_GROUPS, type FooterLink } from "@/data/footerData"

// ── Single link button ────────────────────────────────────────────────────────
const FooterLinkBtn = ({ link }: { link: FooterLink }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (link.external) {
      window.open(link.external, "_blank", "noopener noreferrer")
    } else if (link.path) {
      navigate(link.path)
    } else if (link.slug) {
      navigate(`/page/${link.slug}`)
    }
  }

  return (
    <button
      key={link.label}
      onClick={handleClick}
      className="font-base font-medium text-white hover:text-primary/80 hover:cursor-pointer transition-colors text-left w-fit"
    >
      {link.label}
    </button>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
export const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container py-12 flex flex-col gap-12 justify-between">
        {/* ── Top section ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 ">
          {/* Brand */}
          <div className="flex flex-col gap-4 sm:col-span-2 max-w-lg">
            <div
              className="flex items-center gap-2 cursor-pointer w-fit"
              onClick={() => navigate("/")}
            >
              <img src="/logo.svg" alt="logo" className="h-5.5 w-auto" />
            </div>
            <p className="font-base text-white leading-5 max-w-96">
              OutcomeX is a decentralized information markets platform, letting you trade on the
              world's most highly-debated topics.
            </p>
          </div>

          {/* Link groups — rendered from footerData.ts */}
          {FOOTER_GROUPS.map((group) => (
            <div key={group.heading} className="flex flex-col gap-3">
              <span className="font-sm font-bold tracking-widest text-white uppercase">
                {group.heading}
              </span>
              {group.links.map((link) => (
                <FooterLinkBtn key={link.label} link={link} />
              ))}
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="font-xs font-bold text-white leading-4 uppercase tracking-widest">
            © {new Date().getFullYear()} OutcomeX Simulation
          </span>
          <div className="flex items-center gap-4">
            <span className="font-xs font-bold text-white uppercase tracking-widest">
              Network: Polygon
            </span>
            <span className="font-xs font-bold text-white uppercase tracking-widest">
              Latency: 24ms
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
