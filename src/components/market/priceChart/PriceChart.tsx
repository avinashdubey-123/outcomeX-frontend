// src/components/market/PriceChart/PriceChart.tsx
//
// ── Root bug fix ──────────────────────────────────────────────────────────────
// The container div MUST always be in the DOM so the chart-creation useEffect
// (which runs once on mount) can attach to a real DOM node. Previously the div
// was inside an `history.length === 0` branch — so on first render (data still
// loading) containerRef.current was null, chart was never created, and arriving
// data had nowhere to go. Fix: always render the container, overlay
// loading/empty states on top of it with CSS.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AreaSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type SingleValueData,
} from "lightweight-charts"
import { memo, useEffect, useRef } from "react"

import { useGraphSocket } from "@/hooks/socket/useGraphSocket"
import type { ChartTab, OhlcCandle } from "@/hooks/socket/usePriceChart"
import { TAB_INTERVAL } from "@/hooks/socket/usePriceChart"

export interface PriceChartProps {
  history: OhlcCandle[]
  tab: ChartTab
  onTabChange: (t: ChartTab) => void
  currentPrice: number // 0–1
  pctChange: number
  isPositive: boolean
  isFetching?: boolean
  height?: number
  optionGroupId?: string // needed for live socket updates
}

const TABS: ChartTab[] = ["1D", "1W", "1M", "ALL"]
const GREEN = "#10d260"
const RED = "#ea3943"

// ── Tick label formatter per tab ──────────────────────────────────────────────
// tickMarkType mirrors lightweight-charts' TickMarkType enum:
//   0 = Year | 1 = Month | 2 = DayOfMonth | 3 = Time | 4 = TimeWithSeconds
const getTickFormatter = (tab: ChartTab) => (time: number, tickMarkType: number) => {
  const d = new Date(time * 1000)

  switch (tab) {
    case "1D":
      // Intraday — every tick shows HH:mm
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

    case "1W":
      // Week view — year/month boundaries → "Apr 2026", days → "Apr 14", time → "14:00"
      if (tickMarkType <= 1)
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (tickMarkType === 2)
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

    case "1M":
      // Month view — year/month boundaries → "Apr 2026", days → "Apr 14"
      if (tickMarkType <= 1)
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    case "ALL":
      // Year view — year boundary → "2026", month ticks → "Apr '26"
      if (tickMarkType === 0) return d.getFullYear().toString()
      return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })

    default:
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}

export const PriceChart = memo(
  ({
    history,
    tab,
    onTabChange,
    currentPrice,
    pctChange,
    isPositive,
    isFetching = false,
    height = 220,
    optionGroupId = "",
  }: PriceChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    // ── Socket: live candle ticks & closed candles ────────────────────────────
    // Derive the interval string from the active tab so the socket subscription
    // always matches what the REST query is fetching (e.g. tab "1M" → "1m").
    const { liveCandle, closedCandles } = useGraphSocket(optionGroupId, TAB_INTERVAL[tab])

    // ── Create chart once on mount ────────────────────────────────────────────
    // containerRef is always rendered now, so this always succeeds.
    // `tab` is intentionally excluded — initial formatter is set here, tab changes
    // are applied in the dedicated useEffect([tab]) below without recreating the chart.
    useEffect(() => {
      if (!containerRef.current) {
        console.warn("[PriceChart] containerRef is null on mount — chart will NOT be created")
        return
      }

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "rgba(255,255,255,0.5)",
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        crosshair: {
          vertLine: { color: GREEN, width: 1, style: 0, labelVisible: false },
          horzLine: { color: GREEN, width: 1, style: 0, labelVisible: false },
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.05)",
          timeVisible: true,
          secondsVisible: false,
          fixLeftEdge: true,
          fixRightEdge: true,
          tickMarkFormatter: getTickFormatter(tab),
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.05)",
          scaleMargins: { top: 0.15, bottom: 0.15 },
        },
        handleScroll: false,
        handleScale: false,
      })

      chartRef.current = chart

      const series = chart.addSeries(AreaSeries, {
        lineColor: GREEN,
        topColor: "rgba(16,210,96,0.18)",
        bottomColor: "rgba(16,210,96,0)",
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (v: number) => `${(v * 100).toFixed(1)}¢`,
        },
      })

      seriesRef.current = series

      // ── Tooltip ──────────────────────────────────────────────────────────────
      chart.subscribeCrosshairMove((param) => {
        if (!tooltipRef.current || !containerRef.current) return

        const inBounds =
          param.point !== undefined &&
          param.time &&
          param.point.x >= 0 &&
          param.point.x <= containerRef.current.clientWidth &&
          param.point.y >= 0 &&
          param.point.y <= height

        if (!inBounds) {
          tooltipRef.current.style.display = "none"
          return
        }

        const data = param.seriesData.get(series) as SingleValueData | undefined
        if (!data) {
          tooltipRef.current.style.display = "none"
          return
        }

        tooltipRef.current.style.display = "block"

        const priceEl = tooltipRef.current.querySelector(".tt-price")
        const dateEl = tooltipRef.current.querySelector(".tt-date")

        if (priceEl) priceEl.textContent = `${(data.value * 100).toFixed(1)}¢`
        if (dateEl) {
          const d = new Date((param.time as number) * 1000)
          dateEl.textContent = d.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        }

        const TW = 120,
          TH = 60,
          margin = 12
        let left = param.point!.x + margin
        if (left + TW > containerRef.current.clientWidth) left = param.point!.x - TW - margin
        const coord = series.priceToCoordinate(data.value) ?? 0
        let top = coord - TH - margin
        if (top < 0) top = coord + margin

        tooltipRef.current.style.left = `${left}px`
        tooltipRef.current.style.top = `${top}px`
      })

      // ── Resize observer ───────────────────────────────────────────────────────
      const observer = new ResizeObserver(() => {
        if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
      })
      observer.observe(containerRef.current)

      return () => {
        observer.disconnect()
        chart.remove()
        chartRef.current = null
        seriesRef.current = null
      }
      // `tab` omitted intentionally — formatter updates are handled by useEffect([tab])
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height])

    // ── Feed data into the chart whenever history changes ─────────────────────
    useEffect(() => {
      if (!seriesRef.current) {
        console.warn("[PriceChart] seriesRef is null — chart not ready yet, cannot set data")
        return
      }
      if (history.length === 0) return

      // lightweight-charts requires strictly ascending time values
      const sorted = [...history].sort((a, b) => a.time - b.time)

      const chartData = sorted.map((c) => ({
        time: c.time as unknown as string,
        value: c.close, // line chart uses close price from OHLC
      }))

      try {
        seriesRef.current.setData(chartData)
        chartRef.current?.timeScale().fitContent()
      } catch (err) {
        console.error("[PriceChart] setData threw an error:", err)
      }
    }, [history])

    // ── Update tick formatter when tab changes ─────────────────────────────────
    useEffect(() => {
      if (!chartRef.current) return
      chartRef.current.applyOptions({
        timeScale: { tickMarkFormatter: getTickFormatter(tab) },
      })
    }, [tab])

    // ── candle_close → append finalised candle directly, no full setData ───────
    useEffect(() => {
      if (!seriesRef.current || closedCandles.length === 0) return
      const candle = closedCandles[closedCandles.length - 1]
      if (!candle) return
      try {
        seriesRef.current.update({
          time: candle.time as unknown as string,
          value: candle.close,
        } as SingleValueData)
      } catch (err) {
        console.error("[PriceChart] series.update (candle_close) error:", err)
      }
    }, [closedCandles])

    // ── candle_update → update the live forming candle directly ────────────────
    useEffect(() => {
      if (!seriesRef.current || !liveCandle) return
      try {
        seriesRef.current.update({
          time: liveCandle.time as unknown as string,
          value: liveCandle.close,
        } as SingleValueData)
      } catch (err) {
        console.error("[PriceChart] series.update (candle_update) error:", err)
      }
    }, [liveCandle])

    // Socket data is the freshest source — use it for the header price when
    // available so it updates in real-time without waiting for a REST refetch.
    const socketPrice =
      liveCandle?.close ??
      (closedCandles.length > 0 ? closedCandles[closedCandles.length - 1]?.close : undefined)
    const displayPrice = socketPrice ?? currentPrice

    const pctFormatted = `${isPositive ? "+" : ""}${pctChange.toFixed(1)}%`

    return (
      <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl mb-7.5 p-6 relative">
        {/* ── Header ── */}
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-0.5 pb-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground font-sm">Price History</span>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="text-white font-2xl font-black">
                  {Number((displayPrice * 100).toFixed(2))}¢
                </div>
                <div
                  className="flex items-center text-sm font-medium"
                  style={{ color: isPositive ? GREEN : RED }}
                >
                  <span>{isPositive ? "↗" : "↘"}</span>
                  <span className="ml-1">{pctFormatted} (period)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeframe tabs */}
          <div className="flex gap-2 p-1 rounded-2md max-w-fit border border-white/10 bg-white/5">
            {TABS.map((t) => (
              <button
                key={t}
                disabled={isFetching}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer transition-all duration-120 hover:text-[#e2e8f0]
                  ${
                    tab === t
                      ? "bg-primary text-black shadow-[0px_4px_6px_-4px_rgba(16,210,96,0.3),0px_10px_15px_-3px_rgba(16,210,96,0.3)]"
                      : "bg-transparent text-white/60"
                  }`}
                onClick={() => onTabChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chart area ── */}
        {/* The container div is ALWAYS rendered so the creation useEffect can
            attach to a real DOM node. Overlay states sit on top of it. */}
        <div className="relative overflow-hidden">
          <div ref={containerRef} style={{ width: "100%", height }} />

          {/* Loading overlay */}
          {isFetching && (
            <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm bg-transparent">
              Loading…
            </div>
          )}

          {/* Empty state overlay — only shown when fully loaded but no data */}
          {!isFetching && history.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
              No price history yet
            </div>
          )}

          {/* Custom Tooltip */}
          <div
            ref={tooltipRef}
            className="absolute z-10 pointer-events-none bg-[#102218] border border-primary rounded-md p-2.5 shadow-2xl space-y-0.5"
            style={{ display: "none", width: "120px" }}
          >
            <div className="font-xs font-bold text-white/50 uppercase tracking-wider">Price</div>
            <div className="tt-price font-sm font-black text-white leading-tight">—</div>
            <div className="tt-date font-xs text-secondary">—</div>
          </div>
        </div>
      </div>
    )
  },
)

PriceChart.displayName = "PriceChart"
