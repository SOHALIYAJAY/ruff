'use client'

import { useState } from 'react'
import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import Footer from '@/components/footer'
import MyComplaintsHeader from '@/components/my-complaints/header'
import ComplaintsSummary from '@/components/my-complaints/summary'
import ComplaintsFilter from '@/components/my-complaints/filter'
import ComplaintsList from '@/components/my-complaints/list'
import ComplaintDetailsModal from '@/components/my-complaints/details-modal'

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

export default function MyComplaintsPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <UtilityBar />
      <Header />

      {/* Breadcrumb */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <span>/</span>
            <span className="text-foreground font-medium">My Complaints</span>
          </div>
        </div>
      </section>

      {/* Header Section */}
      <MyComplaintsHeader />

      {/* Summary Cards */}
      <section className="py-8 border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ComplaintsSummary />
        </div>
      </section>

      {/* Filter Section */}
      <ComplaintsFilter
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Complaints List */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ComplaintsList
            filterStatus={filterStatus}
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            sortBy={sortBy}
            onSelectComplaint={setSelectedComplaint}
          />
        </div>
      </section>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}

      <Footer />
    </main>
  )
}
