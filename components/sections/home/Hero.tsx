'use client'

import React from 'react'

import { Typer } from '../../Typer'
import './Hero.css'

import { URLS } from '@/utils/urls'

import PlayWord from '@/components/PlayWord'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
  return (
    <section
      className="flex min-h-[80vh] flex-col items-center justify-center px-0 pb-2 md:px-12"
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
            A conference about game design, strategy, narrative, and{' '}
            <PlayWord sound="/Tetris.mp3" differentColor="#ffe17fff">
              play
            </PlayWord>
            . Took place September 12-14, 2025 in Berkeley, California.
          </span>
        </p>
      </div>

      <div className="bg-opacity-50 mt-14 flex flex-col items-center rounded-lg bg-black p-12">
        <div
          className="w-full animate-pulse text-center font-mono text-6xl font-extrabold text-red-500 uppercase drop-shadow-md md:text-7xl"
          style={{
            textShadow: '0 0 8px #fff, 0 0 48px #ff003c, 0 0 96px #ff003c',
            letterSpacing: '0.06em',
          }}
        >
          GAME OVER
        </div>
        <div className="mb-6 max-w-prose text-center text-lg text-white md:text-xl">
          Metagame 2025 has ended. Thanks for playing! <br />
        </div>
        <Tooltip>
          <TooltipTrigger>
            <a
              href={URLS.METAGAME_2026_INTEREST}
              rel="noopener noreferrer"
              target="_blank"
              className="animate-glitch inline-block rounded-lg bg-gray-950 px-8 py-3 font-mono text-lg font-bold text-green-300 shadow-lg ring-2 ring-green-400 transition-all hover:bg-green-600 hover:text-white focus:ring-4 focus:ring-green-300 focus:outline-none"
            >
              <div className="flex flex-col items-center">
                <span>Play again?</span>
              </div>
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Metagame 2026 interest/updates form</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </section>
  )
}
