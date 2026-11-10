// Single source of truth for the news endpoint.
// Used by BOTH the Vite dev middleware (vite.config.ts) and the Vercel function (api/news.ts).
// The `_lib` folder is ignored by Vercel's routing, so this is not exposed as an endpoint.

type NewsArticle = {
  title?: string
  link?: string
  source_name?: string
  pubDate?: string
}

type NewsResponse = {
  status?: string
  message?: string
  results?: NewsArticle[] | { message?: string }
}

export type NewsResult = { status: number; body: unknown }

const newsCache = new Map<string, { body: unknown; expiresAt: number }>()

export async function getNews(params: {
  apiKey?: string
  category?: string | null
  query?: string | null
}): Promise<NewsResult> {
  const { apiKey } = params
  const query = params.query?.trim() || undefined
  const uiCategory = params.category ?? "general"

  if (!apiKey) {
    return { status: 503, body: { error: "NEWSDATA_API_KEY is not configured" } }
  }

  let providerCategory: string | null = uiCategory
  let endpoint = "https://newsdata.io/api/1/latest"
  if (uiCategory === "general") {
    providerCategory = "top"
  } else if (uiCategory === "crypto") {
    providerCategory = null
    endpoint = "https://newsdata.io/api/1/crypto"
  }

  const cacheKey = `${uiCategory}:${query ?? ""}`
  const cached = newsCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return { status: 200, body: cached.body }
  }

  try {
    const providerUrl = new URL(endpoint)
    const search = new URLSearchParams()
    search.append("apikey", apiKey)
    search.append("language", "en")
    search.append("removeduplicate", "1")
    if (providerCategory) search.append("category", providerCategory)
    if (query) search.append("q", query)
    providerUrl.search = search.toString()

    const providerResponse = await fetch(providerUrl, { signal: AbortSignal.timeout(8000) })

    if (providerResponse.status === 429) {
      return {
        status: 429,
        body: {
          error: "News API rate limit exceeded",
          message: "Please wait before trying again.",
        },
      }
    }

    const payload = (await providerResponse.json()) as NewsResponse

    if (providerResponse.ok && payload.status === "success") {
      const results = Array.isArray(payload.results) ? payload.results : []
      const body = {
        articles: results.slice(0, 6).map((r) => ({
          title: r.title,
          url: r.link,
          source: r.source_name ?? "News",
          publishedAt: r.pubDate ?? "",
        })),
      }
      newsCache.set(cacheKey, { body, expiresAt: Date.now() + 60_000 })
      return { status: 200, body }
    }

    const errorDetails = !Array.isArray(payload.results) ? payload.results?.message : undefined
    return {
      status: providerResponse.ok ? 200 : providerResponse.status,
      body: {
        error: "NewsData request failed",
        details: errorDetails ?? payload.message ?? "Unknown error",
      },
    }
  } catch {
    return { status: 502, body: { error: "Could not reach News API" } }
  }
}
