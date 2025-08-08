'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { QueryProvider } from '@/providers/query-provider'
import { JWTAuthProvider } from '@/contexts/JWTAuthContext'
import { ToasterProvider } from '@/components/providers/ToasterProvider'

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


