// POWLAX Service Worker for Offline Support
// Version 1.0.1 - Temporarily disabled for debugging

// Skip all service worker functionality temporarily
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', () => {});

/* TEMPORARILY DISABLED - Remove this comment block to re-enable

const CACHE_NAME = 'powlax-v1'
const OFFLINE_URL = '/offline'

// Assets to cache for offline use
const CACHE_URLS = [
  '/',
  '/offline',
  '/practice-planner',
  '/demo/practice-planner',
  '/manifest.json',
  // Static assets
  '/_next/static/css/',
  '/_next/static/js/',
  // Add your favicon and other static assets
]

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log('POWLAX Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('POWLAX Service Worker: Caching essential resources')
        return cache.addAll([
          '/',
          '/offline',
          '/demo/practice-planner'
        ])
      })
      .then(() => {
        console.log('POWLAX Service Worker: Skip waiting')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('POWLAX Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('POWLAX Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('POWLAX Service Worker: Taking control')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return
  }

  // Skip requests to other origins
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('POWLAX Service Worker: Serving from cache:', event.request.url)
          return cachedResponse
        }

        // Try to fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cache successful responses
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            console.log('POWLAX Service Worker: Network failed, checking for fallbacks')
            
            // If this is a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline')
            }

            // For other requests, try to find a similar cached resource
            return caches.match('/')
          })
      })
  )
})

// Background sync for when connection returns
self.addEventListener('sync', event => {
  if (event.tag === 'powlax-sync') {
    console.log('POWLAX Service Worker: Background sync triggered')
    event.waitUntil(syncPracticeData())
  }
})

// Sync practice data when online
async function syncPracticeData() {
  try {
    // Check if we have any pending practice plans to sync
    const pendingData = await getPendingPracticeData()
    
    if (pendingData.length > 0) {
      console.log('POWLAX Service Worker: Syncing pending practice data')
      
      for (const data of pendingData) {
        try {
          await fetch('/api/practice-plans', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          
          // Remove from pending after successful sync
          await removePendingPracticeData(data.id)
        } catch (error) {
          console.error('POWLAX Service Worker: Failed to sync practice data:', error)
        }
      }
    }
  } catch (error) {
    console.error('POWLAX Service Worker: Sync failed:', error)
  }
}

// Helper functions for practice data management
async function getPendingPracticeData() {
  try {
    const cache = await caches.open('powlax-pending-data')
    const keys = await cache.keys()
    const pending = []
    
    for (const key of keys) {
      const response = await cache.match(key)
      if (response) {
        const data = await response.json()
        pending.push(data)
      }
    }
    
    return pending
  } catch (error) {
    console.error('POWLAX Service Worker: Error getting pending data:', error)
    return []
  }
}

async function removePendingPracticeData(id) {
  try {
    const cache = await caches.open('powlax-pending-data')
    await cache.delete(`/pending-practice-${id}`)
  } catch (error) {
    console.error('POWLAX Service Worker: Error removing pending data:', error)
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'New update from POWLAX',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'POWLAX', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})*/ // END OF TEMPORARILY DISABLED BLOCK
