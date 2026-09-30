// src/mocks/mockOrderBook.ts

export interface OrderBookRow {
  price: number // cents
  shares: number
}

export interface OrderBook {
  yes: { bids: OrderBookRow[]; asks: OrderBookRow[] }
  no: { bids: OrderBookRow[]; asks: OrderBookRow[] }
}

export const MOCK_ORDER_BOOK: OrderBook = {
  yes: {
    bids: [
      { price: 64, shares: 500 },
      { price: 63, shares: 1200 },
      { price: 62, shares: 800 },
      { price: 61, shares: 300 },
      { price: 60, shares: 2000 },
    ],
    asks: [
      { price: 65, shares: 400 },
      { price: 66, shares: 900 },
      { price: 67, shares: 600 },
      { price: 68, shares: 1500 },
      { price: 69, shares: 200 },
    ],
  },
  no: {
    bids: [
      { price: 35, shares: 600 },
      { price: 34, shares: 800 },
      { price: 33, shares: 400 },
      { price: 32, shares: 1000 },
      { price: 31, shares: 300 },
    ],
    asks: [
      { price: 36, shares: 500 },
      { price: 37, shares: 700 },
      { price: 38, shares: 900 },
      { price: 39, shares: 200 },
      { price: 40, shares: 1100 },
    ],
  },
}
