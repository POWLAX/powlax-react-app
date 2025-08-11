'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { QueryProvider } from '@/providers/query-provider'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
import { ToasterProvider } from '@/components/providers/ToasterProvider'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <QueryProvider>
          <SupabaseAuthProvider>
            {children}
            <ToasterProvider />
          </SupabaseAuthProvider>
        </QueryProvider>
      </OnboardingProvider>
    </ThemeProvider>
  )
}
