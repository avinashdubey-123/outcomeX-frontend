// src/hooks/useDebounce.ts

import { useCallback, useRef } from "react"

export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 500,
): ((...args: Parameters<T>) => void) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      // clear any pending call
      if (timerRef.current) clearTimeout(timerRef.current)

      // schedule new call
      timerRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    },
    [fn, delay],
  )
}
