'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface LocalStorageContextType {
  // Drills
  savedDrills: any[]
  saveDrill: (drill: any) => void
  removeDrill: (drillId: number) => void
  
  // Strategies
  savedStrategies: any[]
  saveStrategy: (strategy: any) => void
  removeStrategy: (strategyId: number) => void
  
  // Practice Plans
  savedPracticePlans: any[]
  savePracticePlan: (plan: any) => void
  removePracticePlan: (planId: number) => void
  
  // Favorites
  localFavorites: any[]
  addToLocalFavorites: (item: any, type: 'drill' | 'strategy') => void
  removeFromLocalFavorites: (itemId: string | number, type: 'drill' | 'strategy') => void
  isLocalFavorite: (itemId: string | number, type: 'drill' | 'strategy') => boolean
  
  // Utility
  clearAllData: () => void
  exportData: () => string
  importData: (jsonData: string) => void
}

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined)

export function LocalStorageProvider({ children }: { children: React.ReactNode }) {
  const [savedDrills, setSavedDrills] = useLocalStorage('powlax-saved-drills', [])
  const [savedStrategies, setSavedStrategies] = useLocalStorage('powlax-saved-strategies', [])
  const [savedPracticePlans, setSavedPracticePlans] = useLocalStorage('powlax-saved-practice-plans', [])
  const [localFavorites, setLocalFavorites] = useLocalStorage('powlax-local-favorites', [])

  const saveDrill = (drill: any) => {
    const newDrill = {
      ...drill,
      id: Date.now(),
      savedAt: new Date().toISOString(),
      type: 'drill'
    }
    setSavedDrills((prev: any[]) => [...prev, newDrill])
  }

  const removeDrill = (drillId: number) => {
    setSavedDrills((prev: any[]) => prev.filter(drill => drill.id !== drillId))
  }

  const saveStrategy = (strategy: any) => {
    const newStrategy = {
      ...strategy,
      id: Date.now(),
      savedAt: new Date().toISOString(),
      type: 'strategy'
    }
    setSavedStrategies((prev: any[]) => [...prev, newStrategy])
  }

  const removeStrategy = (strategyId: number) => {
    setSavedStrategies((prev: any[]) => prev.filter(strategy => strategy.id !== strategyId))
  }

  const savePracticePlan = (plan: any) => {
    const newPlan = {
      ...plan,
      id: Date.now(),
      savedAt: new Date().toISOString(),
      type: 'practice-plan'
    }
    setSavedPracticePlans((prev: any[]) => [...prev, newPlan])
  }

  const removePracticePlan = (planId: number) => {
    setSavedPracticePlans((prev: any[]) => prev.filter(plan => plan.id !== planId))
  }

  const addToLocalFavorites = (item: any, type: 'drill' | 'strategy') => {
    const favoriteItem = {
      id: `${type}-${item.id}`,
      originalId: item.id,
      type,
      item,
      savedAt: new Date().toISOString()
    }
    setLocalFavorites((prev: any[]) => [...prev.filter((fav: any) => fav.id !== favoriteItem.id), favoriteItem])
  }

  const removeFromLocalFavorites = (itemId: string | number, type: 'drill' | 'strategy') => {
    const favoriteId = `${type}-${itemId}`
    setLocalFavorites((prev: any[]) => prev.filter((fav: any) => fav.id !== favoriteId))
  }

  const isLocalFavorite = (itemId: string | number, type: 'drill' | 'strategy') => {
    const favoriteId = `${type}-${itemId}`
    return localFavorites.some((fav: any) => fav.id === favoriteId)
  }

  const clearAllData = () => {
    setSavedDrills([])
    setSavedStrategies([])
    setSavedPracticePlans([])
    setLocalFavorites([])
  }

  const exportData = () => {
    const data = {
      drills: savedDrills,
      strategies: savedStrategies,
      practicePlans: savedPracticePlans,
      favorites: localFavorites,
      exportedAt: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)
      if (data.drills) setSavedDrills(data.drills)
      if (data.strategies) setSavedStrategies(data.strategies)
      if (data.practicePlans) setSavedPracticePlans(data.practicePlans)
      if (data.favorites) setLocalFavorites(data.favorites)
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Invalid JSON data')
    }
  }

  const value = {
    savedDrills,
    saveDrill,
    removeDrill,
    savedStrategies,
    saveStrategy,
    removeStrategy,
    savedPracticePlans,
    savePracticePlan,
    removePracticePlan,
    localFavorites,
    addToLocalFavorites,
    removeFromLocalFavorites,
    isLocalFavorite,
    clearAllData,
    exportData,
    importData
  }

  return (
    <LocalStorageContext.Provider value={value}>
      {children}
    </LocalStorageContext.Provider>
  )
}

export function useLocalStorageContext() {
  const context = useContext(LocalStorageContext)
  if (context === undefined) {
    throw new Error('useLocalStorageContext must be used within a LocalStorageProvider')
  }
  return context
}
