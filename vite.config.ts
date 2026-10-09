import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig, loadEnv, type Plugin } from "vite"

const newsCache = new Map<string, { data: string; expiresAt: number }>()

function localNewsApi(): Plugin {
  return {
    name: "local-news-api",
    configureServer(server) {
      server.middlewares.use("/api/news", async (request, response) => {
        if (request.method !== "GET") {
          response.statusCode = 405
          response.end(JSON.stringify({ error: "Method not allowed" }))
          return
        }
        const requestUrl = new URL(request.url ?? "/", "http://localhost")
        const apiKey =
          process.env.NEWSDATA_API_KEY ??
          loadEnv(server.config.mode, process.cwd(), "").NEWSDATA_API_KEY

        const query = requestUrl.searchParams.get("query")?.trim()
        const uiCategory = requestUrl.searchParams.get("category") ?? "general"

        if (!apiKey) {
          response.statusCode = 503
          response.setHeader("Content-Type", "application/json")
          response.end(
            JSON.stringify({ error: "NEWSDATA_API_KEY is not configured for the Vite server" }),
          )
          return
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
          response.statusCode = 200
          response.setHeader("Content-Type", "application/json")
          response.end(cached.data)
          return
        }

        try {
          const providerUrl = new URL(endpoint)
          const params = new URLSearchParams()
          params.append("apikey", apiKey)
          params.append("language", "en")
          params.append("removeduplicate", "1")
          if (providerCategory) {
            params.append("category", providerCategory)
          }
          if (query) {
            params.append("q", query)
          }
          providerUrl.search = params.toString()

          const providerResponse = await fetch(providerUrl, { signal: AbortSignal.timeout(8000) })

          if (providerResponse.status === 429) {
            response.statusCode = 429
            response.setHeader("Content-Type", "application/json")
            response.end(
              JSON.stringify({
                error: "News API rate limit exceeded",
                message: "Please wait before trying again.",
              }),
            )
            return
          }

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

          const payload = (await providerResponse.json()) as NewsResponse
          response.statusCode = providerResponse.ok ? 200 : providerResponse.status
          response.setHeader("Content-Type", "application/json")

          let responseData
          if (providerResponse.ok && payload.status === "success") {
            const results = (Array.isArray(payload.results) ? payload.results : []) as NewsArticle[]
            responseData = JSON.stringify({
              articles: results.slice(0, 6).map((r) => ({
                title: r.title,
                url: r.link,
                source: r.source_name ?? "News",
                publishedAt: r.pubDate ?? "",
              })),
            })
            newsCache.set(cacheKey, { data: responseData, expiresAt: Date.now() + 60_000 })
          } else {
            const errorDetails = !Array.isArray(payload.results)
              ? payload.results?.message
              : undefined
            responseData = JSON.stringify({
              error: "NewsData request failed",
              details: errorDetails ?? payload.message ?? "Unknown error",
            })
          }

          response.end(responseData)
        } catch {
          response.statusCode = 502
          response.setHeader("Content-Type", "application/json")
          response.end(JSON.stringify({ error: "Could not reach News API" }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localNewsApi()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    // Allow requests from any host (required for ngrok / reverse-proxy tunnels).
    // In Vite 4.x, `true` means "allow all hosts" (equivalent to "all" in Vite 5+).
    allowedHosts: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor"
          }
          if (
            id.includes("node_modules/@reduxjs/toolkit/") ||
            id.includes("node_modules/react-redux/")
          ) {
            return "redux"
          }
        },
      },
    },
  },
})
