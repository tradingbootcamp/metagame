import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Cinzel, IM_Fell_English, Jura } from 'next/font/google'
import { Toaster } from 'sonner'

import { prefetchState } from '@/lib/prefetch'

import Footer from '@/components/Footer'
import { KbarApp } from '@/components/Kbar/App'
import Nav from '@/components/Nav'
import PickACardMetaProvider from '@/components/PickACard/PickACardMetaProvider'

import '@/app/globals.css'
import QueryProvider from '@/app/providers/QueryProvider'

// Variables are named --ff-* rather than --font-* so they don't collide with
// the Tailwind @theme font tokens in globals.css that reference them.
const jura = Jura({
  subsets: ['latin'],
  variable: '--ff-jura',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--ff-cinzel',
})

const imFellEnglish = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--ff-imfell',
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
        url: 'https://metagame.games/images/proset-poster.png',
        width: 2448,
        height: 3168,
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
    images: ['https://metagame.games/images/proset-poster.png'],
  },
  icons: {
    icon: '/dice/die3.svg',
    shortcut: '/dice/die3.svg',
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
      // The font variables must land on <html>, not <body>: globals.css
      // substitutes them into :root font tokens, which only resolves if they
      // are declared on the same element.
      className={`${jura.variable} ${cinzel.variable} ${imFellEnglish.variable} bg-bg-primary text-text-primary`}
      data-theme="synthwave"
    >
      <body className="relative flex min-h-screen flex-col overflow-x-hidden font-sans antialiased">
        <QueryProvider state={prefetchedState}>
          <PickACardMetaProvider />
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
