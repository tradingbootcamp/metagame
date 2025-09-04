'use client'

import { Suspense, useState } from 'react'

import { MailIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/client'

const resetSchema = z.object({
  email: z.email('Please enter a valid email'),
})

type ResetErrors = Partial<
  Record<keyof z.infer<typeof resetSchema>, string>
> & {
  submit?: string
}

//Suspense for useSearchParams idk
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordRequestPage />
    </Suspense>
  )
}
function ResetPasswordRequestPage() {
  const searchParams = useSearchParams()
  const initialEmail = (searchParams.get('email') ?? '').trim()
  const firstLogin = searchParams.get('firstLogin') === 'true'
  const [formData, setFormData] = useState({
    email: initialEmail,
  })
  const [errors, setErrors] = useState<ResetErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when user starts typing
    if (errors[name as keyof ResetErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = resetSchema.safeParse(formData)
      if (!validatedData.success) {
        setErrors({ submit: 'Please enter a valid email' })
        return
      }

      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(
        validatedData.data.email,
        {
          redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
        },
      )

      if (error) {
        if (error.code?.includes('rate_limit')) {
          setErrors({
            submit:
              "Rate limit problem; try again in a bit (it's not you, it's us)",
          })
        } else {
          setErrors({ submit: error.message })
        }
      } else {
        setIsSuccess(true)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 text-center shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">Check Your Email</h1>
          <p className="mb-6 text-gray-300">
            We&apos;ve sent a password reset link to {formData.email}. Please
            check your email and click the link to reset your password.
          </p>
          <Link
            href="/login"
            className="text-blue-400 underline hover:text-blue-300"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {firstLogin ? 'Set Password' : 'Reset Password'}
        </h1>
        <p className="mb-6 text-center text-gray-300">
          Enter your email address and we&apos;ll send you a link to{' '}
          {firstLogin ? 'set your password' : 'reset your password'}.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="mb-1 flex items-center gap-1 font-medium"
            >
              <MailIcon className="size-4" />
              Email: <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`rounded border p-2 dark:border-gray-600 dark:bg-gray-700 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <span className="mt-1 text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          {errors.submit && (
            <div className="text-center text-sm text-red-500">
              {errors.submit}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link
              href="/login"
              className="flex-1 rounded bg-gray-600 px-4 py-2 text-center text-white transition-colors hover:bg-gray-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
