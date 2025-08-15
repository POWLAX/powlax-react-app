'use client'

import { useState } from 'react'
import { X, Download, Upload, Trash2, Calendar, GraduationCap, Target } from 'lucide-react'
import { useLocalStorageContext } from '@/contexts/LocalStorageContext'
import { toast } from 'sonner'

interface SavedDataModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SavedDataModal({ isOpen, onClose }: SavedDataModalProps) {
  const { 
    savedDrills, 
    savedStrategies, 
    savedPracticePlans,
    localFavorites,
    removeDrill,
    removeStrategy,
    removePracticePlan,
    removeFromLocalFavorites,
    exportData,
    importData,
    clearAllData
  } = useLocalStorageContext()
  
  const [activeTab, setActiveTab] = useState<'drills' | 'strategies' | 'plans' | 'favorites'>('drills')
  const [showImportInput, setShowImportInput] = useState(false)
  const [importText, setImportText] = useState('')

  if (!isOpen) return null

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `powlax-saved-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully!')
  }

  const handleImport = () => {
    try {
      importData(importText)
      setImportText('')
      setShowImportInput(false)
      toast.success('Data imported successfully!')
    } catch (error) {
      toast.error('Invalid JSON data. Please check the format.')
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
      clearAllData()
      toast.success('All saved data cleared!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Saved Data</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            
            {!showImportInput ? (
              <button
                onClick={() => setShowImportInput(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </button>
            ) : (
              <div className="flex gap-2 flex-1">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your exported JSON data here..."
                  className="flex-1 p-2 border rounded-lg text-sm"
                  rows={3}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleImport}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => setShowImportInput(false)}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('drills')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'drills' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Drills ({savedDrills.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('strategies')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'strategies' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Strategies ({savedStrategies.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'plans' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Practice Plans ({savedPracticePlans.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'favorites' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Favorites ({localFavorites.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'drills' && (
            <div className="space-y-4">
              {savedDrills.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved drills yet.</p>
              ) : (
                savedDrills.map((drill: any) => (
                  <div key={drill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{drill.title}</h3>
                      <p className="text-sm text-gray-600">Saved: {formatDate(drill.savedAt)}</p>
                      {drill.description && (
                        <p className="text-sm text-gray-500 mt-1">{drill.description.substring(0, 100)}...</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeDrill(drill.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="space-y-4">
              {savedStrategies.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved strategies yet.</p>
              ) : (
                savedStrategies.map((strategy: any) => (
                  <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{strategy.title}</h3>
                      <p className="text-sm text-gray-600">Saved: {formatDate(strategy.savedAt)}</p>
                      {strategy.description && (
                        <p className="text-sm text-gray-500 mt-1">{strategy.description.substring(0, 100)}...</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeStrategy(strategy.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-4">
              {savedPracticePlans.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved practice plans yet.</p>
              ) : (
                savedPracticePlans.map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{plan.name || 'Untitled Practice Plan'}</h3>
                      <p className="text-sm text-gray-600">Saved: {formatDate(plan.savedAt)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {plan.drills?.length || 0} drills, {plan.strategies?.length || 0} strategies
                      </p>
                    </div>
                    <button
                      onClick={() => removePracticePlan(plan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {localFavorites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No local favorites yet.</p>
              ) : (
                localFavorites.map((favorite: any) => (
                  <div key={favorite.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {favorite.item.title || favorite.item.strategy_name || 'Untitled Item'}
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {favorite.type}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600">Favorited: {formatDate(favorite.savedAt)}</p>
                      {favorite.item.description && (
                        <p className="text-sm text-gray-500 mt-1">{favorite.item.description.substring(0, 100)}...</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromLocalFavorites(favorite.originalId, favorite.type)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
