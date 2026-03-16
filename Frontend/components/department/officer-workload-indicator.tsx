"use client"

import React from "react"

interface OfficerWorkloadIndicatorProps {
  assigned: number
  capacity: number
  showLabel?: boolean
}

export default function OfficerWorkloadIndicator({
  assigned,
  capacity,
  showLabel = true,
}: OfficerWorkloadIndicatorProps) {
  // Calculate percentage
  const percentage = capacity > 0 ? (assigned / capacity) * 100 : 0
  
  // Determine color based on workload
  const getColor = () => {
    if (percentage <= 50) return { bar: "bg-[#16a34a]", bg: "bg-green-100" }
    if (percentage <= 80) return { bar: "bg-[#f59e0b]", bg: "bg-amber-100" }
    return { bar: "bg-[#dc2626]", bg: "bg-red-100" }
  }

  const getLabel = () => {
    if (percentage <= 50) return "Normal"
    if (percentage <= 80) return "Medium"
    return "High"
  }

  const color = getColor()
  const label = getLabel()

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          {showLabel && (
            <>
              <span className="text-xs font-medium text-slate-600">
                {assigned}/{capacity}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${color.bg}`}>
                {label}
              </span>
            </>
          )}
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color.bar} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
