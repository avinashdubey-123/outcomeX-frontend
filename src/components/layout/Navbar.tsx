import {
  Award,
  BarChart3,
  ChevronDown,
  Film,
  Flame,
  // Globe,
  // Info,
  Link,
  LogOut,
  Medal,
  // Moon,
  Search,
  Settings,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react"
import { type FC, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router"

import { useAppSelector } from "@/app/hooks"
import { LoginModal } from "@/components/auth/LoginModal"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useLogoutMutation } from "@/features/api/auth/authApi"
import { secondApi } from "@/features/api/secondApi"
import {
  loadingFalse,
  loadingTrue,
  logout,
  selectAvailableAmount,
  selectIsAuthChecking,
  selectIsAuthenticated,
  selectLoginMethod,
  selectPortfolioAmount,
  selectUserData,
  selectUserLoading,
} from "@/features/auth/authSlice"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import { useMagic } from "@/features/auth/lib/magic"
import { setNotifications } from "@/features/notifications/notificationSlice"
import {
  clearActiveDropdown,
  selectActiveDropdownId,
  toggleDropdown as toggleGlobalDropdown,
} from "@/features/ui/uiSlice"
import { useDebouncedCallback } from "@/hooks/custom/useDebounce"
import { formatCash, formatPortfolio } from "@/libs/formatCurrency"
import { setMetaMaskLoggedOut } from "@/routes/utils"

import { MetaMaskDepositModal } from "../deposit/MetaMaskDepositModal"
import { NotificationBell } from "../navbar/NotificationBell"
import { AuthLoader } from "../ui/AuthLoader"
import { CategoryTabs } from "./CategoryTabs"

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({
  email,
  address,
  size = "sm",
  square = false,
}: {
  email: string | null
  address: string | null
  size?: "sm" | "md" | "lg"
  square?: boolean
}) => {
  const initials = email
    ? email.slice(0, 2).toUpperCase()
    : address
      ? address.slice(2, 4).toUpperCase()
      : "??"

  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-[12px]",
    lg: "w-14 h-14 text-[16px]",
  }

  return (
    <div
      className={`${sizeClasses[size]} ${square ? "rounded-lg" : "rounded-full"} bg-primary/10 border border-white/5 flex items-center justify-center overflow-hidden shrink-0`}
    >
      <div className="flex items-center justify-center text-white font-bold cursor-pointer">
        {initials}
      </div>
    </div>
  )
}

// ── MenuItem ──────────────────────────────────────────────────────────────────
const MenuItem = ({
  icon,
  label,
  onClick,
  red = false,
  active = false,
  rightIcon,
  className = "",
}: {
  icon?: React.ReactNode
  label: string
  onClick?: () => void
  red?: boolean
  active?: boolean
  rightIcon?: React.ReactNode
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`group cursor-pointer w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold transition-all hover:bg-white/5
      ${red ? "text-red-500" : active ? "text-white bg-white/5" : className ? className : "text-white/60 hover:text-white"}`}
  >
    {icon && <span className="w-5 flex items-center justify-center transition-colors">{icon}</span>}
    <span className="flex-1 text-left">{label}</span>
    {rightIcon && <span className="text-white/30 group-hover:text-white">{rightIcon}</span>}
  </button>
)

// ── DarkModeRow ───────────────────────────────────────────────────────────────
// const DarkModeRow = () => {
//   const [dark, setDark] = useState(true)
//   return (
//     <div className="flex items-center gap-3 px-5 py-3">
//       <span className="text-base w-5 flex items-center justify-center">
//         <Moon size={16} className="text-white/60" />
//       </span>
//       <span className="flex-1 text-sm font-medium text-white/80">Dark mode</span>
//       <button
//         onClick={() => setDark((p) => !p)}
//         className={`relative w-10 h-6 rounded-full transition-colors ${dark ? "bg-primary" : "bg-white/20"}`}
//       >
//         <div
//           className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-4" : "translate-x-0.5"}`}
//         />
//       </button>
//     </div>
//   )
// }

// ── SectionHeader ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-5 pt-4 md:pt-6 pb-2">
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">{title}</span>
  </div>
)

// ── SidebarItem ───────────────────────────────────────────────────────────────
const SidebarItem = ({
  icon,
  label,
  onClick,
  active = false,
  rightContent,
}: {
  icon?: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  rightContent?: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`group cursor-pointer w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium transition-all relative
      ${active ? "text-white bg-primary/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}
  >
    {icon && <span className="w-5 flex items-center justify-center">{icon}</span>}
    <span className="flex-1 text-left">{label}</span>
    {rightContent}
    {active && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-primary rounded-l-full" />
    )}
  </button>
)

// ── Nav icons map ─────────────────────────────────────────────────────────────
const NAV_ICONS: Record<string, React.ReactNode> = {
  Trending: <Flame size={16} />,
  Breaking: <Zap size={16} />,
  New: <Sparkles size={16} />,
  Hollywood: <Film size={16} />,
  Awards: <Award size={16} />,
}

// ─── Dropdown wrapper (kept for profile dropdown) ─────────────────────────────
const Dropdown = ({
  children,
  onClose,
  className = "right-0 top-12 w-64",
}: {
  children: React.ReactNode
  onClose: () => void
  className?: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className={`fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-16 md:top-[calc(100%+8px)] mx-auto md:mx-0 bg-slate border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6),0_0_20px_rgba(0,200,83,0.1)] z-50 py-0 overflow-hidden flex flex-col max-h-[calc(100vh-80px)] ${className}`}
    >
      <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
    </div>
  )
}

const Divider = () => <div className="mx-5 h-px bg-white/5" />

// ── SearchBar ─────────────────────────────────────────────────────────────────
const SearchBar = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`${ROUTES.MarketSearch}?q=${encodeURIComponent(trimmed)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(e as unknown as React.FormEvent)
    if (e.key === "Escape") setQuery("")
  }

  return (
    <form onSubmit={handleSearch} className="hidden xl:flex w-70   max-w-md  relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search markets"
        className="w-full bg-slate border border-progress-bar rounded-2sm py-2.5 pl-8.5 pr-2.5 text-sm leading-4 text-white focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder-[#6B7280] max-w-67.5 "
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors "
        >
          <X size={14} />
        </button>
      )}
    </form>
  )
}

// ── Mobile Search Bar (Toggleable) ───────────────────────────────────────────
const SearchBarMobile = ({ onSearch }: { onSearch: () => void; onClose: () => void }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`${ROUTES.MarketSearch}?q=${encodeURIComponent(trimmed)}`)
    onSearch()
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <form
        onSubmit={handleSearch}
        className="relative flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search markets"
          className="w-full bg-slate border border-progress-bar rounded-2sm py-2.5 pl-8.5 pr-8.5 text-sm leading-4 text-white focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder-[#6B7280]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </form>
    </div>
  )
}

// ── Sidebar Mobile Search Bar ──────────────────────────────────────────────
// const MobileSearchBar = ({ onClose }: { onClose: () => void }) => {
//   const navigate = useNavigate()
//   const [query, setQuery] = useState("")

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault()
//     const trimmed = query.trim()
//     if (!trimmed) return
//     navigate(`${ROUTES.MarketSearch}?q=${encodeURIComponent(trimmed)}`)
//     onClose()
//   }

//   return (
//     <form onSubmit={handleSearch} className="relative w-full">
//       <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search markets"
//         className="w-full bg-slate border border-progress-bar rounded-2sm py-2 px-8.5 text-sm text-white focus:outline-none placeholder-[#6B7280]"
//       />
//       {query && (
//         <button
//           type="button"
//           onClick={() => setQuery("")}
//           className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
//         >
//           <X size={14} />
//         </button>
//       )}
//     </form>
//   )
// }

const NAV_LINKS = [
  { label: "Trending", path: "/markets/trending" },
  { label: "Breaking", path: "/markets/category/Breaking" },
  { label: "New", path: "/markets/new_market" },
  { label: "Hollywood", path: "/markets/category/Hollywood" },
  { label: "Awards", path: "/markets/category/Awards" },
]

// ── Main Navbar ───────────────────────────────────────────────────────────────
export const Navbar: FC = () => {
  const dispatch = useDispatch()
  const { magic } = useMagic()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { email, publicAddress } = useSelector(selectUserData)
  const portfolioAmount = useSelector(selectPortfolioAmount)
  const cashAmount = useSelector(selectAvailableAmount)
  const cashLoading = useAppSelector((state) => state.auth.cashLoading)
  const user = useAppSelector(selectUserData)
  const isAuthChecking = useAppSelector(selectIsAuthChecking)
  const loginMethod = useAppSelector(selectLoginMethod)
  const isUserLoading = useAppSelector(selectUserLoading)

  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const [depositLoading, setDepositLoading] = useState(false)
  const [metamaskDepositOpen, setMetamaskDepositOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const activeDropdown = useAppSelector(selectActiveDropdownId)
  const navigate = useNavigate()
  const location = useLocation()
  const [logoutToBackend] = useLogoutMutation()

  // Close mobile search on navigate or click outside
  useEffect(() => {
    setIsMobileSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileSearchOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      // Find the search elements
      const header = document.querySelector("header")
      const searchForm = header?.querySelector("form")
      const searchToggle = header?.querySelector('button[class*="xl:hidden"]') // The search icon button

      if (
        searchForm &&
        !searchForm.contains(e.target as Node) &&
        searchToggle &&
        !searchToggle.contains(e.target as Node)
      ) {
        setIsMobileSearchOpen(false)
      }
    }

    // Use a small timeout to avoid immediate closure if triggered by the same click
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileSearchOpen])

  // Toggles dropdowns and ensures only one is open
  const toggleDropdown = (name: string) => {
    dispatch(toggleGlobalDropdown(name))
  }

  // Derived sidebar state
  const sidebarOpen = isAuthenticated ? authMenuOpen : menuOpen
  const closeSidebar = () => {
    setAuthMenuOpen(false)
    setMenuOpen(false)
  }

  const displayName = email
    ? email.split("@")[0]
    : publicAddress
      ? `${publicAddress.slice(0, 6)}...${publicAddress.slice(-4)}`
      : "User"

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    dispatch(loadingTrue())
    dispatch(clearActiveDropdown())

    try {
      if (user.loginMethod === LOGIN_METHODS.Email || user.loginMethod === LOGIN_METHODS.Google) {
        try {
          await logoutToBackend().unwrap()
        } catch (err) {
          console.error(err)
        }
        const isLoggedIn = await magic?.user.isLoggedIn()
        if (isLoggedIn) await magic?.user.logout()
      }
      if (user.loginMethod === LOGIN_METHODS.MetaMask) {
        await logoutToBackend().unwrap()
        setMetaMaskLoggedOut()
      }
      dispatch(setNotifications([]))
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem("isSignedIn")
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_method")
      localStorage.removeItem("auth_address")
      dispatch(secondApi.util.resetApiState())
      dispatch(logout())
      dispatch(loadingFalse())
      navigate(ROUTES.HOME)
    }
  }

  // ── Deposit ───────────────────────────────────────────────────────────────
  const handleDeposit = async () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true)
      return
    }
    if (loginMethod === LOGIN_METHODS.MetaMask) {
      setMetamaskDepositOpen(true)
      return
    }
    setDepositLoading(true)
    await magic?.wallet.showUI()
    setDepositLoading(false)
  }

  const handlePortfolioClick = () => {
    if (isAuthenticated) navigate(ROUTES.PORTFOLIO)
    else setIsLoginOpen(true)
  }

  const debouncedHandleDeposit = useDebouncedCallback(handleDeposit, 500)
  const showAuthLoader = isAuthChecking || isUserLoading

  return (
    <>
      <MetaMaskDepositModal
        open={metamaskDepositOpen}
        onClose={() => setMetamaskDepositOpen(false)}
      />

      {/* ── Sidebar Overlay ── */}
      <div
        className={`fixed inset-0 bg-black/60  z-60 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* ── Sidebar Panel ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-[270px] bg-[#121417] border-r border-white/10 z-70 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          {/* Sidebar Logo + Close Button */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <img src="/logo.svg" alt="OutcomeX" className="h-5 w-auto" />
            <button
              onClick={closeSidebar}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X size={22} />
            </button>
          </div>

          {/* Sidebar Search */}

          {/* Portfolio/Cash — only when authenticated & on mobile (hidden md+) */}
          {isAuthenticated && (
            <div className="md:hidden ">
              <Divider />
              <div className="px-5 py-4 flex justify-around">
                <div
                  className="flex flex-col cursor-pointer"
                  // onClick={() => {
                  //   handlePortfolioClick()
                  //   closeSidebar()
                  // }}
                >
                  <span className="text-secondary font-xs uppercase tracking-wide leading-none mb-1">
                    Portfolio
                  </span>
                  {cashLoading ? (
                    <div className="w-[60px] h-5 bg-gray-600/50 animate-pulse rounded" />
                  ) : (
                    <span className="text-primary text-sm font-bold">
                      {formatPortfolio(portfolioAmount)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-secondary font-xs uppercase tracking-wide leading-none mb-1">
                    Cash
                  </span>
                  {cashLoading ? (
                    <div className="w-[60px] h-5 bg-gray-600/50 animate-pulse rounded" />
                  ) : (
                    <span className="text-primary text-sm font-bold">{formatCash(cashAmount)}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <SectionHeader title="Navigation" />
          {NAV_LINKS.map((link) => (
            <SidebarItem
              key={link.path}
              icon={NAV_ICONS[link.label]}
              label={link.label}
              active={location.pathname === link.path}
              onClick={() => {
                navigate(link.path)
                closeSidebar()
              }}
            />
          ))}

          {/* ENGAGEMENT */}
          <SectionHeader title="Engagement" />
          <SidebarItem
            icon={<BarChart3 size={16} className="text-primary" />}
            label="Leaderboard"
            onClick={() => {
              closeSidebar()
              if (isAuthenticated) navigate(`/leaderboard/${user.publicAddress}`)
              else navigate("/leaderboard/guest")
            }}
          />
          <SidebarItem
            icon={<Medal size={16} className="text-primary fill-primary/10" />}
            label="Rewards"
            onClick={() => {
              closeSidebar()
              if (isAuthenticated) navigate(`/rewards/${user.publicAddress}`)
              else navigate("/rewards/guest")
            }}
          />
          {isAuthenticated && (
            <SidebarItem
              icon={<Link size={16} className="text-primary" />}
              label="Portfolio"
              onClick={() => {
                handlePortfolioClick()
                closeSidebar()
              }}
            />
          )}

          {/* SYSTEM */}
          {/* <SectionHeader title="System" />
          <DarkModeRow />
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="w-5 flex items-center justify-center">
              <Globe size={16} className="text-white/60" />
            </span>
            <span className="flex-1 text-sm font-medium text-white/80">Language</span>
            <span className="text-lg">🇺🇸</span>
          </div> */}
        </div>
      </aside>

      {/* ── Mobile Search Backdrop ── */}
      {isMobileSearchOpen && (
        <div
          className="fixed inset-0 top-14 bg-black/70 backdrop-blur-sm z-45 xl:hidden"
          onClick={() => setIsMobileSearchOpen(false)}
        />
      )}

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md font-liberation"
        onClick={() => isMobileSearchOpen && setIsMobileSearchOpen(false)}
      >
        <div className="container relative">
          <div className="flex h-14 items-center justify-between gap-2">
            {/* ── Left: Logo + Desktop Nav ── */}
            <div className="flex-1 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {/* Logo */}
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate("/")
                  setIsMobileSearchOpen(false)
                }}
              >
                <img src="/logo.svg" alt="Polymarket" className="h-4.5 sm:h-5.5 w-auto" />
              </div>

              {/* Desktop nav — xl+ */}
              <nav className="hidden xl:flex items-center gap-6 py-1.5 px-3 text-sm font-bold">
                <button
                  className={`transition-colors cursor-pointer hover:text-white ${location.pathname === "/markets/trending" ? "text-white" : "text-secondary"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate("/markets/trending")
                  }}
                >
                  Trending
                </button>
                <button
                  className={`transition-colors cursor-pointer hover:text-white ${location.pathname === "/markets/category/Breaking" ? "text-white" : "text-secondary"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate("/markets/category/Breaking")
                  }}
                >
                  Breaking
                </button>
                <button
                  className={`transition-colors cursor-pointer hover:text-white ${location.pathname === "/markets/new_market" ? "text-white" : "text-secondary"}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate("/markets/new_market")
                  }}
                >
                  New
                </button>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleDropdown("more")
                    }}
                    className={`flex items-center gap-1 cursor-pointer transition-colors hover:text-white ml-0 ${
                      activeDropdown === "more" ||
                      location.pathname === "/markets/category/Hollywood" ||
                      location.pathname === "/markets/category/Awards"
                        ? "text-white"
                        : "text-secondary"
                    }`}
                  >
                    More{" "}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${activeDropdown === "more" ? "rotate-180" : ""}`}
                    />
                  </button>

                  {activeDropdown === "more" && (
                    <Dropdown
                      onClose={() => dispatch(clearActiveDropdown())}
                      className="w-48 md:left-0 md:mt-2.5 cursor-pointer"
                    >
                      <MenuItem
                        label="Hollywood"
                        active={location.pathname === "/markets/category/Hollywood"}
                        onClick={() => {
                          dispatch(clearActiveDropdown())
                          navigate("/markets/category/Hollywood")
                        }}
                      />
                      <MenuItem
                        label="Awards"
                        active={location.pathname === "/markets/category/Awards"}
                        onClick={() => {
                          dispatch(clearActiveDropdown())
                          navigate("/markets/category/Awards")
                        }}
                      />
                    </Dropdown>
                  )}
                </div>
              </nav>
            </div>

            {/* ── Right: Auth & Icons ── */}
            <div
              className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <SearchBar />

              {/* Mobile Search SVG Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMobileSearchOpen(!isMobileSearchOpen)
                }}
                className="xl:hidden p-2 text-secondary hover:text-white transition-colors"
              >
                <Search size={18} />
              </button>

              {showAuthLoader ? (
                <AuthLoader />
              ) : isAuthenticated ? (
                <>
                  {/* Portfolio + Cash — Desktop only here */}
                  <div className="hidden md:flex xl:flex items-center gap-4 font-base font-bold ">
                    <div
                      className="flex flex-col items-start cursor-pointer"
                      onClick={handlePortfolioClick}
                    >
                      <span className="text-secondary uppercase tracking-wide leading-none">
                        Portfolio
                      </span>
                      {cashLoading ? (
                        <div className="w-[60px] h-5 bg-gray-600/50 animate-pulse rounded mt-[2px]" />
                      ) : (
                        <span className="text-primary font-sm font-bold">
                          {formatPortfolio(portfolioAmount)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col ">
                      <span className="text-secondary uppercase tracking-wide leading-none ">
                        Cash
                      </span>
                      {cashLoading ? (
                        <div className="w-[60px] h-5 bg-gray-600/50 animate-pulse rounded mt-[2px]" />
                      ) : (
                        <span className="text-primary font-sm font-bold">
                          {formatCash(cashAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className={`hidden md:block xl:block w-px bg-vertical-divider h-4 mx-1 `} />

                  {/* Desktop & Mobile Deposit — Responsive Content */}
                  <Button
                    onClick={debouncedHandleDeposit}
                    disabled={isLoginOpen || depositLoading}
                    className="hidden xl:inline-flex bg-primary text-background text-xs font-bold hover:bg-primary/90 px-4 rounded-sm h-8 cursor-pointer"
                  >
                    {depositLoading ? "Opening wallet" : "Deposit"}
                  </Button>

                  {/* Mobile Only Deposit */}
                  <Button
                    onClick={debouncedHandleDeposit}
                    disabled={isLoginOpen || depositLoading}
                    className="xl:hidden bg-primary text-background text-xs font-bold hover:bg-primary/90 px-3 sm:px-4 rounded-sm h-8 cursor-pointer flex items-center justify-center min-w-8"
                  >
                    <span className="hidden sm:inline">
                      {depositLoading ? "Opening" : "Deposit"}
                    </span>
                    <span className="sm:hidden">
                      <Wallet size={18} />
                    </span>
                  </Button>

                  {/* Notifications (Desktop & Mobile) */}
                  <div>
                    <NotificationBell
                      isOpen={activeDropdown === "notifications"}
                      onToggle={() => toggleDropdown("notifications")}
                    />
                  </div>

                  {/* Profile (Desktop & Mobile) */}
                  <div className="relative">
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleDropdown("profile")
                      }}
                      className="cursor-pointer"
                    >
                      <Avatar email={email} address={publicAddress} />
                    </div>

                    {activeDropdown === "profile" && (
                      <Dropdown
                        onClose={() => dispatch(clearActiveDropdown())}
                        className="w-72 right-0 top-11"
                      >
                        <div className="p-5 flex items-start gap-4 relative">
                          <div
                            className="flex items-center gap-4 cursor-pointer group flex-1"
                            onClick={() => {
                              dispatch(clearActiveDropdown())
                              navigate(`/profile/${user.publicAddress}`)
                            }}
                          >
                            <Avatar email={email} address={publicAddress} size="lg" square />
                            <div className="flex flex-col min-w-0">
                              <span className="font-md font-bold text-white truncate capitalize">
                                {displayName}
                              </span>
                              <div className="flex gap-4 mt-2 items-center">
                                <div className="flex flex-col">
                                  <span className="font-xs font-bold text-white/40 uppercase tracking-widest leading-none mb-1">
                                    Rank
                                  </span>
                                  <span className="font-base font-extrabold text-primary leading-none">
                                    #412
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-xs font-bold text-white/40 uppercase tracking-widest leading-none mb-1">
                                    Win Rate
                                  </span>
                                  <span className="font-base font-extrabold text-primary leading-none">
                                    78.4%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Divider />
                        <div className="py-2">
                          <MenuItem
                            icon={<BarChart3 size={20} className="text-primary" />}
                            label="Leaderboard"
                            onClick={() => {
                              dispatch(clearActiveDropdown())
                              navigate(`/leaderboard/${user.publicAddress}`)
                            }}
                          />
                          <MenuItem
                            icon={<Medal size={20} className="text-primary fill-primary/10" />}
                            label="Rewards"
                            onClick={() => {
                              dispatch(clearActiveDropdown())
                              navigate(`/rewards/${user.publicAddress}`)
                            }}
                          />
                        </div>
                        <Divider />
                        <div className="py-2">
                          <MenuItem
                            icon={<Settings size={20} className="text-primary" />}
                            label="Settings"
                            onClick={() => {
                              dispatch(clearActiveDropdown())
                              navigate(ROUTES.SETTINGS)
                            }}
                          />
                        </div>
                        <Divider />
                        <div className="py-2 ">
                          <MenuItem
                            icon={<LogOut size={20} className="text-no/70" />}
                            label="Logout"
                            onClick={handleLogout}
                            className="text-no/70 hover:text-no"
                          />
                        </div>
                      </Dropdown>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Guest Logic */}
                  <Button
                    variant="default"
                    className="hidden xl:inline-flex bg-accent text-white font-base font-bold text-xs hover:bg-accent/90 px-3 sm:px-4 rounded-sm sm:h-8 h-7  cursor-pointer"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="default"
                    className="hidden xl:inline-flex bg-accent text-primary font-bold border-black border text-xs hover:bg-accent/90 px-3 sm:px-4 rounded-sm sm:h-8 h-7 cursor-pointer"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Sign Up
                  </Button>

                  {/* Mobile Guest Buttons */}
                  <div className="xl:hidden flex items-center gap-1.5 ">
                    <Button
                      variant="default"
                      className="bg-accent text-white font-bold text-[10px] hover:bg-accent/90 h-7 px-2 rounded-sm cursor-pointer"
                      onClick={() => setIsLoginOpen(true)}
                    >
                      Log In
                    </Button>
                    <Button
                      variant="default"
                      className="bg-primary text-background font-bold text-[10px] h-7 px-2 rounded-sm cursor-pointer"
                      onClick={() => setIsLoginOpen(true)}
                    >
                      Sign Up
                    </Button>
                  </div>

                  {!isAuthenticated && (
                    <div className="hidden xl:block relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDropdown("loggedOutMenu")
                        }}
                        className="flex items-center gap-1 text-secondary transition-colors hover:text-white ml-2"
                      >
                        <HamburgerIcon />
                      </button>

                      {activeDropdown === "loggedOutMenu" && (
                        <Dropdown
                          onClose={() => dispatch(clearActiveDropdown())}
                          className="w-48 md:right-0 md:left-auto md:mt-2.5"
                        >
                          <MenuItem
                            icon={<BarChart3 size={20} className="text-primary" />}
                            label="Leaderboard"
                            onClick={() => {
                              dispatch(clearActiveDropdown())
                              navigate("/leaderboard/guest")
                            }}
                          />
                          <MenuItem
                            icon={<Medal size={20} className="text-primary fill-primary/10" />}
                            label="Rewards"
                            onClick={() => {
                              dispatch(clearActiveDropdown())
                              navigate("/rewards/guest")
                            }}
                          />
                        </Dropdown>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Mobile Hamburger — Far Right */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden text-muted-foreground hover:text-white h-9 w-9 flex items-center justify-center p-0 cursor-pointer ml-1"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch(clearActiveDropdown())
                  if (isAuthenticated) setAuthMenuOpen((p) => !p)
                  else setMenuOpen((p) => !p)
                }}
              >
                {sidebarOpen ? <X className="size-5" /> : <HamburgerIcon />}
              </Button>
            </div>
          </div>

          {/* ── Mobile Search Input Area ── */}
          {isMobileSearchOpen && (
            <div
              className="xl:hidden px-4 pb-4 animate-in slide-in-from-top duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <SearchBarMobile
                onSearch={() => setIsMobileSearchOpen(false)}
                onClose={() => setIsMobileSearchOpen(false)}
              />
            </div>
          )}
        </div>
      </header>

      <CategoryTabs />
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  )
}

// ── Hamburger ─────────────────────────────────────────────────────────────────
const HamburgerIcon = () => <img src="/icons/hamburger.svg" alt="Menu" className="size-4" />
