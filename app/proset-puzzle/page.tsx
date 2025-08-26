import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'A Blind Game of Projective Set',
  description:
    'Projective Set puzzle by Eric Neyman - solve for a discount on your Metagame ticket',
}

export default function ProsetPuzzlePage() {
  return (
    <>
      {/* Override the global animated background for a clean page */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          html::before {
            display: none !important;
          }
          body {
            background: #010020 !important;
          }
        `,
        }}
      />
      <main className="flex w-full flex-col items-center justify-center p-6">
        <div className="max-w-4xl space-y-6 text-center">
          {/* Title */}
          <h1 className="mt-12 mb-4 text-4xl font-bold md:text-5xl">
            A Blind Game of Projective Set
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl text-secondary-500 md:text-3xl">
            By Eric Neyman
          </h2>

          {/* Image */}
          <div className="mb-0 flex justify-center">
            <Image
              src="/images/proset-puzzle.png"
              alt="Projective Set Puzzle"
              width={600}
              height={600}
              className="h-auto max-w-full rounded-lg shadow-lg"
              priority
            />
          </div>

          {/* Text */}
          <p className="mt-6 mb-12 text-lg font-medium text-gray-200 italic md:text-xl">
            Enter the 5-letter solution at checkout for $100 off your ticket
            price
          </p>
        </div>
      </main>
    </>
  )
}
