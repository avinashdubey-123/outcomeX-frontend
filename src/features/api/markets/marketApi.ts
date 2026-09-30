import type {
  ApiMarketListResponse,
  ApiMarketPriceResponse,
  ApiSingleMarketResponse,
} from "@/features/markets/apiTypes/marketApiTypes"
import type { Market } from "@/features/markets/types"

import { secondApi } from "../secondApi"

// ── Price history (OHLC) ──────────────────────────────────────────────────────
export interface OhlcCandle {
  time: number // unix seconds (from bucketStart)
  open: number // normalised 0–1
  high: number
  low: number
  close: number
}

interface PriceHistoryRaw {
  open: string
  high: string
  low: string
  close: string
  bucketStart: string
  bucketEnd: string
}

interface PriceHistoryResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: PriceHistoryRaw[]
}

interface toggleBookmarkResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    isBookmarked: boolean
  }
}
interface toggleBookmarkRequest {
  marketId: string
}

const mapApiMarketToMarket = (m: ApiMarketListResponse["data"]["data"][number]): Market => {
  const tokens = m.optionGroups?.[0]?.tokens ?? []
  const yesToken = tokens.find((t) => t.title === "Yes")
  const noToken = tokens.find((t) => t.title === "No")
  return {
    id: m.id,
    title: m.title,
    description: m.description ?? "",
    image: m.displayImageUrl ?? "",
    resolutionTime: m.resolutionTime,
    category: m.category?.name ?? "Unknown",
    createdAt: m.createdAt,

    yesVolume: yesToken?.volume ? yesToken.volume / 1000000 : 0,
    noVolume: noToken?.volume ? noToken.volume / 1000000 : 0,

    yesProbability: 50,
    noProbability: 50,

    collateralToken: "dummy",
    conditionId: "dummy",
    yesTokenId: yesToken?.id ?? null,
    noTokenId: noToken?.id ?? null,
    yesTokenOnChainId: yesToken?.tokenId ?? null,
    noTokenOnChainId: noToken?.tokenId ?? null,
    oracleIdentifier: m.oracleIdentifier,
    status: m.status,
    isBookmarked: m.isBookmarked ?? false,
    frequency: "Event",
  } satisfies Market
}

const marketApi = secondApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────────────────────
    // GET ALL MARKETS
    // ─────────────────────────────────────────────
    getMarkets: builder.query<Market[], void>({
      query: () => "/v1/user/marketplace",

      transformResponse: (res: ApiMarketListResponse): Market[] =>
        res.data.data.map(mapApiMarketToMarket),

      providesTags: ["Markets"],
    }),

    // ─────────────────────────────────────────────
    // GET MARKET BY ID
    // ─────────────────────────────────────────────
    getMarketById: builder.query<Market, string>({
      query: (marketId) => ({
        url: `/v1/user/marketplace/fetchSpecific`,
        params: { marketId },
      }),

      transformResponse: (res: ApiSingleMarketResponse): Market => {
        const m = res.data.data
        const tokens = m.optionGroups?.[0]?.tokens ?? []
        const yesToken = tokens.find((t) => t.title === "Yes")
        const noToken = tokens.find((t) => t.title === "No")

        return {
          id: m.id,
          title: m.title,
          description: m.description ?? "",
          image: m.displayImageUrl ?? "",
          category: m.category?.name ?? "Unknown",
          resolutionTime: m.resolutionTime,
          createdAt: m.createdAt,

          yesVolume: yesToken?.volume ? yesToken.volume / 1000000 : 0,
          noVolume: noToken?.volume ? noToken.volume / 1000000 : 0,

          yesProbability: 50,
          noProbability: 50,

          collateralToken: "dummy",
          conditionId: "dummy",
          oracleIdentifier: m.oracleIdentifier,
          winningOutcome: m.winningOutcome,
          status: m.status,
          isBookmarked: m.isBookmarked ?? false,
          yesTokenId: yesToken?.id ?? null,
          noTokenId: noToken?.id ?? null,
          yesTokenOnChainId: yesToken?.tokenId ?? null,
          noTokenOnChainId: noToken?.tokenId ?? null,
          optionGroupId: m.optionGroups[0]?.id,
        } satisfies Market
      },

      providesTags: ["Markets"],
    }),

    searchMarkets: builder.query<Market[], string>({
      query: (searchString) => ({
        url: "/v1/user/marketplace",
        params: {
          limit: 10,
          sortKey: "createdAt",
          sortDirection: "DESC",
          searchString,
        },
      }),

      transformResponse: (res: ApiMarketListResponse): Market[] =>
        res.data.data.map(mapApiMarketToMarket),

      providesTags: ["Markets"],
    }),

    getMarketsByCategory: builder.query<Market[], string>({
      query: (categoryId) => ({
        url: "/v1/user/marketplace",
        params: {
          categoryId,
          limit: 10,
          sortKey: "createdAt",
          sortDirection: "DESC",
        },
      }),

      transformResponse: (res: ApiMarketListResponse): Market[] =>
        res.data.data.map(mapApiMarketToMarket),

      providesTags: ["Markets"],
    }),

    // ─────────────────────────────────────────────
    // GET BOOKMARKED MARKETS
    // ─────────────────────────────────────────────
    getBookmarkedMarkets: builder.query<Market[], void>({
      query: () => ({
        url: "/v1/user/marketplace",
        params: {
          bookmarkedOnly: true,
          sortKey: "createdAt",
          sortDirection: "DESC",
        },
      }),
      transformResponse: (res: ApiMarketListResponse): Market[] =>
        res.data.data.map(mapApiMarketToMarket),
      providesTags: ["Markets"],
    }),

    // ─────────────────────────────────────────────
    // GET MARKET PRICE
    // ─────────────────────────────────────────────
    getMarketPrice: builder.query<number, string>({
      query: (optionGroupId) => `/v1/market-option-group/${optionGroupId}/price`,

      transformResponse: (res: ApiMarketPriceResponse): number => Number(res.data.price) / 10000, //cents
    }),

    // ─────────────────────────────────────────────
    // GET ORACLE TIMELINE
    // ─────────────────────────────────────────────
    getOracleTimeline: builder.query<
      {
        data: {
          id: string
          action: number
          bondAmount: string | null
          response: number | null
          createdAt: string
          proposerAddress: string | null
          disputerAddress: string | null
        }[]
      },
      string
    >({
      query: (marketId) => ({
        url: `/v1/user/marketplace/oracle-timeline`,
        params: { marketId },
      }),
    }),

    // ─────────────────────────────────────────────
    // GET PRICE HISTORY (OHLC)
    // ─────────────────────────────────────────────
    getPriceHistory: builder.query<OhlcCandle[], { optionGroupId: string; interval: string }>({
      query: ({ optionGroupId, interval }) =>
        `/v1/market-option-group/${optionGroupId}/price-history?interval=${interval}`,

      transformResponse: (res: PriceHistoryResponse): OhlcCandle[] => {
        return res.data.map((c) => ({
          time: Math.floor(new Date(c.bucketStart).getTime() / 1000),
          open: Number(c.open) / 1_000_000,
          high: Number(c.high) / 1_000_000,
          low: Number(c.low) / 1_000_000,
          close: Number(c.close) / 1_000_000,
        }))
      },
    }),

    // bookmark toggle API

    toggleBookmark: builder.mutation<{ isBookmarked: boolean }, toggleBookmarkRequest>({
      query: (body) => ({
        url: "/v1/user/marketplace/bookmark",
        method: "POST",
        body,
      }),
      transformResponse: (response: toggleBookmarkResponse) => ({
        isBookmarked: response.data.isBookmarked,
      }),
    }),
  }),
})

export const {
  useGetMarketsQuery,
  useGetMarketByIdQuery,
  useSearchMarketsQuery,
  useGetMarketsByCategoryQuery,
  useGetOracleTimelineQuery,
  useGetMarketPriceQuery,
  useGetPriceHistoryQuery,
  useGetBookmarkedMarketsQuery,
  useToggleBookmarkMutation,
} = marketApi
