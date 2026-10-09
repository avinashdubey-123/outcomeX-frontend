import { Bookmark, ChevronRight, Flame, Link2, Newspaper } from "lucide-react"
import { useEffect, useState } from "react"
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

// Configurable time for prediction card tiles (in milliseconds)
const CAROUSEL_INTERVAL_MS = 7000

const hotTopicsList = [
  { id: 1, name: "Gemini", volume: "$297K today" },
  { id: 2, name: "Munar", volume: "$8.6K today" },
  { id: 3, name: "Serbia", volume: "$113K today" },
  { id: 4, name: "Jynxzi", volume: "$421K today" },
  { id: 5, name: "Rune", volume: "$6.4K today" },
]

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
    <article className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_70%_50%,rgba(22,199,132,0.15)_0%,transparent_60%)] p-5 shadow-xl md:p-6">
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
            onClick={handleCopyLink}
          />
          <Bookmark className="size-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[230px_minmax(0,1fr)]">
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
            {isNewsLoading ? (
              <div className="space-y-2">
                <div className="h-3 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
              </div>
            ) : headlines.length ? (
              <div className="relative h-50 overflow-hidden">
                <style>{`
                    @keyframes scroll-vertical {
                      0% { transform: translateY(0); }
                      100% { transform: translateY(-50%); }
                    }
                    .animate-scroll-vertical {
                      animation: scroll-vertical ${headlines.length * 3}s linear infinite;
                    }
                    .animate-scroll-vertical:hover {
                      animation-play-state: paused;
                    }
                  `}</style>
                <div
                  className={`flex flex-col ${headlines.length > 3 ? "animate-scroll-vertical" : ""}`}
                >
                  {[...headlines, ...headlines].map((headline, i) => (
                    <a
                      key={`${headline.title}-${i}`}
                      href={headline.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-[4.5rem] shrink-0 flex-col justify-center border-b border-white/5 py-2 leading-snug hover:text-primary last:border-0"
                    >
                      <span className="mb-1 line-clamp-2">{headline.title}</span>
                      <span className="text-[10px] font-medium tracking-wide text-white/40">
                        {headline.source} &bull; {formatTimeAgo(headline.publishedAt)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-white/60">
            <span>YES {displayYesProb}%</span>
            <span>NO {displayNoProb}%</span>
          </div>
          <PriceChart
            history={history}
            tab={tab}
            onTabChange={changeTab}
            currentPrice={displayCurrentPrice}
            pctChange={pctChange}
            isPositive={isPositive}
            height={175}
          />
        </div>
      </div>
    </article>
  )
}

export function FeaturedPredictionCarousel({
  markets,
  isLoading,
}: {
  markets: Market[]
  isLoading?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [isNewsLoading, setIsNewsLoading] = useState(false)

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

  useEffect(() => {
    if (markets.length < 2) return
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % markets.length),
      CAROUSEL_INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [markets.length])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setIndex((curr) => (curr === 0 ? markets.length - 1 : curr - 1))
      else if (e.key === "ArrowRight") setIndex((curr) => (curr + 1) % markets.length)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [markets.length])

  if (isLoading || !markets.length) {
    return (
      <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(260px,.85fr)]">
        <div className="h-[380px] w-full animate-pulse rounded-2xl bg-white/5 border border-white/10" />
        <div className="h-[380px] w-full animate-pulse rounded-2xl bg-[#121418] border border-white/5" />
      </section>
    )
  }

  return (
    <section
      className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(260px,.85fr)]"
      aria-label="Featured prediction"
    >
      <div className="relative group/carousel flex flex-col min-w-0">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {markets.map((market) => (
              <div key={market.id} className="w-full shrink-0">
                <FeaturedPredictionCard
                  market={market}
                  headlinesProp={headlines}
                  isNewsLoadingProp={isNewsLoading}
                />
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
              <div
                key={topic.id}
                className="flex items-center justify-between cursor-pointer group"
              >
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
    </section>
  )
}
