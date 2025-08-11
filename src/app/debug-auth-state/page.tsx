'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/SupabaseAuthContext'

export default function DebugAuthStatePage() {
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [localStorageUser, setLocalStorageUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  
  const authContext = useAuth()
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }
  
  useEffect(() => {
    const checkAuth = async () => {
      addLog('Starting auth debug...')
      
      // Check Supabase session
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          addLog(`Supabase error: ${error.message}`)
        } else {
          addLog(`Supabase session: ${session ? 'Found' : 'None'}`)
          setSupabaseSession(session)
        }
      } catch (err) {
        addLog(`Supabase exception: ${err}`)
      }
      
      // Check localStorage
      if (typeof window !== 'undefined') {
        const lsUser = localStorage.getItem('supabase_auth_user')
        const lsSession = localStorage.getItem('supabase_auth_session')
        addLog(`localStorage user: ${lsUser ? 'Found' : 'None'}`)
        addLog(`localStorage session: ${lsSession ? 'Found' : 'None'}`)
        setLocalStorageUser(lsUser ? JSON.parse(lsUser) : null)
      }
      
      // Check auth state subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        addLog(`Auth state change: ${event}, session: ${session ? 'Present' : 'None'}`)
      })
      
      setLoading(false)
      
      return () => subscription.unsubscribe()
    }
    
    checkAuth()
  }, [])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth State Debug</h1>
      
      <div className="space-y-6">
        {/* Context State */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Auth Context State</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              user: authContext.user,
              loading: authContext.loading,
              error: authContext.error
            }, null, 2)}
          </pre>
        </div>
        
        {/* Supabase Session */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Supabase Session</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(supabaseSession, null, 2)}
          </pre>
        </div>
        
        {/* LocalStorage User */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">LocalStorage User</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(localStorageUser, null, 2)}
          </pre>
        </div>
        
        {/* Debug Logs */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear LocalStorage & Reload
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.reload()
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Sign Out Supabase
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}