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
  discord_handle: nullableTextFromForm,
  site_name: nullableTextFromForm,
  site_url: nullableTextFromForm,
  opted_in_to_homepage_display: z.boolean().nullable(),
  minor: z.boolean().nullable(),
  bringing_kids: z.boolean().nullable(),
  bio: nullableTextFromForm,
}) satisfies z.ZodType<DbProfileUpdate>

export type ProfileFormData = z.infer<typeof profileFormSchema>

export const initialProfileFormData: ProfileFormData = {
  first_name: '',
  last_name: '',
  discord_handle: '',
  site_name: '',
  site_url: '',
  opted_in_to_homepage_display: null,
  minor: null,
  bringing_kids: null,
  bio: '',
}
