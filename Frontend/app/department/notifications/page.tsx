"use client"

import { useState } from "react"
import { ChevronRight, LayoutDashboard, BellRing } from "lucide-react"
import NotificationsKpiCards from "@/components/department/notifications-kpi-cards"
import SendNotificationForm from "@/components/department/send-notification-form"
import SentNotificationsTable from "@/components/department/sent-notifications-table"
import type { SentNotification } from "@/components/department/sent-notifications-table"
import ViewNotificationModal from "@/components/department/view-notification-modal"
import NotificationAnalyticsPanel from "@/components/department/notification-analytics-panel"

export default function NotificationsPage() {
  const [viewNotification, setViewNotification] = useState<SentNotification | null>(null)

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1e40af] font-medium flex items-center gap-1.5">
          <BellRing className="w-4 h-4" />
          Notifications
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Department Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">Send and manage communication with civic users</p>
      </div>

      {/* KPI Cards */}
      <NotificationsKpiCards />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Composer + Table */}
        <div className="xl:col-span-2 space-y-6">
          <SendNotificationForm />
          <SentNotificationsTable
            onViewNotification={(n) => setViewNotification(n)}
          />
        </div>

        {/* Right: Analytics */}
        <div className="xl:col-span-1">
          <NotificationAnalyticsPanel />
        </div>
      </div>

      {/* View Modal */}
      {viewNotification && (
        <ViewNotificationModal
          notification={viewNotification}
          open={!!viewNotification}
          onClose={() => setViewNotification(null)}
        />
      )}
    </div>
  )
}
