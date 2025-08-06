'use client';

import { useState } from 'react';
import { wordpressAPI } from '@/lib/wordpress-api';

export default function TestWordPressPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [drills, setDrills] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setConnectionStatus('testing');
    setError('');
    
    try {
      const isConnected = await wordpressAPI.testConnection();
      
      if (isConnected) {
        setConnectionStatus('success');
        
        // Try to fetch some sample drills
        const sampleDrills = await wordpressAPI.fetchDrills(1, 5);
        setDrills(sampleDrills);
      } else {
        setConnectionStatus('error');
        setError('Connection failed - check your credentials');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const testCustomEndpoint = async () => {
    setConnectionStatus('testing');
    setError('');
    
    try {
      const customDrills = await wordpressAPI.fetchCustomDrills();
      setConnectionStatus('success');
      setDrills(customDrills);
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Custom endpoint test failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WordPress API Connection Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <p><strong>WordPress URL:</strong> {process.env.WORDPRESS_API_URL || 'Not configured'}</p>
            <p><strong>Username:</strong> {process.env.WORDPRESS_USERNAME || 'Not configured'}</p>
            <p><strong>App Password:</strong> {process.env.WORDPRESS_APP_PASSWORD ? '***configured***' : 'Not configured'}</p>
            <p><strong>JWT Token:</strong> {process.env.WORDPRESS_JWT_TOKEN ? '***configured***' : 'Not configured'}</p>
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={testConnection}
            disabled={connectionStatus === 'testing'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {connectionStatus === 'testing' ? 'Testing...' : 'Test WordPress Connection'}
          </button>
          
          <button
            onClick={testCustomEndpoint}
            disabled={connectionStatus === 'testing'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {connectionStatus === 'testing' ? 'Testing...' : 'Test Custom Endpoint'}
          </button>
        </div>

        {connectionStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="text-green-800 font-semibold">✅ Connection Successful!</h3>
            <p className="text-green-700">Successfully connected to WordPress API</p>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h3 className="text-red-800 font-semibold">❌ Connection Failed</h3>
            <p className="text-red-700">{error}</p>
            <div className="mt-2 text-sm text-red-600">
              <p>Common issues:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Check your .env.local file has correct WordPress credentials</li>
                <li>Verify WordPress site URL is correct</li>
                <li>Ensure Application Password is generated correctly</li>
                <li>Check if WordPress REST API is enabled</li>
                <li>Verify CORS settings allow your domain</li>
              </ul>
            </div>
          </div>
        )}

        {drills.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="text-blue-800 font-semibold mb-3">Sample Drills Retrieved ({drills.length})</h3>
            <div className="space-y-2">
              {drills.slice(0, 3).map((drill, index) => (
                <div key={index} className="bg-white p-3 rounded border text-sm">
                  <p><strong>Title:</strong> {drill.title?.rendered || drill.title || 'No title'}</p>
                  <p><strong>ID:</strong> {drill.id}</p>
                  {drill.meta && (
                    <p><strong>Category:</strong> {drill.meta._drill_category || 'No category'}</p>
                  )}
                </div>
              ))}
              {drills.length > 3 && (
                <p className="text-blue-600">...and {drills.length - 3} more drills</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}