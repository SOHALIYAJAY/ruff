'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Upload, X, AlertCircle } from 'lucide-react'

const categories = [
  'Roads & Infrastructure',
  'Water Supply',
  'Sanitation',
  'Street Lighting',
  'Drainage',
  'Illegal Construction',
  'Noise Pollution',
  'Other',
]

const districts = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Amreli']

export default function RaiseComplaintForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    district: '',
    taluka: '',
    ward: '',
    priority: 'medium',
  })

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles(prev => [...prev, ...files].slice(0, 3))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...files].slice(0, 3))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    console.log('[v0] Complaint submitted:', formData, uploadedFiles)
    
    setTimeout(() => {
      setSubmitted(false)
    }, 3000)
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {submitted && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-lg slide-in-up">
            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-700 mb-1">Complaint Submitted Successfully!</h3>
                <p className="text-green-600 text-sm">Your complaint ID: <span className="font-mono font-bold">CTC-2024-001234</span></p>
                <p className="text-green-600 text-sm mt-2">We will review your complaint and take necessary action. You can track the status using your complaint ID.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Complaint Title */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Category */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about the issue..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  required
                />
              </div>

              {/* File Upload */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">
                  Attach Photos/Videos <span className="text-muted-foreground">(Optional)</span>
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-2">
                    Drag and drop files or <button type="button" className="text-primary hover:underline">browse</button>
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept="image/*,video/*"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <span className="text-xs text-muted-foreground">Max 3 files, 10MB each</span>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-foreground truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Location Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Location Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter street address or location name"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select district</option>
                        {districts.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Taluka <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="taluka"
                        value={formData.taluka}
                        onChange={handleInputChange}
                        placeholder="Enter taluka name"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Ward Number <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      placeholder="Ward number if applicable"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Use My Current Location
                  </Button>
                </div>
              </div>

              {/* Priority Level */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={level}
                        checked={formData.priority === level}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button 
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground hover:bg-yellow-500 font-semibold py-3 rounded-lg transition-all duration-200"
                  size="lg"
                >
                  Submit Complaint
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1 py-3"
                  size="lg"
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </div>

          {/* Right Sidebar - Map & Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Map Placeholder */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Location Map</h3>
                <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Map preview will appear here</p>
                  </div>
                </div>
              </div>

              {/* Complaint Guidelines */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Important Guidelines</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Provide clear and accurate information</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Attach photos/videos as evidence</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Include exact location details</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Avoid duplicate complaints</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Be respectful and factual in description</span>
                  </li>
                </ul>
              </div>

              {/* Info Card */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Tracking Your Complaint</p>
                    <p className="text-xs text-muted-foreground">You will receive a unique complaint ID after submission. Use this ID to track the status and progress of your complaint anytime.</p>
                  </div>
                </div>
              </div>

              {/* Expected Timeline Card */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <div className="flex gap-3">
                  <div className="text-2xl">⏱️</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Expected Resolution Time</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>High Priority: 2-3 days</li>
                      <li>Medium Priority: 5-7 days</li>
                      <li>Low Priority: 10-14 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
