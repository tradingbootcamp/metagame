import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'

export default function ResetPasswordSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-dark-400 p-8 text-center shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="mb-2 rounded-full bg-green-600 p-3">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Password Changed!</h1>
          <p className="mb-4 text-lg text-gray-300">
            Your password has been updated successfully.
          </p>
          <div className="flex gap-4">
            <Link
              href="/profile"
              className={buttonVariants({ variant: 'outline' })}
            >
              Go to Profile
            </Link>
            <Link href="/" className={buttonVariants({ variant: 'outline' })}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
