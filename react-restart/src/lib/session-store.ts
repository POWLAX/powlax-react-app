import { createClient } from '@/lib/supabase/client'

interface Session {
  user: any
  wpCredentials: string
  expiresAt: number
}

class SessionStore {
  private memoryStore = new Map<string, Session>()
  private useSupabase = false // Set to true when ready for production

  async get(token: string): Promise<Session | null> {
    if (this.useSupabase) {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('token', token)
        .single()
      
      if (error || !data) return null
      
      // Check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.delete(token)
        return null
      }
      
      return {
        user: data.user_data,
        wpCredentials: data.wp_credentials,
        expiresAt: new Date(data.expires_at).getTime()
      }
    } else {
      // Use memory store for development
      const session = this.memoryStore.get(token)
      if (!session) return null
      
      if (session.expiresAt < Date.now()) {
        this.memoryStore.delete(token)
        return null
      }
      
      return session
    }
  }

  async set(token: string, session: Session): Promise<void> {
    if (this.useSupabase) {
      const supabase = createClient()
      await supabase.from('user_sessions').upsert({
        token,
        user_data: session.user,
        wp_credentials: session.wpCredentials,
        expires_at: new Date(session.expiresAt).toISOString(),
        created_at: new Date().toISOString()
      })
    } else {
      this.memoryStore.set(token, session)
    }
  }

  async delete(token: string): Promise<void> {
    if (this.useSupabase) {
      const supabase = createClient()
      await supabase.from('user_sessions').delete().eq('token', token)
    } else {
      this.memoryStore.delete(token)
    }
  }

  async cleanup(): Promise<void> {
    if (this.useSupabase) {
      const supabase = createClient()
      await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())
    } else {
      const now = Date.now()
      for (const [token, session] of this.memoryStore.entries()) {
        if (session.expiresAt < now) {
          this.memoryStore.delete(token)
        }
      }
    }
  }
}

export const sessionStore = new SessionStore()