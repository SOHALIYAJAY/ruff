"use client"

import { useState } from "react"
import { UserPlus, BarChart3, Search, Filter, Download } from "lucide-react"
import OfficersKpiCards from "@/components/department/officers-kpi-cards"
import OfficersTable from "@/components/department/officers-table"
import type { Officer } from "@/components/department/officers-table"
import OfficerProfileModal from "@/components/department/officer-profile-modal"
import AddOfficerModal from "@/components/department/add-officer-modal"
import OfficersAnalytics from "@/components/department/officers-analytics"

export default function AdminOfficersPage() {
  const [profileOfficerId, setProfileOfficerId] = useState<string | null>(null)
  const [showAddOfficer, setShowAddOfficer] = useState(false)
  const [refreshTable, setRefreshTable] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Officers Management</h1>
        <p className="text-slate-600 mt-2">Monitor and manage all department officers across the organization</p>
      </div>

      {/* KPI Cards */}
      <OfficersKpiCards />

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search officers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Spacer */}
          <div />

          {/* Action Buttons */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>

          <button
            onClick={() => setShowAddOfficer(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Officer
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Officer Performance Analytics</h2>
          <OfficersAnalytics />
        </div>
      )}

      {/* Officers Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <OfficersTable
          onViewProfile={(officerId) => setProfileOfficerId(officerId)}
          onAssignComplaint={() => {}}
        />
      </div>

      {/* Modals */}
      {profileOfficerId && (
        <OfficerProfileModal
          officerId={profileOfficerId}
          open={!!profileOfficerId}
          onClose={() => setProfileOfficerId(null)}
        />
      )}

      <AddOfficerModal
        open={showAddOfficer}
        onClose={() => setShowAddOfficer(false)}
        onSuccess={() => {
          setRefreshTable(prev => !prev)
          setShowAddOfficer(false)
        }}
      />
    </div>
  )
}
