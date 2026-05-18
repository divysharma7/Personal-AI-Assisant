import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import AppShell from '@/components/layout/AppShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="en" data-theme="dark" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent theme flash: set data-theme before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('laif-theme');
              if (t === 'system' || !t) {
                t = window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
              }
              if (['light','dark','blackout'].includes(t)) {
                document.documentElement.setAttribute('data-theme', t);
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
