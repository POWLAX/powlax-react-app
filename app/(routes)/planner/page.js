'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Category color mappings based on POWLAX design system
const categoryColors = {
  'Skill Drills': 'bg-green-100 text-green-800 border-green-200',
  '1v1 Drills': 'bg-orange-100 text-orange-800 border-orange-200',
  'Team Drills': 'bg-blue-100 text-blue-800 border-blue-200',
  'Concept Drills': 'bg-purple-100 text-purple-800 border-purple-200',
  'Gameplay': 'bg-sky-100 text-sky-800 border-sky-200',
  'Competition': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Admin': 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function PracticePlanner() {
  // State for drill library
  const [drills, setDrills] = useState([])
  const [filteredDrills, setFilteredDrills] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // State for practice plan
  const [practiceInfo, setPracticeInfo] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    field: 'Turf',
    duration: 90
  })
  
  const [practiceGoals, setPracticeGoals] = useState({
    coaching: '',
    offensive: '',
    defensive: '',
    goalie: ''
  })
  
  const [practiceDrills, setPracticeDrills] = useState([])
  const [showDrillModal, setShowDrillModal] = useState(false)
  const [editingDrill, setEditingDrill] = useState(null)

  // Fetch drills on mount
  useEffect(() => {
    fetchDrills()
  }, [])

  // Filter drills based on criteria
  useEffect(() => {
    let filtered = drills

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(drill => drill.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(drill => 
        drill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drill.description && drill.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredDrills(filtered)
  }, [drills, selectedCategory, searchTerm])

  const fetchDrills = async () => {
    try {
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .order('title')

      if (error) throw error

      setDrills(data || [])
      setFilteredDrills(data || [])
    } catch (err) {
      console.error('Error fetching drills:', err)
    } finally {
      setLoading(false)
    }
  }

  const addDrillToPractice = (drill) => {
    const newDrill = {
      ...drill,
      practiceId: Date.now() + Math.random(),
      notes: '',
      customDuration: drill.duration_minutes || 10
    }
    setPracticeDrills([...practiceDrills, newDrill])
    setShowDrillModal(false)
  }

  const removeDrillFromPractice = (practiceId) => {
    setPracticeDrills(practiceDrills.filter(d => d.practiceId !== practiceId))
  }

  const updateDrillInPractice = (practiceId, updates) => {
    setPracticeDrills(practiceDrills.map(d => 
      d.practiceId === practiceId ? { ...d, ...updates } : d
    ))
  }

  const moveDrill = (index, direction) => {
    const newDrills = [...practiceDrills]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newDrills.length) {
      [newDrills[index], newDrills[newIndex]] = [newDrills[newIndex], newDrills[index]]
      setPracticeDrills(newDrills)
    }
  }

  const totalDuration = practiceDrills.reduce((sum, drill) => {
    return sum + (drill.customDuration || 0)
  }, 0)

  const categories = ['all', ...new Set(drills.map(drill => drill.category).filter(Boolean))]

  // Calculate end time
  const calculateEndTime = () => {
    const [hours, minutes] = practiceInfo.startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + totalDuration
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const savePracticePlan = async () => {
    const practiceData = {
      info: practiceInfo,
      goals: practiceGoals,
      drills: practiceDrills,
      totalMinutes: totalDuration
    }

    try {
      // Note: This assumes you have a 'practices' table in Supabase
      console.log('Saving practice plan:', practiceData)
      alert('Practice plan saved! (Note: Add Supabase practices table to persist data)')
    } catch (err) {
      console.error('Error saving practice:', err)
      alert('Error saving practice. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold text-blue-600">POWLAX Practice Planner</h1>
              <p className="text-sm text-gray-500 italic hidden md:block">
                Build your practice plan with drag-and-drop simplicity
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                📂 Load
              </button>
              <button 
                onClick={savePracticePlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                💾 Save
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Practice Canvas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Practice Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Practice Info and Goals</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
                  <input
                    type="text"
                    value={practiceInfo.name}
                    onChange={(e) => setPracticeInfo({...practiceInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Training League Day 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                  <select
                    value={practiceInfo.field}
                    onChange={(e) => setPracticeInfo({...practiceInfo, field: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Turf">Fieldhouse Turf</option>
                    <option value="Grass">Grass Field</option>
                    <option value="Indoor">Indoor</option>
                  </select>
                </div>
              </div>

              {/* Practice Goals */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Practice Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    coaching: 'Coaching',
                    offensive: 'Offensive',
                    defensive: 'Defensive',
                    goalie: 'Goalie'
                  }).map(([key, label]) => (
                    <div 
                      key={key}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 border rounded-lg p-4"
                    >
                      <h4 className="text-sm font-semibold text-blue-600 mb-2">{label}</h4>
                      <textarea
                        value={practiceGoals[key]}
                        onChange={(e) => setPracticeGoals({...practiceGoals, [key]: e.target.value})}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows="3"
                        placeholder={`Enter ${label.toLowerCase()} goals...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Practice Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Schedule</h2>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Date:</span>
                    <input
                      type="date"
                      value={practiceInfo.date}
                      onChange={(e) => setPracticeInfo({...practiceInfo, date: e.target.value})}
                      className="text-blue-600 font-medium border-b border-dotted border-blue-600 cursor-pointer hover:border-solid"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Start:</span>
                    <input
                      type="time"
                      value={practiceInfo.startTime}
                      onChange={(e) => setPracticeInfo({...practiceInfo, startTime: e.target.value})}
                      className="text-blue-600 font-medium border-b border-dotted border-blue-600 cursor-pointer hover:border-solid"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                {/* Timeline */}
                <div className="relative pl-16">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200"></div>
                  
                  {/* Drill List */}
                  {practiceDrills.map((drill, index) => (
                    <div key={drill.practiceId} className="relative">
                      <div className="bg-white rounded-lg p-5 mb-4 border border-gray-200 hover:shadow-md transition-all hover:translate-x-1">
                        <div className="absolute -left-12 top-5 bg-white px-2 py-1 rounded text-sm font-medium text-gray-600 shadow-sm">
                          {practiceInfo.startTime}
                        </div>
                        <div className="absolute left-[-30px] top-7 w-3 h-3 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{drill.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                                categoryColors[drill.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}>
                                {drill.category}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={drill.customDuration}
                                  onChange={(e) => updateDrillInPractice(drill.practiceId, { customDuration: parseInt(e.target.value) || 0 })}
                                  className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="1"
                                  max="60"
                                />
                                <span className="text-sm text-gray-600">min</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveDrill(index, 'up')}
                              disabled={index === 0}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveDrill(index, 'down')}
                              disabled={index === practiceDrills.length - 1}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingDrill(drill)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeDrillFromPractice(drill.practiceId)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {drill.notes && (
                          <p className="text-sm text-gray-600 mb-3">{drill.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {practiceDrills.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg mb-2">No drills added yet</p>
                      <p className="text-sm">Click "Add Drills to Plan" or select drills from the library</p>
                    </div>
                  )}
                </div>

                {/* Add Drills Button */}
                <button
                  onClick={() => setShowDrillModal(true)}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                >
                  + Add Drills to Plan
                </button>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-100 border-t flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition">
                    Load
                  </button>
                  <button 
                    onClick={savePracticePlan}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition"
                  >
                    Save
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition">
                    Print
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Duration: <strong className="text-gray-900">{totalDuration} min</strong> • 
                  End: <strong className="text-gray-900">{calculateEndTime()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Drill Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-20 border border-gray-100">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Drill Library</h2>
                
                {/* Filters */}
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search drills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pl-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drill List */}
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500 py-4">Loading drills...</p>
                ) : filteredDrills.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No drills found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredDrills.map(drill => (
                      <div
                        key={drill.id}
                        className="p-3 bg-gradient-to-r from-gray-50 to-white border rounded-lg hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
                        onClick={() => addDrillToPractice(drill)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                              {drill.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                categoryColors[drill.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}>
                                {drill.category}
                              </span>
                              <span className="text-xs text-gray-500">{drill.duration_minutes || 10} min</span>
                            </div>
                          </div>
                          <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drill Selection Modal */}
      {showDrillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Select Drills to Add</h2>
                <button
                  onClick={() => setShowDrillModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search drills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pl-9 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drill Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
                {filteredDrills.map(drill => (
                  <div
                    key={drill.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-500 cursor-pointer transition group"
                    onClick={() => addDrillToPractice(drill)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">{drill.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[drill.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {drill.category}
                          </span>
                          <span className="text-sm text-gray-600">{drill.duration_minutes || 10} min</span>
                        </div>
                        {drill.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{drill.description}</p>
                        )}
                      </div>
                      <button className="ml-2 text-blue-600 hover:text-blue-700">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDrillModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drill Notes Modal */}
      {editingDrill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Edit Drill: {editingDrill.title}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={editingDrill.customDuration}
                    onChange={(e) => setEditingDrill({...editingDrill, customDuration: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editingDrill.notes || ''}
                    onChange={(e) => setEditingDrill({...editingDrill, notes: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Add specific notes for this drill..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingDrill(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateDrillInPractice(editingDrill.practiceId, {
                      customDuration: editingDrill.customDuration,
                      notes: editingDrill.notes
                    })
                    setEditingDrill(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}