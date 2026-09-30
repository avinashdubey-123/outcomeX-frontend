import { ethers } from "ethers"
import { useState } from "react"

import { useProviderAndSigner } from "@/hooks/auth/useProviderAndSigner"
import { ADDRESSES, ERC20_ABI } from "@/libs/contracts"

const ORACLE_ABI = ["function disputeAnswer(bytes32 identifier, uint256 bond) external"]

export const useDisputeTransactions = () => {
  const { getProviderAndSigner } = useProviderAndSigner()

  const [isApproving, setIsApproving] = useState(false)
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null)

  const [isDisputing, setIsDisputing] = useState(false)
  const [disputeTxHash, setDisputeTxHash] = useState<string | null>(null)

  /**
   * Approves the Oracle contract to spend the user's USDC for the bond amount.
   *
   * @param oracleAddress The address of the oracle contract that will consume the bond.
   * @param bondAmount Minor units of USDC required for the bond as a string.
   * @param onStatusUpdate Callback providing human-readable status updates to the UI.
   */
  const approveUSDC = async (
    oracleAddress: string,
    bondAmount: string,
    onStatusUpdate: (msg: string) => void,
  ) => {
    setIsApproving(true)
    setApproveTxHash(null)

    try {
      const { signer } = await getProviderAndSigner()

      // 1. Create the instance of the USDC contract using the existing pattern
      const usdc = new ethers.Contract(ADDRESSES.USDC, ERC20_ABI, signer)

      onStatusUpdate("Please confirm the USDC approval in your wallet...")

      // 2. Send approve transaction — explicit gas overrides bypass Amoy fee estimation errors
      const approveTx = await usdc.getFunction("approve")(oracleAddress, BigInt(bondAmount), {
        gasLimit: 100_000n,
        maxFeePerGas: ethers.parseUnits("50", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
      })
      setApproveTxHash(approveTx.hash)

      onStatusUpdate(`Approval transaction sent! Waiting for confirmation...`)

      // 3. Wait for confirmation
      await approveTx.wait()

      onStatusUpdate("✅ USDC approval confirmed!")
      setIsApproving(false)

      return { success: true, txHash: approveTx.hash }
    } catch (error: unknown) {
      console.error("USDC Approval Failed: ", error)

      // Extract nicely formatted error messages if they hit common wallet rejections
      let errorMessage = (error as { message: string }).message
      if ((error as { code: number }).code === 4001 || errorMessage.includes("user rejected")) {
        errorMessage = "Transaction rejected by user."
      }

      onStatusUpdate(`❌ Approval failed: ${errorMessage}`)
      setIsApproving(false)

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Submits the dispute transaction to the Oracle contract.
   *
   * @param identifier The unique bytes32 identifier of the market.
   * @param bondAmount Minor units of USDC to be bonded for the dispute.
   * @param onStatusUpdate Callback providing human-readable status updates to the UI.
   */
  const submitDisputeTransaction = async (
    identifier: string,
    bondAmount: string,
    onStatusUpdate: (msg: string) => void,
  ) => {
    setIsDisputing(true)
    setDisputeTxHash(null)

    try {
      const { signer } = await getProviderAndSigner()

      const oracleAddress =
        import.meta.env.VITE_ORACLE_ADDRESS ||
        import.meta.env.VITE_UMA_ADDRESS ||
        "0x0000000000000000000000000000000000000000" // Fallback or loaded from config
      const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, signer)

      onStatusUpdate("Please confirm the dispute transaction in your wallet...")

      // Explicit gas overrides bypass Polygon Amoy's unreliable EIP-1559 fee estimation
      const disputeTx = await oracle.getFunction("disputeAnswer")(identifier, BigInt(bondAmount), {
        gasLimit: 300_000n,
        maxFeePerGas: ethers.parseUnits("50", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
      })
      setDisputeTxHash(disputeTx.hash)

      onStatusUpdate(`Dispute transaction sent! Waiting for confirmation...`)

      await disputeTx.wait()

      onStatusUpdate("✅ Dispute transaction confirmed!")
      setIsDisputing(false)

      return { success: true, txHash: disputeTx.hash }
    } catch (error: unknown) {
      console.error("Dispute Submission Failed: ", error)

      let errorMessage = (error as { message: string }).message
      if ((error as { code: number }).code === 4001 || errorMessage.includes("user rejected")) {
        errorMessage = "Transaction rejected by user."
      }

      onStatusUpdate(`❌ Dispute submission failed: ${errorMessage}`)
      setIsDisputing(false)

      return { success: false, error: errorMessage }
    }
  }

  return {
    approveUSDC,
    isApproving,
    approveTxHash,
    submitDisputeTransaction,
    isDisputing,
    disputeTxHash,
  }
}
