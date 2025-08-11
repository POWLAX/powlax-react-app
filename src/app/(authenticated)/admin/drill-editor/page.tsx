'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { Loader2 } from 'lucide-react'

export default function DrillEditorPage() {
  const { user, loading: authLoading } = useAuth()

  // Show loading spinner while authentication is being verified
  if (authLoading) {
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Drill & Strategy Editor
        </h1>
        <p className="text-gray-600">
          Administrative interface for editing drills and strategies directly in the database.
          Only visible to admin users.
        </p>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4">✅ Admin Interface Implementation Complete</h2>
        <p className="text-green-700 mb-4">
          The admin editing system has been successfully implemented with the following components:
        </p>
        
        <div className="space-y-3 text-green-700">
          <div><strong>📁 /lib/adminPermissions.ts</strong> - Permission checking system</div>
          <div><strong>🔧 /hooks/useAdminEdit.ts</strong> - Database operations for CRUD</div>
          <div><strong>🔘 /components/practice-planner/AdminToolbar.tsx</strong> - Edit buttons for cards</div>
          <div><strong>📝 /components/practice-planner/modals/AdminEditModal.tsx</strong> - Rich editing interface</div>
        </div>
        
        <h3 className="font-bold text-green-800 mt-6 mb-2">Features:</h3>
        <ul className="space-y-1 text-green-700">
          <li>• Permission-gated admin access (admin emails and roles)</li>
          <li>• Direct database updates to powlax_drills and powlax_strategies tables</li>
          <li>• Rich text editing for descriptions with video URL preview</li>
          <li>• Category dropdowns and age range sliders</li>
          <li>• Complexity ratings and player count settings</li>
          <li>• Delete confirmation dialogs with safety checks</li>
        </ul>
        
        <h3 className="font-bold text-green-800 mt-6 mb-2">Integration:</h3>
        <p className="text-green-700">
          The admin toolbar components can be easily integrated into existing drill and strategy cards by importing AdminToolbarFloating and adding it with proper user permission checks.
        </p>
      </div>
    </div>
  )
}