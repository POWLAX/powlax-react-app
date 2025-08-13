'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TeamPlaybook, TeamPlaybookWithStrategy, SaveToPlaybookData } from '@/types/teamPlaybook'
import { Strategy } from '@/hooks/useStrategies'

export function useTeamPlaybook(teamId?: string) {
  const [playbooks, setPlaybooks] = useState<TeamPlaybookWithStrategy[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch team playbooks with strategy details
  const fetchTeamPlaybooks = async (targetTeamId?: string) => {
    if (!targetTeamId) return

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching team playbooks for team:', targetTeamId)

      // Fetch playbook entries
      const { data: playbookData, error: playbookError } = await supabase
        .from('team_playbooks')
        .select(`
          id,
          team_id,
          strategy_id,
          strategy_source,
          custom_name,
          team_notes,
          added_by,
          created_at,
          updated_at
        `)
        .eq('team_id', targetTeamId)
        .order('created_at', { ascending: false })

      if (playbookError) {
        throw new Error(`Failed to fetch playbooks: ${playbookError.message}`)
      }

      if (!playbookData || playbookData.length === 0) {
        console.log('No playbooks found for team')
        setPlaybooks([])
        return
      }

      // Group strategy IDs by source
      const powlaxIds = playbookData
        .filter(p => p.strategy_source === 'powlax')
        .map(p => p.strategy_id)
      
      const userIds = playbookData
        .filter(p => p.strategy_source === 'user')
        .map(p => p.strategy_id.replace('user-', '')) // Remove user- prefix

      // Fetch POWLAX strategies
      let powlaxStrategies: any[] = []
      if (powlaxIds.length > 0) {
        const { data: powlaxData, error: powlaxError } = await supabase
          .from('powlax_strategies')
          .select('*')
          .in('id', powlaxIds)

        if (powlaxError) {
          console.warn('Error fetching POWLAX strategies:', powlaxError)
        } else {
          powlaxStrategies = powlaxData || []
        }
      }

      // Fetch user strategies
      let userStrategies: any[] = []
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('user_strategies')
          .select('*')
          .in('id', userIds)

        if (userError) {
          console.warn('Error fetching user strategies:', userError)
        } else {
          userStrategies = userData || []
        }
      }

      // Combine playbook entries with strategy details
      const playbooksWithStrategies: TeamPlaybookWithStrategy[] = playbookData
        .map(playbook => {
          let strategy = null

          if (playbook.strategy_source === 'powlax') {
            strategy = powlaxStrategies.find(s => s.id?.toString() === playbook.strategy_id)
          } else {
            const cleanId = playbook.strategy_id.replace('user-', '')
            strategy = userStrategies.find(s => s.id?.toString() === cleanId)
          }

          if (!strategy) {
            console.warn(`Strategy not found: ${playbook.strategy_id} (${playbook.strategy_source})`)
            return null
          }

          return {
            ...playbook,
            strategy_name: strategy.strategy_name,
            strategy_categories: strategy.strategy_categories,
            description: strategy.description,
            lacrosse_lab_links: strategy.lacrosse_lab_links,
            vimeo_link: strategy.vimeo_link,
            thumbnail_urls: strategy.thumbnail_urls,
            master_pdf_url: strategy.master_pdf_url
          }
        })
        .filter(Boolean) as TeamPlaybookWithStrategy[]

      console.log(`Loaded ${playbooksWithStrategies.length} team playbooks`)
      setPlaybooks(playbooksWithStrategies)
    } catch (err: any) {
      console.error('Error fetching team playbooks:', err)
      setError(err.message)
      setPlaybooks([])
    } finally {
      setLoading(false)
    }
  }

  // Save strategy to team playbook
  const saveToPlaybook = async (data: SaveToPlaybookData): Promise<boolean> => {
    try {
      console.log('Saving strategy to team playbook:', data)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Check if strategy is already in playbook
      const { data: existingData, error: checkError } = await supabase
        .from('team_playbooks')
        .select('id')
        .eq('team_id', data.team_id)
        .eq('strategy_id', data.strategy_id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Error checking existing playbook: ${checkError.message}`)
      }

      if (existingData) {
        throw new Error('Strategy is already in team playbook')
      }

      // Insert new playbook entry
      const { error: insertError } = await supabase
        .from('team_playbooks')
        .insert([{
          team_id: data.team_id,
          strategy_id: data.strategy_id,
          strategy_source: data.strategy_source,
          custom_name: data.custom_name,
          team_notes: data.team_notes,
          added_by: user.id
        }])

      if (insertError) {
        throw new Error(`Failed to save to playbook: ${insertError.message}`)
      }

      console.log('Successfully saved strategy to team playbook')
      
      // Refresh playbooks if we're viewing the same team
      if (data.team_id === teamId) {
        await fetchTeamPlaybooks(teamId)
      }

      return true
    } catch (err: any) {
      console.error('Error saving to playbook:', err)
      setError(err.message)
      return false
    }
  }

  // Remove strategy from team playbook
  const removeFromPlaybook = async (playbookId: string): Promise<boolean> => {
    try {
      console.log('Removing strategy from team playbook:', playbookId)

      const { error } = await supabase
        .from('team_playbooks')
        .delete()
        .eq('id', playbookId)

      if (error) {
        throw new Error(`Failed to remove from playbook: ${error.message}`)
      }

      console.log('Successfully removed strategy from team playbook')
      
      // Refresh playbooks
      if (teamId) {
        await fetchTeamPlaybooks(teamId)
      }

      return true
    } catch (err: any) {
      console.error('Error removing from playbook:', err)
      setError(err.message)
      return false
    }
  }

  // Update playbook entry
  const updatePlaybook = async (
    playbookId: string, 
    updates: { custom_name?: string; team_notes?: string }
  ): Promise<boolean> => {
    try {
      console.log('Updating playbook entry:', playbookId, updates)

      const { error } = await supabase
        .from('team_playbooks')
        .update(updates)
        .eq('id', playbookId)

      if (error) {
        throw new Error(`Failed to update playbook: ${error.message}`)
      }

      console.log('Successfully updated playbook entry')
      
      // Refresh playbooks
      if (teamId) {
        await fetchTeamPlaybooks(teamId)
      }

      return true
    } catch (err: any) {
      console.error('Error updating playbook:', err)
      setError(err.message)
      return false
    }
  }

  // Auto-fetch when teamId changes
  useEffect(() => {
    if (teamId) {
      fetchTeamPlaybooks(teamId)
    }
  }, [teamId])

  return {
    playbooks,
    loading,
    error,
    saveToPlaybook,
    removeFromPlaybook,
    updatePlaybook,
    refreshPlaybooks: () => fetchTeamPlaybooks(teamId)
  }
}

// Hook to get user's teams for playbook selection
export function useUserTeams() {
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserTeams()
  }, [])

  const fetchUserTeams = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get teams where user is a member
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams:team_id (
            id,
            name
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching user teams:', error)
        return
      }

      const userTeams = (data || []).map((item: any) => ({
        id: item.teams?.id || item.team_id,
        name: item.teams?.name || 'Unknown Team'
      }))

      setTeams(userTeams)
    } catch (err) {
      console.error('Error fetching user teams:', err)
    } finally {
      setLoading(false)
    }
  }

  return { teams, loading, refreshTeams: fetchUserTeams }
}