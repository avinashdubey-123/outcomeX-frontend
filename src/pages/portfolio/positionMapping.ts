// src/pages/portfolio/positionMapping.ts
//
// Turns the backend's portfolio rows into display values. Kept separate from the table
// component so the money math can be unit-tested.
//
// Backend units (see polymarket-clone-backend orderController, getPortfolio):
//   sharesOwned    1e6 per share            (buy filled − sell filled)
//   avgPrice       1e6 per $1, per share    (all buys: filled cost ÷ filled shares)
//   totalInvested  1e10 per $1              (cost of EVERY share ever bought, sold ones included)
//   currentValue   1e10 per $1              (sharesOwned × last traded price, even if resolved)

import type { ApiPortfolioPosition } from "@/features/api/portfolio/portfolioApi"
import { ADDRESSES } from "@/libs/contracts"
import type { Position } from "@/mocks/mockPortfolio"

import { POSITION_SIDE } from "./portfolioConstants"

const SHARE_SCALE = 1_000_000
const PRICE_SCALE = 1_000_000
const MONEY_SCALE = 10_000_000_000

// Prices are stored in dollars per share (0.5 = 50¢).
export const formatCents = (dollars: number): string => `${(dollars * 100).toFixed(1)}¢`

const parseWinner = (outcome: unknown): "YES" | "NO" | null => {
  if (outcome == null) return null
  const str = String(outcome).toUpperCase()
  if (str === "1" || str === "YES") return "YES"
  if (str === "0" || str === "NO") return "NO"
  return null
}

export const mapApiPosition = (p: ApiPortfolioPosition): Position => {
  const side = (p.token?.name ?? "").toLowerCase() === "yes" ? POSITION_SIDE.YES : POSITION_SIDE.NO
  const shares = Number(p.sharesOwned ?? 0) / SHARE_SCALE
  const avgPrice = Number(p.avgPrice ?? 0) / PRICE_SCALE
  const grossInvested = Number(p.totalInvested ?? 0) / MONEY_SCALE
  const lastTradedValue = Number(p.currentValue ?? 0) / MONEY_SCALE
  const marketId = p.market?.id ?? `unknown-market-${Math.random()}`
  const tokenId = p.token?.id ?? `unknown-token-${Math.random()}`
  const isRedeemedTrue = Number(p.redeemAmount) > 0

  const winningOutcome = parseWinner(p.winningOutcome ?? p.market?.winningOutcome)
  const isResolved = p.resolved ?? false

  // Cost of the shares still held (average cost × shares). The gross figure would charge you
  // for shares you already sold while only counting the remaining ones as value.
  const invested = avgPrice > 0 ? shares * avgPrice : grossInvested

  // A resolved market settles at $1 per winning share and $0 per losing share, whatever the
  // last traded price was. Unresolved: the backend's mark-to-market value.
  const value =
    isResolved && winningOutcome !== null ? (winningOutcome === side ? shares : 0) : lastTradedValue

  return {
    id: `${marketId}-${tokenId}`,
    marketId: p.market?.id ?? "",
    marketTitle: p.market?.title ?? "Unknown Market",
    category: "",
    side,
    shares,
    avgPrice,
    // current price per share (dollars), derived from the value above
    nowPrice: shares > 0 ? value / shares : 0,
    invested,
    value,
    conditionId:
      p.market.conditionId ?? "0x0000000000000000000000000000000000000000000000000000000000000000",
    TokenId:
      p.token.tokenId ?? "0x0000000000000000000000000000000000000000000000000000000000000000",

    collateralToken: ADDRESSES.USDC,
    isResolved,
    winningOutcome,
    isRedeemed: isRedeemedTrue,
  }
}
