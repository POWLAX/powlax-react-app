'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isOnline: boolean
  registration: ServiceWorkerRegistration | null
  updateAvailable: boolean
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    registration: null,
    updateAvailable: false
  })

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setState(prev => ({ ...prev, isSupported: true }))
      registerServiceWorker()
    }

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online status
    setState(prev => ({ ...prev, isOnline: navigator.onLine }))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log('POWLAX: Service Worker registered successfully:', registration.scope)

      setState(prev => ({ 
        ...prev, 
        isRegistered: true, 
        registration 
      }))

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('POWLAX: New service worker available')
              setState(prev => ({ ...prev, updateAvailable: true }))
            }
          })
        }
      })

      // Check for existing updates
      if (registration.waiting) {
        setState(prev => ({ ...prev, updateAvailable: true }))
      }

    } catch (error) {
      console.error('POWLAX: Service Worker registration failed:', error)
    }
  }

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const cachePracticeData = async (practiceData: any) => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('powlax-practice-data')
        const response = new Response(JSON.stringify(practiceData), {
          headers: { 'Content-Type': 'application/json' }
        })
        await cache.put(`/practice-${practiceData.id}`, response)
        console.log('POWLAX: Practice data cached for offline use')
      }
    } catch (error) {
      console.error('POWLAX: Failed to cache practice data:', error)
    }
  }

  const getCachedPracticeData = async (practiceId: string) => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('powlax-practice-data')
        const response = await cache.match(`/practice-${practiceId}`)
        if (response) {
          return await response.json()
        }
      }
    } catch (error) {
      console.error('POWLAX: Failed to get cached practice data:', error)
    }
    return null
  }

  const savePendingData = async (data: any) => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('powlax-pending-data')
        const response = new Response(JSON.stringify({
          ...data,
          timestamp: Date.now()
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
        await cache.put(`/pending-practice-${data.id}`, response)
        
        // Register for background sync when online
        if ('serviceWorker' in navigator && state.registration) {
          await state.registration.sync.register('powlax-sync')
        }
        
        console.log('POWLAX: Data saved for sync when online')
      }
    } catch (error) {
      console.error('POWLAX: Failed to save pending data:', error)
    }
  }

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames
            .filter(name => name.startsWith('powlax-'))
            .map(name => caches.delete(name))
        )
        console.log('POWLAX: Cache cleared')
      }
    } catch (error) {
      console.error('POWLAX: Failed to clear cache:', error)
    }
  }

  return {
    ...state,
    updateServiceWorker,
    cachePracticeData,
    getCachedPracticeData,
    savePendingData,
    clearCache
  }
}