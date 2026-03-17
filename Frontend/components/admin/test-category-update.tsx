'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function TestCategoryUpdate() {
  const [categories, setCategories] = useState<any[]>([])
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000'

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categorieslist/`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      setTestResult(`Error fetching categories: ${error}`)
    }
  }

  const testUpdateCategory = async (categoryId: number) => {
    setLoading(true)
    setTestResult('')
    
    try {
      const category = categories.find(c => c.id === categoryId)
      if (!category) {
        setTestResult('Category not found')
        return
      }

      // Test update with modified name
      const updatedName = `${category.name} (Updated)`
      const res = await fetch(`${API_BASE}/api/updatecategory/${categoryId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: updatedName,
          code: category.code || 'TEST',
          department: category.department || 'Unassigned'
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage = errorData.errors ? 
          Object.values(errorData.errors).flat().join(', ') : 
          (errorData.detail || errorData.message || 'Update failed')
        throw new Error(errorMessage)
      }

      const json = await res.json()
      const updated = json.data ?? json
      
      setTestResult(`✅ Update Successful! Updated category: ${updated.name}`)
      
      // Refresh categories list
      await fetchCategories()
      
    } catch (error: any) {
      setTestResult(`❌ Update Failed: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Category Update Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Available Categories:</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium">{cat.name}</span>
                  {cat.code && <span className="text-sm text-slate-600 ml-2">({cat.code})</span>}
                </div>
                <Button
                  onClick={() => testUpdateCategory(cat.id)}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? 'Testing...' : 'Test Update'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <p className="font-medium">Test Result:</p>
            <p>{testResult}</p>
          </div>
        )}

        <div className="text-sm text-slate-600">
          <p><strong>How this test works:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Fetches categories from the new CategoryList API endpoint</li>
            <li>Tests the PATCH update functionality</li>
            <li>Updates the category name with "(Updated)" suffix</li>
            <li>Displays success or error messages</li>
            <li>Refreshes the list to show the updated data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
