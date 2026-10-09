import { Bookmark, ChevronRight, Gift, RefreshCcw } from "lucide-react"
import { type FC, useMemo } from "react"
import { useSelector } from "react-redux"

import { IcoAI } from "@/components/custom/IcoAI"
import { MyCarousel } from "@/components/custom/MyCarousel"
import { FeaturedPredictionCarousel } from "@/components/home/FeaturedPredictionCard"
import { HeroBanner } from "@/components/layout/HeroBanner"
import { MarketGrid } from "@/components/market/MarketGrid"
import { useGetCategoriesQuery } from "@/features/api/category/categoryApi"
import {
  selectAllMarkets,
  selectMarketsLoading,
  selectNewMarkets,
} from "@/features/markets/marketSelectors"
import type { Market } from "@/features/markets/types"
import { MOCK_MARKETS } from "@/mocks/mockData"

const FEATURED_CATEGORY_INDEXES: Record<string, number> = {
  Crypto: 0,
  Politics: 0,
  Sports: 0,
  "Pop Culture": 0,
  Business: 0,
}

const Home: FC = () => {
  // const trendingMarkets = useSelector(selectTrendingMarkets)
  // const filteredMarkets = useSelector(selectFilteredMarkets)
  const allMarkets = useSelector(selectAllMarkets)
  const newMarkets = useSelector(selectNewMarkets)
  const isLoadingMarkets = useSelector(selectMarketsLoading)
  const mainHeroMarket = MOCK_MARKETS[0]

  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoriesQuery()

  const featuredMarkets = useMemo(() => {
    if (!categories) return []
    return categories
      .map((cat) => {
        const categoryMarkets = allMarkets.filter(
          (m) => m.category?.toLowerCase() === cat.name?.toLowerCase(),
        )
        if (categoryMarkets.length > 0) {
          // Find matching key case-insensitively or default to 0
          const configKey = Object.keys(FEATURED_CATEGORY_INDEXES).find(
            (k) => k.toLowerCase() === cat.name?.toLowerCase(),
          )
          const idx = configKey ? (FEATURED_CATEGORY_INDEXES[configKey] ?? 0) : 0
          return categoryMarkets[idx % categoryMarkets.length]!
        }
        return null
      })
      .filter(Boolean) as Market[]
  }, [allMarkets, categories])
  const carouselItems = MOCK_MARKETS.filter((_, i) => i < 5)

  function renderHeroBanner(item: Market, index: number): React.ReactNode {
    return (
      <HeroBanner
        key={index}
        market={item}
        title={item.title}
        description={item.description || ""}
        favorite="Democratic Party"
        favoriteProbability={52}
      />
    )
  }

  return (
    <div className="bg-background text-white selection:bg-primary/30">
      {/* {userLoading && <AuthLoader />} */}

      <main className="container pb-12 pt-8">
        <FeaturedPredictionCarousel
          markets={featuredMarkets}
          isLoading={isLoadingMarkets || isCategoriesLoading}
        />
        {mainHeroMarket && <MyCarousel items={carouselItems} renderItem={renderHeroBanner} />}
        <MarketGrid title="NEW MARKETS" markets={newMarkets.slice(0, 4)} groupKey={`new_market`} />
        <MarketGrid
          title="All Ending Soon Markets"
          markets={allMarkets.slice(0, 4)}
          groupKey={`ending_soon`}
        />
        <MarketGrid
          title="Earn Rewards for Supporting Market Activity"
          markets={allMarkets.slice(0, 4)}
          groupKey={`earn_rewards`}
        />

        {/* ─── STATIC SECTION: LAST CHANCE TO MAKE YOUR PREDICTIONS ─── */}
        <section className="pt-4">
          <div className="flex items-end justify-between mb-4">
            <h2 className="h2 font-bold uppercase tracking-[2px] text-white">
              LAST CHANCE TO MAKE YOUR PREDICTIONS
            </h2>
            <span className="font-base flex items-center gap-1 flex-nowrap font-bold uppercase text-muted-foreground hover:text-primary text-nowrap transition-colors cursor-pointer">
              View All <ChevronRight className="size-3" />
            </span>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
            {/* Card 1 — US strikes Iran (multi-option) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="flex items-center gap-4 mb-1.5 min-h-10">
                <div className="size-10 min-w-10 rounded-md overflow-hidden border border-white">
                  <img
                    src="https://images.unsplash.com/photo-1668076476189-7664ff0e7a91?q=80&w=400&auto=format&fit=crop"
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <h3 className="h3 font-bold leading-tight line-clamp-2 ">US strikes Iran by...?</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-3 w-full my-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 19
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">2%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 20
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">7%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between font-xs text-white font-bold tracking-widest pt-4 border-t border-card-divider mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex font-base font-medium items-center gap-1">$308M Vol.</span>
                  <span className="flex  font-base  font-normal items-center gap-1">
                    <RefreshCcw className="size-3.5" /> Monthly
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IcoAI size={14} className="hover:text-white transition-colors" />
                  <Gift className="size-3.5 hover:text-white transition-colors" />
                  <Bookmark className="size-3.5 hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Card 2 — Aliens (binary) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="flex items-center gap-4 mb-2 min-h-10">
                <div className="size-10 min-w-10 rounded-md overflow-hidden border border-white ">
                  <img
                    src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=400&auto=format&fit=crop"
                    alt=""
                    className="size-full object-cover group-hover:grayscale transition-all duration-300"
                  />
                </div>
                <h3 className="h3 font-bold leading-tight align-center line-clamp-2  group-hover:text-primary transition-colors">
                  Will the US confirm that aliens exist before 2027?
                </h3>
              </div>
              <div className="mt-auto space-y-2.5">
                <div className="flex gap-2">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm font-base font-bold ring-offset-background disabled:pointer-events-none disabled:opacity-50 border  flex-1 bg-option-yes h-9.5 border-yes/20 text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                    Yes 40%
                  </button>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm font-base font-bold ring-offset-background disabled:pointer-events-none disabled:opacity-50 border  flex-1 bg-option-no h-9.5 border-no/20 text-no hover:bg-no hover:text-background transition-all active:scale-95">
                    No 60%
                  </button>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex h-1 w-full overflow-hidden rounded-full bg-muted/30">
                    <div
                      className="h-full bg-yes transition-all duration-500 ease-out shadow-[0_0_8px_rgba(22,199,132,0.6)]"
                      style={{ width: "40%" }}
                    />
                    <div
                      className="h-full bg-progress-bar transition-all duration-500 ease-out shadow-[0_0_8px_rgba(234,57,67,0.6)]"
                      style={{ width: "60%" }}
                    />
                  </div>
                  <div className="flex justify-between font-base font-medium uppercase tracking-wider">
                    <span className="text-primary">40%</span>
                    <span className="text-no">60%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between font-xs text-white font-bold  tracking-widest pt-4 border-t border-card-divider mt-auto">
                  <div className="flex items-center gap-3">
                    <span className="flex font-base font-medium items-center gap-1">
                      $4.1M Vol.
                    </span>
                    <span className="flex  font-base  font-normal items-center gap-1">
                      <RefreshCcw className="size-3.5" /> Monthly
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IcoAI size={14} className="hover:text-white transition-colors" />
                    <Gift className="size-3.5 hover:text-white transition-colors" />
                    <Bookmark className="size-3.5 hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 — NBA Western Conference (multi-option) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="flex items-center gap-4 mb-1.5 min-h-10">
                <div className="size-10 min-w-10 rounded-md overflow-hidden border border-white">
                  <img
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop"
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <h3 className="h3 font-bold leading-tight line-clamp-2 ">
                  NBA Western Conference Champion
                </h3>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-3 w-full my-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 19
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">2%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 20
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">7%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between font-xs text-white font-bold tracking-widest pt-4 border-t border-card-divider mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex font-base font-medium items-center gap-1">$308M Vol.</span>
                  <span className="flex  font-base  font-normal items-center gap-1">
                    <RefreshCcw className="size-3.5" /> Monthly
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IcoAI size={14} className="hover:text-white transition-colors" />
                  <Gift className="size-3.5 hover:text-white transition-colors" />
                  <Bookmark className="size-3.5 hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Card 4 — Nets vs Cavaliers (sports style) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="space-y-3 mb-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md overflow-hidden border border-white">
                      <img
                        src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop"
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="font-bold ">Nets</span>
                  </div>
                  <span className="font-bold ">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md overflow-hidden border border-white">
                      <img
                        src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=400&auto=format&fit=crop"
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="font-bold ">Cavaliers</span>
                  </div>
                  <span className="font-bold">40%</span>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <button className="flex-1 h-9.5 rounded-sm font-base font-bold border border-yes/20 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                  Nets
                </button>
                <button className="flex-1 h-9.5 rounded-sm font-base font-bold border border-no/20 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                  Cavaliers
                </button>
              </div>
              <div className="flex items-center justify-between font-xs text-white font-bold tracking-widest pt-4 border-t border-card-divider mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex font-base font-medium items-center gap-1">$4.1M Vol.</span>
                  <span className="flex  font-base  font-normal items-center gap-1">
                    <RefreshCcw className="size-3.5" /> NBA 5:30 AM
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IcoAI size={14} className="hover:text-white transition-colors" />
                  <Gift className="size-3.5 hover:text-white transition-colors" />
                  <Bookmark className="size-3.5 hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Row 2 */}

            {/* Card 5 — Democratic Presidential Nominee (multi-option) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="flex items-center gap-4 mb-1.5">
                <div className="size-10 min-w-10 rounded-md overflow-hidden border border-white">
                  <img
                    src="https://images.unsplash.com/photo-1569285645462-a3f9c6332d56?q=80&w=400&auto=format&fit=crop"
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <h3 className="h3 font-bold leading-tight line-clamp-2 min-h-10">
                  Democratic Presidential Nominee 2028
                </h3>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-3 w-full my-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 19
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">2%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 20
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">7%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between font-xs text-white font-bold tracking-widest pt-4 border-t border-card-divider mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex font-base font-medium items-center gap-1">$308M Vol.</span>
                  <span className="flex  font-base  font-normal items-center gap-1">
                    <RefreshCcw className="size-3.5" /> Monthly
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IcoAI size={14} className="hover:text-white transition-colors" />
                  <Gift className="size-3.5 hover:text-white transition-colors" />
                  <Bookmark className="size-3.5 hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Card 6 — Jesus Christ (binary) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="flex items-center gap-4 mb-2 min-h-10">
                <div className="size-10 min-w-10 rounded-md overflow-hidden border border-white ">
                  <img
                    src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=400&auto=format&fit=crop"
                    alt=""
                    className="size-full object-cover group-hover:grayscale transition-all duration-300"
                  />
                </div>
                <h3 className="h3 font-bold leading-tight align-center line-clamp-2  group-hover:text-primary transition-colors">
                  Will Jesus Christ return before 2027?
                </h3>
              </div>
              <div className="mt-auto space-y-2.5">
                <div className="flex gap-2">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm font-base font-bold ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-yes/20 flex-1 bg-option-yes h-9.5 text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                    Yes 40%
                  </button>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm font-base font-bold ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-no/20 flex-1 bg-option-no h-9.5 text-no hover:bg-no hover:text-background transition-all active:scale-95">
                    No 60%
                  </button>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex h-1 w-full overflow-hidden rounded-full bg-muted/30">
                    <div
                      className="h-full bg-yes transition-all duration-500 ease-out shadow-[0_0_8px_rgba(22,199,132,0.6)]"
                      style={{ width: "40%" }}
                    />
                    <div
                      className="h-full bg-progress-bar transition-all duration-500 ease-out shadow-[0_0_8px_rgba(234,57,67,0.6)]"
                      style={{ width: "60%" }}
                    />
                  </div>
                  <div className="flex justify-between font-base font-medium uppercase tracking-wider">
                    <span className="text-primary">40%</span>
                    <span className="text-no">60%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between font-xs text-white font-bold tracking-widest pt-4 border-t border-card-divider mt-auto">
                  <div className="flex items-center gap-3">
                    <span className="flex font-base font-medium items-center gap-1">
                      $4.1M Vol.
                    </span>
                    <span className="flex  font-base  font-normal items-center gap-1">
                      <RefreshCcw className="size-3.5" /> Monthly
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IcoAI size={14} className="hover:text-white transition-colors" />
                    <Gift className="size-3.5 hover:text-white transition-colors" />
                    <Bookmark className="size-3.5 hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 7 — Trump Fed Chair (multi-option) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="flex items-center gap-4 mb-1.5">
                <div className="size-10 min-w-10 rounded-md overflow-hidden border border-white">
                  <img
                    src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=400&auto=format&fit=crop"
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <h3 className="h3 font-bold leading-tight line-clamp-2 min-h-10">
                  Who will Trump nominate as Fed Chair?
                </h3>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-3 w-full my-1">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 19
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">2%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center  rounded-sm font-base font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-sm font-base font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-medium hover:underline cursor-pointer">
                    February 20
                  </span>
                  <div className="flex justify-end items-center gap-3">
                    <span className="font-bold text-sm">7%</span>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center justify-center rounded-md text-[12px] font-bold ring-offset-background border border-yes/20 px-4 py-2 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                        Yes
                      </button>
                      <button className="inline-flex items-center justify-center rounded-md text-[12px] font-bold ring-offset-background border border-no/20 px-4 py-2 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between font-xs text-white font-bold tracking-widest pt-4 border-t border-card-divider mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex font-base font-medium items-center gap-1">$308M Vol.</span>
                  <span className="flex  font-base  font-normal items-center gap-1">
                    <RefreshCcw className="size-3.5" /> Monthly
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IcoAI size={14} className="hover:text-white transition-colors" />
                  <Gift className="size-3.5 hover:text-white transition-colors" />
                  <Bookmark className="size-3.5 hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Card 8 — Nets vs Cavaliers (sports style) */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              }}
              className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer h-full"
            >
              <div className="space-y-3 mb-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md overflow-hidden border border-white">
                      <img
                        src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400&auto=format&fit=crop"
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="font-bold ">Nets</span>
                  </div>
                  <span className="font-bold ">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md overflow-hidden border border-white">
                      <img
                        src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=400&auto=format&fit=crop"
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="font-bold ">Cavaliers</span>
                  </div>
                  <span className="font-bold">40%</span>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <button className="flex-1 h-9.5 rounded-sm font-base font-bold border border-yes/20 bg-option-yes text-primary hover:bg-primary hover:text-background transition-all active:scale-95">
                  Nets
                </button>
                <button className="flex-1 h-9.5 rounded-sm font-base font-bold border border-no/20 bg-option-no text-no hover:bg-no hover:text-background transition-all active:scale-95">
                  Cavaliers
                </button>
              </div>
              <div className="flex items-center justify-between font-xs text-white font-bold  tracking-widest pt-4 border-t border-card-divider mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex font-base font-medium items-center gap-1">$4.1M Vol.</span>
                  <span className="flex  font-base  font-normal items-center gap-1">
                    <RefreshCcw className="size-3.5" /> NBA 5:30 AM
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IcoAI size={14} className="hover:text-white transition-colors" />
                  <Gift className="size-3.5 hover:text-white transition-colors" />
                  <Bookmark className="size-3.5 hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
