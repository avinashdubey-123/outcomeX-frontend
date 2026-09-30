// src/pages/notifications/NotificationsPage.tsx

import { Bell, CheckCheck, Filter, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import type { RootState } from "@/app/store"
import {
  useDeleteNotificationsMutation,
  useLazyGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} from "@/features/api/notifications/notificationApi"
import {
  NOTIFICATION_TYPE_CONFIG,
  NOTIFICATION_TYPES,
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

const LIMIT = 20

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Type icon ─────────────────────────────────────────────────────────────────
const TypeIcon = ({ type }: { type: Notification["type"] }) => {
  const config = NOTIFICATION_TYPE_CONFIG[type]
  return (
    <div
      className="w-10 h-10 rounded-full font-sm font-bold flex items-center justify-center shrink-0"
      style={{ background: config.bg, color: config.color }}
    >
      {config.icon}
    </div>
  )
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
type Filter = "all" | "unread"

const FilterTabs = ({
  active,
  // unreadCount,
  onChange,
}: {
  active: Filter
  // unreadCount: number
  onChange: (f: Filter) => void
}) => (
  <div className="flex gap-2 p-1 rounded-2md max-w-fit border border-white/10 m-0 bg-white/5">
    {(["all", "unread"] as Filter[]).map((f) => (
      <button
        key={f}
        onClick={() => onChange(f)}
        className={`px-3 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer transition-all capitalize duration-120 hover:text-[#e2e8f0] 
          ${
            active === f
              ? "bg-primary text-black shadow-[0px_4px_6px_-4px_rgba(16,210,96,0.3),0px_10px_15px_-3px_rgba(16,210,96,0.3)]"
              : "bg-transparent text-white/60"
          }`}
      >
        {f}
        {/* {f === "unread" && unreadCount > 0 && (
          <span
            className={`ml-1.5 text-xs font-bold transition-colors ${active === f ? "text-black/80" : "text-primary"
              }`}
          >
            ({unreadCount})
          </span>
        )} */}
      </button>
    ))}
  </div>
)

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ filter }: { filter: Filter }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
      <Bell size={22} color="rgba(255,255,255,0.6)" />
    </div>
    <p className="text-sm font-semibold text-white/60">
      {filter === "unread" ? "No unread notifications" : "No notifications"}
    </p>
    <p className="text-xs text-white/30">
      {filter === "unread" ? "You're all caught up!" : "New notifications will appear here."}
    </p>
  </div>
)

// ── Notification row ──────────────────────────────────────────────────────────
const NotifRow = ({ notif }: { notif: Notification }) => {
  const dispatch = useDispatch()
  const [deleteNotifications] = useDeleteNotificationsMutation()
  const [markNotificationsRead] = useMarkNotificationsReadMutation()

  return (
    <div
      onClick={() => {
        if (!notif.read) {
          void markNotificationsRead({ notificationRecipientId: notif.id })
          dispatch(markRead(notif.id))
        }
      }}
      className="flex gap-4 px-5 py-4 border-b border-white/5 cursor-pointer transition-colors duration-150 group relative"
      style={{ background: notif.read ? "transparent" : "rgba(16,210,96,0.04)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = notif.read ? "transparent" : "rgba(16,210,96,0.04)")
      }
    >
      {/* Unread indicator */}
      {!notif.read && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full bg-[#10D260]" />
      )}

      <TypeIcon type={notif.type} />

      <div className="flex-1 min-w-0">
        <div
          className="text-sm mb-0.5"
          style={{
            fontWeight: notif.read ? 500 : 700,
            color: notif.read ? "rgba(255,255,255,0.75)" : "#ffffff",
          }}
        >
          {notif.title}
        </div>
        <p className="text-xs text-white/55 leading-relaxed line-clamp-2">{notif.message}</p>
        <span className="text-xs text-white/25 mt-1 block">{timeAgo(notif.timestamp)}</span>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          void deleteNotifications({ notificationRecipientId: notif.id })
          dispatch(removeNotification(notif.id))
        }}
        className="shrink-0 self-start p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-150 text-white/25 hover:text-white/70 hover:bg-white/8"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
const RowSkeleton = () => (
  <div className="flex gap-4 px-5 py-4 border-b border-white/5 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-white/8 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-white/8 rounded-full w-2/5" />
      <div className="h-3 bg-white/5 rounded-full w-4/5" />
      <div className="h-2.5 bg-white/5 rounded-full w-1/4" />
    </div>
  </div>
)

// ── Type filter pills ─────────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: "All types", value: null },
  { label: "Fill", value: NOTIFICATION_TYPES.FILL },
  { label: "System", value: NOTIFICATION_TYPES.SYSTEM },
  { label: "Order", value: NOTIFICATION_TYPES.ORDER },
  { label: "Trade", value: NOTIFICATION_TYPES.TRADE },
] as const

type TypeFilter = (typeof TYPE_FILTERS)[number]["value"]

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const dispatch = useDispatch()

  const token = useSelector((state: RootState) => state.auth.token)
  const notifications = useSelector(selectNotifications)
  const unreadCount = useSelector(selectUnreadCount)

  const [filter, setFilter] = useState<Filter>("all")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(null)
  const {
    isOpen: isFilterOpen,
    toggle: toggleFilter,
    ref: filterRef,
  } = useDropdown("notif-type-filters")
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [nextSkip, setNextSkip] = useState(0)

  const [triggerFetch] = useLazyGetNotificationsQuery()
  const [deleteNotifications] = useDeleteNotificationsMutation()
  const [markNotificationsRead] = useMarkNotificationsReadMutation()

  const fetchPage = useCallback(
    async (pageSkip: number) => {
      if (!token) return
      setIsFetchingMore(true)
      try {
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
        setIsInitialLoad(false)
      }
    },
    [token, triggerFetch, dispatch],
  )

  // Initial fetch on mount
  useEffect(() => {
    if (token) {
      void fetchPage(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 120 && !isFetchingMore && hasMore) {
      void fetchPage(nextSkip)
    }
  }

  // Derived filtered list
  const displayed = notifications.filter((n) => {
    const readOk = filter === "all" || !n.read
    const typeOk = typeFilter === null || n.type === typeFilter
    return readOk && typeOk
  })

  return (
    <div className="container mt-4 md:mt-6 mb-12 md:mb-18.5 text-white">
      <div className=" ">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-2xl font-bold text-white mb-1.5 tracking-tighter leading-tight">
              Notifications
            </h1>
            <p className="font-default text-white/60">
              Manage your account activity and trade updates
            </p>
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={toggleFilter}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2md border transition-all duration-200 ${
                isFilterOpen
                  ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "bg-white/5 border-white/8 text-white hover:text-white hover:bg-white/8 hover:border-white/15"
              }`}
            >
              <Filter size={15} strokeWidth={2.5} />
              <span className="font-sm font-medium text-white tracking-tight">Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-3 z-10  bg-slate backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-200  overflow-y-scroll no-scrollbar ">
                <div className="text-sm font-bold text-primary/80 border-b border-b-white/10 mb-0.5   py-3.5 px-3">
                  Filter by type
                </div>
                <div className="flex flex-col gap-1">
                  {TYPE_FILTERS.map(({ label, value }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setTypeFilter(value)
                        toggleFilter()
                      }}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200  ${
                        typeFilter === value
                          ? "bg-primary text-black shadow-[inset_0_0_12px_rgba(16,210,96,0.05)]"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{label}</span>
                      {typeFilter === value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,210,96,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <FilterTabs
            active={filter}
            //  unreadCount={unreadCount}
            onChange={setFilter}
          />

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  void markNotificationsRead()
                  dispatch(markAllRead())
                }}
                className="flex items-center gap-1.5 font-sm font-semibold px-3 py-1.5 bg-white/5 rounded-md text-white/60 hover:text-white hover:bg-white/6 transition-all border border-white/8"
              >
                <CheckCheck size={12} />
                <span className="max-sm:hidden">Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  void deleteNotifications()
                  dispatch(clearAll())
                }}
                className="flex items-center gap-1.5 bg-white/5 font-sm font-semibold px-3 py-1.5 rounded-md text-white/60 hover:text-red-400 hover:bg-red-500/8 transition-all border border-white/8"
              >
                <Trash2 size={12} />
                <span className="max-sm:hidden">Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* ─ Notification list ─ */}
        <div className="rounded-2xl border border-white/5 overflow-hidden bg-slate/30  shadow-2xl">
          {/* Initial skeleton */}
          {isInitialLoad && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </>
          )}

          {/* Empty state */}
          {!isInitialLoad && displayed.length === 0 && <EmptyState filter={filter} />}

          {/* Rows */}
          {!isInitialLoad && (
            <div
              onScroll={handleScroll}
              className="divide-y divide-white/5 max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar"
            >
              {displayed.map((n) => (
                <NotifRow key={n.id} notif={n} />
              ))}

              {/* Fetch-more spinner */}
              {isFetchingMore && (
                <div className="flex items-center justify-center py-6">
                  <span className="w-6 h-6 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
                </div>
              )}

              {/* End of list */}
              {!isFetchingMore && !hasMore && displayed.length > 0 && (
                <div className="py-6 flex flex-col items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <p className="text-xs font-medium text-white/20 select-none">
                    You've reached the end
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
