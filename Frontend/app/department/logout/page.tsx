'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Shield, CheckCircle2, ArrowRight, User, Lock, Clock, Home } from 'lucide-react'

export default function DepartmentLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutComplete, setLogoutComplete] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    handleLogout()
  }, [])

  useEffect(() => {
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
      localStorage.removeItem('access_token')
      localStorage.removeItem('departmentToken')
      localStorage.removeItem('departmentUser')
      localStorage.removeItem('adminToken')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('departmentToken')
      sessionStorage.removeItem('departmentUser')
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      try {
        await fetch(`${API_BASE}/api/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.log('Logout API call failed, continuing with client-side logout')
      }
      
      setTimeout(() => {
        setIsLoggingOut(false)
        setLogoutComplete(true)
      }, 2000)
      
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Illustration */}
            <div className="relative bg-gradient-to-br from-green-600 to-blue-600 p-12 flex items-center justify-center">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full"></div>
                <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
              </div>
              
              {/* Person Illustration */}
              <div className="relative z-10 text-center">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                  {isLoggingOut ? (
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : logoutComplete ? (
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    {isLoggingOut ? 'Signing Out...' : 'Logged Out'}
                  </h2>
                  <p className="text-green-100">
                    {isLoggingOut ? 'Securing your department session...' : 'Thank you for your service'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="p-12">
              {isLoggingOut ? (
                // Logging Out State
                <div className="space-y-8">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      Signing Out
                    </h1>
                    <p className="text-gray-600">
                      Please wait while we secure your department session
                    </p>
                  </div>

                  {/* Security Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                      <User className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{width: '80%'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                      <Lock className="w-5 h-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="h-2 bg-teal-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 rounded-full animate-pulse" style={{width: '40%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : logoutComplete ? (
                // Logout Complete State
                <div className="space-y-8">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      Successfully Logged Out
                    </h1>
                    <p className="text-gray-600 mb-2">
                      Your department session has been securely terminated
                    </p>
                    <p className="text-gray-500 text-sm">
                      All authentication data has been cleared for your protection
                    </p>
                  </div>

                  {/* Success Features */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-700 font-medium">Logged Out</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-700 font-medium">Secured</p>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-xl border border-teal-100">
                      <Lock className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-700 font-medium">Protected</p>
                    </div>
                  </div>

                  {/* Redirect Timer */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Redirecting to Home</h3>
                          <p className="text-sm text-gray-600">Auto-redirect in {countdown} seconds</p>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200">
                        <span className="text-xl font-bold text-green-600">{countdown}</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Redirect Button */}
                  <button
                    onClick={handleRedirectNow}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Home className="w-5 h-5" />
                    Go to Home Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Footer */}
          <div className="px-12 py-6 bg-gray-50 border-t border-gray-100">
            <div className="text-center">
              <p className="text-gray-500 text-sm font-medium">
                Department Grievance Portal
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Civic Services • Community Focus • Efficient Management
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">Security Notice</h3>
              <p className="text-gray-600 text-xs mt-1">
                Your department session has been securely terminated. All authentication data has been cleared from this device for your protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
