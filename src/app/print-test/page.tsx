'use client'

import { useState } from 'react'
import PrintablePracticePlan from '@/components/practice-planner/PrintablePracticePlan'
import { usePrint } from '@/hooks/usePrint'

// Sample practice data for testing
const sampleTimeSlots = [
  {
    id: 'slot-1',
    duration: 15,
    drills: [
      {
        id: 'drill-1',
        name: 'Warm-up Jog',
        description: 'Light jogging around the field to get players warmed up and ready for practice',
        duration: 15,
        category: 'Conditioning',
        equipment: ['Cones', 'Water bottles'],
        notes: 'Keep pace moderate, focus on form'
      }
    ]
  },
  {
    id: 'slot-2',
    duration: 20,
    drills: [
      {
        id: 'drill-2',
        name: 'Stick Skills Practice',
        description: 'Basic passing and catching drills to improve fundamental lacrosse skills',
        duration: 20,
        category: 'Skills',
        equipment: ['Lacrosse sticks', 'Balls', 'Target cones'],
        notes: 'Focus on proper form, both hands'
      }
    ]
  }
]

export default function PrintTestPage() {
  const { isPrinting, printContent } = usePrint()
  const [showPreview, setShowPreview] = useState(false)

  const handlePrint = () => {
    printContent('test-print-content')
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Print Functionality Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-x-4">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Show Print Preview
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={isPrinting}
            >
              {isPrinting ? 'Printing...' : 'Print Directly'}
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• &quot;Show Print Preview&quot; - Opens the print content in this page</li>
              <li>• &quot;Print Directly&quot; - Opens browser print dialog with optimized content</li>
              <li>• Check that POWLAX branding appears correctly</li>
              <li>• Verify equipment checklist is generated</li>
              <li>• Ensure safety reminders are included</li>
              <li>• Test on mobile devices for responsive print layout</li>
            </ul>
          </div>
        </div>

        {showPreview && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Print Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Close Preview
              </button>
            </div>
            
            <div className="overflow-auto" style={{ maxHeight: '80vh' }}>
              <div id="test-print-content">
                <PrintablePracticePlan
                  practiceDate="2025-01-15"
                  startTime="16:00"
                  duration={50}
                  field="Main Field"
                  setupTime={15}
                  timeSlots={sampleTimeSlots}
                  practiceNotes="This is a test practice plan for verifying print functionality. The plan includes warm-up activities and basic skill development exercises appropriate for youth players."
                  coachName="Coach Smith"
                  teamName="Test Team U12"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}