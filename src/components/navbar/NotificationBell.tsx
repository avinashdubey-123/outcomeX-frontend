// src/components/navbar/NotificationBell.tsx

import { Bell, CheckCheck, ChevronRight, Trash2, X } from "lucide-react"
import { useCallback, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router"

import type { RootState } from "@/app/store"
import {
  useDeleteNotificationsMutation,
  useLazyGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} from "@/features/api/notifications/notificationApi"
import {
  NOTIFICATION_LIMITS,
  NOTIFICATION_TYPE_CONFIG,
} from "@/features/notifications/notificationConstants"
import {
  appendNotifications,
  clearAll,
  markAllRead,
  markRead,
  type Notification,
  removeNotification,
  selectNotifications,
  selectUnreadCount,
  setNotifications,
} from "@/features/notifications/notificationSlice"
import { useDropdown } from "@/hooks/ui/useDropdown"

const LIMIT = 10

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// const formatBadgeCount = (count: number): string =>
//   count > NOTIFICATION_LIMITS.MAX_BADGE_COUNT
//     ? `${NOTIFICATION_LIMITS.MAX_BADGE_COUNT}+`
//     : String(count)

// ── Sub-components ────────────────────────────────────────────────────────────
const TypeIcon = ({ type }: { type: Notification["type"] }) => {
  const config = NOTIFICATION_TYPE_CONFIG[type]
  return (
    <div
      className="w-8 h-8 rounded-full font-sm font-bold flex items-center justify-center shrink-0"
      style={{ background: config.bg, color: config.color }}
    >
      {config.icon}
    </div>
  )
}

const UnreadDot = () => (
  <div className="absolute top-3.5 left-1.5 w-1 h-1 rounded-full bg-[#00c853]" />
)

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-6 px-5 gap-2.5">
    <div className="w-10 h-10 rounded-full bg-white/6 flex items-center justify-center">
      <Bell size={18} color="rgba(255,255,255,0.6)" />
    </div>
    <p className="text-sm font-semibold text-white/60">No notifications</p>
    <p className="text-xs text-white/30">You're all caught up!</p>
  </div>
)

// ── Notification row ──────────────────────────────────────────────────────────
const NotifRow = ({ notif }: { notif: Notification }) => {
  const dispatch = useDispatch()
  const [deleteNotifications] = useDeleteNotificationsMutation()
  const [markNotificationsRead] = useMarkNotificationsReadMutation()
  const hoverBg = "rgba(255,255,255,0.04)"

  return (
    <div
      onClick={() => {
        if (!notif.read) {
          void markNotificationsRead({ notificationRecipientId: notif.id })
          dispatch(markRead(notif.id))
        }
      }}
      className="flex gap-2.5 py-3 px-3.5 cursor-pointer border-b border-b-white/5 transition-all duration-150 relative"
      style={{ background: notif.read ? "transparent" : "#10D26010" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = notif.read ? "transparent" : "#10D26010")
      }
    >
      {!notif.read && <UnreadDot />}
      <TypeIcon type={notif.type} />
      <div className="flex-1 min-w-0">
        <div
          className="font-sm mb-0.5"
          style={{
            fontWeight: notif.read ? 500 : 700,
            color: notif.read ? "rgba(255,255,255,0.8)" : "#ffffff",
          }}
        >
          {notif.title}
        </div>
        <div className="font-base text-white/70 line-clamp-2 overflow-hidden">{notif.message}</div>
        <div className="font-xs text-white/25 mt-1">{timeAgo(notif.timestamp)}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          void deleteNotifications({ notificationRecipientId: notif.id })
          dispatch(removeNotification(notif.id))
        }}
        className="text-white/20 p-1 shrink-0 self-start rounded-sm transition-all"
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        <X size={12} />
      </button>
    </div>
  )
}

// ── Dropdown header ───────────────────────────────────────────────────────────
const DropdownHeader = ({
  unreadCount,
  hasNotifications,
  onClose,
}: {
  unreadCount: number
  hasNotifications: boolean
  onClose: () => void
}) => {
  const dispatch = useDispatch()
  const [deleteNotifications] = useDeleteNotificationsMutation()
  const [markNotificationsRead] = useMarkNotificationsReadMutation()

  return (
    <div className="p-4 pb-3 border-b border-b-white/6 flex flex-row gap-3 justify-between">
      <div className="flex items-center gap-2">
        <span className="font-sm font-bold text-white uppercase">Notifications</span>
        {unreadCount > 0 && (
          <span className="font-xs font-extrabold text-primary bg-primary/8 py-0.5 px-2 rounded-full border border-primary/70">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="flex gap-2.5">
        {unreadCount > 0 && (
          <button
            onClick={() => {
              void markNotificationsRead()
              dispatch(markAllRead())
            }}
            className="font-base font-semibold transition-all cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.5)"
            }}
          >
            <CheckCheck size={12} />
          </button>
        )}

        {hasNotifications && (
          <button
            onClick={() => {
              void deleteNotifications()
              dispatch(clearAll())
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#E11D48"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.5)"
            }}
          >
            <Trash2 size={12} />
          </button>
        )}

        {/* Close Button — Mobile Only */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="md:hidden text-white/40 hover:text-white transition-colors ml-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface NotificationBellProps {
  isOpen?: boolean
  onToggle?: () => void
}

export const NotificationBell = ({ onToggle }: NotificationBellProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state: RootState) => state.auth.token)
  const notifications = useSelector(selectNotifications)
  const unreadCount = useSelector(selectUnreadCount)

  const { isOpen: open, toggle, ref } = useDropdown("notifications")

  // Pagination state — tracked separately from Redux list length so FCM
  // notifications prepended via addNotification() don't skew the API skip.
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [nextSkip, setNextSkip] = useState(0)

  const [triggerFetch] = useLazyGetNotificationsQuery()

  // Fetches one page and merges into Redux.
  // Called imperatively from event handlers — never directly inside an effect body.
  const fetchPage = useCallback(
    async (pageSkip: number) => {
      if (!token) return
      setIsFetchingMore(true)
      try {
        // For page 0 (fresh open): always hit the network.
        // For page > 0: use cached RTK Query result if available.
        const result = await triggerFetch({ limit: LIMIT, skip: pageSkip }, pageSkip > 0)
        if (!result.data) return
        const items = result.data

        if (pageSkip === 0) {
          dispatch(setNotifications(items))
        } else {
          dispatch(appendNotifications(items))
        }

        const more = items.length >= LIMIT
        setHasMore(more)
        setNextSkip(more ? pageSkip + LIMIT : pageSkip)
      } finally {
        setIsFetchingMore(false)
      }
    },
    [token, triggerFetch, dispatch],
  )

  // Fetch first page every time the dropdown opens.
  const handleToggle = () => {
    if (!open && token) {
      setHasMore(true)
      setNextSkip(0)
      void fetchPage(0)
    }
    if (onToggle) onToggle()
    else toggle()
  }

  // Load next page when scrolled within 80px of the bottom.
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 80 && !isFetchingMore && hasMore) {
      void fetchPage(nextSkip)
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative w-9 h-9 rounded-md flex items-center justify-center transition-all duration-75 cursor-pointer"
        style={{
          color: open ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.color = "rgba(255,255,255,0.8)"
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.color = "rgba(255,255,255,0.4)"
        }}
      >
        <Bell size={18} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="absolute top-2 right-2.5 min-w-2 h-2 rounded-md bg-[#e53935] text-white text-[9px] font-extrabold flex items-center justify-center border border-black">
            {/* {formatBadgeCount(unreadCount)} */}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="fixed md:absolute left-0 right-0 md:left-auto md:right-0 top-14 md:top-[calc(100%+10px)] bg-slate border-b border-white/10 md:border md:border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden flex flex-col w-full sm:w-[340px] mx-auto md:mx-0 max-h-[calc(100vh-56px)] md:max-h-[calc(100vh-100px)]"
          style={{
            maxWidth:
              typeof window !== "undefined" && window.innerWidth < 768
                ? "none"
                : NOTIFICATION_LIMITS.DROPDOWN_WIDTH,
          }}
        >
          <DropdownHeader
            unreadCount={unreadCount}
            hasNotifications={notifications.length > 0}
            onClose={toggle}
          />

          {/* Scrollable list */}
          <div
            className="flex-1 overflow-y-auto no-scrollbar"
            style={{ maxHeight: NOTIFICATION_LIMITS.MAX_LIST_HEIGHT }}
            onScroll={handleScroll}
          >
            {notifications.length === 0 && !isFetchingMore ? (
              <EmptyState />
            ) : (
              <>
                {notifications.map((n) => (
                  <NotifRow key={n.id} notif={n} />
                ))}

                {/* Loading spinner */}
                {isFetchingMore && (
                  <div className="flex items-center justify-center py-4">
                    <span className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
                  </div>
                )}

                {/* End of list */}
                {!isFetchingMore && !hasMore && notifications.length > 0 && (
                  <p className="text-center text-xs text-white/20 py-3 select-none">
                    You've reached the end
                  </p>
                )}
              </>
            )}
          </div>

          {/* View all button */}
          <div className="border-t border-white/6 p-2">
            <button
              onClick={() => {
                toggle()
                navigate("/notifications")
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors rounded-md"
            >
              View all notifications
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
