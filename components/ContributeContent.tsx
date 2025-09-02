'use client'

import React, { useEffect } from 'react'

import { SOCIAL_LINKS } from '../utils/urls'
import { Button } from './Button'
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
    <div className="">
      <section
        className="relative flex h-[30vh] flex-col items-center justify-center"
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

      <div className="container mx-auto">
        <div className="lg:prose-xl dark:prose-invert prose max-w-none p-8 font-semibold">
          <h1>Run something</h1>

          <p>
            Some examples of the kind of things that would be very welcome at
            Metagame:
          </p>

          <ul>
            <li>
              <span className="text-primary-300">
                Gradient descent themed escape room
              </span>{' '}
              - We provide the physical space, you design and run the room over
              the course of the conference.
            </li>
            <li>
              <span className="text-primary-300">Game design hackathon</span> -
              We (civilization as a whole) have the pieces for games like{' '}
              <a
                target="_blank"
                href="https://en.wikipedia.org/wiki/Senet"
                rel="noopener noreferrer"
                className="link"
              >
                Senet
              </a>{' '}
              and{' '}
              <a
                target="_blank"
                href="https://en.wikipedia.org/wiki/Ludus_latrunculorum"
                rel="noopener noreferrer"
                className="link"
              >
                Ludus Latrunculorum
              </a>
              , but not the rules. Want to run a hackathon where competitors
              come up with the rule book, and judges play each version and
              choose the best?
            </li>
            <li>
              <span className="text-primary-300">
                Trading-based Survivor variant
              </span>{' '}
              - What if Survivor had live markets, with trading based rounds
              between tribal councils?
            </li>
          </ul>

          <p>
            The easiest way to get involved is to{' '}
            <a
              target="_blank"
              href={SOCIAL_LINKS.DISCORD}
              rel="noopener noreferrer"
              className="link"
            >
              join the Discord
            </a>
            .
          </p>

          <h2>The Megagame</h2>
          <p>
            Upon arrival, Players will be split into two teams as part of a
            conference-long Megagame. If you have a format for a
            contest/game/tournament, consider running it as part of the
            Megagame. Many more details to follow.
          </p>

          <h2>The Website</h2>
          <p>
            That&apos;s the thing you&apos;re looking at right now. There are
            games hidden all over, with coupon codes attached in many cases. You
            can add your own games, coupons, and easter eggs{' '}
            <a
              target="_blank"
              href="https://github.com/RickiHeicklen/metagame"
              rel="noopener noreferrer"
              className="link"
            >
              here
            </a>
            .
          </p>

          <div className="flex items-center justify-center p-8">
            <Button
              background="bg-cyan-500"
              link={SOCIAL_LINKS.DISCORD}
              target="_blank"
            >
              Get Involved
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
