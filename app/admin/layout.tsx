import { redirectHomeIfNotAdmin } from '@/utils/security'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await redirectHomeIfNotAdmin()
  return <div>{children}</div>
}
