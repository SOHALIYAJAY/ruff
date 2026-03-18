"use client"

import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"
import type { Complaint } from "./assigned-complaints-table"

interface ViewDetailsButtonProps {
  complaint?: Complaint | null
  className?: string
}

export default function ViewDetailsButton({ complaint, className = "" }: ViewDetailsButtonProps) {
  const router = useRouter()

  console.log('ViewDetailsButton rendering for complaint:', complaint?.id)

  // Don't render button if complaint data is not available
  if (!complaint || !complaint.id) {
    return (
      <span className="text-xs text-gray-400" title="No complaint data available">
        N/A
      </span>
    )
  }

  const handleClick = () => {
    console.log('ViewDetailsButton clicked!')
    console.log('Complaint ID:', complaint.id)
    
    const route = `/department/complaint-details/${complaint.id}`
    console.log('Navigating to:', route)
    
    // Simple direct navigation
    window.location.href = route
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer ${className}`}
      title={`View details for complaint #${complaint.id}`}
      type="button"
    >
      <Eye className="w-3.5 h-3.5" />
      View Details
    </button>
  )
}
  