type NewsRequest = {
  query?: string
  category?: string
}

type NewsArticle = {
  title: string
  url: string
  source: string
  publishedAt: string
}

export default async function handler(
  req: { method?: string; query?: NewsRequest },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
    setHeader: (name: string, value: string) => void
  },
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const apiKey = process.env.GNEWS_API_KEY
  const query = typeof req.query?.query === "string" ? req.query.query.trim().slice(0, 160) : ""
  const allowedCategories = [
    "general",
    "world",
    "nation",
    "business",
    "technology",
    "entertainment",
    "sports",
    "science",
    "health",
  ]
  const category =
    req.query?.category && allowedCategories.includes(req.query.category)
      ? req.query.category
      : "general"
  if (!apiKey) return res.status(503).json({ error: "News headlines are not configured" })
  if (!query) return res.status(400).json({ error: "A news query is required" })

  try {
    const url = new URL("https://gnews.io/api/v4/top-headlines")
    url.search = new URLSearchParams({
      category,
      q: query,
      lang: "en",
      country: "br",
      max: "6",
      apikey: apiKey,
    }).toString()
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return res.status(502).json({ error: "News provider request failed" })

    const payload = (await response.json()) as {
      articles?: Array<{
        title?: string
        url?: string
        source?: { name?: string }
        publishedAt?: string
      }>
    }
    const articles: NewsArticle[] = (payload.articles ?? [])
      .filter((article) => article.title && article.url)
      .slice(0, 4)
      .map((article) => ({
        title: article.title!,
        url: article.url!,
        source: article.source?.name ?? "News",
        publishedAt: article.publishedAt ?? "",
      }))

    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600")
    return res.status(200).json({ articles })
  } catch {
    return res.status(502).json({ error: "Could not load news headlines" })
  }
}
