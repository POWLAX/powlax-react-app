import BottomNavigation from '@/components/navigation/BottomNavigation'
import SidebarNavigation from '@/components/navigation/SidebarNavigation'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden md:block">
        <SidebarNavigation />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-yellow-500 text-black text-center py-2 text-sm font-medium">
          🎯 DEMO MODE - Not authenticated
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pb-16 md:pb-0">
          {children}
        </main>
        
        <BottomNavigation />
      </div>
    </div>
  )
}