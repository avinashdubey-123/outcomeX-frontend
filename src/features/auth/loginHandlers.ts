/**
 * loginHandlers.ts
 *
 * Pure async functions for user-initiated login actions.
 * Sibling to authChecks.ts (which handles session *restore* on refresh).
 * These handle active login attempts triggered by user button clicks.
 *
 * Each function receives its dependencies as parameters so it can be called
 * from any component without coupling to component internals.
 */

import { getAddress } from "ethers"
import { toast } from "sonner"

import type { AppDispatch } from "@/app/store"
import { loadingFalse, loadingTrue, login, setTempToken } from "@/features/auth/authSlice"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import type { Magic } from "@/features/auth/lib/magic"
import { clearMetaMaskLoggedOut } from "@/routes/utils"

import { switchToAmoy } from "./switchChain"

// ---------------------------------------------------------------------------
// Shared dependency types (minimal — only what we actually use)
// ---------------------------------------------------------------------------

type LoginFn = (args: {
  didToken: string
  deviceToken?: string | null
}) => Promise<{ data: { data: { token: string } } }>
type LoginWalletFn = (args: { publicAddress: string }) => Promise<{
  data: { data: { nonce: string; token: string } }
}>

//made device token an optional thing.
type VerifyWalletFn = (args: { signature: string; deviceToken?: string | null }) => Promise<{
  data: { data: { token: string } }
}>

// ---------------------------------------------------------------------------
// Email OTP login via Magic
// ---------------------------------------------------------------------------

export async function handleEmailLogin({
  email,
  magic,
  dispatch,
  loginToBackend,
  onSuccess,
  onError,
  deviceToken,
}: {
  email: string
  magic: Magic | null
  dispatch: AppDispatch
  loginToBackend: LoginFn
  onSuccess: () => void
  onError: () => void
  deviceToken: string | null | undefined
}): Promise<void> {
  if (!email || !magic) return

  dispatch(loadingTrue())
  try {
    await magic.auth.loginWithEmailOTP({ email })

    const userInfo = await magic.user.getInfo()
    const magicToken = await magic.user.getIdToken()

    // RTK Query's unwrap() automatically throws if the request fails (like 400 Bad Request)
    // We pass "none" as a fallback because the backend strictly requires a string.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultBackend = await (loginToBackend as any)({
      didToken: magicToken,
      deviceToken: deviceToken || "none",
    }).unwrap()

    dispatch(
      login({
        email: userInfo.email ?? null,
        publicAddress: userInfo.wallets?.ethereum?.publicAddress ?? null,
        loading: false,
        loginMethod: LOGIN_METHODS.Email,
        token: resultBackend.data.token,
      }),
    )
    localStorage.setItem("isSignedIn", "true")
    localStorage.setItem("auth_token", resultBackend.data.token)
    localStorage.setItem("auth_method", LOGIN_METHODS.Email)

    onSuccess()
  } catch (err) {
    console.error("Email login failed:", err)
    toast.error("Email login failed", { description: `${err}` })
    onError()
  } finally {
    dispatch(loadingFalse())
  }
}

// ---------------------------------------------------------------------------
// Google OAuth via Magic (redirect-based — nothing runs after loginWithRedirect)
// ---------------------------------------------------------------------------

export async function handleGoogleLogin({
  magic,
  dispatch,
  onError,
}: {
  magic: Magic | null
  dispatch: AppDispatch
  onError: () => void
}): Promise<void> {
  if (!magic) return

  dispatch(loadingTrue())
  try {
    await magic.oauth2.loginWithRedirect({
      provider: "google",
      redirectURI: import.meta.env.VITE_REDIRECT_URL,
    })
    // Page navigates away — nothing past this line runs
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    dispatch(loadingFalse())
    if (e?.code === -32603 || e?.message?.includes("User denied")) {
      onError()
      return
    }
    console.error("Google login failed:", err)
    toast.error("Google login failed", { description: `${err}` })
    onError()
  }
}

// ---------------------------------------------------------------------------
// MetaMask wallet login (challenge-response signature flow)
// ---------------------------------------------------------------------------

import { setActiveInjectedProvider } from "@/features/auth/lib/injectedProvider"
import type { EIP6963ProviderDetail } from "@/hooks/useEIP6963"

export async function handleInjectedLogin({
  wallet,
  dispatch,
  loginWallet,
  verifyWallet,
  onSuccess,
  onError,
  deviceToken,
}: {
  wallet: EIP6963ProviderDetail
  dispatch: AppDispatch
  loginWallet: LoginWalletFn
  verifyWallet: VerifyWalletFn
  onSuccess: () => void
  onError: () => void
  deviceToken: string | null | undefined
}): Promise<void> {
  const provider = wallet.provider

  dispatch(loadingTrue())

  try {
    // switching the chain to amoy
    await switchToAmoy(provider)
    // Step 1: get wallet address
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as unknown as string[]
    let publicAddress = accounts[0]
    publicAddress = getAddress(publicAddress as string)
    console.log("public address:", publicAddress)
    // Step 2: get nonce + temp token from backend
    dispatch(setTempToken({ token: null }))
    const {
      data: { nonce, token: tempToken },
    } = await loginWallet({ publicAddress: publicAddress as string }).then((r) => r.data)
    dispatch(setTempToken({ token: tempToken }))

    // Step 3: ask MetaMask to sign the nonce
    const signature = (await provider.request({
      method: "personal_sign",
      params: [nonce, publicAddress as string],
    })) as unknown as string

    // Step 4: verify signature with backend
    // Only include deviceToken in the payload when it is available
    // Only include deviceToken in the payload when it is available, or fallback to "none"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (verifyWallet as any)({
      signature,
      deviceToken: deviceToken || "none",
    }).unwrap()

    // Step 5: store session
    clearMetaMaskLoggedOut()
    setActiveInjectedProvider(provider)
    dispatch(
      login({
        email: null,
        publicAddress,
        loading: false,
        loginMethod: LOGIN_METHODS.MetaMask, // Keeping this enum value for backwards compat
        token: result.data.token,
      }),
    )
    localStorage.setItem("auth_token", result.data.token)
    localStorage.setItem("auth_method", LOGIN_METHODS.MetaMask)
    localStorage.setItem("auth_address", publicAddress as string)
    localStorage.setItem("auth_rdns", wallet.info.rdns)
    localStorage.setItem("isSignedIn", "true")

    onSuccess()
  } catch (err: unknown) {
    const e = err as { code?: number }
    if (e?.code === 4001 || e?.code === -32603) {
      toast.info("Connection cancelled")
      onError()
      return
    }
    console.error("Injected login failed:", err)
    toast.error("Injected login failed", { description: `${err}` })
    onError()
  } finally {
    dispatch(loadingFalse())
  }
}
