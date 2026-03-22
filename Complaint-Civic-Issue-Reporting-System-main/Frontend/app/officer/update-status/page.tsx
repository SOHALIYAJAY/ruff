"use client"

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Edit,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  X,
  RefreshCw,
  Check,
  Image as ImageIcon
} from 'lucide-react'

interface Complaint {
  id: number
  title: string
  description: string
  category: string
  status: string
  priority: string
  date: string
  submittedDate: string
  location: string
  citizenName: string
  citizenEmail: string
  citizenPhone: string
  isOverdue: boolean
  image?: string
  remarks: string
  updatedAt?: string
}

export default function StatusChangePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateRemarks, setUpdateRemarks] = useState('')
  const [updateImage, setUpdateImage] = useState<File | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const itemsPerPage = 10

  // Fetch complaints assigned to officer
  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter
      })

      const response = await fetch(`${API_BASE}/api/officer/complaints/?${params}`, { headers })
      
      if (response.ok) {
        const data = await response.json()
        setComplaints(data.complaints || [])
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update complaint status
  const updateComplaintStatus = async () => {
    if (!selectedComplaint || !updateStatus) return

    try {
      const token = localStorage.getItem('access_token')
      const formData = new FormData()
      formData.append('status', updateStatus)
      formData.append('remarks', updateRemarks)
      
      if (updateImage) {
        formData.append('resolution_image', updateImage)
      }

      const headers: Record<string, string> = {}
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(
        `${API_BASE}/api/officer/complaints/${selectedComplaint.id}/update/`,
        {
          method: 'PUT',
          headers,
          body: formData
        }
      )
      
      if (response.ok) {
        alert('Complaint status updated successfully!')
        setShowUpdateModal(false)
        setSelectedComplaint(null)
        setUpdateStatus('')
        setUpdateRemarks('')
        setUpdateImage(null)
        fetchComplaints()
      } else {
        alert('Failed to update complaint status')
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
      alert('Error updating complaint status')
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.citizenName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage)

  const handleUpdateClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setUpdateStatus(complaint.status)
    setUpdateRemarks(complaint.remarks)
    setShowUpdateModal(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Status Change</h1>
            <p className="text-sm text-gray-500 mt-1">Update complaint statuses and add remarks</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsRefreshing(true)
                fetchComplaints().finally(() => setIsRefreshing(false))
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, description, or citizen name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Assigned Complaints</h3>
          <p className="text-sm text-gray-500">Complaints assigned to you for status updates</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading complaints...</p>
          </div>
        ) : paginatedComplaints.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">#{complaint.id}</span>
                        {complaint.isOverdue && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{complaint.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{complaint.citizenName}</div>
                          <div className="text-sm text-gray-500">{complaint.citizenEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {complaint.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateClick(complaint)}
                            className="text-sidebar-primary hover:text-sidebar-primary/80"
                            title="Update Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Update Complaint Status</h3>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); updateComplaintStatus(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complaint ID: #{selectedComplaint.id}
                </label>
                <p className="text-sm text-gray-900 font-medium">{selectedComplaint.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={updateRemarks}
                  onChange={(e) => setUpdateRemarks(e.target.value)}
                  rows={4}
                  placeholder="Add your remarks about the status change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {updateImage ? updateImage.name : 'Drop image here or click to browse'}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUpdateImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="resolution-image"
                  />
                  <label
                    htmlFor="resolution-image"
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
