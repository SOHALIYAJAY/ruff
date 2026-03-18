'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Building2, CheckCircle2, Clock, ArrowRight } from 'lucide-react'

export default function DepartmentLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutComplete, setLogoutComplete] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    // Start logout process immediately
    handleLogout()
  }, [])

  useEffect(() => {
    // Countdown timer for redirect
    if (logoutComplete && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (logoutComplete && countdown === 0) {
      router.push('/')
    }
  }, [logoutComplete, countdown, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // Clear any stored authentication data
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
        // Continue with logout even if API call fails
        console.log('Logout API call failed, continuing with client-side logout')
      }
      
      // Simulate logout process for better UX
      setTimeout(() => {
        setIsLoggingOut(false)
        setLogoutComplete(true)
      }, 2000)
      
    } catch (error) {
      console.error('Logout error:', error)
      // Still complete logout even if there's an error
      setIsLoggingOut(false)
      setLogoutComplete(true)
    }
  }

  const handleRedirectNow = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Main Logout Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLoggingOut ? 'Signing Out...' : 'Logged Out Successfully'}
            </h1>
            <p className="text-green-100 text-sm">
              {isLoggingOut ? 'Please wait while we secure your session' : 'Thank you for using Grievance Portal'}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {isLoggingOut ? (
              // Logging Out State
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <Building2 className="w-6 h-6 text-green-600 absolute top-3 left-3" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>Terminating session...</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Clearing department access...</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Securing your department account...</span>
                  </div>
                </div>
              </div>
            ) : logoutComplete ? (
              // Logout Complete State
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    See You Soon!
                  </h2>
                  <p className="text-slate-600 text-sm mb-6">
                    You have been successfully logged out of the department panel.
                  </p>
                </div>

                {/* Security Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900 text-sm">Security Notice</h3>
                      <p className="text-green-700 text-xs mt-1">
                        Your department session has been securely terminated. All authentication data has been cleared from this device.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Redirect Timer */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900 text-sm">Redirecting to Home</h3>
                      <p className="text-green-700 text-xs mt-1">
                        You will be redirected automatically in {countdown} seconds
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {countdown}
                    </div>
                  </div>
                </div>

                {/* Manual Redirect Button */}
                <button
                  onClick={handleRedirectNow}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Go to Home Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            Grievance Portal Department Dashboard
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Department Services • Community Focus • Efficient Management
          </p>
        </div>
      </div>
    </div>
  )
}
