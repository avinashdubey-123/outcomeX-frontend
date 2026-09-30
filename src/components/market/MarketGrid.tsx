import { ChevronRight } from "lucide-react"
import type { FC } from "react"
import { useNavigate } from "react-router"

import type { Market } from "@/features/markets/types"

import { BinaryMarketCard } from "./BinaryMarketCard"

interface MarketGridProps {
  title: string
  markets: Market[]
  groupKey: string
}

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
