// src/pages/market/MarketsPage.tsx
//
// Handles three modes:
//   1. /markets/trending|ending_soon|new_market|earn_rewards  → known group from Redux
//   2. /markets/SomeCategory                                   → filter by category
//   3. /markets/search?q=bitcoin                              → search results from API

import { useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import { useParams, useSearchParams } from "react-router"

import { useAppDispatch } from "@/app/hooks"
import { BinaryMarketCard } from "@/components/market/BinaryMarketCard"
import { MarketGridSkeleton } from "@/components/ui/MarketSkeleton"
import { useGetCategoriesQuery } from "@/features/api/category/categoryApi"
import {
  useGetMarketsByCategoryQuery,
  useSearchMarketsQuery,
} from "@/features/api/markets/marketApi"
import {
  selectAllMarkets,
  selectNewMarkets,
  selectTrendingMarkets,
} from "@/features/markets/marketSelectors"
import { setSelectedCategoryById, setSelectedCategoryByName } from "@/features/markets/marketSlice"
import type { Market } from "@/features/markets/types"

// ── Constants ─────────────────────────────────────────────────────────────────
const KNOWN_GROUPS = new Set(["trending", "ending_soon", "new_market", "earn_rewards"])

const GROUP_TITLES: Record<string, string> = {
  trending: "Trending Markets",
  ending_soon: "Ending Soon",
  new_market: "New Markets",
  earn_rewards: "Earn Rewards",
}

// ── MarketsPage ───────────────────────────────────────────────────────────────
const MarketsPage = () => {
  const dispatch = useAppDispatch()
  const { group, category } = useParams<{ group?: string; category?: string }>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get("q") ?? ""

  // ── Redux market lists (from initial home page fetch) ──────────────────────
  const trending = useSelector(selectTrendingMarkets)
  const newMarkets = useSelector(selectNewMarkets)
  const allMarkets = useSelector(selectAllMarkets)

  // ── Mode detection ─────────────────────────────────────────────────────────
  // `category` from URL is now the category NAME (e.g. "Crypto"), not the id
  const categoryName = category ? decodeURIComponent(category) : ""
  const isSearch = !!searchQuery
  const isGroup = !!group && KNOWN_GROUPS.has(group)
  const isCategory = !!categoryName && categoryName !== "All Markets"

  // Look up the UUID for this category name from the API categories list.
  // API categories have UUID ids; mock ones have numeric ids ("1","2",...).
  const { data: apiCategories } = useGetCategoriesQuery()
  const matchedApiCategory = apiCategories?.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
  )
  // Only fire the backend call when the category resolves to a real UUID
  const categoryUuid = matchedApiCategory?.id ?? null
  const isApiCategory = !!categoryUuid

  // ── API: fetch markets by category (only for real API categories) ──────────
  const { data: categoryMarkets, isLoading: categoryLoading } = useGetMarketsByCategoryQuery(
    categoryUuid as string,
    {
      skip: !isCategory || !isApiCategory,
    },
  )

  // ── API: search markets by name ────────────────────────────────────────────
  // TODO: replace useSearchMarketsQuery with your actual search endpoint
  const { data: searchResults, isLoading: searchLoading } = useSearchMarketsQuery(searchQuery, {
    skip: !isSearch,
  })

  // clear selected category on unmount
  useEffect(() => {
    return () => {
      dispatch(setSelectedCategoryById(""))
      dispatch(setSelectedCategoryByName(""))
    }
  }, [dispatch])

  // ── Resolve which markets to show ──────────────────────────────────────────
  const markets: Market[] = useMemo(() => {
    if (isSearch) return searchResults ?? []
    if (isCategory) {
      // For API categories: use the fetched result; for mock categories: filter by name
      if (isApiCategory && categoryMarkets) return categoryMarkets
      return allMarkets.filter((m) => m.category.toLowerCase() === categoryName.toLowerCase())
    }
    if (isGroup) {
      const groupMap: Record<string, Market[]> = {
        trending,
        new_market: newMarkets,
        ending_soon: allMarkets,
        earn_rewards: allMarkets,
      }
      return groupMap[group ?? ""] ?? allMarkets
    }
    return allMarkets
  }, [
    isSearch,
    isCategory,
    isGroup,
    searchResults,
    categoryMarkets,
    trending,
    newMarkets,
    allMarkets,
    group,
    isApiCategory,
    categoryName,
  ])

  // ── Loading state ──────────────────────────────────────────────────────────
  const isLoading = (isCategory && isApiCategory && categoryLoading) || (isSearch && searchLoading)

  // ── Title ──────────────────────────────────────────────────────
  // Read the name directly from the URL param — survives refresh without Redux
  const title = isSearch
    ? `Search: "${searchQuery}"`
    : isCategory
      ? categoryName
      : group
        ? (GROUP_TITLES[group] ?? group)
        : "All Markets"

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container min-h-[calc(100vh-450px)] bg-background text-foreground mx-auto mt-2 mb-12 md:mb-18.5">
      <div className="flex items-baseline-last gap-3 pb-4 pt-4 ml-1 mb-6 capitalize  border-b border-b-white/7 ">
        <div>
          <h1 className="text-lg md:text-xl  font-bold text-white">{title as string}</h1>
          {isSearch && (
            <p className="font-sm text-white/40 mt-1">
              Search results for markets matching your query
            </p>
          )}
        </div>
        {!isLoading && (
          <span className="font-base font-medium text-muted-foreground text-nowrap">
            {markets.length} markets
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="px-4">
          <MarketGridSkeleton count={8} />
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-20 font-sm text-muted-foreground">
          {isSearch ? `No markets found for "${searchQuery}".` : "No markets found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {markets.map((market) => (
            <BinaryMarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MarketsPage
