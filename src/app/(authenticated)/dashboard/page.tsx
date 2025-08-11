'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  // Show loading spinner while authentication is being verified
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Coach Dashboard</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Dashboard is working!</h2>
        <p className="text-gray-600">The dashboard page is now loading successfully.</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Quick Actions</h3>
            <p className="text-sm text-blue-700 mt-1">Create practice plans and manage teams</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Skills Academy</h3>
            <p className="text-sm text-green-700 mt-1">Interactive training and workouts</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Team Stats</h3>
            <p className="text-sm text-purple-700 mt-1">Track progress and performance</p>
          </div>
        </div>
      </div>
    </div>
  )
}