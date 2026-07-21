import { ProfileFormData } from './schemas/profile'

import { DbFullProfile, DbPublicProfile } from '@/types/database/dbTypeAliases'

/** Public profiles are served to anonymous callers, so drop the fields that are
 * only meant for signed-in attendees. Redacting here rather than in the db
 * projection keeps `is_admin` available to the server-side auth checks in
 * utils/security, which read it off the public profile. */
export const stripPrivateProfileFields = (
  profile: DbPublicProfile,
): DbPublicProfile => {
  const {
    discord_handle: _discord_handle,
    is_admin: _is_admin,
    minor: _minor,
    checked_in: _checked_in,
    ...publicFields
  } = profile
  return publicFields
}

export const requiredProfileFields: (keyof ProfileFormData)[] = [
  'first_name',
  'bringing_kids',
  'opted_in_to_homepage_display',
  'minor',
]

export const profileIsIncomplete = (profile: DbFullProfile) => {
  return requiredProfileFields.some((field) => profile[field] === null)
}
