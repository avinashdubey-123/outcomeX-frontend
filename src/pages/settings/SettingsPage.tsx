import {
  Bell,
  Check,
  Copy,
  //  Pencil, Shield,
  Trash2,
  User,
  Wallet,
} from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"

import type { RootState } from "@/app/store"
import { useProfileQuery, useUpdateProfileMutation } from "@/features/api/auth/authApi"
import { selectUserData } from "@/features/auth/authSlice"

// ── Sidebar nav items ─────────────────────────────────────────────────────────
type Tab = "profile" | "account" | "notifications"

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Wallet },
  { id: "notifications", label: "Notifications", icon: Bell },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ src }: { src?: string }) => (
  <div className="relative w-25 h-25 shrink-0">
    {src ? (
      <img src={src} alt="avatar" className="w-25 h-25 rounded-full object-cover" />
    ) : (
      <div className="w-25 h-25 rounded-full bg-white/10 flex items-center overflow-hidden justify-center text-white/40 text-2xl font-bold border border-white/10">
        <User size={100} />
      </div>
    )}
    {/* Edit badge */}
    <span className="absolute bottom-15 -right-2 w-6.5 h-6.5 rounded-full bg-primary flex items-center justify-center ">
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-black"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    </span>
  </div>
)

// ── Input field ───────────────────────────────────────────────────────────────
const Field = ({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  suffix,
  maxLength,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  disabled?: boolean
  placeholder?: string
  suffix?: React.ReactNode
  maxLength?: number
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-sm font-semibold text-tab-text">{label}</label>
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-[#111418] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed pr-10"
      />
      {suffix && <span className="absolute right-3 text-white/40 flex items-center">{suffix}</span>}
    </div>
  </div>
)

// ── Profile section ───────────────────────────────────────────────────────────
const ProfileSection = () => {
  const { email, publicAddress } = useSelector(selectUserData)
  const token = useSelector((state: RootState) => state.auth.token)

  const { data: profile, isLoading: profileLoading } = useProfileQuery(undefined, {
    skip: !token,
  })
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()

  // Derived state: show the saved name until the user starts editing.
  // No useEffect needed — avoids the "setState in effect" lint error.
  const savedName = profile?.data.name ?? ""
  const [usernameEdit, setUsernameEdit] = useState<string | null>(null)
  const username = usernameEdit ?? savedName
  const [copied, setCopied] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const displayAddress = publicAddress ?? ""

  const handleCopy = () => {
    if (!displayAddress) return
    navigator.clipboard.writeText(displayAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!username.trim()) return
    setSaveStatus("idle")
    setErrorMsg("")
    try {
      await updateProfile({ name: username.trim() }).unwrap()
      setUsernameEdit(null) // reset override; profile cache will refresh via invalidatesTags
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch {
      setSaveStatus("error")
      setErrorMsg("Failed to update profile. Please try again.")
    }
  }

  const isDirty = username.trim() !== savedName

  return (
    <div>
      <h2 className="font-lg font-semibold text-white mb-4">Profile Settings</h2>

      {/* Avatar */}
      <div className="mb-4">
        <Avatar />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        <Field
          label="Username"
          value={profileLoading ? "" : username}
          onChange={(v) => {
            // strip invalid chars and cap at 20 — same rule as UsernameModal
            const cleaned = v.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20)
            setUsernameEdit(cleaned)
            setSaveStatus("idle")
          }}
          placeholder={profileLoading ? "Loading..." : "Enter a username"}
          disabled={profileLoading}
          maxLength={20}
        />

        <Field
          label="Email address"
          value={email ?? ""}
          disabled
          placeholder="No email connected"
        />

        <Field
          label="Wallet Address"
          value={displayAddress}
          disabled
          suffix={
            <button
              onClick={handleCopy}
              className="hover:text-white transition-colors"
              title="Copy address"
            >
              {copied ? <Check size={15} className="text-primary" /> : <Copy size={15} />}
            </button>
          }
        />

        {/* Social Connections */}
        <div className="flex flex-col gap-3 mt-1">
          <span className="text-sm font-medium text-tab-text">Social Connections</span>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-md  border border-[#334155] font-sm font-medium disabled:text-white/60 disabled:border-[#334155]/50 text-white hover:border-white/25 transition-colors">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Connect X
            </button>

            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 rounded-md   border border-[#334155]  font-sm font-medium disabled:text-white/60 disabled:border-[#334155]/50 text-white hover:border-white/25 transition-colors cursor-default"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4  fill-white/60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Connected Discord
            </button>
          </div>
        </div>

        {/* Feedback */}
        {saveStatus === "success" && (
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            <Check size={12} /> Profile updated successfully
          </p>
        )}
        {saveStatus === "error" && (
          <p className="text-xs text-destructive font-medium">{errorMsg}</p>
        )}

        {/* Save button */}
        <div className="mt-1">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty || !username.trim()}
            className="h-11 w-45 hflex items-center gap-2 px-4 py-2 bg-primary text-black text-sm font-bold rounded-sm hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving && (
              <span className="w-3.5 h-3.5 rounded-full border-2 font-base font-bold border-black/20 border-t-black animate-spin" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Account section ───────────────────────────────────────────────────────────
const AccountSection = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div>
      <h2 className="font-lg font-semibold text-white mb-6">Account Settings</h2>
      <h3 className="text-sm font-semibold text-tab-text mb-2">Two Factor Authentication</h3>

      {/* ── 2FA ── */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between gap-4 p-2.5 rounded-2md bg-white/5 border border-white/10">
          <div className="flex items-start gap-3">
            <div>
              <p className="font-semibold text-white">Enable 2FA</p>
              <p className="font-sm text-white/40 mt-0.5 leading-relaxed">
                Add an extra layer of security to your account using an authenticator app
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            role="switch"
            aria-checked={twoFAEnabled}
            onClick={() => setTwoFAEnabled((v) => !v)}
            className="w-[38px] h-[22px] rounded-full border border-white/10 cursor-pointer relative shrink-0 transition-colors duration-200 bg-[#10d26006] focus:outline-none"
          >
            <div
              className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full shadow-md transition-all duration-200 ${
                twoFAEnabled ? "translate-x-[16px] bg-green-500" : "translate-x-0 bg-white"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="h-px bg-white/10  mb-8"></div>
      {/* ── Danger zone ── */}
      <div className="border border-red-500/20 rounded-2md  p-2.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white">Delete Account</p>
            <p className="font-sm text-white/40 mt-0.5 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
          ) : (
            <div className="shrink-0 flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5  text-white text-xs font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: wire delete account API
                  setShowDeleteConfirm(false)
                }}
                className="px-3 py-1.5 rounded-md bg-red-500/15 border border-red-500/50 text-red-400 text-xs font-bold hover:bg-red-500/25 transition-colors"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile")

  return (
    <div className="container mt-4 md:mt-6 mb-12 md:mb-18.5">
      <div className="mb-7.5">
        <h1 className="font-xxl font-black text-white">Settings</h1>
        <p className="font-sm mt-2.5 text-white ">
          Manage your public presence and account security on the platform.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* ── Sidebar ── */}
        <aside className="w-full max-md:overflow-x-auto no-scrollbar md:w-62.5 shrink-0 flex flex-row md:flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-sm font-medium transition-colors w-full text-left ${
                activeTab === id
                  ? "bg-primary text-black font-bold"
                  : "text-white hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </aside>

        {/* ── Content panel ── */}
        <div className="flex-1 max-w-4xl">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "account" && <AccountSection />}
          {activeTab === "notifications" && (
            <div>
              <h2 className="font-lg font-semibold text-white mb-4">Notification Settings</h2>
              <p className="text-sm text-white/40">Notification settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
