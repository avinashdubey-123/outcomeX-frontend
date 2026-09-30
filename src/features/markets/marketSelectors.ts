import { createSelector } from "@reduxjs/toolkit"

import type { RootState } from "../../app/store"

export const selectMarketsState = (state: RootState) => state.markets

export const selectAllMarkets = createSelector(
  [selectMarketsState],
  (marketsState) => marketsState.list,
)

export const selectMarketsLoading = createSelector(
  [selectMarketsState],
  (marketsState) => marketsState.loading,
)
export const selectSelectedCategoryName = createSelector(
  [selectMarketsState],
  (marketsState) => marketsState.selectedCategoryName,
)

export const selectSelectedCategoryId = createSelector(
  [selectMarketsState],
  (marketsState) => marketsState.selectedCategoryId,
)

export const selectFilteredMarkets = createSelector(
  [selectAllMarkets, selectSelectedCategoryId],
  (markets, category) => {
    if (category === "All Markets") return markets
    return markets.filter((market) => market.category === category)
  },
)

export const selectTrendingMarkets = createSelector([selectAllMarkets], (markets) =>
  markets.filter((market) => market.isTrending),
)
export const selectNewMarkets = createSelector([selectMarketsState], (marketsState) => {
  return marketsState.list.filter((market) => {
    const now = Date.now()
    const createdAt = new Date(market.createdAt).getTime()
    const diffInHours = (now - createdAt) / (1000 * 60 * 60)
    return diffInHours <= 48 // ← created within last 48 hours
  })
})

export const selectSelectedMarket = (state: RootState) => state.markets.selectedMarket
