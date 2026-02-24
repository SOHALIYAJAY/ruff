"use client"

import { useState, useEffect } from "react"
import { X, UserPlus } from "lucide-react"

interface AssignModalProps {
  open: boolean
  onClose: () => void
  complaint: { id: string; title: string; officer: string } | null
}

const officers = [
  { id: "off-1", name: "Rajesh Kumar", role: "Senior Engineer" },
  { id: "off-2", name: "Priya Sharma", role: "Civil Engineer" },
  { id: "off-3", name: "Amit Patel", role: "Junior Engineer" },
  { id: "off-4", name: "Neha Singh", role: "Field Inspector" },
  { id: "off-5", name: "Vikram Desai", role: "Road Supervisor" },
]

export default function AssignOfficerModal({
  open,
  onClose,
  complaint,
}: AssignModalProps) {
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [priority, setPriority] = useState("High")
  const [remarks, setRemarks] = useState("")
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setAnimateIn(true))
      setSelectedOfficer("")
      setPriority("High")
      setRemarks("")
    } else {
      setAnimateIn(false)
    }
  }, [open])

  if (!open || !complaint) return null

  const handleClose = () => {
    setAnimateIn(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-xl border border-[#e2e8f0] w-full max-w-md transition-all duration-200 ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Assign Officer
              </h3>
              <p className="text-xs text-slate-500">{complaint.id}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Complaint info */}
          <div className="bg-[#f1f5f9] rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Complaint</p>
            <p className="text-sm font-medium text-slate-800">
              {complaint.title}
            </p>
          </div>

          {/* Select officer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Officer
            </label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#3b82f6]"
            >
              <option value="">Choose an officer...</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} - {o.role}
                </option>
              ))}
            </select>
          </div>

          {/* Set priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {["Critical", "High", "Medium", "Low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    priority === p
                      ? p === "Critical"
                        ? "bg-red-50 text-[#dc2626] border-red-200"
                        : p === "High"
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : p === "Medium"
                            ? "bg-amber-50 text-[#f59e0b] border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-white text-slate-500 border-[#e2e8f0] hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add any notes for the assigned officer..."
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#3b82f6] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#e2e8f0]">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 border border-[#e2e8f0] transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedOfficer}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assign Officer
          </button>
        </div>
      </div>
    </div>
  )
}
