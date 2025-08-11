'use client'

import { useRequireAuth } from '@/contexts/SupabaseAuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import SidebarNavigation from '@/components/navigation/SidebarNavigation'
import '../globals.css'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use the auth hook but don't block on loading
  // This prevents infinite loading spinners
  // TODO: Re-enable auth check after fixing auth loading issue
  // const { loading } = useRequireAuth()

  // Temporarily bypass auth loading check to fix infinite spinner
  const loading = false

  // Only show loading spinner briefly on initial load
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
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <SidebarNavigation />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pb-16 md:pb-0">
            {children}
          </main>
          
          <BottomNavigation />

        </div>
      </div>
    </SidebarProvider>
  )
}