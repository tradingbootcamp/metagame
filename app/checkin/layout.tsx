'use server'

import { redirectIfNotAuthed } from '@/utils/security'

export default async function CheckinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await redirectIfNotAuthed({ authLevel: 'volunteer' })
  return <>{children}</>
}
