'use client'

import { Suspense, useEffect, useState } from 'react'

import { InfoIcon, LockIcon, MailIcon, TicketIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import { passwordSchema } from '@/lib/schemas/password'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { signupByTicketCode } from '@/app/actions/db/tickets'

const signupSchema = z.object({
  email: z.email('Please enter a valid email address'),
  ticketCode: z
    .string()
    .min(1, 'Ticket code from purchase confirmation is required for signup')
    .toUpperCase(),
  ...passwordSchema.shape,
})

type SignupFormData = z.infer<typeof signupSchema>
type SignupErrors = Partial<Record<keyof SignupFormData, string | string[]>> & {
  submit?: string
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    ticketCode: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showResetPasswordLink, setShowResetPasswordLink] = useState(false)
  const prefillEmail = searchParams.get('email')
  // Pre-fill form with URL parameters
  useEffect(() => {
    const ticketCode = searchParams.get('ticketCode')

    if (prefillEmail) {
      setFormData((prev) => ({ ...prev, email: prefillEmail }))
    }
    if (ticketCode) {
      setFormData((prev) => ({
        ...prev,
        ticketCode: ticketCode.toUpperCase(),
      }))
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const processedValue = name === 'ticketCode' ? value.toUpperCase() : value

    setFormData((prev) => ({ ...prev, [name]: processedValue }))

    // Clear errors when user starts typing
    if (errors[name as keyof SignupErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = signupSchema.parse(formData)

      const res = await signupByTicketCode({
        email: validatedData.email,
        password: validatedData.password,
        ticketCode: validatedData.ticketCode,
      })
      if (res.error === 'claimed') {
        setErrors({ submit: 'Ticket already assigned' })
        setShowResetPasswordLink(true)
        return
      }
      if (res.error === 'rate_limit') {
        setErrors({
          submit:
            "Rate limit problem; try again in a bit (it's not you, it's us)",
        })
        return
      }

      router.push(`/signup/success?email=${validatedData.email}`)
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
      } else if (error instanceof Error) {
        setErrors({ submit: error.message })
      } else {
        setErrors({ submit: 'An unexpected error occurred' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Create Your Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <div className="flex w-full justify-between">
              <label
                htmlFor="email"
                className="mb-1 flex items-center gap-1 font-medium"
              >
                <MailIcon className="size-4" /> Email:{' '}
                <span className="text-red-500">*</span>
              </label>
              <Tooltip clickable>
                <TooltipTrigger>
                  <InfoIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This will be the email address the ticket is associated to
                    for account and event access purposes. It can be different
                    from the email address used to purchase the ticket{' '}
                    {!!prefillEmail
                      ? `(which was prefilled from the link in your purchase confirmation email)`
                      : ''}
                    .
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
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

          <div className="flex flex-col">
            <div className="flex w-full justify-between">
              <label
                htmlFor="ticketCode"
                className="mb-1 flex items-center gap-1 font-medium"
              >
                <TicketIcon className="size-4" /> Ticket Code:{' '}
                <span className="text-red-500">*</span>
              </label>
              <Tooltip clickable>
                <TooltipTrigger>
                  <InfoIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Enter the code that was sent with your ticket purchase
                    confirmation email. If you didn&apos;t get one, but believe
                    you should be able to make an account,{' '}
                    <a
                      href="mailto:team@metagame.games"
                      className="font-bold underline"
                    >
                      contact us
                    </a>{' '}
                    for assisstance.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <input
              id="ticketCode"
              name="ticketCode"
              type="text"
              value={formData.ticketCode}
              onChange={handleInputChange}
              required
              placeholder="Enter your ticket code"
              className={`rounded border p-2 uppercase dark:border-gray-600 dark:bg-gray-700 ${
                errors.ticketCode ? 'border-red-500' : ''
              }`}
            />
            {showResetPasswordLink && (
              <span>
                This ticket code is already tied to an account; if it was issued
                to you, you may need to go to the{' '}
                <Link href="/login/reset" className="text-blue-500 underline">
                  {' '}
                  password reset
                </Link>{' '}
                page to get access to your account.
              </span>
            )}
            {errors.ticketCode && (
              <span className="mt-1 text-xs text-red-500">
                {errors.ticketCode}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="mb-1 flex items-center gap-1 font-medium"
            >
              <LockIcon className="size-4" /> Password:{' '}
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
              Must be at least 12 characters and include a number and a letter
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 shadow-lg">
            <h1 className="mb-6 text-center text-2xl font-bold">
              Create Your Account
            </h1>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
