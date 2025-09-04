'use client'

import { useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/client'

import { useUser } from '@/hooks/useUser'

const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(8, 'Please enter a password'),
})

type LoginErrors = Partial<
  Record<keyof z.infer<typeof loginSchema>, string>
> & {
  submit?: string
}

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useUser()

  useEffect(() => {
    if (currentUser) {
      router.push('/')
    }
  }, [currentUser, router])
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when user starts typing
    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const validatedData = loginSchema.safeParse(formData)
      if (!validatedData.success) {
        setErrors({ submit: 'Invalid email or password' })
        return
      }
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.data.email,
        password: validatedData.data.password,
      })

      if (error) {
        if (error.code === 'email_not_confirmed') {
          setErrors({
            submit:
              'Email not confirmed. Please check your email for a confirmation link.',
          })
          return
        }
        setErrors({ submit: error.message })
      } else {
        // Invalidate user queries to refresh authentication state
        await queryClient.invalidateQueries({ queryKey: ['users'] })
        router.push('/profile')
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Log In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 font-medium">
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

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 font-medium">
              Password: <span className="text-red-500">*</span>
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
            {errors.password && (
              <span className="mt-1 text-xs text-red-500">
                {errors.password}
              </span>
            )}
          </div>

          {errors.submit && (
            <div className="text-center text-sm text-red-500">
              {errors.submit}
            </div>
          )}

          <div className="mt-4 text-center">
            <Link
              href="/login/reset"
              className="text-sm text-blue-400 underline hover:text-blue-300"
            >
              Forgot/reset password
            </Link>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
            <Link
              href="/signup"
              className="flex flex-1 flex-col items-center justify-center rounded bg-green-600 px-4 py-2 text-center text-white transition-colors hover:bg-green-700"
            >
              <span>Sign up</span>
              <span className="text-xs text-gray-200">(using ticket code)</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
