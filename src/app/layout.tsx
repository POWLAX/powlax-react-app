import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { JWTAuthProvider } from '@/contexts/JWTAuthContext'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'POWLAX - Practice Optimization for Winning Lacrosse',
  description: 'Transform youth lacrosse with structured practice planning and skills development',
  manifest: '/manifest.json',
  themeColor: '#003366',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'POWLAX',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <OnboardingProvider>
            <QueryProvider>
              <JWTAuthProvider>
                {children}
                <Toaster position="top-right" />
              </JWTAuthProvider>
            </QueryProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}