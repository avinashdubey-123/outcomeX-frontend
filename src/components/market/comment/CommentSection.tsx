import { useState } from "react"

import type { Comment } from "@/mocks/mockComments"
import { MOCK_COMMENTS } from "@/mocks/mockComments"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return "just now"
}

function getInitials(author: string): string {
  if (author.startsWith("0x")) return author.slice(2, 4).toUpperCase()
  return author.slice(0, 2).toUpperCase()
}

function getAvatarColor(author: string): string {
  const colors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#ec4899,#f43f5e)",
    "linear-gradient(135deg,#14b8a6,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#22c55e,#16a34a)",
    "linear-gradient(135deg,#3b82f6,#6366f1)",
  ]
  let hash = 0
  for (const c of author) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return colors[hash % colors.length] as string
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
  author,
  className,
  size,
  style,
}: {
  author: string
  className?: string
  size?: number
  style?: React.CSSProperties
}) => (
  <div
    className={`rounded-md flex items-center justify-center text-white font-bold shrink-0 ${className || ""}`}
    style={{
      width: size,
      height: size,
      background: getAvatarColor(author),
      fontSize: size ? size * 0.35 : undefined,
      ...style,
    }}
  >
    {getInitials(author)}
  </div>
)

// ─── Like button ──────────────────────────────────────────────────────────────

const LikeBtn = ({
  count,
  liked,
  onToggle,
}: {
  count: number
  liked: boolean
  onToggle: () => void
}) => (
  <button
    className={`flex items-center gap-1 font-base font-semibold text-muted-foreground transition-all hover:text-white ${liked ? " text-primary" : ""}`}
    onClick={onToggle}
  >
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
    <span>{count}</span>
  </button>
)

// ─── Single comment ───────────────────────────────────────────────────────────

const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
  const [liked, setLiked] = useState(comment.liked)
  const [likes, setLikes] = useState(comment.likes)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showReplies, setShowReplies] = useState(false)

  const hasReplies = (comment.replies?.length ?? 0) > 0

  const handleLike = () => {
    setLiked((p) => !p)
    setLikes((p) => (liked ? p - 1 : p + 1))
  }

  return (
    <div className={`flex gap-2.5 py-4 last:pb-0 ${depth > 0 ? " pt-3 mt-1" : ""}`}>
      <Avatar
        author={comment.author}
        className={
          depth > 0
            ? "w-8 h-8 text-[11.2px]"
            : "w-8 h-8 text-[11.2px] md:w-[46px] md:h-[46px] md:text-[16.1px]"
        }
      />

      <div className="flex-1 flex flex-col gap-1.5 ">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-base font-bold text-tab-text">{comment.author}</span>
          <span className="font-base text-muted-foreground">{timeAgo(comment.timestamp)}</span>
        </div>

        {/* Content */}
        <p className="font-base text-tab-text">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-0.5">
          <LikeBtn count={likes} liked={liked} onToggle={handleLike} />
          {depth === 0 && (
            <button
              className="font-base font-semibold text-muted-foreground transition-all cursor-pointer"
              onClick={() => setShowReply((p) => !p)}
            >
              Reply
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReply && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              className="width-full bg-slate border rounded-[6px] border-white/8 py-2.5 px-3.5 font-sm text-tab-text outline-none transition-all placeholder:text-tab-text focus:border-white/18 focus:bg-white/6"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="py-1.5 px-3.5  font-base font-semibold text-white rounded-sm transition-all cursor-pointer"
                onClick={() => {
                  setShowReply(false)
                  setReplyText("")
                }}
              >
                Cancel
              </button>
              <button
                className="py-1.5 px-3.5 bg-primary font-base font-bold text-black hover:bg-primary/90s rounded-sm transition-all cursor-pointer"
                disabled={!replyText.trim()}
                onClick={() => {
                  setShowReply(false)
                  setReplyText("")
                }}
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Toggle replies */}
        {hasReplies && (
          <button
            className="flex items-center gap-1 font-base font-semibold text-primary mt-1 transition-all duration-75"
            onClick={() => setShowReplies((p) => !p)}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              style={{
                transform: showReplies ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {showReplies ? "Hide" : `View ${comment.replies!.length}`}{" "}
            {comment.replies!.length === 1 ? "reply" : "replies"}
          </button>
        )}

        {/* Replies */}
        {showReplies &&
          comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
      </div>
    </div>
  )
}

// ─── Comment Section ──────────────────────────────────────────────────────────

interface CommentSectionProps {
  marketId?: string // pass when wiring to real API
}

export const CommentSection = ({ marketId: _marketId }: CommentSectionProps) => {
  // TODO: replace MOCK_COMMENTS with useGetCommentsQuery(marketId) when API is ready
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [text, setText] = useState("")
  const [sortBy, setSortBy] = useState<"top" | "new">("new")

  const sorted = [...comments].sort((a, b) =>
    sortBy === "top"
      ? b.likes - a.likes
      : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const handlePost = () => {
    if (!text.trim()) return
    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: "You",
      avatar: null,
      content: text.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      liked: false,
      replies: [],
    }
    setComments((p) => [newComment, ...p])
    setText("")
  }

  return (
    <div className="flex flex-col gap-5 ">
      {/* Header */}
      <div className="flex items-center">
        <div className=" flex gap-1 bg-white/4 rounded-md p-1  ">
          {(["top", "new"] as const).map((s) => (
            <button
              key={s}
              className={`py-1 px-3.5 font-base font-semibold  rounded-2sm transition-all duration-200 ease-in-out capitalize${sortBy === s ? " bg-primary text-black" : ""}`}
              onClick={() => setSortBy(s)}
            >
              {s === "top" ? "Top" : "New"}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      <div className="flex  gap-2.5">
        {/* <Avatar author="You" size={41} /> */}
        <div className="flex flex-col flex-1 gap-2">
          <input
            className="width-full bg-slate border  rounded-2sm border-white/8 py-2.5 px-3.5 font-sm text-white outline-none transition-all placeholder:text-tab-text focus:border-white/18 focus:bg-white/6 "
            placeholder="Enter comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handlePost()}
          />
          {text.trim() && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="py-1.5 px-3.5 font-base font-semi-bold text-white rounded-sm transition-all hover:bg-white/6 cursor-pointer"
                onClick={() => setText("")}
              >
                Cancel
              </button>
              <button
                className="py-1.5 px-4 font-base font-semibold bg-primary hover:bg-primary/90 text-black rounded-sm transition-all cursor-pointer"
                onClick={handlePost}
              >
                Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="flex flex-col">
        {sorted.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>
    </div>
  )
}
