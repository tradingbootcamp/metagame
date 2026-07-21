import { MoonIcon } from 'lucide-react'
import Link from 'next/link'

import AddToCalendar from '@/components/AddToCalendar'
import { Separator } from '@/components/ui/separator'

import { getSessionById } from '@/app/actions/db/sessions'

const nightMarketSessionId = 'e0dfc2cf-b2b0-46c4-8a27-dc14d551be17'

export default async function Highlights() {
  const nightMarketSession = await getSessionById({
    sessionId: nightMarketSessionId,
  })
  return (
    <section className="flex flex-col rounded-xl border border-border-accent p-4">
      <div className="mb-4 self-center text-2xl font-bold text-secondary-200">
        Highlight Events
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 self-start">
          <span className="text-xl font-bold">
            The Metagame <span className="text-orange-500">M</span>
            <span className="text-purple-500">e</span>
            <span className="text-orange-500">g</span>
            <span className="text-purple-500">a</span>
            <span className="text-orange-500">g</span>
            <span className="text-purple-500">a</span>
            <span className="text-orange-500">m</span>
            <span className="text-purple-500">e</span>
          </span>
          <p>
            Every attendee will be assigned to a team, and the teams will
            compete across the entire weekend. Win games for your team!
            Strategize together in your secret headquarters! Become the greatest
            team at Metagame! Events that relate to the Megagame are striped on
            the{' '}
            <Link className="link" href="/schedule">
              schedule
            </Link>
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-4 self-end">
          <div className="flex flex-col">
            <span className="flex items-center gap-2 text-xl font-bold">
              The Night Market <MoonIcon />
            </span>
            <div className="flex gap-4">
              <span className="text-lg">7-10 PM Friday night</span>
              {nightMarketSession && (
                <AddToCalendar session={nightMarketSession} />
              )}
            </div>
          </div>
          <p>
            <span className="text-lg">Open to the public!</span>
            <br />
            The Night Market will be an opportunity to exchange goods and
            services with fellow game aficionados.{' '}
            <strong>
              Anyone with or without a ticket to the main event is welcome
            </strong>
            ! Come and find booths based around:
          </p>
          <ul className="grid grid-cols-1 justify-center gap-4 sm:grid-cols-3">
            <li className="flex flex-col items-center">
              <strong className="sm:text-center">Games and Puzzles</strong>
              <Separator />
              <span>
                Indie TTRPG / jigsaw puzzle / 5-dimensional rubik&apos;s cube /
                escape room in a box! For sale! Right here!
              </span>
            </li>
            <li className="flex flex-col items-center">
              <strong className="sm:text-center">Other Physical Stuff</strong>
              <Separator />
              <span>
                Arts, crafts, foods, books, take-home items that don&apos;t fit
                in the &quot;games and puzzles&quot; category
              </span>
            </li>
            <li className="flex flex-col items-center">
              <strong className="sm:text-center">Experiences</strong>
              <Separator />
              <span>
                Try on a weird VR immersive bodysuit, get your fortune told,
                have a phenomenological time
              </span>
            </li>
            <li className="flex flex-col items-center">
              <strong className="sm:text-center">Job Market</strong>
              <Separator />
              <span>
                People looking to hire, get hired, or otherwise promote their
                company or self. Open for people on either side of the job
                market!
              </span>
            </li>
            <li className="flex flex-col items-center">
              <strong className="sm:text-center">Black Market</strong>
              <Separator />
              <span>
                Rights to middle names, tickets to cheat in your next RPG, etc.
                Black market goods must still be legal!
              </span>
            </li>
            <li className="flex flex-col items-center">
              <strong className="sm:text-center">Information Booth</strong>
              <Separator />
              <span>Like a poster session, without the standards</span>
            </li>
            <li className="flex flex-col items-center">
              <strong className="sm:text-center">Other</strong>
              <Separator />
              <span>
                Booths too weird to fit into any of the categories above!
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
