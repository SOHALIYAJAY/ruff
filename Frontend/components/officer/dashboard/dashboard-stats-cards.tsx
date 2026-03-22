"use client"

import React from "react"
import { CheckCircle, Clock, FileText, RefreshCw, AlertTriangle } from "lucide-react"

type DashboardStats = {
  totalComplaints: number
  resolvedComplaints: number
  pendingComplaints: number
  inProgressComplaints: number
  overdueComplaints: number
  averageResolutionTime: number
  performanceScore: number
  todayComplaints: number
  weeklyComplaints: number
}

export default function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
  const boxClass = "bg-white rounded-xl border border-gray-200 shadow-sm p-6"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className={boxClass}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Complaints</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalComplaints || 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">This week:</span>
          <span className="font-medium text-gray-900 ml-1">{stats.weeklyComplaints || 0}</span>
        </div>
      </div>

      <div className={boxClass}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.resolvedComplaints || 0}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">Today:</span>
          <span className="font-medium text-green-600 ml-1">{stats.todayComplaints || 0}</span>
        </div>
      </div>

      <div className={boxClass}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgressComplaints || 0}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">Pending:</span>
          <span className="font-medium text-red-600 ml-1">{stats.pendingComplaints || 0}</span>
        </div>
      </div>

      <div className={boxClass}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueComplaints || 0}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">Avg Resolution:</span>
          <span className="font-medium text-gray-900 ml-1">{stats.averageResolutionTime || 0} days</span>
        </div>
      </div>
    </div>
  )
}