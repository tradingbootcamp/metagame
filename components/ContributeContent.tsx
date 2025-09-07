'use client'

import React, { useEffect } from 'react'

import { URLS } from '../utils/urls'
import { Button } from './Button'
import { Separator } from './ui/separator'
import Image from 'next/image'

export default function ContributeContent() {
  useEffect(() => {
    // Audio effect for any coin containers (if they exist)
    const audio = new Audio('/sounds_coin.wav')
    const coinContainers = document.querySelectorAll('.coin-container')

    const handleMouseEnter = () => {
      audio.currentTime = 0
      audio.play().catch(() => {
        // Ignore audio play errors (e.g., no user interaction yet)
      })
    }

    coinContainers.forEach((container) => {
      container.addEventListener('mouseenter', handleMouseEnter)
    })

    return () => {
      coinContainers.forEach((container) => {
        container.removeEventListener('mouseenter', handleMouseEnter)
      })
    }
  }, [])

  return (
    <div>
      <section
        className="relative flex h-64 w-full flex-col items-center justify-center"
        id="hero"
      >
        <Image
          src="/game_pieces_2_cropped.jpg"
          alt="Game pieces"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-500 to-transparent" />
      </section>

      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">Become a Volunteer</h2>
          <p className="mb-6">
            Interested in volunteering at Metagame for a ticket discount? Fill
            out our volunteer application form! The application is open on a
            rolling basis, but earlier submissions have better chances at
            preferred volunteer shifts. We&apos;ll try to respond to all
            volunteers as quickly as possible.
          </p>

          <div className="flex justify-center">
            <Button link={URLS.TICKET_VOLUNTEER}>Volunteer Application</Button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold">
            Run a Booth at the Night Market
          </h2>
          <p className="mb-6">
            The Night Market will be an opportunity to exchange goods and
            services with fellow game aficionados.
          </p>

          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold">Market Sections:</h3>
            <ul className="grid gap-x-4 gap-y-1 md:grid-cols-3">
              <li className="rounded-lg p-4">
                <strong className="mb-2 block">Games and Puzzles</strong>
                <Separator />
                <p>
                  Your indie TTRPG, jigsaw puzzle, 5-dimensional rubik&apos;s
                  cube, or escape room in a box - for sale right here!
                </p>
              </li>
              <li className="rounded-lg p-4">
                <strong className="mb-2 block">Other Physical Stuff</strong>
                <Separator />
                <p>
                  Arts, crafts, foods, books, and take-home items that
                  don&apos;t fit in the &quot;games and puzzles&quot; category
                </p>
              </li>
              <li className="rounded-lg p-4">
                <strong className="mb-2 block">Experiences</strong>
                <Separator />
                <p>
                  Try on a weird VR immersive bodysuit, get your fortune told,
                  have a phenomenological time
                </p>
              </li>
              <li className="rounded-lg p-4">
                <strong className="mb-2 block">Job Market</strong>
                <Separator />
                <p>
                  For those looking to hire, get hired, or promote their company
                  or self. Open for both sides of the job market!
                </p>
              </li>
              <li className="rounded-lg p-4">
                <strong className="mb-2 block">Information Booth</strong>
                <Separator />
                <p>Like a poster session, without the standards</p>
              </li>
              <li className="rounded-lg p-4">
                <strong className="mb-2 block">Black Market</strong>
                <Separator />
                <p>
                  Rights to middle names, tickets to cheat in your next RPG,
                  etc. Black market goods must still be legal!
                </p>
              </li>
              <li className="rounded-lg p-4">
                <strong className="mb-2 block">Other</strong>
                <Separator />
                <p>Booths too weird to fit into any of the categories above!</p>
              </li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button link={URLS.NIGHT_MARKET_BOOTH}>
              Apply for a Vendor Booth
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
