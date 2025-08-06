'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function VimeoTestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [videoMetadata, setVideoMetadata] = useState<any>(null)

  const testApiConnection = async () => {
    setLoading(true)
    setTestResult(null)
    
    const token = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN
    
    if (!token) {
      setTestResult({
        success: false,
        error: 'No NEXT_PUBLIC_VIMEO_ACCESS_TOKEN found in environment variables',
        message: 'Please add your Vimeo access token to .env.local file'
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://api.vimeo.com/me', {
        headers: {
          'Authorization': `bearer ${token}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setTestResult({
        success: true,
        data,
        message: 'Vimeo API connection successful!'
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Failed to connect to Vimeo API'
      })
    } finally {
      setLoading(false)
    }
  }

  const testVideoMetadata = async () => {
    setLoading(true)
    setVideoMetadata(null)

    // Using a public Vimeo video ID for testing
    const testVideoId = '1000143414' // This should be one of your drill videos
    const token = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN

    if (!token) {
      setVideoMetadata({
        success: false,
        error: 'No access token available',
        message: 'Please set up your Vimeo API credentials first'
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`https://api.vimeo.com/videos/${testVideoId}`, {
        headers: {
          'Authorization': `bearer ${token}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setVideoMetadata({
        success: true,
        data: {
          id: data.uri?.split('/').pop(),
          title: data.name,
          duration: data.duration,
          thumbnail: data.pictures?.sizes?.[3]?.link,
          privacy: data.privacy?.view,
          created: data.created_time,
          plays: data.stats?.plays
        },
        message: 'Video metadata retrieved successfully!'
      })
    } catch (error: any) {
      setVideoMetadata({
        success: false,
        error: error.message,
        message: 'Failed to get video metadata'
      })
    } finally {
      setLoading(false)
    }
  }

  const hasToken = !!process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎥 Vimeo API Test Page</h1>
        <p className="text-gray-600">
          Use this page to test your Vimeo API integration and credentials.
        </p>
      </div>

      {/* API Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Access Token:</span>
              {hasToken ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ Configured
                </Badge>
              ) : (
                <Badge variant="destructive">❌ Missing</Badge>
              )}
            </div>
            {hasToken && (
              <div className="text-sm text-gray-600">
                Token: {process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN?.substring(0, 10)}...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Connection Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test API Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={testApiConnection} 
              disabled={loading || !hasToken}
            >
              {loading ? 'Testing...' : 'Test Vimeo API Connection'}
            </Button>
            
            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-semibold ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </div>
                
                {testResult.success && testResult.data && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div><strong>Account:</strong> {testResult.data.name}</div>
                    <div><strong>Account Type:</strong> {testResult.data.account}</div>
                    <div><strong>Upload Quota:</strong> {testResult.data.upload_quota?.space?.free ? 
                      Math.round(testResult.data.upload_quota.space.free / 1024 / 1024 / 1024) + ' GB remaining' : 
                      'N/A'}
                    </div>
                  </div>
                )}
                
                {testResult.error && (
                  <div className="mt-2 text-sm text-red-600">
                    <strong>Error:</strong> {testResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Metadata Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Video Metadata Retrieval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={testVideoMetadata} 
              disabled={loading || !hasToken}
              variant="outline"
            >
              {loading ? 'Loading...' : 'Test Video Metadata'}
            </Button>
            
            {videoMetadata && (
              <div className={`p-4 rounded-md ${
                videoMetadata.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-semibold ${
                  videoMetadata.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {videoMetadata.message}
                </div>
                
                {videoMetadata.success && videoMetadata.data && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div><strong>Video ID:</strong> {videoMetadata.data.id}</div>
                    <div><strong>Title:</strong> {videoMetadata.data.title}</div>
                    <div><strong>Duration:</strong> {videoMetadata.data.duration} seconds</div>
                    <div><strong>Privacy:</strong> {videoMetadata.data.privacy}</div>
                    <div><strong>Play Count:</strong> {videoMetadata.data.plays}</div>
                    {videoMetadata.data.thumbnail && (
                      <div className="mt-2">
                        <strong>Thumbnail:</strong>
                        <img 
                          src={videoMetadata.data.thumbnail} 
                          alt="Video thumbnail"
                          className="mt-1 max-w-xs rounded border"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {videoMetadata.error && (
                  <div className="mt-2 text-sm text-red-600">
                    <strong>Error:</strong> {videoMetadata.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {!hasToken && (
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-yellow-800">
              <p className="mb-2">To use the Vimeo API, you need to:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create a Vimeo Developer account at <a href="https://developer.vimeo.com/" className="underline" target="_blank">developer.vimeo.com</a></li>
                <li>Create a new app and generate a personal access token</li>
                <li>Add the token to your <code>.env.local</code> file as <code>NEXT_PUBLIC_VIMEO_ACCESS_TOKEN</code></li>
                <li>Restart your development server</li>
              </ol>
              <p className="mt-2">
                See <code>WORKOUT_BUILDER_FIX_GUIDE.md</code> for detailed instructions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}