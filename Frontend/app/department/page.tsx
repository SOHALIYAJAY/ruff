"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { BarChart3, TrendingUp, Users, FileText, Clock, CheckCircle2, Activity, AlertTriangle, Calendar, Target, Award, RefreshCw, Eye, Wifi, WifiOff, UserCheck } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Link from "next/link"
import api from '@/lib/axios'

// Types
interface DashboardStats {
  total: number
  pending: number
  inProgress: number
  resolved: number
}

interface PerformanceMetrics {
  avgResolutionTime: number
  slaCompliance: number
  officerWorkload: number
  citizenSatisfaction: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  time: string
  officer?: string
}

interface Complaint {
  id: number
  title: string
  description: string
  status: string
  priority: string
  current_time: string
  location_address: string
  Category: string
}

interface DashboardData {
  stats: DashboardStats
  performance: PerformanceMetrics
  recentComplaints: Complaint[]
  recentActivity: RecentActivity[]
  roleDistribution?: {
    totalOfficers: number
    activeOfficers: number
    inactiveOfficers: number
    totalUsers: number
    activeUsers: number
  }
}

interface ApiError {
  message: string
  status?: number
}

// Constants
const REFRESH_INTERVAL = 30000 // 30 seconds
const STATUS_CONFIG = {
  'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
  'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Progress' },
  'resolved': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Resolved' },
  'default': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' }
} as const

const PRIORITY_CONFIG = {
  'high': { color: 'text-red-600 bg-red-50', label: 'High' },
  'medium': { color: 'text-orange-600 bg-orange-50', label: 'Medium' },
  'low': { color: 'text-green-600 bg-green-50', label: 'Low' },
  'default': { color: 'text-gray-600 bg-gray-50', label: 'Unknown' }
} as const

// Utility functions
const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase()
  return STATUS_CONFIG[normalizedStatus as keyof typeof STATUS_CONFIG]?.color || STATUS_CONFIG.default.color
}

const getPriorityColor = (priority: string): string => {
  const normalizedPriority = priority?.toLowerCase()
  return PRIORITY_CONFIG[normalizedPriority as keyof typeof PRIORITY_CONFIG]?.color || PRIORITY_CONFIG.default.color
}

const getActivityIcon = (type: string) => {
  const iconConfig = {
    'complaint': <FileText className="w-4 h-4 text-blue-600" />,
    'resolution': <CheckCircle2 className="w-4 h-4 text-green-600" />,
    'assignment': <Users className="w-4 h-4 text-purple-600" />,
    'system': <AlertTriangle className="w-4 h-4 text-orange-600" />,
    'default': <Activity className="w-4 h-4 text-gray-600" />
  }
  return iconConfig[type as keyof typeof iconConfig] || iconConfig.default
}

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0'
  }
  return new Intl.NumberFormat().format(num)
}

const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`
}

// Components
const LoadingSkeleton = () => (
  <div className="p-4 lg:p-6 space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="p-4 lg:p-6">
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Dashboard Error</h3>
      </div>
      <p className="text-red-700 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Retry Loading Data
      </button>
    </div>
  </div>
)

const EmptyState = () => (
  <div className="p-4 lg:p-6">
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
      <p className="text-gray-500">There is currently no data to display in the dashboard.</p>
    </div>
  </div>
)

const normalizeBorderColor = (b?: string) => {
  if (!b) return ''
  if (b.startsWith('border-t-') || b.startsWith('border-t[') || b.startsWith('border-t')) return `border-t-4 ${b}`
  if (b.startsWith('border-')) return `border-t-4 border-t-${b.slice('border-'.length)}`
  return `border-t-4 border-t-${b}`
}

const StatsCard = ({ title, value, subtitle, icon, color, borderColor }: any) => (
  <div className={`bg-white rounded-xl border border-gray-200 ${normalizeBorderColor(borderColor)} shadow-sm p-5 hover:shadow-md transition-shadow h-full`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`${color} p-2 rounded-lg`}>
        {icon}
      </div>
    </div>
    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900">{formatNumber(value)}</p>
    <div className="mt-2 text-xs text-gray-500">{subtitle}</div>
  </div>
)

const PerformanceMetric = ({ icon, label, value, iconColor }: any) => (
  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <div className="flex items-center gap-2">
      <div className={iconColor}>{icon}</div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-lg font-semibold text-gray-900">{value}</span>
  </div>
)

const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
  <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
    <div className="flex items-start gap-3">
      <div className="mt-1">{getActivityIcon(activity.type)}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{activity.time}</span>
          {activity.officer && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-gray-500">{activity.officer}</span>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)

const ComplaintItem = ({ complaint }: { complaint: Complaint }) => (
  <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold text-blue-600">#{complaint.id}</span>
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(complaint.status)}`}>
            {complaint.status}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(complaint.priority)}`}>
            {complaint.priority}
          </span>
        </div>
        <h4 className="text-sm font-medium text-gray-900 mb-1">{complaint.title}</h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {complaint.current_time}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {complaint.Category}
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {complaint.location_address}
          </span>
        </div>
      </div>
    </div>
  </div>
)

const QuickActionCard = ({ href, icon, title, description, iconColor, hoverBorderColor }: any) => (
  <Link href={href} className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-${hoverBorderColor} hover:shadow-md transition-all group`}>
    <div className="flex items-center gap-4">
      <div className={`${iconColor} p-3 rounded-lg group-hover:bg-opacity-100 transition-colors`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
)

// Main Component
export default function DepartmentDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // (Header filters removed)

  // Fetch dashboard data with error handling and caching
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch dashboard data (no header-side filters)
      const response = await api.get(`/api/department/dashboard/`)
      
      // Validate response data
      const data = response.data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }
      
      setDashboardData(data)
      setLastUpdated(new Date())
      setIsOnline(true)
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data'
      setError(errorMessage)
      setIsOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Ensure roleDistribution exists in object shape required by this page.
  useEffect(() => {
    const needsRoleObject = () => {
      if (!dashboardData) return true
      const rd = (dashboardData as any).roleDistribution
      // If roleDistribution is missing or an array, we need to derive an object
      if (!rd) return true
      if (Array.isArray(rd)) return true
      // If object but missing numeric fields
      if (typeof rd.totalUsers !== 'number' || typeof rd.activeOfficers !== 'number' || typeof rd.inactiveOfficers !== 'number') return true
      return false
    }

    if (!needsRoleObject()) return

    const deriveRoleDistribution = async () => {
      try {
        const resp = await api.get('/api/users/')
        const data = resp.data
        let users: any[] = []
        if (Array.isArray(data)) users = data
        else if (data.results) users = data.results
        else if (data.data) users = data.data

        // normalize users and exclude admins
        const processed = users.map((u: any) => ({
          role: (u.role || '').toString(),
          is_active: u.is_active !== undefined ? u.is_active : true
        })).filter((u: any) => {
          const role = (u.role || '').toLowerCase()
          return !role.includes('admin') && !role.includes('administrator')
        })

        const totalUsers = processed.length
        const officers = processed.filter((u: any) => (u.role || '').toLowerCase().includes('officer'))
        const activeOfficers = officers.filter((o: any) => o.is_active).length
        const inactiveOfficers = officers.length - activeOfficers

        // Classify users into Civic vs Department (fallback heuristics)
        let civicUsers = 0
        let departmentUsers = 0
        processed.forEach((u: any) => {
          const role = (u.role || '').toLowerCase()
          if (role.includes('officer')) return // counted separately
          if (role.includes('department')) departmentUsers++
          else if (role.includes('civic')) civicUsers++
          else if (role.includes('user')) civicUsers++
          else departmentUsers++
        })

        // set roleDistribution as an array (consistent with other pages)
        const rdArray = [
          { name: 'Civic Users', value: civicUsers, color: '#3B82F6' },
          { name: 'Department Users', value: departmentUsers, color: '#6366F1' },
        ]

        setDashboardData((prev) => ({
          ...(prev || {}),
          roleDistribution: rdArray
        }))
      } catch (err) {
        console.error('Failed to derive role distribution:', err)
      }
    }

    deriveRoleDistribution()
  }, [])

  // Auto-refresh with cleanup
  useEffect(() => {
    fetchDashboardData()
    
    const interval = setInterval(() => {
      if (isOnline) {
        fetchDashboardData()
      }
    }, REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [fetchDashboardData, isOnline, refreshKey])

  // Manual refresh
  const handleRefresh = useCallback(() => {
    setLoading(true)
    setRefreshKey(prev => prev + 1)
  }, [])

  // Memoized stats calculations
  const statsCards = useMemo(() => {
    if (!dashboardData) return []
    
    return [
      {
        title: 'Total Users',
        value: dashboardData.stats?.total || 0,
        subtitle: 'All registered users',
        icon: <Users className="w-5 h-5" />,
        color: 'bg-blue-50 text-blue-600',
        borderColor: 'border-t-[#1e40af]'
      },
      {
        title: 'Total Officers',
        value: dashboardData.stats?.pending || 0,
        subtitle: 'All department officers',
        icon: <UserCheck className="w-5 h-5" />,
        color: 'bg-yellow-50 text-yellow-600',
        borderColor: 'border-t-[#f59e0b]'
      },
      {
        title: 'In Progress',
        value: dashboardData.stats?.inProgress || 0,
        subtitle: 'Currently being addressed',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'bg-blue-50 text-blue-600',
        borderColor: 'border-t-[#3b82f6]'
      },
      {
        title: 'Resolved',
        value: dashboardData.stats?.resolved || 0,
        subtitle: 'Successfully completed',
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: 'bg-green-50 text-green-600',
        borderColor: 'border-t-[#16a34a]'
      }
    ]
  }, [dashboardData])

  // Monthly complaints for department (separate API call - fallback to dashboardData if available)
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>([])
  const [monthlyLoading, setMonthlyLoading] = useState(true)

  useEffect(() => {
    let mounted = true
        const fetchMonthly = async () => {
      try {
        setMonthlyLoading(true)
        const resp = await api.get('/api/complaintmonthwise/')
        const data = resp.data
            console.log('department: /api/complaintmonthwise response:', data)
        // try to normalize several shapes
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        let values: number[] = []
        if (data && data.monthly_data) {
          values = monthNames.map((_, i) => Number(data.monthly_data?.[i+1]?.count || 0))
        } else if (data && data.simplified) {
          values = monthNames.map((_, i) => Number(data.simplified?.[i+1] || 0))
        } else if (Array.isArray(data)) {
          // array of months
          const byIndex = data.reduce((acc: any, itm: any) => {
            if (typeof itm.month_number === 'number') acc[itm.month_number] = Number(itm.complaints || 0)
            return acc
          }, {})
          values = monthNames.map((_, i) => Number(byIndex[i+1] || 0))
        } else {
          values = monthNames.map((_, i) => Number((dashboardData as any)?.monthly?.[i+1] || 0))
        }

        if (mounted) setMonthlyCounts(values)
      } catch (e) {
        console.error('Failed to load monthly complaints:', e)
      } finally {
        if (mounted) setMonthlyLoading(false)
      }
    }

    fetchMonthly()
    return () => { mounted = false }
  }, [dashboardData])

  const performanceMetrics = useMemo(() => {
    if (!dashboardData || !dashboardData.performance) return []

    const perf = dashboardData.performance || { avgResolutionTime: 0, officerWorkload: 0, citizenSatisfaction: 0 }
    return [
      {
        icon: <Target className="w-4 h-4" />,
        label: 'Avg Resolution Time',
        value: `${perf.avgResolutionTime ?? 0} days`,
        iconColor: 'text-blue-600'
      },
      {
        icon: <Users className="w-4 h-4" />,
        label: 'Officer Workload',
        value: `${perf.officerWorkload ?? 0}/officer`,
        iconColor: 'text-orange-600'
      },
      {
        icon: <Activity className="w-4 h-4" />,
        label: 'Citizen Satisfaction',
        value: `${perf.citizenSatisfaction ?? 0}/5.0`,
        iconColor: 'text-purple-600'
      }
    ]
  }, [dashboardData])

  // Normalize roleDistribution into a list of pie entries for the chart and legend
  const userDistributionEntries = useMemo(() => {
    if (!dashboardData) return []
    const rd: any = (dashboardData as any).roleDistribution
    if (!rd) return []

    if (Array.isArray(rd)) {
      return rd.map((e: any) => ({ name: e.name, value: Number(e.value || 0), color: e.color || '#3B82F6' }))
    }

    // object shape fallback
    return [
      { name: 'Department Users', value: Number(rd.totalUsers || 0), color: '#3B82F6' },
      { name: 'Active Officers', value: Number(rd.activeOfficers || 0), color: '#10B981' },
      { name: 'Inactive Officers', value: Number(rd.inactiveOfficers || 0), color: '#F59E0B' }
    ]
  }, [dashboardData])

  // Loading state
  if (loading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />
  }

  // Empty state
  if (!dashboardData) {
    return <EmptyState />
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time overview of department operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Refresh</span>
          </button>
          {lastUpdated && (
            <div className="text-sm text-gray-500">Updated {lastUpdated.toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* User Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
            <p className="text-sm text-gray-600">Department users and officers breakdown</p>
          </div>
          
          {userDistributionEntries && userDistributionEntries.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistributionEntries}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {userDistributionEntries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: any) => {
                      const total = userDistributionEntries.reduce((s, e) => s + Number(e.value || 0), 0)
                      const percent = total ? ((value / total) * 100).toFixed(1) : '0.0'
                      return [`${value}`, `${percent}%`]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-3">
                {userDistributionEntries.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <span style={{ width: 12, height: 12, backgroundColor: entry.color, borderRadius: 3, display: 'inline-block' }} />
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">{entry.name}</div>
                      <div className="text-xs text-gray-500">{entry.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No User Data Available</h3>
                <p className="text-gray-600 mb-4">No user distribution data available.</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Check if users exist in the database</p>
                  <p>• Verify user roles are properly assigned</p>
                  <p>• Ensure the API endpoint is accessible</p>
                </div>
              </div>
            </div>
          )}
          </div>
          {/* Monthly Complaints Trend (uses DB values) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Complaints</h3>
              <p className="text-sm text-gray-600">Last 12 months</p>
            </div>

            {monthlyLoading ? (
                  <div className="h-48 flex items-center justify-center text-gray-500">Loading chart…</div>
                ) : (
                  <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({ name: m, complaints: monthlyCounts[i] || 0 }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="complaints" fill="hsl(var(--sidebar-primary))" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Debug / fallback */}
            {(!monthlyLoading && monthlyCounts.reduce((s, v) => s + (v || 0), 0) === 0) && (
              <div className="mt-3 text-sm text-gray-500">No monthly complaint data available (API returned zeroes or is inaccessible).</div>
            )}
          </div>
        </div>

        {/* Performance Metrics & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                <p className="text-sm text-gray-600">Department efficiency indicators</p>
              </div>
            </div>
          </div>
          
          <div className="p-5 space-y-2">
            {performanceMetrics.map((metric, index) => (
              <PerformanceMetric key={index} {...metric} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Latest department actions</p>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          href="/department/assigned"
          icon={<FileText className="w-6 h-6" />}
          title="Manage Complaints"
          description="View and assign complaints"
          iconColor="bg-blue-50 text-blue-600"
          hoverBorderColor="blue-500"
        />
        <QuickActionCard
          href="/department/officers"
          icon={<Users className="w-6 h-6" />}
          title="Manage Officers"
          description="Manage department officers"
          iconColor="bg-purple-50 text-purple-600"
          hoverBorderColor="purple-500"
        />
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
              <p className="text-sm text-gray-600">Latest complaints submitted to department</p>
            </div>
            <Link 
              href="/department/assigned" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              View All
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {dashboardData.recentComplaints.length > 0 ? (
            dashboardData.recentComplaints.map((complaint) => (
              <ComplaintItem key={complaint.id} complaint={complaint} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No recent complaints</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Status Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Department Status
          </h3>
          <p className="text-sm text-gray-600">Current operational status and alerts</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-900">All Systems Operational</div>
                <div className="text-xs text-green-700">No active issues reported</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium text-yellow-900">High Volume Alert</div>
                <div className="text-xs text-yellow-700">{dashboardData.stats.pending > 10 ? 'High' : 'Normal'} volume of pending complaints</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Performance Trend:</span>
              <span className="text-green-600 font-semibold">
                {dashboardData.performance.slaCompliance > 80 ? 'Excellent' : dashboardData.performance.slaCompliance > 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">SLA Compliance: {formatPercentage(dashboardData.performance.slaCompliance)}</p>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-4">
        <RefreshCw className="w-3 h-3" />
        <span>Auto-refreshing every 30 seconds</span>
      </div>
    </div>
  )
}
