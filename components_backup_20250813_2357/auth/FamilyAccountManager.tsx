'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Settings, Shield, Heart, Phone } from 'lucide-react'

interface FamilyMember {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  account_type: 'parent' | 'child' | 'individual'
  age_group: string | null
  role_in_family: 'primary_parent' | 'secondary_parent' | 'child' | 'guardian'
}

interface FamilyAccount {
  id: string
  family_name: string
  primary_parent_id: string
  members: FamilyMember[]
  emergency_contact: any
}

export default function FamilyAccountManager() {
  const { user } = useAuth()
  const [familyAccount, setFamilyAccount] = useState<FamilyAccount | null>(null)
  const [activeProfile, setActiveProfile] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadFamilyAccount()
    }
  }, [user])

  const loadFamilyAccount = async () => {
    try {
      setLoading(true)
      
      // Check if user is part of a family account
      const response = await fetch('/api/auth/family/account')
      if (!response.ok) {
        if (response.status === 404) {
          // No family account - individual user
          setFamilyAccount(null)
          return
        }
        throw new Error('Failed to load family account')
      }

      const data = await response.json()
      setFamilyAccount(data)
      setActiveProfile(user.id)
      
    } catch (err) {
      console.error('Family account load error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const switchProfile = async (memberId: string) => {
    try {
      const response = await fetch('/api/auth/family/switch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: memberId })
      })

      if (!response.ok) {
        throw new Error('Failed to switch profile')
      }

      setActiveProfile(memberId)
      // Reload page to update context
      window.location.reload()
      
    } catch (err) {
      console.error('Profile switch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to switch profile')
    }
  }

  const addChildAccount = async (childEmail: string, childName: string) => {
    try {
      const response = await fetch('/api/auth/family/add-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          child_email: childEmail,
          child_name: childName
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add child account')
      }

      await loadFamilyAccount() // Refresh family data
      
    } catch (err) {
      console.error('Add child error:', err)
      setError(err instanceof Error ? err.message : 'Failed to add child')
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 animate-pulse" />
            <span>Loading family account...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <Shield className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Individual account (no family)
  if (!familyAccount) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Individual Account</span>
          </CardTitle>
          <CardDescription>
            You have an individual account. Create a family account to manage multiple profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {/* Implement family account creation */}}
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Family Account</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Family account interface
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Family Account Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>{familyAccount.family_name}</span>
          </CardTitle>
          <CardDescription>
            Manage your family&apos;s POWLAX accounts and permissions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Family Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {familyAccount.members.map((member) => (
              <div
                key={member.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  activeProfile === member.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => switchProfile(member.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email}
                    </h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={member.account_type === 'parent' ? 'default' : 'secondary'}>
                      {member.role_in_family.replace('_', ' ')}
                    </Badge>
                    {member.age_group && (
                      <Badge variant="outline" className="text-xs">
                        {member.age_group.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {activeProfile === member.id && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                    <span className="text-blue-800">✓ Currently viewing this profile</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Child Button */}
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {/* Implement add child modal */}}
              className="flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Child Account</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Information */}
      {familyAccount.emergency_contact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Emergency Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {familyAccount.emergency_contact.name}</p>
              <p><strong>Phone:</strong> {familyAccount.emergency_contact.phone}</p>
              <p><strong>Relationship:</strong> {familyAccount.emergency_contact.relationship}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Family Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Shared Calendar</h4>
                <p className="text-sm text-gray-600">Combine all family members&apos; schedules</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Combined Statistics</h4>
                <p className="text-sm text-gray-600">Show family-wide progress and achievements</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Cross-Profile Notifications</h4>
                <p className="text-sm text-gray-600">Get notified about all family members&apos; activities</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for family account management
export function useFamilyAccount() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [activeProfile, setActiveProfile] = useState<string | null>(null)
  const [isParent, setIsParent] = useState(false)

  const switchToChildProfile = async (childId: string) => {
    try {
      const response = await fetch('/api/auth/family/switch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: childId })
      })

      if (response.ok) {
        setActiveProfile(childId)
        return true
      }
      return false
    } catch (error) {
      console.error('Profile switch failed:', error)
      return false
    }
  }

  const getChildrenProfiles = () => {
    return familyMembers.filter(member => member.account_type === 'child')
  }

  const getCurrentProfile = () => {
    return familyMembers.find(member => member.id === activeProfile)
  }

  return {
    familyMembers,
    activeProfile,
    isParent,
    switchToChildProfile,
    getChildrenProfiles,
    getCurrentProfile
  }
}
