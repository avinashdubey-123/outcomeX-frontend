import { type FC, type ReactNode, useState } from "react"

import { useInView } from "@/hooks/ui/useInView"

interface LazyMountProps {
  children: ReactNode
  // Shown until the section is near the viewport. Give it roughly the real height so the page
  // doesn't jump when the content mounts.
  placeholder: ReactNode
  rootMargin?: string
}

// Mounts `children` only once the section is about to be seen, and keeps it mounted after.
// Keeps offscreen sections from fetching data, subscribing to sockets or running animations.
export const LazyMount: FC<LazyMountProps> = ({ children, placeholder, rootMargin = "600px" }) => {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const inView = useInView(el, rootMargin)
  return (
    <div ref={setEl}>
      {inView ? <div className="animate-in fade-in duration-500">{children}</div> : placeholder}
    </div>
  )
}
