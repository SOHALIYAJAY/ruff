'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle2, ArrowRight } from 'lucide-react'

export default function DepartmentLogoutSimple() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutComplete, setLogoutComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    handleLogout()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // Clear authentication data
      localStorage.removeItem('departmentToken')
      localStorage.removeItem('departmentUser')
      sessionStorage.removeItem('departmentToken')
      sessionStorage.removeItem('departmentUser')
      
      // Call logout API if available
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      try {
        await fetch(`${API_BASE}/api/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.log('Logout API call failed, continuing with client-side logout')
      }
      
      // Simulate logout process
      setTimeout(() => {
        setIsLoggingOut(false)
        setLogoutComplete(true)
      }, 1500)
      
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
      setLogoutComplete(true)
    }
  }

  const handleRedirectNow = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Simple Logout Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLoggingOut ? 'Logging Out...' : 'Logged Out'}
            </h1>
            <p className="text-gray-600 text-sm">
              {isLoggingOut 
                ? 'Please wait while we secure your session'
                : 'You have been successfully logged out'
              }
            </p>
          </div>

          {/* Status */}
          {isLoggingOut ? (
            // Loading State
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent border-r-transparent animate-spin"></div>
                <span className="text-gray-600">Terminating session...</span>
              </div>
            </div>
          ) : logoutComplete ? (
            // Success State
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 text-green-600 mb-6">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">Logout Successful</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Your department session has been securely terminated.
                </p>
                
                <button
                  onClick={handleRedirectNow}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Go to Homepage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Grievance Portal Department
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Department Services • Community Focus • Efficient Management
          </p>
        </div>
      </div>
    </div>
  )
}
