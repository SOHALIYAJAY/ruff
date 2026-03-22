"use client"

import React from "react"
import { BarChart3, PieChart } from "lucide-react"

type MonthlyDataItem = { month: string; complaints: number }

export default function MonthlyTrendPanel({ data }: { data: MonthlyDataItem[] }) {
  const hasData = Array.isArray(data) && data.length > 0

  const maxComplaints = hasData ? Math.max(...data.map((d) => d.complaints || 0)) : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Complaint Trend</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      {hasData ? (
        <div className="space-y-3">
          {data.map((d, idx) => {
            const normalized = maxComplaints > 0 ? (d.complaints / maxComplaints) * 100 : 0
            const width = Math.min(100, Math.max(0, normalized))
            return (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{d.month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-sidebar-primary h-2 rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{d.complaints}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No monthly data available</p>
        </div>
      )}
    </div>
  )
}