'use client'

import { useState } from 'react'
 import { Eye, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react'

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')

  const statsCards = [
    { 
      title: 'Total Complaints', 
      value: '2,847', 
      trend: '+12%', 
      trendUp: true,
      badge: 'All Time',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700'
    },
    { 
      title: 'Open', 
      value: '324', 
      trend: '+5%', 
      trendUp: true,
      badge: 'Pending',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-700'
    },
    { 
      title: 'In Progress', 
      value: '581', 
      trend: '-2%', 
      trendUp: false,
      badge: 'Active',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700'
    },
    { 
      title: 'Resolved', 
      value: '1,942', 
      trend: '+8%', 
      trendUp: true,
      badge: 'Completed',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700'
    },
    { 
      title: 'Escalated', 
      value: '45', 
      trend: '+3%', 
      trendUp: true,
      badge: 'Urgent',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700'
    },
    { 
      title: 'SLA Compliance', 
      value: '94.2%', 
      trend: '+1.2%', 
      trendUp: true,
      badge: 'Target: 95%',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-500',
      textColor: 'text-indigo-700'
    },
  ]

  const complaints = [
    { id: 'CMP001', title: 'Pothole on Main Street', category: 'Road', district: 'Ahmedabad', department: 'Public Works', officer: 'Rajesh Kumar', priority: 'High', status: 'In Progress', date: '2024-02-15' },
    { id: 'CMP002', title: 'Water Supply Issue', category: 'Water', district: 'Vadodara', department: 'Water Authority', officer: 'Priya Sharma', priority: 'Critical', status: 'Open', date: '2024-02-14' },
    { id: 'CMP003', title: 'Street Light Broken', category: 'Electricity', district: 'Surat', department: 'Electricity Board', officer: 'Amit Patel', priority: 'Medium', status: 'Resolved', date: '2024-02-13' },
    { id: 'CMP004', title: 'Garbage Accumulation', category: 'Sanitation', district: 'Rajkot', department: 'Municipal Corp', officer: 'Neha Singh', priority: 'High', status: 'In Progress', date: '2024-02-12' },
    { id: 'CMP005', title: 'Tree Branch Hazard', category: 'Safety', district: 'Gandhinagar', department: 'Parks Dept', officer: 'Vikram Desai', priority: 'Medium', status: 'Escalated', date: '2024-02-11' },
  ]

  const departments = [
    { name: 'Public Works', resolution: 94, complaints: 450, color: 'bg-blue-500' },
    { name: 'Water Authority', resolution: 91, complaints: 380, color: 'bg-cyan-500' },
    { name: 'Electricity Board', resolution: 88, complaints: 420, color: 'bg-amber-500' },
    { name: 'Municipal Corp', resolution: 85, complaints: 290, color: 'bg-emerald-500' },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      'Open': 'bg-orange-100 text-orange-700 border-orange-200',
      'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'Resolved': 'bg-green-100 text-green-700 border-green-200',
      'Escalated': 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Critical': 'text-red-700 font-bold',
      'High': 'text-orange-600 font-semibold',
      'Medium': 'text-yellow-600',
      'Low': 'text-green-600'
    }
    return colors[priority as keyof typeof colors] || 'text-slate-600'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time civic complaint monitoring and analytics</p>
      </div>

      {/* KPI Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-lg border-t-4 ${card.borderColor} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                </div>
                <div className={`${card.bgColor} ${card.textColor} px-2 py-1 rounded text-xs font-semibold`}>
                  {card.badge}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trend}
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Recent Complaints</h3>
            <p className="text-sm text-slate-500">Latest submissions requiring attention</p>
          </div>
          <div className="divide-y divide-slate-100">
            {complaints.slice(0, 4).map((complaint) => (
              <div key={complaint.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono font-semibold text-blue-700">{complaint.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{complaint.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{complaint.district}</p>
                  </div>
                  <span className={`text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Departments</h3>
            <p className="text-sm text-slate-500">Resolution rates</p>
          </div>
          <div className="p-5 space-y-4">
            {departments.map((dept, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{dept.name}</p>
                    <p className="text-xs text-slate-500">{dept.complaints} complaints</p>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{dept.resolution}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${dept.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${dept.resolution}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex gap-2 border-b border-slate-200 p-2">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-6 py-3 font-medium text-sm rounded-lg transition-colors ${
              selectedTab === 'overview'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('complaints')}
            className={`px-6 py-3 font-medium text-sm rounded-lg transition-colors ${
              selectedTab === 'complaints'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Complaints
          </button>
          <button
            onClick={() => setSelectedTab('departments')}
            className={`px-6 py-3 font-medium text-sm rounded-lg transition-colors ${
              selectedTab === 'departments'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Department Stats
          </button>
        </div>
        {/* Tab Content */}
        {selectedTab === 'complaints' && (
          <div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">All Complaints</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Title</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">District</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Department</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Officer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Priority</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                      <th className="px-6 py-3 text-center font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {complaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-blue-700 font-semibold">{complaint.id}</td>
                        <td className="px-6 py-4 text-slate-900">{complaint.title}</td>
                        <td className="px-6 py-4 text-slate-600">{complaint.district}</td>
                        <td className="px-6 py-4 text-slate-600">{complaint.department}</td>
                        <td className="px-6 py-4 text-slate-600">{complaint.officer}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEPARTMENTS SECTION */}
        {selectedTab === 'departments' && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Department Performance</h3>
            {departments.map((dept, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-900">{dept.name}</p>
                    <p className="text-sm text-slate-500">{dept.complaints} complaints</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{dept.resolution}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${dept.color} h-full rounded-full transition-all`}
                    style={{ width: `${dept.resolution}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW SECTION */}
        {selectedTab === 'overview' && (
          <div className="p-12 text-center">
            <p className="text-slate-500">Overview section - Performance metrics and system health</p>
          </div>
        )}
      </div>
    </div>
  )
}
