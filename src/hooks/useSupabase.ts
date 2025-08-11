import { useAuth } from '@/contexts/SupabaseAuthContext'

/**
 * Unified Supabase Hook
 * Provides both Supabase client AND user data from Supabase Auth
 */
export function useSupabase() {
  const { user, loading, supabase } = useAuth()
  
  return {
    ...supabase,
    user,
    loading,
    // Maintain backward compatibility
    from: supabase.from.bind(supabase),
    auth: supabase.auth,
    storage: supabase.storage,
    realtime: supabase.realtime,
    channel: supabase.channel.bind(supabase)
  }
}