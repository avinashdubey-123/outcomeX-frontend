import type { EIP1193Provider } from "@/hooks/useEIP6963"

let activeInjectedProvider: EIP1193Provider | null = null

export const setActiveInjectedProvider = (provider: EIP1193Provider | null) => {
  activeInjectedProvider = provider
}

type InjectedEthereum = EIP1193Provider & {
  providers?: (EIP1193Provider & { isMetaMask?: boolean; isPhantom?: boolean })[]
}

/**
 * Returns the actively selected EIP-6963 provider.
 * Falls back to window.ethereum for legacy compatibility if no EIP-6963 provider is explicitly selected.
 */
export const getActiveInjectedProvider = (): EIP1193Provider | null => {
  if (activeInjectedProvider) return activeInjectedProvider

  if (typeof window !== "undefined") {
    const eth = (window as unknown as { ethereum?: InjectedEthereum }).ethereum
    if (eth) {
      // If the user has multiple wallets fighting over window.ethereum,
      // try to pick the exact one they logged in with.
      const savedRdns = localStorage.getItem("auth_rdns")

      if (eth.providers && Array.isArray(eth.providers)) {
        // EIP-1193 providers in the providers array usually have a flag like isMetaMask, isCoinbaseWallet
        // We match them loosely based on the saved rdns.
        if (savedRdns === "io.metamask") {
          const p = eth.providers.find((p) => p.isMetaMask)
          if (p) return p as EIP1193Provider
        } else if (savedRdns === "app.phantom") {
          const p = eth.providers.find((p) => p.isPhantom)
          if (p) return p as EIP1193Provider
        }
        // If we can't find a specific match, just return the first one as fallback
        return eth.providers[0] as EIP1193Provider
      }
      return eth as EIP1193Provider
    }
  }
  return null
}
