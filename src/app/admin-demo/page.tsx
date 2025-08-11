import AdminDemo from '@/components/practice-planner/AdminDemo'

export default function AdminDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Admin Features Demo</h1>
          <p className="text-gray-600">
            This page shows what admin users see in the Practice Planner
          </p>
        </div>
        <AdminDemo />
      </div>
    </div>
  )
}
