'use client'

import { Suspense } from 'react'
import OptimizedAnimationShowcase from '@/components/animations/OptimizedAnimationShowcase'

export default function AnimationsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 POWLAX Animation Showcase
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience all the celebration animations, effects, and interactions that make POWLAX engaging and rewarding for players.
          </p>
        </div>

        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading animations...</p>
              <p className="text-sm text-gray-500 mt-2">Preparing the full showcase experience</p>
            </div>
          </div>
        }>
          <OptimizedAnimationShowcase />
        </Suspense>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎯 Interactive Demo Guide
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Badge Unlock:</strong> Click buttons to trigger celebration animations</p>
              <p><strong>Point Explosions:</strong> Click anywhere on the canvas areas</p>
              <p><strong>Badge Collection:</strong> Drag badges to collection zones</p>
              <p><strong>Skill Trees:</strong> Click nodes to see progression animations</p>
              <p><strong>Combo Systems:</strong> Build combos with button clicks</p>
              <p><strong>Power-ups:</strong> Experience WebGL shader effects</p>
              <p><strong>Team Racing:</strong> Watch automated progress animations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
