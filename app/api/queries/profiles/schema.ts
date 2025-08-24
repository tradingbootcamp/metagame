import { z } from 'zod'

import { TEAM_COLORS_ENUM } from '@/utils/dbUtils'

import { DbProfile } from '@/types/database/dbTypeAliases'

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  discord_handle: z.string().nullable(),
  site_name: z.string().nullable(),
  site_url: z.string().nullable(),
  site_name_2: z.string().nullable(),
  site_url_2: z.string().nullable(),
  profile_pictures_url: z.string().nullable(),
  homepage_order: z.number().nullable(),
  opted_in_to_homepage_display: z.boolean().nullable(),
  dismissed_info_request: z.boolean(),
  is_admin: z.boolean(),
  minor: z.boolean().nullable(),
  bringing_kids: z.boolean().nullable(),
  team: z.enum(TEAM_COLORS_ENUM),
}) satisfies z.ZodType<DbProfile>

export const ProfilesResponseSchema = z.array(ProfileSchema)

export type ProfileResponse = z.infer<typeof ProfileSchema>
export type ProfilesResponse = z.infer<typeof ProfilesResponseSchema>
