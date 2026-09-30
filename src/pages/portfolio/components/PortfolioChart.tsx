// src/pages/portfolio/components/PortfolioChart.tsx

import {
  AreaSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type OhlcData,
  type SingleValueData,
} from "lightweight-charts"
import { memo, useEffect, useRef, useState } from "react"

import { formatCash } from "@/libs/formatCurrency"
import type { PortfolioChartPoint } from "@/mocks/mockPortfolio"

import { CHART_TABS, type ChartTab, PORTFOLIO_COLORS } from "../portfolioConstants"

const TABS = Object.values(CHART_TABS)
const CHART_HEIGHT = 280

interface PortfolioChartProps {
  data: PortfolioChartPoint[]
  portfolioValue: number
  delta: number
  deltaPct: number
  // TODO: onTabChange(tab) → fetch different range from API
  onTabChange?: (tab: ChartTab) => void
}

export const PortfolioChart = memo(
  ({ data, portfolioValue, delta, deltaPct, onTabChange }: PortfolioChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const [activeTab, setActiveTab] = useState<ChartTab>(CHART_TABS.ONE_MONTH)

    const isPositive = delta >= 0

    // create chart once
    useEffect(() => {
      if (!containerRef.current) return

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: CHART_HEIGHT,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "white",
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        crosshair: {
          vertLine: {
            color: "#00c853",
            width: 1,
            style: 0,
            labelVisible: false,
          },
          horzLine: {
            color: "#00c853",
            width: 1,
            style: 0,
            labelVisible: false,
          },
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.05)",
          timeVisible: true,
          fixLeftEdge: true,
          fixRightEdge: true,
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.05)",
          scaleMargins: { top: 0.1, bottom: 0.05 },
        },
        handleScroll: false,
        handleScale: false,
      })

      chartRef.current = chart

      const series = chart.addSeries(AreaSeries, {
        lineColor: PORTFOLIO_COLORS.GREEN,
        topColor: "rgba(0,200,83,0.25)",
        bottomColor: "rgba(0,200,83,0)",
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (v: number) => `$${v.toLocaleString()}`,
        },
      })

      seriesRef.current = series

      // ── Tooltip logic ────────────────────────────────────────────────────────
      chart.subscribeCrosshairMove((param) => {
        if (!tooltipRef.current || !containerRef.current) return

        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > containerRef.current.clientWidth ||
          param.point.y < 0 ||
          param.point.y > CHART_HEIGHT
        ) {
          tooltipRef.current.style.display = "none"
        } else {
          const dataPoint = param.seriesData.get(series)
          if (!dataPoint) {
            tooltipRef.current.style.display = "none"
            return
          }

          tooltipRef.current.style.display = "block"
          const value =
            "value" in dataPoint
              ? (dataPoint as SingleValueData).value
              : (dataPoint as OhlcData).close
          const coordinate = series.priceToCoordinate(value)

          // Tooltip content
          const priceEl = tooltipRef.current.querySelector(".tt-price")
          const dateEl = tooltipRef.current.querySelector(".tt-date")

          if (priceEl) priceEl.textContent = `$${value.toLocaleString()}`
          if (dateEl) {
            const date = new Date((param.time as number) * 1000)
            dateEl.textContent = `${date.toLocaleString("en-US", { month: "short", day: "numeric" })}, ${date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`
          }

          // Positioning
          const tooltipWidth = 140
          const tooltipHeight = 70
          const margin = 15

          let left = param.point.x + margin
          if (left > containerRef.current.clientWidth - tooltipWidth) {
            left = param.point.x - tooltipWidth - margin
          }

          let top = coordinate! - tooltipHeight - margin
          if (top < 0) {
            top = coordinate! + margin
          }

          tooltipRef.current.style.left = `${left}px`
          tooltipRef.current.style.top = `${top}px`
        }
      })

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
    }, [])

    // update data when it changes
    useEffect(() => {
      if (!seriesRef.current || data.length === 0) return
      const BASE = Math.floor(Date.now() / 1000) - data.length * 86400
      seriesRef.current.setData(
        data.map((p, i) => ({
          time: (BASE + i * 86400) as unknown as string,
          value: p.value,
        })),
      )
      chartRef.current?.timeScale().fitContent()
    }, [data])

    const handleTabChange = (tab: ChartTab) => {
      setActiveTab(tab)
      onTabChange?.(tab)
      // TODO: fetch new chart data for this range from API
    }

    return (
      <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl mb-7.5 p-6 relative">
        {/* header */}
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-3 pb-3">
          <div>
            <div className="text-muted-foreground font-sm">Portfolio Value</div>
            <div className="flex items-center gap-3">
              <span className="text-white font-2xl font-black">{formatCash(portfolioValue)}</span>
              <span className="text-primary ">
                {isPositive ? "+" : ""}
                {formatCash(delta)} ({isPositive ? "+" : ""}
                {deltaPct.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* tab switcher */}
          <div className="flex gap-2 p-1 rounded-2md max-w-fit border border-white/10 m-0 bg-white/5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer transition-all duration-120 hover:text-[#e2e8f0]
                  ${activeTab === t ? " bg-primary text-black shadow-[0px_4px_6px_-4px_rgba(16,210,96,0.3),0px_10px_15px_-3px_rgba(16,210,96,0.3)]" : "bg-transparent text-white/60"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* chart */}
        <div className="relative overflow-hidden">
          <div ref={containerRef} style={{ width: "100%", minHeight: CHART_HEIGHT }} />
          {/* Custom Tooltip */}
          <div
            ref={tooltipRef}
            className="absolute z-10 pointer-events-none bg-[#102218] border border-[#00c853] rounded-md p-2.5 shadow-2xl space-y-0.5"
            style={{ display: "none", width: "140px" }}
          >
            <div className="font-xs font-bold text-muted-foreground uppercase tracking-wider">
              Portfolio Value
            </div>
            <div className="tt-price font-sm font-black text-white leading-tight">$0</div>
            <div className="tt-date font-xs text-secondary">Date here</div>
          </div>
        </div>
      </div>
    )
  },
)

PortfolioChart.displayName = "PortfolioChart"
