export const NETWORK = {
  chainId: 80002,
  name: "Polygon Amoy",
  rpcUrl: import.meta.env.VITE_RPC_URL as string,
}

export const ADDRESSES = {
  USDC: "0xb157f0dD6859722AfE1A5b4D983b94db1468b15A",
  ConditionalTokens: "0x7f77d4Fe4a700c29DD5f4A505C569922161b8916",
  // CTFExchange: "0x9f128e3230D7ab133d2DafBd8d9218A3f12003aF"
  CTFExchange: "0xA665c61CC5930C2B4C91E6b226c8D0fb0982E3a5",
}

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
]

export const CTF_REDEEM_ABI = [
  "function redeemPositions(address collateralToken , bytes32 conditionId, uint256[] indexSets)",
]
