'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/hooks/useSupabase'
import type { 
  Organization, 
  Team,
  UserOrganizationRole,
  CreateOrganizationInput,
  AddUserToOrganizationInput
} from '@/types/teams'

export function useOrganizations() {
  const { user } = useSupabase()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserOrganizations()
    }
  }, [user])

  const fetchUserOrganizations = async () => {
    try {
      setLoading(true)
      
      // Get organizations user has access to
      const { data: orgRoles, error: rolesError } = await supabase
        .from('user_organization_roles')
        .select(`
          *,
          organization:organizations(
            *,
            parent_org:organizations!parent_org_id(*),
            teams(*)
          )
        `)
        .eq('user_id', user!.id)

      if (rolesError) throw rolesError

      // Also get organizations where user has team access
      const { data: teamRoles, error: teamError } = await supabase
        .from('user_team_roles')
        .select(`
          team:teams(
            organization:organizations(
              *,
              parent_org:organizations!parent_org_id(*),
              teams(*)
            )
          )
        `)
        .eq('user_id', user!.id)

      if (teamError) throw teamError

      // Combine and deduplicate organizations
      const orgsFromRoles = orgRoles?.map(r => r.organization) || []
      const orgsFromTeams = teamRoles?.map(r => r.team.organization).filter(Boolean) || []
      
      const allOrgs = [...orgsFromRoles, ...orgsFromTeams]
      const uniqueOrgs = Array.from(
        new Map(allOrgs.map(org => [org.id, org])).values()
      )

      setOrganizations(uniqueOrgs)
    } catch (err: any) {
      console.error('Error fetching organizations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createOrganization = async (input: CreateOrganizationInput) => {
    try {
      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          ...input,
          slug
        }])
        .select()
        .single()

      if (error) throw error

      // Add creating user as owner
      if (user && data) {
        await addUserToOrganization({
          user_id: user.id,
          organization_id: data.id,
          role: 'owner'
        })
      }

      setOrganizations([...organizations, data])
      return { data, error: null }
    } catch (err: any) {
      console.error('Error creating organization:', err)
      return { data: null, error: err.message }
    }
  }

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setOrganizations(organizations.map(o => o.id === id ? data : o))
      return { data, error: null }
    } catch (err: any) {
      console.error('Error updating organization:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteOrganization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)

      if (error) throw error

      setOrganizations(organizations.filter(o => o.id !== id))
      return { error: null }
    } catch (err: any) {
      console.error('Error deleting organization:', err)
      return { error: err.message }
    }
  }

  const addUserToOrganization = async (input: AddUserToOrganizationInput) => {
    try {
      const { data, error } = await supabase
        .from('user_organization_roles')
        .insert([input])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err: any) {
      console.error('Error adding user to organization:', err)
      return { data: null, error: err.message }
    }
  }

  const removeUserFromOrganization = async (userId: string, organizationId: string) => {
    try {
      const { error } = await supabase
        .from('user_organization_roles')
        .delete()
        .match({ user_id: userId, organization_id: organizationId })

      if (error) throw error

      return { error: null }
    } catch (err: any) {
      console.error('Error removing user from organization:', err)
      return { error: err.message }
    }
  }

  return {
    organizations,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    addUserToOrganization,
    removeUserFromOrganization,
    refetch: fetchUserOrganizations
  }
}

// Hook for single organization with full hierarchy
export function useOrganization(organizationId: string) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<UserOrganizationRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (organizationId) {
      fetchOrganization()
    }
  }, [organizationId])

  const fetchOrganization = async () => {
    try {
      setLoading(true)
      
      // Fetch organization with parent and children
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select(`
          *,
          parent_org:organizations!parent_org_id(*),
          child_orgs:organizations!parent_org_id(*)
        `)
        .eq('id', organizationId)
        .single()

      if (orgError) throw orgError
      setOrganization(orgData)

      // Fetch all teams under this organization
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('organization_id', organizationId)

      if (teamError) throw teamError
      setTeams(teamData || [])

      // Fetch organization members
      const { data: memberData, error: memberError } = await supabase
        .from('user_organization_roles')
        .select(`
          *,
          user:users(*)
        `)
        .eq('organization_id', organizationId)

      if (memberError) throw memberError
      setMembers(memberData || [])

    } catch (err: any) {
      console.error('Error fetching organization:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    organization,
    teams,
    members,
    loading,
    error,
    refetch: fetchOrganization
  }
}