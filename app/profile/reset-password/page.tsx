'use client'

import { useState } from 'react'

import { LockIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { type PasswordErrors, passwordSchema } from '@/lib/schemas/password'

import { createClient } from '@/utils/supabase/client'

import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [nonce, setNonce] = useState<string | null>(null)
  const [reauthNeeded, setReauthNeeded] = useState(false)
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when user starts typing
    if (errors[name as keyof PasswordErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = passwordSchema.parse(formData)
      const supabase = createClient()

      const { data, error } = await supabase.auth.updateUser({
        password: validatedData.password,
        nonce: nonce ?? undefined,
      })
      console.log(`"data": ${JSON.stringify(data)}`)
      console.log(`"error": ${JSON.stringify(error)}`)
      console.log(`"nonce": ${nonce}`)
      if (error) {
        if (
          error.code === 'needs_reauthentication' ||
          error.code === 'reauth_nonce_missing'
        ) {
          setReauthNeeded(true)
          await supabase.auth.reauthenticate()
        } else {
          setErrors({ submit: error.message })
        }
      } else {
        router.push('/profile/reset-password/success')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string | string[]> = {}

        // Group password errors to show all requirements
        const passwordErrors: string[] = []

        error.issues.forEach((issue) => {
          if (issue.path[0] === 'password') {
            passwordErrors.push(issue.message)
          } else if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message
          }
        })

        if (passwordErrors.length > 0) {
          fieldErrors.password = passwordErrors
        }

        setErrors(fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Set Your Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="mb-1 flex items-center gap-1 font-medium"
            >
              <LockIcon className="size-4" /> New Password:{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`rounded border p-2 dark:border-gray-600 dark:bg-gray-700 ${
                errors.password ? 'border-red-500' : ''
              }`}
            />
            <div className="mt-1 text-xs text-gray-500">
              Must be at least 10 characters with uppercase, lowercase, number,
              and symbol
            </div>
            {errors.password && (
              <div className="mt-1 text-xs text-red-500">
                {Array.isArray(errors.password) ? (
                  <ul className="list-inside list-disc">
                    {(errors.password as string[]).map(
                      (error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ),
                    )}
                  </ul>
                ) : (
                  <span>{errors.password}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="confirmPassword"
              className="mb-1 flex items-center gap-1 font-medium"
            >
              <LockIcon className="size-4" /> Confirm Password:{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className={`rounded border p-2 dark:border-gray-600 dark:bg-gray-700 ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
            />
            {errors.confirmPassword && (
              <span className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </span>
            )}
          </div>
          {reauthNeeded && (
            <div className="flex flex-col gap-2">
              <div className="text-center text-sm text-red-400">
                ⚠ You need to reauthenticate to set your password. Enter the
                code sent to your email to continue. ⚠
              </div>
              <Input
                type="text"
                value={nonce || ''}
                onChange={(e) => setNonce(e.target.value)}
                required
                className="w-full"
              />
            </div>
          )}
          {errors.submit && (
            <div className="text-center text-sm text-red-500">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Setting password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
