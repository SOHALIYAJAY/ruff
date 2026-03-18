'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, AlertCircle, CheckCircle, TrendingUp, Loader2, ExternalLink } from 'lucide-react'

interface Complaint {
  id: number
  title: string
  description: string
  status: string
  created_at: string
  category: string
  priority: string
}

interface ComplaintStat {
  label: string
  value: number
  icon: React.ReactNode
  bgColor: string
  textColor: string
}

export default function ComplaintSummary() {
  const [stats, setStats] = useState<ComplaintStat[]>([])
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComplaintData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        if (!token) {
          console.log('No authentication token found - showing fallback data')
          return
        }

        // Fetch user's complaints
        const complaintsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/usercomplaints/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json()
          const complaints = complaintsData.data || complaintsData || []
          
          // Calculate stats from actual complaints
          const totalComplaints = complaints.length
          const activeComplaints = complaints.filter((c: Complaint) => c.status === 'Pending' || c.status === 'In Progress').length
          const resolvedComplaints = complaints.filter((c: Complaint) => c.status === 'Resolved').length
          const escalatedComplaints = complaints.filter((c: Complaint) => c.priority === 'High').length

          const newStats: ComplaintStat[] = [
            {
              label: 'Total Complaints',
              value: totalComplaints,
              icon: <FileText className="w-6 h-6" />,
              bgColor: 'bg-blue-50 border-blue-200',
              textColor: 'text-blue-600',
            },
            {
              label: 'Active Complaints',
              value: activeComplaints,
              icon: <AlertCircle className="w-6 h-6" />,
              bgColor: 'bg-yellow-50 border-yellow-200',
              textColor: 'text-yellow-600',
            },
            {
              label: 'Resolved Complaints',
              value: resolvedComplaints,
              icon: <CheckCircle className="w-6 h-6" />,
              bgColor: 'bg-green-50 border-green-200',
              textColor: 'text-green-600',
            },
            {
              label: 'High Priority',
              value: escalatedComplaints,
              icon: <TrendingUp className="w-6 h-6" />,
              bgColor: 'bg-red-50 border-red-200',
              textColor: 'text-red-600',
            },
          ]

          setStats(newStats)
          
          // Get recent 5 complaints
          const recent = complaints
            .sort((a: Complaint, b: Complaint) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
          
          setRecentComplaints(recent)
        } else {
          throw new Error('Failed to fetch complaints')
        }
      } catch (error) {
        console.error('Error fetching complaint data:', error)
        
        // Set fallback data
        const fallbackStats: ComplaintStat[] = [
          {
            label: 'Total Complaints',
            value: 5,
            icon: <FileText className="w-6 h-6" />,
            bgColor: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-600',
          },
          {
            label: 'Active Complaints',
            value: 2,
            icon: <AlertCircle className="w-6 h-6" />,
            bgColor: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-600',
          },
          {
            label: 'Resolved Complaints',
            value: 3,
            icon: <CheckCircle className="w-6 h-6" />,
            bgColor: 'bg-green-50 border-green-200',
            textColor: 'text-green-600',
          },
        ]

        setStats(fallbackStats)
        
        const fallbackComplaints: Complaint[] = [
          {
            id: 1,
            title: 'Street Light Not Working',
            description: 'Street light on main road is not functioning',
            status: 'Pending',
            created_at: '2024-03-15T10:30:00Z',
            category: 'Infrastructure',
            priority: 'Medium'
          },
          {
            id: 2,
            title: 'Garbage Collection Issue',
            description: 'Garbage not collected from our area for past week',
            status: 'Resolved',
            created_at: '2024-03-10T14:20:00Z',
            category: 'Sanitation',
            priority: 'High'
          }
        ]
        
        setRecentComplaints(fallbackComplaints)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaintData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="bg-white border border-slate-200 shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading complaint summary...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`border ${stat.bgColor} bg-white shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={stat.textColor}>
                {stat.icon}
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Complaints */}
      <Card className="bg-white border border-slate-200 shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Recent Complaints</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View All
          </Button>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p>No complaints found</p>
            <p className="text-sm">Your complaint history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{complaint.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{complaint.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full border ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} Priority
                      </span>
                      <span className="text-slate-500">
                        {complaint.category} • {formatDate(complaint.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
