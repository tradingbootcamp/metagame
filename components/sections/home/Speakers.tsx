'use client'

import React, { useEffect, useState } from 'react'

import { MetagamePopup } from '../../MetagamePopup'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { getSpeakersFromProfiles } from '@/app/actions/db/profiles/queries'
import PlayerCard from '@/app/profile/PlayerCard'

export default function Speakers() {
  const [showMetagamePopup, setShowMetagamePopup] = useState(false)
  const { data: speakers, isLoading: speakersLoading } = useQuery({
    queryKey: ['speakers'],
    queryFn: getSpeakersFromProfiles,
  })

  useEffect(() => {
    // Check for metagame URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const isMetagame = urlParams.get('metagame') === 'true'

    if (isMetagame) {
      // Scroll to speakers section
      const speakersSection = document.getElementById('speakers')
      if (speakersSection) {
        speakersSection.scrollIntoView({ behavior: 'smooth' })
      }

      // Show popup after a short delay to allow scroll to complete
      setTimeout(() => {
        setShowMetagamePopup(true)
      }, 1000)

      // Remove the metagame parameter from URL without reloading
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('metagame')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [])

  const closeMetagamePopup = () => {
    setShowMetagamePopup(false)
  }

  return (
    <>
      <section className="mb-[40px] pt-10 text-center" id="speakers">
        <div className="relative container mx-auto">
          <h2 className="mb-8 text-center text-3xl font-bold">Speakers</h2>

          <div className="max-w-8xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
            {speakersLoading || !speakers ? (
              <div>Loading Speakers...</div>
            ) : (
              speakers?.map((speaker) => (
                <div key={speaker.id} className="relative">
                  <Link
                    className="absolute inset-0 z-0"
                    href={`/profile/${speaker.player_id}`}
                  />
                  <div className="pointer-events-none relative">
                    <PlayerCard
                      userId={speaker.id}
                      asProfile
                      tiltFactor={1}
                      gleamFollowsTilt
                      width={150}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <MetagamePopup isOpen={showMetagamePopup} onClose={closeMetagamePopup} />
    </>
  )
}
