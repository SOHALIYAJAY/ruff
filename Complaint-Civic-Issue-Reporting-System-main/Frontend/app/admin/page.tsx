'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  TrendingUp, Users, FileText, Clock, CheckCircle2, Activity,
  AlertTriangle, RefreshCw, Building2
} from 'lucide-react'
import StatsCard from '@/components/ui/stats-card'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

function getToken() {
  const t = localStorage.getItem('adminToken') || localStorage.getItem('access_token')
  return t && t !== 'undefined' && t !== 'null' ? t : null
}

async function apiFetch(path: string) {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

const STATUS_COLORS: Record<string, string> = {
  resolved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
}
const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-green-100 text-green-800',
}
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

function ChartCard({ title, subtitle, children, loading }: {
  title: string; subtitle?: string; children: React.ReactNode; loading?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  )
}

export default function AdminDashboard() {
  const [kpi, setKpi] = useState({ total: 0, resolved: 0, pending: 0, inprogress: 0 })
  const [monthly, setMonthly] = useState<{ month: string; complaints: number }[]>([])
  const [roles, setRoles] = useState<{ name: string; value: number; color: string }[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [civicUsers, setCivicUsers] = useState<any[]>([])
  const [deptUsers, setDeptUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. KPI cards
      const kpiData = await apiFetch('/api/admindashboardcard/')
      setKpi({
        total: kpiData.total_complaints ?? kpiData.total_comp ?? 0,
        resolved: kpiData.resolved_complaints ?? kpiData.resolved_comp ?? 0,
        pending: kpiData.pending_complaints ?? kpiData.Pending_comp ?? 0,
        inprogress: kpiData.inprogress_complaints ?? kpiData.inprogress_comp ?? 0,
      })

      // 2. Monthly complaint trends (last 12 months)
      const trendsData = await apiFetch('/api/complaint-status-trends/')
      const rawMonthly: any[] = trendsData?.monthly_data ?? (Array.isArray(trendsData) ? trendsData : [])
      setMonthly(rawMonthly.map((d: any) => ({
        month: d.month ?? '',
        complaints: Number(d.complaints ?? 0),
      })))

      // 3. User role distribution
      const roleData = await apiFetch('/api/user-role-distribution/')
      setRoles([
        { name: 'Civic Users',      value: roleData.regular_users ?? 0, color: PIE_COLORS[0] },
        { name: 'Officers',         value: roleData.officers ?? 0,       color: PIE_COLORS[1] },
        { name: 'Admins',           value: roleData.admins ?? 0,         color: PIE_COLORS[2] },
      ].filter(r => r.value > 0))

      // 4. Recent complaints
      const recentData = await apiFetch('/api/recent-complaints-admin/')
      const list: any[] = Array.isArray(recentData.data) ? recentData.data : []
      setRecent(list.slice(0, 6).map((c: any) => ({
        id: c.id,
        title: c.title ?? 'Untitled',
        description: c.Description ?? '',
        status: c.status ?? 'Pending',
        priority: c.priority_level ?? 'Medium',
        district: c.location_District ?? '—',
        date: c.current_time ? new Date(c.current_time).toLocaleDateString() : '—',
      })))

      // 5. Latest users split by role
      const usersData = await apiFetch('/api/users/')
      const allUsers: any[] = usersData.results ?? usersData.data ?? (Array.isArray(usersData) ? usersData : [])
      allUsers.sort((a: any, b: any) => {
        const ta = new Date(a.date_joined ?? a.created_at ?? 0).getTime()
        const tb = new Date(b.date_joined ?? b.created_at ?? 0).getTime()
        return tb - ta
      })
      setCivicUsers(allUsers.filter((u: any) => (u.role ?? '').toLowerCase().includes('civic')).slice(0, 4))
      setDeptUsers(allUsers.filter((u: any) => (u.role ?? '').toLowerCase().includes('department')).slice(0, 4))

      setLastUpdated(new Date().toLocaleTimeString())
    } catch (e: any) {
      console.error('Dashboard fetch error:', e)
      setError(e.message ?? 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // BroadcastChannel: refresh when a new complaint is submitted
  useEffect(() => {
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('complaints')
      bc.onmessage = (ev) => { if (ev?.data?.type === 'new-complaint') fetchAll() }
    } catch {}
    return () => { try { bc?.close() } catch {} }
  }, [fetchAll])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Last updated: {lastUpdated || '—'}
            </p>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Complaints"
            value={kpi.total.toLocaleString()}
            icon={<FileText className="w-6 h-6" />}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
            borderColor="border-indigo-200"
            loading={loading}
          />
          <StatsCard
            title="Resolved"
            value={kpi.resolved.toLocaleString()}
            icon={<CheckCircle2 className="w-6 h-6" />}
            color="text-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            loading={loading}
          />
          <StatsCard
            title="Pending"
            value={kpi.pending.toLocaleString()}
            icon={<Clock className="w-6 h-6" />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
            loading={loading}
          />
          <StatsCard
            title="In Progress"
            value={kpi.inprogress.toLocaleString()}
            icon={<Activity className="w-6 h-6" />}
            color="text-orange-600"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Monthly Trends — takes 2/3 width */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Monthly Complaint Trends"
              subtitle="Number of complaints filed per month (last 12 months)"
              loading={loading}
            >
              {monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      angle={-40}
                      textAnchor="end"
                      height={70}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                      formatter={(v: any) => [`${v} complaints`, 'Count']}
                    />
                    <Area
                      type="monotone"
                      dataKey="complaints"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={{ r: 3, fill: '#6366f1' }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <Activity className="w-10 h-10 mb-2 text-gray-300" />
                  <p className="text-sm">No complaint data available yet</p>
                </div>
              )}
            </ChartCard>
          </div>

          {/* User Role Distribution — takes 1/3 width */}
          <ChartCard
            title="User Distribution"
            subtitle="Breakdown by role"
            loading={loading}
          >
            {roles.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roles}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {roles.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    formatter={(v: any, name: any) => [`${v} users`, name]}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <Users className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-sm">No users registered yet</p>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Recent Complaints */}
        <ChartCard
          title="Recent Complaints"
          subtitle="Latest 6 complaints filed in the system"
          loading={loading}
        >
          {recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">District</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{c.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.description}</p>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{c.district}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[c.priority.toLowerCase()] ?? 'bg-gray-100 text-gray-700'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status.toLowerCase()] ?? 'bg-gray-100 text-gray-700'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs">{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              No complaints found
            </div>
          )}
        </ChartCard>

        {/* Latest Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Latest Civic Users" subtitle="Most recently registered citizens" loading={loading}>
            {civicUsers.length > 0 ? (
              <div className="space-y-3">
                {civicUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {(u.username ?? u.email ?? '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.username ?? u.email}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-400 text-sm">No civic users yet</div>
            )}
          </ChartCard>

          <ChartCard title="Latest Department Users" subtitle="Most recently registered department staff" loading={loading}>
            {deptUsers.length > 0 ? (
              <div className="space-y-3">
                {deptUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {(u.username ?? u.email ?? '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.username ?? u.email}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-400 text-sm">No department users yet</div>
            )}
          </ChartCard>
        </div>

      </div>
    </div>
  )
}