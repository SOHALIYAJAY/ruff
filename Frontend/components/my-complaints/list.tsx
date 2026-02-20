'use client'

import { useState } from 'react'
import { ChevronRight, AlertTriangle, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Complaint {
  id: string
  title: string
  category: string
  location: string
  dateSubmitted: string
  status: 'open' | 'in-progress' | 'resolved' | 'pending' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  description: string
  imageUrl?: string
  slaCompliance: number
  officerRemarks?: string
  timeline: Array<{ step: string; date: string; status: 'completed' | 'pending' }>
  estimatedResolution?: string
}

const mockComplaints: Complaint[] = [
  {
    id: 'CMP-2024-001234',
    title: 'Broken Road Surface in Sector 5',
    category: 'roads',
    location: 'Mahatma Gandhi Rd, Ahmedabad',
    dateSubmitted: '2024-02-10',
    status: 'resolved',
    priority: 'high',
    description: 'Large pothole creating safety hazard for vehicles and pedestrians...',
    slaCompliance: 95,
    officerRemarks: 'Road resurfacing completed on schedule',
    timeline: [
      { step: 'Complaint Filed', date: '2024-02-10', status: 'completed' },
      { step: 'Under Review', date: '2024-02-11', status: 'completed' },
      { step: 'Work Assigned', date: '2024-02-12', status: 'completed' },
      { step: 'In Progress', date: '2024-02-15', status: 'completed' },
      { step: 'Resolved', date: '2024-02-20', status: 'completed' },
    ],
    estimatedResolution: 'Completed',
  },
  {
    id: 'CMP-2024-001233',
    title: 'Water Leakage on CG Road',
    category: 'water',
    location: 'CG Road, Ahmedabad',
    dateSubmitted: '2024-02-12',
    status: 'in-progress',
    priority: 'high',
    description: 'Water pipeline leakage causing water wastage...',
    slaCompliance: 92,
    officerRemarks: 'Repair work in progress',
    timeline: [
      { step: 'Complaint Filed', date: '2024-02-12', status: 'completed' },
      { step: 'Under Review', date: '2024-02-12', status: 'completed' },
      { step: 'Work Assigned', date: '2024-02-13', status: 'completed' },
      { step: 'In Progress', date: '2024-02-14', status: 'pending' },
      { step: 'Resolved', date: '', status: 'pending' },
    ],
    estimatedResolution: '2-3 days',
  },
  {
    id: 'CMP-2024-001232',
    title: 'Missing Drain Cover in Sector 7',
    category: 'drainage',
    location: 'Sector 7, Ahmedabad',
    dateSubmitted: '2024-02-08',
    status: 'pending',
    priority: 'medium',
    description: 'Drain cover missing creating safety hazard...',
    slaCompliance: 88,
    timeline: [
      { step: 'Complaint Filed', date: '2024-02-08', status: 'completed' },
      { step: 'Under Review', date: '2024-02-09', status: 'pending' },
      { step: 'Work Assigned', date: '', status: 'pending' },
      { step: 'In Progress', date: '', status: 'pending' },
      { step: 'Resolved', date: '', status: 'pending' },
    ],
    estimatedResolution: '5-7 days',
  },
  {
    id: 'CMP-2024-001231',
    title: 'Street Light Not Working',
    category: 'lighting',
    location: 'University Road, Ahmedabad',
    dateSubmitted: '2024-02-14',
    status: 'open',
    priority: 'low',
    description: 'Street light in front of college building not working...',
    slaCompliance: 85,
    timeline: [
      { step: 'Complaint Filed', date: '2024-02-14', status: 'completed' },
      { step: 'Under Review', date: '', status: 'pending' },
      { step: 'Work Assigned', date: '', status: 'pending' },
      { step: 'In Progress', date: '', status: 'pending' },
      { step: 'Resolved', date: '', status: 'pending' },
    ],
    estimatedResolution: '10-14 days',
  },
]

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/20' },
  'in-progress': { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-500/20' },
  resolved: { bg: 'bg-green-500/10', text: 'text-green-700', border: 'border-green-500/20' },
  pending: { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500/20' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/20' },
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
}

export default function ComplaintsList({
  filterStatus,
  searchTerm,
  categoryFilter,
  sortBy,
  onSelectComplaint,
}: {
  filterStatus: string
  searchTerm: string
  categoryFilter: string
  sortBy: string
  onSelectComplaint: (complaint: Complaint) => void
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  let filteredComplaints = mockComplaints
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => categoryFilter === 'all' || c.category === categoryFilter)
    .filter(
      c =>
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (sortBy === 'oldest') {
    filteredComplaints = [...filteredComplaints].reverse()
  } else if (sortBy === 'priority') {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    filteredComplaints = [...filteredComplaints].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )
  }

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedComplaints = filteredComplaints.slice(startIdx, startIdx + itemsPerPage)

  if (filteredComplaints.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Complaints Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No complaints match your current filters. Try adjusting your search criteria or resetting filters.
            </p>
            <Button className="mt-6 bg-primary hover:bg-secondary">
              Raise a New Complaint
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {paginatedComplaints.map(complaint => (
            <div
              key={complaint.id}
              className="glass-effect rounded-lg border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-mono text-muted-foreground mb-1">{complaint.id}</p>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {complaint.title}
                      </h3>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[complaint.priority]}`}>
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[complaint.status].bg
                        } ${statusColors[complaint.status].text} ${statusColors[complaint.status].border}`}
                      >
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {complaint.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{complaint.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{new Date(complaint.dateSubmitted).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">SLA:</span>
                      <span className="text-green-600 font-semibold">{complaint.slaCompliance}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">Resolution:</span>
                      <span className="text-primary font-semibold">{complaint.estimatedResolution}</span>
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <div className="flex items-center lg:items-start flex-shrink-0">
                  <Button
                    variant="outline"
                    className="border-border hover:bg-primary hover:text-primary-foreground group/btn cursor-pointer"
                    onClick={() => onSelectComplaint(complaint)}
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="border-border"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'bg-primary' : 'border-border'}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="border-border"
            >
              Next
            </Button>
          </div>
        )}
      </div>

    </section>
  )
}
