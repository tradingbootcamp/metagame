'use client'

import React, { useEffect } from 'react'

import { Button } from '../../Button'
import { Typer } from '../../Typer'
import './Hero.css'

// import RFPCTA from './RFPCTA'

const gameNames = [
  'board games',
  'card games',
  'puzzle hunts',
  'LARPS',
  'video games',
  'escape rooms',
  'RPGs',
  'calvinball',
]

export const Hero: React.FC = () => {
  useEffect(() => {
    // Only run animation on non-mobile devices
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (!isMobile) {
      const r = document.querySelector(':root') as HTMLElement

      let dt = 0
      let prevtime = 0
      let outrun = 0

      function doAnimationStep(timeStamp: DOMHighResTimeStamp) {
        dt = (timeStamp - prevtime) / 1000
        prevtime = timeStamp
        outrun = (outrun + dt) % 1

        r.style.setProperty('--outrun', `${outrun}`)
        requestAnimationFrame(doAnimationStep)
      }

      const animationId = requestAnimationFrame(doAnimationStep)

      // Cleanup function
      return () => {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <section
      className="flex h-[80vh] flex-col items-center justify-center px-0 pb-2 md:px-12"
      id="hero"
    >
      <div className="flex max-w-prose flex-col items-center justify-center">
        <h1 className="glitch mb-10 w-full max-w-prose text-center text-4xl font-semibold tracking-wider md:text-6xl">
          METAGAME 2025 <br />
          <span className="outlines font-black uppercase">
            <Typer blinkerClass="text-white" texts={gameNames} />
          </span>
        </h1>
        <p className="mb-8 max-w-prose text-center text-lg font-black md:text-xl">
          <span
            className="text-amber-300"
            data-glitchies='{ "totalClones": 2 }'
          >
            A conference about game design, strategy, narrative, and play. Join
            us September 12-14 in Berkeley, California.
          </span>
        </p>
        <Button background="bg-cyan-500" link="#tickets">
          GET YOUR TICKET
        </Button>
        {/* <RFPCTA /> */}
      </div>
    </section>
  )
}
