'use client'

import { useAuth } from '@/contexts/JWTAuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  Edit3,
  Users,
  Database,
  Shield,
  ArrowRight,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { user: currentUser } = useAuth()

  // Check permissions - handle multiple admin roles and dev mode
  const isAdmin = currentUser?.roles?.some(role => 
    ['administrator', 'admin', 'club_director', 'super_admin'].includes(role)
  ) || process.env.NODE_ENV === 'development'

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Only administrators can access the admin dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const adminTools = [
    {
      title: 'Content Editor',
      description: 'Edit drills, strategies, and Skills Academy content. Fix broken Lacrosse Lab URLs.',
      icon: Edit3,
      href: '/admin/content-editor',
      priority: 'high',
      features: ['Fix broken URLs', 'Edit strategies', 'Manage drills', 'Update academy content'],
      status: 'ready'
    },
    {
      title: 'Role Management', 
      description: 'Manage user roles and permissions across the platform.',
      icon: Users,
      href: '/admin/role-management',
      priority: 'medium',
      features: ['Change user roles', 'View permissions', 'Sync with WordPress'],
      status: 'ready'
    },
    {
      title: 'Data Sync',
      description: 'Synchronize data between WordPress and Supabase.',
      icon: Database,
      href: '/admin/sync',
      priority: 'medium', 
      features: ['WordPress sync', 'Data validation', 'Migration tools'],
      status: 'ready'
    }
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage POWLAX content, users, and system operations
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">
                {process.env.NODE_ENV === 'development' ? 'Development Mode' : currentUser?.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">
                  {process.env.NODE_ENV === 'development' ? 'Dev Admin' : (currentUser?.roles?.[0] || 'Admin')}
                </Badge>
                {process.env.NODE_ENV === 'development' && (
                  <Badge variant="outline">Full Access</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Alert - Broken URLs */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800">Action Required: Broken Links</h3>
              <p className="text-red-700 text-sm mt-1">
                Multiple strategies have broken Lacrosse Lab URLs that need immediate fixing.
              </p>
              <Link href="/admin/content-editor">
                <Button className="mt-3 bg-red-600 hover:bg-red-700">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Fix Broken URLs Now
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => {
          const IconComponent = tool.icon
          return (
            <Card key={tool.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tool.priority === 'high' ? 'bg-red-100' :
                      tool.priority === 'medium' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        tool.priority === 'high' ? 'text-red-600' :
                        tool.priority === 'medium' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <Badge variant={tool.status === 'ready' ? 'default' : 'secondary'} className="text-xs mt-1">
                        {tool.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link href={tool.href}>
                    <Button className="w-full" variant={tool.priority === 'high' ? 'default' : 'outline'}>
                      Open {tool.title}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">Ready</div>
              <div className="text-sm text-gray-600">Content Editor</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-gray-600">User Management</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">Connected</div>
              <div className="text-sm text-gray-600">Supabase DB</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {process.env.NODE_ENV === 'development' ? 'Dev' : 'Prod'}
              </div>
              <div className="text-sm text-gray-600">Environment</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}