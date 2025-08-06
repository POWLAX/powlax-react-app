import { Suspense } from 'react'
import { RegistrationSuccessContent } from './RegistrationSuccessContent'

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RegistrationSuccessContent />
    </Suspense>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}