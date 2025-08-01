'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
)

const categoryColors = {
  'Skill Drills': 'bg-green-100 text-green-800 border-green-200',
  '1v1 Drills': 'bg-orange-100 text-orange-800 border-orange-200',
  'Team Drills': 'bg-blue-100 text-blue-800 border-blue-200',
  'Concept Drills': 'bg-purple-100 text-purple-800 border-purple-200',
  'Gameplay': 'bg-sky-100 text-sky-800 border-sky-200',
  'Competition': 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
    goalie: '',
    faceOff: ''
  })
  
  const [practiceDrills, setPracticeDrills] = useState([])
  const [showDrillModal, setShowDrillModal] = useState(false)
  const [editingDrill, setEditingDrill] = useState(null)

  // Fetch drills on mount
  useEffect(() => {
    fetchDrills()
  }, [])

  // Filter drills
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
      practiceId: Date.now(), // Unique ID for this instance in practice
      notes: '',
      customDuration: drill.duration_minutes
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

  const totalDuration = practiceDrills.reduce((sum, drill) => sum + (drill.customDuration || 0), 0)
  const categories = ['all', ...new Set(drills.map(drill => drill.category))]

  // Calculate end time
  const calculateEndTime = () => {
    const [hours, minutes] = practiceInfo.startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + practiceInfo.duration
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-blue-600">POWLAX Practice Planner</h1>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                Load Practice
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Save Practice
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Practice Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={practiceInfo.date}
                    onChange={(e) => setPracticeInfo({...practiceInfo, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={practiceInfo.startTime}
                    onChange={(e) => setPracticeInfo({...practiceInfo, startTime: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                  <select
                    value={practiceInfo.field}
                    onChange={(e) => setPracticeInfo({...practiceInfo, field: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Turf">Turf</option>
                    <option value="Grass">Grass</option>
                    <option value="Indoor">Indoor</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Duration: {practiceInfo.duration} min</span>
                  <span className="text-sm font-medium text-gray-700">End: {calculateEndTime()}</span>
                </div>
              </div>
            </div>

            {/* Practice Goals */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Practice Goals</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coaching</label>
                  <input
                    type="text"
                    value={practiceGoals.coaching}
                    onChange={(e) => setPracticeGoals({...practiceGoals, coaching: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fun, Basic Skills, Get em Going"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offensive</label>
                  <input
                    type="text"
                    value={practiceGoals.offensive}
                    onChange={(e) => setPracticeGoals({...practiceGoals, offensive: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Spacing and Passing When Pressured"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Defensive</label>
                  <input
                    type="text"
                    value={practiceGoals.defensive}
                    onChange={(e) => setPracticeGoals({...practiceGoals, defensive: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Run With - Contact"
                  />
                </div>
              </div>
            </div>

            {/* Practice Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Practice Schedule</h2>
                <div className="text-sm text-gray-600">
                  Total: {totalDuration} / {practiceInfo.duration} min
                </div>
              </div>

              {/* Practice Timeline */}
              <div className="mb-6">
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min((totalDuration / practiceInfo.duration) * 100, 100)}%` }}
                  />
                </div>
                {totalDuration > practiceInfo.duration && (
                  <p className="text-red-500 text-sm mt-1">Practice is {totalDuration - practiceInfo.duration} minutes over!</p>
                )}
              </div>

              {/* Add Setup Time */}
              <button
                onClick={() => {
                  const setupDrill = {
                    id: 'setup',
                    title: 'Setup',
                    category: 'Admin',
                    duration_minutes: 15,
                    practiceId: Date.now(),
                    customDuration: 15
                  }
                  setPracticeDrills([setupDrill, ...practiceDrills])
                }}
                className="w-full mb-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
              >
                + Add Setup Time
              </button>

              {/* Drill List */}
              <div className="space-y-3">
                {practiceDrills.map((drill, index) => {
                  const startTime = new Date(`2000-01-01 ${practiceInfo.startTime}`)
                  const drillStartMinutes = practiceDrills.slice(0, index).reduce((sum, d) => sum + d.customDuration, 0)
                  startTime.setMinutes(startTime.getMinutes() + drillStartMinutes)
                  const drillEndTime = new Date(startTime)
                  drillEndTime.setMinutes(drillEndTime.getMinutes() + drill.customDuration)

                  return (
                    <div key={drill.practiceId} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-600">
                              {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm font-medium text-gray-600">
                              {drillEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
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
                          <h4 className="font-semibold text-blue-600">{drill.title}</h4>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[drill.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {drill.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveDrill(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveDrill(index, 'down')}
                            disabled={index === practiceDrills.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingDrill(drill)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeDrillFromPractice(drill.practiceId)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {drill.notes && (
                        <p className="text-sm text-gray-600 mt-2">{drill.notes}</p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add Drills Button */}
              <button
                onClick={() => setShowDrillModal(true)}
                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Add Drills to Plan
              </button>
            </div>
          </div>

          {/* Right Column - Drill Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Drill Library</h2>
              
              {/* Search */}
              <div className="relative mb-4">
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

              {/* Category Filters */}
              <div className="mb-4">
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

              {/* Drill List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-center text-gray-500 py-4">Loading drills...</p>
                ) : filteredDrills.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No drills found</p>
                ) : (
                  filteredDrills.map(drill => (
                    <div
                      key={drill.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => addDrillToPractice(drill)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{drill.title}</h4>
                        <button className="text-blue-600 hover:text-blue-800">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          categoryColors[drill.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {drill.category}
                        </span>
                        <span className="text-xs text-gray-500">{drill.duration_minutes} min</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drill Selection Modal */}
      {showDrillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Select Drills to Add</h2>
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
              {/* Search and Filters */}
              <div className="mb-4 flex gap-4">
                <div className="relative flex-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredDrills.map(drill => (
                  <div
                    key={drill.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => addDrillToPractice(drill)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-600">{drill.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[drill.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {drill.category}
                          </span>
                          <span className="text-sm text-gray-600">{drill.duration_minutes} min</span>
                        </div>
                      </div>
                      <button className="ml-2 text-blue-600 hover:text-blue-800">
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
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Edit Drill: {editingDrill.title}</h3>
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