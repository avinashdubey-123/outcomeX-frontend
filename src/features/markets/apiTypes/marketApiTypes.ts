// Raw API shapes used only for transformResponse in marketApi.ts
// MarketDetails has been removed — use the unified Market type from features/markets/types.ts

export interface ApiToken {
  id: string
  title: string // "Yes" | "No"
  volume: number
  tokenId: string
}

export interface ApiOptionGroup {
  id: string
  title: string
  tokens: ApiToken[]
}

export interface ApiCategory {
  id: string
  name: string
}

export interface ApiMarket {
  id: string
  title: string
  displayImageUrl: string | null
  categoryId: string
  description?: string
  resolutionTime: string
  createdAt: string

  status: number
  oracleIdentifier: string
  winningOutcome?: string | null
  isBookmarked?: boolean

  optionGroups: ApiOptionGroup[]

  category: {
    id: string
    name: string
  }
}

export interface ApiSingleMarketResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    data: ApiMarket
  }
}

export interface ApiMarketListResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    data: ApiMarket[]
    count: number
  }
}

export interface ApiMarketPriceResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    price: string
  }
}
