'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, RefreshCw, Building2, Users, Mail, Phone, Calendar, User, MapPin, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Department {
  id: number
  name: string
  category: string
  description: string
  contact_email: string
  contact_phone: string
  head_officer_name?: string
  officer_count: number
  created_at: string
}

interface DepartmentStats {
  total_departments: number
  total_officers: number
  departments_with_head: number
  departments_without_head: number
  category_distribution: Array<{ category: string; count: number }>
}

export default function DepartmentsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [stats, setStats] = useState<DepartmentStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ 
    name: '', 
    category: '', 
    description: '', 
    contact_email: '', 
    contact_phone: '',
    head_officer: ''
  })

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const itemsPerPage = 10

  const categoryChoices = [
    { value: 'ROADS', label: 'Roads & Infrastructure' },
    { value: 'TRAFFIC', label: 'Traffic & Road Safety' },
    { value: 'WATER', label: 'Water Supply' },
    { value: 'SEWERAGE', label: 'Sewerage & Drainage' },
    { value: 'SANITATION', label: 'Sanitation & Garbage' },
    { value: 'LIGHTING', label: 'Street Lighting' },
    { value: 'PARKS', label: 'Parks & Public Spaces' },
    { value: 'ANIMALS', label: 'Stray Animals' },
    { value: 'ILLEGAL_CONSTRUCTION', label: 'Illegal Construction' },
    { value: 'ENCROACHMENT', label: 'Encroachment' },
    { value: 'PROPERTY_DAMAGE', label: 'Public Property Damage' },
    { value: 'ELECTRICITY', label: 'Electricity & Power Issues' },
    { value: 'OTHER', label: 'Other' },
  ]

  async function fetchDepartments() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/`)
      if (!res.ok) throw new Error('Failed to fetch departments')
      const data = await res.json()
      setDepartments(data)
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Error fetching departments')
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/stats/`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      
      // Calculate category distribution
      const categoryCount = departments.reduce((acc: any, dept) => {
        acc[dept.category] = (acc[dept.category] || 0) + 1
        return acc
      }, {})

      const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
        category: categoryChoices.find(c => c.value === category)?.label || category,
        count: count as number
      }))

      setStats({
        total_departments: departments.length,
        total_officers: departments.reduce((sum, dept) => sum + dept.officer_count, 0),
        departments_with_head: departments.filter(dept => dept.head_officer_name).length,
        departments_without_head: departments.filter(dept => !dept.head_officer_name).length,
        category_distribution: categoryDistribution
      })
    } catch (e: any) {
      console.error('Error fetching stats:', e)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = localStorage.getItem('access_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const url = editingDepartment 
        ? `${API_BASE}/api/admin/departments/${editingDepartment.id}/`
        : `${API_BASE}/api/admin/departments/`
      
      const method = editingDepartment ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error('Failed to save department')
      
      await fetchDepartments()
      setShowAddForm(false)
      setEditingDepartment(null)
      setForm({ name: '', category: '', description: '', contact_email: '', contact_phone: '', head_officer: '' })
    } catch (e: any) {
      setError(e.message || 'Error saving department')
    }
  }

  async function handleDelete(department: Department) {
    const token = localStorage.getItem('access_token')
    const headers: Record<string, string> = {}
    
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/${department.id}/`, {
        method: 'DELETE',
        headers
      })

      if (!res.ok) throw new Error('Failed to delete department')
      
      await fetchDepartments()
      setDeletingDepartment(null)
    } catch (e: any) {
      setError(e.message || 'Error deleting department')
    }
  }

  function handleEdit(department: Department) {
    setEditingDepartment(department)
    setForm({
      name: department.name,
      category: department.category,
      description: department.description,
      contact_email: department.contact_email,
      contact_phone: department.contact_phone,
      head_officer: department.head_officer_name || ''
    })
    setShowAddForm(true)
  }

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || dept.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage)

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (departments.length > 0) {
      fetchStats()
    }
  }, [departments])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage civic departments and their operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsRefreshing(true)
                fetchDepartments().finally(() => setIsRefreshing(false))
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 border-t-4 border-t-sidebar-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold text-sidebar-primary">{stats.total_departments}</p>
              </div>
              <div className="p-3 rounded-lg bg-sidebar-primary/10">
                <Building2 className="w-6 h-6 text-sidebar-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 border-t-4 border-t-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Officers</p>
                <p className="text-2xl font-bold text-green-600">{stats.total_officers}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Head Officer</p>
                <p className="text-2xl font-bold text-blue-600">{stats.departments_with_head}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 border-t-4 border-t-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Without Head</p>
                <p className="text-2xl font-bold text-red-600">{stats.departments_without_head}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {stats && stats.category_distribution.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.category_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.category_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({category, percent}) => `${category}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Categories</option>
              {categoryChoices.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Departments</h3>
          <p className="text-sm text-gray-500">Manage and monitor department operations</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading departments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head Officer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{dept.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {categoryChoices.find(c => c.value === dept.category)?.label || dept.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {dept.head_officer_name ? (
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{dept.head_officer_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{dept.officer_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {dept.contact_email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {dept.contact_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(dept.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Department"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingDepartment(dept)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Department"
                          >
                            <Trash2 className="w-4 h-4" />
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
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

      {/* Add/Edit Department Modal */}
      {(showAddForm || editingDepartment) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                    placeholder="e.g., Public Works Department"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  >
                    <option value="">Select Category</option>
                    {categoryChoices.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  placeholder="Department responsibilities and functions..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={form.contact_email}
                    onChange={(e) => setForm({...form, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                    placeholder="department@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={form.contact_phone}
                    onChange={(e) => setForm({...form, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingDepartment(null)
                    setForm({ name: '', category: '', description: '', contact_email: '', contact_phone: '', head_officer: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90"
                >
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDepartment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Department</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingDepartment.name}"? This action cannot be undone and may affect associated officers and complaints.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingDepartment(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingDepartment)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
