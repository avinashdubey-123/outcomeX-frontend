// src/mocks/mockActivity.ts

export interface ActivityItem {
  id: string
  user: string
  action: "Buy" | "Sell"
  outcome: "Yes" | "No"
  shares: number
  price: number // cents
  usdcAmount: number
  timestamp: string // ISO
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "act-001",
    user: "0xc634...6C62",
    action: "Buy",
    outcome: "Yes",
    shares: 100,
    price: 65,
    usdcAmount: 65,
    timestamp: "2024-10-10T10:30:00.000Z",
  },
  {
    id: "act-002",
    user: "0xab12...3F90",
    action: "Buy",
    outcome: "No",
    shares: 200,
    price: 35,
    usdcAmount: 70,
    timestamp: "2024-10-10T09:15:00.000Z",
  },
  {
    id: "act-003",
    user: "0xde45...7A21",
    action: "Sell",
    outcome: "Yes",
    shares: 50,
    price: 68,
    usdcAmount: 34,
    timestamp: "2024-10-10T08:00:00.000Z",
  },
  {
    id: "act-004",
    user: "0xff89...1B44",
    action: "Buy",
    outcome: "Yes",
    shares: 300,
    price: 64,
    usdcAmount: 192,
    timestamp: "2024-10-09T22:45:00.000Z",
  },
  {
    id: "act-005",
    user: "0x1234...5678",
    action: "Sell",
    outcome: "No",
    shares: 80,
    price: 33,
    usdcAmount: 26.4,
    timestamp: "2024-10-09T18:20:00.000Z",
  },
  {
    id: "act-006",
    user: "0x9abc...DEF0",
    action: "Buy",
    outcome: "Yes",
    shares: 150,
    price: 66,
    usdcAmount: 99,
    timestamp: "2024-10-09T14:10:00.000Z",
  },
  {
    id: "act-007",
    user: "0x5566...AABB",
    action: "Buy",
    outcome: "No",
    shares: 500,
    price: 34,
    usdcAmount: 170,
    timestamp: "2024-10-09T11:00:00.000Z",
  },
]
