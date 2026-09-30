// src/features/notifications/notificationConstants.ts

export const NOTIFICATION_TYPES = {
  FILL: "fill",
  ORDER: "order",
  TRADE: "trade",
  SYSTEM: "system",
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

// display config per type — icon, colors
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { icon: string; bg: string; color: string }
> = {
  [NOTIFICATION_TYPES.FILL]: { icon: "✓", bg: "rgba(0,200,83,0.12)", color: "#00c853" },
  [NOTIFICATION_TYPES.ORDER]: { icon: "↗", bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
  [NOTIFICATION_TYPES.TRADE]: { icon: "⟳", bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  [NOTIFICATION_TYPES.SYSTEM]: {
    icon: "!",
    bg: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.5)",
  },
}

export const NOTIFICATION_LIMITS = {
  MAX_BADGE_COUNT: 9, // shows "9+" above this
  MAX_LIST_HEIGHT: 360, // dropdown scroll height in px
  DROPDOWN_WIDTH: 340, // dropdown width in px
} as const
