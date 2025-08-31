import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Jura } from 'next/font/google'
import { Toaster } from 'sonner'

import { prefetchState } from '@/lib/prefetch'

import Footer from '@/components/Footer'
import { KbarApp } from '@/components/Kbar/App'
import Nav from '@/components/Nav'

import '@/app/globals.css'
import QueryProvider from '@/app/providers/QueryProvider'

const jura = Jura({
  subsets: ['latin'],
  variable: '--font-jura',
})

export const metadata: Metadata = {
  title: {
    default: 'METAGAME 2025',
    template: '%s | METAGAME 2025',
  },
  description: 'A conference for game design, strategy, narrative, and play',
  keywords: [
    'game design',
    'conference',
    'strategy',
    'narrative',
    'play',
    'metagame',
    '2025',
  ],
  authors: [{ name: 'Arbor Team' }],
  creator: 'Arbor',
  publisher: 'Arbor',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://metagame.games',
    siteName: 'METAGAME 2025',
    title: 'METAGAME 2025',
    description: 'A conference for game design, strategy, narrative, and play',
    images: [
      {
        url: 'https://metagame.games/images/proset_poster.png',
        width: 1200,
        height: 630,
        alt: 'METAGAME 2025',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tradegal_',
    creator: '@tradegal_',
    title: 'METAGAME 2025',
    description: 'A conference for game design, strategy, narrative, and play',
    images: ['https://metagame.games/images/proset_poster.png'],
  },
  icons: {
    icon: '/logo.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const prefetchedState = await prefetchState()

  return (
    <html
      lang="en"
      className="bg-bg-primary text-text-primary"
      data-theme="synthwave"
    >
      <body
        className={`${jura.variable} relative flex min-h-screen flex-col overflow-x-hidden font-sans antialiased`}
      >
        <QueryProvider state={prefetchedState}>
          <KbarApp>
            <Nav />
            <div className="relative flex-grow overflow-x-hidden pt-[72px]">
              {children}
            </div>
            <Footer />
          </KbarApp>
        </QueryProvider>
        <Toaster richColors closeButton />
        <Analytics />
      </body>
    </html>
  )
}
