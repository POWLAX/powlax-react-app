'use client'

import { useServiceWorker } from '@/hooks/useServiceWorker'
import { WifiOff, Wifi, Download, RefreshCw } from 'lucide-react'
// Removed framer-motion - using CSS animations instead
import { useState } from 'react'

export default function OfflineIndicator() {
  const { isOnline, updateAvailable, updateServiceWorker } = useServiceWorker()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-50 animate-in slide-in-from-top fade-in duration-300">
            <div className="flex items-center justify-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span>You&apos;re offline - Some features may be limited</span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="underline ml-2"
              >
                Details
              </button>
            </div>
            
            {showDetails && (
              <div className="mt-2 text-xs animate-in fade-in slide-in-from-top duration-200">
                <p>
                  Don&apos;t worry! Your previously loaded practice plans and templates 
                  are still available. Any changes will sync when you&apos;re back online.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Update Available Notification */}
      {updateAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium z-50 animate-in slide-in-from-top fade-in duration-300">
          <div className="flex items-center justify-center space-x-2">
            <Download className="h-4 w-4" />
            <span>A new version is available</span>
            <button
              onClick={updateServiceWorker}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs ml-4 flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Update</span>
            </button>
          </div>
        </div>
      )}

      {/* Online Status in Corner */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </>
  )
}