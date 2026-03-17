'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'

interface ComplaintsFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedDepartment: string
  setSelectedDepartment: (dept: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  selectedPriority: string
  setSelectedPriority: (priority: string) => void
}

export default function ComplaintsFilters({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
}: ComplaintsFiltersProps) {
  const [categories, setCategories] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)

  const API_BASE = (() => {
    const env = (process.env.NEXT_PUBLIC_API_URL as string) || ''
    if (env) return env
    if (typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:8000`
    return 'http://127.0.0.1:8000'
  })()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`${API_BASE}/api/categorieslist/`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch categories')
        return r.json()
      })
      .then((data) => {
        if (!mounted) return
        setCategories(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        console.error('Failed to fetch categories:', error)
        // Fall back to hardcoded categories
        setCategories([
          { id: 1, name: 'Water Supply', code: 'WS' },
          { id: 2, name: 'Roads & Infrastructure', code: 'RI' },
          { id: 3, name: 'Sanitation', code: 'SAN' },
          { id: 4, name: 'Street Lighting', code: 'SL' },
          { id: 5, name: 'Drainage', code: 'DR' },
        ])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [API_BASE])

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">All Complaints</h2>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="w-4 h-4" />
          <span>Filters Applied</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Complaints
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by ID, title, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name} {cat.code && `(${cat.code})`}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Priority
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>
    </div>
  )
}
