'use client'

import { useState, useEffect } from 'react'
import { FileText, TrendingUp, AlertCircle, CheckCircle2, Clock, BarChart3, PieChart } from 'lucide-react'

interface Complaint {
  id: string
  title: string
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  priority: 'High' | 'Medium' | 'Low'
  category: string
  date: string
  description?: string
}

interface AnalyticsData {
  total: number
  pending: number
  inProgress: number
  resolved: number
  rejected: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

export default function CleanAdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  })
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      const mockComplaints: Complaint[] = [
        {
          id: '1',
          title: 'Street Light Not Working',
          status: 'Pending',
          priority: 'High',
          category: 'Infrastructure',
          date: '2024-03-15',
          description: 'Street light on Main Street has been out for 3 days'
        },
        {
          id: '2',
          title: 'Garbage Collection Issue',
          status: 'In Progress',
          priority: 'Medium',
          category: 'Sanitation',
          date: '2024-03-14',
          description: 'Garbage not collected from residential area'
        },
        {
          id: '3',
          title: 'Water Leakage',
          status: 'Resolved',
          priority: 'High',
          category: 'Water Supply',
          date: '2024-03-13',
          description: 'Water leakage from main pipe fixed'
        },
        {
          id: '4',
          title: 'Road Damage',
          status: 'Pending',
          priority: 'Low',
          category: 'Infrastructure',
          date: '2024-03-12',
          description: 'Potholes on residential road need repair'
        },
        {
          id: '5',
          title: 'Noise Complaint',
          status: 'Resolved',
          priority: 'Medium',
          category: 'Environment',
          date: '2024-03-11',
          description: 'Construction noise during restricted hours'
        }
      ]

      const mockCategoryData: CategoryData[] = [
        { name: 'Infrastructure', value: 35, color: '#3b82f6' },
        { name: 'Sanitation', value: 28, color: '#10b981' },
        { name: 'Water Supply', value: 22, color: '#06b6d4' },
        { name: 'Environment', value: 18, color: '#8b5cf6' },
        { name: 'Electricity', value: 15, color: '#f59e0b' },
        { name: 'Others', value: 12, color: '#6b7280' }
      ]

      // Calculate analytics
      const analyticsData = {
        total: mockComplaints.length,
        pending: mockComplaints.filter(c => c.status === 'Pending').length,
        inProgress: mockComplaints.filter(c => c.status === 'In Progress').length,
        resolved: mockComplaints.filter(c => c.status === 'Resolved').length,
        rejected: mockComplaints.filter(c => c.status === 'Rejected').length
      }

      setComplaints(mockComplaints)
      setAnalytics(analyticsData)
      setCategoryData(mockCategoryData)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />
      case 'In Progress': return <TrendingUp className="w-4 h-4" />
      case 'Resolved': return <CheckCircle2 className="w-4 h-4" />
      case 'Rejected': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage civic complaints efficiently</p>
        </div>

        {/* Row 1: Recent Complaints (Full Width) */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Recent Complaints
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {complaints.length} Total
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {complaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No recent complaints found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {complaints.map((complaint) => (
                        <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(complaint.priority)}`}></div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900 mb-1">{complaint.title}</h3>
                                  <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="text-gray-500">#{complaint.id}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-500">{complaint.date}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-700 font-medium">{complaint.category}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}>
                                {getStatusIcon(complaint.status)}
                                {complaint.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Two Side-by-Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Complaint Analytics */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                Complaint Analytics
              </h2>
            </div>
            
            <div className="p-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.total}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.resolved}</div>
                  <div className="text-sm text-green-700">Resolved</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{analytics.pending}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.inProgress}</div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
              </div>

              {/* Simple Pie Chart Representation */}
              <div className="relative h-48 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-green-500"></div>
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-yellow-500 border-t-transparent border-r-transparent transform rotate-45"></div>
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-blue-500 border-b-transparent border-l-transparent transform -rotate-45"></div>
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-red-500 border-t-transparent border-l-transparent transform rotate-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{analytics.total}</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Resolved ({analytics.resolved})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending ({analytics.pending})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>In Progress ({analytics.inProgress})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Rejected ({analytics.rejected})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Complaints by Category */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Complaints by Category
              </h2>
            </div>
            
            <div className="p-6">
              {/* Bar Chart */}
              <div className="space-y-3 mb-6">
                {categoryData.map((category, index) => (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-gray-700 truncate">
                      {category.name}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${(category.value / Math.max(...categoryData.map(c => c.value))) * 100}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-semibold text-gray-900 text-right">
                      {category.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {categoryData.slice(0, 4).map((category) => (
                  <div key={category.name} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{category.name}</div>
                      <div className="text-xs text-gray-600">{category.value} complaints</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
