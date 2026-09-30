// src/hooks/socket/useGraphSocket.ts
//
// Subscribes to real-time candlestick events for a market option-group.
//
// Emits:
//   "subscribeGraph"   { optionGroupId, interval }  — on mount / interval change
//   "unsubscribeGraph" { optionGroupId, interval }  — on cleanup / interval change
//
// Listens:
//   "candle_update"  — live (forming) candle tick for the current bucket
//   "candle_close"   — bucket finalised, candle is done
//
// When interval changes (tab switch) React runs the cleanup first:
//   1. cleanup: unsubscribeGraph (old interval) + reset state
//   2. effect:  subscribeGraph   (new interval)
// So only one subscription is ever active and stale candles are cleared.

import { useEffect, useRef, useState } from "react"

import type { OhlcCandle } from "@/features/api/markets/marketApi"
import { useSocket } from "@/features/socket/socketContext"

// ── Raw socket payload (same shape as REST price-history) ────────────────────
interface RawCandle {
  optionGroupId: string
  open: string
  high: string
  low: string
  close: string
  bucketStart: string
  bucketEnd: string
}

const normalise = (c: RawCandle): OhlcCandle => ({
  time: Math.floor(new Date(c.bucketStart).getTime() / 1000),
  open: Number(c.open) / 1_000_000,
  high: Number(c.high) / 1_000_000,
  low: Number(c.low) / 1_000_000,
  close: Number(c.close) / 1_000_000,
})

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useGraphSocket = (optionGroupId: string, interval: string) => {
  const socketCtx = useSocket()
  const socket = socketCtx?.socket ?? null

  // Current forming candle — replaced on every candle_update tick
  const [liveCandle, setLiveCandle] = useState<OhlcCandle | null>(null)

  // Finalised candles — appended on candle_close, reset on interval change
  const [closedCandles, setClosedCandles] = useState<OhlcCandle[]>([])

  // Ref so event handlers can guard against stale closure firing after
  // interval has already changed (race between socket message and cleanup)
  const activeIntervalRef = useRef(interval)

  useEffect(() => {
    if (!optionGroupId || !interval || !socket) {
      console.warn(
        "[useGraphSocket] skipping — optionGroupId:",
        optionGroupId,
        "| interval:",
        interval,
        "| socket:",
        !!socket,
      )
      return
    }

    activeIntervalRef.current = interval
    socket.emit("subscribeGraph", { optionGroupId, interval })

    const handleCandleUpdate = (data: RawCandle) => {
      // Discard events that arrive after a tab switch (stale subscription)
      if (activeIntervalRef.current !== interval) return
      if (data.optionGroupId !== optionGroupId) return
      setLiveCandle(normalise(data))
    }

    const handleCandleClose = (data: RawCandle) => {
      if (activeIntervalRef.current !== interval) return
      if (data.optionGroupId !== optionGroupId) return
      const candle = normalise(data)
      setClosedCandles((prev) => [...prev, candle])
      setLiveCandle(null)
    }

    socket.on("candle_update", handleCandleUpdate)
    socket.on("candle_close", handleCandleClose)

    return () => {
      // Unsubscribe the specific interval so the server stops sending events
      socket.emit("unsubscribeGraph", { optionGroupId, interval })
      socket.off("candle_update", handleCandleUpdate)
      socket.off("candle_close", handleCandleClose)
      // Reset candle state here (cleanup) — not at the top of the effect body.
      // This runs before the next interval's effect fires, so the chart never
      // briefly shows stale candles from the previous interval.
      setLiveCandle(null)
      setClosedCandles([])
    }
  }, [optionGroupId, interval, socket])

  return { liveCandle, closedCandles }
}
