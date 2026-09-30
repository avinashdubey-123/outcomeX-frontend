import { ethers } from "ethers"
import { useSelector } from "react-redux"

import type { RootState } from "@/app/store"
import { LOGIN_METHODS } from "@/features/auth/authTypes/loginMethodsTypes"
import { getActiveInjectedProvider } from "@/features/auth/lib/injectedProvider"
import { useMagic } from "@/features/auth/lib/magic"
import { switchToAmoy } from "@/features/auth/switchChain"

/**
 * Hook to retrieve the active provider and signer based on the user's
 * current authentication method (Magic Link/Email vs MetaMask Wallet).
 */
export const useProviderAndSigner = () => {
  const { magic } = useMagic()
  const loginMethod = useSelector((s: RootState) => s.auth.loginMethod)

  const getUserAuthMethod = () => {
    return loginMethod
  }

  const getProviderAndSigner = async () => {
    let provider: ethers.BrowserProvider
    let signer: ethers.JsonRpcSigner

    if (loginMethod === LOGIN_METHODS.MetaMask) {
      const p = getActiveInjectedProvider()
      if (!p) throw new Error("Browser wallet not found. Please install an extension.")

      // Ensure we are on Polygon Amoy for Wallet users
      await switchToAmoy(p)

      provider = new ethers.BrowserProvider(p)
      signer = await provider.getSigner()
      return { provider, signer, method: "wallet" }
    } else if (loginMethod === LOGIN_METHODS.Email || loginMethod === LOGIN_METHODS.Google) {
      if (!magic?.rpcProvider) throw new Error("Magic provider not ready. Please try again.")

      provider = new ethers.BrowserProvider(magic.rpcProvider as ethers.Eip1193Provider)
      signer = await provider.getSigner()
      return { provider, signer, method: "magic" }
    }

    throw new Error("No valid authentication method found. Please log in.")
  }

  return { getProviderAndSigner, getUserAuthMethod }
}
