import { redirectIfNotAuthed } from '@/utils/security'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await redirectIfNotAuthed()
  return <div>{children}</div>
}
