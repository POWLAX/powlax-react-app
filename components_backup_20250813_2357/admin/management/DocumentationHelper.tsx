'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  HelpCircle, 
  Database, 
  Link2, 
  Table,
  Info,
  ChevronRight,
  X,
  BookOpen,
  ArrowRight,
  GitBranch,
  Users,
  Shield,
  Building,
  Clipboard,
  BarChart
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TableInfo {
  name: string
  description: string
  fields: string[]
  relationships: { table: string; type: string; description: string }[]
  recordCount?: number
}

interface FeatureDocumentation {
  feature: string
  description: string
  tables: TableInfo[]
  workflow: string[]
  permissions: string[]
}

const DATABASE_DOCUMENTATION: Record<string, FeatureDocumentation> = {
  users: {
    feature: 'User Management',
    description: 'Core user data management and authentication',
    tables: [
      {
        name: 'users',
        description: 'Main user table storing all user accounts',
        fields: ['id', 'email', 'display_name', 'roles[]', 'created_at', 'last_sign_in_at'],
        relationships: [
          { table: 'team_members', type: 'one-to-many', description: 'User can be member of multiple teams' },
          { table: 'user_sessions', type: 'one-to-many', description: 'User can have multiple sessions' },
          { table: 'family_members', type: 'one-to-many', description: 'User can be in family accounts' },
          { table: 'membership_entitlements', type: 'one-to-many', description: 'User membership access rights' }
        ],
        recordCount: 50
      },
      {
        name: 'team_members',
        description: 'Links users to teams with specific roles',
        fields: ['id', 'user_id', 'team_id', 'role', 'joined_at'],
        relationships: [
          { table: 'users', type: 'many-to-one', description: 'References user account' },
          { table: 'teams', type: 'many-to-one', description: 'References team entity' }
        ],
        recordCount: 25
      },
      {
        name: 'membership_entitlements',
        description: 'User subscription and product access rights',
        fields: ['id', 'user_id', 'product_id', 'capabilities[]', 'valid_until'],
        relationships: [
          { table: 'users', type: 'many-to-one', description: 'User who owns entitlement' },
          { table: 'membership_products', type: 'many-to-one', description: 'Product granting access' }
        ]
      }
    ],
    workflow: [
      'Query users table with filters (email, roles)',
      'Join team_members to show team associations',
      'Check membership_entitlements for product access',
      'Display aggregated user capabilities',
      'Update roles array directly in users table'
    ],
    permissions: ['administrator', 'club_director']
  },
  
  roles: {
    feature: 'Role & Permission Management',
    description: 'Role-based access control using array pattern',
    tables: [
      {
        name: 'users',
        description: 'Stores roles as PostgreSQL array in roles column',
        fields: ['id', 'roles[]'],
        relationships: [],
        recordCount: 50
      }
    ],
    workflow: [
      'Read roles array from users table',
      'Check if user.roles includes required role',
      'Update roles array using Supabase array operations',
      'No junction table needed - direct array storage'
    ],
    permissions: ['administrator']
  },

  memberpress: {
    feature: 'Memberpress WordPress Sync',
    description: 'Synchronizes membership data with WordPress backend',
    tables: [
      {
        name: 'membership_products',
        description: 'Product definitions from WordPress',
        fields: ['id', 'name', 'tier', 'capabilities[]', 'price'],
        relationships: [
          { table: 'membership_entitlements', type: 'one-to-many', description: 'Product grants entitlements' }
        ]
      },
      {
        name: 'user_subscriptions',
        description: 'Active subscriptions synced from WordPress',
        fields: ['id', 'user_id', 'product_id', 'status', 'expires_at'],
        relationships: [
          { table: 'users', type: 'many-to-one', description: 'Subscription owner' },
          { table: 'membership_products', type: 'many-to-one', description: 'Subscribed product' }
        ]
      },
      {
        name: 'webhook_queue',
        description: 'Reliable webhook processing with retry logic',
        fields: ['id', 'event_type', 'payload', 'status', 'retry_count'],
        relationships: [
          { table: 'webhook_events', type: 'one-to-one', description: 'Processed event record' }
        ]
      }
    ],
    workflow: [
      'WordPress sends webhook to /api/webhooks/memberpress',
      'Webhook data queued in webhook_queue table',
      'Background processor updates user_subscriptions',
      'membership_entitlements calculated from subscriptions',
      'User capabilities aggregated from all entitlements'
    ],
    permissions: ['administrator']
  },

  magicLinks: {
    feature: 'Magic Link Authentication',
    description: 'Passwordless authentication system',
    tables: [
      {
        name: 'magic_links',
        description: 'Temporary authentication tokens',
        fields: ['id', 'user_id', 'token', 'expires_at', 'used_at'],
        relationships: [
          { table: 'users', type: 'many-to-one', description: 'Link recipient' }
        ],
        recordCount: 10
      },
      {
        name: 'registration_links',
        description: 'Registration invitation tokens',
        fields: ['id', 'email', 'token', 'role', 'expires_at'],
        relationships: [
          { table: 'registration_sessions', type: 'one-to-one', description: 'Registration progress' }
        ],
        recordCount: 10
      }
    ],
    workflow: [
      'Generate unique token with expiry',
      'Store in magic_links or registration_links',
      'Send email with tokenized URL',
      'Validate token on click',
      'Create user session or registration',
      'Mark token as used'
    ],
    permissions: ['administrator', 'club_director', 'team_coach']
  },

  clubs: {
    feature: 'Club Management',
    description: 'Organization-level management',
    tables: [
      {
        name: 'clubs',
        description: 'Top-level organization entities',
        fields: ['id', 'name', 'settings', 'created_at'],
        relationships: [
          { table: 'teams', type: 'one-to-many', description: 'Club owns multiple teams' }
        ],
        recordCount: 2
      },
      {
        name: 'teams',
        description: 'Team entities within clubs',
        fields: ['id', 'club_id', 'name', 'age_group', 'season'],
        relationships: [
          { table: 'clubs', type: 'many-to-one', description: 'Parent organization' },
          { table: 'team_members', type: 'one-to-many', description: 'Team roster' },
          { table: 'practices', type: 'one-to-many', description: 'Team practice plans' }
        ],
        recordCount: 10
      }
    ],
    workflow: [
      'Query clubs table for organization',
      'Load teams filtered by club_id',
      'Count team_members for roster size',
      'Check club tier in membership_entitlements',
      'Apply tier-based feature restrictions'
    ],
    permissions: ['administrator', 'club_director']
  },

  teams: {
    feature: 'Team HQ Management',
    description: 'Team-level administration and roster management',
    tables: [
      {
        name: 'teams',
        description: 'Team entities with configuration',
        fields: ['id', 'name', 'club_id', 'settings', 'age_group'],
        relationships: [
          { table: 'team_members', type: 'one-to-many', description: 'Player roster' },
          { table: 'practices', type: 'one-to-many', description: 'Practice plans' }
        ],
        recordCount: 10
      },
      {
        name: 'team_members',
        description: 'Player and coach assignments',
        fields: ['id', 'team_id', 'user_id', 'role', 'jersey_number'],
        relationships: [
          { table: 'teams', type: 'many-to-one', description: 'Team assignment' },
          { table: 'users', type: 'many-to-one', description: 'Member profile' }
        ],
        recordCount: 25
      },
      {
        name: 'family_accounts',
        description: 'Family groupings for players',
        fields: ['id', 'name', 'primary_contact_id'],
        relationships: [
          { table: 'family_members', type: 'one-to-many', description: 'Family members' }
        ],
        recordCount: 1
      }
    ],
    workflow: [
      'Load team from teams table',
      'Query team_members for roster',
      'Join users for member details',
      'Check family_accounts for parent links',
      'Calculate team entitlements (25 player limit)'
    ],
    permissions: ['team_coach', 'club_director', 'administrator']
  },

  coaching: {
    feature: 'Coaching Kit',
    description: 'Practice planning and drill management',
    tables: [
      {
        name: 'powlax_drills',
        description: 'POWLAX drill library',
        fields: ['id', 'name', 'description', 'duration', 'equipment'],
        relationships: [
          { table: 'practice_drills', type: 'one-to-many', description: 'Drill instances in practices' },
          { table: 'powlax_images', type: 'one-to-many', description: 'Drill diagrams' }
        ]
      },
      {
        name: 'practices',
        description: 'Practice plan templates',
        fields: ['id', 'team_id', 'date', 'duration', 'notes'],
        relationships: [
          { table: 'teams', type: 'many-to-one', description: 'Team owning practice' },
          { table: 'practice_drills', type: 'one-to-many', description: 'Drills in practice' }
        ]
      },
      {
        name: 'practice_drills',
        description: 'Drill instances with customization',
        fields: ['id', 'practice_id', 'drill_id', 'order', 'notes', 'modifications'],
        relationships: [
          { table: 'practices', type: 'many-to-one', description: 'Parent practice plan' },
          { table: 'powlax_drills', type: 'many-to-one', description: 'Base drill template' }
        ]
      }
    ],
    workflow: [
      'Browse powlax_drills library',
      'Create practice in practices table',
      'Add drills via practice_drills junction',
      'Customize with notes and modifications',
      'Share practice plan with team'
    ],
    permissions: ['team_coach', 'club_director', 'administrator']
  },

  analytics: {
    feature: 'Platform Analytics',
    description: 'Usage metrics and engagement tracking',
    tables: [
      {
        name: 'user_sessions',
        description: 'Active session tracking',
        fields: ['id', 'user_id', 'token', 'ip_address', 'expires_at'],
        relationships: [
          { table: 'users', type: 'many-to-one', description: 'Session owner' }
        ]
      },
      {
        name: 'skills_academy_user_progress',
        description: 'Workout completion tracking',
        fields: ['id', 'user_id', 'workout_id', 'completed_at', 'score'],
        relationships: [
          { table: 'users', type: 'many-to-one', description: 'Player progress' },
          { table: 'skills_academy_workouts', type: 'many-to-one', description: 'Completed workout' }
        ],
        recordCount: 3
      },
      {
        name: 'points_transactions_powlax',
        description: 'Gamification point history',
        fields: ['id', 'user_id', 'points', 'reason', 'created_at'],
        relationships: [
          { table: 'users', type: 'many-to-one', description: 'Point recipient' },
          { table: 'user_points_wallets', type: 'many-to-one', description: 'Updates wallet balance' }
        ]
      }
    ],
    workflow: [
      'Aggregate user_sessions for activity',
      'Count skills_academy_user_progress',
      'Sum points_transactions_powlax',
      'Calculate engagement metrics',
      'Generate platform-wide insights'
    ],
    permissions: ['administrator', 'club_director']
  }
}

interface DocumentationHelperProps {
  feature: string
  compact?: boolean
  showRelationships?: boolean
}

export function DocumentationHelper({ 
  feature, 
  compact = false,
  showRelationships = true 
}: DocumentationHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('tables')
  
  const docs = DATABASE_DOCUMENTATION[feature]
  
  if (!docs) return null

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-sm">
            <div className="space-y-2">
              <p className="font-semibold">{docs.feature}</p>
              <p className="text-sm">{docs.description}</p>
              <div className="text-xs text-gray-600">
                <p>Tables used: {docs.tables.map(t => t.name).join(', ')}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Database className="h-4 w-4" />
        View Database Info
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {docs.feature} - Database Documentation
                </CardTitle>
                <CardDescription>{docs.description}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="tables">Tables</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                  <TabsTrigger value="workflow">Workflow</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="tables" className="space-y-4">
                  {docs.tables.map((table, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Table className="h-4 w-4" />
                          {table.name}
                          {table.recordCount && (
                            <Badge variant="secondary">{table.recordCount} records</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{table.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium mb-1">Fields:</p>
                            <div className="flex flex-wrap gap-1">
                              {table.fields.map((field, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="relationships" className="space-y-4">
                  <div className="space-y-4">
                    {docs.tables.map((table, idx) => (
                      table.relationships.length > 0 && (
                        <div key={idx} className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Table className="h-4 w-4" />
                            {table.name}
                          </h3>
                          {table.relationships.map((rel, i) => (
                            <div key={i} className="flex items-center gap-2 pl-6">
                              <GitBranch className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                <Badge variant="outline" className="text-xs mr-2">
                                  {rel.type}
                                </Badge>
                                → <span className="font-medium">{rel.table}</span>
                                <span className="text-gray-600 ml-2">({rel.description})</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-2">
                  <div className="space-y-2">
                    {docs.workflow.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 text-sm">{step}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-2">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">
                      Required roles to access this feature:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {docs.permissions.map((perm, idx) => (
                        <Badge key={idx} variant="default">
                          <Shield className="h-3 w-3 mr-1" />
                          {perm.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export function InlineDocumentation({ 
  tableName, 
  action,
  fields 
}: { 
  tableName: string
  action?: string
  fields?: string[]
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="text-xs font-semibold">
              Table: {tableName}
            </p>
            {action && (
              <p className="text-xs">
                Action: {action}
              </p>
            )}
            {fields && fields.length > 0 && (
              <p className="text-xs">
                Fields: {fields.join(', ')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default DocumentationHelper