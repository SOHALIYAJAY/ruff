"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import api from "@/lib/axios"

export default function CreateOfficerPage() {
  const [formData, setFormData] = useState({
    officer_id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    role: "",
    is_available: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.officer_id.trim()) {
      errors.officer_id = "Officer ID is required"
    }

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^\d{10}/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Phone number must be at least 10 digits"
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required"
    }

    if (!formData.role.trim()) {
      errors.role = "Role is required"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
      // Clear field error when user starts typing
      if (fieldErrors[name]) {
        setFieldErrors((prev) => {
          const updated = { ...prev }
          delete updated[name]
          return updated
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        officer_id: formData.officer_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        department: formData.department,
        role: formData.role,
        is_available: formData.is_available,
      }

      await api.post("/api/create-officer/", payload)
      setSuccess(true)

      setTimeout(() => {
        router.push("/department/officers")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Create officer error:", err)
      const msg = err?.response?.data || err?.message || "Failed to create officer"

      if (typeof msg === "object") {
        const errorMessages = Object.entries(msg)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n")
        setError(errorMessages)
      } else {
        setError(String(msg))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1e40af] hover:text-[#1e3a8a] font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Officers
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Create New Officer</h1>
          <p className="text-slate-600 mt-2">Add a new officer to your department</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#16a34a]">Officer Created Successfully</h3>
              <p className="text-sm text-green-700">Redirecting to officers list...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#dc2626]">Error</h3>
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-8 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-4 border-b border-[#e2e8f0]">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Officer ID */}
              <div>
                <label htmlFor="officer_id" className="block text-sm font-medium text-slate-700 mb-2">
                  Officer ID <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  id="officer_id"
                  name="officer_id"
                  value={formData.officer_id}
                  onChange={handleChange}
                  placeholder="e.g., OFF001"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#1e40af]/20 transition-colors ${
                    fieldErrors.officer_id
                      ? "border-red-300 bg-red-50"
                      : "border-[#e2e8f0] bg-white hover:border-slate-300"
                  }`}
                />
                {fieldErrors.officer_id && (
                  <p className="text-sm text-[#dc2626] mt-1">{fieldErrors.officer_id}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#1e40af]/20 transition-colors ${
                    fieldErrors.name
                      ? "border-red-300 bg-red-50"
                      : "border-[#e2e8f0] bg-white hover:border-slate-300"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-[#dc2626] mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="officer@example.com"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#1e40af]/20 transition-colors ${
                    fieldErrors.email
                      ? "border-red-300 bg-red-50"
                      : "border-[#e2e8f0] bg-white hover:border-slate-300"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-[#dc2626] mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +1234567890"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#1e40af]/20 transition-colors ${
                    fieldErrors.phone
                      ? "border-red-300 bg-red-50"
                      : "border-[#e2e8f0] bg-white hover:border-slate-300"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-[#dc2626] mt-1">{fieldErrors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Department & Role */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-4 border-b border-[#e2e8f0]">
              Assignment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-2">
                  Department <span className="text-[#dc2626]">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#1e40af]/20 transition-colors ${
                    fieldErrors.department
                      ? "border-red-300 bg-red-50"
                      : "border-[#e2e8f0] bg-white hover:border-slate-300"
                  }`}
                >
                  <option value="">Select a department</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Health Services">Health Services</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Administration">Administration</option>
                </select>
                {fieldErrors.department && (
                  <p className="text-sm text-[#dc2626] mt-1">{fieldErrors.department}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                  Role <span className="text-[#dc2626]">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#1e40af]/20 transition-colors ${
                    fieldErrors.role
                      ? "border-red-300 bg-red-50"
                      : "border-[#e2e8f0] bg-white hover:border-slate-300"
                  }`}
                >
                  <option value="">Select a role</option>
                  <option value="Senior Officer">Senior Officer</option>
                  <option value="Officer">Officer</option>
                  <option value="Junior Officer">Junior Officer</option>
                  <option value="Coordinator">Coordinator</option>
                </select>
                {fieldErrors.role && (
                  <p className="text-sm text-[#dc2626] mt-1">{fieldErrors.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-4 border-b border-[#e2e8f0]">
              Security
            </h2>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password <span className="text-[#dc2626]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a strong password"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#1e40af]/20 transition-colors pr-10 ${
                    fieldErrors.password
                      ? "border-red-300 bg-red-50"
                      : "border-[#e2e8f0] bg-white hover:border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-[#dc2626] mt-1">{fieldErrors.password}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">Minimum 6 characters required</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-4 border-b border-[#e2e8f0]">
              Status
            </h2>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                id="is_available"
                name="is_available"
                type="checkbox"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-4 h-4 text-[#1e40af] rounded border-[#e2e8f0] focus:ring-2 focus:ring-[#1e40af]/20 cursor-pointer"
              />
              <label htmlFor="is_available" className="text-sm font-medium text-slate-700 cursor-pointer">
                Officer is available and can accept assignments
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-2.5 border border-[#e2e8f0] text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 px-6 py-2.5 bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting ? "Creating Officer..." : success ? "Officer Created!" : "Create Officer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) return setError(v)
    setSubmitting(true)
    try{
      const payload = {
        officer_id: officerId,
        name,
        email,
        phone,
        is_available: isAvailable
      }
      const res = await api.post('/api/create-officer/', payload)
      // navigate back to officers list
      router.push('/department/officers')
    }catch(err:any){
      console.error('Create officer error', err)
      const msg = err?.response?.data || err?.message || 'Failed to create officer'
      // show first serializer error if present
      if (typeof msg === 'object'){
        const first = Object.entries(msg)[0]
        setError(`${first[0]}: ${JSON.stringify(first[1])}`)
      } else setError(String(msg))
    }finally{ setSubmitting(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Officer</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-lg p-6">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Officer ID</label>
          <input value={officerId} onChange={e=>setOfficerId(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="avail" type="checkbox" checked={isAvailable} onChange={e=>setIsAvailable(e.target.checked)} />
          <label htmlFor="avail" className="text-sm text-slate-700">Available</label>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#7c3aed] text-white rounded disabled:opacity-60">{submitting ? 'Creating...' : 'Create Officer'}</button>
        </div>
      </form>
    </div>
  )
}
