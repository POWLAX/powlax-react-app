'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [drillCount, setDrillCount] = useState<number | null>(null)
  const [tables, setTables] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test 1: Basic connection
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError(`Session error: ${sessionError.message}`)
        return
      }
      setStatus('Connected to Supabase ✅')

      // Test 2: List tables (check if drills table exists)
      const { data: tablesData, error: tablesError } = await supabase
        .from('drills')
        .select('count', { count: 'exact', head: true })

      if (tablesError) {
        setError(`Cannot access drills table: ${tablesError.message}`)
        
        // Try other table names
        const tableTests = ['staging_wp_drills', 'Drills', 'DRILLS']
        for (const tableName of tableTests) {
          const { error: testError } = await supabase
            .from(tableName)
            .select('count', { count: 'exact', head: true })
          
          if (!testError) {
            setTables(prev => [...prev, `Found: ${tableName}`])
          }
        }
      } else {
        setTables(['drills table exists ✅'])
      }

      // Test 3: Count drills
      const { count, error: countError } = await supabase
        .from('drills')
        .select('*', { count: 'exact', head: true })

      if (!countError && count !== null) {
        setDrillCount(count)
      }

      // Test 4: Get sample drill
      const { data: sampleDrill, error: sampleError } = await supabase
        .from('drills')
        .select('*')
        .limit(1)
        .single()

      if (!sampleError && sampleDrill) {
        console.log('Sample drill:', sampleDrill)
        setTables(prev => [...prev, `Sample drill: ${sampleDrill.name || sampleDrill.title || 'No name field'}`])
      }

    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Connection Status:</h2>
          <p className={error ? 'text-red-600' : 'text-green-600'}>{status}</p>
        </div>

        {drillCount !== null && (
          <div className="p-4 bg-blue-100 rounded">
            <h2 className="font-semibold">Drills Count:</h2>
            <p>{drillCount} drills in database</p>
          </div>
        )}

        {tables.length > 0 && (
          <div className="p-4 bg-green-100 rounded">
            <h2 className="font-semibold">Tables Found:</h2>
            <ul className="list-disc pl-5">
              {tables.map((table, i) => (
                <li key={i}>{table}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 rounded">
            <h2 className="font-semibold">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Supabase Config:</h2>
          <p className="text-xs break-all">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p className="text-xs">Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
        </div>
      </div>
    </div>
  )
}