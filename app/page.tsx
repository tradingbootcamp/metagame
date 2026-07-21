import { Suspense } from 'react'

import HomePageWrapper from '@/components/HomePageWrapper'
import PacmanAnimation from '@/components/PacmanAnimation'
import SetAnimation from '@/components/Set/SetAnimation'
import Sponsors from '@/components/Sponsors'
import Calendar from '@/components/sections/home/Calendar'
import { ContactUs } from '@/components/sections/home/ContactUs'
import { Hero } from '@/components/sections/home/Hero'
import Highlights from '@/components/sections/home/Highlights'
import ScheduleSection from '@/components/sections/home/ScheduleSection'
import Speakers, { SpeakersLoading } from '@/components/sections/home/speakers'

// import Tickets from '@/components/tickets/Tickets'

export default function Home() {
  return (
    <HomePageWrapper>
      {/* outrun-bg-animated opts this page into the animated backdrop (globals.css) */}
      <main className="outrun-bg-animated">
        <div className="container mx-auto flex flex-col gap-4 px-4">
          <Hero />
          <Calendar />
          <Highlights />
          <ScheduleSection />
          <Suspense fallback={<SpeakersLoading />}>
            <Speakers />
          </Suspense>
          <Sponsors />
          <div id="set-animation">
            <SetAnimation />
          </div>
          {/* <Tickets /> */}
        </div>
        <PacmanAnimation />
        <div className="container mx-auto px-4">
          <ContactUs />
        </div>
      </main>
    </HomePageWrapper>
  )
}
