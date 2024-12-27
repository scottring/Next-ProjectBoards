import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MainNav } from "@/components/layout/main-nav"
import { UserNav } from "@/components/layout/user-nav"
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Builder',
  description: 'A modern project planning tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center">
                <div className="flex items-center space-x-4">
                  <span className="font-bold">ProjectBuilder</span>
                  <MainNav />
                </div>
                <div className="ml-auto flex items-center space-x-4">
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="container py-8">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
} 