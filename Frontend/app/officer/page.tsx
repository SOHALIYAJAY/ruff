"use client"

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  BarChart3,
  PieChart,
  RefreshCw,
  Eye,
  Edit,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import RequireAuth from '@/components/auth/RequireAuth'

interface DashboardStats {
  totalComplaints: number
  resolvedComplaints: number
  pendingComplaints: number
  inProgressComplaints: number
  overdueComplaints: number
  averageResolutionTime: number
  performanceScore: number
  todayComplaints: number
  weeklyComplaints: number
}

interface RecentComplaint {
  id: number
  title: string
  category: string
  status: string
  priority: string
  date: string
  citizenName: string
  location: string
}

interface MonthlyData {
  month: string
  complaints: number
}

export default function OfficerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      console.log('Fetching dashboard data with token:', token ? 'Token exists' : 'No token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch dashboard stats
      console.log('Making request to:', `${API_BASE}/api/officer/dashboard-stats/`)
      const statsResponse = await fetch(`${API_BASE}/api/officer/dashboard-stats/`, { headers })
      console.log('Stats response status:', statsResponse.status)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('Stats data received:', statsData)
        setStats(statsData)
      } else {
        const errorData = await statsResponse.text()
        console.log('Stats error response:', errorData)
      }

      // Fetch recent complaints
      console.log('Making request to:', `${API_BASE}/api/officer/recent-complaints/`)
      const complaintsResponse = await fetch(`${API_BASE}/api/officer/recent-complaints/`, { headers })
      console.log('Complaints response status:', complaintsResponse.status)
      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json()
        console.log('Complaints data received:', complaintsData)
        setRecentComplaints(complaintsData)
      } else {
        const errorData = await complaintsResponse.text()
        console.log('Complaints error response:', errorData)
      }

      // Fetch monthly trends
      console.log('Making request to:', `${API_BASE}/api/officer/monthly-trends/`)
      const trendsResponse = await fetch(`${API_BASE}/api/officer/monthly-trends/`, { headers })
      console.log('Trends response status:', trendsResponse.status)
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        console.log('Trends data received:', trendsData)
        setMonthlyData(trendsData)
      } else {
        const errorData = await trendsResponse.text()
        console.log('Trends error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <RequireAuth role={['Officer']}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sidebar-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading dashboard...</p>
            <p className="mt-1 text-gray-400 text-sm">Loading state: {loading.toString()}</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth role={['Officer']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor your complaint management performance</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalComplaints || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">This week:</span>
              <span className="font-medium text-gray-900 ml-1">{stats?.weeklyComplaints || 0}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats?.resolvedComplaints || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Today:</span>
              <span className="font-medium text-green-600 ml-1">{stats?.todayComplaints || 0}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.inProgressComplaints || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Pending:</span>
              <span className="font-medium text-red-600 ml-1">{stats?.pendingComplaints || 0}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className={`text-2xl font-bold mt-1 ${getPerformanceColor(stats?.performanceScore || 0)}`}>
                  {stats?.performanceScore || 0}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getPerformanceBg(stats?.performanceScore || 0)}`}>
                <TrendingUp className={`w-6 h-6 ${getPerformanceColor(stats?.performanceScore || 0)}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Avg Resolution:</span>
              <span className="font-medium text-gray-900 ml-1">{stats?.averageResolutionTime || 0} days</span>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Complaint Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            {monthlyData.length > 0 ? (
              <div className="space-y-3">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{data.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-sidebar-primary h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (data.complaints / Math.max(...monthlyData.map(d => d.complaints))) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{data.complaints}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No monthly data available</p>
              </div>
            )}
          </div>

          {/* Recent Complaints */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            {recentComplaints.length > 0 ? (
              <div className="space-y-3">
                {recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">#{complaint.id}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{complaint.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {complaint.citizenName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {complaint.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {complaint.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-sidebar-primary hover:text-sidebar-primary/80">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent complaints</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/officer/complaints')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">View All Complaints</p>
                <p className="text-xs text-gray-500">Browse all system complaints</p>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/officer/update-status')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Update Status</p>
                <p className="text-xs text-gray-500">Change complaint statuses</p>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/officer/profile')}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">My Profile</p>
                <p className="text-xs text-gray-500">Manage your profile settings</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
