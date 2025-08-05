import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { JWTAuthProvider } from '@/contexts/JWTAuthContext'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'POWLAX - Practice Optimization for Winning Lacrosse',
  description: 'Transform youth lacrosse with structured practice planning and skills development',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <JWTAuthProvider>
            {children}
            <Toaster position="top-right" />
          </JWTAuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}