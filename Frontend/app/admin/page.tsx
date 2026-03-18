'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboardKPIs, DashboardKPI } from '../../services/dashboardService'
import ComplaintStatusChart from '../../components/admin/dashboard/ComplaintStatusChart'

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [statsCards, setStatsCards] = useState<DashboardKPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryChartData, setCategoryChartData] = useState<{ name: string; value: number; color: string }[]>([])
  const [complaintStatusData, setComplaintStatusData] = useState([
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'In Progress', value: 0, color: '#8b5cf6' },
    { name: 'Resolved', value: 0, color: '#16a34a' },
  ])
  const [recentComplaints, setRecentComplaints] = useState<any[]>([])
  const [rcStatusFilter, setRcStatusFilter] = useState('All')
  const [rcPriorityFilter, setRcPriorityFilter] = useState('All')
  const [rcSearch, setRcSearch] = useState('')
  const [adminStats, setAdminStats] = useState({ total_users: 0, total_categories: 0, total_officers: 0 })

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  const CATEGORY_COLORS = [
    '#3b82f6', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4',
    '#f97316', '#84cc16', '#ec4899', '#14b8a6', '#a855f7', '#eab308',
  ]

  const fetchKPIs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardKPIs()
      setStatsCards(data)
    } catch (err: any) {
      setError('Failed to fetch dashboard data from backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKPIs()

    const fetchComplaintStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admindashboardcard/`)
        const data = await res.json()
        setComplaintStatusData([
          { name: 'Pending', value: Number(data.Pending_comp) || 0, color: '#f59e0b' },
          { name: 'In Progress', value: Number(data.inprogress_comp) || 0, color: '#8b5cf6' },
          { name: 'Resolved', value: Number(data.resolved_comp) || 0, color: '#16a34a' },
        ])
      } catch (err) {
        console.error('Failed to fetch complaint status', err)
      }
    }

    const fetchRecentComplaints = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/getcomplaint/`)
        const data = await res.json()
        setRecentComplaints(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch recent complaints', err)
      }
    }

    const fetchAdminStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/adminstats/`)
        const data = await res.json()
        setAdminStats({ total_users: data.total_users || 0, total_categories: data.total_categories || 0, total_officers: data.total_officers || 0 })
      } catch (err) {
        console.error('Failed to fetch admin stats', err)
      }
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories/`)
        const data: { name: string; total_comp: number }[] = await res.json()
        setCategoryChartData(
          data.map((cat, i) => ({
            name: cat.name,
            value: cat.total_comp || 0,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          }))
        )
      } catch (err) {
        console.error('Failed to fetch categories', err)
      }
    }

    fetchComplaintStatus()
    fetchRecentComplaints()
    fetchAdminStats()
    fetchCategories()
  }, [])

  const fallbackKPIs: DashboardKPI[] = [
    { title: 'Total Complaints', value: '0', trend: '+0%', trendUp: true, badge: 'All Time', bgColor: 'bg-blue-50', borderColor: 'border-blue-500', textColor: 'text-blue-700' },
    { title: 'Resolved Complaints', value: '0', trend: '+0%', trendUp: true, badge: 'Completed', bgColor: 'bg-green-50', borderColor: 'border-green-500', textColor: 'text-green-700' },
    { title: 'Pending Complaints', value: '0', trend: '+0%', trendUp: false, badge: 'Action Needed', bgColor: 'bg-orange-50', borderColor: 'border-orange-500', textColor: 'text-orange-700' },
    { title: 'In Progress', value: '0', trend: '+0%', trendUp: true, badge: 'Working', bgColor: 'bg-purple-50', borderColor: 'border-purple-500', textColor: 'text-purple-700' },
  ]

  const displayKPIs = statsCards.length > 0 ? statsCards.slice(0, 4) : fallbackKPIs
  const isUsingBackendData = statsCards.length > 0


  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-orange-100 text-orange-700 border-orange-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'resolved': 'bg-green-100 text-green-700 border-green-200',
    }
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'High': 'text-orange-600 font-semibold',
      'Medium': 'text-yellow-600',
      'Low': 'text-green-600',
    }
    return colors[priority] || 'text-slate-600'
  }

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">Gujarat CivicTrack</h1>
            <p className="text-sm text-[#64748B] mt-1">Smart City Governance & Civic Complaint Portal</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#2563EB] font-medium">Real-time Monitoring</p>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#1E293B]">Key Performance Indicators</h2>
            <div className={`px-2 py-1 rounded text-xs font-medium ${isUsingBackendData ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {isUsingBackendData ? '🟢 Live Data' : '🟠 Demo Data'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-[#2563EB]">Loading...</span>
              </div>
            )}
            {error && <span className="text-sm text-[#EF4444]">⚠️ {error}</span>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayKPIs.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl border-t-4 ${card.borderColor} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-5 ${loading ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{card.title}</p>
                  <p className="text-3xl font-bold text-[#1E293B] mt-2">{loading ? '...' : card.value}</p>
                </div>
                <div className={`${card.bgColor} ${card.textColor} px-2 py-1 rounded text-xs font-semibold`}>
                  {card.badge}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.trendUp ? <TrendingUp className="w-4 h-4 text-[#22C55E]" /> : <TrendingDown className="w-4 h-4 text-[#EF4444]" />}
                <span className={`text-sm font-semibold ${card.trendUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{card.trend}</span>
                <span className="text-xs text-[#64748B]">vs last month</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints - Block 1 */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="p-5 border-b border-[#E2E8F0]">
            <h3 className="text-lg font-semibold text-[#1E293B]">Recent Complaints</h3>
            <p className="text-sm text-[#64748B]">Latest complaints submitted to system</p>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <div className="p-8 text-center text-[#64748B]">Loading...</div>
            ) : recentComplaints.length > 0 ? (
              recentComplaints.map((complaint) => (
                <div key={complaint.id} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold text-[#2563EB]">#{complaint.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(complaint.status || '')}`}>
                          {complaint.status || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#1E293B]">{complaint.title}</p>
                      <p className="text-xs text-[#64748B] mt-1">{complaint.location_District || ''}</p>
                    </div>
                    <span className={`text-xs font-semibold ${getPriorityColor(complaint.priority_level || '')}`}>
                      {complaint.priority_level || ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#64748B]">No complaints found</div>
            )}
          </div>
        </div>

        {/* Charts and Overview Row - Blocks 2, 3, 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Donut - Block 2 */}
          <ComplaintStatusChart />

          {/* Categories Pie - Block 3 */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Complaints by Category</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={200} height={220}>
                <PieChart>
                  <Pie data={categoryChartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                    {categoryChartData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [`${value} complaints`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] flex-1">
                {categoryChartData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-slate-600 flex-1">{entry.name}</span>
                    <span className="text-xs font-semibold text-slate-800">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overview Stats - Block 4 */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 p-6 pb-0">Overview</h3>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600">Registered</span>
                  </div>
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900">{adminStats.total_users}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">Working</span>
                  </div>
                  <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Total Officers</p>
                  <p className="text-3xl font-bold text-purple-900">{adminStats.total_officers}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">Configured</span>
                  </div>
                  <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-purple-900">{adminStats.total_categories}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}