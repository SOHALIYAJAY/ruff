"use client"

import {
  Eye,
  Clock,
  FileText,
  BarChart3,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const monthlyData = [
  { month: "Jan", count: 87 },
  { month: "Feb", count: 102 },
  { month: "Mar", count: 134 },
  { month: "Apr", count: 118 },
  { month: "May", count: 145 },
  { month: "Jun", count: 156 },
]

const stats = [
  {
    label: "Read Rate",
    value: "78.4%",
    icon: <Eye className="w-4 h-4" />,
    color: "text-[#16a34a]",
    bg: "bg-green-50",
  },
  {
    label: "Avg Response Time",
    value: "2.4 hrs",
    icon: <Clock className="w-4 h-4" />,
    color: "text-[#3b82f6]",
    bg: "bg-blue-50",
  },
  {
    label: "Top Category",
    value: "Road & Pothole",
    icon: <FileText className="w-4 h-4" />,
    color: "text-[#f59e0b]",
    bg: "bg-amber-50",
  },
]

export default function NotificationAnalyticsPanel() {
  return (
    <div className="space-y-4">
      {/* Analytics header */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-[#1e40af]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Notification Analytics</h3>
            <p className="text-xs text-slate-500">Communication insights</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0]"
            >
              <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                  {s.label}
                </p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#1e40af]" />
          <h3 className="text-sm font-semibold text-slate-800">Monthly Messages</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="count"
                fill="#1e40af"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Type Distribution</h3>
        <div className="space-y-3">
          {[
            { label: "Complaint Update", count: 834, percent: 67, color: "bg-[#1e40af]" },
            { label: "Escalation", count: 186, percent: 15, color: "bg-[#f59e0b]" },
            { label: "General", count: 171, percent: 14, color: "bg-[#3b82f6]" },
            { label: "Warning", count: 56, percent: 4, color: "bg-[#dc2626]" },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">{item.label}</span>
                <span className="text-xs font-semibold text-slate-700">{item.count}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
