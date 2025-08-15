import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get value from localStorage on initial load
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// Specialized hooks for different data types
export function useLocalDrills() {
  return useLocalStorage('powlax-saved-drills', [])
}

export function useLocalStrategies() {
  return useLocalStorage('powlax-saved-strategies', [])
}

export function useLocalPracticePlans() {
  return useLocalStorage('powlax-saved-practice-plans', [])
}

// Helper functions for managing local data
export const localStorageHelpers = {
  // Drills
  saveDrill: (drill: any) => {
    const existingDrills = JSON.parse(localStorage.getItem('powlax-saved-drills') || '[]')
    const updatedDrills = [...existingDrills, { ...drill, id: Date.now(), savedAt: new Date().toISOString() }]
    localStorage.setItem('powlax-saved-drills', JSON.stringify(updatedDrills))
    return updatedDrills
  },
  
  removeDrill: (drillId: number) => {
    const existingDrills = JSON.parse(localStorage.getItem('powlax-saved-drills') || '[]')
    const updatedDrills = existingDrills.filter((drill: any) => drill.id !== drillId)
    localStorage.setItem('powlax-saved-drills', JSON.stringify(updatedDrills))
    return updatedDrills
  },
  
  // Strategies
  saveStrategy: (strategy: any) => {
    const existingStrategies = JSON.parse(localStorage.getItem('powlax-saved-strategies') || '[]')
    const updatedStrategies = [...existingStrategies, { ...strategy, id: Date.now(), savedAt: new Date().toISOString() }]
    localStorage.setItem('powlax-saved-strategies', JSON.stringify(updatedStrategies))
    return updatedStrategies
  },
  
  removeStrategy: (strategyId: number) => {
    const existingStrategies = JSON.parse(localStorage.getItem('powlax-saved-strategies') || '[]')
    const updatedStrategies = existingStrategies.filter((strategy: any) => strategy.id !== strategyId)
    localStorage.setItem('powlax-saved-strategies', JSON.stringify(updatedStrategies))
    return updatedStrategies
  },
  
  // Practice Plans
  savePracticePlan: (plan: any) => {
    const existingPlans = JSON.parse(localStorage.getItem('powlax-saved-practice-plans') || '[]')
    const updatedPlans = [...existingPlans, { ...plan, id: Date.now(), savedAt: new Date().toISOString() }]
    localStorage.setItem('powlax-saved-practice-plans', JSON.stringify(updatedPlans))
    return updatedPlans
  },
  
  removePracticePlan: (planId: number) => {
    const existingPlans = JSON.parse(localStorage.getItem('powlax-saved-practice-plans') || '[]')
    const updatedPlans = existingPlans.filter((plan: any) => plan.id !== planId)
    localStorage.setItem('powlax-saved-practice-plans', JSON.stringify(updatedPlans))
    return updatedPlans
  },
  
  // Get all saved data
  getAllSavedData: () => {
    return {
      drills: JSON.parse(localStorage.getItem('powlax-saved-drills') || '[]'),
      strategies: JSON.parse(localStorage.getItem('powlax-saved-strategies') || '[]'),
      practicePlans: JSON.parse(localStorage.getItem('powlax-saved-practice-plans') || '[]')
    }
  },
  
  // Clear all saved data
  clearAllData: () => {
    localStorage.removeItem('powlax-saved-drills')
    localStorage.removeItem('powlax-saved-strategies')
    localStorage.removeItem('powlax-saved-practice-plans')
  }
}
