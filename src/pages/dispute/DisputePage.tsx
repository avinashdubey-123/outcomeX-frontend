import { AlertTriangle, ArrowLeft, Check, Clock, Copy, Gavel, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { useGetMarketByIdQuery, useGetOracleTimelineQuery } from "@/features/api/markets/marketApi"
import { extractDisputeData } from "@/features/markets/disputeHelpers"
import { useDisputeTransactions } from "@/hooks/dispute/useDisputeTransactions"

// Shared card styling. No hover effects: these are read-only panels, not buttons.
const CARD = "rounded-2xl border border-white/10 bg-linear-to-b from-white/5 to-white/2 p-5 md:p-6"
const LABEL = "mb-3 font-xs font-bold uppercase tracking-widest text-white/40"

// Wallet/RPC failures usually come back as raw library text ("could not coalesce error", ...),
// which means nothing to a user. Only a wallet rejection is worth explaining; every other
// failure gets just the toast title.
const errorDescription = (err: unknown): string | undefined => {
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : ""
  return /rejected|denied/i.test(msg) ? "You rejected the request in your wallet." : undefined
}

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
  // Stays true after a successful dispute so the button can't be clicked again while the page
  // waits to close itself.
  const [isSubmitted, setIsSubmitted] = useState(false)
  // State updates are async, so two quick clicks could both pass an `isSubmitting` check.
  // The ref flips synchronously and blocks the second call.
  const submitLock = useRef(false)
  const [status, setStatus] = useState<string>("")
  const [copied, setCopied] = useState(false)

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

  const handleCopyIdentifier = async () => {
    try {
      await navigator.clipboard.writeText(market?.oracleIdentifier || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      toast.error("Could not copy identifier")
    }
  }

  const { approveUSDC, submitDisputeTransaction } = useDisputeTransactions()

  const handleSubmit = async () => {
    if (submitLock.current || isSubmitted) return
    if (!disputeData) {
      toast.error("Dispute data is unavailable. Please refresh and try again.")
      return
    }

    // Identifier must come from market object — timeline action=1 rows don't reliably include it
    const identifier = market?.oracleIdentifier
    if (!identifier) {
      toast.error("Oracle identifier not found. Cannot raise dispute.")
      return
    }

    submitLock.current = true
    setIsSubmitting(true)
    setStatus("Preparing...")

    // The hooks also report failures through this callback; those are shown as toasts below,
    // so only progress messages are kept for the button hint.
    const onProgress = (msg: string) => {
      if (!msg.startsWith("❌")) setStatus(msg.replace(/^✅\s*/, ""))
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
        onProgress,
      )

      if (!approvalResult.success) {
        toast.error("USDC approval failed", { description: errorDescription(approvalResult.error) })
        return
      }

      // Step 2: Submit Dispute
      const disputeResult = await submitDisputeTransaction(
        identifier, // sourced from market.oracleIdentifier — timeline rows don't include this
        BigInt(disputeData.bondAmount).toString(),
        onProgress,
      )

      if (!disputeResult.success) {
        toast.error("Dispute submission failed", {
          description: errorDescription(disputeResult.error),
        })
        return
      }

      // Step 3: Show success. The backend picks up the AnswerDisputed event and updates the DB.
      toast.success("Dispute raised successfully")
      setIsSubmitted(true)
      if (id) {
        localStorage.setItem(`dispute_raised_${id}`, "true")
      }

      setTimeout(() => {
        navigate(-1)
      }, 3000)
    } catch (err: unknown) {
      console.error(err)
      toast.error("Dispute failed", { description: errorDescription(err) })
    } finally {
      submitLock.current = false
      setIsSubmitting(false)
      setStatus("")
    }
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
        <h2 className="font-lg font-bold mb-2">Couldn't load dispute</h2>
        <p className="text-white/60 max-w-xs font-sm ">
          Failed to load dispute data. Please refresh and try again.
        </p>
      </div>
    )
  if (!market || !disputeData)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <div className="p-3 bg-gray-500/10 border rounded-md border-gray-500/20 mb-6">
          <AlertTriangle className="text-gray-500" size={32} />
        </div>
        <h2 className="font-lg font-bold mb-2">No dispute available</h2>
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
            <div className="p-3 bg-dispute/10 border border-dispute/30 rounded-md">
              <AlertTriangle className="text-dispute" size={24} />
            </div>
            <h2 className="font-lg font-bold mb-2">Dispute unavailable</h2>
          </div>
          <p className="font-sm text-white/60 leading-relaxed mb-8">
            {latestOracleAction === 2 && "A dispute has already been raised for this market."}
            {latestOracleAction === 3 && "This dispute has already been settled by the admin."}
            {latestOracleAction === 4 &&
              "This market has been fully settled. No further disputes are possible."}
            {latestOracleAction == null && "The market is not in a disputable state."}
          </p>
          <button
            onClick={handleCancel}
            className="w-full cursor-pointer rounded-md bg-primary px-6 py-4 font-base font-bold text-black transition-all hover:bg-primary/90"
          >
            Back to market
          </button>
        </div>
      </div>
    )

  const isExpired = countdown === "Expired"
  const outcomeLabel =
    disputeData.proposedResponse === 1 ? "YES" : disputeData.proposedResponse === 0 ? "NO" : "N/A"

  return (
    <div className="container mt-4 md:mt-6 mb-14 md:mb-20">
      <button
        onClick={handleCancel}
        className="mb-6 flex w-fit cursor-pointer items-center gap-2 font-base font-semibold text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} /> Back to market
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-2xl mb-1.5 font-bold tracking-tighter text-white">Raise Dispute</h1>
          <p className="font-default text-white/60">Challenge the proposed oracle resolution</p>
        </div>
        <div
          className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 font-sm font-bold ${
            isExpired
              ? "border-[#E11D48]/30 bg-[#E11D48]/10 text-[#E11D48]"
              : "border-primary/30 bg-primary/10 text-primary"
          }`}
        >
          <Clock size={15} />
          {isExpired ? "Dispute window closed" : `${countdown || "Calculating..."} left`}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ── Left: what is being disputed ── */}
        <div className="space-y-6">
          <section className={CARD}>
            <h3 className={LABEL}>Market question</h3>
            <p className="font-lg font-bold capitalize leading-tight text-white">{market.title}</p>
          </section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className={CARD}>
              <h3 className={LABEL}>Proposed outcome</h3>
              <span
                className={`inline-flex items-center rounded-md border px-3 py-1 font-lg font-bold tracking-tight ${
                  outcomeLabel === "YES"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : outcomeLabel === "NO"
                      ? "border-no/30 bg-no/10 text-no"
                      : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                {outcomeLabel}
              </span>
              <p className="mt-3 font-base text-white/50">The answer you would be disputing.</p>
            </section>

            <section className={CARD}>
              <h3 className={LABEL}>Time remaining</h3>
              <div
                className={`flex items-center gap-2 font-lg font-bold ${
                  isExpired ? "text-[#E11D48]" : "text-primary"
                }`}
              >
                <Clock size={18} />
                <span>{countdown || "Calculating..."}</span>
              </div>
              <p className="mt-3 font-base text-white/50">
                {isExpired ? "This dispute period has ended." : "Until the dispute window closes."}
              </p>
            </section>
          </div>

          <section className={CARD}>
            <h3 className={LABEL}>Oracle identifier</h3>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 p-3">
              <code className="truncate font-mono text-sm text-primary/80 select-all">
                {market.oracleIdentifier || "N/A"}
              </code>
              <button
                onClick={handleCopyIdentifier}
                className={`ml-auto cursor-pointer transition-colors ${
                  copied ? "text-primary" : "text-white/30 hover:text-white"
                }`}
                title={copied ? "Copied" : "Copy identifier"}
                aria-label="Copy identifier"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </section>
        </div>

        {/* ── Right: bond, steps and the action ── */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
            <h3 className={LABEL}>Required bond</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{disputeData.bondAmountUSDC}</span>
              <span className="text-xl font-bold text-white/40">USDC</span>
            </div>
          </section>

          <section className={CARD}>
            <div className="mb-4 flex items-center gap-2 font-sm font-bold text-white">
              <AlertTriangle size={16} className="text-dispute" />
              You will approve 2 transactions
            </div>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-base font-bold text-primary">
                  1
                </span>
                <div>
                  <p className="font-sm font-semibold text-white">USDC approval</p>
                  <p className="font-base text-white/50">For {disputeData.bondAmountUSDC} USDC.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-base font-bold text-primary">
                  2
                </span>
                <div>
                  <p className="font-sm font-semibold text-white">Dispute submission</p>
                  <p className="font-base text-white/50">Sent to the Oracle contract.</p>
                </div>
              </li>
            </ol>
          </section>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmitted || isExpired}
              aria-busy={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-primary px-6 py-4 font-base font-bold tracking-widest text-black uppercase transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} />}
              {isExpired
                ? "Period expired"
                : isSubmitting
                  ? "Processing..."
                  : isSubmitted
                    ? "Dispute submitted"
                    : "Submit dispute"}
            </button>
            {isSubmitting && status && (
              <p className="text-center font-xs text-white/50" aria-live="polite">
                {status}
              </p>
            )}
            <button
              onClick={handleCancel}
              disabled={isSubmitting || isSubmitted}
              className="w-full cursor-pointer rounded-md border border-white/10 py-3 font-base font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default DisputePage
