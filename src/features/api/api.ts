import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"

import type { RootState } from "@/app/store"

// Same public-path list as secondApi — keep in sync if new public endpoints appear.
const PUBLIC_PATH_PREFIXES = [
  "/v1/user/login",
  "/v1/user/verify-wallet",
  "/v1/user/marketplace",
  "/v1/market-option-group",
  "/v1/user/categories",
]

const isPublicPath = (url: string) => PUBLIC_PATH_PREFIXES.some((prefix) => url.startsWith(prefix))

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

const baseQueryWithAuthGuard: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url
  const token = (api.getState() as RootState).auth.token

  if (!isPublicPath(url) && !token) {
    console.warn(`[api] blocked unauthenticated request to: ${url}`)
    return {
      error: {
        status: 401,
        data: { message: "Authentication required — no token present, request blocked" },
      } as FetchBaseQueryError,
    }
  }

  return rawBaseQuery(args, api, extraOptions)
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ["Users", "Markets", "Categories", "Orders"],
  endpoints: () => ({}),
})
