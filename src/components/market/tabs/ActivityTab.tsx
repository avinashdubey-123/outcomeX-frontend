// src/components/market/tabs/ActivityTab.tsx
// TODO: replace MOCK_ACTIVITY with useGetMarketActivityQuery(marketId) when API ready

import { formatMarketDate } from "@/libs/formatDate"
import { MOCK_ACTIVITY } from "@/mocks/mockActivity"

interface ActivityTabProps {
  marketId: string // ready for API call later
}

export const ActivityTab = ({ marketId: _ }: ActivityTabProps) => {
  // TODO: const { data: items = [] } = useGetMarketActivityQuery(marketId)
  const items = MOCK_ACTIVITY

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        {/* <span className="font-base font-bold text-white uppercase ">Recent Activity</span> */}
        <span className="font-sm text-primary">{items.length} trades</span>
      </div>

      {/* Scrollable table container */}
      <div className="overflow-x-auto no-scrollbar -mx-1   border border-white/10 bg-linear-to-b from-white/5 to-white/2 rounded-md">
        <div className="min-w-[590px]">
          {/* Column headers */}
          <div className="grid grid-cols-[repeat(5,1fr)] font-base text-white/60 font-medium uppercase tracking-widest py-4 px-6  border-b border-white/6 mb-1 ">
            <span>User</span>
            <span className="text-center">Action</span>
            <span className="text-center">Outcome</span>
            <span className="text-center">Shares</span>
            <span className="text-right">Amount</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col  ">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[repeat(5,1fr)] items-center not-last:border-b border-b-white/4 py-2.5 transition-colors hover:bg-white/2  px-6"
              >
                {/* User + time */}
                <div className="flex flex-col min-w-0">
                  <span className="font-default capitalize font-medium text-white truncate">
                    {item.user}
                  </span>
                  <span className="font-base text-white/40">
                    {formatMarketDate(item.timestamp)}
                  </span>
                </div>

                {/* Action */}
                <div className="flex justify-center">
                  <span
                    className="font-base font-semibold py-1 px-2.5 rounded-full"
                    style={{
                      background: item.action === "Buy" ? "#18C96433" : "#FF5A5F33",
                      color: item.action === "Buy" ? "#18C964" : "#FF5A5F",
                    }}
                  >
                    {item.action}
                  </span>
                </div>

                {/* Outcome badge */}
                <div className="flex justify-center">
                  <span
                    className="font-base font-semibold py-1 px-2.5 rounded-full"
                    style={{
                      background: item.outcome === "Yes" ? "#18C96433" : "#FF5A5F33",
                      color: item.outcome === "Yes" ? "#18C964" : "#FF5A5F",
                    }}
                  >
                    {item.outcome}
                  </span>
                </div>

                {/* Shares */}
                <span className="font-sm text-center font-medium text-white/80">
                  {item.shares.toLocaleString()}
                </span>

                {/* Amount */}
                <div className="flex justify-end pr-1">
                  <span className="font-sm font-medium text-white">
                    ${item.usdcAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
