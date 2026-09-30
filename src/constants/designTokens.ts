/**
 * Design system tokens for the Polymarket-inspired dashboard.
 * These match the CSS variables defined in globals.css.
 */
export const DESIGN_TOKENS = {
  colors: {
    background: "#0B0F14",
    surface: "#121821",
    border: "#1F2937",
    primary: "#16C784", // Green - Yes
    secondary: "#EA3943", // Red - No
    muted: "#9CA3AF",
    accent: "#3B82F6", // Blue
  },
  glassmorphism: "backdrop-blur-md bg-opacity-70 bg-[#121821]",
  transitions: {
    default: "transition-all duration-200 ease-in-out",
    hover: "hover:scale-[1.02] active:scale-[0.98]",
  },
} as const
