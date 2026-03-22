"use client"

import { useState, useEffect } from "react"
import { Building2, Users, FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Mail, Phone, Calendar, Activity, User, BarChart3, PieChart as PieChartIcon, TrendingDown } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '@/lib/axios'
import RequireAuth from '@/components/auth/RequireAuth'

// Types
interface HeadOfficer {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
}

interface DepartmentStatistics {
  total_complaints: number
  pending_complaints: number
  in_progress_complaints: number
  resolved_complaints: number
  resolution_rate: number
  avg_resolution_time: number
  sla_compliance: number
}

interface DepartmentOfficers {
  total: number
  active: number
  inactive: number
}

interface RecentActivity {
  id: string
  title: string
  status: string
  priority: string
  date: string
  citizen: string
}

interface MonthlyTrend {
  month: string
  complaints: number
}

interface Department {
  id: number
  name: string
  category: string
  description: string
  contact_email: string
  contact_phone: string
  head_officer: HeadOfficer | null
  statistics: DepartmentStatistics
  officers: DepartmentOfficers
  recent_activity: RecentActivity[]
  monthly_trends: MonthlyTrend[]
  created_at: string | null
}

interface DepartmentsOverview {
  departments: Department[]
  overview: {
    total_departments: number
    total_complaints: number
    total_resolved: number
    overall_resolution_rate: number
    total_officers: number
    total_pending: number
  }
}

// Constants
const STATUS_COLORS = {
  'pending': '#F59E0B',
  'in-progress': '#3B82F6',
  'resolved': '#10B981',
  'default': '#6B7280'
}

const PRIORITY_COLORS = {
  'high': '#EF4444',
  'medium': '#F59E0B',
  'low': '#10B981',
  'default': '#6B7280'
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function DepartmentsOverviewPage() {
  const [data, setData] = useState<DepartmentsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  useEffect(() => {
    fetchDepartmentsOverview()
  }, [])

  const fetchDepartmentsOverview = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/api/departments/overview/')
      setData(response.data)
    } catch (err: any) {
      console.error('Error fetching departments overview:', err)
      setError(err.response?.data?.message || 'Failed to load departments data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default
  const getPriorityColor = (priority: string) => PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.default

  // Loading state
  if (loading) {
    return (
      <RequireAuth role={['Admin-User', 'Department-User']}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading departments overview...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  // Error state
  if (error) {
    return (
      <RequireAuth role={['Admin-User', 'Department-User']}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-medium">Error loading data</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchDepartmentsOverview}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </RequireAuth>
    )
  }

  // Empty state
  if (!data || !data.departments.length) {
    return (
      <RequireAuth role={['Admin-User', 'Department-User']}>
        <div className="p-6">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-500">There are no departments to display at the moment.</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth role={['Admin-User', 'Department-User']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departments Overview</h1>
            <p className="text-gray-600 mt-1">Comprehensive view of all departments and their performance</p>
          </div>
          <button
            onClick={fetchDepartmentsOverview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.total_complaints}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.total_resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Officers</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.total_officers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.overall_resolution_rate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Department Information */}
        {data.departments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Department Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{data.departments[0].name}</h3>
                  <p className="text-blue-100">{data.departments[0].category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Your Department</p>
                  <p className="text-2xl font-bold">{data.departments[0].name}</p>
                </div>
              </div>
            </div>

            {/* Department Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.departments[0].contact_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.departments[0].contact_phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Head Officer</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.departments[0].head_officer?.name || 'Not Assigned'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.departments[0].head_officer?.email || 'Not Available'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-6 p-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Complaint Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">{data.departments[0].statistics.total_complaints}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resolved</p>
                    <p className="text-lg font-bold text-green-600">{data.departments[0].statistics.resolved_complaints}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-lg font-bold text-yellow-600">{data.departments[0].statistics.pending_complaints}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-lg font-bold text-blue-600">{data.departments[0].statistics.in_progress_complaints}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Resolution Rate</span>
                    <span>{data.departments[0].statistics.resolution_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${data.departments[0].statistics.resolution_rate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Officers Information */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Officers Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{data.departments[0].officers.total}</p>
                    <p className="text-xs text-blue-600">Total Officers</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{data.departments[0].officers.active}</p>
                    <p className="text-xs text-green-600">Active Officers</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">{data.departments[0].officers.inactive}</p>
                    <p className="text-xs text-gray-600">Inactive Officers</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Complaint Statistics Pie Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Complaint Statistics</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Resolved', value: data.departments[0].statistics.resolved_complaints, color: '#10B981' },
                          { name: 'In Progress', value: data.departments[0].statistics.in_progress_complaints, color: '#3B82F6' },
                          { name: 'Pending', value: data.departments[0].statistics.pending_complaints, color: '#F59E0B' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Resolved', value: data.departments[0].statistics.resolved_complaints, color: '#10B981' },
                          { name: 'In Progress', value: data.departments[0].statistics.in_progress_complaints, color: '#3B82F6' },
                          { name: 'Pending', value: data.departments[0].statistics.pending_complaints, color: '#F59E0B' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Officer vs Assigned Complaints Bar Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Officer vs Assigned Complaints</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { 
                        name: 'Total Officers', 
                        officers: data.departments[0].officers.total, 
                        complaints: Math.round(data.departments[0].statistics.total_complaints / data.departments[0].officers.total) || 0,
                        color: '#8B5CF6'
                      },
                      { 
                        name: 'Active Officers', 
                        officers: data.departments[0].officers.active, 
                        complaints: Math.round(data.departments[0].statistics.total_complaints / data.departments[0].officers.active) || 0,
                        color: '#10B981'
                      },
                      { 
                        name: 'Inactive Officers', 
                        officers: data.departments[0].officers.inactive, 
                        complaints: 0,
                        color: '#6B7280'
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'officers' ? `${value} officers` : `${value} complaints/officer`,
                          name === 'officers' ? 'Officers' : 'Avg Complaints per Officer'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="officers" fill="#8B5CF6" name="Officers" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="complaints" fill="#F59E0B" name="Avg Complaints per Officer" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
         
        )} 
      </div>
    </RequireAuth>
  )
} 