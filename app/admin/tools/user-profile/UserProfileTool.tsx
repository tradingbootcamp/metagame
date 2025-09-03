import AdminProfileEditor from './AdminProfileEditor'
import { ProfileDataCollapsible } from './ProfileDataCollapsible'
import { UserSelector } from './UserSelector'

import { Card } from '@/components/Card'

import { adminGetAllTickets } from '@/app/actions/db/tickets'
import { adminGetAllFullProfiles } from '@/app/actions/db/users'

interface UserProfileToolProps {
  searchParams?: Promise<{ user_id?: string }>
}

export default async function UserProfileTool({
  searchParams,
}: UserProfileToolProps) {
  const profiles = await adminGetAllFullProfiles()
  const tickets = await adminGetAllTickets()
  const params = searchParams ? await searchParams : {}
  const { user_id } = params
  const selectedProfile = user_id
    ? profiles.find((p) => p.id === user_id)
    : null
  const userTickets = selectedProfile
    ? tickets.filter((t) => t.owner_id === selectedProfile.id)
    : []

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <UserSelector users={profiles} selectedUserId={user_id} />

        {selectedProfile && (
          <div className="p-6">
            <AdminProfileEditor
              profile={selectedProfile}
              tickets={userTickets}
            />
          </div>
        )}

        {selectedProfile && (
          <ProfileDataCollapsible
            profile={selectedProfile}
            tickets={userTickets}
          />
        )}

        {!selectedProfile && user_id && (
          <Card className="p-6">
            <p className="text-center text-gray-500">
              User with ID &quot;{user_id}&quot; not found.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
