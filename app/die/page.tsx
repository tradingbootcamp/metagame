import type { Metadata } from 'next'

import { DieTest } from '@/components/Die/DieTest'

export const metadata: Metadata = {
  title: 'Die Builder',
  description: 'Build and download a custom Metagame die',
}

export default function DiePage() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] w-full items-center justify-center p-6">
      <DieTest />
    </main>
  )
}
