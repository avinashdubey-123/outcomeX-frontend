// mockComments.ts
// Replace with real API data when backend is ready

export interface Comment {
  id: string
  author: string // wallet address or display name
  avatar: string | null // null = use initials fallback
  content: string
  timestamp: string // ISO string
  likes: number
  liked: boolean // has current user liked it
  replies?: Comment[]
}

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "0x4f3a...b82c",
    avatar: null,
    content:
      "Trump is almost certainly going to win this. The polling trend has been consistently in his favour for the past 3 weeks.",
    timestamp: "2026-03-10T08:22:00.000Z",
    likes: 24,
    liked: false,
    replies: [
      {
        id: "c1r1",
        author: "cryptobull.eth",
        avatar: null,
        content: "Agreed, but don't sleep on the late deciders. They swung hard in 2020.",
        timestamp: "2026-03-10T09:05:00.000Z",
        likes: 8,
        liked: false,
      },
      {
        id: "c1r2",
        author: "0xa1bc...99f2",
        avatar: null,
        content: "Polls have been wrong before. Still holding my NO position.",
        timestamp: "2026-03-10T09:44:00.000Z",
        likes: 3,
        liked: false,
      },
    ],
  },
  {
    id: "c2",
    author: "degentrader.eth",
    avatar: null,
    content: "Bought 500 YES at 62¢. If this resolves correctly I'm up $190. Let's go 🚀",
    timestamp: "2026-03-10T10:15:00.000Z",
    likes: 41,
    liked: false,
    replies: [],
  },
  {
    id: "c3",
    author: "0x99de...1a4b",
    avatar: null,
    content:
      "The NO side is underpriced IMO. Market is not accounting for the third-party candidate splitting votes.",
    timestamp: "2026-03-10T11:30:00.000Z",
    likes: 17,
    liked: false,
    replies: [
      {
        id: "c3r1",
        author: "polywhale",
        avatar: null,
        content: "Which third party? No one on the ballot has significant polling.",
        timestamp: "2026-03-10T12:00:00.000Z",
        likes: 5,
        liked: false,
      },
    ],
  },
  {
    id: "c4",
    author: "marketsage",
    avatar: null,
    content:
      "Historical base rate for incumbents in this scenario is 71%. Current price of 65¢ is still EV positive for YES buyers.",
    timestamp: "2026-03-11T07:10:00.000Z",
    likes: 56,
    liked: false,
    replies: [],
  },
  {
    id: "c5",
    author: "0x12bc...ff01",
    avatar: null,
    content: "Anyone else think this resolves early? The criteria seem pretty clear cut.",
    timestamp: "2026-03-11T14:22:00.000Z",
    likes: 9,
    liked: false,
    replies: [],
  },
]
