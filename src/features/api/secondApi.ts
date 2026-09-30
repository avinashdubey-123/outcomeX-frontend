import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"

import type { RootState } from "@/app/store"

// ── Public endpoint prefixes — these do NOT require a token ──────────────────
// Every other path will be blocked at the baseQuery level if no token is
// present, so the request never reaches the network and the query enters
// isError state with a clear message instead of silently dying on a 401.
const PUBLIC_PATH_PREFIXES = [
  "/v1/user/login", // login, login-wallet, logout
  "/v1/user/verify-wallet", // MetaMask wallet verification
  "/v1/user/marketplace", // public market listing + fetchSpecific
  "/v1/market-option-group", // price, price-history (public read)
  "/v1/user/categories", // category list
]

const isPublicPath = (url: string) => PUBLIC_PATH_PREFIXES.some((prefix) => url.startsWith(prefix))

// ── Raw RTK fetchBaseQuery ────────────────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL_SECOND,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set("Authorization", `${token}`)
    }
    return headers
  },
})

// ── Auth-guard wrapper ────────────────────────────────────────────────────────
// If no token and the endpoint is not public, return an error immediately.
// This prevents:
//   • Silent 401 responses that RTK Query caches as a failed query and
//     never retries automatically
//   • Unnecessary network traffic before auth is ready
//
// NOTE: For queries that require auth, always use `skip: !token` at the
// call site so RTK Query will automatically re-fire them when the token
// arrives (skip going false triggers a fresh fetch).
const baseQueryWithAuthGuard: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url
  const token = (api.getState() as RootState).auth.token

  if (!isPublicPath(url) && !token) {
    console.warn(`[secondApi] blocked unauthenticated request to: ${url}`)
    return {
      error: {
        status: 401,
        data: { message: "Authentication required — no token present, request blocked" },
      } as FetchBaseQueryError,
    }
  }

  return rawBaseQuery(args, api, extraOptions)
}

// ── API instance ──────────────────────────────────────────────────────────────
export const secondApi = createApi({
  reducerPath: "secondApi",
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ["Markets", "Orders", "Profile"],
  endpoints: () => ({}),
})
