import { ProfileFormData } from './schemas/profile'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

export const requiredProfileFields: (keyof ProfileFormData)[] = [
  'first_name',
  'bringing_kids',
  'opted_in_to_homepage_display',
  'minor',
]

export const profileIsIncomplete = (profile: DbFullProfile) => {
  return requiredProfileFields.some((field) => profile[field] === null)
}
