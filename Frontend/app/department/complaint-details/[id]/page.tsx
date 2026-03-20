'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Image as ImageIcon,
  Calendar,
  Tag,
  Building,
  Map,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface ComplaintDetails {
  comp_name: string
  filed_on: string
  description: string
  upload_image?: string
  status: string
  priority: string
  location_address: string
  location_district: string
  location_taluk: string
  officer_id?: string
  assignedOfficer?: { id: number; name?: string; email?: string | null; phone?: string | null; is_available?: boolean }
}

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200'
}

const priorityColors = {
  'High': 'bg-red-500',
  'Medium': 'bg-yellow-500',
  'Low': 'bg-green-500'
}

export default function ComplaintDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Unwrap params (may be a Promise) using React.use to support Next.js routing
  const { id } = use(params) || { id: undefined }
  
  // Validate ID
  if (!id || isNaN(Number(id))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Complaint ID</h2>
          <p className="text-gray-600 mb-6">The complaint ID provided is not valid.</p>
          <Link 
            href="/department/assigned"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchComplaintDetails()
  }, [id])

  const fetchComplaintDetails = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      console.log('Fetching complaint details for ID:', id)
      console.log('API URL:', `${API_BASE}/api/complaintindetails/${id}/`)
      
      // Get authentication token
      const token = localStorage.getItem('access_token') || localStorage.getItem('adminToken')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
        console.log('Using authentication token')
      } else {
        console.log('No authentication token found')
      }
      
      const response = await fetch(`${API_BASE}/api/complaintindetails/${id}/`, {
        headers
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        
        // Check if it's a serialization error (common with FileField issues)
        if (errorText.includes('has no file associated with it')) {
          throw new Error('Server error: File serialization issue. Please contact administrator.')
        }
        
        throw new Error(`Failed to fetch complaint details: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('=== COMPLETE API RESPONSE ===')
      console.log('Full response:', JSON.stringify(data, null, 2))
      console.log('assigned_officer field:', data.assigned_officer)
      console.log('officer_id field:', data.officer_id)
      console.log('Type of assigned_officer:', typeof data.assigned_officer)
      console.log('assigned_officer keys:', data.assigned_officer ? Object.keys(data.assigned_officer) : 'null/undefined')
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      const complaintData = {
        comp_name: data.comp_name,
        filed_on: data.filed_on,
        description: data.description,
        upload_image: data.upload_image,
        status: data.status,
        priority: data.priority,
        location_address: data.location_address,
        location_district: data.location_district,
        location_taluk: data.location_taluk,
        officer_id: data.officer_id,
        assignedOfficer: data.assigned_officer || null
      }
      
      console.log('=== COMPLAINT DATA TO SET ===')
      console.log('complaintData:', JSON.stringify(complaintData, null, 2))
      
      setComplaint(complaintData)
      
      console.log('=== AFTER SET STATE ===')
      console.log('Set complaint with assignedOfficer:', data.assigned_officer)
      
    } catch (error) {
      console.error('Error fetching complaint details:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Detailed error:', errorMessage)
      setError(`Failed to load complaint details: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const assignOfficer = async () => {
    // kept for backward-compat if called directly
    console.warn('assignOfficer called directly; use assign form instead')
  }

  // New form state and fetch for department officers
  const [officers, setOfficers] = useState<Array<{ id: number; name: string; officer_id: string }>>([])
  const [selectedOfficer, setSelectedOfficer] = useState<string>('')
  const [loadingOfficers, setLoadingOfficers] = useState(false)

  const fetchOfficers = async () => {
    setLoadingOfficers(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const token = localStorage.getItem(
        'access_token') || localStorage.getItem('adminToken')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`

      const resp = await fetch(`${API_BASE}/api/department/officers/`, { headers })
      if (!resp.ok) {
        console.error('Failed to fetch department officers', resp.status)
        setOfficers([])
        return
      }
      const data = await resp.json()
      // normalize to {id, name, officer_id}
      const list = (data || []).map((o: any) => ({ id: o.id, name: o.name || o.get_full_name || String(o.id), officer_id: o.officer_id || o.id }))
      setOfficers(list)
      if (list.length > 0) setSelectedOfficer(list[0].officer_id)
    } catch (err) {
      console.error('Error fetching officers', err)
      setOfficers([])
    } finally {
      setLoadingOfficers(false)
    }
  }

  const submitAssign = async () => {
    if (!complaint) return
    if (!selectedOfficer) return alert('Please select an officer')
    setLoading(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const token = localStorage.getItem('access_token') || localStorage.getItem('adminToken')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`

      const resp = await fetch(`${API_BASE}/api/assigncomp/${id}/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ officer_id: selectedOfficer })
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(`Assign failed: ${resp.status} ${resp.statusText} - ${txt}`)
      }
      setComplaint({ ...complaint, officer_id: selectedOfficer })
      alert('Officer assigned successfully')
    } catch (err) {
      console.error('Error assigning officer:', err)
      alert('Failed to assign officer: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const markResolved = async () => {
    if (!complaint) return
    if (!confirm('Mark this complaint as resolved?')) return
    setLoading(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const token = localStorage.getItem('access_token') || localStorage.getItem('adminToken')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`

      const resp = await fetch(`${API_BASE}/api/complaintupdate/${id}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'resolved' })
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(`Update failed: ${resp.status} ${resp.statusText} - ${txt}`)
      }
      // update local state
      setComplaint({ ...complaint, status: 'resolved' })
      alert('Complaint marked resolved')
    } catch (err) {
      console.error('Error marking resolved:', err)
      alert('Failed to mark resolved: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Complaint not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchComplaintDetails}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <Link 
              href="/department/assigned"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Complaints
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/department/assigned"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Complaints
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Complaint Details</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[complaint.status as keyof typeof statusColors]}`}>
                <div className={`w-2 h-2 rounded-full ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}></div>
                {complaint.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{complaint.comp_name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Filed on {complaint.filed_on}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span className="font-medium">{complaint.priority} Priority</span>
                    </div>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}></div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Location Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-gray-700">{complaint.location_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Map className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">District</p>
                    <p className="text-gray-700">{complaint.location_district}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Taluk</p>
                    <p className="text-gray-700">{complaint.location_taluk}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Media */}
            {complaint.upload_image && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                  Attached Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group cursor-pointer">
                    <img 
                      src={complaint.upload_image} 
                      alt="Complaint attachment"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                Status Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Complaint Filed</p>
                    <p className="text-xs text-gray-600">{complaint.filed_on}</p>
                    <p className="text-sm text-gray-700 mt-1">Citizen submitted the complaint</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Currently In Progress</p>
                    <p className="text-xs text-gray-600">Status: {complaint.status}</p>
                    <p className="text-sm text-gray-700 mt-1">Department is actively working on this complaint</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Officer */}
            {console.log('=== RENDER DEBUG ===')}
            {console.log('complaint object:', complaint)}
            {console.log('complaint.assignedOfficer:', complaint.assignedOfficer)}
            {console.log('complaint.officer_id:', complaint.officer_id)}
            {complaint.assignedOfficer && complaint.assignedOfficer.id ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Officer</h3>
                <div className="space-y-4">
                  {/* Officer Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-lg">
                        {complaint.assignedOfficer.name || `Officer ID: ${complaint.assignedOfficer.id}`}
                      </p>
                      <p className="text-sm text-gray-600">ID: {complaint.assignedOfficer.id}</p>
                    </div>
                  </div>
                  
                  {/* Officer Contact Details */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      {complaint.assignedOfficer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{complaint.assignedOfficer.email}</span>
                        </div>
                      )}
                      {complaint.assignedOfficer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{complaint.assignedOfficer.phone}</span>
                        </div>
                      )}
                      {!complaint.assignedOfficer.email && !complaint.assignedOfficer.phone && (
                        <p className="text-sm text-gray-500 italic">No contact information available</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Assignment Status */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          complaint.assignedOfficer?.is_available ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          complaint.assignedOfficer?.is_available ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {complaint.assignedOfficer?.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Active Assignment
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Officer is {complaint.assignedOfficer?.is_available ? 'currently available' : 'currently unavailable'} for new assignments
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Officer</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 font-medium">Not Assigned to Officer</span>
                  </div>
                  <p className="text-sm text-gray-500">This complaint has not been assigned to any officer yet.</p>
                  {complaint.officer_id && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> Officer ID exists ({complaint.officer_id}) but full details are not available. 
                        The assignment may need to be updated.
                      </p>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 italic">
                    Contact your department administrator to assign an officer to this complaint.
                  </div>
                </div>
              </div>
            )}

            {/* Status Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[complaint.status as keyof typeof statusColors]}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Priority Level</span>
                  <span className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}></div>
                    <span className="text-sm font-medium">{complaint.priority}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filed On</span>
                  <span className="text-sm font-medium">{complaint.filed_on}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
