'use client'

import { useState } from 'react'
import TeamPlaybook from '@/components/team-playbook/TeamPlaybook'

// Mock team data for demonstration
const DEMO_TEAM = {
  id: 'demo-team-123',
  name: 'Demo Eagles Lacrosse'
}

export default function TeamPlaybookDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Team Playbook Demo</h1>
          <p className="text-gray-600 mt-1">
            Demonstration of the team playbook system for strategy collections
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
        <TeamPlaybook 
          teamId={DEMO_TEAM.id}
          teamName={DEMO_TEAM.name}
          onAddStrategy={() => {
            alert('In a real app, this would open the strategy library or navigate to Practice Planner')
          }}
        />
      </div>
    </div>
  )
}