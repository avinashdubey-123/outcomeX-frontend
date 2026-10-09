import { CheckCircle, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router"
import { toast } from "sonner"

import { useAppSelector } from "@/app/hooks"
import { LoginModal } from "@/components/auth/LoginModal"
import { IcoBookmarkSm, IcoClockSm, IcoShareSm, IcoVolSm } from "@/components/custom/EventPageIcons"
import TradePanel from "@/components/event/tradePanel/TradePanel"
import { CommentSection } from "@/components/market/comment/CommentSection"
import { MarketResolvedCard } from "@/components/market/MarketResolvedCard"
import { PriceChart } from "@/components/market/priceChart/PriceChart"
import { ShareModal } from "@/components/market/ShareModal"
import { ActivityTab, MarketRulesTab, OrderBookTab } from "@/components/market/tabs"
import { TokenBalanceChecker } from "@/components/market/TokenBalanceChecker"
import { EventPageSkeleton } from "@/components/ui/MarketSkeleton"
import {
  useGetMarketByIdQuery,
  useGetMarketPriceQuery,
  useGetOracleTimelineQuery,
  useToggleBookmarkMutation,
} from "@/features/api/markets/marketApi"
import { selectIsAuthenticated } from "@/features/auth/authSlice"
import { useMagic } from "@/features/auth/lib/magic"
import { selectSelectedMarket } from "@/features/markets/marketSelectors"
import { isMarketResolved } from "@/features/markets/marketStatus"
import { usePrice } from "@/hooks/socket/usePrice"
import { usePriceChart } from "@/hooks/socket/usePriceChart"
import type { TradeOrder, TradePanelOrder } from "@/hooks/trade/TradeTypes"
import { useTrade } from "@/hooks/trade/useTrade"
import { formatMarketDate } from "@/libs/formatDate"

type TabKey = "rules" | "activity" | "orderbook" | "comments"

const TABS: { key: TabKey; label: string }[] = [
  { key: "rules", label: "Market Rules" },
  { key: "activity", label: "Activity" },
  { key: "orderbook", label: "Order Book" },
  { key: "comments", label: "Comments" },
]

// ─── EventPage ────────────────────────────────────────────────────────────────
const EventPage = () => {
  const { id } = useParams()
  const { magic } = useMagic()

  const [activeTab, setActiveTab] = useState<TabKey>("rules")
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [isMobileTradeOpen, setIsMobileTradeOpen] = useState(false)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const { executeTrade, tradeError, approvalState } = useTrade()

  const { data: apiMarket, isLoading, isError } = useGetMarketByIdQuery(id ?? "")
  const { data: apiMarketPrice } = useGetMarketPriceQuery(apiMarket?.optionGroupId ?? "", {
    skip: !apiMarket?.optionGroupId,
  })
  const [toggleBookmark] = useToggleBookmarkMutation()

  // ── Oracle timeline — used to determine dispute eligibility ────────────────
  const { data: oracleTimeline } = useGetOracleTimelineQuery(id ?? "", { skip: !id })
  // The latest entry's action tells us the current oracle state
  const latestOracleAction: number | null = oracleTimeline?.data?.length
    ? (oracleTimeline.data[oracleTimeline.data.length - 1]?.action ?? null)
    : null

  // useprice socket

  const { price } = usePrice(apiMarket?.optionGroupId as string)

  // used for yesProbability and no Probability
  let finalPrice = apiMarketPrice
  //if the socket price is there , replace the current price with socket price.
  if (price) {
    finalPrice = Number(price.price) / 10000
  }
  // ── Fallback: Redux selectedMarket set when card was clicked ───────────────
  const reduxMarket = useSelector(selectSelectedMarket)
  const market = apiMarket ?? (isError ? reduxMarket : null)

  // ── Chart state ────────────────────────────────────────────────────────────
  const { tab, history, changeTab, lastPrice, pctChange, isPositive, isFetching } = usePriceChart({
    optionGroupId: market?.optionGroupId ?? "",
  })

  // ── Resolution check ───────────────────────────────────────────────────────
  // Use the backend status field — RESOLVED (11) or PAIDOUT (12) mean the
  // market outcome is final. Fall back to time-based check if status is absent
  // (e.g. mock data or very old API responses).
  const isResolved =
    market?.status != null
      ? isMarketResolved(market.status)
      : market?.resolutionTime
        ? new Date(market.resolutionTime).getTime() <= new Date().getTime()
        : false

  // ── Trade handler ──────────────────────────────────────────────────────────
  const handleTrade = (params: TradePanelOrder) => {
    if (
      !market?.id ||
      !market?.yesTokenId ||
      !market?.noTokenId ||
      !market?.collateralToken ||
      !market?.conditionId
    ) {
      console.error("Market blockchain data missing — cannot trade")
      return
    }
    executeTrade({
      ...params,
      marketId: market.id,
      yesTokenId: market.yesTokenId,
      noTokenId: market.noTokenId,
      collateralToken: market.collateralToken,
      conditionId: market.conditionId,
      yesTokenOnChainId: market.yesTokenOnChainId ?? null,
      noTokenOnChainId: market.noTokenOnChainId ?? null,
    } satisfies TradeOrder)
  }

  const saveAsBookmark = () => {
    try {
      const a = toggleBookmark({ marketId: market?.id ?? "" }).unwrap
      toast.success("Saved")
      console.log("market toggled with favourite:", a)
    } catch {
      toast.error("not able to save the market!! ")
    }
    toast.success("Saved the market to favourite ")
  }
  let displayWinningOutcome = null
  useEffect(() => {
    if (tradeError) {
      toast.error(tradeError, {
        duration: 4000,
        position: "top-right",
        style: { fontSize: "12px", padding: "8px 12px", maxWidth: "320px" },
      })
    }
  }, [tradeError])

  // ── Loading / not found ────────────────────────────────────────────────────
  if (isLoading) return <EventPageSkeleton />
  if (!market)
    return (
      <div className="flex items-center justify-center h-[60vh] text-tab-text font-sm tracking-[0.06em]">
        Market not found.
      </div>
    )

  const totalVolume = (market.yesVolume ?? 0) + (market.noVolume ?? 0)

  if (apiMarket) {
    if (apiMarket.winningOutcome != null) {
      const outStr = String(apiMarket.winningOutcome).toUpperCase()
      if (outStr === "1" || outStr === "YES") displayWinningOutcome = "YES"
      else if (outStr === "0" || outStr === "NO") displayWinningOutcome = "NO"
    }
  }

  // ── Proposed-but-not-yet-settled outcome — surfaced from the oracle timeline
  // so the UI shows "Proposed: YES" instead of a bare "To be decided" while
  // the on-chain dispute window is still open.
  const timelineResponses =
    oracleTimeline?.data?.filter((item: { response: number | null }) => item.response != null) || []
  const latestTimelineResponse: number | null = timelineResponses.length
    ? (timelineResponses[timelineResponses.length - 1]?.response ?? null)
    : null
  const proposedOutcome =
    displayWinningOutcome == null && latestTimelineResponse != null
      ? latestTimelineResponse === 1
        ? "YES"
        : "NO"
      : null

  return (
    <>
      <div className=" bg-background text-white selection:bg-primary/30 mt-4 md:mt-6 mb-12 md:mb-18.5 overflow-x-hidden">
        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          title={market.title}
          probability={market.yesProbability ?? 50}
          outcome="Yes"
        />
        <div className="container">
          {/* ── Breadcrumb ── */}
          <div className="flex items-start space-x-2 font-sm mb-4 mt-2">
            <span className="text-gray-400 capitalize">{market.category}</span>
            <span className=" text-gray-500">›</span>
            <span className="text-white capitalize font-medium">
              {market.title.length > 50 ? market.title : market.title}
            </span>
          </div>

          {/* ── Title + icon buttons ── */}
          <div className="flex justify-between gap-5 items-end  pt-1 mb-7.5 max-lg:flex-col max-lg:items-start max-lg:py-2.5 max-lg:gap-4">
            <div className="flex flex-col items-start gap-3.5">
              <h1 className="font-2xl font-black leading-tight capitalize text-white m-0">
                {market.title}
              </h1>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-white whitespace-nowrap [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:text-white [&_svg]:[stroke:2.5px]">
                  <IcoClockSm />
                  Ends {formatMarketDate(market.resolutionTime)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white whitespace-nowrap [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:text-white [&_svg]:[stroke:2.5px]">
                  <IcoVolSm />${totalVolume.toLocaleString()} Vol
                </div>
                {isResolved && (
                  <div className="flex items-center gap-1 font-base font-medium text-primary ">
                    <CheckCircle size={14} className="mr-1 text-primary" /> Resolved
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-0.5 shrink-0">
              <button
                className="w-9 h-9 rounded-[6px] border border-white/10 text-tab-text flex items-center justify-center cursor-pointer transition-all duration-150 hover:text-white hover:bg-[#21262f] [&_svg]:w-5 [&_svg]:h-5"
                onClick={() => setShareOpen(true)}
              >
                <IcoShareSm />
              </button>
              {isAuthenticated && (
                <button
                  className="w-9 h-9 rounded-[6px] border border-white/10 text-tab-text flex items-center justify-center cursor-pointer transition-all duration-150 hover:text-white hover:bg-[#21262f] [&_svg]:w-5 [&_svg]:h-5"
                  onClick={saveAsBookmark}
                >
                  <IcoBookmarkSm />
                </button>
              )}
            </div>
          </div>

          {/* ── Meta chips — only once ── */}
          <button
            className="flex items-center justify-center px-4 py-2 border-none rounded-sm font-bold text-sm  mb-4 w-fit cursor-pointer lg:hidden bg-primary text-black shadow-[0_4px_12px_rgba(34,197,94,0.2)] "
            onClick={() => setIsMobileTradeOpen(true)}
          >
            {isResolved ? (
              <>
                <CheckCircle size={16} className="mr-2" />
                Market Resolved
              </>
            ) : (
              <>
                <TrendingUp size={16} className="mr-2" />
                Trade
              </>
            )}
          </button>

          {/* ── Two-column layout ── */}
          <div
            className="grid ep-layout-inner items-start gap-5 max-[1479px]:gap-4"
            style={{
              gridTemplateColumns: "1fr 430px",
            }}
          >
            {/* ══ LEFT ══ */}
            <div className="min-w-0">
              {/* Chart */}
              <PriceChart
                history={history}
                tab={tab}
                onTabChange={changeTab}
                currentPrice={lastPrice}
                pctChange={pctChange}
                isPositive={isPositive}
                isFetching={isFetching}
                optionGroupId={market?.optionGroupId ?? ""}
              />

              {/* Tab bar */}
              <div className="flex gap-6  border-b border-secondary/10 mb-2 max-lg:gap-4  max-lg:overflow-x-auto max-lg:[scrollbar-width:none] max-lg:[-ms-overflow-style:none] max-lg:[&::-webkit-scrollbar]:hidden">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    className={`py-3 px-0.5 text-sm font-medium bg-transparent  border-none cursor-pointer transition-all duration-200 relative hover:text-tabs max-lg:whitespace-nowrap max-lg:py-2.5 max-lg:px-1 ${activeTab === t.key ? " text-primary after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-primary after:shadow-[0_0_10px_rgba(16,210,96,0.4)] after:content-['']" : "text-tabs"}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="pt-4">
                {activeTab === "rules" && (
                  <MarketRulesTab
                    description={market.description}
                    volume={totalVolume}
                    resolutionTime={market.resolutionTime}
                    createdAt={market.createdAt}
                  />
                )}
                {activeTab === "activity" && <ActivityTab marketId={market.id} />}
                {activeTab === "orderbook" && (
                  <OrderBookTab
                    marketId={market.id}
                    optionGroupId={market.optionGroupId ?? ""}
                    yesTokenId={market.yesTokenId as string}
                    noTokenId={market.noTokenId as string}
                  />
                )}
                {activeTab === "comments" && <CommentSection marketId={market.id} />}
              </div>
            </div>
            {/* ══ END LEFT ══ */}

            {import.meta.env.DEV ? (
              <TokenBalanceChecker
                yesTokenOnChainId={market.yesTokenOnChainId ?? null}
                noTokenOnChainId={market.noTokenOnChainId ?? null}
              />
            ) : (
              <></>
            )}

            {/* ══ RIGHT ══ */}
            <div className="max-lg:hidden">
              <div className="position-static ">
                {isResolved ? (
                  <MarketResolvedCard
                    winningOutcome={
                      displayWinningOutcome == null
                        ? "To be decided"
                        : (displayWinningOutcome as "YES" | "NO" | "To be decided")
                    }
                    // winningOutcome={market.winningOutcome as "YES" | "NO"}
                    resolutionTime={market.resolutionTime}
                    marketId={market.id}
                    latestOracleAction={latestOracleAction}
                    proposedOutcome={proposedOutcome}
                  />
                ) : (
                  <>
                    <TradePanel
                      yesProbability={finalPrice ?? 50}
                      noProbability={finalPrice ? 100 - finalPrice : 50}
                      isCrypto={false}
                      onLoginRequired={() => setIsLoginOpen(true)}
                      onDepositRequired={() => magic?.wallet?.showUI()}
                      onTrade={handleTrade}
                      approvalState={approvalState}
                    />
                  </>
                )}
              </div>
            </div>
            {/* ══ END RIGHT ══ */}
          </div>
        </div>
      </div>

      {/* ── Mobile Trade Drawer ── */}
      {isMobileTradeOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-200"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setIsMobileTradeOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#11141b] border-t border-white/10 rounded-[20px] z-201 max-h-[90vh] w-auto overflow-y-auto no-scrollbar max-w-[436px] min-w-[313px]">
            <div className="flex justify-between items-center px-6 pt-5 pb-2.5 ">
              <span className="font-lg font-bold">Place Bet</span>
              <button
                className="border-none text-[#888] w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer"
                onClick={() => setIsMobileTradeOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="px-2.5 pb-5">
              {isResolved ? (
                <div className="">
                  <MarketResolvedCard
                    winningOutcome={
                      displayWinningOutcome == null
                        ? "To be decided"
                        : (displayWinningOutcome as "YES" | "NO" | "To be decided")
                    }
                    resolutionTime={market.resolutionTime}
                    marketId={market.id}
                    latestOracleAction={latestOracleAction}
                    proposedOutcome={proposedOutcome}
                  />
                </div>
              ) : (
                <TradePanel
                  yesProbability={finalPrice ?? 50}
                  noProbability={finalPrice ? 1 - finalPrice : 50}
                  isCrypto={false}
                  onLoginRequired={() => setIsLoginOpen(true)}
                  onDepositRequired={() => magic?.wallet?.showUI()}
                  onTrade={(order) => {
                    handleTrade(order)
                    setIsMobileTradeOpen(false)
                  }}
                />
              )}
            </div>
          </div>

          <style>{`
            @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { transform: translate(-50%, 100%) } to { transform: translate(-50%, -50%) } }
          `}</style>
        </>
      )}
    </>
  )
}

export default EventPage
