'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, Camera, UserCheck } from 'lucide-react'

interface ProfileData {
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

interface ProfileTabProps {
  userData: ProfileData
  onFieldChange: (tab: string, field: string, oldValue: any, newValue: any) => void
}

const AVAILABLE_ROLES = [
  'administrator',
  'club_director',
  'team_coach',
  'head_coach',
  'assistant_coach',
  'player',
  'parent',
  'guest'
]

export default function ProfileTab({ userData, onFieldChange }: ProfileTabProps) {
  const [formData, setFormData] = useState({
    email: userData.email || '',
    display_name: userData.display_name || '',
    phone: userData.phone || '',
    avatar_url: userData.avatar_url || '',
    bio: userData.bio || '',
    roles: userData.roles || []
  })

  const [emailError, setEmailError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleFieldChange = (field: string, newValue: any) => {
    const oldValue = formData[field as keyof typeof formData]
    
    if (field === 'email') {
      if (!validateEmail(newValue) && newValue.length > 0) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }))

    onFieldChange('profile', field, oldValue, newValue)
  }

  const handleRoleToggle = (role: string) => {
    const currentRoles = formData.roles
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role]
    
    handleFieldChange('roles', newRoles)
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const formatRoleName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Basic Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Core user profile details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(formData.display_name, formData.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="avatar_url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => handleFieldChange('avatar_url', e.target.value)}
                />
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="Full Name"
                value={formData.display_name}
                onChange={(e) => handleFieldChange('display_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={emailError ? 'border-red-500' : ''}
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Description</Label>
            <Textarea
              id="bio"
              placeholder="Brief description about the user..."
              value={formData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Roles
          </CardTitle>
          <CardDescription>
            Manage user permissions and access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.roles.map((role, index) => (
                <Badge 
                  key={index}
                  variant={
                    role === 'administrator' ? 'default' :
                    role === 'club_director' ? 'secondary' :
                    role === 'team_coach' || role === 'head_coach' ? 'secondary' :
                    'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => handleRoleToggle(role)}
                >
                  {formatRoleName(role)} ✕
                </Badge>
              ))}
              {formData.roles.length === 0 && (
                <Badge variant="outline" className="text-gray-500">
                  No roles assigned
                </Badge>
              )}
            </div>

            <div>
              <Label>Available Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_ROLES
                  .filter(role => !formData.roles.includes(role))
                  .map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleToggle(role)}
                      className="text-xs"
                    >
                      + {formatRoleName(role)}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Read-only account details and timestamps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={userData.id} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Account Created</Label>
              <Input 
                value={new Date(userData.created_at).toLocaleString()} 
                readOnly 
                className="bg-gray-50" 
              />
            </div>
            <div className="space-y-2">
              <Label>Last Sign In</Label>
              <Input 
                value={
                  userData.last_sign_in_at 
                    ? new Date(userData.last_sign_in_at).toLocaleString()
                    : 'Never'
                } 
                readOnly 
                className="bg-gray-50" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}