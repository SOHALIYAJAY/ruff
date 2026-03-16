"use client"

import { useState, useEffect } from "react"
import { X, UserPlus, Eye, EyeOff } from "lucide-react"
import api from '@/lib/axios'

interface AddOfficerModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
  department: string
  role: string
  employee_id: string
  password: string
  confirm_password: string
  status: string
}

interface FormErrors {
  [key: string]: string
}

export default function AddOfficerModal({
  open,
  onClose,
  onSuccess,
}: AddOfficerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "officer",
    employee_id: "",
    password: "",
    confirm_password: "",
    status: "active",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [animateIn, setAnimateIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setAnimateIn(true))
      resetForm()
      fetchDepartments()
    } else {
      setAnimateIn(false)
    }
  }, [open])

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get<any[]>('/api/deptinfo/')
      if (Array.isArray(data)) {
        const depts = data.map((d: any) => d.name || d.dept_name || String(d)).filter(Boolean)
        setDepartments(depts)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "officer",
      employee_id: "",
      password: "",
      confirm_password: "",
      status: "active",
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) newErrors.name = "Officer name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = "Phone must be 10 digits"
    
    if (!formData.department) newErrors.department = "Department is required"
    if (!formData.employee_id.trim()) newErrors.employee_id = "Employee ID is required"
    
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSubmitting(true)
      await api.post('/api/officers/', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ''),
        department: formData.department,
        role: formData.role,
        employee_id: formData.employee_id.trim(),
        password: formData.password,
        status: formData.status,
      })

      alert('Officer added successfully!')
      handleClose()
      onSuccess?.()
    } catch (error: any) {
      console.error('Error adding officer:', error)
      const msg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to add officer'
      alert(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setAnimateIn(false)
    setTimeout(() => {
      resetForm()
      onClose()
    }, 300)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-[#1e40af]" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Add New Officer</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Officer Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Officer Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter officer name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? "border-[#dc2626] focus:ring-red-500"
                  : "border-[#e2e8f0] focus:ring-[#1e40af]"
              }`}
            />
            {errors.name && <p className="text-xs text-[#dc2626] mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="officer@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.email
                  ? "border-[#dc2626] focus:ring-red-500"
                  : "border-[#e2e8f0] focus:ring-[#1e40af]"
              }`}
            />
            {errors.email && <p className="text-xs text-[#dc2626] mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10 digit phone number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.phone
                  ? "border-[#dc2626] focus:ring-red-500"
                  : "border-[#e2e8f0] focus:ring-[#1e40af]"
              }`}
            />
            {errors.phone && <p className="text-xs text-[#dc2626] mt-1">{errors.phone}</p>}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.department
                  ? "border-[#dc2626] focus:ring-red-500"
                  : "border-[#e2e8f0] focus:ring-[#1e40af]"
              }`}
            >
              <option value="">Select department...</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && <p className="text-xs text-[#dc2626] mt-1">{errors.department}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e40af] transition-colors"
            >
              <option value="officer">Officer</option>
              <option value="head">Department Head</option>
            </select>
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Employee ID *
            </label>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              placeholder="EMP-001"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.employee_id
                  ? "border-[#dc2626] focus:ring-red-500"
                  : "border-[#e2e8f0] focus:ring-[#1e40af]"
              }`}
            />
            {errors.employee_id && <p className="text-xs text-[#dc2626] mt-1">{errors.employee_id}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-10 ${
                  errors.password
                    ? "border-[#dc2626] focus:ring-red-500"
                    : "border-[#e2e8f0] focus:ring-[#1e40af]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-[#dc2626] mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-10 ${
                  errors.confirm_password
                    ? "border-[#dc2626] focus:ring-red-500"
                    : "border-[#e2e8f0] focus:ring-[#1e40af]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-xs text-[#dc2626] mt-1">{errors.confirm_password}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e40af] transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 border border-[#e2e8f0] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Adding..." : "Add Officer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
