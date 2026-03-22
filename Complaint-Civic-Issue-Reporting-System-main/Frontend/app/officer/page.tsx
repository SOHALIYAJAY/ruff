"use client"

import React, { useState, useEffect } from 'react'
import { Edit, Plus, RefreshCw, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardStatsCards from '@/components/officer/dashboard/dashboard-stats-cards'
import MonthlyTrendPanel from '@/components/officer/dashboard/monthly-trend'
import RecentComplaintsPanel from '@/components/officer/dashboard/recent-complaints-panel'

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

  const defaultStats: DashboardStats = {
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    overdueComplaints: 0,
    averageResolutionTime: 0,
    performanceScore: 0,
    todayComplaints: 0,
    weeklyComplaints: 0,
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/api/officer/dashboard-stats/`, { headers })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        const errorData = await statsResponse.text()
        console.error('Stats error response:', errorData)
      }

      // Fetch recent complaints
      const complaintsResponse = await fetch(`${API_BASE}/api/officer/recent-complaints/`, { headers })
      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json()
        setRecentComplaints(complaintsData)
      } else {
        const errorData = await complaintsResponse.text()
        console.error('Complaints error response:', errorData)
      }

      // Fetch monthly trends
      const trendsResponse = await fetch(`${API_BASE}/api/officer/monthly-trends/`, { headers })
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        setMonthlyData(trendsData)
      } else {
        const errorData = await trendsResponse.text()
        console.error('Trends error response:', errorData)
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sidebar-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
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
        <DashboardStatsCards stats={stats || defaultStats} />

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <MonthlyTrendPanel data={monthlyData} />

          {/* Recent Complaints */}
          <RecentComplaintsPanel complaints={recentComplaints} />
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
  )
}