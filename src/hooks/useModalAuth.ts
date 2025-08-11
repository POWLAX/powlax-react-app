'use client'

import { useState, useCallback, useEffect } from 'react'

interface ModalAuthState {
  isOpen: boolean
  returnUrl?: string
  requestCount: number
}

/**
 * Hook for managing modal authentication state
 * Used to show/hide the auth modal and track return URLs
 */
export function useModalAuth() {
  const [state, setState] = useState<ModalAuthState>({
    isOpen: false,
    returnUrl: undefined,
    requestCount: 0
  })

  // Show the auth modal
  const showAuthModal = useCallback((returnUrl?: string) => {
    // Capture current URL if no returnUrl provided
    const targetUrl = returnUrl || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined)
    
    setState(prev => ({
      isOpen: true,
      returnUrl: targetUrl,
      requestCount: prev.requestCount + 1
    }))

    // Log modal request for debugging
    console.log('[useModalAuth] Showing modal:', { returnUrl: targetUrl })
  }, [])

  // Hide the auth modal
  const hideAuthModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }))

    console.log('[useModalAuth] Hiding modal')
  }, [])

  // Request authentication with optional return URL
  const requestAuth = useCallback((returnUrl?: string) => {
    showAuthModal(returnUrl)
  }, [showAuthModal])

  // Clear the return URL (used after successful auth)
  const clearReturnUrl = useCallback(() => {
    setState(prev => ({
      ...prev,
      returnUrl: undefined
    }))
  }, [])

  // Handle successful authentication
  const handleAuthSuccess = useCallback(() => {
    const currentReturnUrl = state.returnUrl
    
    // Hide modal first
    hideAuthModal()
    
    // Navigate to return URL if specified and different from current
    if (currentReturnUrl && typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search
      
      if (currentReturnUrl !== currentPath) {
        console.log('[useModalAuth] Redirecting to:', currentReturnUrl)
        // Use router.push in real implementation, or window.location for immediate effect
        window.location.href = currentReturnUrl
      }
    }
    
    // Clear return URL
    clearReturnUrl()
  }, [state.returnUrl, hideAuthModal, clearReturnUrl])

  // Auto-hide modal on successful authentication
  useEffect(() => {
    if (!state.isOpen) return

    // Listen for authentication success events
    const handleAuthEvent = (event: CustomEvent) => {
      if (event.detail?.type === 'auth_success') {
        handleAuthSuccess()
      }
    }

    window.addEventListener('auth-success', handleAuthEvent as EventListener)
    
    return () => {
      window.removeEventListener('auth-success', handleAuthEvent as EventListener)
    }
  }, [state.isOpen, handleAuthSuccess])

  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[useModalAuth] State changed:', {
        isOpen: state.isOpen,
        returnUrl: state.returnUrl,
        requestCount: state.requestCount
      })
    }
  }, [state])

  return {
    // State
    isAuthModalOpen: state.isOpen,
    authReturnUrl: state.returnUrl,
    authRequestCount: state.requestCount,
    
    // Actions
    showAuthModal,
    hideAuthModal,
    requestAuth,
    clearReturnUrl,
    handleAuthSuccess,
    
    // Computed
    hasAuthRequest: state.requestCount > 0,
  }
}

/**
 * Utility function to trigger authentication from anywhere in the app
 * Dispatches a custom event that the auth context can listen for
 */
export function triggerAuthModal(returnUrl?: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('request-auth', {
      detail: { returnUrl }
    })
    
    window.dispatchEvent(event)
    
    console.log('[triggerAuthModal] Triggered auth modal request:', { returnUrl })
  }
}

/**
 * Utility function to signal successful authentication
 * Dispatches a custom event that components can listen for
 */
export function signalAuthSuccess() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth-success', {
      detail: { type: 'auth_success' }
    })
    
    window.dispatchEvent(event)
    
    console.log('[signalAuthSuccess] Signaled successful authentication')
  }
}