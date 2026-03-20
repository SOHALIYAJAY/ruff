"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle, Shield, Clock, User } from 'lucide-react'

export default function OfficerLogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutComplete, setLogoutComplete] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      setIsLoggingOut(true)
      
      try {
        // Clear all authentication data
        localStorage.removeItem('access_token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('departmentToken')
        localStorage.removeItem('adminUser')
        localStorage.removeItem('departmentUser')
        localStorage.removeItem('user')
        sessionStorage.clear()
        
        // Simulate logout processing
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setLogoutComplete(true)
        setIsLoggingOut(false)
        
        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              router.push('/login')
              return 0
            }
            return prev - 1
          })
        }, 1000)
        
      } catch (error) {
        console.error('Logout error:', error)
        // Even if there's an error, redirect to login
        router.push('/login')
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-blue-600 to-green-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
              ) : logoutComplete ? (
                <CheckCircle className="w-12 h-12 text-white" />
              ) : (
                <LogOut className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLoggingOut ? 'Logging Out' : logoutComplete ? 'Logged Out' : 'Officer Logout'}
            </h1>
            <p className="text-white/90">
              {isLoggingOut ? 'Securing your session...' : logoutComplete ? 'Session secured successfully' : 'Terminating your officer session'}
            </p>
          </div>

          {/* Security Actions */}
          <div className="p-8 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <User className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">User Session</p>
                  <div className="h-2 bg-blue-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: isLoggingOut ? '60%' : logoutComplete ? '100%' : '20%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Security Check</p>
                  <div className="h-2 bg-green-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full transition-all duration-500"
                      style={{ width: isLoggingOut ? '40%' : logoutComplete ? '100%' : '20%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cache Clear</p>
                  <div className="h-2 bg-yellow-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-yellow-600 rounded-full transition-all duration-500"
                      style={{ width: isLoggingOut ? '80%' : logoutComplete ? '100%' : '20%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <div className="text-center py-4">
              {isLoggingOut && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Clearing authentication data...</p>
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {logoutComplete && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">✓ All session data cleared</p>
                  <p className="text-sm text-gray-600">Redirecting to login page in {countdown} seconds...</p>
                </div>
              )}
            </div>

            {/* Manual Redirect Button */}
            {logoutComplete && (
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
              >
                Go to Login Now
              </button>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500">
              <Shield className="w-3 h-3 inline mr-1" />
              Your officer session has been securely terminated
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
