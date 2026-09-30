import type { FC } from "react"

interface IconProps {
  className?: string
  size?: number | string
}

export const IcoAI: FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main container box */}
    <path
      d="M17 3H7C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 13V7C21 4.79086 19.2109 3 17 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* AI text */}
    <path
      d="M7 15L9.5 9L12 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8.2 13H10.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

    {/* Sparkle star at bottom right */}
    <path d="M19 15L20 18L23 19L20 20L19 23L18 20L15 19L18 18L19 15Z" fill="currentColor" />
  </svg>
)
