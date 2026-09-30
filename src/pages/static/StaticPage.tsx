import { ArrowLeft, TrendingUp } from "lucide-react"
import React, { useEffect } from "react"
import { useNavigate, useParams } from "react-router"

import { STATIC_PAGES } from "@/data/staticPagesData"

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const page = slug ? STATIC_PAGES[slug] : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // ── Helper to render content with highlights ──
  const renderParagraph = (text: string, sectionIdx: number, paraIdx: number) => {
    // Keywords to highlight in green text
    let processed = text.replace(
      /Polygon blockchain/g,
      '<span class="text-primary font-bold">Polygon blockchain</span>',
    )
    // Keywords to highlight in a green badge
    processed = processed.replace(
      /2% fee/g,
      '<span class="bg-primary/20 text-primary px-2 py-0.5 rounded-sm font-extrabold text-[12px]">2% fee</span>',
    )

    // Specific paragraph check for the "Trading Tip" callout box (OutcomeX / How it Works)
    // Image shows the 2nd paragraph of 2nd section as a card
    const isCallout =
      slug === "how-it-works" &&
      ((sectionIdx === 1 && paraIdx === 1) || text.startsWith("You can buy or sell shares"))

    if (isCallout) {
      return (
        <div className="bg-slate border border-white/10 rounded-xl p-6 mt-4 mb-2 flex flex-col md:flex-row gap-5 items-start shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0 z-10 relative">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <p
            className="font-sm leading-[1.8] text-white/70 m-0 z-10"
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        </div>
      )
    }

    return (
      <p
        className="font-sm leading-[1.8] text-white/70 m-0"
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    )
  }

  // ── 404 ──
  if (!page) {
    return (
      <div className="bg-background flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🔍</span>
        <h1 className="text-2xl font-bold text-white m-0">Page not found</h1>
        <p className="text-base text-white/50">
          No page found for{" "}
          <code className="bg-white/8 px-2 py-0.5 rounded text-white/70">{slug}</code>
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-2.5 bg-primary text-background font-bold text-sm rounded-xl cursor-pointer hover:scale-105 transition-transform"
        >
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div className="text-white bg-background ">
      <div className="container mt-4 md:mt-6 mb-14 md:mb-20 ">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 py-2 px-4 rounded-sm font-base font-bold bg-primary  text-black hover:bg-primary/90 transition-colors mb-8 cursor-pointer  border-none"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div className="mb-10 md:mb-16">
          <h2 className="font-2xl font-bold text-white mb-1.5 tracking-tighter">{page.title}</h2>
          <p className="font-default text-white/60 mb-6 ">{page.subtitle}</p>
          <div className="w-16 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(0,200,83,0.3)]" />
        </div>

        {/* Sections with Timeline Layout */}
        <div className="relative pl-10 sm:pl-16">
          <div className="flex flex-col gap-16">
            {page.sections.map((section, sIdx) => {
              return (
                <section key={section.heading} className="relative">
                  {/* Timeline Dot - Solid green */}
                  <div className="absolute -left-7 sm:-left-10 top-1.5 w-2 h-2 rounded-full bg-primary z-10" />

                  {/* Timeline Line Segment - Rendered for all sections including the last one */}
                  <div className="absolute -left-6 sm:-left-9 top-6 -bottom-8 w-px bg-white/10" />

                  <h2 className="font-md font-black text-primary mb-6 tracking-tight flex items-center gap-3">
                    {section.heading}
                  </h2>

                  <div className="flex flex-col gap-5">
                    {section.content.map((para, pIdx) => (
                      <React.Fragment key={pIdx}>
                        {renderParagraph(para, sIdx, pIdx)}
                      </React.Fragment>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaticPage
