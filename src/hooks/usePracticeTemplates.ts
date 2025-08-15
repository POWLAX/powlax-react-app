'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/SupabaseAuthContext'

export interface PracticeTemplate {
  id: string
  name: string
  description?: string
  age_group?: '8-10' | '11-14' | '15+' | 'all'
  duration_minutes: number
  category?: string
  drill_sequence: any // JSONB
  coaching_tips?: string[]
  equipment_needed?: string[]
  is_public?: boolean
  is_official?: boolean
  organization_id?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  usage_count?: number
  rating?: number
  tags?: string[]
}

export function usePracticeTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<PracticeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [user])

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query to get templates user has access to
      let query = supabase
        .from('practice_templates')
        .select('*')
        .order('is_official', { ascending: false })
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false })

      // Get public and official templates
      const publicQuery = query.or('is_public.eq.true,is_official.eq.true')
      
      // If user is logged in, also get their templates and org templates
      if (user?.id) {
        // Get user's own templates
        const userQuery = supabase
          .from('practice_templates')
          .select('*')
          .eq('created_by', user.id)
        
        // Get organization templates
        const orgQuery = supabase
          .from('practice_templates')
          .select(`
            *,
            club_organizations!inner(
              team_teams!inner(
                team_members!inner(
                  user_id
                )
              )
            )
          `)
          .eq('team_teams.team_members.user_id', user.id)
        
        // Combine all results
        const [publicResult, userResult, orgResult] = await Promise.allSettled([
          publicQuery,
          userQuery,
          orgQuery
        ])
        
        const allTemplates: PracticeTemplate[] = []
        
        if (publicResult.status === 'fulfilled' && publicResult.value.data) {
          allTemplates.push(...publicResult.value.data)
        }
        
        if (userResult.status === 'fulfilled' && userResult.value.data) {
          allTemplates.push(...userResult.value.data)
        }
        
        if (orgResult.status === 'fulfilled' && orgResult.value.data) {
          allTemplates.push(...orgResult.value.data)
        }
        
        // Remove duplicates
        const uniqueTemplates = Array.from(
          new Map(allTemplates.map(t => [t.id, t])).values()
        )
        
        setTemplates(uniqueTemplates)
      } else {
        // Just get public templates for non-logged in users
        const { data, error } = await publicQuery
        
        if (error) throw error
        setTemplates(data || [])
      }
    } catch (err: any) {
      console.error('Error fetching practice templates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const createTemplate = async (template: Omit<PracticeTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const templateData = {
        ...template,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('practice_templates')
        .insert([templateData])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setTemplates([data, ...templates])
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Error creating practice template:', err)
      return { data: null, error: err.message }
    }
  }

  const updateTemplate = async (id: string, updates: Partial<PracticeTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('practice_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setTemplates(templates.map(t => t.id === id ? data : t))
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Error updating practice template:', err)
      return { data: null, error: err.message }
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('practice_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      setTemplates(templates.filter(t => t.id !== id))
      
      return { error: null }
    } catch (err: any) {
      console.error('Error deleting practice template:', err)
      return { error: err.message }
    }
  }

  const incrementUsageCount = async (id: string) => {
    try {
      // Increment usage count
      const { error } = await supabase.rpc('increment', {
        table_name: 'practice_templates',
        column_name: 'usage_count',
        row_id: id
      })
      
      if (error) {
        // If RPC doesn't exist, do it manually
        const template = templates.find(t => t.id === id)
        if (template) {
          await updateTemplate(id, { 
            usage_count: (template.usage_count || 0) + 1 
          })
        }
      }
    } catch (err) {
      console.error('Error incrementing usage count:', err)
    }
  }

  const getTemplatesByAgeGroup = (ageGroup: string) => {
    return templates.filter(t => 
      t.age_group === ageGroup || t.age_group === 'all'
    )
  }

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(t => t.category === category)
  }

  const getOfficialTemplates = () => {
    return templates.filter(t => t.is_official)
  }

  const getPopularTemplates = (limit = 10) => {
    return [...templates]
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, limit)
  }

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsageCount,
    getTemplatesByAgeGroup,
    getTemplatesByCategory,
    getOfficialTemplates,
    getPopularTemplates,
    refreshTemplates: fetchTemplates
  }
}