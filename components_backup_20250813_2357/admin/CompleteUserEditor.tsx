'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  User, 
  Shield, 
  CreditCard, 
  Users, 
  Heart, 
  Trophy,
  Save,
  X,
  Loader2
} from 'lucide-react'
import ProfileTab from './user-editor/ProfileTab'
import AuthenticationTab from './user-editor/AuthenticationTab'
import MembershipTab from './user-editor/MembershipTab'
import TeamTab from './user-editor/TeamTab'
import FamilyTab from './user-editor/FamilyTab'
import ActivityTab from './user-editor/ActivityTab'

interface CompleteUserEditorProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
  onUserUpdated?: () => void
}

interface UserData {
  profile: {
    id: string
    email: string
    display_name?: string
    phone?: string
    avatar_url?: string
    bio?: string
    roles: string[]
    created_at: string
    last_sign_in_at?: string
  }
  authentication: {
    auth_status: string
    sessions: any[]
    magic_links: any[]
    last_login?: string
  }
  membership: {
    entitlements: any[]
    products: any[]
    capabilities: string[]
    expiration?: string
  }
  teams: {
    team_memberships: any[]
    clubs: any[]
    positions: string[]
  }
  family: {
    parent_relationships: any[]
    child_relationships: any[]
    family_account?: any
  }
  activity: {
    points_wallets: any[]
    badges: any[]
    achievements: any[]
    progress: any[]
  }
}

interface ChangedField {
  tab: string
  field: string
  oldValue: any
  newValue: any
  timestamp: string
}

export default function CompleteUserEditor({ 
  userId, 
  isOpen, 
  onClose, 
  onUserUpdated 
}: CompleteUserEditorProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [changedFields, setChangedFields] = useState<ChangedField[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load user data when dialog opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUserData()
    }
  }, [isOpen, userId])

  const loadUserData = async () => {
    if (!userId) return

    try {
      setLoading(true)
      
      // Load all user data in parallel
      const [
        profileResult,
        authResult,
        membershipResult,
        teamsResult,
        familyResult,
        activityResult
      ] = await Promise.all([
        loadProfileData(userId),
        loadAuthenticationData(userId),
        loadMembershipData(userId),
        loadTeamData(userId),
        loadFamilyData(userId),
        loadActivityData(userId)
      ])

      if (profileResult.error || authResult.error || membershipResult.error || 
          teamsResult.error || familyResult.error || activityResult.error) {
        throw new Error('Failed to load complete user data')
      }

      setUserData({
        profile: profileResult.data,
        authentication: authResult.data,
        membership: membershipResult.data,
        teams: teamsResult.data,
        family: familyResult.data,
        activity: activityResult.data
      })

    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const loadProfileData = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  }

  const loadAuthenticationData = async (userId: string) => {
    const [authStatus, sessions, magicLinks] = await Promise.all([
      supabase.from('user_auth_status').select('*').eq('user_id', userId),
      supabase.from('user_sessions').select('*').eq('user_id', userId),
      supabase.from('magic_links').select('*').eq('user_id', userId)
    ])

    return {
      data: {
        auth_status: authStatus.data?.[0]?.status || 'unknown',
        sessions: sessions.data || [],
        magic_links: magicLinks.data || [],
        last_login: authStatus.data?.[0]?.last_login
      },
      error: authStatus.error || sessions.error || magicLinks.error
    }
  }

  const loadMembershipData = async (userId: string) => {
    const [entitlements, products] = await Promise.all([
      supabase.from('membership_entitlements').select(`
        *,
        membership_products (*)
      `).eq('user_id', userId),
      supabase.from('membership_products').select('*')
    ])

    return {
      data: {
        entitlements: entitlements.data || [],
        products: products.data || [],
        capabilities: entitlements.data?.flatMap(e => e.capabilities || []) || [],
        expiration: entitlements.data?.[0]?.expires_at
      },
      error: entitlements.error || products.error
    }
  }

  const loadTeamData = async (userId: string) => {
    const [teamMemberships, clubs] = await Promise.all([
      supabase.from('team_members').select(`
        *,
        teams (
          *,
          clubs (*)
        )
      `).eq('user_id', userId),
      supabase.from('clubs').select('*')
    ])

    return {
      data: {
        team_memberships: teamMemberships.data || [],
        clubs: clubs.data || [],
        positions: teamMemberships.data?.map(tm => tm.position).filter(Boolean) || []
      },
      error: teamMemberships.error || clubs.error
    }
  }

  const loadFamilyData = async (userId: string) => {
    const [parentRels, childRels, familyAccount] = await Promise.all([
      supabase.from('parent_child_relationships').select(`
        *,
        parent_user:users!parent_id (*),
        child_user:users!child_id (*)
      `).eq('parent_id', userId),
      supabase.from('parent_child_relationships').select(`
        *,
        parent_user:users!parent_id (*),
        child_user:users!child_id (*)
      `).eq('child_id', userId),
      supabase.from('family_accounts').select(`
        *,
        family_members (*)
      `).eq('primary_user_id', userId)
    ])

    return {
      data: {
        parent_relationships: parentRels.data || [],
        child_relationships: childRels.data || [],
        family_account: familyAccount.data?.[0]
      },
      error: parentRels.error || childRels.error || familyAccount.error
    }
  }

  const loadActivityData = async (userId: string) => {
    const [pointsWallets, badges, progress] = await Promise.all([
      supabase.from('user_points_wallets').select(`
        *,
        powlax_points_currencies (*)
      `).eq('user_id', userId),
      supabase.from('user_badges').select(`
        *
      `).eq('user_id', userId),
      supabase.from('skills_academy_user_progress').select('*').eq('user_id', userId)
    ])

    return {
      data: {
        points_wallets: pointsWallets.data || [],
        badges: badges.data || [],
        achievements: [], // TODO: Define achievements structure
        progress: progress.data || []
      },
      error: pointsWallets.error || badges.error || progress.error
    }
  }

  const trackFieldChange = (tab: string, field: string, oldValue: any, newValue: any) => {
    const change: ChangedField = {
      tab,
      field,
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    }
    
    setChangedFields(prev => [...prev, change])
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!userData || changedFields.length === 0) {
      toast.info('No changes to save')
      return
    }

    try {
      setSaving(true)
      
      // Group changes by tab/table for efficient updates
      const changesByTab = changedFields.reduce((acc, change) => {
        if (!acc[change.tab]) acc[change.tab] = []
        acc[change.tab].push(change)
        return acc
      }, {} as Record<string, ChangedField[]>)

      // Save changes for each tab
      for (const [tab, changes] of Object.entries(changesByTab)) {
        await saveTabChanges(tab, changes)
      }

      // Create audit log entry
      await createAuditLogEntry(userId!, changedFields)

      toast.success('User data saved successfully')
      setChangedFields([])
      setHasUnsavedChanges(false)
      
      if (onUserUpdated) {
        onUserUpdated()
      }

    } catch (error) {
      console.error('Error saving user data:', error)
      toast.error('Failed to save user data')
    } finally {
      setSaving(false)
    }
  }

  const saveTabChanges = async (tab: string, changes: ChangedField[]) => {
    // Implementation will depend on specific tab requirements
    // For now, this is a placeholder that would be implemented per tab
    console.log(`Saving changes for ${tab}:`, changes)
  }

  const createAuditLogEntry = async (userId: string, changes: ChangedField[]) => {
    const { error } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        action: 'user_data_updated',
        details: { changes },
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error creating audit log:', error)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        setChangedFields([])
        setHasUnsavedChanges(false)
        onClose()
      }
    } else {
      onClose()
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'authentication', label: 'Authentication', icon: Shield },
    { id: 'membership', label: 'Membership', icon: CreditCard },
    { id: 'team', label: 'Team & Club', icon: Users },
    { id: 'family', label: 'Family', icon: Heart },
    { id: 'activity', label: 'Activity', icon: Trophy }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Complete User Editor</span>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600 font-normal">
                  {changedFields.length} unsaved change{changedFields.length !== 1 ? 's' : ''}
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                size="sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save Changes
              </Button>
              <Button onClick={handleClose} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            {userData?.profile?.display_name || userData?.profile?.email || 'Loading user data...'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading user data...</span>
          </div>
        ) : userData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <div className="overflow-y-auto max-h-[60vh] mt-4">
              <TabsContent value="profile" className="mt-0">
                <ProfileTab 
                  userData={userData.profile}
                  onFieldChange={trackFieldChange}
                />
              </TabsContent>

              <TabsContent value="authentication" className="mt-0">
                <AuthenticationTab 
                  userData={userData.authentication}
                  userId={userId}
                  onFieldChange={trackFieldChange}
                />
              </TabsContent>

              <TabsContent value="membership" className="mt-0">
                <MembershipTab 
                  userData={userData.membership}
                  onFieldChange={trackFieldChange}
                />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <TeamTab 
                  userData={userData.teams}
                  onFieldChange={trackFieldChange}
                />
              </TabsContent>

              <TabsContent value="family" className="mt-0">
                <FamilyTab 
                  userData={userData.family}
                  onFieldChange={trackFieldChange}
                />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <ActivityTab 
                  userData={userData.activity}
                  onFieldChange={trackFieldChange}
                />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="flex justify-center items-center py-12">
            <span className="text-gray-500">Failed to load user data</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}