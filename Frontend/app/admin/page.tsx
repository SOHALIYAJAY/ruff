'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, FileText, Clock, CheckCircle2, Activity, AlertTriangle, Calendar, Target, Award, RefreshCw, Eye } from 'lucide-react'
import Link from 'next/link'
import api, { apiGet } from '@/lib/api'
import StatsCard from '@/components/ui/stats-card'

interface KPIData {
  total_comp: number
  resolved_comp: number
  Pending_comp: number
  inprogress_comp: number
}

interface MonthlyData {
  month: string
  month_number: number
  complaints: number
  density: number
}

interface DensityResponse {
  monthly_data: MonthlyData[]
  density_data: MonthlyData[]
  year: number
  total_complaints: number
}

interface RoleData {
  name: string
  value: number
  color: string
}

interface RecentComplaint {
  id: number
  title: string
  description: string
  status: string
  priority_level: string
  location_District: string
  created_at: string
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  borderColor: string
  loading?: boolean
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  loading?: boolean
}

// Format date properly
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Unknown'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } catch {
    return dateString || 'Unknown'
  }
}

export default function AdminDashboard() {
  const [kpiData, setKpiData] = useState<KPIData>({
    total_comp: 0,
    resolved_comp: 0,
    Pending_comp: 0,
    inprogress_comp: 0
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [roleData, setRoleData] = useState<RoleData[]>([])
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([])
  const [latestCivicUsers, setLatestCivicUsers] = useState<any[]>([])
  const [latestDepartmentUsers, setLatestDepartmentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const POLL_INTERVAL_MS = 15000 // 15 seconds

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard cards data
      const kpiResult = await apiGet('/api/admindashboardcard/')
      
      const totalComplaints = kpiResult.total_complaints || kpiResult.total_comp || 0
      const resolvedComplaints = kpiResult.resolved_complaints || kpiResult.resolved_comp || 0
      const pendingComplaints = kpiResult.pending_complaints || kpiResult.Pending_comp || 0
      const inprogressComplaints = kpiResult.inprogress_complaints || kpiResult.inprogress_comp || 0
      
      setKpiData({
        total_comp: totalComplaints,
        resolved_comp: resolvedComplaints,
        Pending_comp: pendingComplaints,
        inprogress_comp: inprogressComplaints
      })

      // Fetch complaint trends data
      const trendsResult = await apiGet('/api/complaint-status-trends/')
      
      // Handle new response structure with actual complaint data
      let transformedTrendsData: MonthlyData[] = []
      
      if (trendsResult && trendsResult.monthly_data) {
        // Use actual complaint counts for visualization
        transformedTrendsData = trendsResult.monthly_data.map((item: any) => ({
          month: item.month || 'Unknown',
          month_number: item.month_number || 1,
          complaints: item.complaints || 0,
          density: item.complaints || 0  // Use actual complaint count as density
        }))
      } else if (Array.isArray(trendsResult)) {
        // Fallback to old format
        transformedTrendsData = trendsResult.map((item: any) => ({
          month: item.month || 'Unknown',
          month_number: item.month_number || 1,
          complaints: item.complaints || 0,
          density: item.complaints || 0  // Use actual complaint count as density
        }))
      }
      
      setMonthlyData(transformedTrendsData)

      // Fetch user role distribution
      const roleResult = await apiGet('/api/user-role-distribution/')
      
      console.log('Role distribution API response:', roleResult)
      
      // Use real API response data
      const transformedRoleData = [
        { name: 'Regular Users', value: roleResult?.regular_users || 0, color: 'hsl(var(--sidebar-primary))' },
        { name: 'Officers', value: roleResult?.officers || 0, color: '#10B981' },
        { name: 'Admins', value: roleResult?.admins || 0, color: '#F59E0B' }
      ]
      
      console.log('Transformed role data:', transformedRoleData)
      console.log('Role data values:', transformedRoleData.map(r => `${r.name}: ${r.value}`))
      console.log('Any role with value > 0?', transformedRoleData.some(r => r.value > 0))
      
      setRoleData(transformedRoleData)

      // Fetch recent complaints
      const recentResult = await apiGet('/api/recent-complaints-admin/')
      
      const transformedRecentData = Array.isArray(recentResult.data) 
        ? recentResult.data.slice(0, 4).map((item: any) => ({
            id: item.id || 0,
            title: item.title || 'Untitled Complaint',
            description: item.Description || 'No description available',
            status: item.status || 'Unknown',
            priority_level: item.priority_level || 'Medium',
            location_District: item.location_District || 'Unknown',
            created_at: item.current_time || new Date().toISOString()
          }))
        : []
      
      setRecentComplaints(transformedRecentData)

      // Fetch latest users and split by role (Civic-User, Department-User)
      try {
        const usersResult = await apiGet('/api/users/')
        let usersList: any[] = []
        if (Array.isArray(usersResult)) usersList = usersResult
        else if (usersResult.results) usersList = usersResult.results
        else if (usersResult.data) usersList = usersResult.data

        // Sort by created_at / date fields if available (fallback to id desc)
        usersList.sort((a: any, b: any) => {
          const ta = new Date(a.date_joined || a.created_at || a.current_time || 0).getTime() || (b.id ? b.id - a.id : 0)
          const tb = new Date(b.date_joined || b.created_at || b.current_time || 0).getTime() || (b.id ? b.id - a.id : 0)
          return tb - ta
        })

        const civic = usersList.filter(u => (u.role || '').toString().toLowerCase().includes('civic'))
        const dept = usersList.filter(u => (u.role || '').toString().toLowerCase().includes('department'))

        setLatestCivicUsers(civic.slice(0, 3))
        setLatestDepartmentUsers(dept.slice(0, 3))
      } catch (err) {
        console.warn('Failed to fetch latest users for dashboard', err)
        setLatestCivicUsers([])
        setLatestDepartmentUsers([])
      }

      setLastUpdated(new Date().toLocaleTimeString())
      setMounted(true)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
      
      // Set empty data to prevent chart errors
      setMonthlyData([])
      setRoleData([])
      setRecentComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Poll the dashboard endpoint periodically so charts update even if BroadcastChannel
  // is not supported or messages are missed.
  useEffect(() => {
    let interval: number | undefined
    try {
      interval = window.setInterval(() => {
        fetchData()
      }, POLL_INTERVAL_MS)
    } catch (err) {
      console.warn('Polling not available:', err)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  // Listen for cross-tab notifications about new complaints and refresh data
  useEffect(() => {
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('complaints')
      bc.onmessage = (ev) => {
        if (ev?.data?.type === 'new-complaint') {
          fetchData()
        }
      }
    } catch (err) {
      console.warn('BroadcastChannel not available:', err)
    }

    return () => {
      try {
        if (bc) bc.close()
      } catch {}
    }
  }, [])

  // compute maxima and layout helpers for charts
  const maxComplaints = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => Number(d.complaints || 0))) : 0
  const chartYAxisMax = Math.max(Math.ceil(maxComplaints * 1.2), 5) // at least 5 for visibility

  // Generate KDE data from actual monthly complaint data
  const generateKDEData = () => {
    if (monthlyData.length === 0) return []
    
    // Extract actual complaint counts and months from database
    const actualData = monthlyData.map(d => ({
      month: d.month || '',
      complaints: Number(d.complaints || 0)
    }))
    
    // Create smooth KDE curve that follows actual data
    const kdePoints = []
    const numPoints = 100
    
    for (let i = 0; i <= numPoints; i++) {
      const position = i / numPoints // 0 to 1
      
      // Find position in actual data
      const dataPosition = position * (actualData.length - 1)
      const index = Math.floor(dataPosition)
      const fraction = dataPosition - index
      
      // Get surrounding actual values
      const value1 = actualData[index]?.complaints || 0
      const value2 = actualData[Math.min(index + 1, actualData.length - 1)]?.complaints || 0
      
      // Linear interpolation with smoothing
      let smoothedValue = value1 + (value2 - value1) * fraction
      
      // Add some smoothing based on nearby points
      const smoothingWindow = 2
      let weightedSum = 0
      let totalWeight = 0
      
      for (let j = -smoothingWindow; j <= smoothingWindow; j++) {
        const sampleIndex = index + j
        if (sampleIndex >= 0 && sampleIndex < actualData.length) {
          const distance = Math.abs(j)
          const weight = Math.exp(-(distance * distance) / (2 * smoothingWindow * smoothingWindow))
          weightedSum += actualData[sampleIndex].complaints * weight
          totalWeight += weight
        }
      }
      
      if (totalWeight > 0) {
        smoothedValue = weightedSum / totalWeight
      }
      
      // Get month label for this position
      const monthIndex = Math.floor(position * (actualData.length - 1))
      const monthLabel = actualData[monthIndex]?.month || ''
      
      kdePoints.push({
        month: monthLabel,
        value: Math.max(0, smoothedValue),
        original: actualData[monthIndex]?.complaints || 0
      })
    }
    
    return kdePoints
  }

  const kdeData = generateKDEData()

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return num.toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-orange-100 text-orange-800'
      case 'low':
        return 'bg-sidebar-primary text-sidebar-primary-foreground'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, className, loading }) => (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-sidebar-primary/20 border-t-sidebar-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        children
      )}
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:bg-sidebar-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Real-time monitoring</span>
            <span>•</span>
            <span>Last updated: {lastUpdated}</span>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 px-2 py-1 text-sidebar-primary hover:bg-sidebar-primary/10 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Complaints"
            value={formatNumber(kpiData.total_comp || 0)}
            icon={<FileText className="w-6 h-6 text-sidebar-primary" />}
            color="text-sidebar-primary"
            borderColor="border-sidebar-primary/20"
            loading={loading}
          />
          <StatsCard
            title="Resolved"
            value={formatNumber(kpiData.resolved_comp || 0)}
            icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
            color="text-green-600"
            borderColor="border-green-200"
            loading={loading}
          />
          <StatsCard
            title="Pending"
            value={formatNumber(kpiData.Pending_comp || 0)}
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
            color="text-yellow-600"
            borderColor="border-yellow-200"
            loading={loading}
          />
          <StatsCard
            title="In Progress"
            value={formatNumber(kpiData.inprogress_comp || 0)}
            icon={<Activity className="w-6 h-6 text-orange-600" />}
            color="text-orange-600"
            borderColor="border-orange-200"
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Complaint Trends (KDE Plot)"
            subtitle="Smooth density visualization of monthly complaint data"
            loading={loading}
          >
            {monthlyData.length > 0 ? (
              <>
                {/* Debug: Show data structure */}
                <div className="text-xs text-gray-500 mb-2">
                  Debug KDE: {JSON.stringify(kdeData.slice(0, 2))} | Monthly: {JSON.stringify(monthlyData.slice(0, 2))} | Total: {monthlyData.length} months
                </div>
                <ResponsiveContainer width="100%" height={450}>
                <AreaChart data={kdeData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                  <defs>
                    <linearGradient id="kdeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--sidebar-primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--sidebar-primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    domain={[0, chartYAxisMax]}
                    allowDecimals={false}
                    label={{ value: 'Number of Complaints', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
                    formatter={(value: any, name: any, props: any) => {
                      const originalValue = props.payload?.original || 0
                      return [
                        <div style={{ color: 'hsl(var(--sidebar-primary))', fontWeight: 600, fontSize: '14px' }}>
                          {originalValue} Complaints
                        </div>,
                        <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
                          Month: {props.payload?.month || ''}
                        </div>
                      ]
                    }}
                    cursor={{ fill: 'hsl(var(--sidebar-primary))', fillOpacity: 0.06 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--sidebar-primary))" 
                    strokeWidth={2}
                    fill="url(#kdeGradient)" 
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No complaint data available</p>
                  <p className="text-xs text-gray-400 mt-1">Database connection required</p>
                </div>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="User Distribution"
            subtitle="Users by role"
            loading={loading}
          >
            {roleData && roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="hsl(var(--sidebar-primary))" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <Pie
                    data={roleData}
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
                    {roleData.map((entry, index) => (
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
                    formatter={(value: any, name: any) => [
                      `${name}: ${value}`,
                      `${((roleData.find((r: any) => r.name === name)?.value || 0) / (roleData.reduce((sum: number, r: any) => sum + r.value, 0)) * 100).toFixed(1)}%`
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2C6.48 2 2 0 0-2.84 0-2.84C6.48 2v2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No User Role Data Available</h3>
                  <p className="text-gray-600 mb-4">No users found in the system with the specified roles.</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Check if users exist in the database</p>
                    <p>• Verify user roles are properly assigned (Civic-User, Department-User, Admin-User)</p>
                    <p>• Ensure the API endpoint is accessible</p>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Recent Complaints */}
        <ChartCard
          title="Recent Complaints"
          subtitle="Latest filed complaints"
          loading={loading}
        >
          <div className="space-y-3">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{complaint.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">{complaint.location_District}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority_level)}`}>
                      {complaint.priority_level}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent complaints found
              </div>
            )}
          </div>
        </ChartCard>

        {/* Latest Registered Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ChartCard title="Latest Civic Users" subtitle="Most recently registered civic users" loading={loading}>
            <div className="space-y-3">
              {latestCivicUsers.length > 0 ? (
                latestCivicUsers.map((u) => (
                  <div key={u.id || u.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{u.username || u.first_name || u.name || `User ${u.id}`}</p>
                      <p className="text-sm text-gray-500">{u.email || 'No email'}</p>
                    </div>
                    <div className="text-xs text-gray-400">{formatDate(u.date_joined || u.created_at || u.current_time)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">No civic users found</div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Latest Department Users" subtitle="Most recently registered department users" loading={loading}>
            <div className="space-y-3">
              {latestDepartmentUsers.length > 0 ? (
                latestDepartmentUsers.map((u) => (
                  <div key={u.id || u.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{u.username || u.first_name || u.name || `User ${u.id}`}</p>
                      <p className="text-sm text-gray-500">{u.email || 'No email'}</p>
                    </div>
                    <div className="text-xs text-gray-400">{formatDate(u.date_joined || u.created_at || u.current_time)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">No department users found</div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
