"use client"

import { useState } from "react"
import { X, Mail, Phone, MapPin, Clock, FileText, AlertTriangle, Award, TrendingUp } from "lucide-react"
import type { Officer } from "./officers-table"

interface OfficerProfileModalProps {
  officer: Officer
  open: boolean
  onClose: () => void
}

const assignedComplaints = [
  { id: "PWD-1001", title: "Pothole on SG Highway", priority: "Critical", status: "In Progress", date: "2026-02-20" },
  { id: "PWD-1004", title: "Street light pole tilted", priority: "High", status: "In Progress", date: "2026-02-17" },
  { id: "PWD-1007", title: "Footpath tiles broken", priority: "Low", status: "In Progress", date: "2026-02-14" },
  { id: "PWD-1011", title: "Damaged speed breaker", priority: "Medium", status: "Open", date: "2026-02-10" },
]

const escalationHistory = [
  { date: "2026-02-18", complaint: "PWD-0982", reason: "SLA breach - exceeded 48 hours", escalatedTo: "Executive Engineer" },
  { date: "2026-01-25", complaint: "PWD-0914", reason: "Citizen escalation request", escalatedTo: "Department Head" },
  { date: "2026-01-10", complaint: "PWD-0867", reason: "Critical priority unresolved", escalatedTo: "Executive Engineer" },
]

const priorityColors: Record<string, string> = {
  Critical: "bg-red-50 text-[#dc2626]",
  High: "bg-orange-50 text-orange-600",
  Medium: "bg-amber-50 text-[#f59e0b]",
  Low: "bg-slate-50 text-slate-500",
}

const statusColors: Record<string, string> = {
  Open: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-[#1e40af]",
  Resolved: "bg-green-100 text-[#16a34a]",
}

export default function OfficerProfileModal({ officer, open, onClose }: OfficerProfileModalProps) {
  const [tab, setTab] = useState<"overview" | "complaints" | "escalations">("overview")

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              officer.status === "Active" ? "bg-[#1e40af]" : officer.status === "On Leave" ? "bg-[#f59e0b]" : "bg-slate-400"
            }`}>
              {officer.avatar}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{officer.name}</h2>
              <p className="text-sm text-slate-500">{officer.designation} - {officer.id}</p>
              <span className={`inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                officer.status === "Active" ? "bg-green-100 text-[#16a34a]" : officer.status === "On Leave" ? "bg-amber-100 text-[#f59e0b]" : "bg-slate-100 text-slate-500"
              }`}>
                {officer.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e2e8f0] px-5">
          {(["overview", "complaints", "escalations"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? "text-[#1e40af] border-[#1e40af]"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "overview" && (
            <div className="space-y-5">
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg">
                    <Mail className="w-4 h-4 text-[#3b82f6]" />
                    <div>
                      <p className="text-[11px] text-slate-500">Email</p>
                      <p className="text-sm text-slate-800">{officer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg">
                    <Phone className="w-4 h-4 text-[#16a34a]" />
                    <div>
                      <p className="text-[11px] text-slate-500">Phone</p>
                      <p className="text-sm text-slate-800">{officer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg">
                    <MapPin className="w-4 h-4 text-[#dc2626]" />
                    <div>
                      <p className="text-[11px] text-slate-500">Department</p>
                      <p className="text-sm text-slate-800">Public Works Department</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg">
                    <Award className="w-4 h-4 text-[#7c3aed]" />
                    <div>
                      <p className="text-[11px] text-slate-500">Designation</p>
                      <p className="text-sm text-slate-800">{officer.designation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                    <FileText className="w-5 h-5 text-[#1e40af] mx-auto mb-1" />
                    <p className="text-xl font-bold text-slate-800">{officer.activeComplaints}</p>
                    <p className="text-[11px] text-slate-500">Active</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                    <TrendingUp className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                    <p className="text-xl font-bold text-slate-800">{officer.resolvedCount}</p>
                    <p className="text-[11px] text-slate-500">Resolved</p>
                  </div>
                  <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 text-center">
                    <Clock className="w-5 h-5 text-[#7c3aed] mx-auto mb-1" />
                    <p className="text-xl font-bold text-slate-800">3.8h</p>
                    <p className="text-[11px] text-slate-500">Avg Resolution</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                    <AlertTriangle className="w-5 h-5 text-[#f59e0b] mx-auto mb-1" />
                    <p className="text-xl font-bold text-slate-800">{officer.slaPerformance}%</p>
                    <p className="text-[11px] text-slate-500">SLA</p>
                  </div>
                </div>
              </div>

              {/* Workload */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Current Workload</h3>
                <div className="bg-[#f1f5f9] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Capacity Utilization</span>
                    <span className="text-sm font-bold text-slate-800">{officer.activeComplaints}/{officer.maxCapacity}</span>
                  </div>
                  <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (officer.activeComplaints / officer.maxCapacity) >= 0.8
                          ? "bg-[#dc2626]"
                          : (officer.activeComplaints / officer.maxCapacity) >= 0.6
                          ? "bg-[#f59e0b]"
                          : "bg-[#16a34a]"
                      }`}
                      style={{ width: `${(officer.activeComplaints / officer.maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "complaints" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Assigned Complaints ({assignedComplaints.length})</h3>
              {assignedComplaints.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] hover:bg-blue-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#1e40af] font-semibold">{c.id}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.title}</p>
                      <p className="text-[11px] text-slate-500">{c.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityColors[c.priority]}`}>
                      {c.priority}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "escalations" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Escalation History ({escalationHistory.length})</h3>
              {escalationHistory.map((e, i) => (
                <div key={i} className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-[#dc2626] font-semibold">{e.complaint}</span>
                    <span className="text-[11px] text-slate-500">{e.date}</span>
                  </div>
                  <p className="text-sm text-slate-700">{e.reason}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Escalated to: <span className="font-medium text-slate-700">{e.escalatedTo}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
