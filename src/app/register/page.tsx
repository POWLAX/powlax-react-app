import { Suspense } from 'react'
import { TeamRegistrationPage } from './TeamRegistrationPage'
import { InvitationRegistrationPage } from './InvitationRegistrationPage'

export default function RegisterPage({
  searchParams
}: {
  searchParams: { code?: string; invite?: string }
}) {
  // Determine which registration flow to show
  if (searchParams.invite) {
    return (
      <Suspense fallback={<LoadingState />}>
        <InvitationRegistrationPage inviteCode={searchParams.invite} />
      </Suspense>
    )
  }

  if (searchParams.code) {
    return (
      <Suspense fallback={<LoadingState />}>
        <TeamRegistrationPage registrationCode={searchParams.code} />
      </Suspense>
    )
  }

  // No code or invitation provided
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Registration Link Required
        </h1>
        <p className="text-gray-600">
          Please use the registration link or QR code provided by your team coach.
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading registration...</p>
      </div>
    </div>
  )
}