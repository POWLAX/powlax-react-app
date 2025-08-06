'use client'

import { useState } from 'react'
import { 
  PageHeader, 
  QuickActionMenu, 
  RoleBasedNavFilter,
  BreadcrumbNav 
} from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Download, Share, Settings } from 'lucide-react'

export default function NavigationDemoPage() {
  const [message, setMessage] = useState('')
  
  const quickActions = [
    {
      id: 'create-practice',
      label: 'Create Practice Plan',
      description: 'Start a new practice session',
      href: '/practice-plans/new',
      icon: Plus
    },
    {
      id: 'export',
      label: 'Export Data',
      description: 'Download your team data',
      onClick: () => setMessage('Export clicked!'),
      icon: Download
    },
    {
      id: 'share',
      label: 'Share with Team',
      description: 'Send to your players',
      onClick: () => setMessage('Share clicked!'),
      icon: Share
    }
  ]
  
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Demo', href: '/demo' },
    { label: 'Navigation Features' }
  ]
  
  return (
    <>
      {/* Page Header with breadcrumbs and actions */}
      <PageHeader
        title="Navigation Enhancement Demo"
        subtitle="Showcasing the improved navigation components"
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          </>
        }
      />
      
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Demo Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Enhanced Navigation Features</h2>
          
          <div className="space-y-6">
            {/* Feature 1: Bottom Navigation */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ Enhanced Bottom Navigation</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Larger touch targets (64px minimum)</li>
                <li>• Always visible labels</li>
                <li>• Clear active state with top indicator</li>
                <li>• Role-based filtering</li>
                <li>• Smooth transitions</li>
              </ul>
            </div>
            
            {/* Feature 2: Sidebar Navigation */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ Enhanced Sidebar Navigation</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Organized into clear sections (Main, Training, Resources)</li>
                <li>• Visual active indicator on the left</li>
                <li>• Improved user profile section with quick actions</li>
                <li>• Role-based menu filtering</li>
                <li>• Better visual hierarchy</li>
              </ul>
            </div>
            
            {/* Feature 3: Breadcrumb Navigation */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ Breadcrumb Navigation</h3>
              <p className="text-sm text-gray-600 mb-2">See the breadcrumb trail at the top of this page!</p>
              <div className="p-3 bg-gray-50 rounded">
                <BreadcrumbNav items={[
                  { label: 'Example', href: '/example' },
                  { label: 'Nested', href: '/example/nested' },
                  { label: 'Current Page' }
                ]} />
              </div>
            </div>
            
            {/* Feature 4: Role-Based Filtering */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ Role-Based Navigation</h3>
              <div className="space-y-2">
                <RoleBasedNavFilter roles={['coach', 'director']}>
                  <div className="p-3 bg-blue-50 text-blue-700 rounded">
                    This content is only visible to coaches and directors
                  </div>
                </RoleBasedNavFilter>
                
                <RoleBasedNavFilter roles={['player']}>
                  <div className="p-3 bg-green-50 text-green-700 rounded">
                    This content is only visible to players
                  </div>
                </RoleBasedNavFilter>
                
                <RoleBasedNavFilter 
                  roles={['admin']}
                  fallback={
                    <div className="p-3 bg-gray-50 text-gray-600 rounded">
                      You need admin access to see special content
                    </div>
                  }
                >
                  <div className="p-3 bg-purple-50 text-purple-700 rounded">
                    Admin-only content
                  </div>
                </RoleBasedNavFilter>
              </div>
            </div>
            
            {/* Feature 5: Page Headers */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ Consistent Page Headers</h3>
              <p className="text-sm text-gray-600">
                The header at the top of this page demonstrates breadcrumbs, title, subtitle, and action buttons
              </p>
            </div>
            
            {/* Message Display */}
            {message && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                {message}
              </div>
            )}
          </div>
        </div>
        
        {/* Usage Examples */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">PageHeader Component</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`<PageHeader
  title="Your Page Title"
  subtitle="Optional subtitle"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Current Page' }
  ]}
  actions={<Button>Action</Button>}
/>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">QuickActionMenu Component</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`<QuickActionMenu
  actions={[
    {
      id: 'action-1',
      label: 'Create New',
      href: '/create',
      icon: Plus
    }
  ]}
/>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">RoleBasedNavFilter Component</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`<RoleBasedNavFilter roles={['coach', 'admin']}>
  <div>Coach and admin only content</div>
</RoleBasedNavFilter>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Action Menu - Floating at bottom right */}
      <QuickActionMenu actions={quickActions} />
    </>
  )
}