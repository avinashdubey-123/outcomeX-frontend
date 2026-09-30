// src/components/ui/MarketSkeleton.tsx
// Skeleton loaders for market card and event page
// Uses pure CSS pulse animation — no dependencies

import type { FC } from "react"

// ─── Shared pulse style ───────────────────────────────────────────────────────
const S: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "sk-shimmer 1.6s ease-in-out infinite",
  borderRadius: 8,
}

// ─── MarketCardSkeleton ───────────────────────────────────────────────────────
// Matches BinaryMarketCard layout exactly
export const MarketCardSkeleton: FC = () => (
  <div
    style={{
      background: "#161a22",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    {/* thumbnail + title row */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div style={{ ...S, width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ ...S, height: 14, width: "90%" }} />
        <div style={{ ...S, height: 14, width: "70%" }} />
        <div style={{ ...S, height: 14, width: "50%" }} />
      </div>
    </div>

    {/* YES / NO buttons */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <div style={{ ...S, height: 44, borderRadius: 10 }} />
      <div style={{ ...S, height: 44, borderRadius: 10 }} />
    </div>

    {/* probability bar */}
    <div style={{ ...S, height: 4, borderRadius: 99 }} />

    {/* pct labels */}
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ ...S, height: 12, width: 28, borderRadius: 4 }} />
      <div style={{ ...S, height: 12, width: 28, borderRadius: 4 }} />
    </div>

    {/* footer */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 4,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ ...S, height: 11, width: 70, borderRadius: 4 }} />
        <div style={{ ...S, height: 11, width: 60, borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ ...S, height: 14, width: 14, borderRadius: "50%" }} />
        <div style={{ ...S, height: 14, width: 14, borderRadius: "50%" }} />
        <div style={{ ...S, height: 14, width: 14, borderRadius: "50%" }} />
      </div>
    </div>
  </div>
)

// ─── MarketGridSkeleton ───────────────────────────────────────────────────────
// Drop-in replacement for a grid of market cards while loading
interface MarketGridSkeletonProps {
  count?: number
}

export const MarketGridSkeleton: FC<MarketGridSkeletonProps> = ({ count = 8 }) => (
  <>
    <style>{`
      @keyframes sk-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <MarketCardSkeleton key={i} />
      ))}
    </div>
  </>
)

// ─── EventPageSkeleton ────────────────────────────────────────────────────────
// Full event page skeleton — matches EventPage two-column layout
export const EventPageSkeleton: FC = () => (
  <>
    <style>{`
      @keyframes sk-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>

    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      {/* breadcrumb */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ ...S, height: 12, width: 60, borderRadius: 4 }} />
        <div style={{ ...S, height: 12, width: 8, borderRadius: 4 }} />
        <div style={{ ...S, height: 12, width: 120, borderRadius: 4 }} />
      </div>

      {/* title row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ ...S, height: 28, width: "80%", borderRadius: 6 }} />
          <div style={{ ...S, height: 28, width: "55%", borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
          <div style={{ ...S, width: 32, height: 32, borderRadius: 8 }} />
          <div style={{ ...S, width: 32, height: 32, borderRadius: 8 }} />
        </div>
      </div>

      {/* meta chips */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ ...S, height: 20, width: 140, borderRadius: 6 }} />
        <div style={{ ...S, height: 20, width: 100, borderRadius: 6 }} />
      </div>

      {/* two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* LEFT — chart + tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* chart card */}
          <div
            style={{
              background: "#161a22",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 0,
            }}
          >
            {/* chart header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...S, height: 11, width: 120, borderRadius: 4 }} />
                <div style={{ ...S, height: 32, width: 80, borderRadius: 6 }} />
                <div style={{ ...S, height: 13, width: 100, borderRadius: 4 }} />
              </div>
              {/* time tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  padding: 4,
                  height: "fit-content",
                }}
              >
                {["1D", "1W", "1M", "ALL"].map((t) => (
                  <div key={t} style={{ ...S, width: 36, height: 28, borderRadius: 7 }} />
                ))}
              </div>
            </div>

            {/* chart area */}
            <div style={{ ...S, height: 220, borderRadius: 8 }} />
          </div>

          {/* tab bar */}
          <div
            style={{
              display: "flex",
              gap: 0,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              marginTop: 16,
              paddingBottom: 0,
            }}
          >
            {["Market Rules", "Activity", "Order Book", "Comments"].map((t) => (
              <div
                key={t}
                style={{ ...S, height: 13, width: 90, borderRadius: 4, margin: "0 20px 12px 0" }}
              />
            ))}
          </div>

          {/* tab content */}
          <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...S, height: 13, width: "100%", borderRadius: 4 }} />
            <div style={{ ...S, height: 13, width: "90%", borderRadius: 4 }} />
            <div style={{ ...S, height: 13, width: "75%", borderRadius: 4 }} />
            <div style={{ ...S, height: 13, width: "85%", borderRadius: 4 }} />

            {/* meta grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginTop: 16,
                background: "#161a22",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ ...S, height: 10, width: 60, borderRadius: 4 }} />
                  <div style={{ ...S, height: 14, width: 90, borderRadius: 4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — trade panel */}
        <div
          style={{
            background: "#161a22",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* title */}
          <div style={{ ...S, height: 18, width: 80, borderRadius: 4 }} />

          {/* buy/sell + dropdown */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ ...S, height: 34, width: 72, borderRadius: 8 }} />
              <div style={{ ...S, height: 34, width: 72, borderRadius: 8 }} />
            </div>
            <div style={{ ...S, height: 34, width: 90, borderRadius: 8 }} />
          </div>

          {/* yes/no buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ ...S, height: 50, borderRadius: 10 }} />
            <div style={{ ...S, height: 50, borderRadius: 10 }} />
          </div>

          {/* inputs */}
          <div style={{ ...S, height: 44, borderRadius: 10 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ ...S, flex: 1, height: 30, borderRadius: 7 }} />
            ))}
          </div>

          {/* summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ ...S, height: 12, width: 60, borderRadius: 4 }} />
              <div style={{ ...S, height: 12, width: 50, borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ ...S, height: 12, width: 50, borderRadius: 4 }} />
              <div style={{ ...S, height: 12, width: 60, borderRadius: 4 }} />
            </div>
          </div>

          {/* place order button */}
          <div style={{ ...S, height: 48, borderRadius: 12 }} />

          {/* terms */}
          <div style={{ ...S, height: 11, width: "70%", borderRadius: 4, margin: "0 auto" }} />
        </div>
      </div>
    </div>
  </>
)
