import { redirectIfNotAuthed } from '@/utils/security'

export default async function CheckinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await redirectIfNotAuthed({ authLevel: 'VOLUNTEER' })
  return (
    <div className="sticky inset-0 size-full bg-bg-primary">{children}</div>
  )
}
