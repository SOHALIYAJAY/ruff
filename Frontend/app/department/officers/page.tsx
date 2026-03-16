"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, LayoutDashboard, Users, UserPlus, BarChart3 } from "lucide-react"
import OfficersKpiCards from "@/components/department/officers-kpi-cards"
import OfficersTable from "@/components/department/officers-table"
import type { Officer } from "@/components/department/officers-table"
import OfficerProfileModal from "@/components/department/officer-profile-modal"
import AssignComplaintToOfficerModal from "@/components/department/assign-complaint-modal"
import AddOfficerModal from "@/components/department/add-officer-modal"
import OfficersAnalytics from "@/components/department/officers-analytics"

export default function OfficersPage() {
  const [profileOfficerId, setProfileOfficerId] = useState<string | null>(null)
  const [assignOfficer, setAssignOfficer] = useState<Officer | null>(null)
  const [showAddOfficer, setShowAddOfficer] = useState(false)
  const [refreshTable, setRefreshTable] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1e40af] font-medium flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          Officers
        </span>
      </div>

      {/* Title and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Department Officers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage officer assignments and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
          <Link
            href="/department/officers/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] transition-colors font-medium text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Create Officer
          </Link>
          <button
            onClick={() => setShowAddOfficer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors font-medium text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <OfficersKpiCards />

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="border-t border-[#e2e8f0] pt-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Officer Performance Analytics</h2>
          <OfficersAnalytics />
        </div>
      )}

      {/* Table */}
      <div>
        <OfficersTable
          onViewProfile={(officerId) => setProfileOfficerId(officerId)}
          onAssignComplaint={(o) => setAssignOfficer(o)}
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

      {assignOfficer && (
        <AssignComplaintToOfficerModal
          officer={assignOfficer}
          open={!!assignOfficer}
          onClose={() => setAssignOfficer(null)}
        />
      )}

      <AddOfficerModal
        open={showAddOfficer}
        onClose={() => setShowAddOfficer(false)}
        onSuccess={() => {
          setRefreshTable(prev => !prev)
        }}
      />
    </div>
  )
}
