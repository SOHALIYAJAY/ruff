'use client'

import { useState } from 'react'
import { Users as UsersIcon, Lock, TrendingUp, FileText, Search } from 'lucide-react'
import UsersKPI from '../../../components/admin/users/UsersKPI'
import UsersAnalytics from '../../../components/admin/users/UsersAnalytics'
import UsersFilters from '../../../components/admin/users/UsersFilters'
import UserProfileModal from '../../../components/admin/users/UserProfileModal'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'Citizen' | 'Officer' | 'Department Head'
  totalComplaints: number
  openComplaints: number
  status: 'Active' | 'Blocked'
  registrationDate: string
  lastLogin: string
  avatar: string
}

interface SelectedUser {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: string
  totalComplaints: number
  openComplaints: number
  status: string
  registrationDate: string
  lastLogin: string
  complaintHistory: { month: string; count: number }[]
  activityTimeline: { date: string; action: string }[]
}

export default function DepartmentUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null)
  const [showModal, setShowModal] = useState(false)

  const users: User[] = [
    { id: 'USR-001', name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '9876543210', role: 'Citizen', totalComplaints: 5, openComplaints: 1, status: 'Active', registrationDate: '2024-01-15', lastLogin: '2024-02-24', avatar: 'RK' },
    { id: 'USR-002', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '9876543211', role: 'Officer', totalComplaints: 0, openComplaints: 0, status: 'Active', registrationDate: '2023-11-20', lastLogin: '2024-02-25', avatar: 'PP' },
    { id: 'USR-003', name: 'Amit Singh', email: 'amit.singh@example.com', phone: '9876543212', role: 'Citizen', totalComplaints: 12, openComplaints: 3, status: 'Active', registrationDate: '2023-09-10', lastLogin: '2024-02-20', avatar: 'AS' },
    { id: 'USR-004', name: 'Neha Sharma', email: 'neha.sharma@example.com', phone: '9876543213', role: 'Department Head', totalComplaints: 0, openComplaints: 0, status: 'Active', registrationDate: '2023-08-05', lastLogin: '2024-02-25', avatar: 'NS' },
    { id: 'USR-005', name: 'Vikram Desai', email: 'vikram.desai@example.com', phone: '9876543214', role: 'Citizen', totalComplaints: 8, openComplaints: 2, status: 'Blocked', registrationDate: '2024-01-22', lastLogin: '2024-02-15', avatar: 'VD' },
    { id: 'USR-006', name: 'Mohini Gupta', email: 'mohini.gupta@example.com', phone: '9876543215', role: 'Citizen', totalComplaints: 3, openComplaints: 0, status: 'Active', registrationDate: '2024-02-01', lastLogin: '2024-02-23', avatar: 'MG' },
  ]

  const usersByDistrict = [
    { name: 'Ahmedabad', users: 450 }, { name: 'Vadodara', users: 320 }, { name: 'Surat', users: 380 },
    { name: 'Rajkot', users: 210 }, { name: 'Gandhinagar', users: 160 }, { name: 'Bhavnagar', users: 145 },
    { name: 'Jamnagar', users: 128 }, { name: 'Junagadh', users: 95 }, { name: 'Porbandar', users: 78 },
    { name: 'Amreli', users: 82 }, { name: 'Surendranagar', users: 67 }, { name: 'Botad', users: 54 },
    { name: 'Morbi', users: 89 }, { name: 'Gir Somnath', users: 73 }, { name: 'Kutch', users: 112 },
    { name: 'Patan', users: 76 }, { name: 'Mehsana', users: 134 }, { name: 'Sabarkantha', users: 98 },
    { name: 'Anand', users: 103 }, { name: 'Bharuch', users: 118 }, { name: 'Navsari', users: 86 },
    { name: 'Valsad', users: 105 },
  ]

  const monthlyUsers = [
    { month: 'Jan', users: 890 }, { month: 'Feb', users: 945 }, { month: 'Mar', users: 1020 },
    { month: 'Apr', users: 980 }, { month: 'May', users: 1105 }, { month: 'Jun', users: 1180 },
    { month: 'Jul', users: 1250 }, { month: 'Aug', users: 1320 }, { month: 'Sep', users: 1280 },
    { month: 'Oct', users: 1350 }, { month: 'Nov', users: 1420 }, { month: 'Dec', users: 1480 },
  ]

  const userRoleDistribution = [
    { name: 'Citizen', value: 890, color: '#3b82f6' },
    { name: 'Officer', value: 120, color: '#16a34a' },
    { name: 'Dept Head', value: 34, color: '#8b5cf6' },
  ]

  const citizenUsers = users.filter((u) => u.role === 'Citizen')

  const sortedUsers = [...citizenUsers]
    .filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
      if (sortBy === 'complaints') return b.totalComplaints - a.totalComplaints
      return 0
    })

  const handleViewProfile = (user: User) => {
    setSelectedUser({
      ...user,
      address: '123 Main Street, Ahmedabad, Gujarat 380001',
      complaintHistory: [
        { month: 'Dec', count: 1 },
        { month: 'Jan', count: 2 },
        { month: 'Feb', count: 2 },
      ],
      activityTimeline: [
        { date: '2024-02-24', action: 'Logged in' },
        { date: '2024-02-22', action: 'Submitted complaint #COM-1245' },
        { date: '2024-02-20', action: 'Updated profile' },
        { date: '2024-02-18', action: 'Complaint resolved' },
      ],
    })
    setShowModal(true)
  }

  const kpiCards = [
    { label: 'Total Registered Users', value: '1,044', change: '+12%', icon: UsersIcon, color: 'bg-blue-50', borderColor: 'border-blue-500' },
    { label: 'Active Users', value: '987', change: '+8%', icon: UsersIcon, color: 'bg-green-50', borderColor: 'border-green-500' },
    { label: 'Blocked Users', value: '12', change: '+2', icon: Lock, color: 'bg-red-50', borderColor: 'border-red-500' },
    // { label: 'New Users This Month', value: '145', change: '+15%', icon: TrendingUp, color: 'bg-purple-50', borderColor: 'border-purple-500' },
    { label: 'Users with Open Complaints', value: '234', change: '+5%', icon: FileText, color: 'bg-orange-50', borderColor: 'border-orange-500' },
  ]

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm p-6">
        <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
          <span>Department</span>
          <span>/</span>
          <span className="font-semibold">Users</span>
        </div>
        <h1 className="text-3xl font-bold text-blue-900">Users Management</h1>
        <p className="text-sm text-blue-700 mt-1">Monitor platform users</p>
      </div>

      <UsersKPI kpiCards={kpiCards} />

      <UsersAnalytics usersByDistrict={usersByDistrict} monthlyUsers={monthlyUsers} userRoleDistribution={userRoleDistribution} />

      <UsersFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} sortBy={sortBy} setSortBy={setSortBy} />

      {/* Table — no delete button */}
      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-4 font-semibold text-slate-800">User ID</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-800">Profile</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-800">Email</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-800">Phone</th>
              <th className="text-center px-6 py-4 font-semibold text-slate-800">Total</th>
              <th className="text-center px-6 py-4 font-semibold text-slate-800">Status</th>
              <th className="text-left px-6 py-4 font-semibold text-slate-800">Last Login</th>
              <th className="text-center px-6 py-4 font-semibold text-slate-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-700 font-semibold">{user.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{user.avatar}</div>
                    <span className="text-slate-900 font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{user.email}</td>
                <td className="px-6 py-4 text-slate-700">{user.phone}</td>
                <td className="px-6 py-4 text-center text-slate-900 font-semibold">{user.totalComplaints}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">{user.lastLogin}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleViewProfile(user)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors" title="View">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">Showing {sortedUsers.length} of {citizenUsers.length} users</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium">Previous</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Next</button>
          </div>
        </div>
      </div>

      <UserProfileModal showModal={showModal} selectedUser={selectedUser} onClose={() => setShowModal(false)} />
    </div>
  )
}
