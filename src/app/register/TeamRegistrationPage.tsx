'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TeamWelcomeCard } from '@/components/registration/TeamWelcomeCard'
import { RoleSelectionCard } from '@/components/registration/RoleSelectionCard'
import { RegistrationForm, RegistrationData } from '@/components/registration/RegistrationForm'

interface TeamInfo {
  team_id: string
  team_name: string
  organization_id: string
  age_group: string | null
  level: string | null
  current_uses?: number
}

export function TeamRegistrationPage({ registrationCode }: { registrationCode: string }) {
  const router = useRouter()
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null)
  const [selectedRole, setSelectedRole] = useState<'player' | 'parent' | 'coach' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    validateRegistrationCode()
  }, [registrationCode])

  const validateRegistrationCode = async () => {
    try {
      // Call the validation function
      const { data, error } = await supabase
        .rpc('validate_registration_code', { code: registrationCode })
        .single()

      if (error) throw error

      if (!data) {
        setError('Invalid or expired registration code')
        return
      }

      setTeamInfo(data)
    } catch (err) {
      console.error('Error validating registration code:', err)
      setError('Unable to validate registration code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async (data: RegistrationData) => {
    if (!teamInfo) return

    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).slice(-12), // Generate random password
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            registration_source: 'qr_code'
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
          registration_source: 'qr_code',
          registered_at: new Date().toISOString(),
          parent_email: data.parentEmail,
          is_active: true,
          wordpress_id: 0, // Placeholder, will be synced later
          username: data.email.split('@')[0]
        })

      if (profileError) throw profileError

      // Add user to team with selected role
      const { error: roleError } = await supabase
        .from('user_team_roles')
        .insert({
          user_id: authData.user.id,
          team_id: teamInfo.team_id,
          role: data.role === 'coach' ? 'assistant_coach' : data.role
        })

      if (roleError) throw roleError

      // Track registration
      const { error: trackError } = await supabase
        .from('user_registrations')
        .insert({
          user_id: authData.user.id,
          team_id: teamInfo.team_id,
          registration_source: 'qr_code',
          registration_code: registrationCode
        })

      if (trackError) console.error('Error tracking registration:', trackError)

      // Update registration asset usage count
      await supabase
        .from('team_registration_assets')
        .update({ current_uses: (teamInfo.current_uses || 0) + 1 })
        .eq('registration_code', registrationCode)
        .catch(console.error)

      // Redirect to success page
      router.push(`/register/success?team=${encodeURIComponent(teamInfo.team_name)}&role=${data.role}`)
    } catch (err) {
      console.error('Registration error:', err)
      throw err
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating registration code...</p>
        </div>
      </div>
    )
  }

  if (error || !teamInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-900 mb-2">
              Registration Error
            </h1>
            <p className="text-red-700">
              {error || 'Invalid registration code'}
            </p>
            <p className="text-red-600 text-sm mt-3">
              Please contact your team coach for a valid registration link.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <TeamWelcomeCard
          teamName={teamInfo.team_name}
          ageGroup={teamInfo.age_group || undefined}
          level={teamInfo.level || undefined}
        />

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            I am a...
          </h2>

          <div className="space-y-3 mb-6">
            <RoleSelectionCard
              value="player"
              title="Player"
              description="I will be playing on this team"
              selected={selectedRole === 'player'}
              onClick={() => setSelectedRole('player')}
            />

            <RoleSelectionCard
              value="parent"
              title="Parent/Guardian"
              description="My child will be playing on this team"
              selected={selectedRole === 'parent'}
              onClick={() => setSelectedRole('parent')}
            />

            <RoleSelectionCard
              value="coach"
              title="Coach/Assistant"
              description="I will help coach this team"
              selected={selectedRole === 'coach'}
              onClick={() => setSelectedRole('coach')}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Information
            </h3>
            
            <RegistrationForm
              role={selectedRole}
              teamName={teamInfo.team_name}
              ageGroup={teamInfo.age_group || undefined}
              onSubmit={handleRegistration}
            />
          </div>
        </div>
      </div>
    </div>
  )
}