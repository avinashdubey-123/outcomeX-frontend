import { type FC, useMemo } from "react"
import { useSelector } from "react-redux"

import { MyCarousel } from "@/components/custom/MyCarousel"
import { FeaturedPredictionCarousel } from "@/components/home/FeaturedPredictionCard"
import { HeroBanner } from "@/components/layout/HeroBanner"
import { MarketGrid } from "@/components/market/MarketGrid"
import { useGetCategoriesQuery } from "@/features/api/category/categoryApi"
import {
  byNewest,
  byVolume,
  pickDistinctSections,
  selectEndingSoon,
} from "@/features/markets/marketGroups"
import { selectAllMarkets, selectMarketsLoading } from "@/features/markets/marketSelectors"
import type { Market } from "@/features/markets/types"
import { MOCK_MARKETS } from "@/mocks/mockData"

const FEATURED_CATEGORY_INDEXES: Record<string, number> = {
  Crypto: 0,
  Politics: 0,
  Sports: 0,
  "Pop Culture": 0,
  Business: 0,
}

// Mock markets for the "Trending Now" hero carousel; clicking Trade Now opens them via Redux's selectedMarket.
const HERO_MARKETS = MOCK_MARKETS.slice(0, 5)

const SECTION_ORDER = ["newMarkets", "endingSoon", "earnRewards"] as const

const Home: FC = () => {
  const allMarkets = useSelector(selectAllMarkets)
  const isLoadingMarkets = useSelector(selectMarketsLoading)

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

  // Each headline gets its own ranking and never repeats a market shown above it.
  const sections = useMemo(
    () =>
      pickDistinctSections(
        {
          newMarkets: [...allMarkets].sort(byNewest),
          endingSoon: selectEndingSoon(allMarkets),
          earnRewards: [...allMarkets].sort(byVolume),
        },
        [...SECTION_ORDER],
      ),
    [allMarkets],
  )

  const renderHeroBanner = (item: Market, index: number) => (
    <HeroBanner
      key={index}
      market={item}
      title={item.title}
      description={item.description || ""}
      favorite="Democratic Party"
      favoriteProbability={52}
    />
  )

  return (
    <div className="bg-background text-white selection:bg-primary/30">
      <main className="container pb-12 pt-8">
        <FeaturedPredictionCarousel
          markets={featuredMarkets}
          isLoading={isLoadingMarkets || isCategoriesLoading}
        />
        <MyCarousel items={HERO_MARKETS} renderItem={renderHeroBanner} />
        <MarketGrid title="NEW MARKETS" markets={sections.newMarkets} groupKey="new_market" />
        <MarketGrid
          title="All Ending Soon Markets"
          markets={sections.endingSoon}
          groupKey="ending_soon"
        />
        <MarketGrid
          title="Earn Rewards for Supporting Market Activity"
          markets={sections.earnRewards}
          groupKey="earn_rewards"
        />
      </main>
    </div>
  )
}

export default Home
