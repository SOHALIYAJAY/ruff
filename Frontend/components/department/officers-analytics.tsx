"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Trophy, TrendingUp } from "lucide-react"

interface AnalyticsData {
  total_officers: number
  available_officers: number
  unavailable_officers: number
  officers_with_complaints: number
  department_stats: Record<string, { officers: number; active_complaints: number }>
  workload_data: Array<{
    officer_id: string
    name: string
    active_complaints: number
    is_available: boolean
  }>
  availability_percentage: number
}

interface ChartCard {
  title: string
  children: React.ReactNode
}

function Card({ title, children }: ChartCard) {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">{title}</h4>
      {children}
    </div>
  )
}

export default function OfficersAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${API_BASE}/api/officeranalytics/`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      console.log('Officer analytics data:', data)
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set fallback data
      setAnalyticsData({
        total_officers: 0,
        available_officers: 0,
        unavailable_officers: 0,
        officers_with_complaints: 0,
        department_stats: {},
        workload_data: [],
        availability_percentage: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading analytics...</div>
  }

  if (!analyticsData) {
    return <div className="text-center py-8 text-slate-400">No analytics data available</div>
  }

  // Calculate top performers based on workload
  const topPerformers = [...analyticsData.workload_data]
    .sort((a, b) => b.active_complaints - a.active_complaints)
    .slice(0, 3)

  // Prepare data for charts
  const availabilityData = [
    { name: 'Available', value: analyticsData.available_officers, color: '#10b981' },
    { name: 'Unavailable', value: analyticsData.unavailable_officers, color: '#ef4444' }
  ]

  const departmentData = Object.entries(analyticsData.department_stats).map(([name, stats]) => ({
    name,
    officers: stats.officers,
    complaints: stats.active_complaints
  }))

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Total Officers</h4>
          <p className="text-2xl font-bold text-blue-900">{analyticsData.total_officers}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-medium text-green-700 mb-2">Available</h4>
          <p className="text-2xl font-bold text-green-900">{analyticsData.available_officers}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h4 className="text-sm font-medium text-orange-700 mb-2">With Complaints</h4>
          <p className="text-2xl font-bold text-orange-900">{analyticsData.officers_with_complaints}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="text-sm font-medium text-purple-700 mb-2">Availability</h4>
          <p className="text-2xl font-bold text-purple-900">{analyticsData.availability_percentage}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Availability Chart */}
        <Card title="Officer Availability">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={availabilityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {availabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Distribution */}
        <Card title="Department Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="officers" fill="#3b82f6" />
              <Bar dataKey="complaints" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Performers */}
      <Card title="Officers with Most Active Complaints">
        <div className="space-y-3">
          {topPerformers.map((officer, index) => (
            <div key={officer.officer_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{officer.name}</p>
                  <p className="text-sm text-gray-500">
                    {officer.is_available ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{officer.active_complaints}</p>
                <p className="text-xs text-gray-500">Active Complaints</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
