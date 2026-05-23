import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import AppShell from '@/components/layout/AppShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LAIF',
  description: 'Your intelligent life manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0E0E12" />
        {/* Prevent theme flash: set data-theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('laif-theme');
              if (t === 'system' || !t) {
                t = window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
              }
              if (['light','dark'].includes(t)) {
                document.documentElement.setAttribute('data-theme', t);
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>
        <Providers>
          <Suspense>
            <AppShell>{children}</AppShell>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
