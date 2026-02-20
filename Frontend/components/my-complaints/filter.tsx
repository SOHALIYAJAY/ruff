import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ComplaintsFilterProps {
  filterStatus: string
  setFilterStatus: (status: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
}

export default function ComplaintsFilter({
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
}: ComplaintsFilterProps) {
  return (
    <section className="py-8 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by complaint ID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="all">All Categories</option>
                <option value="roads">Roads & Infrastructure</option>
                <option value="water">Water Supply</option>
                <option value="sanitation">Sanitation</option>
                <option value="lighting">Street Lighting</option>
                <option value="drainage">Drainage</option>
                <option value="parking">Parking</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
              <select className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>All time</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setCategoryFilter('all')
                setSortBy('latest')
              }}
              className="border-border hover:bg-muted"
            >
              <Filter className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
