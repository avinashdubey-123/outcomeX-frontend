import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"

import { clearActiveDropdown, selectActiveDropdownId, toggleDropdown } from "@/features/ui/uiSlice"

/**
 * A hook to manage a dropdown that participates in the global auto-close system.
 *
 * @param id Unique identifier for the dropdown.
 * @returns { isOpen, toggle, close, ref }
 */
export const useDropdown = (id: string) => {
  const dispatch = useDispatch()
  const activeDropdownId = useSelector(selectActiveDropdownId)
  const isOpen = activeDropdownId === id
  const ref = useRef<HTMLDivElement>(null)

  const toggle = () => {
    dispatch(toggleDropdown(id))
  }

  const close = () => {
    if (isOpen) {
      dispatch(clearActiveDropdown())
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && ref.current && !ref.current.contains(event.target as Node)) {
        dispatch(clearActiveDropdown())
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, dispatch])

  return { isOpen, toggle, close, ref }
}
