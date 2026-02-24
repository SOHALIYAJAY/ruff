"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  MessageSquare,
  UserPlus,
  Power,
  SortAsc,
  SortDesc,
} from "lucide-react"

export interface Officer {
  id: string
  name: string
  avatar: string
  designation: string
  email: string
  phone: string
  activeComplaints: number
  resolvedCount: number
  slaPerformance: number
  status: "Active" | "On Leave" | "Inactive"
  maxCapacity: number
}

export const officerData: Officer[] = [
  { id: "OFF-001", name: "Rajesh Kumar", avatar: "RK", designation: "Senior Engineer", email: "rajesh.k@pwd.guj.gov.in", phone: "+91 98765 43210", activeComplaints: 18, resolvedCount: 142, slaPerformance: 94, status: "Active", maxCapacity: 25 },
  { id: "OFF-002", name: "Priya Sharma", avatar: "PS", designation: "Junior Engineer", email: "priya.s@pwd.guj.gov.in", phone: "+91 98765 43211", activeComplaints: 22, resolvedCount: 118, slaPerformance: 87, status: "Active", maxCapacity: 25 },
  { id: "OFF-003", name: "Amit Patel", avatar: "AP", designation: "Assistant Engineer", email: "amit.p@pwd.guj.gov.in", phone: "+91 98765 43212", activeComplaints: 12, resolvedCount: 198, slaPerformance: 96, status: "Active", maxCapacity: 25 },
  { id: "OFF-004", name: "Neha Singh", avatar: "NS", designation: "Senior Engineer", email: "neha.s@pwd.guj.gov.in", phone: "+91 98765 43213", activeComplaints: 8, resolvedCount: 165, slaPerformance: 92, status: "Active", maxCapacity: 25 },
  { id: "OFF-005", name: "Vikram Desai", avatar: "VD", designation: "Junior Engineer", email: "vikram.d@pwd.guj.gov.in", phone: "+91 98765 43214", activeComplaints: 24, resolvedCount: 89, slaPerformance: 78, status: "Active", maxCapacity: 25 },
  { id: "OFF-006", name: "Sunita Rao", avatar: "SR", designation: "Executive Engineer", email: "sunita.r@pwd.guj.gov.in", phone: "+91 98765 43215", activeComplaints: 0, resolvedCount: 210, slaPerformance: 97, status: "On Leave", maxCapacity: 25 },
  { id: "OFF-007", name: "Deepak Joshi", avatar: "DJ", designation: "Assistant Engineer", email: "deepak.j@pwd.guj.gov.in", phone: "+91 98765 43216", activeComplaints: 15, resolvedCount: 134, slaPerformance: 91, status: "Active", maxCapacity: 25 },
  { id: "OFF-008", name: "Kavita Mehta", avatar: "KM", designation: "Junior Engineer", email: "kavita.m@pwd.guj.gov.in", phone: "+91 98765 43217", activeComplaints: 0, resolvedCount: 76, slaPerformance: 85, status: "Inactive", maxCapacity: 25 },
  { id: "OFF-009", name: "Rohit Trivedi", avatar: "RT", designation: "Senior Engineer", email: "rohit.t@pwd.guj.gov.in", phone: "+91 98765 43218", activeComplaints: 20, resolvedCount: 156, slaPerformance: 88, status: "Active", maxCapacity: 25 },
  { id: "OFF-010", name: "Anjali Parikh", avatar: "AN", designation: "Assistant Engineer", email: "anjali.p@pwd.guj.gov.in", phone: "+91 98765 43219", activeComplaints: 10, resolvedCount: 112, slaPerformance: 93, status: "Active", maxCapacity: 25 },
  { id: "OFF-011", name: "Suresh Bhatt", avatar: "SB", designation: "Junior Engineer", email: "suresh.b@pwd.guj.gov.in", phone: "+91 98765 43220", activeComplaints: 23, resolvedCount: 67, slaPerformance: 74, status: "Active", maxCapacity: 25 },
  { id: "OFF-012", name: "Meera Chauhan", avatar: "MC", designation: "Executive Engineer", email: "meera.c@pwd.guj.gov.in", phone: "+91 98765 43221", activeComplaints: 5, resolvedCount: 245, slaPerformance: 98, status: "Active", maxCapacity: 25 },
]

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-[#16a34a] border-green-200",
  "On Leave": "bg-amber-100 text-[#f59e0b] border-amber-200",
  Inactive: "bg-slate-100 text-slate-500 border-slate-200",
}

function WorkloadBar({ active, max }: { active: number; max: number }) {
  const percent = Math.round((active / max) * 100)
  let barColor = "bg-[#16a34a]"
  let label = "Normal"
  if (percent >= 60 && percent < 80) {
    barColor = "bg-[#f59e0b]"
    label = "Moderate"
  }
  if (percent >= 80) {
    barColor = "bg-[#dc2626]"
    label = "Overloaded"
  }

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-slate-500">{active}/{max}</span>
        <span className={`text-[10px] font-semibold ${percent >= 80 ? "text-[#dc2626]" : percent >= 60 ? "text-[#f59e0b]" : "text-[#16a34a]"}`}>
          {label}
        </span>
      </div>
      <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function SlaIndicator({ percent }: { percent: number }) {
  let color = "text-[#16a34a]"
  let bg = "bg-green-50"
  if (percent < 85) {
    color = "text-[#f59e0b]"
    bg = "bg-amber-50"
  }
  if (percent < 80) {
    color = "text-[#dc2626]"
    bg = "bg-red-50"
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${color} ${bg}`}>
      {percent}%
    </span>
  )
}

type SortKey = "workload" | "performance" | "sla" | "name"

export default function OfficersTable({
  onViewProfile,
  onAssignComplaint,
}: {
  onViewProfile: (officer: Officer) => void
  onAssignComplaint: (officer: Officer) => void
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const perPage = 8

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    let result = officerData.filter((o) => {
      const matchesSearch =
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "All" || o.status === statusFilter
      return matchesSearch && matchesStatus
    })

    result.sort((a, b) => {
      let valA: number, valB: number
      switch (sortKey) {
        case "workload":
          valA = a.activeComplaints / a.maxCapacity
          valB = b.activeComplaints / b.maxCapacity
          break
        case "performance":
          valA = a.resolvedCount
          valB = b.resolvedCount
          break
        case "sla":
          valA = a.slaPerformance
          valB = b.slaPerformance
          break
        default:
          return sortDir === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
      }
      return sortDir === "asc" ? valA - valB : valB - valA
    })

    return result
  }, [search, statusFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const SortIcon = sortDir === "asc" ? SortAsc : SortDesc

  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
      {/* Header + Filters */}
      <div className="p-5 border-b border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Officers Workforce</h3>
            <p className="text-sm text-slate-500">
              {filtered.length} officers in department
            </p>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#f1f5f9] px-3 py-2 rounded-lg border border-[#e2e8f0] flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort options */}
          <button
            onClick={() => handleSort("workload")}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              sortKey === "workload"
                ? "bg-[#1e40af]/10 text-[#1e40af] border-[#1e40af]/30"
                : "text-slate-600 bg-white border-[#e2e8f0] hover:bg-slate-50"
            }`}
          >
            {sortKey === "workload" && <SortIcon className="w-3.5 h-3.5" />}
            Workload
          </button>
          <button
            onClick={() => handleSort("performance")}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              sortKey === "performance"
                ? "bg-[#1e40af]/10 text-[#1e40af] border-[#1e40af]/30"
                : "text-slate-600 bg-white border-[#e2e8f0] hover:bg-slate-50"
            }`}
          >
            {sortKey === "performance" && <SortIcon className="w-3.5 h-3.5" />}
            Performance
          </button>
          <button
            onClick={() => handleSort("sla")}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              sortKey === "sla"
                ? "bg-[#1e40af]/10 text-[#1e40af] border-[#1e40af]/30"
                : "text-slate-600 bg-white border-[#e2e8f0] hover:bg-slate-50"
            }`}
          >
            {sortKey === "sla" && <SortIcon className="w-3.5 h-3.5" />}
            SLA %
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Officer</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Designation</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden xl:table-cell">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden xl:table-cell">Phone</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Active</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Resolved</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">SLA %</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Workload</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {paginated.map((o) => (
              <tr key={o.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-3.5 font-mono text-[#1e40af] font-semibold text-xs">{o.id}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ${
                      o.status === "Active" ? "bg-[#1e40af]" : o.status === "On Leave" ? "bg-[#f59e0b]" : "bg-slate-400"
                    }`}>
                      {o.avatar}
                    </div>
                    <span className="font-medium text-slate-800 whitespace-nowrap">{o.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell">{o.designation}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs hidden xl:table-cell">{o.email}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs hidden xl:table-cell">{o.phone}</td>
                <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                  <span className="font-semibold text-slate-800">{o.activeComplaints}</span>
                </td>
                <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                  <span className="font-semibold text-slate-800">{o.resolvedCount}</span>
                </td>
                <td className="px-4 py-3.5 text-center hidden md:table-cell">
                  <SlaIndicator percent={o.slaPerformance} />
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${statusColors[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <WorkloadBar active={o.activeComplaints} max={o.maxCapacity} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <button title="View Profile" onClick={() => onViewProfile(o)} className="p-1.5 text-[#3b82f6] hover:bg-blue-50 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button title="Assign Complaint" onClick={() => onAssignComplaint(o)} className="p-1.5 text-[#7c3aed] hover:bg-violet-50 rounded transition-colors">
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button title="View Assigned" className="p-1.5 text-[#16a34a] hover:bg-green-50 rounded transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button title="Send Message" className="p-1.5 text-slate-500 hover:bg-slate-50 rounded transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      title={o.status === "Active" ? "Deactivate" : "Activate"}
                      className={`p-1.5 rounded transition-colors ${
                        o.status === "Active"
                          ? "text-[#dc2626] hover:bg-red-50"
                          : "text-[#16a34a] hover:bg-green-50"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={11} className="px-5 py-12 text-center text-slate-400">
                  No officers match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  n === page ? "bg-[#1e40af] text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
