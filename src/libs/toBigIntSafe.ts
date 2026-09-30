export function toBigIntSafe(
  value: number | string | bigint | null | undefined,
  options?: {
    round?: boolean
    decimals?: number // for scaling like USDC (e.g. 6 decimals)
    fallback?: bigint
  },
): bigint {
  if (value === null || value === undefined) {
    if (options?.fallback !== undefined) return options.fallback
    throw new Error("Invalid value for BigInt conversion")
  }

  // Already bigint
  if (typeof value === "bigint") return value

  // String (important for IDs, tokenId etc.)
  if (typeof value === "string") {
    if (value.trim() === "") throw new Error("Empty string cannot be converted")
    return BigInt(value)
  }

  // Number
  if (typeof value === "number") {
    let val = value

    if (options?.round) {
      val = Math.round(val)
    }

    // Handle decimals scaling (VERY IMPORTANT for blockchain)
    if (options?.decimals) {
      const factor = 10 ** options.decimals
      return BigInt(Math.round(val * factor))
    }

    return BigInt(val)
  }

  throw new Error(`Unsupported type: ${typeof value}`)
}
