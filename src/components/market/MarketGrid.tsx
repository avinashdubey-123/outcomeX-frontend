import { ChevronRight } from "lucide-react"
import type { FC } from "react"
import { useNavigate } from "react-router"

import { MarketCardSkeleton, SkeletonKeyframes } from "@/components/ui/MarketSkeleton"
import type { Market } from "@/features/markets/types"

import { BinaryMarketCard } from "./BinaryMarketCard"

interface MarketGridProps {
  title: string
  markets: Market[]
  groupKey: string
}

// Same structure and grid as MarketGrid (title row + up to 4 cards in the same columns), so a
// section swaps in for its placeholder without the page shifting.
export const MarketGridSectionSkeleton: FC = () => (
  <section className="py-4" aria-busy="true">
    <SkeletonKeyframes />
    <div className="mb-4 flex h-6 items-end justify-between">
      <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MarketCardSkeleton key={i} />
      ))}
    </div>
  </section>
)

export const MarketGrid: FC<MarketGridProps> = ({ title, markets, groupKey }) => {
  const navigate = useNavigate()

  if (markets.length === 0) return null

  return (
    <section className="py-4">
      <div className="flex items-end justify-between mb-4">
        <h2 className="h2 font-bold uppercase tracking-[2px] text-white">{title}</h2>
        <button
          className="flex items-center gap-1 font-base text-nowrap font-bold uppercase  text-muted-foreground hover:text-primary transition-colors"
          onClick={() => navigate(`/markets/${groupKey}`)}
        >
          View All <ChevronRight className="size-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {markets.map((market) => (
          <BinaryMarketCard key={market.id} market={market} />
        ))}
      </div>
    </section>
  )
}
