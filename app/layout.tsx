import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { SimpleAuthProvider } from '@/lib/auth/simple-auth-context'

export const metadata: Metadata = {
  title: 'CapitalLab - Advanced Capital Markets Education Platform',
  description: 'Comprehensive trading simulation and capital markets education platform with individual, team, and institutional learning modes.',
  keywords: 'trading, simulation, education, capital markets, finance, investment, portfolio management',
  authors: [{ name: 'CapitalLab Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'CapitalLab - Capital Markets Education Platform',
    description: 'Learn trading and capital markets through comprehensive simulation and gamification.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CapitalLab - Capital Markets Education Platform',
    description: 'Learn trading and capital markets through comprehensive simulation and gamification.',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <SimpleAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background">
              {children}
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </ThemeProvider>
        </SimpleAuthProvider>
      </body>
    </html>
  )
}