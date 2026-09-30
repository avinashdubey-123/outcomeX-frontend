import type { FC } from "react"
import { useNavigate } from "react-router"

import { useAppDispatch } from "@/app/hooks"
import { Button } from "@/components/ui/button"
import { setSelectedMarket } from "@/features/markets/marketSlice"
import type { Market } from "@/features/markets/types"

interface HeroBannerProps {
  title: string
  description: string
  favorite: string
  favoriteProbability: number
  market: Market
}

export const HeroBanner: FC<HeroBannerProps> = ({
  title,
  description,
  favorite,
  favoriteProbability,
  market,
}) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  function handleClickTrade() {
    dispatch(setSelectedMarket(market))
    if (market) {
      navigate(`/event/${market?.id as string}`)
    }
  }

  return (
    <section className="relative w-full h-[215x] lg:h-62.5 flex items-center overflow-hidden rounded-2xl bg-background border border-border mt-6">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-10" />
      <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_70%_50%,rgba(22,199,132,0.15)_0%,transparent_60%)]" />

      {/* Right Image */}
      <div className="absolute right-0 top-0 h-full w-full xl:w-3/4 overflow-hidden hidden lg:block">
        <div className="relative h-full w-full">
          <img
            src="/trending-slider.png"
            alt="Hero Visual"
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-l from-background/5 via-transparent to-transparent" />
        </div>
      </div>

      {/* Left Content */}
      <div className="relative z-20 p-5 md:p-8 max-w-2xl flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary font-bold font-xs uppercase tracking-widest">
          <span className="relative flex items-center justify-center h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </span>
          Trending Now
        </div>

        <h1 className="font-xl font-bold text-white  line-clamp-2">{title}</h1>

        <p className="text-white font-base md:text-sm max-w-md  line-clamp-2">{description}</p>

        <div className="flex flex-wrap items-center gap-3 mt-0">
          <Button
            size="sm"
            className="bg-primary text-background font-bold hover:bg-primary/90 px-6 h-8 rounded-sm  transition-transform active:scale-95 shadow-[0_6px_16px_-6px_rgba(22,199,132,0.4)]"
            onClick={handleClickTrade}
          >
            Trade Now
          </Button>

          <div className="flex flex-col">
            <span className="text-white font-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              Favorite
            </span>
            <span className="text-green-text font-bold font-base">
              {favorite} ({favoriteProbability}%)
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
