import { useEffect, useState } from "react"

// True once the element has come within `rootMargin` of the viewport, and stays true.
// Lets a list of cards fetch their own data only when they are about to be seen.
// Pass the element via state (a ref callback's setState) so the effect re-runs when it mounts.
export const useInView = (element: Element | null, rootMargin = "200px"): boolean => {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView || !element) return
    // No IntersectionObserver (very old browsers / some test envs): just load everything.
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setInView(true), 0)
      return () => clearTimeout(t)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, inView, rootMargin])

  return inView
}
