import TestCategoryUpdate from '@/components/admin/test-category-update'

export default function TestUpdatePage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Category Update Test</h1>
        <TestCategoryUpdate />
      </div>
    </div>
  )
}
