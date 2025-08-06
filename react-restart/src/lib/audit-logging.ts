/**
 * Audit Logging for Data Access
 * Tracks all data access attempts for security and compliance
 */

import { supabase } from './supabase';

export interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  success: boolean;
  denied_reason?: string;
  additional_context?: Record<string, any>;
}

/**
 * Log a data access attempt
 */
export async function logDataAccess(
  action: string,
  resourceType: string,
  resourceId?: string,
  success: boolean = true,
  deniedReason?: string,
  additionalContext?: Record<string, any>
): Promise<void> {
  try {
    // Get current user context
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('roles, organization_id')
      .eq('id', user.id)
      .single();

    // Get IP and user agent from browser
    const ipAddress = await getClientIP();
    const userAgent = navigator.userAgent;

    // Create audit log entry
    await supabase.from('data_access_audit').insert({
      user_id: user.id,
      user_role: userData?.roles?.[0] || 'unknown',
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      organization_id: userData?.organization_id,
      success,
      denied_reason: deniedReason,
      ip_address: ipAddress,
      user_agent: userAgent,
      additional_context: additionalContext
    });
  } catch (error) {
    // Don't throw on audit failures - log to console instead
    console.error('Audit logging failed:', error);
  }
}

/**
 * Log a security violation
 */
export async function logSecurityViolation(
  attemptedAction: string,
  resourceType: string,
  resourceId?: string,
  reason?: string
): Promise<void> {
  await logDataAccess(
    attemptedAction,
    resourceType,
    resourceId,
    false,
    reason || 'Unauthorized access attempt',
    { violation_type: 'security' }
  );
}

/**
 * Get client IP address (best effort)
 */
async function getClientIP(): Promise<string | null> {
  try {
    // In production, this would come from your API server
    // For now, return null as placeholder
    return null;
  } catch {
    return null;
  }
}

/**
 * Query audit logs (admin only)
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
}): Promise<any[]> {
  let query = supabase
    .from('data_access_audit')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }

  if (filters.success !== undefined) {
    query = query.eq('success', filters.success);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get suspicious activity patterns
 */
export async function detectSuspiciousActivity(userId: string): Promise<{
  suspicious: boolean;
  reasons: string[];
}> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  // Check for rapid failed access attempts
  const { data: failedAttempts } = await supabase
    .from('data_access_audit')
    .select('*')
    .eq('user_id', userId)
    .eq('success', false)
    .gte('created_at', fiveMinutesAgo.toISOString());

  const reasons: string[] = [];

  // Too many failed attempts
  if (failedAttempts && failedAttempts.length > 5) {
    reasons.push('Multiple failed access attempts');
  }

  // Check for cross-org access attempts
  const { data: crossOrgAttempts } = await supabase
    .from('data_access_audit')
    .select('organization_id')
    .eq('user_id', userId)
    .gte('created_at', fiveMinutesAgo.toISOString());

  if (crossOrgAttempts) {
    const uniqueOrgs = new Set(crossOrgAttempts.map(a => a.organization_id).filter(Boolean));
    if (uniqueOrgs.size > 1) {
      reasons.push('Attempted access across multiple organizations');
    }
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}