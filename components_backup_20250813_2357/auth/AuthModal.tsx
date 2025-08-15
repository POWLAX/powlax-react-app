'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  returnUrl?: string
}

type ModalState = 'initial' | 'loading' | 'success' | 'error'

export default function AuthModal({ open, onClose, returnUrl }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<ModalState>('initial')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setState('initial')
      setErrorMessage('')
      setSuccessMessage('')
    }
  }, [open])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEsc)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email address')
      return
    }

    setState('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          create_if_not_exists: true 
        }),
      })

      const result = await response.json()

      if (result.success) {
        setState('success')
        setSuccessMessage(result.message)
        
        // Start polling for successful authentication
        startAuthPolling()
      } else {
        setState('error')
        setErrorMessage(result.error || 'Failed to send magic link')
      }
    } catch (error) {
      setState('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  const startAuthPolling = () => {
    // Poll for authentication success every 2 seconds for up to 5 minutes
    let attempts = 0
    const maxAttempts = 150 // 5 minutes
    
    const pollInterval = setInterval(async () => {
      attempts++
      
      if (attempts > maxAttempts) {
        clearInterval(pollInterval)
        return
      }

      try {
        // Check if user is now authenticated
        const authResponse = await fetch('/api/auth/check-session', {
          method: 'GET',
          credentials: 'include'
        })

        if (authResponse.ok) {
          const { authenticated } = await authResponse.json()
          
          if (authenticated) {
            clearInterval(pollInterval)
            // Refresh auth state and close modal
            window.location.reload()
          }
        }
      } catch (error) {
        // Silent polling error - continue trying
      }
    }, 2000)

    // Clean up polling if modal is closed
    const cleanup = () => {
      clearInterval(pollInterval)
    }
    
    return cleanup
  }

  const handleRetry = () => {
    setState('initial')
    setEmail('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleModalClick = (e: React.MouseEvent) => {
    // Close modal when clicking on backdrop
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleModalClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/powlax-logo-icon.webp"
              alt="POWLAX"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-500">Access your POWLAX account</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {state === 'initial' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Enter your email to receive a secure magic link for instant access.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white border-2 border-navy-600 placeholder:text-gray-400 focus:border-navy-700 focus:ring-navy-600"
                  style={{ borderColor: '#003366' }}
                  autoFocus
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                style={{ backgroundColor: '#4A90E2' }}
              >
                <Mail className="mr-2 h-4 w-4 text-white" />
                <span className="text-white">Send Magic Link</span>
              </Button>

              <div className="text-center text-xs text-gray-500">
                We'll send you a secure link to sign in instantly
              </div>
            </form>
          )}

          {state === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sending Magic Link
              </h3>
              <p className="text-gray-600">
                Please wait while we send your secure login link...
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Check Your Email!
              </h3>
              <p className="text-gray-600 mb-6">
                We've sent a secure login link to <strong>{email}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Next steps:</strong>
                  <br />1. Check your email inbox (and spam folder)
                  <br />2. Click the magic link to sign in
                  <br />3. You'll be automatically redirected back here
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  Send Another Link
                </Button>
                <Button onClick={onClose} variant="ghost" className="w-full">
                  Close
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Waiting for authentication... This modal will close automatically once you click the link.
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="ghost" className="w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}