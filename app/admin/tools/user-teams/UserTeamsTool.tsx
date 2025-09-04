import UserTeamsClient from './UserTeamsClient'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import { adminGetAllFullProfiles } from '@/app/actions/db/users'

export default async function UserTeamsTool({}: {
  searchParams?: Promise<Record<string, string | undefined>>
} = {}) {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['profiles'],
    queryFn: adminGetAllFullProfiles,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserTeamsClient />
    </HydrationBoundary>
  )
}
