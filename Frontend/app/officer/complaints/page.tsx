"use client"

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
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
  RefreshCw
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

export default function AllComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [assignedOnly, setAssignedOnly] = useState(true) // Default to assigned complaints only
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalComplaints, setTotalComplaints] = useState(0)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const itemsPerPage = 10

  // Fetch all complaints
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
        category: categoryFilter,
        page: currentPage.toString(),
        page_size: itemsPerPage.toString()
      })

      // Always fetch officer-specific complaints
      const endpoint = '/api/officer/complaints/'
      const response = await fetch(`${API_BASE}${endpoint}?${params}`, { headers })
      
      if (response.ok) {
        const data = await response.json()
        setComplaints(data.complaints || [])
        setCategories(data.categories || [])
        setTotalComplaints(data.total || 0)
      } else {
        console.error('Failed to fetch complaints:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, currentPage])

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

  const totalPages = Math.ceil(totalComplaints / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalComplaints)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all civic complaints</p>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <label className="flex items-center gap-2 px-3">
              <input
                type="checkbox"
                checked={assignedOnly}
                onChange={(e) => setAssignedOnly(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Assigned to me</span>
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setCurrentPage(1)
                }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
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
          <h3 className="text-lg font-semibold text-gray-900">Complaint List</h3>
          <p className="text-sm text-gray-500">Total: {totalComplaints} complaints</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {complaints.map((complaint: Complaint) => (
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
                            onClick={() => setSelectedComplaint(complaint)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
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
                  Showing {totalComplaints > 0 ? startIndex : 0} to {endIndex} of {totalComplaints} complaints
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

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">{selectedComplaint.title}</h4>
                <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Priority</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Submitted Date</p>
                  <p className="text-sm text-gray-900">{selectedComplaint.submittedDate}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Location</p>
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {selectedComplaint.location}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Citizen Information</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedComplaint.citizenName}
                  </div>
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedComplaint.citizenEmail}
                  </div>
                  <div className="flex items-center text-sm text-gray-900">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedComplaint.citizenPhone}
                  </div>
                </div>
              </div>

              {selectedComplaint.image && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Attached Image</p>
                  <div className="border border-gray-200 rounded-lg p-2">
                    <img 
                      src={selectedComplaint.image} 
                      alt="Complaint image" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                </div>
              )}

              {selectedComplaint.remarks && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Remarks</p>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedComplaint.remarks}</p>
                </div>
              )}

              {selectedComplaint.updatedAt && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{selectedComplaint.updatedAt}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
