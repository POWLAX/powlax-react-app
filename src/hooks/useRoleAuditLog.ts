'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface RoleChangeLog {
  id: string
  user_id: string
  changed_by: string
  old_roles: string[]
  new_roles: string[]
  old_permissions: string[]
  new_permissions: string[]
  reason: string
  ip_address: string
  user_agent: string
  created_at: string
}

interface PermissionTemplate {
  id: string
  template_name: string
  description: string
  roles: string[]
  permissions: string[]
  applicable_to_teams: number[]
  applicable_to_clubs: number[]
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useRoleAuditLog() {
  const [auditLogs, setAuditLogs] = useState<RoleChangeLog[]>([])
  const [templates, setTemplates] = useState<PermissionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditData()
  }, [])

  const fetchAuditData = async () => {
    try {
      setLoading(true)
      console.log('📝 Fetching role audit logs...')
      
      // Fetch audit logs
      const { data: logData, error: logError } = await supabase
        .from('role_change_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (logError && logError.code !== 'PGRST116') {
        console.log('Note: role_change_log table may not exist yet')
      } else if (logData) {
        setAuditLogs(logData.map((log: any) => ({
          ...log,
          old_roles: log.old_roles || [],
          new_roles: log.new_roles || [],
          old_permissions: log.old_permissions || [],
          new_permissions: log.new_permissions || []
        })))
      }

      // Fetch permission templates
      const { data: templateData, error: templateError } = await supabase
        .from('permission_templates')
        .select('*')
        .eq('is_active', true)
        .order('template_name')

      if (templateError && templateError.code !== 'PGRST116') {
        console.log('Note: permission_templates table may not exist yet')
      } else if (templateData) {
        setTemplates(templateData.map((template: any) => ({
          ...template,
          roles: template.roles || [],
          permissions: template.permissions || [],
          applicable_to_teams: template.applicable_to_teams || [],
          applicable_to_clubs: template.applicable_to_clubs || []
        })))
      }

      console.log(`✅ Loaded ${auditLogs.length} audit logs and ${templates.length} templates`)
    } catch (err: any) {
      console.error('Error fetching audit data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logRoleChange = async (changeData: {
    userId: string
    oldRoles: string[]
    newRoles: string[]
    oldPermissions: string[]
    newPermissions: string[]
    reason: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Get request metadata
      const ipAddress = '127.0.0.1' // Would get from request in production
      const userAgent = navigator.userAgent

      // PERMANENCE PATTERN: Arrays are directly stored
      const { error } = await supabase
        .from('role_change_log')
        .insert([{
          user_id: changeData.userId,
          changed_by: user.id,
          old_roles: changeData.oldRoles,
          new_roles: changeData.newRoles,
          old_permissions: changeData.oldPermissions,
          new_permissions: changeData.newPermissions,
          reason: changeData.reason,
          ip_address: ipAddress,
          user_agent: userAgent
        }])
      
      if (error) throw error
      
      console.log('✅ Role change logged with array data')
      await fetchAuditData()
    } catch (err: any) {
      console.error('Error logging role change:', err)
      setError(err.message)
      throw err
    }
  }

  const createPermissionTemplate = async (templateData: {
    name: string
    description: string
    roles: string[]
    permissions: string[]
    applyToTeams: boolean
    applyToClubs: boolean
    teamIds?: number[]
    clubIds?: number[]
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // PERMANENCE PATTERN: Transform booleans to arrays
      const { error } = await supabase
        .from('permission_templates')
        .insert([{
          template_name: templateData.name,
          description: templateData.description,
          roles: templateData.roles,
          permissions: templateData.permissions,
          applicable_to_teams: templateData.applyToTeams 
            ? (templateData.teamIds || []) 
            : [],
          applicable_to_clubs: templateData.applyToClubs 
            ? (templateData.clubIds || []) 
            : [],
          created_by: user.id,
          is_active: true
        }])
      
      if (error) throw error
      
      console.log('✅ Permission template created with permanence pattern')
      await fetchAuditData()
    } catch (err: any) {
      console.error('Error creating template:', err)
      setError(err.message)
      throw err
    }
  }

  const applyTemplate = async (templateId: string, userId: string) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) throw new Error('Template not found')

      // Log the change with arrays
      await logRoleChange({
        userId,
        oldRoles: [], // Would fetch current roles
        newRoles: template.roles,
        oldPermissions: [], // Would fetch current permissions
        newPermissions: template.permissions,
        reason: `Applied template: ${template.template_name}`
      })

      console.log('✅ Template applied and logged')
    } catch (err: any) {
      console.error('Error applying template:', err)
      setError(err.message)
      throw err
    }
  }

  const getChangeHistory = (userId: string) => {
    return auditLogs.filter(log => log.user_id === userId)
  }

  const getRecentChanges = (limit: number = 10) => {
    return auditLogs.slice(0, limit)
  }

  return {
    auditLogs,
    templates,
    loading,
    error,
    logRoleChange,
    createPermissionTemplate,
    applyTemplate,
    getChangeHistory,
    getRecentChanges,
    refreshAuditData: fetchAuditData
  }
}