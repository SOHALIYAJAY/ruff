"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, FileText, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import api from '@/lib/axios'
import DepartmentsSection from '@/components/departments-section'

export default function DepartmentDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  })
  const [recentComplaints, setRecentComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/getcomplaint/')
      const complaints = response.data
      
      setStats({
        total: complaints.length,
        pending: complaints.filter((c: any) => c.status === 'Pending').length,
        inProgress: complaints.filter((c: any) => c.status === 'in-progress').length,
        resolved: complaints.filter((c: any) => c.status === 'resolved').length
      })
      
      setRecentComplaints(complaints.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Department Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">Overview of department operations and performance</p>
      </div>

      {/* Departments performance moved here from admin dashboard */}
      <DepartmentsSection />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] border-t-4 border-t-[#2563EB] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-50 text-[#2563EB] p-2 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">Total Complaints</p>
          <p className="text-3xl font-bold text-[#1E293B]">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] border-t-4 border-t-[#F59E0B] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-50 text-[#F59E0B] p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">Pending</p>
          <p className="text-3xl font-bold text-[#1E293B]">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] border-t-4 border-t-[#3B82F6] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-sky-50 text-[#3B82F6] p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">In Progress</p>
          <p className="text-3xl font-bold text-[#1E293B]">{stats.inProgress}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] border-t-4 border-t-[#22C55E] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-50 text-[#22C55E] p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-1">Resolved</p>
          <p className="text-3xl font-bold text-[#1E293B]">{stats.resolved}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/department/assigned" className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:border-[#2563EB] hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-[#2563EB] p-3 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1E293B]">Manage Complaints</h3>
              <p className="text-sm text-[#64748B]">View and assign complaints</p>
            </div>
          </div>
        </Link>

        <Link href="/department/officers" className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 hover:border-[#2563EB] hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 text-[#7C3AED] p-3 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1E293B]">Officers</h3>
              <p className="text-sm text-[#64748B]">Manage department officers</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="p-5 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-[#1E293B]">Recent Complaints</h3>
          <p className="text-sm text-[#64748B]">Latest complaints submitted to department</p>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {loading ? (
            <div className="p-8 text-center text-[#64748B]">Loading...</div>
          ) : recentComplaints.length > 0 ? (
            recentComplaints.map((complaint) => (
              <div key={complaint.id} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-[#2563EB]">#{complaint.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        complaint.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                        complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#1E293B] mb-1">{complaint.title}</p>
                    <p className="text-xs text-[#64748B]">{complaint.location_District} • {complaint.Category}</p>
                  </div>
                  <Link 
                    href="/department/assigned"
                    className="text-xs text-[#2563EB] hover:underline font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#64748B]">No complaints found</div>
          )}
        </div>
      </div>
    </div>
  )
}
