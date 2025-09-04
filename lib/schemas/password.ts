import { z } from 'zod'

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Za-z]/, 'Must include a letter')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type PasswordFormData = z.infer<typeof passwordSchema>
export type PasswordErrors = Partial<
  Record<keyof PasswordFormData, string | string[]>
> & {
  submit?: string
}
