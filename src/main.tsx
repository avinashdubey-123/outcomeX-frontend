import "./styles/globals.css"
// main.tsx
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/inter/800.css"

import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import { AppProviders } from "@/app/providers"
import { router } from "@/routes"

import MagicProvider from "./features/auth/lib/magic"
import { SocketProvider } from "./features/socket/SocketProvider"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found. Ensure index.html has a div with id 'root'.")
}

createRoot(rootElement).render(
  <MagicProvider>
    <SocketProvider>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </SocketProvider>
  </MagicProvider>,
)
