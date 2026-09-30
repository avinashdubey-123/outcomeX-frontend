import { Bookmark, Gift, RefreshCcw } from "lucide-react"
import type { FC } from "react"
import { useNavigate } from "react-router"

import { useAppDispatch } from "@/app/hooks"
import { IcoAI } from "@/components/custom/IcoAI"
import { Button } from "@/components/ui/button"
import { setSelectedMarket } from "@/features/markets/marketSlice"
import {
  getMarketStatusLabel,
  isMarketPending,
  MARKET_STATUS,
} from "@/features/markets/marketStatus"
import type { Market } from "@/features/markets/types"

import { PercentageBar } from "./PercentageBar"

interface MarketCardProps {
  market: Market
}

export const BinaryMarketCard: FC<MarketCardProps> = ({ market }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const yesP = market.yesProbability ?? 50
  const noP = market.noProbability ?? 50

  const totalVolume = (market.yesVolume ?? 0) + (market.noVolume ?? 0)
  const volumeLabel =
    totalVolume >= 1_000_000
      ? `$${(totalVolume / 1_000_000).toFixed(1)}M`
      : totalVolume >= 1_000
        ? `$${(totalVolume / 1_000).toFixed(0)}K`
        : `$${totalVolume.toLocaleString()}`

  const status = market.status
  const pending = status != null && isMarketPending(status)

  // Badge config per status group
  const statusBadge = (() => {
    if (status == null) return null
    if (status === MARKET_STATUS.RESOLVED || status === MARKET_STATUS.PAIDOUT)
      return {
        label: getMarketStatusLabel(status),
        className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      }
    if (status === MARKET_STATUS.CANCELLED)
      return { label: "Cancelled", className: "bg-red-500/15 text-red-400 border-red-500/30" }
    if (status === MARKET_STATUS.FAILED)
      return { label: "Failed", className: "bg-red-500/15 text-red-400 border-red-500/30" }
    if (pending)
      return {
        label: "Creating…",
        className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      }
    return null
  })()

  const handleNavigation = () => {
    dispatch(setSelectedMarket(market))
    navigate(`/event/${market.id}`)
  }

  return (
    <div className="group flex flex-col border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)]">
      <div className="flex gap-4 items-center max-h-10 mb-2">
        {statusBadge && (
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        )}
        <div className="size-10 min-w-10 rounded-md overflow-hidden border border-white ">
          <img
            src={
              market.image?.length
                ? market.image.includes("string")
                  ? "/fallbackImg.jpg"
                  : market.image
                : "/fallbackImg.jpg"
            }
            alt={market.title}
            className="size-full object-cover group-hover:grayscale transition-all duration-300"
          />
        </div>
        <h3
          onClick={handleNavigation}
          className="h3 font-bold leading-tight align-center capitalize line-clamp-2 overflow-hidden  group-hover:text-primary transition-colors"
        >
          {market.title}
        </h3>
      </div>

      <div className="mt-auto space-y-2.5">
        <div className="flex gap-2">
          <Button
            onClick={handleNavigation}
            variant="outline"
            className="flex-1 bg-option-yes h-9.5 border-yes/20 text-primary font-bold hover:bg-primary hover:text-background transition-all active:scale-95"
          >
            Yes {market.yesProbability}%
          </Button>
          <Button
            onClick={handleNavigation}
            variant="outline"
            className="flex-1 bg-option-no h-9.5  border-no/20 text-no font-bold hover:bg-no hover:text-background transition-all active:scale-95"
          >
            No {market.noProbability}%
          </Button>
        </div>

        <PercentageBar yesPercentage={yesP} noPercentage={noP} />

        <div className="flex items-center justify-between font-xs text-white font-bold  tracking-widest pt-4 border-t border-card-divider">
          <div className="flex items-center gap-3">
            <span className="flex font-base font-medium items-center gap-1">
              {volumeLabel} Vol.
            </span>
            <span className="flex  font-base  font-normal items-center gap-1">
              <RefreshCcw className="size-3.5" /> {market.frequency}
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
  )
}
