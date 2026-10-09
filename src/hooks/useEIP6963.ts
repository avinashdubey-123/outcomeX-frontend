import { useEffect, useState } from "react"

export interface EIP6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

export type EIP6963AnnounceProviderEvent = {
  detail: EIP6963ProviderDetail
}

let providers: EIP6963ProviderDetail[] = []

export const useEIP6963 = () => {
  const [wallets, setWallets] = useState<EIP6963ProviderDetail[]>(providers)

  useEffect(() => {
    const onAnnounceProvider = (event: Event) => {
      const newProvider = (event as unknown as EIP6963AnnounceProviderEvent).detail
      if (!providers.some((p) => p.info.uuid === newProvider.info.uuid)) {
        providers = [...providers, newProvider]
        setWallets([...providers])
      }
    }

    window.addEventListener("eip6963:announceProvider", onAnnounceProvider)
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    return () => {
      window.removeEventListener("eip6963:announceProvider", onAnnounceProvider)
    }
  }, [])

  return wallets
}

export const getDiscoveredProviders = () => providers
