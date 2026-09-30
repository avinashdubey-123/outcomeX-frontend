import type { EIP1193Provider } from "@/hooks/useEIP6963"
import { NETWORK } from "@/libs/contracts"

export const switchToAmoy = async (provider?: EIP1193Provider) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = provider || (typeof window !== "undefined" ? (window as any).ethereum : null)
  if (!p) return

  try {
    await p.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13882" }],
    })
  } catch (err: unknown) {
    if ((err as { code: number }).code === 4902) {
      await p.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13882",
            chainName: "Polygon Amoy Testnet",
            nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
            rpcUrls: [NETWORK.rpcUrl],
            blockExplorerUrls: ["https://amoy.polygonscan.com"],
          },
        ],
      })
    }
  }
}
