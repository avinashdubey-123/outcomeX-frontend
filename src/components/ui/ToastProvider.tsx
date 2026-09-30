import { AlertCircle, CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react"
import { type FC } from "react"
import { Toaster } from "sonner"

export const ToastProvider: FC = () => (
  <Toaster
    richColors
    theme="dark"
    position="top-right"
    gap={16}
    offset={{ top: 20, right: 20 }}
    visibleToasts={5}
    expand={true}
    toastOptions={{
      classNames: {
        toast: "app-toast-notification",
        title: "app-toast-title",
        description: "app-toast-description",
        closeButton: "app-toast-close",
        icon: "app-toast-icon",
      },
      duration: 4000,
    }}
    icons={{
      success: <CheckCircle2 className="app-toast-icon-svg" />,
      error: <XCircle className="app-toast-icon-svg" />,
      info: <Info className="app-toast-icon-svg" />,
      warning: <AlertCircle className="app-toast-icon-svg" />,
      loading: <Loader2 className="app-toast-icon-svg animate-spin" />,
      close: <X className="app-toast-icon-svg" />,
    }}
  />
)
