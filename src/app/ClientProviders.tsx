'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { QueryProvider } from '@/providers/query-provider'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
import { RoleViewerProvider } from '@/contexts/RoleViewerContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { LocalStorageProvider } from '@/contexts/LocalStorageContext'
import { ToasterProvider } from '@/components/providers/ToasterProvider'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <SidebarProvider>
          <LocalStorageProvider>
            <QueryProvider>
              <SupabaseAuthProvider>
                <RoleViewerProvider>
                  {children}
                  <ToasterProvider />
                </RoleViewerProvider>
              </SupabaseAuthProvider>
            </QueryProvider>
          </LocalStorageProvider>
        </SidebarProvider>
      </OnboardingProvider>
    </ThemeProvider>
  )
}
