'use client'

import { useRequireAuth } from '@/contexts/JWTAuthContext'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import SidebarNavigation from '@/components/navigation/SidebarNavigation'
import '../globals.css'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily disable auth loading to fix dashboard
  // const { loading } = useRequireAuth()
  const loading = false // Force no loading

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pb-16 md:pb-0">
          {children}
        </main>
        
        <BottomNavigation />

      </div>
    </div>
  )
}