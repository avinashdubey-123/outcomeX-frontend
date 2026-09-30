// src/hooks/usePriceChart.ts

import { useEffect, useState } from "react"

import { type OhlcCandle, useGetPriceHistoryQuery } from "@/features/api/markets/marketApi"

export type { OhlcCandle }

export type ChartTab = "1D" | "1W" | "1M" | "ALL"

export const TAB_INTERVAL: Record<ChartTab, string> = {
  "1D": "1d",
  "1W": "1w",
  "1M": "1m",
  ALL: "1y",
}

interface UsePriceChartOptions {
  optionGroupId: string
}

export const usePriceChart = ({ optionGroupId }: UsePriceChartOptions) => {
  const [tab, setTab] = useState<ChartTab>("1M")

  const {
    data: history = [],
    isFetching,
    isError,
    error,
  } = useGetPriceHistoryQuery(
    { optionGroupId, interval: TAB_INTERVAL[tab] },
    { skip: !optionGroupId, refetchOnMountOrArgChange: true },
  )

  useEffect(() => {
    if (!optionGroupId) {
      console.warn("[usePriceChart] optionGroupId is empty — query skipped")
      return
    }
    if (isError) console.error("[usePriceChart] query error:", error)
  }, [optionGroupId, isFetching, isError, history, error])

  const changeTab = (newTab: ChartTab) => {
    setTab(newTab)
  }

  const lastPrice = history[history.length - 1]?.close ?? 0
  const firstPrice = history[0]?.close ?? 0

  // Keep the last known non-zero price so switching tabs doesn't
  // reset the header to 0¢ while the new interval is loading.
  // React "store information from previous renders" pattern — safe to call setState
  // during render when the condition guards against infinite loops.
  const [stableLastPrice, setStableLastPrice] = useState<number>(0)
  if (lastPrice > 0 && stableLastPrice !== lastPrice) setStableLastPrice(lastPrice)

  const priceDelta = lastPrice - firstPrice
  const pctChange = firstPrice > 0 ? (priceDelta / firstPrice) * 100 : 0
  const isPositive = pctChange >= 0

  return { tab, history, changeTab, lastPrice: stableLastPrice, pctChange, isPositive, isFetching }
}
