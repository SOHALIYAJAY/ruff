"use client"

import { useState, useEffect, useCallback } from "react"
import {
  BarChart3, TrendingUp, Users, FileText, Clock, CheckCircle2,
  Activity, AlertTriangle, Calendar, Target, RefreshCw, Eye, UserCheck
} from "lucide-react"
import {
  ResponsiveContainer, PieChart, Pie, Tooltip, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  total: number
  pending: number
  inProgress: number
  resolved: number
}

interface Performance {
  avgResolutionTime: number
  slaCompliance: number
  officerWorkload: number
  citizenSatisfaction: number
}

interface RecentComplaint {
  id: number
  title: string
  description: string
  status: string
  priority: string
  current_time: string
  location_address: string
  Category: string
}

interface ActivityItem {
  id: string
  type: string
  description: string
  time: string
  officer?: string
}

interface DashboardData {
  stats: Stats
  performance: Performance
  monthlyCounts: Record<string, number>
  recentComplaints: RecentComplaint[]
  recentActivity: ActivityItem[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const STATUS_STYLES: Record<string, string> = {
  "pending":     "bg-amber-100 text-amber-800 border border-amber-200",
  "in-progress": "bg-blue-100 text-blue-800 border border-blue-200",
  "resolved":    "bg-emerald-100 text-emerald-800 border border-emerald-200",
}

const PRIORITY_STYLES: Record<string, string> = {
  "high":   "bg-red-100 text-red-700",
  "medium": "bg-orange-100 text-orange-700",
  "low":    "bg-green-100 text-green-700",
}

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("departmentToken") ||
    localStorage.getItem("access_token")
  return token && token !== "undefined" && token !== "null"
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" }
}

function statusStyle(s: string) {
  return STATUS_STYLES[s?.toLowerCase()] ?? "bg-gray-100 text-gray-700 border border-gray-200"
}

function priorityStyle(p: string) {
  return PRIORITY_STYLES[p?.toLowerCase()] ?? "bg-gray-100 text-gray-700"
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, iconBg, borderColor,
}: {
  label: string; value: number | string; sub: string
  icon: React.ReactNode; iconBg: string; borderColor: string
}) {
  return (
    <div className={`bg-white rounded-xl border-t-4 ${borderColor} border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`${iconBg} p-2.5 rounded-lg`}>{icon}</div>
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  )
}

function SectionCard({ title, subtitle, icon, iconBg, children }: {
  title: string; subtitle?: string; icon: React.ReactNode; iconBg: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 p-5 border-b border-gray-100">
        <div className={`${iconBg} p-2 rounded-lg`}>{icon}</div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DepartmentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/api/department/dashboard/`, {
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [API])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30_000)
    return () => clearInterval(id)
  }, [fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  // ── Derived data ────────────────────────────────────────────────────────────

  const monthlyChartData = MONTH_NAMES.map((name, i) => ({
    name,
    complaints: data?.monthlyCounts?.[String(i + 1)] ?? 0,
  }))

  const pieData = data
    ? [
        { name: "Pending",     value: data.stats.pending,    color: PIE_COLORS[0] },
        { name: "In Progress", value: data.stats.inProgress, color: PIE_COLORS[1] },
        { name: "Resolved",    value: data.stats.resolved,   color: PIE_COLORS[2] },
      ]
    : []

  const totalPie = pieData.reduce((s, e) => s + e.value, 0)

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-32">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-72">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-48 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { stats, performance, recentComplaints, recentActivity } = data

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time overview of department operations</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Complaints"
          value={stats.total}
          sub="All complaints in system"
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
          borderColor="border-t-indigo-500"
        />
        <KpiCard
          label="Pending"
          value={stats.pending}
          sub="Awaiting action"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
          borderColor="border-t-amber-500"
        />
        <KpiCard
          label="In Progress"
          value={stats.inProgress}
          sub="Currently being addressed"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
          borderColor="border-t-blue-500"
        />
        <KpiCard
          label="Resolved"
          value={stats.resolved}
          sub="Successfully completed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          borderColor="border-t-emerald-500"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Complaint Status Pie */}
        <SectionCard
          title="Complaint Status"
          subtitle="Distribution by current status"
          icon={<BarChart3 className="w-5 h-5" />}
          iconBg="bg-indigo-50 text-indigo-600"
        >
          <div className="p-5">
            {totalPie > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => {
                        const pct = totalPie ? ((val / totalPie) * 100).toFixed(1) : "0"
                        return [`${val} (${pct}%)`, name]
                      }}
                      contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((e, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: e.color }} />
                      <span className="text-xs text-gray-600">{e.name}</span>
                      <span className="text-xs font-semibold text-gray-800">{e.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FileText className="w-10 h-10 text-gray-300" />
                <p className="text-sm">No complaint data yet</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Monthly Bar Chart */}
        <SectionCard
          title="Monthly Complaints"
          subtitle={`Complaints filed in ${new Date().getFullYear()}`}
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        >
          <div className="p-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13 }}
                  cursor={{ fill: "#EFF6FF" }}
                />
                <Bar dataKey="complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* ── Performance + Activity Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Performance Metrics */}
        <SectionCard
          title="Performance Metrics"
          subtitle="Department efficiency indicators"
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-purple-50 text-purple-600"
        >
          <div className="p-5 space-y-1">
            {[
              {
                label: "SLA Compliance",
                value: `${performance.slaCompliance.toFixed(1)}%`,
                bar: performance.slaCompliance,
                color: performance.slaCompliance >= 80 ? "bg-emerald-500" : performance.slaCompliance >= 60 ? "bg-amber-500" : "bg-red-500",
              },
              {
                label: "Avg Resolution Time",
                value: `${performance.avgResolutionTime} days`,
                bar: Math.min(100, performance.avgResolutionTime * 10),
                color: "bg-blue-500",
              },
              {
                label: "Officer Workload",
                value: `${performance.officerWorkload} / officer`,
                bar: Math.min(100, performance.officerWorkload * 5),
                color: "bg-orange-500",
              },
              {
                label: "Citizen Satisfaction",
                value: `${performance.citizenSatisfaction} / 5.0`,
                bar: (performance.citizenSatisfaction / 5) * 100,
                color: "bg-purple-500",
              },
            ].map((m, i) => (
              <div key={i} className="py-2.5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-600">{m.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, m.bar)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard
          title="Recent Activity"
          subtitle="Latest department actions"
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        >
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {recentActivity.length > 0 ? recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.type === "resolution" ? "bg-emerald-100" : "bg-blue-100"
                }`}>
                  {a.type === "resolution"
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    : <FileText className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{a.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{a.time}</span>
                    {a.officer && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{a.officer}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/department/assigned"
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Complaints</p>
            <p className="text-sm text-gray-500">View and assign complaints</p>
          </div>
        </Link>
        <Link
          href="/department/officers"
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="bg-purple-50 text-purple-600 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Manage Officers</p>
            <p className="text-sm text-gray-500">Manage department officers</p>
          </div>
        </Link>
      </div>

      {/* ── Recent Complaints Table ── */}
      <SectionCard
        title="Recent Complaints"
        subtitle="Latest complaints submitted to department"
        icon={<FileText className="w-5 h-5" />}
        iconBg="bg-gray-100 text-gray-600"
      >
        <div className="flex items-center justify-end px-5 pt-3">
          <Link href="/department/assigned" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All <Eye className="w-4 h-4" />
          </Link>
        </div>
        {recentComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-blue-600 font-semibold">#{c.id}</td>
                    <td className="px-5 py-3 text-gray-900 max-w-[180px] truncate">{c.title}</td>
                    <td className="px-5 py-3 text-gray-500">{c.Category || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{c.current_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recent complaints</p>
          </div>
        )}
      </SectionCard>

      {/* ── Status Overview ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Department Status Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Systems Operational</p>
              <p className="text-xs text-emerald-700">No active issues</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {stats.pending > 10 ? "High Volume Alert" : "Normal Volume"}
              </p>
              <p className="text-xs text-amber-700">{stats.pending} pending complaints</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                SLA:{" "}
                <span className={
                  performance.slaCompliance >= 80 ? "text-emerald-600" :
                  performance.slaCompliance >= 60 ? "text-amber-600" : "text-red-600"
                }>
                  {performance.slaCompliance >= 80 ? "Excellent" :
                   performance.slaCompliance >= 60 ? "Good" : "Needs Improvement"}
                </span>
              </p>
              <p className="text-xs text-blue-700">{performance.slaCompliance.toFixed(1)}% compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-2">
        <RefreshCw className="w-3 h-3" />
        Auto-refreshing every 30 seconds
      </div>
    </div>
  )
}