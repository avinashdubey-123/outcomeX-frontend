// src/pages/terms/TermsPage.tsx

import { useEffect, useState } from "react"

import { TERMS_META, TERMS_SECTIONS } from "@/data/termsData"

// ── Constants ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d0f13",
  surface: "#161a22",
  border: "rgba(255,255,255,0.07)",
  green: "#00c853",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
  muted2: "rgba(255,255,255,0.25)",
  body: "rgba(255,255,255,0.75)",
} as const

// ── TermsPage ─────────────────────────────────────────────────────────────────
const TermsPage = () => {
  const [activeSection, setActiveSection] = useState(TERMS_SECTIONS[0]?.id)

  // highlight active section on scroll
  useEffect(() => {
    window.scrollTo(0, 0)
    const handleScroll = () => {
      for (const section of [...TERMS_SECTIONS].reverse()) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(section.id)
          break
        }
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.scroll(0, 0)
    }
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="text-white ">
      <div className="container mt-4 md:mt-6 mb-12 md:mb-18.5 flex gap-7 lg:gap-14 items-start">
        {/* ── Sidebar ── */}
        <aside className="hidden w-50 lg:w-60 shrink-0 sticky top-24 md:flex flex-col gap-3">
          <div className="font-sm font-bold text-white uppercase mb-2.5">Contents</div>
          {TERMS_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="text-left  py-1.5 px-3 rounded-md font-base cursor-pointer  transition-all duration-100"
              style={{
                fontWeight: activeSection === s.id ? 700 : 500,
                color: activeSection === s.id ? C.green : C.muted,
                background: activeSection === s.id ? "rgba(0,200,83,0.08)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== s.id) e.currentTarget.style.color = C.text
              }}
              onMouseLeave={(e) => {
                if (activeSection !== s.id) e.currentTarget.style.color = C.muted
              }}
            >
              {s.title}
            </button>
          ))}
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* page header */}
          <div className="mb-10 pb-8 border-b border-b-white/10">
            <h2 className="font-2xl font-bold mb-2.5">Terms and Conditions</h2>
            <div className="flex gap-4 flex-wrap">
              <span className="font-sm text-white/60">
                Last updated: <strong className="text-primary">{TERMS_META.lastUpdated}</strong>
              </span>
              <span className="font-sm text-white/60">
                Effective: <strong className="text-primary">{TERMS_META.effectiveDate}</strong>
              </span>
              <span className="font-sm text-white/60">
                Version: <strong className=" text-primary">{TERMS_META.version}</strong>
              </span>
            </div>
            <p className="font-sm text-white/60 mt-4">
              Please read these Terms and Conditions carefully before using the OutcomeX platform.
              By accessing or using our service, you agree to be bound by these terms.
            </p>
          </div>

          {/* sections */}
          <div className="flex flex-col gap-11">
            {TERMS_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} style={{ scrollMarginTop: 96 }}>
                <h2 className="font-md font-bold text-white mb-4">{section.title}</h2>
                <div className="flex flex-col gap-3">
                  {section.content.map((para, i) => (
                    <p key={i} className="font-sm text-white/60 ">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* footer note */}
          <div className=" mt-8 md:mt-14 py-4 px-6 bg-white/5 border border-white/10 rounded-md font-base text-white/50">
            Questions about these terms? Contact us at{" "}
            <a
              href={`mailto:${TERMS_META.contactEmail}`}
              style={{ color: C.green, textDecoration: "none" }}
            >
              {TERMS_META.contactEmail}
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TermsPage
