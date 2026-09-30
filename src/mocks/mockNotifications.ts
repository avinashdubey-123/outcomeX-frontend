// src/mocks/mockNotifications.ts
// Replace this entire file's usage with API call when backend is ready:
// const { data: notifications } = useGetNotificationsQuery()

import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from "@/features/notifications/notificationConstants"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string // ISO 8601
  read: boolean
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n-001",
    type: NOTIFICATION_TYPES.FILL,
    title: "Order Partially Filled",
    message: 'Your YES order on "Will Fed cut rates?" was 40% filled at 65¢.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "n-002",
    type: NOTIFICATION_TYPES.ORDER,
    title: "Order Placed",
    message: 'Limit buy of 100 YES shares on "Bitcoin $100k" at 42¢.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "n-003",
    type: NOTIFICATION_TYPES.TRADE,
    title: "Order Filled",
    message: 'Your NO order on "Elon Musk CEO of X" was fully filled at 78¢.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
  },
  {
    id: "n-004",
    type: NOTIFICATION_TYPES.SYSTEM,
    title: "Market Resolved",
    message: '"Will Apple release AR glasses?" resolved NO. Your position was settled.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
]
