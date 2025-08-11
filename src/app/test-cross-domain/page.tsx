'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TestCrossDomainPage() {
  useEffect(() => {
    console.log('Test Cross-Domain Page Loaded')
    console.log('Referrer:', document.referrer)
    console.log('URL Params:', window.location.search)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Cross-Domain Authentication Test</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Test Scenarios:</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click these links to test different authentication flows:
          </p>
        </div>

        <div className="grid gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">1. Simulate coming from powlax.com</h3>
            <p className="text-sm text-gray-600 mb-3">
              This adds a URL parameter that triggers the auth modal
            </p>
            <Link href="/dashboard?from_powlax=true">
              <Button>Visit Dashboard with from_powlax=true</Button>
            </Link>
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">2. Auto-auth parameter</h3>
            <p className="text-sm text-gray-600 mb-3">
              This triggers immediate authentication popup
            </p>
            <Link href="/dashboard?auto_auth=true">
              <Button>Visit Dashboard with auto_auth=true</Button>
            </Link>
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">3. Direct navigation (no auth popup)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Normal navigation without authentication trigger
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Visit Dashboard normally</Button>
            </Link>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Expected Behavior:</h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Links 1 & 2 should automatically show the login modal</li>
            <li>Link 3 should NOT show the login modal</li>
            <li>The URL parameters should be cleaned up after modal shows</li>
            <li>Console should log the detection of cross-domain visit</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">To Test Manual Magic Link:</h2>
          <p className="text-sm text-gray-600 mb-2">
            Run this command to generate a magic link for chaplalacrosse22@gmail.com:
          </p>
          <code className="block bg-gray-900 text-white p-2 rounded text-xs">
            npx tsx scripts/generate-manual-magic-link.ts
          </code>
        </div>
      </div>
    </div>
  )
}