'use client'

import React, { useState } from 'react'
import { FormField } from './FormField'
import { Button } from '@/components/ui/button'

interface RegistrationFormProps {
  role: 'player' | 'parent' | 'coach' | null
  teamName: string
  ageGroup?: string
  onSubmit: (data: RegistrationData) => Promise<void>
  prefilledData?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

export interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  role: 'player' | 'parent' | 'coach'
  parentEmail?: string
}

export function RegistrationForm({
  role,
  teamName,
  ageGroup,
  onSubmit,
  prefilledData
}: RegistrationFormProps) {
  const [firstName, setFirstName] = useState(prefilledData?.firstName ?? '')
  const [lastName, setLastName] = useState(prefilledData?.lastName ?? '')
  const [email, setEmail] = useState(prefilledData?.email ?? '')
  const [parentEmail, setParentEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!(email?.includes('@') ?? false)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!role) {
      newErrors.role = 'Please select a role'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !role) return

    setIsLoading(true)
    try {
      await onSubmit({
        firstName,
        lastName,
        email,
        role,
        parentEmail: parentEmail || undefined
      })
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({
        submit: 'Registration failed. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const showParentEmailField = 
    role === 'player' && 
    ageGroup && 
    (ageGroup.includes('U12') || ageGroup.includes('U10') || ageGroup.includes('U8'))

  if (!role) {
    return (
      <div className="text-center py-4 text-gray-600">
        Please select your role above to continue
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="First Name"
        type="text"
        value={firstName}
        onChange={setFirstName}
        required
        error={errors.firstName}
        disabled={isLoading}
      />

      <FormField
        label="Last Name"
        type="text"
        value={lastName}
        onChange={setLastName}
        required
        error={errors.lastName}
        disabled={isLoading}
      />

      <FormField
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        required
        error={errors.email}
        disabled={isLoading}
      />

      {showParentEmailField && (
        <FormField
          label="Parent/Guardian Email"
          type="email"
          value={parentEmail}
          onChange={setParentEmail}
          placeholder="Optional - can be added later"
          disabled={isLoading}
        />
      )}

      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {errors.submit}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? 'Joining...' : `Join ${teamName}`}
      </Button>
    </form>
  )
}