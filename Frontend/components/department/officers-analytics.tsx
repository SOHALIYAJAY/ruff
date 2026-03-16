"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Trophy, TrendingUp } from "lucide-react"
import api from "@/lib/axios"

interface OfficerAnalytics {
  name: string
  resolved: number
  pending: number
  compliance: number
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
  const [analyticsData, setAnalyticsData] = useState<OfficerAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Fetch officer KPI data for analytics
      const { data } = await api.get("/api/officer-kpi/")
      
      // Generate sample analytics data based on structure
      // In production, this would come from a dedicated analytics endpoint
      const sampleData: OfficerAnalytics[] = [
        { name: "Rajesh Kumar", resolved: 142, pending: 18, compliance: 96 },
        { name: "Priya Sharma", resolved: 118, pending: 24, compliance: 91 },
        { name: "Amit Patel", resolved: 95, pending: 12, compliance: 94 },
        { name: "Neha Singh", resolved: 88, pending: 22, compliance: 87 },
        { name: "Vikram Desai", resolved: 76, pending: 15, compliance: 92 },
      ]
      
      setAnalyticsData(sampleData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading analytics...</div>
  }

  // Calculate top performers
  const topPerformers = [...analyticsData]
    .sort((a, b) => b.resolved - a.resolved)
    .slice(0, 3)

  // Calculate averages
  const avgCompliance =
    analyticsData.length > 0
      ? Math.round(
          analyticsData.reduce((sum, o) => sum + o.compliance, 0) /
            analyticsData.length
        )
      : 0

  const totalResolved = analyticsData.reduce((sum, o) => sum + o.resolved, 0)

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Complaints Resolved">
          <p className="text-2xl font-bold text-[#1e40af]">{totalResolved}</p>
          <p className="text-xs text-slate-500 mt-1">Across all officers</p>
        </Card>

        <Card title="Average Compliance Rate">
          <p className="text-2xl font-bold text-[#16a34a]">{avgCompliance}%</p>
          <p className="text-xs text-slate-500 mt-1">SLA achievement</p>
        </Card>

        <Card title="Top Performer">
          {topPerformers.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#f59e0b]" />
                <p className="font-semibold text-slate-800">
                  {topPerformers[0].name}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {topPerformers[0].resolved} complaints resolved
              </p>
            </>
          )}
        </Card>

        <Card title="Active Officers">
          <p className="text-2xl font-bold text-[#3b82f6]">
            {analyticsData.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">In department</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Workload Distribution */}
        <Card title="Officer Workload Comparison">
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  cursor={{ fill: "rgba(30, 64, 175, 0.1)" }}
                />
                <Legend />
                <Bar dataKey="resolved" fill="#16a34a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Compliance Trend */}
        <Card title="Officer Compliance Rates">
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  stroke="#1e40af"
                  strokeWidth={2}
                  dot={{ fill: "#1e40af", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card title="Top Performing Officers">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="px-4 py-2 text-left font-semibold text-slate-600 text-xs uppercase">
                  Rank
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600 text-xs uppercase">
                  Officer Name
                </th>
                <th className="px-4 py-2 text-center font-semibold text-slate-600 text-xs uppercase">
                  Resolved
                </th>
                <th className="px-4 py-2 text-center font-semibold text-slate-600 text-xs uppercase">
                  Compliance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {topPerformers.map((officer, index) => (
                <tr key={officer.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1e40af] text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {officer.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-[#16a34a] text-xs font-semibold">
                      {officer.resolved}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1e40af] rounded-full"
                          style={{ width: `${officer.compliance}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {officer.compliance}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
