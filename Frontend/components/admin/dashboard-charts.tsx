"use client"

import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { TrendingUp, Users, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface StatusData {
  open: number
  in_progress: number
  resolved: number
  pending: number
}

interface MonthlyData {
  [month: string]: number
}

interface ChartSummary {
  average: number
  peak_month: string
  peak_count: number
  total: number
}

export default function DashboardCharts() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
  const [summary, setSummary] = useState<ChartSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch complaint status data
  const fetchStatusData = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${API_BASE}/api/complaints/status/`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setStatusData(data)
    } catch (error) {
      console.error('Error fetching status data:', error)
      setError('Failed to load complaint status data')
    }
  }

  // Fetch monthly complaint data
  const fetchMonthlyData = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      // Prefer unified trends endpoint that returns a monthly_data array
      const response = await fetch(`${API_BASE}/api/complaint-status-trends/`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      // If backend returns { monthly_data: [...] }
      if (data && Array.isArray(data.monthly_data)) {
        const map: MonthlyData = {}
        data.monthly_data.forEach((item: any) => {
          map[item.month] = Number(item.complaints) || 0
        })
        setMonthlyData(map)

        const months = Object.keys(map)
        const values = Object.values(map)
        const total = values.reduce((sum: number, val: number) => sum + val, 0)
        const average = months.length ? Math.round(total / months.length) : 0
        const maxIndex = values.indexOf(Math.max(...values))
        const peak_month = months[maxIndex] || ''
        const peak_count = values[maxIndex] || 0

        setSummary({ average, peak_month, peak_count, total })
        return
      }

      // Fallback: older API returns a map/object of monthName->count
      const mapData = data && typeof data === 'object' ? data : {}
      setMonthlyData(mapData)

      const months = Object.keys(mapData)
      const values = Object.values(mapData).map(v => Number(v) || 0)
      const total = values.reduce((sum: number, val: number) => sum + val, 0)
      const average = months.length ? Math.round(total / months.length) : 0
      const maxIndex = values.indexOf(Math.max(...values))
      const peak_month = months[maxIndex] || ''
      const peak_count = values[maxIndex] || 0

      setSummary({ average, peak_month, peak_count, total })
    } catch (error) {
      console.error('Error fetching monthly data:', error)
      setError('Failed to load monthly complaint data')
    }
  }

  // Load all data
  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    await Promise.all([
      fetchStatusData(),
      fetchMonthlyData()
    ])
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Donut chart configuration
  const donutChartData = statusData ? {
    labels: ['Open', 'In Progress', 'Resolved', 'Pending'],
    datasets: [
      {
        data: [statusData.open, statusData.in_progress, statusData.resolved, statusData.pending],
        backgroundColor: [
          '#3B82F6', // Blue for Open
          '#F97316', // Orange for In Progress
          '#10B981', // Green for Resolved
          '#8B5CF6'  // Purple for Pending
        ],
        borderColor: [
          '#2563EB',
          '#EA580C',
          '#059669',
          '#7C3AED'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  } : null

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  }

  // Bar chart configuration
  const barChartData = monthlyData ? {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Monthly Complaints',
        data: Object.values(monthlyData),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: '#2563EB'
      }
    ]
  } : null

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  }

  // Calculate total complaints for donut center
  const totalComplaints = statusData ? 
    statusData.open + statusData.in_progress + statusData.resolved + statusData.pending : 0

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loading skeletons */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Loading Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - Complaint Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Complaint Status Distribution</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="relative">
            {donutChartData && (
              <div className="relative h-80">
                <Doughnut data={donutChartData} options={donutOptions} />
                
                {/* Center text for total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{totalComplaints}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Status Summary */}
          {statusData && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Open: {statusData.open}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">In Progress: {statusData.in_progress}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Resolved: {statusData.resolved}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending: {statusData.pending}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Monthly Complaint Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Complaint Trend</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          
          <div className="h-80">
            {barChartData && <Bar data={barChartData} options={barOptions} />}
          </div>
          
          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Average</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">{summary.average}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Peak Month</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">{summary.peak_month}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Total</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">{summary.total}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>Auto-refreshing every 30 seconds</span>
      </div>
    </div>
  )
}
