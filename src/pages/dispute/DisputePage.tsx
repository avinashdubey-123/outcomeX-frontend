import { AlertTriangle, ArrowLeft, Clock, Copy, Gavel, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { useGetMarketByIdQuery, useGetOracleTimelineQuery } from "@/features/api/markets/marketApi"
import { extractDisputeData } from "@/features/markets/disputeHelpers"
import { useDisputeTransactions } from "@/hooks/dispute/useDisputeTransactions"

export const DisputePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    data: market,
    isLoading: marketLoading,
    isError: marketError,
  } = useGetMarketByIdQuery(id ?? "")
  const {
    data: timelineData,
    isLoading: timelineLoading,
    isError: timelineError,
  } = useGetOracleTimelineQuery(id ?? "")
  // Derive the latest oracle state from the timeline
  const latestOracleAction: number | null = timelineData?.data?.length
    ? (timelineData.data[timelineData.data.length - 1]?.action ?? null)
    : null

  // RESOLUTION_ACTION.PROPOSE = 1 — only allow dispute in this state
  const PROPOSE = 1

  const disputeData = extractDisputeData(timelineData)

  const [countdown, setCountdown] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    if (!disputeData?.proposedTimestamp) return

    const interval = setInterval(() => {
      const twoHoursInMs = 2 * 60 * 60 * 1000
      const proposedTime = new Date(disputeData.proposedTimestamp).getTime()
      const expiresAt = proposedTime + twoHoursInMs
      const now = Date.now()

      const distance = expiresAt - now
      if (distance < 0) {
        setCountdown("Expired")
        clearInterval(interval)
        return
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setCountdown(`${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [disputeData?.proposedTimestamp])

  const handleCancel = () => navigate(-1)

  const { approveUSDC, submitDisputeTransaction } = useDisputeTransactions()

  const handleSubmit = async () => {
    if (!disputeData) {
      setStatus("❌ Dispute data is unavailable. Please refresh and try again.")
      return
    }
    setIsSubmitting(true)
    setStatus("Initializing...")

    // Identifier must come from market object — timeline action=1 rows don't reliably include it
    const identifier = market?.oracleIdentifier
    if (!identifier) {
      setStatus("❌ Oracle identifier not found. Cannot raise dispute.")
      setIsSubmitting(false)
      return
    }

    try {
      // Step 1: Approve
      const oracleAddress =
        import.meta.env.VITE_ORACLE_ADDRESS ||
        import.meta.env.VITE_UMA_ADDRESS ||
        "0x0000000000000000000000000000000000000000"
      const approvalResult = await approveUSDC(
        oracleAddress,
        disputeData.bondAmount.toString(),
        setStatus,
      )

      if (!approvalResult.success) {
        throw new Error("USDC approval failed")
      }

      // Step 2: Submit Dispute
      const disputeResult = await submitDisputeTransaction(
        identifier, // sourced from market.oracleIdentifier — timeline rows don't include this
        BigInt(disputeData.bondAmount).toString(),
        setStatus,
      )

      if (!disputeResult.success) {
        throw new Error("Dispute submission failed")
      }

      // Step 3: Show success
      setStatus(`✅ Dispute raised successfully!
      
Approval Tx: ${approvalResult.txHash}
Dispute Tx: ${disputeResult.txHash}
      
The backend will automatically detect the AnswerDisputed event and update the database.`)

      // Auto close after 5 seconds
      setTimeout(() => {
        navigate(-1)
      }, 5000)
    } catch (err: unknown) {
      console.error(err)
      setStatus(
        `❌ Error: ${(err as { message: string }).message || "An unexpected error occurred."}`,
      )
    }

    setIsSubmitting(false)
  }

  if (marketLoading || timelineLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="font-xs font-black tracking-[0.4em] uppercase text-primary/60">
          Syncing Protocol...
        </p>
      </div>
    )
  if (marketError || timelineError)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <div className="p-3 bg-red-500/10 border rounded-md border-red-500/20 mb-6">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h2 className="font-lg font-black uppercase  mb-2">Protocol Link Failure</h2>
        <p className="text-white/60 max-w-xs font-sm ">
          Failed to load dispute data. Please refresh the connection.
        </p>
      </div>
    )
  if (!market || !disputeData)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <div className="p-3 bg-gray-500/10 border rounded-md border-gray-500/20 mb-6">
          <AlertTriangle className="text-gray-500" size={32} />
        </div>
        <h2 className="font-lg font-black uppercase  mb-2">Data Null</h2>
        <p className="text-gray-500 max-w-xs font-sm ">
          No disputable answer found for this market.
        </p>
      </div>
    )

  // ── Guard: only allow dispute when oracle is in PROPOSE state (action=1)
  if (latestOracleAction !== PROPOSE)
    return (
      <div className="flex items-center justify-center md:min-h-screen  p-6">
        <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 py-5 px-6 rounded-lg max-w-md w-full relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="p-3 bg-option-no/10 border border-option-no rounded-md">
              <AlertTriangle className="text-no" size={24} />
            </div>
            <h2 className="font-lg font-black uppercase  mb-2">Dispute Unavailable</h2>
          </div>
          <p className="text-xs font-medium text-white/60 tracking-widest leading-loose mb-8">
            {latestOracleAction === 2 && "A dispute has already been raised for this market."}
            {latestOracleAction === 3 && "This dispute has already been settled by the admin."}
            {latestOracleAction === 4 &&
              "This market has been fully settled. No further disputes are possible."}
            {latestOracleAction == null && "The market is not in a disputable state."}
          </p>
          <button
            onClick={handleCancel}
            className="w-full font-default py-4 bg-primary hover:bg-primary/90 border rounded-2md border-white/5 text-black font-black uppercase  transition-all"
          >
            RETURN TO TERMINAL
          </button>
        </div>
      </div>
    )

  return (
    <div className="container mt-4 md:mt-6 mb-14 md:mb-20 ">
      {/* Back button */}
      <button
        onClick={handleCancel}
        className="flex items-center gap-1.5 py-2 px-4 rounded-sm font-base font-bold bg-primary  text-black hover:bg-primary/90 transition-colors mb-8 cursor-pointer  border-none"
      >
        <ArrowLeft size={14} /> BACK TO MARKET
      </button>

      {/* Header */}
      <div className="mb-12">
        <h1 className="font-2xl font-bold text-white mb-1.5 tracking-tighter">Raise Dispute</h1>
        <p className="font-default text-white/60 mb-6 ">Challenge the proposed oracle resolution</p>
        <div className="w-16 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(0,200,83,0.3)]"></div>
      </div>

      <div className="space-y-6">
        {/* Row 1: Market Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl py-5  px-6 shadow-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-primary/80 transition-all duration-200 ease-in-out cursor-pointer">
            <h3 className="font-xs font-bold text-white/40 uppercase tracking-widest mb-4">
              Market Question
            </h3>
            <p className="font-lg capitalize font-bold text-white leading-tight">{market.title}</p>
          </div>
          <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl py-5  px-6 shadow-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-primary/80 transition-all duration-200 ease-in-out cursor-pointer">
            <h3 className="font-xs font-bold text-white/40 uppercase tracking-widest mb-4">
              Time Remaining
            </h3>
            <div
              className={`flex items-center gap-2 font-lg font-bold ${countdown === "Expired" ? "text-[#E11D48]" : "text-[#10D260]"}`}
            >
              <Clock size={18} />
              <span>{countdown || "Calculating..."}</span>
            </div>
          </div>
          <div className="bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl py-5  px-6 shadow-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-primary/80 transition-all duration-200 ease-in-out cursor-pointer">
            <h3 className="font-xs font-bold text-white/40 uppercase tracking-widest mb-4">
              Proposed Outcome
            </h3>
            <p className="font-lg font-bold text-white tracking-tight">
              {disputeData.proposedResponse === 1
                ? "YES"
                : disputeData.proposedResponse === 0
                  ? "NO"
                  : "N/A"}
            </p>
          </div>
        </div>

        {/* Row 2: Oracle & Bond */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2    bg-linear-to-b from-white/5 to-white/2 border border-white/10 rounded-2xl py-5  px-6 shadow-2xl flex flex-col gap-3 hover:translate-y-[-4px] hover:border-primary/80 transition-all duration-200 ease-in-out cursor-pointer">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
              Oracle Identifier
            </h3>
            <div className="flex items-center gap-3 bg-white/7 border border-white/5 rounded-lg p-3 group/id ">
              <code className="text-sm text-primary/80 font-mono truncate select-all">
                {market.oracleIdentifier || "N/A"}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(market.oracleIdentifier || "")}
                className="ml-auto text-white/20 hover:text-[#00FF87] transition-colors cursor-pointer"
                title="Copy Identifier"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          <div className=" bg-primary/6  py-5  px-6 shadow-2xl  gap-3 hover:translate-y-[-4px]   ease-in-out cursor-pointer   border border-primary/20 hover:border-primary/80 rounded-lg p-6 flex flex-col transition-all duration-300  group h-full">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
              Required Bond Amount
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{disputeData.bondAmountUSDC}</span>
              <span className="text-xl font-bold text-white/40">USDC</span>
            </div>
            <div className="md:ml-auto">
              <span className="font-xs font-bold text-white tracking-[0.15em] uppercase">
                {Number(disputeData.bondAmount).toLocaleString()} minor units
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Warning */}
        <div className="bg-[#0a0b0d] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-w-96">
          <div className="p-8 bg-option-no flex gap-6 items-start">
            <div className="p-3 bg-red-500/20 rounded-lg text-red-500">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">
                Protocol Warning
              </h3>
              <div className="text-sm text-white/70 space-y-1">
                <p>You will need to approve 2 transactions:</p>
                <div className="ml-1 space-y-0.5">
                  <div>
                    1. USDC approval for{" "}
                    <span className="text-white font-bold">{disputeData.bondAmountUSDC} USDC.</span>
                  </div>
                  <div>2. Dispute submission to Oracle contract.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Display */}
      {status && (
        <div className="mt-6 bg-[#00FF87]/5 border border-[#00FF87]/20 p-6 font-mono text-xs text-[#00FF87] whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-[10px] opacity-70">
            <Loader2 size={12} className={isSubmitting ? "animate-spin" : ""} />
            Execution Log
          </div>
          {status}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-8 mt-10">
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || countdown === "Expired"}
          className="flex items-center   font-base  bg-primary  text-black hover:bg-primary/90 mb-8  border-none px-10 py-4 rounded-sm font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:grayscale  gap-3 shadow-[0_0_20px_rgba(0,255,135,0.2)] active:scale-95 cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} />}
          {countdown === "Expired" ? "Period Expired" : "Submit Dispute"}
        </button>
      </div>
    </div>
  )
}

export default DisputePage
