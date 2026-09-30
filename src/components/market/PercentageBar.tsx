import type { FC } from "react"

interface PercentageBarProps {
  yesPercentage: number
  noPercentage: number
  hideLabels?: boolean
}

export const PercentageBar: FC<PercentageBarProps> = ({
  yesPercentage,
  noPercentage,
  hideLabels,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex h-1 w-full overflow-hidden rounded-full bg-muted/30">
        <div
          className="h-full bg-yes transition-all duration-500 ease-out shadow-[0_0_8px_rgba(22,199,132,0.6)]"
          style={{ width: `${yesPercentage}%` }}
        />
        <div
          className="h-full bg-progress-bar transition-all duration-500 ease-out shadow-[0_0_8px_rgba(234,57,67,0.6)]"
          style={{ width: `${noPercentage}%` }}
        />
      </div>

      {/* labels */}
      {!hideLabels && (
        <div className="flex justify-between font-base font-medium uppercase tracking-wider">
          <span className="text-primary">{yesPercentage}%</span>
          <span className="text-no">{noPercentage}%</span>
        </div>
      )}
    </div>
  )
}
