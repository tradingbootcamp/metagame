import { z } from 'zod'

import { DbProfileUpdate } from '@/types/database/dbTypeAliases'

const nullableTextFromForm = z
  .string()
  .trim()
  .or(z.literal(''))
  .transform((v) => (v === '' ? null : v))
  .nullable()
export const profileFormSchema = z.object({
  first_name: nullableTextFromForm,
  last_name: nullableTextFromForm,
  pronouns: nullableTextFromForm,
  discord_handle: nullableTextFromForm,
  site_name: nullableTextFromForm,
  site_url: nullableTextFromForm,
  site_name_2: nullableTextFromForm,
  site_url_2: nullableTextFromForm,
  opted_in_to_homepage_display: z.boolean().nullable(),
  minor: z.boolean().nullable(),
  bringing_kids: z.boolean().nullable(),
  bio: nullableTextFromForm,
}) satisfies z.ZodType<DbProfileUpdate>

export type ProfileFormData = z.infer<typeof profileFormSchema>

/**
 * The complete set of profile columns a user may write to their *own* profile.
 * Anything outside this list (is_admin, team, checked_in, player_id, email,
 * volunteer, homepage_order, celestial_card_id) is stripped server-side, so a new
 * self-service field must be added here as well as to the form schema above.
 */
export const selfEditableProfileSchema = profileFormSchema
  .extend({
    // Written outside the form: picture upload and the "stop prompting me" button.
    profile_pictures_url: z.string().nullable(),
    dismissed_info_request: z.boolean(),
  })
  .partial()

/** Shape accepted by `updateCurrentUserProfile` (pre-parse). */
export type SelfEditableProfileData = z.input<typeof selfEditableProfileSchema>

export const initialProfileFormData: ProfileFormData = {
  first_name: '',
  last_name: '',
  pronouns: '',
  discord_handle: '',
  site_name: '',
  site_url: '',
  site_name_2: '',
  site_url_2: '',
  opted_in_to_homepage_display: null,
  minor: null,
  bringing_kids: null,
  bio: '',
}
