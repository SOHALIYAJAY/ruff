"use client"

import { useEffect, useState } from "react"
import {
  Send,
  MailOpen,
  FileText,
  Radio,
  CalendarClock,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface KpiCard {
  label: string
  value: string
  trend: string
  trendUp: boolean
  icon: React.ReactNode
  borderColor: string
  iconBg: string
  iconColor: string
}

function AnimatedValue({ target }: { target: string }) {
  const [display, setDisplay] = useState("0")
  const numericTarget = parseFloat(target.replace(/,/g, ""))

  useEffect(() => {
    if (isNaN(numericTarget)) {
      setDisplay(target)
      return
    }
    const duration = 1400
    const steps = 40
    const increment = numericTarget / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numericTarget) {
        setDisplay(target)
        clearInterval(timer)
      } else {
        setDisplay(
          numericTarget >= 100
            ? Math.floor(current).toLocaleString()
            : current.toFixed(1)
        )
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numericTarget, target])

  return <span>{display}</span>
}

const kpiData: KpiCard[] = [
  {
    label: "Total Sent",
    value: "1,247",
    trend: "+42",
    trendUp: true,
    icon: <Send className="w-5 h-5" />,
    borderColor: "border-t-[#1e40af]",
    iconBg: "bg-blue-50",
    iconColor: "text-[#1e40af]",
  },
  {
    label: "Unread",
    value: "186",
    trend: "-12",
    trendUp: false,
    icon: <MailOpen className="w-5 h-5" />,
    borderColor: "border-t-[#f59e0b]",
    iconBg: "bg-amber-50",
    iconColor: "text-[#f59e0b]",
  },
  {
    label: "Complaint Messages",
    value: "834",
    trend: "+28",
    trendUp: true,
    icon: <FileText className="w-5 h-5" />,
    borderColor: "border-t-[#3b82f6]",
    iconBg: "bg-sky-50",
    iconColor: "text-[#3b82f6]",
  },
  {
    label: "Broadcast Sent",
    value: "56",
    trend: "+4",
    trendUp: true,
    icon: <Radio className="w-5 h-5" />,
    borderColor: "border-t-[#16a34a]",
    iconBg: "bg-green-50",
    iconColor: "text-[#16a34a]",
  },
  {
    label: "Today's Messages",
    value: "23",
    trend: "+8",
    trendUp: true,
    icon: <CalendarClock className="w-5 h-5" />,
    borderColor: "border-t-[#7c3aed]",
    iconBg: "bg-violet-50",
    iconColor: "text-[#7c3aed]",
  },
]

export default function NotificationsKpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpiData.map((card, i) => (
        <div
          key={i}
          className={`bg-white rounded-lg border border-[#e2e8f0] border-t-4 ${card.borderColor} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.iconBg} ${card.iconColor} p-2 rounded-lg`}>
              {card.icon}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${
                card.label === "Unread"
                  ? card.trendUp
                    ? "text-[#dc2626]"
                    : "text-[#16a34a]"
                  : card.trendUp
                  ? "text-[#16a34a]"
                  : "text-[#dc2626]"
              }`}
            >
              {card.label === "Unread" ? (
                card.trendUp ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )
              ) : card.trendUp ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {card.trend}
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            {card.label}
          </p>
          <p className="text-2xl font-bold text-slate-800">
            <AnimatedValue target={card.value} />
          </p>
        </div>
      ))}
    </div>
  )
}
