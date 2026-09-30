import { secondApi } from "@/features/api/secondApi"
import { NOTIFICATION_TYPES } from "@/features/notifications/notificationConstants"
import type { Notification } from "@/features/notifications/notificationSlice"

export interface ApiNotificationItem {
  id: string
  readAt: string | null
  createdAt: string
  notificationId: string
  title: string
  description: string
  imageUrl: string
  redirectUrl: string
  type: number
}

export interface ApiNotificationResponse {
  statusCode: number
  status: boolean
  message: string
  type: string
  data: {
    notifications: ApiNotificationItem[]
    totalCount: number
  }
}

const mapApiNotification = (apiItem: ApiNotificationItem): Notification => {
  // Map backend numeric types to frontend notification enum types
  // 3 -> Market Resolved -> SYSTEM
  // 2 -> Order Matched -> FILL
  let type: Notification["type"] = NOTIFICATION_TYPES.SYSTEM
  if (apiItem.type === 2) type = NOTIFICATION_TYPES.FILL
  if (apiItem.type === 3) type = NOTIFICATION_TYPES.SYSTEM

  return {
    id: apiItem.id, // Using global wrap ID
    type,
    title: apiItem.title,
    message: apiItem.description,
    timestamp: apiItem.createdAt,
    read: apiItem.readAt !== null,
  }
}
type NotificationApiResponse = {
  statusCode: number
  status: boolean
  message: string
  type: string
}

export const notificationApi = secondApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], { limit?: number; skip?: number } | void>({
      query: (params) => ({
        url: `/v1/notifications`,
        params: { limit: 10, skip: 0, ...(params ?? {}) },
      }),
      transformResponse: (response: ApiNotificationResponse) => {
        if (!response?.data?.notifications) {
          return []
        }
        const mapped = response.data.notifications.map(mapApiNotification)
        return mapped
      },
    }),

    // DELETE /v1/notifications
    // Pass { notificationRecipientId } to delete one; omit to delete all.
    deleteNotifications: builder.mutation<
      NotificationApiResponse,
      { notificationRecipientId?: string } | void
    >({
      query: (params) => ({
        url: `/v1/notifications`,
        method: "DELETE",
        params:
          params && (params as { notificationRecipientId?: string }).notificationRecipientId
            ? {
                notificationRecipientId: (params as { notificationRecipientId?: string })
                  .notificationRecipientId,
              }
            : undefined,
      }),
    }),

    // PUT /v1/notifications/read
    // Pass { notificationRecipientId } to mark one as read; omit to mark all as read.
    markNotificationsRead: builder.mutation<
      NotificationApiResponse,
      { notificationRecipientId?: string } | void
    >({
      query: (params) => ({
        url: `/v1/notifications/read`,
        method: "PATCH",
        params:
          params && (params as { notificationRecipientId?: string }).notificationRecipientId
            ? {
                notificationRecipientId: (params as { notificationRecipientId?: string })
                  .notificationRecipientId,
              }
            : undefined,
      }),
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useDeleteNotificationsMutation,
  useMarkNotificationsReadMutation,
} = notificationApi
