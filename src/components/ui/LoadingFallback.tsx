export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8 min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
