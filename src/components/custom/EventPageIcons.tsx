// src/components/custom/EventPageIcons.tsx
// All icons default to 14×14 to fit inside ep-chip rows

interface P {
  size?: number
}
const s = (p: P) => ({ width: p.size ?? 14, height: p.size ?? 14 })

// Clock — "Ends Dec 31"
export const IcoClockSm = (p: P) => (
  <svg
    {...s(p)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 5v3.2l2.2 1.3" />
  </svg>
)

// Bar chart — Volume
export const IcoVolSm = (p: P) => (
  <svg
    {...s(p)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1.5" y="9" width="3" height="5.5" rx="0.5" />
    <rect x="6.5" y="5" width="3" height="9.5" rx="0.5" />
    <rect x="11.5" y="2" width="3" height="12.5" rx="0.5" />
  </svg>
)

// Droplet — Liquidity
export const IcoLiquiditySm = (p: P) => (
  <svg
    {...s(p)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 2C8 2 3 7.5 3 10.5a5 5 0 0 0 10 0C13 7.5 8 2 8 2Z" />
  </svg>
)

// Repeat arrows — Frequency
export const IcoRepeatSm = (p: P) => (
  <svg
    {...s(p)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 9a5.5 5.5 0 0 0 10 2" />
    <path d="M13.5 7a5.5 5.5 0 0 0-10-2" />
    <polyline points="11 11.5 12.5 13 14 11.5" />
    <polyline points="5 4.5 3.5 3 2 4.5" />
  </svg>
)

// Share / link out
export const IcoShareSm = (p: P) => (
  <svg
    {...s(p)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11.5" cy="3" r="1.75" />
    <circle cx="4.5" cy="8" r="1.75" />
    <circle cx="11.5" cy="13" r="1.75" />
    <line x1="6.2" y1="7.1" x2="9.8" y2="4.9" />
    <line x1="6.2" y1="8.9" x2="9.8" y2="11.1" />
  </svg>
)

// Bookmark
export const IcoBookmarkSm = (p: P) => (
  <svg
    {...s(p)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3.5 2.5h9a.5.5 0 0 1 .5.5v10.5l-5-3-5 3V3a.5.5 0 0 1 .5-.5Z" />
  </svg>
)
