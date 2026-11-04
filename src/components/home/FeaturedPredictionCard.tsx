import { Bookmark, ChevronRight, Flame, Link2, Newspaper } from "lucide-react"
import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

import { PriceChart } from "@/components/market/priceChart/PriceChart"
import { useGetMarketByIdQuery, useGetMarketPriceQuery } from "@/features/api/markets/marketApi"
import type { Market } from "@/features/markets/types"
import { usePrice } from "@/hooks/socket/usePrice"
import { usePriceChart } from "@/hooks/socket/usePriceChart"

type Headline = { title: string; source: string; url: string; publishedAt?: string }

function formatTimeAgo(dateString?: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return `1 day ago`
  return `${diffInDays} days ago`
}

const HeadlineLink = ({
  headline,
  duplicate = false,
}: {
  headline: Headline
  duplicate?: boolean
}) => (
  <a
    href={headline.url}
    target="_blank"
    rel="noreferrer"
    aria-hidden={duplicate || undefined}
    tabIndex={duplicate ? -1 : undefined}
    className={`${duplicate ? "news-dup " : ""}flex min-h-[4.5rem] shrink-0 flex-col justify-center border-b border-white/5 py-2 leading-snug hover:text-primary last:border-0`}
  >
    <span className="mb-1 line-clamp-2">{headline.title}</span>
    <span className="text-[10px] font-medium tracking-wide text-white/40">
      {headline.source} &bull; {formatTimeAgo(headline.publishedAt)}
    </span>
  </a>
)

// Configurable time for prediction card tiles (in milliseconds)
const CAROUSEL_INTERVAL_MS = 7000

const hotTopicsList = [
  { id: 1, name: "Gemini", volume: "$297K today" },
  { id: 2, name: "Munar", volume: "$8.6K today" },
  { id: 3, name: "Serbia", volume: "$113K today" },
  { id: 4, name: "Jynxzi", volume: "$421K today" },
  { id: 5, name: "Rune", volume: "$6.4K today" },
]

type CardChart = Pick<
  ComponentProps<typeof PriceChart>,
  "history" | "tab" | "onTabChange" | "pctChange" | "isPositive"
>

interface FeaturedCardViewProps {
  market: Market
  displayYesProb: number
  displayNoProb: number
  displayCurrentPrice: number
  headlines: Headline[]
  isNewsLoading: boolean
  chart: CardChart
  onCopyLink: () => void
}

// Pure layout of one featured card (no data fetching). The loading placeholder renders this
// same component, so the placeholder and the real card are always exactly the same size.
function FeaturedCardView({
  market,
  displayYesProb,
  displayNoProb,
  displayCurrentPrice,
  headlines,
  isNewsLoading,
  chart,
  onCopyLink,
}: FeaturedCardViewProps) {
  return (
    <article className="@container h-full overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_70%_50%,rgba(22,199,132,0.15)_0%,transparent_60%)] p-5 shadow-xl md:p-6">
      <div className="flex items-start justify-between gap-4">
        <Link
          to={`/event/${market.id}`}
          className="flex items-start gap-3 hover:opacity-80 transition-opacity"
        >
          {market.image ? (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white/10">
              <img src={market.image} alt={market.category} className="size-full object-cover" />
            </div>
          ) : null}
          <div>
            <p className="text-xs text-white/55 capitalize">{market.category}</p>
            <h2 className="text-xl font-bold md:text-2xl line-clamp-2 capitalize min-h-[3.5rem] md:min-h-[4rem]">
              {market.title}
            </h2>
          </div>
        </Link>
        <div className="flex shrink-0 gap-3 text-white/70">
          <Link2
            className="size-5 cursor-pointer hover:text-white transition-colors"
            onClick={onCopyLink}
          />
          <Bookmark className="size-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Two columns only once the card itself is wide enough for the chart header (about 720px of
          content). Keyed to the card's width, not the screen: at 768-1280px screens the card
          shares its row with "Hot topics" and is much narrower than the screen suggests. */}
      <div className="mt-5 grid gap-6 @min-[720px]:grid-cols-[230px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-primary">YES</span>
            <strong className="text-xl text-white">{displayYesProb}%</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#ff2a2a]">NO</span>
            <strong className="text-xl text-white">{displayNoProb}%</strong>
          </div>
          <div className="pt-2 text-xs text-white/55">
            <p className="mb-3 flex items-center gap-2">
              <Newspaper className="size-3.5" />
              Latest News
            </p>
            {/* Fixed-size box in every state, so the card keeps the same height whether the news
                is loading, loaded or empty. */}
            <div className="news-marquee-box relative h-50 overflow-hidden">
              {isNewsLoading ? (
                <div className="animate-pulse">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex h-[4.5rem] flex-col justify-center gap-2 border-b border-white/5 last:border-0"
                    >
                      <div className="h-3 rounded bg-white/10" />
                      <div className="h-3 w-4/5 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : headlines.length ? (
                <>
                  <style>{`
                    @keyframes scroll-vertical {
                      0% { transform: translateY(0); }
                      100% { transform: translateY(-50%); }
                    }
                    .animate-scroll-vertical {
                      animation: scroll-vertical ${headlines.length * 3}s linear infinite;
                    }
                    /* Pause on hover, and while pressed on touch screens so a headline is tappable. */
                    .animate-scroll-vertical:hover,
                    .animate-scroll-vertical:active {
                      animation-play-state: paused;
                    }
                    /* No motion: stop the loop, drop the duplicate copy and let the box scroll. */
                    @media (prefers-reduced-motion: reduce) {
                      .animate-scroll-vertical { animation: none; }
                      .news-dup { display: none; }
                      .news-marquee-box { overflow-y: auto; }
                    }
                  `}</style>
                  <div
                    className={`flex flex-col ${headlines.length > 2 ? "animate-scroll-vertical" : ""}`}
                  >
                    {headlines.map((headline, i) => (
                      <HeadlineLink key={`${headline.title}-${i}`} headline={headline} />
                    ))}
                    {headlines.length > 2 &&
                      headlines.map((headline, i) => (
                        <HeadlineLink
                          key={`dup-${headline.title}-${i}`}
                          headline={headline}
                          duplicate
                        />
                      ))}
                  </div>
                </>
              ) : (
                <p className="py-2 text-white/40">No recent headlines.</p>
              )}
            </div>
          </div>
        </div>
        <div className="min-w-0" data-no-swipe>
          <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-white/60">
            <span>YES {displayYesProb}%</span>
            <span>NO {displayNoProb}%</span>
          </div>
          <PriceChart
            history={chart.history}
            tab={chart.tab}
            onTabChange={chart.onTabChange}
            currentPrice={displayCurrentPrice}
            pctChange={chart.pctChange}
            isPositive={chart.isPositive}
            height={175}
          />
        </div>
      </div>
    </article>
  )
}

const PLACEHOLDER_MARKET: Market = {
  id: "",
  title: "Loading",
  description: "",
  image: "",
  resolutionTime: "",
  category: "Loading",
  createdAt: "",
  collateralToken: "",
  conditionId: "",
  yesTokenId: null,
  noTokenId: null,
  yesTokenOnChainId: null,
  noTokenOnChainId: null,
  yesVolume: 0,
  noVolume: 0,
  yesProbability: 50,
  noProbability: 50,
}

// Loading state. It renders the real card layout invisibly, so it takes exactly the space the
// loaded card will (at every screen size), and a pulsing block is drawn over it. No height
// guesses, so nothing jumps when the real card arrives.
const FeaturedCardSkeleton = () => (
  <div className="relative" aria-busy="true" aria-label="Loading featured markets">
    <div className="invisible" aria-hidden>
      <FeaturedCardView
        market={PLACEHOLDER_MARKET}
        displayYesProb={50}
        displayNoProb={50}
        displayCurrentPrice={0.5}
        headlines={[]}
        isNewsLoading
        chart={{
          history: [],
          tab: "1D",
          onTabChange: () => undefined,
          pctChange: 0,
          isPositive: true,
        }}
        onCopyLink={() => undefined}
      />
    </div>
    <div className="absolute inset-0 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
  </div>
)

export function FeaturedPredictionCard({
  market: initialMarket,
  headlinesProp,
  isNewsLoadingProp,
}: {
  market: Market
  headlinesProp?: Headline[]
  isNewsLoadingProp?: boolean
}) {
  const { data: fullMarket } = useGetMarketByIdQuery(initialMarket.id)
  const market = fullMarket ?? initialMarket

  const { data: apiMarketPrice } = useGetMarketPriceQuery(market?.optionGroupId ?? "", {
    skip: !market?.optionGroupId,
  })
  const { price } = usePrice(market?.optionGroupId as string)

  let finalYesPrice = apiMarketPrice
  if (price) {
    finalYesPrice = Number(price.price) / 10000
  }

  const { tab, history, changeTab, lastPrice, pctChange, isPositive } = usePriceChart({
    optionGroupId: market?.optionGroupId ?? "",
  })

  const displayYesProb =
    finalYesPrice !== undefined
      ? Math.round(finalYesPrice)
      : lastPrice !== undefined
        ? Math.round(lastPrice * 100)
        : market.yesProbability
  const displayNoProb = 100 - displayYesProb
  const displayCurrentPrice =
    finalYesPrice !== undefined
      ? finalYesPrice / 100
      : lastPrice !== undefined
        ? lastPrice
        : market.yesProbability / 100

  // We now use the props passed down from the parent to avoid 5 duplicate requests!
  const headlines = headlinesProp ?? []
  const isNewsLoading = isNewsLoadingProp ?? false

  const handleCopyLink = () => {
    const url = `${window.location.origin}/event/${market.id}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard!")
  }

  return (
    <FeaturedCardView
      market={market}
      displayYesProb={displayYesProb}
      displayNoProb={displayNoProb}
      displayCurrentPrice={displayCurrentPrice}
      headlines={headlines}
      isNewsLoading={isNewsLoading}
      chart={{ history, tab, onTabChange: changeTab, pctChange, isPositive }}
      onCopyLink={handleCopyLink}
    />
  )
}

const HotTopicsAside = () => (
  <aside className="rounded-2xl border border-white/5 bg-[#121418] p-5 shadow-lg flex flex-col justify-between">
    <div>
      <div className="mb-6 flex items-center cursor-pointer group">
        <h3 className="text-lg font-bold text-white group-hover:text-white/80 transition-colors">
          Hot topics
        </h3>
        <ChevronRight className="ml-1 size-5 text-white/50 group-hover:text-white transition-colors" />
      </div>
      <div className="flex flex-col gap-5">
        {hotTopicsList.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-[15px] font-medium w-4">{topic.id}</span>
              <span className="text-white font-medium text-[15px] group-hover:text-primary group-hover:underline underline-offset-4 transition-all">
                {topic.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#88909e]">{topic.volume}</span>
              <Flame className="size-4 text-[#ff2a2a] fill-[#ff2a2a]" />
              <ChevronRight className="size-4 text-white/30 group-hover:text-white/60 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <button className="mt-8 w-full rounded-full border border-white/10 py-3 text-[15px] font-bold text-white transition-colors hover:bg-white/5">
      Explore all
    </button>
  </aside>
)

export function FeaturedPredictionCarousel({
  markets,
  isLoading,
}: {
  markets: Market[]
  isLoading?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [headlines, setHeadlines] = useState<Headline[]>([])
  // Starts true: the news request fires on mount, so show the skeleton rather than flashing empty.
  const [isNewsLoading, setIsNewsLoading] = useState(true)

  useEffect(() => {
    let active = true
    setIsNewsLoading(true)
    fetch(`/api/news?category=crypto`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("news unavailable")),
      )
      .then((payload: { articles?: Headline[] }) => {
        if (active) setHeadlines(payload.articles ?? [])
      })
      .catch(() => {
        if (active) setHeadlines([])
      })
      .finally(() => {
        if (active) setIsNewsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const count = markets.length
  const goNext = useCallback(() => setIndex((c) => (c + 1) % count), [count])
  const goPrev = useCallback(() => setIndex((c) => (c === 0 ? count - 1 : c - 1)), [count])

  // Restarts whenever the slide changes (including manual changes), so the auto-advance stays
  // in step with the progress bar instead of firing mid-way after a click or swipe.
  useEffect(() => {
    if (count < 2) return
    const timer = window.setTimeout(goNext, CAROUSEL_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [count, index, goNext])

  useEffect(() => {
    if (count < 2) return
    function handleKeyDown(e: KeyboardEvent) {
      // Don't hijack arrow keys while the user is typing or using a form control.
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [count, goNext, goPrev])

  // Swipe left/right on touch screens. Ignores mostly-vertical drags (page scroll) and drags
  // that start on the chart, which has its own touch interaction.
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as Element).closest("[data-no-swipe]")) return
    const t = e.touches[0]
    if (t) touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    const t = e.changedTouches[0]
    if (!start || !t) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  // Only the visible card and its neighbours are mounted. The rest would each fetch a market,
  // a price and chart history and open a price socket for a slide nobody is looking at.
  const isNearActive = (i: number) => {
    const d = Math.abs(i - index)
    return Math.min(d, count - d) <= 1
  }

  // Finished loading and nothing to feature: render nothing instead of a skeleton forever.
  if (!isLoading && !markets.length) return null

  if (isLoading) {
    return (
      <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(260px,.85fr)]">
        <div className="flex min-w-0 flex-col">
          <FeaturedCardSkeleton />
          <div className="mt-4 flex h-1.5 justify-center" />
        </div>
        <HotTopicsAside />
      </section>
    )
  }

  return (
    <section
      className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(260px,.85fr)]"
      aria-label="Featured prediction"
    >
      <div className="relative group/carousel flex flex-col min-w-0">
        <div
          className="touch-pan-y overflow-hidden rounded-2xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {markets.map((market, i) => (
              <div key={market.id} className="w-full shrink-0">
                {isNearActive(i) ? (
                  <FeaturedPredictionCard
                    market={market}
                    headlinesProp={headlines}
                    isNewsLoadingProp={isNewsLoading}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <style>{`
            @keyframes progress-fill {
              0% { transform: scaleX(0); }
              100% { transform: scaleX(1); }
            }
          `}</style>
          {markets.map((market, marketIndex) => {
            const isActive = marketIndex === index
            return (
              <button
                key={market.id}
                aria-label={`Show ${market.title}`}
                onClick={() => setIndex(marketIndex)}
                /* Extended hit-box to -inset-[8px] for great accessibility */
                className={`group relative h-1.5 transition-all duration-300 after:absolute after:-inset-[8px] after:content-[''] ${
                  isActive ? "w-8" : "w-1.5"
                }`}
              >
                {/* Changed absolute inset-0 to h-full w-full, added transform translate-z-0 */}
                <div
                  className={`h-full w-full transform translate-z-0 overflow-hidden rounded-full transition-colors duration-300 ${
                    isActive ? "bg-white/20" : "bg-white/30 group-hover:bg-white/50"
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-primary origin-left"
                      style={{
                        animation: `progress-fill ${CAROUSEL_INTERVAL_MS}ms linear forwards`,
                      }}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <HotTopicsAside />
    </section>
  )
}
