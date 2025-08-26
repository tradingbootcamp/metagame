import { ProfileDataCollapsible } from './ProfileDataCollapsible'
import { UserSelector } from './UserSelector'
import { CheckIcon, MinusIcon, XIcon } from 'lucide-react'
import Image from 'next/image'

import { profileIsIncomplete } from '@/lib/profiles'

import { Card } from '@/components/Card'

import { adminGetAllTickets } from '@/app/actions/db/tickets'
import { adminGetAllProfiles } from '@/app/actions/db/users'

interface UserProfileToolProps {
  searchParams?: Promise<{ user_id?: string }>
}

export default async function UserProfileTool({
  searchParams,
}: UserProfileToolProps) {
  const profiles = await adminGetAllProfiles()
  const tickets = await adminGetAllTickets()
  const params = searchParams ? await searchParams : {}
  const { user_id } = params
  const selectedProfile = user_id
    ? profiles.find((p) => p.id === user_id)
    : null
  const userTickets = selectedProfile
    ? tickets.filter((t) => t.owner_id === selectedProfile.id)
    : []

  const renderTrueFalseNull = (value: boolean | null) => {
    switch (value) {
      case null:
        return <MinusIcon className="text-gray-500" size={16} />
      case true:
        return <CheckIcon className="text-green-500" size={16} />
      case false:
        return <XIcon className="text-red-500" size={16} />
      default:
        return <MinusIcon className="text-gray-500" size={16} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <UserSelector users={profiles} selectedUserId={user_id} />

        {selectedProfile && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-lg font-semibold">Profile Details</h3>
                <div className="flex gap-2">
                  {selectedProfile.is_admin && (
                    <span className="rounded-md bg-red-100 px-2 py-1 text-xs text-red-800">
                      Admin
                    </span>
                  )}
                  {selectedProfile.minor && (
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800">
                      Minor
                    </span>
                  )}
                  {selectedProfile.bringing_kids && (
                    <span className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
                      Bringing Kids
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                <div>
                  <strong>Name:</strong>
                  <p>
                    {selectedProfile.first_name || ''}{' '}
                    {selectedProfile.last_name || ''}{' '}
                    {!selectedProfile.first_name &&
                      !selectedProfile.last_name &&
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>{selectedProfile.email || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Discord Handle:</strong>
                  <p>{selectedProfile.discord_handle || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Tickets:</strong>
                  <p>{userTickets.length}</p>
                </div>
                <div>
                  <strong>ID:</strong>
                  <p className="font-mono text-sm break-all">
                    {selectedProfile.id}
                  </p>
                </div>
                {selectedProfile.profile_pictures_url && (
                  <div>
                    <strong>Profile Picture:</strong>
                    <Image
                      src={selectedProfile.profile_pictures_url}
                      alt="Profile"
                      className="mt-1 h-16 w-16 rounded-full object-cover"
                      width={64}
                      height={64}
                    />
                  </div>
                )}
              </div>

              {(selectedProfile.site_name || selectedProfile.site_url) && (
                <div>
                  <strong>Website 1:</strong>
                  <div className="flex items-center gap-2">
                    <p>{selectedProfile.site_name || 'Unnamed'}</p>
                    {selectedProfile.site_url && (
                      <a
                        href={selectedProfile.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 underline hover:text-blue-300"
                      >
                        Visit
                      </a>
                    )}
                  </div>
                </div>
              )}

              {(selectedProfile.site_name_2 || selectedProfile.site_url_2) && (
                <div>
                  <strong>Website 2:</strong>
                  <div className="flex items-center gap-2">
                    <p>{selectedProfile.site_name_2 || 'Unnamed'}</p>
                    {selectedProfile.site_url_2 && (
                      <a
                        href={selectedProfile.site_url_2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 underline hover:text-blue-300"
                      >
                        Visit
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                <div>
                  <strong>Status:</strong>
                  <div className="mt-1 flex gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs">Homepage:</span>
                      {renderTrueFalseNull(
                        selectedProfile.opted_in_to_homepage_display,
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">18+:</span>
                      {renderTrueFalseNull(selectedProfile.minor)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">Bringing Kids:</span>
                      {renderTrueFalseNull(selectedProfile.bringing_kids)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
                  <div>
                    <strong>Profile Status:</strong>
                    <div className="mt-1 flex items-center gap-1">
                      {profileIsIncomplete(selectedProfile) ? (
                        <>
                          <span className="text-xs">Incomplete:</span>
                          <span className="text-red-500">✗</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs">Complete:</span>
                          <span className="text-green-500">✓</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <strong>Modal dismissed:</strong>
                    <p>
                      {selectedProfile.dismissed_info_request
                        ? 'Dismissed'
                        : 'Not Dismissed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
