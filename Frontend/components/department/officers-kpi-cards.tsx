"use client"

import { useEffect, useState } from "react"
import {
  Users,
  UserCheck,
  UserX,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface KpiCard {
  label: string
  value: string
  trendUp: boolean
  icon: React.ReactNode
  borderColor: string
  iconBg: string
  iconColor: string
  suffix?: string
}

function AnimatedValue({ target, suffix }: { target: string; suffix?: string }) {
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

  return (
    <span>
      {display}
      {suffix}
    </span>
  )
}

import api from "@/lib/axios"

export default function OfficersKpiCards() {
  const [kpiData, setKpiData] = useState<KpiCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKpi() {
      setLoading(true)
      try {
        const { data } = await api.get("/api/officer-kpi/")
        setKpiData([
          {
            label: "Total Officers",
            value: data.total_officers?.toString() || "0",
            trendUp: true,
            icon: <Users className="w-5 h-5" />,
            borderColor: "border-t-[#1e40af]",
            iconBg: "bg-blue-50",
            iconColor: "text-[#1e40af]",
          },
          {
            label: "Active Officers",
            value: data.active_officers?.toString() || "0",
            trendUp: true,
            icon: <UserCheck className="w-5 h-5" />,
            borderColor: "border-t-[#16a34a]",
            iconBg: "bg-green-50",
            iconColor: "text-[#16a34a]",
          },
          {
            label: "Inactive Officers",
            value: data.inactive_officers?.toString() || "0",
            trendUp: false,
            icon: <UserX className="w-5 h-5" />,
            borderColor: "border-t-[#f59e0b]",
            iconBg: "bg-amber-50",
            iconColor: "text-[#f59e0b]",
          },
          {
            label: "High Workload",
            value: data.high_workload_officers?.toString() || "0",
            trendUp: false,
            icon: <Zap className="w-5 h-5" />,
            borderColor: "border-t-[#dc2626]",
            iconBg: "bg-red-50",
            iconColor: "text-[#dc2626]",
          },
          {
            label: "Avg Resolution",
            value: data.avg_resolution_rate?.toString() || "0",
            trendUp: true,
            icon: <Clock className="w-5 h-5" />,
            borderColor: "border-t-[#3b82f6]",
            iconBg: "bg-sky-50",
            iconColor: "text-[#3b82f6]",
            suffix: "%",
          },
          {
            label: "SLA Compliance",
            value: data.sla_compliance?.toString() || "0",
            trendUp: true,
            icon: <ShieldCheck className="w-5 h-5" />,
            borderColor: "border-t-[#7c3aed]",
            iconBg: "bg-violet-50",
            iconColor: "text-[#7c3aed]",
            suffix: "%",
          },
        ])
      } catch (e) {
        setKpiData([])
      } finally {
        setLoading(false)
      }
    }
    fetchKpi()
  }, [])

  if (loading) return <div>Loading KPI cards...</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-in fade-in duration-500">
      {kpiData.map((card, i) => (
        <div
          key={i}
          className={`bg-white rounded-lg border border-[#e2e8f0] border-t-4 ${card.borderColor} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500`}
          style={{animationDelay: `${i * 50}ms`}}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.iconBg} ${card.iconColor} p-2 rounded-lg`}>
              {card.icon}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${
                card.label === "Overloaded"
                  ? card.trendUp
                    ? "text-[#dc2626]"
                    : "text-[#16a34a]"
                  : card.label === "Avg Resolution"
                  ? card.trendUp
                    ? "text-[#dc2626]"
                    : "text-[#16a34a]"
                  : card.trendUp
                  ? "text-[#16a34a]"
                  : "text-[#dc2626]"
              }`}
            >
              {(card.label === "Overloaded" || card.label === "Avg Resolution")
                ? card.trendUp
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />
                : card.trendUp
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />
              }
              {card.trend}
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            {card.label}
          </p>
          <p className="text-2xl font-bold text-slate-800">
            <AnimatedValue target={card.value} suffix={card.suffix} />
          </p>
        </div>
      ))}
    </div>
  )
}
