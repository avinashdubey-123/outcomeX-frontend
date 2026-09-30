// src/features/api/portfolio/portfolioApi.ts

import { secondApi } from "../secondApi"

// ── API response types ────────────────────────────────────────────────────────

export interface ApiPortfolioPosition {
  market: {
    id: string
    title: string
    displayImageUrl: string
    conditionId: string | null
  }
  token: {
    id: string
    tokenId: string
    name: string // "Yes" | "No"
  }
  sharesOwned: string
  avgPrice: string
  totalInvested: string
  currentValue: string
  resolved: boolean
  winningOutcome: string | null
  redeemAmount: string
}

export interface GetPortfolioPositionsResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    data: ApiPortfolioPosition[]
    count: number
  }
}

export interface GetPortfolioPositionsParams {
  limit?: number
  skip?: number
}

// ── Endpoint ──────────────────────────────────────────────────────────────────

export const portfolioApi = secondApi.injectEndpoints({
  endpoints: (builder) => ({
    getPortfolioPositions: builder.query<
      GetPortfolioPositionsResponse,
      GetPortfolioPositionsParams
    >({
      query: ({ limit = 10, skip = 0 } = {}) => {
        const params = new URLSearchParams()
        params.set("limit", String(limit))
        if (skip) params.set("skip", String(skip))
        return `/v1/user/portfolio?${params.toString()}`
      },
      serializeQueryArgs: ({ queryArgs }) => queryArgs,
    }),
  }),
})

export const { useGetPortfolioPositionsQuery } = portfolioApi
