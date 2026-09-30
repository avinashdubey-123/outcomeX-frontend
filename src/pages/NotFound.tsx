import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  text-center gap-4">
      <h1 className="text-6xl font-extrabold tracking-tighter">404</h1>
      <div className="space-y-2">
        <h2 className="font-lg font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button asChild className="mt-4">
        <Link to={ROUTES.HOME}>Go back home</Link>
      </Button>
    </div>
  )
}
