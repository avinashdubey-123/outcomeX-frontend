import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
