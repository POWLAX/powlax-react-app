'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { QueryProvider } from '@/providers/query-provider'
import { JWTAuthProvider } from '@/contexts/JWTAuthContext'
import dynamic from 'next/dynamic'

// Load toaster only on the client to avoid vendor-chunk SSR issues
const ToasterProvider = dynamic(
  () => import('@/components/providers/ToasterProvider').then((m) => m.ToasterProvider),
  { ssr: false }
)

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <QueryProvider>
          <JWTAuthProvider>
            {children}
            <ToasterProvider />
          </JWTAuthProvider>
        </QueryProvider>
      </OnboardingProvider>
    </ThemeProvider>
  )
}


