//libs/formatUSDC.ts

import { type BigNumberish, formatUnits } from "ethers"

export function formatUSDC(value: BigNumberish): string {
  return formatUnits(value, 6)
}
