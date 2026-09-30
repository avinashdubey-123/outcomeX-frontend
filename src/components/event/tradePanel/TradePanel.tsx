import { TrendingUp } from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router"

import { useAppSelector } from "@/app/hooks"
import { selectAvailableAmount, selectIsAuthenticated } from "@/features/auth/authSlice"
import { useDebouncedCallback } from "@/hooks/custom/useDebounce"
import type { TradePanelOrder } from "@/hooks/trade/TradeTypes"
import { useDropdown } from "@/hooks/ui/useDropdown"
import { formatCash } from "@/libs/formatCurrency"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TradePanelProps {
  yesProbability: number // 0–100 (cents)
  noProbability: number
  isCrypto?: boolean // "Up/Down" labels instead of "Yes/No"
  onTrade?: (o: TradePanelOrder) => void
  onLoginRequired?: () => void
  onDepositRequired?: () => void
  approvalState?: "idle" | "approving-usdc" | "approving-ctf" | "signing" | "submitting"
}

type Action = "Buy" | "Sell"
type OrderType = "Market" | "Limit"

// ─── Chevron icon ─────────────────────────────────────────────────────────────

const ChevronDown = () => (
  <img src="/icons/chevron-down.svg" alt="" style={{ width: 13, height: 13 }} />
)

// ─── Component ────────────────────────────────────────────────────────────────

const TradePanel = ({
  yesProbability,
  noProbability,
  isCrypto = false,
  onTrade,
  onLoginRequired,
  onDepositRequired,
  approvalState = "idle",
}: TradePanelProps) => {
  const labelA = isCrypto ? "Up" : "Yes"
  const labelB = isCrypto ? "Down" : "No"
  const priceA = yesProbability
  const priceB = noProbability

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const availableAmount = useAppSelector(selectAvailableAmount)
  const balance = availableAmount ?? "0"
  const buttonState = !isAuthenticated ? "login" : BigInt(balance) <= 0n ? "deposit" : "trade"
  const cashAmount = useSelector(selectAvailableAmount)

  // ── Core state ──────────────────────────────────────────────────────────────
  const [action, setAction] = useState<Action>("Buy")
  const [orderType, setOrderType] = useState<OrderType>("Limit")
  const [outcome, setOutcome] = useState(labelA)
  const {
    isOpen: dropOpen,
    toggle: toggleDrop,
    close: closeDrop,
    ref: dropRef,
  } = useDropdown("trade-panel-order-type")
  const [activePct, setActivePct] = useState<string | null>(null)
  const navigate = useNavigate()

  // ── Market Buy ──────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState(0)

  // ── Market Sell ─────────────────────────────────────────────────────────────
  const [sellShares, setSellShares] = useState(0)
  const [sellPct, setSellPct] = useState<string | null>(null)

  // ── Limit state ──
  const [limitCents, setLimitCents] = useState(priceA)
  // Separate string state so the user can type decimals freely (e.g. "50.")
  // without the number being clamped mid-keystroke.
  const [limitInput, setLimitInput] = useState(String(priceA))

  const updateLimit = (val: number) => {
    const clamped = Math.min(99.9, Math.max(0.01, val))
    const rounded = Math.round(clamped * 100) / 100
    setLimitCents(rounded)
    setLimitInput(String(rounded))
  }
  const [shares, setShares] = useState(0)
  const [expiry, setExpiry] = useState(false)
  const [expiryDuration, setExpiryDuration] = useState("7 Days")
  const {
    isOpen: expiryDropOpen,
    toggle: toggleExpiryDrop,
    close: closeExpiryDrop,
    ref: expiryRef,
  } = useDropdown("trade-panel-expiry")

  const handleAction = (a: Action) => {
    setAction(a)
    setAmount(0)
    setSellShares(0)
    setSellPct(null)
    setShares(0)
    setExpiry(false)
    closeExpiryDrop()
    setActivePct(null)
    updateLimit(outcome === labelA ? priceA : priceB)
  }
  const handleOrderType = (t: OrderType) => {
    setOrderType(t)
    closeDrop()
    setAmount(0)
    setSellShares(0)
    setSellPct(null)
    setShares(0)
    setExpiry(false)
    closeExpiryDrop()
    setActivePct(null)
  }
  const handleOutcome = (o: string) => {
    setOutcome(o)
    updateLimit(o === labelA ? priceA : priceB)
    setAmount(0)
    setSellShares(0)
    setShares(0)
    setActivePct(null)
  }

  // close dropdown on outside click
  // (Handled by useDropdown hook now)

  // ── Market Buy: percentage presets ──
  const handlePctPreset = (pct: string) => {
    setActivePct(pct)
    const map: Record<string, number> = {
      MIN: 0.01,
      "10%": 0.1,
      "20%": 0.2,
      "30%": 0.3,
      "40%": 0.4,
      "50%": 0.5,
      MAX: 1.0,
    }
    // Convert micro-USDC string to dollar number for the UI input
    const balanceDollars = Number(BigInt(balance)) / 1_000_000
    setAmount(Math.floor(balanceDollars * (map[pct] ?? 0)))
  }

  // ── Market Sell: pct of holdings ──
  const handleSellPct = (pct: string) => {
    setSellPct(pct)
    const mockHoldings = 200 // TODO: replace with Redux holdings
    const map: Record<string, number> = {
      MIN: 0.01,
      "25%": 0.25,
      "50%": 0.5,
      MAX: 1,
      Max: 1,
    }
    setSellShares(parseFloat((mockHoldings * (map[pct] ?? 0)).toFixed(2)))
  }

  // ── Limit: shares adjust ──
  const handleSharesAdjust = (delta: number) => {
    setShares((p) => Math.max(0, p + delta))
  }

  // ── Limit: pct shortcuts (Sell) ──
  const handleLimitSellPct = (pct: string) => {
    const mockHoldings = 200
    const map: Record<string, number> = { "25%": 0.25, "50%": 0.5, Max: 1 }
    setShares(parseFloat((mockHoldings * (map[pct] ?? 0)).toFixed(2)))
  }

  // ── Computed values ──
  const total = shares > 0 ? ((shares * limitCents) / 100).toFixed(2) : "0"
  const toWin = shares > 0 ? shares.toFixed(2) : "0"
  const youReceive = shares > 0 ? ((shares * limitCents) / 100).toFixed(2) : "0"

  const tradeDisabled =
    (action === "Buy" && orderType === "Market" && amount <= 0) ||
    (action === "Sell" && orderType === "Market" && sellShares <= 0) ||
    (orderType === "Limit" && shares <= 0)

  const handleTrade = () => {
    if (tradeDisabled) return

    onTrade?.({
      action,
      orderType,
      outcome: outcome as TradePanelOrder["outcome"],
      amount: action === "Buy" && orderType === "Market" ? amount : undefined,
      shares: action === "Sell" && orderType === "Market" ? sellShares : shares,
      limitCents: orderType === "Limit" ? limitCents : undefined,
      expirationEnabled: expiry,
    })
    handleAction(action)
  }
  //debounced handle trade for one click only...
  const debouncedHandleTrade = useDebouncedCallback(handleTrade, 500)

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="border shrink-0 border-white/10  bg-linear-to-b from-white/5 to-white/2  font-inter rounded-2xl max-w-[436px] min-w-[313px] overflow-hidden ">
      {/* ── Top: Place Bet + Buy/Sell + Order Type ── */}
      <div className="flex items-end justify-between p-6 pt-4.5 pb-5 gap-2">
        <div className="flex flex-col gap-2.5">
          <h2 className="max-lg:hidden text-white font-black text-sm">Place Bet</h2>

          <div className="flex gap-1.5">
            {(["Buy", "Sell"] as Action[]).map((a) => {
              const isActive = action === a
              const isSell = a === "Sell"

              return (
                <button
                  key={a}
                  onClick={() => handleAction(a)}
                  className={`
            px-4 py-1.5 font-xs font-black
             border border-white/10 rounded-2sm
            text-white cursor-pointer transition-all duration-150

            ${isActive && !isSell ? "bg-primary text-black! " : ""}

            ${isActive && isSell ? "bg-no  " : ""}
          `}
                >
                  {a.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative" ref={dropRef}>
          <div
            className=" flex items-center gap-1 font-sm font-bold  text-white  py-1 px-2 rounded-md cursor-pointer transition-all duration-150 whitespace-nowrap hover-text-white [&svg]:size-3"
            onClick={toggleDrop}
          >
            {orderType} <ChevronDown />
          </div>
          {dropOpen && (
            <div
              className=" absolute right-0 bg-slate  border border-white/10 rounded-2md  overflow-hidden z-50 min-w-[130px] shadow-[0_8px_32px_rgba(0, 0, 0, 0.5)]"
              style={{ top: "calc(100% + 6px)" }}
            >
              {/* commenting market for now as it is not made currently , but if market is ready please add it below .... */}

              {(["Market", "Limit"] as OrderType[]).map((t) => (
                <button
                  key={t}
                  className={`block w-full py-2.5 px-3.5 font-sm font-semibold text-muted-foreground text-left transition-all duration-150 hover:bg-white/5 hover:text-white active:bg-white/5 active:text-white ${orderType === t ? " bg-white/5 text-white" : ""}`}
                  onClick={() => handleOrderType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-white/10 mx-6" />

      <div className="p-6 pt-4">
        {/* ── Balance row ── */}
        {/* {isAuthenticated && (
          <div className="tp-balance-row">
            Balance: <strong>{formatCash(balance)}</strong>
          </div>
        )} */}
        {isAuthenticated && (
          <div className=" flex items-center  justify-between mb-5 ">
            <span className="font-base font-bold uppercase text-white">Amount</span>
            <span className=" font-sm text-white">
              Balance:{formatCash(cashAmount)}
              {/* ${mockBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} */}
            </span>
          </div>
        )}
        {/* ── YES / NO outcome buttons ── */}

        <div className="flex justify-between gap-2 items-center mb-3">
          <button
            className={`flex-1 h-12.5 border rounded-sm font-bold transition-all active:scale-95 ${
              outcome === labelA
                ? "bg-primary text-background border-primary"
                : "bg-option-yes border-yes/20 text-primary hover:bg-primary hover:text-background"
            }`}
            onClick={() => handleOutcome(labelA)}
          >
            {labelA} {priceA}¢
          </button>
          <button
            className={`flex-1 h-12.5 border rounded-sm font-bold transition-all active:scale-95 ${
              outcome === labelB
                ? "bg-no text-background border-no"
                : "bg-option-no border-no/20 text-no hover:bg-no hover:text-background"
            }`}
            onClick={() => handleOutcome(labelB)}
          >
            {labelB} {priceB}¢
          </button>
        </div>

        {/* ══════════════════════════════════════
            MODE 1 — MARKET + BUY
            Amount input + pct shortcuts
        ══════════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════
            MARKET + BUY
        ════════════════════════════════════════════════════ */}
        {orderType === "Market" && action === "Buy" && (
          <>
            {/* Amount header */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-base font-bold uppercase text-white">Amount</span>
              <span className=" font-base text-white text-nowrap">
                Balance: {formatCash(balance)}
              </span>
            </div>

            {/* YES / NO */}
            {/* <div className="flex justify-between gap-2 items-center mb-3">
              <button
                className={`flex-1 bg-option-yes h-12.5 border rounded-sm border-yes/20 text-primary font-bold hover:bg-primary hover:text-background transition-all active:scale-95${outcome === labelA ? " active" : ""}`}
                onClick={() => handleOutcome(labelA)}
              >
                {labelA}
              </button>
              <button
                className={`flex-1 bg-option-no h-12.5 border rounded-sm border-no/20 text-no font-bold hover:bg-no hover:text-background transition-all active:scale-95${outcome === labelB ? " active" : ""}`}
                onClick={() => handleOutcome(labelB)}
              >
                {labelB}
              </button>
            </div> */}

            {/* Amount input box */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-md py-3 px-4 mb-3 ">
              <input
                type="text"
                inputMode="decimal"
                className="text-xl focus:outline-none font-semibold text-white w-full placeholder:text-white "
                value={amount || ""}
                placeholder="0.00"
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "")
                  setAmount(val === "" ? 0 : parseFloat(val))
                  setActivePct(null)
                }}
              />
              <span className="font-sm font-medium text-muted-foreground shrink-0 ml-3">USD</span>
            </div>

            {/* Percentage presets */}
            <div className="flex gap-1 mb-5 overflow-hidden">
              {["MIN", "10%", "20%", "30%", "40%", "50%", "MAX"].map((p) => (
                <button
                  key={p}
                  className={`flex-1 p-1.5 font-xxs xl:font-xs bg-slate font-semibold text-white border rounded-md cursor-pointer transition-all duration-200  hover:bg-white/5 hover-text-white active:text-white active:bg-green-500/15
                     ;${activePct === p ? " active" : ""}`}
                  onClick={() => handlePctPreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════
            MARKET + SELL
        ════════════════════════════════════════════════════ */}
        {orderType === "Market" && action === "Sell" && (
          <>
            {/* <div className=" flex justify-between gap-2 items-center mb-3">
              <button
                className={`w-full flex-1 bg-option-yes h-12.5 border rounded-sm border-yes/20 text-primary font-bold hover:bg-primary hover:text-background transition-all active:scale-95${outcome === labelA ? " active" : ""}`}
                onClick={() => handleOutcome(labelA)}
              >
                {labelA}
              </button>
              <button
                className={`w-full flex-1 bg-option-no h-12.5 border rounded-sm border-no/20 text-no font-bold hover:bg-no hover:text-background transition-all active:scale-95${outcome === labelB ? " active" : ""}`}
                onClick={() => handleOutcome(labelB)}
              >
                {labelB}
              </button>
            </div> */}
            <div className="flex items-center justify-between mb-2.5 gap-4">
              <span className=" font-sm font-semibold text-white  ">Shares</span>
              <input
                type="text"
                inputMode="numeric"
                className=" bg-white/5 w-45/100  border border-white/10 rounded-md py-2 px-3 font-semibold text-white outline-none transition-all duration-300 placeholder:text-white"
                value={sellShares || ""}
                placeholder="0"
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "")
                  setSellShares(val === "" ? 0 : parseInt(val, 10))
                }}
              />
            </div>
            <div className="flex gap-1 mb-5 overflow-hidden">
              {["MIN", "25%", "50%", "MAX"].map((p) => (
                <button
                  key={p}
                  className={`flex-1 py-1.5 font-xs bg-slate font-semibold text-white border rounded-md cursor-pointer transition-all duration-200  hover:bg-white/5 hover-text-white active:text-white active:bg-green-500/15
                    ${sellPct === p ? " active" : ""}`}
                  onClick={() => handleSellPct(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════
            LIMIT + BUY
        ════════════════════════════════════════════════════ */}
        {orderType === "Limit" && action === "Buy" && (
          <>
            {/* <div className="flex justify-between gap-2 items-center mb-3">
              <button
                className={`w-full flex-1 bg-option-yes h-12.5 border rounded-sm border-yes/20 text-primary font-bold hover:bg-primary hover:text-background transition-all active:scale-95${outcome === labelA ? " active" : ""}`}
                onClick={() => handleOutcome(labelA)}
              >
                {labelA}
              </button>
              <button
                className={`w-full flex-1 bg-option-no h-12.5 border rounded-sm border-no/20 text-no font-bold hover:bg-no hover:text-background transition-all active:scale-95${outcome === labelB ? " active" : ""}`}
                onClick={() => handleOutcome(labelB)}
              >
                {labelB}
              </button>
            </div> */}

            <div className="flex items-center justify-between mb-2.5 gap-4">
              <span className="  font-semibold text-white">Limit Price</span>
              <div className="flex items-center gap-2.5 py-3 px-2 rounded-md w-[160px] justify-between bg-white/5 border border-white/10">
                <button
                  className="size-7.5 shrink-0 rounded-2sm text-black font-black flex items-center justify-center cursor-pointer transition-all duration-120 font-mono bg-primary border border-white/10 hover:bg-primary/90"
                  onClick={() => updateLimit(limitCents - 1)}
                >
                  −
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={limitInput}
                      style={{ width: `${limitInput.length || 1}ch` }}
                      className="font-mono font-default font-bold text-white bg-transparent focus:outline-none text-right"
                      onChange={(e) => {
                        const raw = e.target.value
                        if (!/^\d{0,2}(\.\d{0,2})?$/.test(raw)) return
                        setLimitInput(raw)
                        const num = parseFloat(raw)
                        if (!isNaN(num)) setLimitCents(num)
                      }}
                      onBlur={() => updateLimit(limitCents)}
                    />
                    <span className="font-mono font-md font-bold text-white">¢</span>
                  </div>
                </div>
                <button
                  className="size-7.5 shrink-0 rounded-2sm text-black flex items-center justify-center cursor-pointer transition-all duration-120 font-mono sm bg-primary border border-white/10 hover:bg-primary/90"
                  onClick={() => updateLimit(limitCents + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2.5 gap-4">
              <span className="  font-semibold text-white">Shares</span>
              <div className="flex w-[160px] items-center bg-white/5 border border-white/10 rounded-md py-3 px-2 ">
                <input
                  type="text"
                  inputMode="numeric"
                  className="font-md leading-7 focus:outline-none font-bold text-white w-full placeholder:text-white"
                  value={shares || ""}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "")
                    setShares(val === "" ? 0 : parseInt(val, 10))
                  }}
                />
              </div>
            </div>
            <div className="flex gap-1 mb-5 overflow-hidden">
              {[-100, -10, 10, 100, 200].map((d) => (
                <button
                  key={d}
                  className="flex-1 p-1.5 font-xs bg-slate font-semibold text-white border rounded-md cursor-pointer transition-all duration-200  hover:bg-white/5 hover-text-white active:text-white active:bg-green-500/15"
                  onClick={() => handleSharesAdjust(d)}
                >
                  {d > 0 ? `+${d}` : d}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between font-base font-bold uppercase mb-2.5">
              <span>Set Expiration</span>

              <div
                onClick={() => setExpiry((p) => !p)}
                className="w-[38px] h-[22px] rounded-full border border-white/10 cursor-pointer relative shrink-0 transition-colors duration-200 bg-[#10d26006]"
              >
                <div
                  className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full shadow-md transition-all duration-200 ${
                    expiry ? "translate-x-[16px] bg-green-500" : "translate-x-0 bg-white"
                  }`}
                />
              </div>
            </div>

            {expiry && (
              <div className=" relative w-full mt-3 mb-5" ref={expiryRef}>
                <div
                  className="w-full py-4 px-2.5 bg-white/5 border border-white/10 rounded-2md text-white font-sm font-medium cursor-pointer flex items-center justify-between transition-all duration-75 ease hover:border-white/20  "
                  onClick={toggleExpiryDrop}
                >
                  <span>In {expiryDuration}</span>
                  <div className="text-white/80 flex items-center">
                    <ChevronDown />
                  </div>
                </div>
                {expiryDropOpen && (
                  <div
                    className="absolute left-0 right-0 bg-slate border border-white/10 rounded-2md z-50 shadow-[0_8px_24px_rgba(0, 0, 0, 0.5)] max-h-40 overflow-y-auto no-scrollbar"
                    style={{ top: "calc(100% + 6px)" }}
                  >
                    {["1 Day", "7 Days", "30 Days", "Custom"].map((d) => (
                      <button
                        key={d}
                        className={`w-full  py-3 px-3.5 font-sm rounded-md font-medium text-left text-white  cursor-pointer  transition-all hover:bg-white/8   ${expiryDuration === d ? " bg-primary text-black!" : ""}`}
                        onClick={() => {
                          setExpiryDuration(d)
                          closeExpiryDrop()
                        }}
                      >
                        In {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 bg-black border border-border rounded-lg p-4 mb-7.5 ">
              <div className="flex items-center justify-between gap-3.5">
                <span className=" flex items-center gap-1 text-tabs font-sm">Total</span>
                <span className="font-sm font-bold text-white">${total}</span>
              </div>

              <div className="flex items-center justify-between gap-3.5">
                <span className=" flex items-center gap-1 text-tabs font-sm">To win</span>
                <span className="font-sm font-semibold text-primary">${toWin}</span>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════
            LIMIT + SELL
        ════════════════════════════════════════════════════ */}
        {orderType === "Limit" && action === "Sell" && (
          <>
            {/* <div className="flex justify-between gap-2 items-center mb-3">
              <button
                className={`w-full flex-1 bg-option-yes h-12.5 border rounded-sm border-yes/20 text-primary font-bold hover:bg-primary hover:text-background transition-all active:scale-95${outcome === labelA ? " active" : ""}`}
                onClick={() => handleOutcome(labelA)}
              >
                {labelA}
              </button>
              <button
                className={`w-full flex-1 bg-option-no h-12.5 border rounded-sm border-no/20 text-no font-bold hover:bg-no hover:text-background transition-all active:scale-95${outcome === labelB ? " active" : ""}`}
                onClick={() => handleOutcome(labelB)}
              >
                {labelB}
              </button>
            </div> */}

            <div className="flex items-center justify-between mb-2.5 gap-4">
              <span className=" font-semibold text-white">Limit Price</span>
              <div className="flex items-center gap-2.5 py-3 px-2 rounded-md justify-between w-[160px] bg-white/5 border border-white/10">
                <button
                  className="size-7.5 shrink-0 rounded-2sm text-black font-default flex items-center justify-center cursor-pointer transition-all duration-120 font-mono sm bg-primary border border-white/10 hover:bg-primary/90"
                  onClick={() => updateLimit(limitCents - 1)}
                >
                  −
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={limitInput}
                      style={{ width: `${limitInput.length || 1}ch` }}
                      className="font-mono font-default font-bold text-white bg-transparent focus:outline-none text-right"
                      onChange={(e) => {
                        const raw = e.target.value
                        if (!/^\d{0,2}(\.\d{0,2})?$/.test(raw)) return
                        setLimitInput(raw)
                        const num = parseFloat(raw)
                        if (!isNaN(num)) setLimitCents(num)
                      }}
                      onBlur={() => updateLimit(limitCents)}
                    />
                    <span className="font-mono font-default font-bold text-white">¢</span>
                  </div>
                </div>
                <button
                  className="size-7.5 shrink-0 rounded-2sm text-black font-default flex items-center justify-center cursor-pointer transition-all duration-120 font-mono sm bg-primary border border-white/10 hover:bg-primary/90"
                  onClick={() => updateLimit(limitCents + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2.5 gap-4">
              <span className="font-semibold text-white">Shares</span>
              <div className="flex w-[160px] items-center bg-white/5 border border-white/10 rounded-md py-3 px-4 mb-0">
                <input
                  type="text"
                  inputMode="numeric"
                  className="text-xl focus:outline-none font-semibold text-white w-full placeholder:text-white"
                  value={shares || ""}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "")
                    setShares(val === "" ? 0 : parseInt(val, 10))
                  }}
                />
              </div>
            </div>
            <div className="flex gap-1 mb-5 overflow-hidden">
              {["25%", "50%", "Max"].map((p) => (
                <button
                  key={p}
                  className="flex-1 p-1.5 font-xs bg-slate font-semibold text-white border rounded-md cursor-pointer transition-all duration-200  hover:bg-white/5 hover-text-white active:text-white active:bg-green-500/15"
                  onClick={() => handleLimitSellPct(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between font-base font-bold uppercase mb-2.5">
              <span>Set Expiration</span>

              <div
                onClick={() => setExpiry((p) => !p)}
                className="w-[38px] h-[22px] rounded-full border border-white/10 cursor-pointer relative shrink-0 transition-colors duration-200 bg-[#10d26006]"
              >
                <div
                  className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full shadow-md transition-all duration-200 ${
                    expiry ? "translate-x-[16px] bg-green-500" : "translate-x-0 bg-white"
                  }`}
                />
              </div>
            </div>

            {expiry && (
              <div className="relative w-full mt-3 mb-5" ref={expiryRef}>
                <div
                  className="w-full py-4 px-2.5 bg-white/5 border border-white/10 rounded-2md text-white font-sm font-medium cursor-pointer flex items-center justify-between transition-all duration-75 ease hover:border-white/20  "
                  onClick={toggleExpiryDrop}
                >
                  <span>In {expiryDuration}</span>
                  <div className="text-white/80 flex items-center">
                    <ChevronDown />
                  </div>
                </div>
                {expiryDropOpen && (
                  <div
                    className="absolute left-0 right-0 bg-slate border border-white/10 rounded-2md z-50 shadow-[0_8px_24px_rgba(0, 0, 0, 0.5)] max-h-40 overflow-y-auto"
                    style={{ top: "calc(100% + 6px)" }}
                  >
                    {["1 Day", "7 Days", "30 Days", "Custom"].map((d) => (
                      <button
                        key={d}
                        className={`w-full  py-3 px-3.5 font-sm font-medium rounded-md text-left text-white  cursor-pointer  transition-all hover:bg-primary hover:text-black  ${expiryDuration === d ? " bg-primary text-black" : ""}`}
                        onClick={() => {
                          setExpiryDuration(d)
                          closeExpiryDrop()
                        }}
                      >
                        In {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-4 gap-4">
              <span className=" flex items-center gap-1 text-white ">You'll receive</span>
              <span className="font-sm font-semibold text-primary"> ${youReceive}</span>
            </div>
          </>
        )}

        {/* ── Place Order button ── */}
        <button
          className={`w-full p-3.5 rounded-2md font-deafult font-black cursor-pointer bg-primary disabled:bg-secondary/80 disabled:cursor-not-allowed text-black transition-all duration-300 shadow-[0px_4px_6px_-4px_#10D26033,0px_10px_15px_-3px_#10D26033] disabled:shadow-[0px_4px_6px_-4px_#8b949e33,0px_10px_15px_-3px_#8b949e33] mb-5 flex items-center justify-center gap-2 ${action === "Sell" ? " sell" : ""}`}
          disabled={approvalState !== "idle" || (buttonState === "trade" && tradeDisabled)}
          onClick={() => {
            if (buttonState === "login") {
              onLoginRequired?.()
              return
            }
            if (buttonState === "deposit") {
              onDepositRequired?.()
              return
            }
            debouncedHandleTrade()
          }}
        >
          {/* spinner — only shown when processing */}
          {approvalState !== "idle" && (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
          )}

          {/* label */}
          {buttonState === "login" && "Place Order"}
          {buttonState === "deposit" && "Deposit"}
          {buttonState === "trade" &&
            {
              idle: "Place Order",
              "approving-usdc": "Approving USDC...",
              "approving-ctf": "Approving shares...",
              signing: "Sign in wallet...",
              submitting: "Submitting...",
            }[approvalState]}
          <TrendingUp />
        </button>

        <div
          className="text-center font-sm text-tab-text "
          onClick={() => {
            navigate("/terms")
          }}
        >
          By trading, you agree to the <a className="underline">Terms of Use</a>.
        </div>
      </div>
    </div>
  )
}

export default TradePanel
