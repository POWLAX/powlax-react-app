'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { RegistrationForm, RegistrationData } from '@/components/registration/RegistrationForm'
import { Button } from '@/components/ui/button'

interface InvitationInfo {
  invitation_id: string
  team_id: string
  team_name: string
  invited_email: string | null
  invited_first_name: string | null
  invited_last_name: string | null
  invited_role: 'player' | 'parent' | 'coach'
  personal_message: string | null
}

export function InvitationRegistrationPage({ inviteCode }: { inviteCode: string }) {
  const router = useRouter()
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    validateInvitationCode()
  }, [inviteCode])

  const validateInvitationCode = async () => {
    try {
      // Call the validation function
      const { data, error } = await supabase
        .rpc('validate_invitation_code', { code: inviteCode })
        .single()

      if (error) throw error

      if (!data) {
        setError('Invalid or expired invitation')
        return
      }

      setInvitationInfo(data)
    } catch (err) {
      console.error('Error validating invitation code:', err)
      setError('Unable to validate invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async (data: RegistrationData) => {
    if (!invitationInfo) return

    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).slice(-12), // Generate random password
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            registration_source: 'invitation'
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
          registration_source: 'invitation',
          registered_at: new Date().toISOString(),
          parent_email: data.parentEmail,
          is_active: true,
          wordpress_id: 0, // Placeholder, will be synced later
          username: data.email.split('@')[0]
        })

      if (profileError) throw profileError

      // Add user to team with invited role
      const { error: roleError } = await supabase
        .from('user_team_roles')
        .insert({
          user_id: authData.user.id,
          team_id: invitationInfo.team_id,
          role: invitationInfo.invited_role === 'coach' ? 'assistant_coach' : invitationInfo.invited_role
        })

      if (roleError) throw roleError

      // Track registration
      const { error: trackError } = await supabase
        .from('user_registrations')
        .insert({
          user_id: authData.user.id,
          team_id: invitationInfo.team_id,
          registration_source: 'invitation',
          invitation_id: invitationInfo.invitation_id
        })

      if (trackError) console.error('Error tracking registration:', trackError)

      // Mark invitation as accepted
      await supabase
        .from('team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: authData.user.id
        })
        .eq('id', invitationInfo.invitation_id)
        .catch(console.error)

      // Redirect to success page
      router.push(`/register/success?team=${encodeURIComponent(invitationInfo.team_name)}&role=${invitationInfo.invited_role}`)
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
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !invitationInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-900 mb-2">
              Invalid Invitation
            </h1>
            <p className="text-red-700">
              {error || 'This invitation is no longer valid'}
            </p>
            <p className="text-red-600 text-sm mt-3">
              Please contact your team coach for a new invitation.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hi {invitationInfo.invited_first_name || 'there'}!
          </h1>
          
          <p className="text-gray-600 mb-4">
            You've been invited to join <strong>{invitationInfo.team_name}</strong> as a{' '}
            <strong>{invitationInfo.invited_role}</strong>.
          </p>

          {invitationInfo.personal_message && (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 rounded">
              <p className="text-gray-700 italic">
                "{invitationInfo.personal_message}"
              </p>
            </blockquote>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Confirm Your Information
          </h2>
          
          <RegistrationForm
            role={invitationInfo.invited_role}
            teamName={invitationInfo.team_name}
            onSubmit={handleRegistration}
            prefilledData={{
              firstName: invitationInfo.invited_first_name || undefined,
              lastName: invitationInfo.invited_last_name || undefined,
              email: invitationInfo.invited_email || undefined
            }}
          />
        </div>
      </div>
    </div>
  )
}