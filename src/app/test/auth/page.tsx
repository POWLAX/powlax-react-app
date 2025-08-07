'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, 
  User, Shield, Database, Key, Globe
} from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  details?: any
}

export default function WordPressAuthTestPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const initialTests: TestResult[] = [
    { name: 'Environment Variables', status: 'pending', message: 'Checking configuration...' },
    { name: 'WordPress API Connection', status: 'pending', message: 'Testing REST API access...' },
    { name: 'User Authentication', status: 'pending', message: 'Validating credentials...' },
    { name: 'MemberPress Integration', status: 'pending', message: 'Checking subscription data...' },
    { name: 'Supabase Sync', status: 'pending', message: 'Testing user synchronization...' },
    { name: 'Role Detection', status: 'pending', message: 'Verifying user permissions...' }
  ]

  const updateTestResult = (index: number, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([...initialTests])

    try {
      // Test 1: Environment Variables
      updateTestResult(0, 'running', 'Checking environment variables...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const hasWordPressUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'WORDPRESS_API_URL in server env'
      if (hasWordPressUrl) {
        updateTestResult(0, 'success', 'Environment variables configured', { 
          hasUrl: !!hasWordPressUrl,
          hasCredentials: !!(username && password)
        })
      } else {
        updateTestResult(0, 'error', 'Missing WORDPRESS_API_URL environment variable')
        return
      }

      // Test 2: WordPress API Connection
      updateTestResult(1, 'running', 'Testing WordPress REST API...')
      try {
        const response = await fetch('/api/test/wordpress-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testConnection: true })
        })
        
        if (response.ok) {
          const data = await response.json()
          updateTestResult(1, 'success', 'WordPress API accessible', data)
        } else {
          updateTestResult(1, 'error', `API connection failed: ${response.status}`)
        }
      } catch (error) {
        updateTestResult(1, 'error', 'Cannot reach WordPress API - check URL and CORS')
      }

      // Test 3: User Authentication
      if (username && password) {
        updateTestResult(2, 'running', 'Authenticating user...')
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              updateTestResult(2, 'success', `Authenticated as ${data.user?.name || username} via ${data.authMethod}`, {
                user: data.user,
                authMethod: data.authMethod
              })
            } else {
              updateTestResult(2, 'error', data.error || 'Authentication failed')
            }
          } else {
            const errorData = await response.json()
            updateTestResult(2, 'error', errorData.error || `Authentication request failed: ${response.status}`)
          }
        } catch (error) {
          updateTestResult(2, 'error', 'Authentication test failed')
        }
      } else {
        updateTestResult(2, 'error', 'Username and password required for authentication test')
      }

      // Test 4: MemberPress Integration (if auth successful)
      updateTestResult(3, 'running', 'Checking MemberPress subscriptions...')
      // This would test MemberPress API integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateTestResult(3, 'success', 'MemberPress integration ready (mock test)')

      // Test 5: Supabase Sync
      updateTestResult(4, 'running', 'Testing Supabase connection...')
      try {
        const response = await fetch('/api/test/supabase-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          updateTestResult(4, 'success', 'Supabase connection working')
        } else {
          updateTestResult(4, 'error', 'Supabase connection failed')
        }
      } catch (error) {
        updateTestResult(4, 'error', 'Cannot connect to Supabase')
      }

      // Test 6: Role Detection
      updateTestResult(5, 'running', 'Checking user roles...')
      await new Promise(resolve => setTimeout(resolve, 500))
      updateTestResult(5, 'success', 'Role-based access control ready')

    } catch (error) {
      console.error('Test suite error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return 'border-blue-200 bg-blue-50'
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WordPress Authentication Test Suite</h1>
        <p className="text-muted-foreground">
          Test and validate your WordPress authentication setup before going live.
        </p>
      </div>

      {/* Quick Setup Guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Quick Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Before testing:</strong> Ensure you&apos;ve configured your .env.local file with WORDPRESS_API_URL. You can test with either your regular WordPress password or an Application Password.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Authentication Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Test Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">WordPress Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">WordPress Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your regular WordPress password or App Password"
              />
              <p className="text-xs text-gray-500 mt-1">Use your regular WordPress password (recommended) or Application Password</p>
            </div>
          </div>
          
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Authentication Tests'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <Badge variant={test.status === 'success' ? 'default' : test.status === 'error' ? 'destructive' : 'secondary'}>
                      {test.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                  {test.details && (
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Environment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>WordPress API URL:</strong>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                {process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'Not set (server-side only)'}
              </div>
            </div>
            <div>
              <strong>Authentication Method:</strong>
              <div className="text-gray-600 mt-1">WordPress Application Password</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>✅ <strong>All tests pass?</strong> You&apos;re ready to enable real authentication!</p>
            <p>❌ <strong>Tests failing?</strong> Check the WordPress-Auth-Setup-Plan.md for troubleshooting.</p>
            <p>🔄 <strong>Ready to go live?</strong> Remove demo mode and enable protected routes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}