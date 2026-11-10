import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig, loadEnv, type Plugin } from "vite"

import { getNews } from "./api/_lib/newsCore"

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
        const { status, body } = await getNews({
          apiKey:
            process.env.NEWSDATA_API_KEY ??
            loadEnv(server.config.mode, process.cwd(), "").NEWSDATA_API_KEY,
          category: requestUrl.searchParams.get("category"),
          query: requestUrl.searchParams.get("query"),
        })
        response.statusCode = status
        response.setHeader("Content-Type", "application/json")
        response.end(JSON.stringify(body))
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
