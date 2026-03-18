'use client'

import { useState, useEffect } from 'react'

export default function TestAPI() {
  const [statusData, setStatusData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testAPIs()
  }, [])

  const testAPIs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      console.log('Testing API with base URL:', API_BASE)
      
      // Test status API
      console.log('Testing status API...')
      const statusResponse = await fetch(`${API_BASE}/api/complaintstatus/`)
      console.log('Status response status:', statusResponse.status)
      
      if (!statusResponse.ok) {
        throw new Error(`Status API failed: ${statusResponse.status}`)
      }
      
      const statusResult = await statusResponse.json()
      console.log('Status API response:', statusResult)
      setStatusData(statusResult)
      
      // Test monthly API
      console.log('Testing monthly API...')
      const monthlyResponse = await fetch(`${API_BASE}/api/complaintmonthwise/`)
      console.log('Monthly response status:', monthlyResponse.status)
      
      if (!monthlyResponse.ok) {
        throw new Error(`Monthly API failed: ${monthlyResponse.status}`)
      }
      
      const monthlyResult = await monthlyResponse.json()
      console.log('Monthly API response:', monthlyResult)
      setMonthlyData(monthlyResult)
      
    } catch (err: any) {
      console.error('API test error:', err)
      setError(err.message || 'Failed to test APIs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Testing API Connections...</h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Test Results</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status API Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Status API Response
            </h2>
            {statusData ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <p className="text-sm text-green-800 font-medium">✅ API Working</p>
                </div>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(statusData, null, 2)}
                </pre>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total:</span> {Object.values(statusData).reduce((a: any, b: any) => a + b, 0)} complaints
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Pending:</span> {statusData.Pending}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">In Progress:</span> {statusData['In Progress']}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Resolved:</span> {statusData.Resolved}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">❌ No data received</p>
              </div>
            )}
          </div>

          {/* Monthly API Results */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly API Response
            </h2>
            {monthlyData ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <p className="text-sm text-green-800 font-medium">✅ API Working</p>
                </div>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(monthlyData, null, 2)}
                </pre>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total:</span> {Object.values(monthlyData).reduce((a: any, b: any) => a + b, 0)} complaints
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">March:</span> {monthlyData[3]} complaints
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Other months:</span> {Object.entries(monthlyData).filter(([month, count]) => month !== '3' && count > 0).length} months with complaints
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">❌ No data received</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Debug Information</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
            <p><strong>Browser Console:</strong> Check for additional error messages</p>
          </div>
          <button 
            onClick={testAPIs}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retest APIs
          </button>
        </div>
      </div>
    </div>
  )
}
