import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Market, MarketsState } from "./types"
export type { MarketsState }

const initialState: MarketsState = {
  list: [],
  loading: false,
  error: null,
  selectedCategoryId: "",
  selectedMarket: null,
  selectedCategoryName: "",
  bookmarkedIds: [],
}

const marketSlice = createSlice({
  name: "markets",
  initialState,
  reducers: {
    setMarkets: (state, action: PayloadAction<Market[]>) => {
      state.list = action.payload
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    setSelectedCategoryById: (state, action: PayloadAction<string>) => {
      state.selectedCategoryId = action.payload
    },
    setSelectedCategoryByName: (state, action: PayloadAction<string>) => {
      state.selectedCategoryName = action.payload
    },
    setSelectedMarket: (state, action: PayloadAction<Market | null>) => {
      state.selectedMarket = action.payload
    },

    // Seed bookmarkedIds from a fresh market list (called after getMarkets resolves)
    setBookmarkedIds: (state, action: PayloadAction<string[]>) => {
      state.bookmarkedIds = action.payload
    },

    // Optimistic toggle — flips a single market's bookmark without waiting for the API
    toggleBookmarkLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const idx = state.bookmarkedIds.indexOf(id)
      if (idx === -1) {
        state.bookmarkedIds.push(id)
      } else {
        state.bookmarkedIds.splice(idx, 1)
      }
      // Keep isBookmarked on the market object in sync
      const market = state.list.find((m) => m.id === id)
      if (market) market.isBookmarked = idx === -1
    },
  },
})

export const {
  setMarkets,
  setLoading,
  setError,
  setSelectedCategoryById,
  setSelectedCategoryByName,
  setSelectedMarket,
  setBookmarkedIds,
  toggleBookmarkLocal,
} = marketSlice.actions

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectBookmarkedIds = (state: { markets: MarketsState }) => state.markets.bookmarkedIds
export const selectIsBookmarked = (id: string) => (state: { markets: MarketsState }) =>
  state.markets.bookmarkedIds.includes(id)
export default marketSlice.reducer
