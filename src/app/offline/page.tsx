'use client'

import { WifiOff, RefreshCw, FileText, Clock } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="h-12 w-12 text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You&apos;re Offline</h1>
          <p className="text-gray-600">
            No internet connection detected. Don&apos;t worry - you can still access some features!
          </p>
        </div>

        {/* Available Offline Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Offline:</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-700">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Previously loaded practice plans</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Practice plan templates</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/demo/practice-planner"
            className="block w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            Go to Practice Planner
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-8 text-sm text-gray-500">
          <p className="mb-2">
            <strong>Tip:</strong> Practice plans you&apos;ve viewed recently are available offline.
          </p>
          <p>
            When you&apos;re back online, any changes will be automatically synced.
          </p>
        </div>
      </div>
    </div>
  )
}