'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import SidebarNavigation from '@/components/navigation/SidebarNavigation'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Check for WordPress auth token
      const wpToken = localStorage.getItem('wp_token')
      
      if (!wpToken) {
        router.push('/auth/login')
        return
      }

      // Validate the token
      try {
        const response = await fetch('https://powlax.com/wp-json/wp/v2/users/me', {
          headers: {
            'Authorization': `Basic ${wpToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          localStorage.removeItem('wp_token')
          router.push('/auth/login')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

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