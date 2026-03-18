'use client'

import { useState, useEffect } from 'react'

interface StatusData {
  total_comp: number
  resolved_comp: number
  pending_comp: number
  inprogress_comp: number
}

interface MonthlyData {
  [key: number]: number
}

export default function AnalyticsCharts() {
  const [statusData, setStatusData] = useState<StatusData>({
    total_comp:0,
    resolved_comp: 0,
    pending_comp: 0,
    inprogress_comp: 0
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({})
  const [loading, setLoading] = useState(true)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token')
      const isTokenValid = Boolean(token && token !== 'undefined' && token !== 'null')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (isTokenValid) {
        headers['Authorization'] = `Bearer ${token}`
      }

      try {
        // Fetch status data
        const statusResponse = await fetch(`${API_BASE_URL}/complaintsinfo/`, { headers })
        if (statusResponse.ok) {
          const statusResult = await statusResponse.json()
          console.log('Status data received:', statusResult)
          setStatusData(statusResult)
        } else if (statusResponse.status === 401) {
          console.warn('Authentication failed for status data')
        } else {
          console.error('Status response error:', statusResponse.status, statusResponse.statusText)
        }

        // Fetch monthly data
        const monthlyResponse = await fetch(`${API_BASE_URL}/api/complaintmonthwise/`, { headers })
        if (monthlyResponse.ok) {
          const monthlyResult = await monthlyResponse.json()
          console.log('Monthly data received:', monthlyResult)
          setMonthlyData(monthlyResult)
        } else if (monthlyResponse.status === 401) {
          console.warn('Authentication failed for monthly data')
        } else {
          console.error('Monthly response error:', monthlyResponse.status, monthlyResponse.statusText)
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate percentages for pie chart
  const total = statusData.total_comp
  const hasData = total > 0
  
  let pendingPercentage = 0
  let resolvedPercentage = 0  
  let inProgressPercentage = 0
  
  if (hasData) {
    pendingPercentage = (statusData.pending_comp / total) * 100
    resolvedPercentage = (statusData.resolved_comp / total) * 100
    inProgressPercentage = (statusData.inprogress_comp / total) * 100
  }

  // Prepare monthly data for bar chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyValues = monthNames.map((_, index) => monthlyData[index + 1] || 0)
  const maxValue = Math.max(...monthlyValues, 1) // Avoid division by zero

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Analytics Overview</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-effect rounded-lg border border-border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-40 bg-gray-200 rounded-full mb-6"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-lg border border-border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-40 bg-gray-200 rounded mb-6"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Analytics Overview</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Complaint Status Pie Chart */}
        <div className="glass-effect rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Complaint Status Distribution</h3>
          
          <div className="flex items-end justify-center gap-4 h-64">
            {hasData ? (
              /* Dynamic Pie Chart */
              <div className="relative w-40 h-40 rounded-full border-8 flex items-center justify-center" style={{
                background: `conic-gradient(from 0deg, #f97316 0deg ${pendingPercentage * 3.6}deg, #3b82f6 ${pendingPercentage * 3.6}deg ${(pendingPercentage + inProgressPercentage) * 3.6}deg, #22c55e ${(pendingPercentage + inProgressPercentage) * 3.6}deg 360deg)`
              }}>
                <div className="absolute w-32 h-32 rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">{statusData.total_comp}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full bg-background flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl mb-2">📊</p>
                      <p className="text-sm text-muted-foreground">No complaints yet</p>
                      <p className="text-lg font-bold text-primary">{statusData.total_comp}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Legend */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Pending ({statusData.pending_comp})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-muted-foreground">In Progress ({statusData.inprogress_comp})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Resolved ({statusData.resolved_comp})</span>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="glass-effect rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Complaint Trend</h3>

          <div className="flex items-end justify-center gap-2 h-64">
            {/* Dynamic Bar Chart */}
            {monthlyValues.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full bg-gradient-to-t from-primary to-secondary rounded-t transition-all duration-500 hover:opacity-80"
                  style={{ height: `${(value / maxValue) * 200}px` }}
                  title={`${monthNames[index]}: ${value} complaints`}
                ></div>
                <span className="text-xs text-muted-foreground">
                  {monthNames[index]}
                </span>
              </div>
            ))}
          </div>

          {/* Dynamic Stats Footer */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-bold text-primary">
                {(monthlyValues.reduce((a, b) => a + b, 0) / 12).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Month</p>
              <p className="text-lg font-bold text-primary">
                {monthNames[monthlyValues.indexOf(Math.max(...monthlyValues))]}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-primary">
                {monthlyValues.reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
