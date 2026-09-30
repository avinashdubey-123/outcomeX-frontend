import type { Market } from "../features/markets/types"

// ─────────────────────────────────────────────────────────────────────────────
// This file simulates what your backend API will actually return.
// When the backend is ready, delete this file and replace the import in your
// components with the real RTK Query hook (e.g. useGetMarketsQuery).
//
// Backend endpoint this will eventually replace:
//   GET /api/markets          → returns ApiMarketsResponse
//   GET /api/markets/:id      → returns a single Market
//   GET /api/categories       → returns ApiCategoriesResponse
// ─────────────────────────────────────────────────────────────────────────────

// ─── API Response Shape ───────────────────────────────────────────────────────

export interface ApiMarketsResponse {
  success: boolean
  data: Market[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}

export interface ApiCategoriesResponse {
  status: boolean
  statusCode: number
  message: string
  type: string
  data: {
    data: Category[]
    count: number
  }
}

export interface ApiSingleMarketResponse {
  success: boolean
  data: Market
}

// ─── Simulated Network Delay ──────────────────────────────────────────────────

const simulateDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// ─── Shared dummy data ────────────────────────────────────────────────────────

const DUMMY_PRICE_HISTORY = [
  { timestamp: "2024-10-01T00:00:00.000Z", yesPrice: 0.45 },
  { timestamp: "2024-10-02T00:00:00.000Z", yesPrice: 0.4 },
  { timestamp: "2024-10-03T00:00:00.000Z", yesPrice: 0.32 },
  { timestamp: "2024-10-04T00:00:00.000Z", yesPrice: 0.54 },
  { timestamp: "2024-10-05T00:00:00.000Z", yesPrice: 0.6 },
  { timestamp: "2024-10-06T00:00:00.000Z", yesPrice: 0.12 },
  { timestamp: "2024-10-07T00:00:00.000Z", yesPrice: 0.15 },
  { timestamp: "2024-10-08T00:00:00.000Z", yesPrice: 0.2 },
  { timestamp: "2024-10-09T00:00:00.000Z", yesPrice: 0.45 },
  { timestamp: "2024-10-10T00:00:00.000Z", yesPrice: 0.55 },
  { timestamp: "2024-10-11T00:00:00.000Z", yesPrice: 0.42 },
  { timestamp: "2024-10-12T00:00:00.000Z", yesPrice: 0.41 },
  { timestamp: "2024-10-25T00:00:00.000Z", yesPrice: 0.5 },
  { timestamp: "2024-10-29T00:00:00.000Z", yesPrice: 0.53 },
  { timestamp: "2024-11-01T00:00:00.000Z", yesPrice: 0.52 },
]

const DUMMY_ORDER_BOOK = {
  yes: [
    { price: 0.54, shares: 12400 },
    { price: 0.52, shares: 8700 },
    { price: 0.5, shares: 5200 },
    { price: 0.48, shares: 3100 },
    { price: 0.46, shares: 1800 },
  ],
  no: [
    { price: 0.46, shares: 11200 },
    { price: 0.44, shares: 7500 },
    { price: 0.42, shares: 4300 },
    { price: 0.4, shares: 2600 },
    { price: 0.38, shares: 900 },
  ],
}

const DUMMY_RULES = `This market resolves YES if the outcome is confirmed by a majority of credible sources including Reuters, AP, or BBC before the expiry date. Resolution will be determined by the market admin within 48 hours of the event conclusion. In the case of ambiguity or conflicting reports, the market may be extended or resolved as N/A.`

const RESOLVER = "0xabc123def456abc123def456abc123def456abc1"

// ─── Blockchain fields ────────────────────────────────────────────────────────

const COLLATERAL = "native"

const MARKET_CHAIN_DATA = [
  {
    conditionId: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    yesTokenId: "13274593487362947562839471056284719304827365487293647182736451827364",
    noTokenId: "98473621094837261094837261094837261094837261094837261094837261094837",
  },
  {
    conditionId: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    yesTokenId: "24385604598473610594837261094837261094837261094837261094837261094838",
    noTokenId: "87362510948372610948372610948372610948372610948372610948372610948372",
  },
  {
    conditionId: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    yesTokenId: "35496715609584721605948372610948372610948372610948372610948372610949",
    noTokenId: "76251094837261094837261094837261094837261094837261094837261094837261",
  },
  {
    conditionId: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    yesTokenId: "46507826710695832716059483726109483726109483726109483726109483726110",
    noTokenId: "65140983726109483726109483726109483726109483726109483726109483726109",
  },
  {
    conditionId: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    yesTokenId: "57618937821706943827160594837261094837261094837261094837261094837261",
    noTokenId: "54039872610948372610948372610948372610948372610948372610948372610948",
  },
  {
    conditionId: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    yesTokenId: "68729048932817054938271605948372610948372610948372610948372610948372",
    noTokenId: "43928761094837261094837261094837261094837261094837261094837261094837",
  },
  {
    conditionId: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    yesTokenId: "79830159043928165049382716059483726109483726109483726109483726109483",
    noTokenId: "32817650948372610948372610948372610948372610948372610948372610948372",
  },
  {
    conditionId: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    yesTokenId: "80941260154039276150493827160594837261094837261094837261094837261094",
    noTokenId: "21706539837261094837261094837261094837261094837261094837261094837261",
  },
  {
    conditionId: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    yesTokenId: "91052371265140387261605948372610948372610948372610948372610948372610",
    noTokenId: "10595428726109483726109483726109483726109483726109483726109483726109",
  },
  {
    conditionId: "0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
    yesTokenId: "02163482376251498372716059483726109483726109483726109483726109483726",
    noTokenId: "09484317615948372610948372610948372610948372610948372610948372610948",
  },
  {
    conditionId: "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    yesTokenId: "13274593487362947562839471056284719304827365487293647182736451827364",
    noTokenId: "98473621094837261094837261094837261094837261094837261094837261094111",
  },
  {
    conditionId: "0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    yesTokenId: "24385604598473610594837261094837261094837261094837261094837261094222",
    noTokenId: "87362510948372610948372610948372610948372610948372610948372610948333",
  },
  {
    conditionId: "0xd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
    yesTokenId: "35496715609584721605948372610948372610948372610948372610948372610444",
    noTokenId: "76251094837261094837261094837261094837261094837261094837261094837555",
  },
  {
    conditionId: "0xe4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
    yesTokenId: "46507826710695832716059483726109483726109483726109483726109483726666",
    noTokenId: "65140983726109483726109483726109483726109483726109483726109483726777",
  },
  {
    conditionId: "0xf5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
    yesTokenId: "57618937821706943827160594837261094837261094837261094837261094837888",
    noTokenId: "54039872610948372610948372610948372610948372610948372610948372610999",
  },
  {
    conditionId: "0xa6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
    yesTokenId: "68729048932817054938271605948372610948372610948372610948372610948888",
    noTokenId: "43928761094837261094837261094837261094837261094837261094837261094999",
  },
  {
    conditionId: "0xb7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8",
    yesTokenId: "79830159043928165049382716059483726109483726109483726109483726109888",
    noTokenId: "32817650948372610948372610948372610948372610948372610948372610948999",
  },
  {
    conditionId: "0xc8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
    yesTokenId: "80941260154039276150493827160594837261094837261094837261094837261888",
    noTokenId: "21706539837261094837261094837261094837261094837261094837261094837999",
  },
  {
    conditionId: "0xd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
    yesTokenId: "91052371265140387261605948372610948372610948372610948372610948372888",
    noTokenId: "10595428726109483726109483726109483726109483726109483726109483726999",
  },
  {
    conditionId: "0xe0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
    yesTokenId: "02163482376251498372716059483726109483726109483726109483726109483888",
    noTokenId: "09484317615948372610948372610948372610948372610948372610948372610999",
  },
  {
    conditionId: "0xf1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    yesTokenId: "13274593487362947562839471056284719304827365487293647182736451827888",
    noTokenId: "98473621094837261094837261094837261094837261094837261094837261094999",
  },
  {
    conditionId: "0xa2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3",
    yesTokenId: "24385604598473610594837261094837261094837261094837261094837261094888",
    noTokenId: "87362510948372610948372610948372610948372610948372610948372610948999",
  },
]

// ─── Markets ──────────────────────────────────────────────────────────────────
// All markets use the unified Market type — same shape as the API response.
// volume: split into yesVolume + noVolume (numeric, in USD equivalent)
// image: was thumbnailUrl
// resolutionTime: was expiryDate

export const RAW_MARKETS: Market[] = [
  {
    id: "1",
    title: "2024 Presidential Election Winner",
    category: "Politics",
    description:
      "Predict the outcome of the upcoming US Presidential Election. Over $142M in total trading volume.",
    image:
      "https://images.unsplash.com/photo-1569285645462-a3f9c6332d56?q=80&w=1170&auto=format&fit=crop",
    resolutionTime: "2024-11-05T00:00:00.000Z",
    yesProbability: 52,
    noProbability: 48,
    yesVolume: 73_840_000,
    noVolume: 68_160_000,
    frequency: "Event",
    isTrending: true,
    createdAt: "2024-09-01T08:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[0]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[0]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[0]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "2",
    title: "US strikes Iran by end of March?",
    category: "Geopolitics",
    description: "Will the United States conduct military strikes against Iran before March 31?",
    image:
      "https://images.unsplash.com/photo-1668076476189-7664ff0e7a91?q=80&w=1172&auto=format&fit=crop",
    resolutionTime: "2024-03-31T00:00:00.000Z",
    yesProbability: 7,
    noProbability: 93,
    yesVolume: 21_560_000,
    noVolume: 286_440_000,
    frequency: "Monthly",
    createdAt: "2024-01-10T10:30:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[1]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[1]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[1]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "3",
    title: "How long will the DHS shutdown last?",
    category: "Politics",
    description: "Predicts the duration of the Department of Homeland Security funding lapse.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2024-02-20T00:00:00.000Z",
    yesProbability: 7,
    noProbability: 93,
    yesVolume: 1_260_000,
    noVolume: 16_740_000,
    frequency: "Daily",
    createdAt: "2024-01-15T14:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[2]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[2]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[2]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "4",
    title: "Khamenei out as Supreme Leader of Iran by March 31?",
    category: "Geopolitics",
    description:
      "Will Ali Khamenei step down or be removed as Supreme Leader of Iran before April 1 2024?",
    image:
      "https://media.istockphoto.com/id/124638317/photo/ruhollah-musavi-khomeini.jpg?s=2048x2048&w=is&k=20&c=uKLf5xGfia4OcraqtZ7dYyzKLNchRzsH0yTLiXWM16A=",
    resolutionTime: "2024-03-31T00:00:00.000Z",
    yesProbability: 40,
    noProbability: 60,
    yesVolume: 1_640_000,
    noVolume: 2_460_000,
    frequency: "Monthly",
    createdAt: "2024-02-01T09:15:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[3]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[3]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[3]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "5",
    title: "Which company has best AI model end of February?",
    category: "AI",
    description:
      "Predicts which AI company will hold the top model position by end of February 2024.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2024-02-28T00:00:00.000Z",
    yesProbability: 7,
    noProbability: 93,
    yesVolume: 21_560_000,
    noVolume: 286_440_000,
    frequency: "Monthly",
    createdAt: "2024-01-20T11:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[4]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[4]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[4]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "6",
    title: "BTC 5 Minute Up or Down",
    category: "Crypto",
    description: "Will BTC be up or down in the next 5 minute candle? Resolves YES for up.",
    image:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2024-02-10T05:30:00.000Z",
    yesProbability: 40,
    noProbability: 60,
    yesVolume: 1_640_000,
    noVolume: 2_460_000,
    frequency: "Event",
    createdAt: "2024-02-10T00:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[5]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[5]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[5]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "7",
    title: "Will ETH reach $5000 before June 2026?",
    category: "Crypto",

    description:
      "Ethereum price prediction market. Resolves YES if ETH/USD hits $5000 on any major exchange.",
    image:
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-06-01T00:00:00.000Z",
    yesProbability: 38,
    noProbability: 62,
    yesVolume: 8_360_000,
    noVolume: 13_640_000,
    frequency: "Event",
    isTrending: true,
    createdAt: "2026-03-11T07:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[6]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[6]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[6]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "8",
    title: "Will Fed cut rates in May 2026?",
    category: "Economics",
    description:
      "Resolves YES if the Federal Reserve announces a rate cut at the May 2026 FOMC meeting.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-05-15T00:00:00.000Z",
    yesProbability: 61,
    noProbability: 39,
    yesVolume: 33_550_000,
    noVolume: 21_450_000,
    frequency: "Monthly",
    isTrending: false,
    createdAt: "2026-03-10T12:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[7]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[7]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[7]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "9",
    title: "Will Apple release AR glasses in 2026?",
    category: "Tech",
    description: "Resolves YES if Apple officially launches a consumer AR glasses product in 2026.",
    image:
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-12-31T00:00:00.000Z",
    yesProbability: 24,
    noProbability: 76,
    yesVolume: 2_256_000,
    noVolume: 7_144_000,
    frequency: "Event",
    isTrending: false,
    createdAt: "2026-02-15T09:30:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[8]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[8]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[8]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "10",
    title: "Will Messi retire before end of 2026?",
    category: "Sports",
    description:
      "Resolves YES if Lionel Messi officially announces retirement from professional football.",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-12-31T00:00:00.000Z",
    yesProbability: 33,
    noProbability: 67,
    yesVolume: 2_574_000,
    noVolume: 5_226_000,
    frequency: "Event",
    isTrending: true,
    createdAt: "2026-01-05T15:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[9]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[9]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[9]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "11",
    title: "Will OpenAI release GPT-5 before July 2026?",
    category: "AI",
    description:
      "Resolves YES if OpenAI publicly releases a model officially named GPT-5 before July 1 2026.",
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-07-01T00:00:00.000Z",
    yesProbability: 55,
    noProbability: 45,
    yesVolume: 17_050_000,
    noVolume: 13_950_000,
    frequency: "Event",
    isTrending: true,
    createdAt: "2026-03-12T06:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[10]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[10]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[10]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "12",
    title: "Will Bitcoin hit $150k in 2026?",
    category: "Crypto",
    description:
      "Resolves YES if BTC/USD price reaches $150,000 on any major exchange before Dec 31 2026.",
    image:
      "https://images.unsplash.com/photo-1609554496796-c345a5335ceb?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-12-31T00:00:00.000Z",
    yesProbability: 44,
    noProbability: 56,
    yesVolume: 43_120_000,
    noVolume: 54_880_000,
    frequency: "Event",
    isTrending: true,
    createdAt: "2026-01-20T10:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[11]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[11]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[11]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "13",
    title: "Will India win the 2026 Cricket World Cup?",
    category: "Sports",
    description: "Resolves YES if the Indian cricket team wins the ICC Cricket World Cup 2026.",
    image:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-11-15T00:00:00.000Z",
    yesProbability: 29,
    noProbability: 71,
    yesVolume: 3_480_000,
    noVolume: 8_520_000,
    frequency: "Event",
    isTrending: false,
    createdAt: "2026-03-11T20:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[12]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[12]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[12]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "14",
    title: "Will the US enter a recession in 2026?",
    category: "Economics",
    description:
      "Resolves YES if the NBER officially declares a US recession beginning in calendar year 2026.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2027-01-31T00:00:00.000Z",
    yesProbability: 42,
    noProbability: 58,
    yesVolume: 31_920_000,
    noVolume: 44_080_000,
    frequency: "Event",
    isTrending: false,
    createdAt: "2026-02-28T08:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[13]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[13]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[13]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },

  // ── Breaking ──────────────────────────────────────────────────────────────────
  {
    id: "15",
    title: "Will NATO invoke Article 5 in 2026?",
    category: "Breaking",
    description:
      "Breaking: Will NATO formally invoke the collective defence clause in response to any incident in 2026?",
    image:
      "https://images.unsplash.com/photo-1569285645462-a3f9c6332d56?q=80&w=1170&auto=format&fit=crop",
    resolutionTime: "2026-12-31T00:00:00.000Z",
    yesProbability: 18,
    noProbability: 82,
    yesVolume: 9_400_000,
    noVolume: 42_600_000,
    frequency: "Event",
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[14]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[14]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[14]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "16",
    title: "Will there be a ceasefire in Gaza by June 2026?",
    category: "Breaking",
    description:
      "Breaking: Will a formal ceasefire agreement be reached and hold in Gaza before June 2026?",
    image:
      "https://images.unsplash.com/photo-1668076476189-7664ff0e7a91?q=80&w=1172&auto=format&fit=crop",
    resolutionTime: "2026-06-01T00:00:00.000Z",
    yesProbability: 34,
    noProbability: 66,
    yesVolume: 17_200_000,
    noVolume: 33_800_000,
    frequency: "Event",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[15]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[15]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[15]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "17",
    title: "Will the US dollar lose reserve currency status before 2030?",
    category: "Breaking",
    description:
      "Breaking: Will another currency or asset officially replace the USD as the world's primary reserve currency before 2030?",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2030-01-01T00:00:00.000Z",
    yesProbability: 9,
    noProbability: 91,
    yesVolume: 3_600_000,
    noVolume: 36_400_000,
    frequency: "Event",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[16]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[16]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[16]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },

  // ── Hollywood ─────────────────────────────────────────────────────────────────
  {
    id: "18",
    title: "Will there be a MCU Phase 6 announcement in 2026?",
    category: "Hollywood",
    description:
      "Will Marvel Studios officially announce the full Phase 6 lineup of films and Disney+ series in 2026?",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-12-31T00:00:00.000Z",
    yesProbability: 63,
    noProbability: 37,
    yesVolume: 4_200_000,
    noVolume: 2_800_000,
    frequency: "Event",
    createdAt: "2026-02-01T09:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[17]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[17]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[17]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "19",
    title: "Will a 2026 summer blockbuster gross over $1B globally?",
    category: "Hollywood",
    description:
      "Will any film released in the summer 2026 window (May–August) gross more than $1 billion at the global box office?",
    image:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2026-09-01T00:00:00.000Z",
    yesProbability: 71,
    noProbability: 29,
    yesVolume: 8_520_000,
    noVolume: 3_480_000,
    frequency: "Event",
    createdAt: "2026-01-15T12:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[18]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[18]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[18]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },

  // ── Awards ────────────────────────────────────────────────────────────────────
  {
    id: "20",
    title: "Will Dune Part Three win Best Picture at Oscars 2027?",
    category: "Awards",
    description:
      "Will Denis Villeneuve's Dune Part Three be nominated and win Best Picture at the 99th Academy Awards?",
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2027-03-31T00:00:00.000Z",
    yesProbability: 22,
    noProbability: 78,
    yesVolume: 1_980_000,
    noVolume: 7_020_000,
    frequency: "Event",
    createdAt: "2026-03-01T08:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[19]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[19]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[19]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "21",
    title: "Who wins the Grammy for Album of the Year 2027?",
    category: "Awards",
    description:
      "Which artist or group will take home the Album of the Year Grammy at the 69th Grammy Awards?",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2027-02-28T00:00:00.000Z",
    yesProbability: 45,
    noProbability: 55,
    yesVolume: 2_250_000,
    noVolume: 2_750_000,
    frequency: "Event",
    createdAt: "2026-02-20T10:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[20]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[20]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[20]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
  {
    id: "22",
    title: "Will the Golden Globes 2027 be streamed exclusively online?",
    category: "Awards",
    description:
      "Will the 84th Golden Globe Awards ceremony be broadcast exclusively on a streaming platform rather than traditional TV?",
    image:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=400&auto=format&fit=crop",
    resolutionTime: "2027-01-15T00:00:00.000Z",
    yesProbability: 31,
    noProbability: 69,
    yesVolume: 890_000,
    noVolume: 2_010_000,
    frequency: "Event",
    createdAt: "2026-03-05T14:00:00.000Z",
    resolver: RESOLVER,
    priceHistory: DUMMY_PRICE_HISTORY,
    orderBook: DUMMY_ORDER_BOOK,
    rules: DUMMY_RULES,
    conditionId: MARKET_CHAIN_DATA[21]!.conditionId,
    yesTokenId: MARKET_CHAIN_DATA[21]!.yesTokenId,
    noTokenId: MARKET_CHAIN_DATA[21]!.noTokenId,
    yesTokenOnChainId: null,
    noTokenOnChainId: null,
    collateralToken: COLLATERAL,
  },
]

const RAW_CATEGORIES: string[] = [
  // "Politics",
  // "Crypto",
  // "AI",
  // "Sports",
  // "Economics",
  // "Geopolitics",
  // "Tech",
  // "Trump",
  // "Olympics",
  // "Oscars",
  // "Fed",
  // "Gold",
  // "Silver",
  // "Space",
  // "Earnings",
  // "China",
]

type Category = {
  id: string
  name: string
  slug?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

const MOCK_CATEGORY_OBJECTS: Category[] = RAW_CATEGORIES.map((name, index) => ({
  id: String(index + 1),
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  description: `${name} related markets`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

// ─── Mock API Functions ───────────────────────────────────────────────────────

/** GET /api/markets */
export const fetchMarkets = async (): Promise<ApiMarketsResponse> => {
  await simulateDelay()
  return {
    success: true,
    data: RAW_MARKETS,
    meta: {
      total: RAW_MARKETS.length,
      page: 1,
      pageSize: 20,
    },
  }
}

/** GET /api/markets/:id */
export const fetchMarketById = async (id: string): Promise<ApiSingleMarketResponse> => {
  await simulateDelay()
  const market = RAW_MARKETS.find((m) => m.id === id)
  if (!market) throw new Error(`Market with id "${id}" not found`)
  return {
    success: true,
    data: market,
  }
}

/** GET /api/categories */
export const fetchCategories = async (): Promise<ApiCategoriesResponse> => {
  await simulateDelay()

  return {
    status: true,
    statusCode: 200,
    message: "Categories fetched successfully",
    type: "success",
    data: {
      data: MOCK_CATEGORY_OBJECTS,
      count: MOCK_CATEGORY_OBJECTS.length,
    },
  }
}

// ─── Static exports ───────────────────────────────────────────────────────────

export const MOCK_MARKETS: Market[] = RAW_MARKETS
export const CATEGORIES: Category[] = MOCK_CATEGORY_OBJECTS
